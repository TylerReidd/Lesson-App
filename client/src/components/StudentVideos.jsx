// src/components/StudentVideos.jsx
import React, { useState, useEffect } from "react";
import axios from "../axios.js";
import StudentVideosTabs from "./StudentVideosTabs.jsx";

export default function StudentVideos() {
  const [videos, setVideos] = useState([]);
  const [err, setErr]     = useState("");

  const fetchVideos = () => {
    axios
      .get("/resources/videos/private", { withCredentials: true })
      .then(res => {
        // setVideos(Array.isArray(res.data.videos) ? res.data.videos : []);
        const raw = Array.isArray(res.data.videos) ? res.data.videos : []
        setVideos(raw.map(v => ({
          id: v._id || v.id,
          url: v.url,
          filename: v.filename,
          uploadedAt: v.uploadedAt
        })))
        setErr("")
      })
      .catch(e => {
        console.error("Failed to load videos", e);
        setErr("Failed to load videos");
      });
  };

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to do that?")) return;
    try {
      await axios.delete(`/resources/videos/${id}`, {withCredentials: true})
      fetchVideos()
    } catch (e){
      console.error("Failed to delete video", e)
      setErr("Failed to delete video")
    }
  }

  if (err) return <p style={{ color: "red" }}>{err}</p>;

  return (
    <div className="container video-page">
      <h1>My Videos</h1>
      {videos?.length ? (
        <StudentVideosTabs videos={videos} onDelete={handleDelete} />

      ): 
        <p>No videos yet.</p>
      }
    </div>
  );
}
