import React, { useState } from "react";
import TeacherStudentsPanel from "../components/TeacherStudentsPanel";
import TeacherLinkStudentForm from "../components/TeacherLinkStudentForm.jsx";
import TeacherSchedulePanel from "../components/TeacherSchedulePanel.jsx";

export default function TeacherDashboard({ onLogout }) {
const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <span className="hero-eyebrow">Teacher dashboard</span>
        <h1 className="hero-title">Guide your students with less friction.</h1>
        <p className="hero-subtitle">
          Manage student connections, review activity, and keep the studio organized from one workspace.
        </p>
      </header>

      <main className="dashboard-stack">
        <TeacherSchedulePanel />
        <div className="dashboard-split">
          <section className="panel student-list-card" id="students-section">
            <div className="panel-h">Your students</div>
            <div className="panel-b">
              <TeacherStudentsPanel refreshKey={refreshKey} />
            </div>
          </section>
          <TeacherLinkStudentForm onLinked={() => setRefreshKey((k) => k + 1)} />
        </div>
      </main>
  </div>
  );
}
