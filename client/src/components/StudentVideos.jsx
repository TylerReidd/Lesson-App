import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "../axios.js";
import StudentVideosTabs from "./StudentVideosTabs.jsx";
import StudentVideoUploadForm from "./StudentVideoUploadForm.jsx";
import LinkTeacherForm from "./LinkTeacherForm.jsx";
import { AuthContext } from "../AuthContext";

export default function StudentVideos() {
  const [videos, setVideos] = useState([]);
  const [err, setErr] = useState("");
  const { user, setUser } = useContext(AuthContext);

  const fetchVideos = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

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

  const assignedTeacherId =
    user?.assignedTeacher?._id ||
    user?.assignedTeacher ||
    user?.assignedTeacherId ||
    null;
  const needsLink = user?.role === "student" && !assignedTeacherId;

  return (
    <div className="panel">
      <h1>My Practice Videos</h1>
      {needsLink && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-h">Link Your Teacher</div>
          <div className="panel-b">
            <p style={{ marginTop: 0 }}>
              Link a teacher to unlock video uploads and personalized feedback.
            </p>
            <LinkTeacherForm
              onLinked={async () => {
                const { data } = await axios.get("/auth/me/full", { withCredentials: true });
                setUser(data?.user ?? null);
              }}
            />
          </div>
        </div>
      )}
      {err && <p style={{ color: "red" }}>{err}</p>}
      <StudentVideoUploadForm onUploadSuccess={fetchVideos} teacherId={assignedTeacherId} />
      <h2 className="mt-4">Uploaded Videos</h2>
      {videos?.length ? (
        <StudentVideosTabs videos={videos} onDelete={handleDelete} currentUser={user} />
      ) : (
        <p>No videos yet.</p>
      )}
    </div>
  );
}
