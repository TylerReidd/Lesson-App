import React, { useState, useEffect, useContext } from "react";
import axios from "../axios.js";
import { AuthContext } from "../AuthContext";
import LinkTeacherForm from "../components/LinkTeacherForm.jsx";
import PracticeForm from "../components/PracticeForm.jsx";
import StudentSchedulePanel from "../components/StudentSchedulePanel.jsx";

export default function StudentDashboard({ onLogout }) {
  const { user, setUser, loading } = useContext(AuthContext);

  const [videos, setVideos] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [err, setErr] = useState("");

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <span className="hero-eyebrow">Student dashboard</span>
        <h1 className="hero-title">Track your work and keep your teacher in the loop.</h1>
        <p className="hero-subtitle">
          Log your daily practice, stay connected to your teacher, and keep your lessons organized in one place.
        </p>
      </header>

      <StudentSchedulePanel />

      <div className="kpis">
        <div className="dashboard-stat">
          <div className="label">Private videos</div>
          <div className="value">{videos.length}</div>
          <div className="helper">Uploaded practice videos available to review.</div>
        </div>
        <div className="dashboard-stat">
          <div className="label">Assignments</div>
          <div className="value">{assignments.length}</div>
          <div className="helper">Resources and documents shared with you.</div>
        </div>
        <div className="dashboard-stat">
          <div className="label">Teacher status</div>
          <div className="value">{user?.assignedTeacher ? "Linked" : "Open"}</div>
          <div className="helper">
            {user?.assignedTeacher ? "Your teacher connection is active." : "Link your teacher to unlock shared resources."}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel student-link-card">
          <div className="panel-h">Teacher connection</div>
          <div className="panel-b">
            {user?.role === 'student' && (
              user.assignedTeacher ? (
                <div className="stack-sm">
                  <p className="muted">Your account is already connected to a teacher.</p>
                </div>
              ) : (
                <LinkTeacherForm onLinked={async () => {
                  const {data} = await axios.get('/auth/me/full');
                  setUser(data?.user ?? null)
                }} />
              )
            )}
          </div>
        </section>

        <section className="panel practice-card">
          <PracticeForm />
        </section>
      </div>

      {err && <p className="form-note error">{err}</p>}
    </div>
  );
}
