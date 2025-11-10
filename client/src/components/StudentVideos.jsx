import React, { useState, useEffect } from "react";
import axios from "../axios.js";
import StudentVideosTabs from "./StudentVideosTabs.jsx";
import StudentVideoUploadForm from "./StudentVideoUploadForm.jsx";

export default function StudentVideos() {
  const [videos, setVideos] = useState([]);
  const [err, setErr] = useState("");
  const [user, setUser] = useState(null);

  const fetchVideos = async () => {
    try {
      const res = await axios.get("/resources/videos/private", { withCredentials: true });
      const data = res.data;
      const list = Array.isArray(data.videos) ? data.videos : data.items || [];
      setVideos(
        list.map((v) => ({
          id: v._id || v.id,
          url: v.url || v.path,
          filename: v.filename,
          uploadedAt: v.uploadedAt || v.createdAt,
          owner: v.owner,
          recipient: v.recipient,
        }))
      );
      setErr("");
    } catch (e) {
      console.error("Failed to load videos", e);
      setErr("Failed to load videos");
    }
  };

  useEffect(() => {
    fetchVideos();

    axios
      .get("/auth/me", { withCredentials: true })
      .then(({ data }) => {
        const id = data.id ?? data._id ?? data.user?.id ?? data.user?._id;
        const role = data.role ?? data.user?.role;
        const teacher = data.teacher ?? data.user?.teacher
        setUser(id ? { id, role, teacher } : null);
      })
      .catch(() => setUser(null));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await axios.delete(`/resources/videos/${id}`, { withCredentials: true });
      fetchVideos();
    } catch (e) {
      console.error("Failed to delete video", e);
      setErr("Failed to delete video");
    }
  };

  if (err) return <p style={{ color: "red" }}>{err}</p>;

  return (
    <div className="panel">
      <h1>My Practice Videos</h1>
      <StudentVideoUploadForm onUploadSuccess={fetchVideos} />
      <h2 className="mt-4">Uploaded Videos</h2>
      {videos?.length ? (
        <StudentVideosTabs videos={videos} onDelete={handleDelete} currentUser={user} />
      ) : (
        <p>No videos yet.</p>
      )}
    </div>
  );
}
