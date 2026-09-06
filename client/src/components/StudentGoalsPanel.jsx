import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axios.js";
import CollapsiblePanel from "./CollapsiblePanel.jsx";

export default function StudentGoalsPanel() {
  const [goals, setGoals] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [resourceAssignments, setResourceAssignments] = useState([]);
  const [practiceLogs, setPracticeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status !== "completed").slice(0, 4),
    [goals]
  );
  const assignmentsByGoal = useMemo(() => {
    return assignments.reduce((map, assignment) => {
      const goalId = assignment.goal?._id;
      if (!goalId) return map;
      if (!map[goalId]) {
        map[goalId] = [];
      }
      map[goalId].push(assignment);
      return map;
    }, {});
  }, [assignments]);
  const resourceAssignmentsByGoal = useMemo(() => {
    return resourceAssignments.reduce((map, assignment) => {
      const goalId = assignment.goal?._id;
      if (!goalId) return map;
      if (!map[goalId]) {
        map[goalId] = [];
      }
      map[goalId].push(assignment);
      return map;
    }, {});
  }, [resourceAssignments]);
  const practiceByGoal = useMemo(() => {
    return practiceLogs.reduce((map, log) => {
      const goalId = log.goal?._id;
      if (!goalId) return map;
      if (!map[goalId]) {
        map[goalId] = [];
      }
      map[goalId].push(log);
      return map;
    }, {});
  }, [practiceLogs]);

  async function loadGoals() {
    try {
      setLoading(true);
      setError("");
      const [
        { data: goalsData },
        { data: assignmentsData },
        { data: resourceAssignmentData },
        { data: practiceData },
      ] = await Promise.all([
        axios.get("/goals/student"),
        axios.get("/quizzes/student/assignments"),
        axios.get("/resources/assignments"),
        axios.get("/practice/me"),
      ]);
      setGoals(Array.isArray(goalsData?.goals) ? goalsData.goals : []);
      setAssignments(
        Array.isArray(assignmentsData?.assignments) ? assignmentsData.assignments : []
      );
      setResourceAssignments(
        Array.isArray(resourceAssignmentData?.assignments) ? resourceAssignmentData.assignments : []
      );
      setPracticeLogs(Array.isArray(practiceData?.logs) ? practiceData.logs : []);
    } catch (err) {
      console.error("Failed to load lesson lab", err);
      setError(err?.response?.data?.message || "Failed to load lesson lab.");
    } finally {
      setLoading(false);
    }
  }

  function renderLinkedQuizzes(goal) {
    const linkedAssignments = assignmentsByGoal[goal._id] || [];
    if (linkedAssignments.length === 0) {
      return <p className="muted">No quizzes linked yet.</p>;
    }

    return (
      <div className="goal-linked-list">
        {linkedAssignments.map((assignment) => (
          <div key={assignment._id} className="goal-linked-item">
            <div>
              <div className="goal-linked-title">
                {assignment.quiz?.title || "Quiz"}
              </div>
              <div className="muted">
                {assignment.dueAt
                  ? `Due ${new Date(assignment.dueAt).toLocaleDateString()}`
                  : "No due date"}
                {typeof assignment.submission?.finalScore === "number"
                  ? ` • Score ${assignment.submission.finalScore}/${assignment.submission.maxScore}`
                  : ""}
              </div>
            </div>
            <Link className="button" to={`/student/quizzes/${assignment._id}`}>
              {assignment.submission ? "View" : "Open"}
            </Link>
          </div>
        ))}
      </div>
    );
  }

  function renderLinkedAssignments(goal) {
    const linkedAssignments = resourceAssignmentsByGoal[goal._id] || [];
    if (linkedAssignments.length === 0) {
      return <p className="muted">No assignment files linked yet.</p>;
    }

    return (
      <div className="goal-linked-list">
        {linkedAssignments.map((assignment) => (
          <a
            key={assignment._id || assignment.id}
            className="goal-linked-item goal-linked-link"
            href={assignment.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div>
              <div className="goal-linked-title">{assignment.filename || "Assignment"}</div>
              <div className="muted">
                {assignment.uploadedAt
                  ? new Date(assignment.uploadedAt).toLocaleDateString()
                  : ""}
              </div>
            </div>
            <span className="button">Open</span>
          </a>
        ))}
      </div>
    );
  }

  function renderLinkedPractice(goal) {
    const linkedLogs = (practiceByGoal[goal._id] || []).filter((log) => log.clipUrl);
    if (linkedLogs.length === 0) {
      return <p className="muted">No practice clips linked yet.</p>;
    }

    return (
      <div className="goal-linked-list">
        {linkedLogs.map((log) => (
          <div key={log._id} className="goal-linked-item">
            <div>
              <div className="goal-linked-title">{log.clipTitle || "Practice clip"}</div>
              <div className="muted">
                {new Date(log.date).toLocaleDateString()}
                {log.clipDurationSec ? ` • ${log.clipDurationSec}s` : ""}
              </div>
            </div>
            <span className={`quiz-status-pill ${log.status || "submitted"}`}>
              {String(log.status || "submitted").replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <CollapsiblePanel title="Lesson Lab">
      <div className="quiz-assignment-list">
        {error ? <p className="form-note error">{error}</p> : null}
        {loading ? <p className="muted">Loading lesson lab...</p> : null}
        {!loading && activeGoals.length === 0 ? (
          <p className="muted">No lesson lab items yet. Build them together during the lesson.</p>
        ) : null}

        {activeGoals.map((goal) => (
          <article key={goal._id} className="goal-card">
            <div className="goal-card-top">
              <div>
                <h2 className="h2">{goal.title}</h2>
                <p className="muted">{goal.description || "No description yet."}</p>
              </div>
              <span className={`goal-status-pill ${goal.status}`}>{goal.status}</span>
            </div>

            <div className="goal-meta">
              <span>{goal.category}</span>
              <span>Priority: {goal.priority}</span>
              <span>
                {goal.targetDate
                  ? `Target ${new Date(goal.targetDate).toLocaleDateString()}`
                  : "No target date"}
              </span>
            </div>

            {goal.teacherNotes ? <p className="muted">{goal.teacherNotes}</p> : null}
            <div className="goal-linked-block">
              <div className="muted">Linked quizzes</div>
              {renderLinkedQuizzes(goal)}
            </div>
            <div className="goal-linked-block">
              <div className="muted">Linked assignments</div>
              {renderLinkedAssignments(goal)}
            </div>
            <div className="goal-linked-block">
              <div className="muted">Linked practice clips</div>
              {renderLinkedPractice(goal)}
            </div>
          </article>
        ))}
      </div>
    </CollapsiblePanel>
  );
}
