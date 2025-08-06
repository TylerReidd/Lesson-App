import React, { useState, useEffect, useContext } from "react";
import axios from "../axios.js";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import LinkTeacherForm from "../components/LinkTeacherForm.jsx";
import StudentQuestions from "../components/StudentQuestions.jsx";
import StudentVideosTabs from "../components/StudentVideosTabs.jsx";

export default function StudentDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { user, setUser, loading } = useContext(AuthContext);

  const [videos, setVideos] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [err, setErr] = useState("");
  const [reload, setReload] = useState(0);

  const onQuestionSent = () => setReload((r) => r + 1);

  // Fetch only videos here
  const fetchVideos = async () => {
    try {
      const res = await axios.get("/resources/videos/private", {
        withCredentials: true
      });
      setVideos(Array.isArray(res.data.videos) ? res.data.videos : []);
      setErr("");
    } catch (e) {
      console.error("Fetch Videos Error:", e);
      setErr(e.response?.data?.error || "Failed to load videos");
    }
  };

  // Fetch only assignments here
  const loadAssignments = async () => {
    try {
      const res = await axios.get("/resources/assignments", {
        withCredentials: true
      });
      console.log("assignments", res.data.assignments);
      setAssignments(res.data.assignments);
      setErr("");
    } catch (e) {
      console.error("Failed to load assignments", e);
      setErr("Failed to load assignments");
    }
  };

  // Initial load
  useEffect(() => {
    fetchVideos();
    loadAssignments();
  }, []);

  // Re-fetch videos (and Q&A) when a question is sent
  useEffect(() => {
    fetchVideos();
  }, [reload]);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      onLogout();
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("logout failed", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container student-layout-container">
      <div className="card">
        <h1>Student Dashboard</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchVideos();
          }}
        >
          <div className="form-group">
            <button type="submit" className="button">
              Load My Videos
            </button>
          </div>
        </form>

        {err && <p style={{ color: "red" }}>{err}</p>}

        <div className="dashboard-grid">
          {/* Videos Panel */}
          <section className="dashboard-panel">
            <h2>My Videos</h2>
            <StudentVideosTabs videos={videos} />
          </section>

          {/* Assignments Panel */}
          <section className="dashboard-panel">
            <h2>Your PDF Assignments</h2>
            <ul>
              {Array.isArray(assignments) && assignments.length > 0 ? (
                assignments.map((f) => (
                <li key={f.id}>
                  <a href={f.url} target="_blank" rel="noopener">
                    {f.filename}
                  </a>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(f.uploadedAt).toLocaleDateString()}
                  </span>
                </li>
            ))
            ) : (
              <li>No Assignments Available</li>
            )}
            </ul>
          </section>

          {/* Q&A or Link-Teacher Panel */}
          <section className="dashboard-panel">
            {!user.assignedTeacher ? (
              <>
                <h2>Link Your Teacher</h2>
                <LinkTeacherForm />
              </>
            ) : (
              <>
                <h2>My Questions & Answers</h2>
              <StudentQuestions />
              </>
            )}
          </section>
        </div>

        <button className="button-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
