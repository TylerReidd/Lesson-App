import React, { useState, useEffect, useContext } from "react";
import { uploadAxios } from "../axios.js";
import { AuthContext } from "../AuthContext";

export default function StudentVideoUploadForm({ onUploadSuccess, teacherId: teacherIdProp }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [teacherId, setTeacherId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const { user } = useContext(AuthContext);

  // 🧠 Resolve the student's assigned teacher (prop > context > fetch)
  useEffect(() => {
    const resolved =
      teacherIdProp ||
      user?.assignedTeacher?._id ||
      user?.assignedTeacher ||
      user?.assignedTeacherId ||
      null;

    if (resolved) {
      setTeacherId(resolved);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await uploadAxios.get("/auth/me", { withCredentials: true });
        const current = res.data.user || res.data;
        setTeacherId(
          current.assignedTeacher?._id ||
            current.assignedTeacher ||
            current.teacherId ||
            null
        );
      } catch {
        setTeacherId(null);
      }
    };

    fetchUser();
  }, [teacherIdProp, user]);

  const handleFilePicked = (nextFile) => {
    if (!nextFile) return;
    setFile(nextFile);
    setErr("");
    setMsg("");
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
    <div className="panel video-upload-panel">
      <div className="panel-h">Upload Practice Video</div>
      <div className="panel-b">
        {err && <p className="form-note error">{err}</p>}
        {msg && <p className="form-note success">{msg}</p>}
        <form onSubmit={handleSubmit} className="video-upload-form">
          <div
            className={`video-dropzone ${dragActive ? "active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label className="video-dropzone-label">
              <span className="label-lg">Select Video</span>
              <span className="video-dropzone-copy">
                Drag and drop a practice clip here, or click to browse.
              </span>
              <input
                className="video-file-input"
                type="file"
                accept="video/*"
                onChange={(e) => handleFilePicked(e.target.files?.[0])}
              />
            </label>
            <div className="video-dropzone-meta">
              {file ? <span className="video-file-name">{file.name}</span> : <span className="muted">No video selected yet.</span>}
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
    </div>
  );
}
