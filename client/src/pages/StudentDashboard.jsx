import React, { useState, useEffect, useContext } from "react";
import axios from "../axios.js";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import LinkTeacherForm from "../components/LinkTeacherForm.jsx";
import UnlinkTeacherButton from "../components/UnlinkTeacherButton.jsx";
import PracticeForm from "../components/PracticeForm.jsx";

export default function StudentDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { user, setUser, loading } = useContext(AuthContext);

  const [videos, setVideos] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [err, setErr] = useState("");
  const clearPanels = () => {
    setVideos([])
    setAssignments([])
  }
  const [reload, setReload] = useState(0);



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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="card">
        <h1>Student Dashboard</h1>
        <PracticeForm /> 

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            {user?.role === 'student' && (
              user.assignedTeacher ? ( 
                <UnlinkTeacherButton 
                  onUnlinked={() => {
                    clearPanels()
                    axios.get('/auth/me/full').then(({data}) => setUser(data?.user ?? null))
                  }}
                  />
              ) : (
                <LinkTeacherForm onUnlinked={async () => {
                  const {data} = await axios.get('/auth/me/full');
                  setUser(data?.user ?? null)
                }} 
                />
            )
            )}
          </section> 
        </div>
      </div>
    </div>
  );
}
