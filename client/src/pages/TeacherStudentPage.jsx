import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../axios.js";
import Sidebar from "../components/Sidebar.jsx";
import TeacherVideos from "../components/TeacherVideos.jsx";
import TeacherAssignments from "../components/TeacherAssignment.jsx";
import TeacherQuestions from "../components/TeacherQuestions.jsx";

export default function TeacherStudentPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [tab, setTab] = useState("videos"); // or persist via query if you like

  useEffect(() => {
    // header details (optional)
    axios.get(`/teacher/students/${id}`).then(({data}) =>
      setStudent(data?.student ?? null)
    ).catch(() => setStudent(null));

    // KPI: videos, assignments, unanswered questions
    axios.get(`/teacher/students/${id}/summary`, { withCredentials:true })
      .then(({data}) => setSummary(data))
      .catch(() => setSummary(null));
  }, [id]);

  return (
    <div>
      {/* <Sidebar role="teacher" /> */}
      <main>
        <div className="container-center">
          <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}> 
          </div>
          <div className="page-heater">
            <h1 className="page-title" style={{ margin: 0 }}>{student?.name || "Student"}</h1>
            {student?.email && <div className="muted">{student.email}</div>}
          </div>
          <Link className="link-back" to="/teacher">← Back to Dashboard</Link>
        </div>

        {/* KPI pills */}
        <div className="kpi-grid" style={{ margin: "12px 0" }}>
          <KPI label="Videos" value={summary?.videos ?? 0} />
          <KPI label="Assignments" value={summary?.assignments ?? 0} />
          <KPI label="Unanswered Qs" value={summary?.questionsUnanswered ?? 0} />
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginTop: 8 }}>
          <button className={`tab ${tab==='videos'?'active':''}`} onClick={()=>setTab('videos')}>Videos</button>
          <button className={`tab ${tab==='assignments'?'active':''}`} onClick={()=>setTab('assignments')}>Assignments</button>
          <button className={`tab ${tab==='questions'?'active':''}`} onClick={()=>setTab('questions')}>Questions</button>
        </div>

        {/* Body (reuse your components, just pass studentId) */}
        <div style={{ marginTop: 12 }}>
          {tab === "videos" && <TeacherVideos studentId={id} />}
          {tab === "assignments" && <TeacherAssignments studentId={id} />}
          {tab === "questions" && <TeacherQuestions studentId={id} />}
        </div>
      </main>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div className="assignment-card" style={{ textAlign:'center' }}>
      <div className="assignment-title" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{value ?? 0}</div>
    </div>
  );
}
