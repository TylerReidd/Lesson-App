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
        console.log("[/auth/me] body:", data);
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
  

  const handleDelete = async (id) => {
    const safeId = id || (typeof id === 'object' ? id?.id || id?._id : null)
    console.log("[DELETE click] got id=", id, "safeId=", safeId);
    if(!safeId) {console.warn("Delete clicked with no Id", id); return }
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const resp = await axios.delete(`/resources/videos/${safeId}`, { withCredentials: true });
      console.log("[DELETE resp]", resp.status, resp.data)
      fetchVideos();
    } catch (err) {
      console.error("Failed to delete video", err);
      setVideoErr("Could not delete video");
    }
  };

  return (
    <div>
      {/* <Sidebar role='teacher' /> */}
      <div className="panel">
        <h1>Manage Videos</h1>

        {/* Upload Section */}
        <div className="dashboard-section panel">
          {videoErr && <p style={{ color: "red" }}>{videoErr}</p>}
          {videoMsg && <p style={{ color: "green" }}>{videoMsg}</p>}

          <form onSubmit={handleVideoUpload} className="form-grid form-centered">
            <div className="field">
              <label className="label-lg">Student Email</label>
              <input
                className="input-lg"
                type="email"
                value={videoEmail}
                onChange={(e) => setVideoEmail(e.target.value)}
                disabled={!!effectiveStudentId}
              />
            </div>
            <div className='field'>
              <label className="label-lg" style={{marginLeft:"100px"}}>Select Video: </label>
              <input
                className="input-lg"
                
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
            </div>

            {/* Progress bar */}
            {uploadProgress > 0 && (
              <div style={{ margin: "8px 0" }}>
                <div className="progress"
                  style={{
                   gridColumn: '1/-1'
                  }}
                >
                  <div
                    className="bar"
                    style={{
                     width: `${uploadProgress}%` 
                    }}
                  />
                </div>
                <small>{uploadProgress}%</small>
              </div>
            )}
            <div className="actons">
              <button type="submit" className="button button-lg">
                Upload Video
              </button>
            </div>
          </form>
        </div>

        <div className="container video-page">
          <h2>Uploaded Videos</h2>
          <StudentVideosTabs videos={videos} onDelete={handleDelete} currentUser={user} />
        </div>
      </div>
    </div>
  );
}
