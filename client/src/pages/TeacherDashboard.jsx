// src/pages/TeacherDashboard.jsx
import React, { useState } from "react";
import TeacherStudentsPanel from "../components/TeacherStudentsPanel";
import TeacherVideos from "../components/TeacherVideos";
import TeacherAssignments from "../components/TeacherAssignment";
import TeacherQuestions from "../components/TeacherQuestions";

export default function TeacherDashboard({ onLogout }) {
  const [activeStudent, setActiveStudent] = useState(null); // {_id, name, email} or null

  return (
    <div>
      <h1>Teacher Dashboard</h1>

      {/* Student picker */}
      <div className="dashboard-grid" style={{ marginBottom: 16 }}>
        <TeacherStudentsPanel
          onSelect={setActiveStudent}
          activeId={activeStudent?._id}
        />
      </div>

      {/* Context note + clear */}
      {activeStudent && (
        <div className="form-note" style={{ marginBottom: 12 }}>
          Viewing: <strong>{activeStudent.name}</strong> ({activeStudent.email})
          <button className="btn-ghost" style={{ marginLeft: 8 }} onClick={() => setActiveStudent(null)}>
            Clear
          </button>
        </div>
      )}

      {/* The three teacher blocks, now filtered when a student is selected */}
      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <h2>Videos</h2>
          <TeacherVideos
            studentId={activeStudent?._id}
            defaultRecipientEmail={activeStudent?.email}
          />
        </section>

        <section className="dashboard-panel">
          <h2>Assignments</h2>
          <TeacherAssignments
            studentId={activeStudent?._id}
            defaultRecipientEmail={activeStudent?.email}
          />
        </section>

        <section className="dashboard-panel">
          <h2>Questions</h2>
          <TeacherQuestions studentId={activeStudent?._id} />
        </section>
      </div>
    </div>
  );
}
