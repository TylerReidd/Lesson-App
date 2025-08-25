import React, { useState } from "react";
import TeacherStudentsPanel from "../components/TeacherStudentsPanel";


export default function TeacherDashboard({ onLogout }) {
  const [activeStudent, setActiveStudent] = useState(null);
  const [summary, setSummary] = useState({questions:0, videos:0, assignments:0});

  return (
    <div>
    <main>
      <div>
        <section className="panel">
          <div className="panel-h">My Students</div>
          <div className="">
            <TeacherStudentsPanel    
            />
          </div>
        </section>
      </div>
    </main>
  </div>
  );
}
