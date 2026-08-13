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
        <div className="students-cards-grid">
          {(Array.isArray(students) ? students : []).map((s) => (
            <div key={s._id} className="student-card assignment-card">
              <div className="student-card-top">
                <div className="student-card-name">
                  {s.name}
                </div>
                <div className="student-card-email">
                  {s.email}
                </div>
              </div>

              <div className="student-summary-grid">
                <Stat label="Qs" value={s.summary?.questionsUnanswered} />
                <Stat label="Videos" value={s.summary?.videos} />
                <Stat label="Assign." value={s.summary?.assignments} />
              </div>

              <div className="student-card-actions">
                <button
                  className="button-primary"
                  onClick={() => navigate(`/teacher/students/${s._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Stat ({label, value}) {
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{value ?? 0}</div>
    </div>
  )
}
