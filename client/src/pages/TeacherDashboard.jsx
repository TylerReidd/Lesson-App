import React, { useState } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard({onLogout}) {
  const navigate = useNavigate()
  const [videoFile, setVideoFile]   = useState(null);
  const [videoEmail, setVideoEmail] = useState("");
  const [videoErr, setVideoErr]     = useState("");
  const [videoMsg, setVideoMsg]     = useState("");

  const handleVideoUpload = async e => {
    e.preventDefault();
    if (!videoFile) return setVideoErr("Select a video");

    const formData = new FormData();
    formData.append("file", videoFile);
    if (videoEmail) formData.append("recipientEmail", videoEmail);

    try {
      const res = await axios.post(
        "/resources/videos/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setVideoMsg(res.data.message);
      setVideoErr("");
      setVideoFile(null);
      setVideoEmail("");
    } catch (err) {
      console.error("upload error →", err.response?.data || err);
      setVideoErr(err.response?.data?.error || "Video upload failed");
    }
  };


  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout')
      onLogout()
      navigate('/login', {replace: true})
    } catch (err){
      console.error("Logout Failed", err)
    }
  }

  return (
    <div className="spaced">
      <h1>Teacher Dashboard</h1>
      {videoErr && <p style={{ color: "red" }}>{videoErr}</p>}
      {videoMsg && <p style={{ color: "green" }}>{videoMsg}</p>}

      <form onSubmit={handleVideoUpload} className="spaced">
        <div className="form-group">
          <label>Student Email (optional)</label>
          <input
            type="email"
            value={videoEmail}
            onChange={e => setVideoEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Select Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={e => setVideoFile(e.target.files[0])}
          />
        </div>
        <button type="submit" className="button">
          Upload Video
        </button>
      </form>
      <button onClick={handleLogout} className='px-3 py-1'>Logout</button>

    </div>
  );
}
