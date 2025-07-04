import React, { useState } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";


export default function StudentDashboard() {
  const navigate = useNavigate()
  const [email, setEmail]   = useState("");
  const [videos, setVideos] = useState([]);
  const [err, setErr]       = useState("");

  const fetchVideos = async () => {
    if (!email) return setErr("Enter your email");
    try {
      const userRes = await axios.get("/auth/user", { params: { email } });
      const userId  = userRes.data._id;
      const res     = await axios.get("/resources/videos", {
        params: { userId }
      });
      setVideos(res.data);
      setErr("");
    } catch (e) {
      console.error("Fetch Videos Error:", e);
      setErr(e.response?.data?.error || "Failed to load videos");
    }
  };


  const handleLogout = async () => {
    try {
      await axios.post(
        '/auth/logout', 
        {}, 
        {withCredentials: true}
        )
      navigate('/login', {replace: true})
    } catch (err) {
      console.error("Logout Failed", err)
    }
  }

  return (
    <>
      <h1>Student Video Dashboard</h1>
      {err && <p style={{ color: "red" }}>{err}</p>}

      <form onSubmit={e => { e.preventDefault(); fetchVideos(); }} className="spaced">
        <div className="form-group">
          <label>Your school email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="button">
          Load My Videos
        </button>
      </form>

      <ul className="video-list spaced">
        {videos.map(v => (
          <li key={v.id}>
            <p className="video-title">{v.name}</p>
            <video controls width="100%" src={v.url} />
          </li>
        ))}
      </ul>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}
