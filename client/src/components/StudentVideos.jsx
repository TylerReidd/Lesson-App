// src/components/StudentVideos.jsx
import React, { useState, useEffect } from "react";
import axios from "../axios.js";
import StudentVideosTabs from "./StudentVideosTabs.jsx";

export default function StudentVideos() {
  const [videos, setVideos] = useState([]);
  const [err, setErr]     = useState("");

  useEffect(() => {
    axios
      .get("/resources/videos/private", { withCredentials: true })
      .then(res => {
        setVideos(Array.isArray(res.data.videos) ? res.data.videos : []);
      })
      .catch(e => {
        console.error("Failed to load videos", e);
        setErr("Failed to load videos");
      });
  }, []);

  if (err) return <p style={{ color: "red" }}>{err}</p>;

  return (
    <div className="container video-page">
      <h1>My Videos</h1>
      <StudentVideosTabs videos={videos} />
    </div>
  );
}
