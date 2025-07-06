import React, { useState, useEffect, useContext } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";



export default function StudentDashboard({onLogout}) {
  const navigate = useNavigate()
  const {setUser} = useContext(AuthContext)
  const [email, setEmail]   = useState("");
  const [videos, setVideos] = useState([]);
  const [err, setErr]       = useState("");

  const [assignments, setAssignments] = useState([])


  const fetchVideos = async () => {
    try {
      const res     = await axios.get("/resources/videos/private", {
        withCredentials: true
      });
      setVideos(res.data.videos);
      const {data: pdfs} = await axios.get('/resources/assignments', {withCredentials: true})
      setAssignments(pdfs)
      setErr("");
    } catch (e) {
      console.error("Fetch Videos Error:", e);
      setErr(e.response?.data?.error || "Failed to load videos");
    }
  };


  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout', {}, {withCredentials: true})
      onLogout()
      navigate('/login')
    } catch(err){
      console.error('logout failed', err)
    }
  }

  useEffect(() => {
    const loadPdfs = async () => {
      try {
        const {data} = await axios.get(
          "/resources/assignments/",
          {withCredentials: true}
        )
        setAssignments(data)
        setErr("")
      } catch(e) {
        setErr("Failed to load assignments")
        console.error(e)
      }
    }
    loadPdfs()
  }, [])

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
            <p className="video-title">{v.originalName}</p>
            <video controls width="100%" src={v.url} />
          </li>
        ))}
      </ul>

      <h3>Your PDF Assignments</h3>
      <ul>
        {assignments.map(f => (
          <li key={f.id}>
            <a 
              href={f.url}
              target='_blank'
              rel="noopener noreferrer">
                {f.originalName || f.filename}
              </a>
              <span className="text-sm text-gray-500 ml-2">
                {new Date(f.uploadedAt).toLocaleDateString()}
              </span>
          </li>
        ))}
      </ul>

      <button className="btn" onClick={handleLogout}>Logout</button>
    </>
  );
}
