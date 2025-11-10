import React, { useState, useEffect } from "react";
import { uploadAxios } from "../axios.js";

export default function StudentVideoUploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [teacherId, setTeacherId] = useState(null);

  // 🧠 Auto-fetch the student's assigned teacher
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await uploadAxios.get("/auth/me", { withCredentials: true });
        const user = res.data.user || res.data;
        setTeacherId(
          user.assignedTeacher?._id ||
          user.assignedTeacher ||
          user.teacherId ||
          null
        );
        console.log("resolved teacherId: ",
        user.assignedTeacher?._id,
        user.assignedTeacher,
        user.teacherId)
      } catch {
        setTeacherId(null);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setErr("Please select a video.");
    if (!teacherId) return setErr("No linked teacher found.");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("teacherId", teacherId); // automatically attach teacher

      setUploadProgress(0);
      setErr("");
      setMsg("");

      const res = await uploadAxios.post("/resources/upload", formData, {
        withCredentials: true,
        onUploadProgress: (evt) => {
          if (evt.total) {
            setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      });

      setMsg(res.data.message || "Upload successful!");
      setFile(null);
      setUploadProgress(0);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Upload failed:", error);
      setErr("Upload failed. Please try again.");
      setUploadProgress(0);
    }
  };

  return (
    <div className="panel">
      <div className="panel-h">Upload Practice Video</div>
      <div className="panel-b">
        {err && <p style={{ color: "red" }}>{err}</p>}
        {msg && <p style={{ color: "green" }}>{msg}</p>}
        <form onSubmit={handleSubmit} className="form-grid form-centered">
          <div className="field">
            <label className="label-lg">Select Video:</label>
            <input
              className="input-lg"
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          {uploadProgress > 0 && (
            <div className="progress">
              <div className="bar" style={{ width: `${uploadProgress}%` }} />
              <small>{uploadProgress}%</small>
            </div>
          )}
          <div className="actions">
            <button type="submit" className="button button-lg">
              Upload Video
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
