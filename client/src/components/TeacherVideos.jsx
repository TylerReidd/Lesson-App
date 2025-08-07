import React, { useState, useEffect } from "react";
import axios from "../axios.js";

export default function TeacherVideos() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoEmail, setVideoEmail] = useState("");
  const [videoErr, setVideoErr] = useState("");
  const [videoMsg, setVideoMsg] = useState("");
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    try {
      const res = await axios.get("/resources/videos", {withCredentials:true});
      setVideos(res.data);
    } catch (err) {
      console.error("Failed to load videos", err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !videoEmail) return setVideoErr("All fields required");

    try {
      const { data: student } = await axios.get(
        '/auth/user',
        {params: {email: videoEmail}, withCredentials:true}
      )
      // const studentId = userRes.data._id;

      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("recipient", student._id);

      const res = await axios.post("/resources/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVideoMsg(res.data.message);
      setVideoErr("");
      setVideoFile(null);
      setVideoEmail("");
      fetchVideos();
    } catch (err) {
      console.error("Upload error →", err.response?.data || err);
      setVideoErr(err.response?.data?.error || "Video upload failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`/resources/videos/${id}`);
      fetchVideos();
    } catch (err) {
      console.error("Failed to delete video", err);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Manage Videos</h1>

        {/* Upload Section */}
        <div className="dashboard-section">
          {videoErr && <p style={{ color: "red" }}>{videoErr}</p>}
          {videoMsg && <p style={{ color: "green" }}>{videoMsg}</p>}

          <form onSubmit={handleVideoUpload}>
            <div className="form-group">
              <label>Student Email</label>
              <input
                type="email"
                value={videoEmail}
                onChange={(e) => setVideoEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Select Video</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
            </div>
            <button type="submit" className="button">
              Upload Video
            </button>
          </form>
        </div>

        {/* Video Grid */}
        <div className="dashboard-section">
          <h2>Uploaded Videos</h2>
          <ul className="video-list">
            {Array.isArray(videos) && videos.length > 0 ? (

              videos.map((video) => (
              <li key={video._id}>
                <span className="video-title">{video.filename}</span>
                <div>
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="button-logout"
                    style={{ padding: "4px 8px", marginLeft: "8px" }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            )) 
            ) : (
              <li>No videos Uploaded</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}