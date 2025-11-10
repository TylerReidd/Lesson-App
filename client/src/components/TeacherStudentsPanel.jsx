import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../axios.js';

export default function TeacherStudentsPanel({ refreshKey = 0 }) {
  const [students, setStudents] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await axios.get("/teacher/students", {
          withCredentials: true,
        })
        const list = Array.isArray(data?.students) ? data.students : [];
        console.log("[teacher/students] raw: ", data, "list length: ", list.length)

        // fetching the summaries for every student individually
        const studSummaries = await Promise.all(
          list.map(async (s) => {
            try {
              const {data: summary} = await axios.get(
                `/teacher/students/${s._id}/summary`,
                {withCredentials: true}
                );
                return {...s, summary}
            } catch {
              return {
                ...s,
                summary: {questions: 0, videos: 0, assignments: 0},
              }
            }
          })
        )

        setStudents(Array.isArray(studSummaries) ? studSummaries : [])
      } catch (err) {
        console.error("Failed to load students", err)
        setStudents([])
      }
    }
    fetchAll()
  }, [refreshKey])

  return (
    <div>
      {(!Array.isArray(students) || students.length === 0 ? (
        <p className="muted">No linked students yet.</p>
      ) : (
        <div 
          className="students-cards-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "5px",
            marginTop: "16px"
          }}
        >
          {(Array.isArray(students) ? students : []).map((s) => (
            <div 
              key={s._id}
              className="student-card assignment-card"
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{marginBottom: "8px"}}>
                <div style={{fontWeight: 600, fontSize: "1.1rem", color: "#000",}}>
                  {s.name}
                </div>
                {/* May want to delete the email display eventually */}
                <div style={{
                  color: "#000", 
                  fontSize: "1.2rem",
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere'}}>
                  {s.email}
                </div>
              </div>

              <div 
                className="kpi-grid"
                style={{
                  display: "flex",
                  justifyContent:"space-between",
                  marginBottom: "12px"
                }}
              >
                <Stat label="Qs" value={s.summary?.questionsUnanswered} />
                <Stat label="Videos" value={s.summary?.videos} />
                <Stat label="Assign." value={s.summary?.assignments} />
              </div>

              <button
                className="button-primary"
                style={{
                  width:"100%",
                  padding: "8px",
                  borderRadius: "8px",
                  background: "#3b82f6", 
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/teacher/students/${s._id}`)}
              >
                View Details
              </button>
              {/* <buton 
                className='button-primary'
                onClick={() => setStudents(s._id)}>
                  View Practice
                </buton> */}
              </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Stat ({label, value}) {
  return (
    <div style={{textAlign: "center", flex: 1}}>
      <div style={{fontSize: "0.8rem", color: "#666"}}>{label}</div>
      <div style={{fontWeight: 700}}>{value ?? 0}</div>
    </div>
  )
}
