import React, { useState, useEffect } from "react";
import axios from "../axios.js";
import StudentVideosTabs from "./StudentVideosTabs.jsx";
import { useLocation } from 'react-router-dom';


export default function TeacherVideos({studentId, defaultRecipientEmail}) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoEmail, setVideoEmail] = useState("");
  const [videoErr, setVideoErr] = useState("");
  const [videoMsg, setVideoMsg] = useState("");
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null)
  const { search } = useLocation();
  const qsStudentId = new URLSearchParams(search).get('studentId');
  const effectiveStudentId = studentId ?? qsStudentId ?? null;
  
  // new state for upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const fetchVideos = async () => {
    const url = effectiveStudentId
    ? `/teacher/students/${effectiveStudentId}/videos`
    : `/resources/videos`
    const res = await axios.get(url);
    const list = Array.isArray(res.data?.videos) ? res.data.videos 
                                                 : Array.isArray(res.data?.items)
                                                 ? res.data.items 
                                                 : Array.isArray(res.data)
                                                 ? res.data 
                                                 : []

    setVideos(list.map(v => ({
      id: v.id || v._id,
      filename: v.filename,
      url: v.url ||v.path,
      uploadedAt: v.uploadedAt || v.createdAt,
      owner: v.owner,
      recipient: v.recipient
    })));
  };
  
  useEffect(() => {
    fetchVideos();
  
    axios.get("/auth/me", { withCredentials: true })
      .then(({ data }) => {
        const id   = data.id ?? data._id ?? data.user?.id ?? data.user?._id;
        const role = data.role ?? data.user?.role;
        setUser(id ? { id, role } : null);
      })
      .catch(() => setUser(null));
  }, [effectiveStudentId]);

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile) return setVideoErr("Select a video");
  
    if (!effectiveStudentId && !videoEmail) {
      return setVideoErr("Enter student email (or pick a student)");
    }
  
    try {
      let targetId = effectiveStudentId;
  
      // fallback: lookup by email only if no student selected
      if (!targetId) {
        const { data: student } = await axios.get("/auth/user", {
          params: { email: videoEmail }
        });
        targetId = student._id;
      }
  
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("recipient", targetId);
  
      setUploadProgress(0);
      setVideoErr("");
      setVideoMsg("");
  
      const res = await axios.post("/resources/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress(percent);
          }
        },
      });
  
      setVideoMsg(res.data.message || "Upload Complete");
      setVideoFile(null);
      if (!effectiveStudentId) setVideoEmail(""); // keep email if no selection
      setUploadProgress(0);
      fetchVideos();
    } catch (err) {
      console.error("Upload error →", err.response?.data || err);
      setVideoErr(err.response?.data?.error || "Video upload failed");
      setUploadProgress(0);
    }
  };

  const handleFilePicked = (nextFile) => {
    if (!nextFile) return;
    setVideoFile(nextFile);
    setVideoErr("");
    setVideoMsg("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFilePicked(e.dataTransfer?.files?.[0]);
  };

  const handleDelete = async (id) => {
    const safeId = id || (typeof id === 'object' ? id?.id || id?._id : null)
    if(!safeId) {console.warn("Delete clicked with no Id", id); return }
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`/resources/videos/${safeId}`, { withCredentials: true });
      fetchVideos();
    } catch (err) {
      console.error("Failed to delete video", err);
      setVideoErr("Could not delete video");
    }
  };

  return (
    <div className="video-page-shell">
      <div className="panel video-page-panel">
        <div className="video-page-header">
          <span className="hero-eyebrow">Student workspace</span>
          <h1 className="hero-title video-page-title">Student videos</h1>
          <p className="hero-subtitle video-page-subtitle">
            Upload lesson material, review recent practice clips, and keep everything easier to scan.
          </p>
        </div>

        <div className="dashboard-section panel video-upload-panel">
          {videoErr && <p className="form-note error">{videoErr}</p>}
          {videoMsg && <p className="form-note success">{videoMsg}</p>}

          <form onSubmit={handleVideoUpload} className="video-upload-form">
            <div
              className={`video-dropzone ${dragActive ? "active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label className="video-dropzone-label">
                <span className="label-lg">Select video</span>
                <span className="video-dropzone-copy">
                  Drag and drop a video here, or click to browse.
                </span>
                <input
                  className="video-file-input"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFilePicked(e.target.files?.[0])}
                />
              </label>
              <div className="video-dropzone-meta">
                {videoFile ? <span className="video-file-name">{videoFile.name}</span> : <span className="muted">No video selected yet.</span>}
              </div>
            </div>

            {uploadProgress > 0 && (
              <div className="video-upload-progress">
                <div className="progress">
                  <div className="bar" style={{ width: `${uploadProgress}%` }} />
                </div>
                <small>{uploadProgress}%</small>
              </div>
            )}
            <div className="video-upload-actions">
              <button type="submit" className="button button-lg">
                Upload Video
              </button>
            </div>
          </form>
        </div>

        <div className="video-library">
          <h2>Uploaded Videos</h2>
          <StudentVideosTabs videos={videos} onDelete={handleDelete} currentUser={user} />
        </div>
      </div>
    </div>
  );
}
