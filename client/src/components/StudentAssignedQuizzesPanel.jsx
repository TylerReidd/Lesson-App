import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axios.js";
import CollapsiblePanel from "./CollapsiblePanel.jsx";

export default function StudentAssignedQuizzesPanel() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("/quizzes/student/assignments");
      setAssignments(Array.isArray(data?.assignments) ? data.assignments : []);
    } catch (err) {
      console.error("Failed to load assigned quizzes", err);
      setError(err?.response?.data?.message || "Failed to load assigned quizzes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CollapsiblePanel title="Assigned quizzes">
      <div className="quiz-assignment-list">
        {error ? <p className="form-note error">{error}</p> : null}
        {loading ? <p className="muted">Loading quizzes...</p> : null}
        {!loading && assignments.length === 0 ? (
          <p className="muted">No quizzes assigned yet.</p>
        ) : null}

        {assignments.map((assignment) => {
          const status = assignment.submission?.status || assignment.status || "assigned";
          const isSubmitted = Boolean(assignment.submission);

          return (
            <article key={assignment._id} className="quiz-assignment-card">
              <div className="quiz-library-card-top">
                <div>
                  <h2 className="h2">{assignment.quiz?.title || "Quiz"}</h2>
                  <p className="muted">
                    {assignment.quiz?.questionCount || 0} questions
                  </p>
                </div>
                <span className={`quiz-status-pill ${status}`}>
                  {status.replace("_", " ")}
                </span>
              </div>

              <div className="quiz-library-meta">
                <span>
                  {assignment.goal?.title ? `Lesson Lab: ${assignment.goal.title}` : "No linked lesson lab"}
                </span>
                <span>
                  {assignment.dueAt
                    ? `Due ${new Date(assignment.dueAt).toLocaleDateString()}`
                    : "No due date"}
                </span>
                {isSubmitted ? (
                  <span>
                    Score {assignment.submission?.finalScore ?? 0}/{assignment.submission?.maxScore ?? 0}
                  </span>
                ) : (
                  <span>Ready to start</span>
                )}
              </div>

              <div className="quiz-library-footer">
                <span className="muted">
                  Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                </span>
                <Link className="button-primary" to={`/student/quizzes/${assignment._id}`}>
                  {isSubmitted ? "View Quiz" : "Open Quiz"}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </CollapsiblePanel>
  );
}
