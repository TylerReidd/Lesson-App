import React, {useEffect, useState } from "react";
import TeacherStudentsPanel from "../components/TeacherStudentsPanel";
import TeacherLinkStudentForm from "../components/TeacherLinkStudentForm.jsx";
import axios from "../axios.js"


export default function TeacherDashboard({ onLogout }) {
const [pendingCount, setPendingCount] = useState(0);
const [refreshKey, setRefreshKey] = useState(0);

useEffect(() => {
  const fetchPending = async () => {
    try {
      const { data } = await axios.get("/questions/teacher/pending", {
        withCredentials: true,
      })
      setPendingCount(data.pending || 0)
    } catch (err) {
      console.error("Failed to fetch pending questions", err)
    }
  }

  fetchPending();
  const interval = setInterval(fetchPending, 300000);
  return () => clearInterval(interval)
}, [])

  return (
    <div>
      <header className="dashboard-header">
        <h1>My Students</h1>
      </header>
      <main>
        <div>
          <TeacherLinkStudentForm onLinked={() => setRefreshKey((k) => k + 1)} />
          <section className="panel">
            <div className="panel-h">My Students</div>
            <div className="">
              <TeacherStudentsPanel    
              refreshKey={refreshKey}
              />
            </div>
          </section>
        </div>
      </main>
  </div>
  );
}
