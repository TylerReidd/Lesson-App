import React, { useState, useEffect } from "react";
import axios from "../axios.js";
import StudentVideosTabs from "./StudentVideosTabs.jsx";

export default function TeacherVideos() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoEmail, setVideoEmail] = useState("");
  const [videoErr, setVideoErr] = useState("");
  const [videoMsg, setVideoMsg] = useState("");
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null)

  // new state for upload progress
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchVideos = async () => {
    const res = await axios.get("/resources/videos", { withCredentials: true });
    const list = Array.isArray(res.data) ? res.data : res.data?.videos || [];
    setVideos(list.map(v => ({
      id: v.id || v._id,
      filename: v.filename,
      url: v.url,
      uploadedAt: v.uploadedAt,
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
  }, []);

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !videoEmail) return setVideoErr("All fields required");

    try {
      const { data: student } = await axios.get(
        "/auth/user",
        { params: { email: videoEmail }, withCredentials: true }
      );

      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("recipient", student._id);

      setUploadProgress(0); // reset before starting
      setVideoErr("");
      setVideoMsg("");

      const res = await axios.post("/resources/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        onUploadProgress: (evt) => {
          if (evt.total) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress(percent);
          }
        },
      });

      setVideoMsg(res.data.message || "Upload Complete");
      setVideoFile(null);
      setVideoEmail("");
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
    <div className="content">
      <div className="dashboard-panel">
        <h1>Manage Videos</h1>

        {/* Upload Section */}
        <div className="dashboard-section">
          {videoErr && <p style={{ color: "red" }}>{videoErr}</p>}
          {videoMsg && <p style={{ color: "green" }}>{videoMsg}</p>}

          <form onSubmit={handleVideoUpload} className="form-centered">
            <div>
              <label>Student Email</label>
              <input
                type="email"
                value={videoEmail}
                onChange={(e) => setVideoEmail(e.target.value)}
              />
            </div>
            <div style={{marginLeft:'50px'}}>
              <label style={{marginLeft:"100px"}}>Select Video: </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
            </div>

            {/* Progress bar */}
            {uploadProgress > 0 && (
              <div style={{ margin: "8px 0" }}>
                <div
                  style={{
                    background: "#eee",
                    height: "10px",
                    borderRadius: "6px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "#4caf50",
                      width: `${uploadProgress}%`,
                      height: "100%",
                      transition: "width 0.2s",
                    }}
                  />
                </div>
                <small>{uploadProgress}%</small>
              </div>
            )}

            <button type="submit" className="button">
              Upload Video
            </button>
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
