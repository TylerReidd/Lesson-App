import { useRef, useState } from "react";
import axios from "../axios.js";

export default function useUpload() {
  const [progress, setProgress] = useState(0);         // 0..100
  const [eta, setEta] = useState(null);                // seconds
  const [speed, setSpeed] = useState(null);            // bytes/sec
  const [status, setStatus] = useState("idle");        // idle|uploading|done|error
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const startedAtRef = useRef(null);
  const lastLoadedRef = useRef(0);

  const upload = async ({ url, formData }) => {
    setProgress(0); setEta(null); setSpeed(null); setStatus("uploading"); setError(null);
    controllerRef.current = new AbortController();
    startedAtRef.current = Date.now();
    lastLoadedRef.current = 0;

    try {
      const res = await axios.post(url, formData, {
        signal: controllerRef.current.signal,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          // evt.loaded / evt.total in bytes (browser only)
          if (!evt.total) return;
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setProgress(pct);

          const now = Date.now();
          const elapsedSec = (now - startedAtRef.current) / 1000;
          const deltaBytes = evt.loaded - lastLoadedRef.current;
          const instSpeed = deltaBytes / Math.max((now - (startedAtRef.current + elapsedSec*1000 - 1000)) / 1000, 1); // small smoothing
          lastLoadedRef.current = evt.loaded;

          // Better: average speed
          const avgSpeed = evt.loaded / Math.max(elapsedSec, 0.001);
          setSpeed(avgSpeed); // bytes/sec

          const remaining = evt.total - evt.loaded;
          setEta(Math.max(Math.round(remaining / Math.max(avgSpeed, 1)), 0));
        },
      });

      setStatus("done");
      return res.data;
    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError") {
        setStatus("idle");
      } else {
        setStatus("error");
        setError(err?.response?.data?.message || err.message);
      }
      throw err;
    }
  };

  const cancel = () => {
    controllerRef.current?.abort();
  };

  return { upload, cancel, progress, eta, speed, status, error };
}
