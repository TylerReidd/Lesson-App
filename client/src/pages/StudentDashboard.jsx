import React, { useState, useEffect, useContext } from "react";
import axios from "../axios.js";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import LinkTeacherForm from "../components/LinkTeacherForm.jsx";
import StudentQuestionForm from "../components/StudentQuestionForm.jsx";
import StudentQuestionsList from "../components/StudentQuestionsList.jsx";



export default function StudentDashboard({onLogout}) {
  const navigate = useNavigate()
  const {user, setUser, loading} = useContext(AuthContext)
  const [videos, setVideos] = useState([]);
  const [err, setErr]       = useState("");
  const [reload, setReload] = useState(0)
  const [assignments, setAssignments] = useState([])

  // useEffect (() => {fetch()}, [reload])

  const onQuestionSent = () => setReload(r => r+1)


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
      setUser(null)
      navigate('/login')
    } catch(err){
      console.error('logout failed', err)
    }
  }

  // PDFs
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

  if (loading) return <div>Loading...</div>

  return (
    <>
      <div className="container">
        <div className="card">
          <h1>Student Dashboard</h1>
    
          <form onSubmit={e => { e.preventDefault(); fetchVideos(); }}>
          <div className="form-group">
      
            <button type="submit" className="button">
              Load My Videos
            </button>
            </div>
          </form>
      
      <div className="form-group">
        <ul>
          {videos.map(v => (
            <li key={v.id}>
              <p className="video-title">{v.filename}</p>
              <video controls width="100%" src={v.url} />
            </li>
          ))}
        </ul>

      </div>
      
      <div className="form-group">
      <h3>Your PDF Assignments</h3>
      <ul>
        {assignments.map(f => (
          <li key={f.id}>
            <a
              href={f.url}
              target='_blank'
              rel="noopener noreferrer"
              >
              {f.filename}
            </a>
            <span className="text-sm text-gray-500 ml-2">
              {new Date(f.uploadedAt).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
      </div>


      {!user.assignedTeacher ? (
            <LinkTeacherForm />
          ) : (
            <>
            <section className="form-group">
              <h2>Ask Your Teacher</h2>
              {console.log(user)}
              <StudentQuestionForm onSent={onQuestionSent} />
            </section>

            <section className="form-group">
              <h2>My Questions & Answers</h2>
              <StudentQuestionsList reload={reload} />
            </section>
            </>
          )}

          
          <button className="button-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </>
  );
}
