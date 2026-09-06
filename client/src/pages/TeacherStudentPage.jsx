import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "../axios.js";
import TeacherVideos from "../components/TeacherVideos.jsx";
import TeacherAssignments from "../components/TeacherAssignment.jsx";
import TeacherQuestions from "../components/TeacherQuestions.jsx";
import TeacherPracticePanel from "../components/TeacherPracticePanel.jsx";
import LessonNotesPanel from "../components/LessonNotesPanel.jsx";
import TeacherStudentQuizzesPanel from "../components/TeacherStudentQuizzesPanel.jsx";
import TeacherStudentGoalsPanel from "../components/TeacherStudentGoalsPanel.jsx";

export default function TeacherStudentPage() {
  const { id } = useParams();
  const location = useLocation();
  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState(null);
  const allowedTabs = ["overview", "videos", "assignments", "questions", "practice", "quizzes", "goals"];
  const queryTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("tab");
    return allowedTabs.includes(raw) ? raw : "overview";
  }, [location.search]);
  const [tab, setTab] = useState(queryTab);

  useEffect(() => {
    setTab(queryTab);
  }, [queryTab, id]);

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
    <div className="dashboard-shell">
      <main className="dashboard-stack">
        <div className="container-center">
          <div className="page-header">
            <span className="hero-eyebrow">Student workspace</span>
            <h1 className="page-title">{student?.name || "Student"}</h1>
            {student?.email && <div className="muted">{student.email}</div>}
          </div>
          <Link className="link-back" to="/teacher">← Back to Dashboard</Link>
        </div>

        <div className="kpi-grid">
          <KPI label="Videos" value={summary?.videos ?? 0} />
          <KPI label="Assignments" value={summary?.assignments ?? 0} />
          <KPI label="Unanswered Qs" value={summary?.questionsUnanswered ?? 0} />
        </div>

        <div className="tabs">
          <button className={`tab ${tab==='overview'?'active':''}`} onClick={()=>setTab('overview')}>Overview</button>
          <button className={`tab ${tab==='videos'?'active':''}`} onClick={()=>setTab('videos')}>Videos</button>
          <button className={`tab ${tab==='assignments'?'active':''}`} onClick={()=>setTab('assignments')}>Assignments</button>
          <button className={`tab ${tab==='questions'?'active':''}`} onClick={()=>setTab('questions')}>Questions</button>
          <button className={`tab ${tab==='practice' ? 'active': ''}`} onClick={() => setTab('practice')}>Practice</button>
          <button className={`tab ${tab==='quizzes' ? 'active': ''}`} onClick={() => setTab('quizzes')}>Quizzes</button>
          <button className={`tab ${tab==='goals' ? 'active': ''}`} onClick={() => setTab('goals')}>Lesson Lab</button>
        </div>

        <div>
          {tab === "overview" && (
            <div className="overview-stack">
              {/* <section className="panel">
                <div className="panel-h">Overview</div>
                <div className="panel-b overview-grid">
                  <div className="overview-copy">
                    <h2 className="h2">Start here</h2>
                    <p className="muted">
                      Use this student workspace to review uploads, answer questions, check assignments, and read practice reflections.
                    </p>
                  </div>

                  <div className="overview-actions">
                    <button type="button" className="button-primary" onClick={() => setTab("questions")}>
                      Review Questions
                    </button>
                    <button type="button" className="button" onClick={() => setTab("practice")}>
                      Open Practice Logs
                    </button>
                    <button type="button" className="button" onClick={() => setTab("videos")}>
                      View Videos
                    </button>
                    <button type="button" className="button" onClick={() => setTab("assignments")}>
                      Open Assignments
                    </button>
                  </div>
                </div>
              </section> */}

              <LessonNotesPanel studentId={id} />
            </div>
          )}
          {tab === "videos" && <TeacherVideos studentId={id} />}
          {tab === "assignments" && <TeacherAssignments studentId={id} />}
          {tab === "questions" && <TeacherQuestions studentId={id} />}
          {tab === "practice" && <TeacherPracticePanel studentId={id} />}
          {tab === "quizzes" && <TeacherStudentQuizzesPanel studentId={id} />}
          {tab === "goals" && <TeacherStudentGoalsPanel studentId={id} />}
        </div>
      </main>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div className="dashboard-stat">
      <div className="label">{label}</div>
      <div className="value">{value ?? 0}</div>
    </div>
  );
}
