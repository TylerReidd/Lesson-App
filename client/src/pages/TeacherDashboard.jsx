import React, { useState } from "react";
import TeacherStudentsPanel from "../components/TeacherStudentsPanel";


export default function TeacherDashboard({ onLogout }) {
  const [activeStudent, setActiveStudent] = useState(null);
  const [summary, setSummary] = useState({questions:0, videos:0, assignments:0});

  return (
    <div>
    <main>
      <div style={{margin: '10px'}}>
        <section className="panel">
          <div className="panel-h">My Students</div>
          <div className="panel-b">
            <TeacherStudentsPanel    
            />
          </div>
        </section>
      </div>
    </main>
  </div>
  );
}
