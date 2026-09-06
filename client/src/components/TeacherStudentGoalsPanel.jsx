import { useEffect, useMemo, useState } from "react";
import axios from "../axios.js";

const CATEGORIES = [
  "technique",
  "theory",
  "ear training",
  "repertoire",
  "rhythm",
  "reading",
  "improvisation",
  "performance prep",
  "custom",
];

const STATUSES = ["active", "paused", "completed"];
const PRIORITIES = ["low", "medium", "high"];

function makeFormState() {
  return {
    title: "",
    description: "",
    category: "custom",
    status: "active",
    priority: "medium",
    targetDate: "",
    teacherNotes: "",
  };
}

export default function TeacherStudentGoalsPanel({ studentId }) {
  const [goals, setGoals] = useState([]);
  const [quizAssignments, setQuizAssignments] = useState([]);
  const [resourceAssignments, setResourceAssignments] = useState([]);
  const [practiceLogs, setPracticeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(makeFormState);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!studentId) return;
    loadGoals();
  }, [studentId]);

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status !== "completed"),
    [goals]
  );
  const completedGoals = useMemo(
    () => goals.filter((goal) => goal.status === "completed"),
    [goals]
  );
  const quizAssignmentsByGoal = useMemo(() => {
    return quizAssignments.reduce((map, assignment) => {
      const goalId = assignment.goal?._id;
      if (!goalId) return map;
      if (!map[goalId]) {
        map[goalId] = [];
      }
      map[goalId].push(assignment);
      return map;
    }, {});
  }, [quizAssignments]);
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
        { data: quizAssignmentData },
        { data: resourceAssignmentData },
        { data: practiceData },
      ] = await Promise.all([
        axios.get(`/goals/teacher/${studentId}`),
        axios.get(`/quizzes/assignments?studentId=${studentId}`),
        axios.get(`/resources/assignments?studentId=${studentId}`),
        axios.get(`/practice/teacher/${studentId}`),
      ]);
      setGoals(Array.isArray(goalsData?.goals) ? goalsData.goals : []);
      setQuizAssignments(
        Array.isArray(quizAssignmentData?.assignments)
          ? quizAssignmentData.assignments
          : []
      );
      setResourceAssignments(
        Array.isArray(resourceAssignmentData?.assignments)
          ? resourceAssignmentData.assignments
          : []
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
    const linkedAssignments = quizAssignmentsByGoal[goal._id] || [];
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
                {assignment.submission?.submittedAt
                  ? ` • Submitted ${new Date(
                      assignment.submission.submittedAt
                    ).toLocaleDateString()}`
                  : ""}
              </div>
            </div>
            <span className={`quiz-status-pill ${assignment.status || "assigned"}`}>
              {(assignment.submission?.status || assignment.status || "assigned").replace(
                "_",
                " "
              )}
            </span>
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
              <div className="goal-linked-title">
                {assignment.filename || "Assignment"}
              </div>
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

  function resetForm() {
    setEditingId(null);
    setForm(makeFormState());
  }

  function beginEdit(goal) {
    setEditingId(goal._id);
    setForm({
      title: goal.title || "",
      description: goal.description || "",
      category: goal.category || "custom",
      status: goal.status || "active",
      priority: goal.priority || "medium",
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : "",
      teacherNotes: goal.teacherNotes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const payload = { ...form };
      const { data } = editingId
        ? await axios.put(`/goals/teacher/${studentId}/${editingId}`, payload)
        : await axios.post(`/goals/teacher/${studentId}`, payload);

      const nextGoal = data?.goal;
      setGoals((current) => {
        if (!nextGoal) return current;
        if (editingId) {
          return current.map((goal) => (goal._id === nextGoal._id ? nextGoal : goal));
        }
        return [nextGoal, ...current];
      });
      setMessage(editingId ? "Goal updated." : "Goal created.");
      resetForm();
    } catch (err) {
      console.error("Failed to save lesson lab item", err);
      setError(err?.response?.data?.message || "Failed to save lesson lab item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(goalId) {
    if (!window.confirm("Delete this lesson lab item?")) return;
    try {
      setError("");
      setMessage("");
      await axios.delete(`/goals/teacher/${studentId}/${goalId}`);
      setGoals((current) => current.filter((goal) => goal._id !== goalId));
      if (editingId === goalId) resetForm();
      setMessage("Lesson lab item deleted.");
    } catch (err) {
      console.error("Failed to delete lesson lab item", err);
      setError(err?.response?.data?.message || "Failed to delete lesson lab item.");
    }
  }

  return (
    <section className="panel">
      <div className="panel-h">Lesson Lab</div>
      <div className="panel-b quiz-composer-form">
        {error ? <p className="form-note error">{error}</p> : null}
        {message ? <p className="form-note success">{message}</p> : null}

        <form className="quiz-composer-form" onSubmit={handleSubmit}>
          <div className="grid grid-sm-2">
            <label className="field">
              <span>Lesson lab title</span>
              <input
                className="input"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Week 3 chord transitions and timing"
                required
              />
            </label>

            <label className="field">
              <span>Category</span>
              <select
                className="input"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Define exactly what the student should improve or complete."
            />
          </label>

          <div className="grid grid-sm-2 goals-grid-3">
            <label className="field">
              <span>Status</span>
              <select
                className="input"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value }))
                }
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select
                className="input"
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({ ...current, priority: event.target.value }))
                }
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Target date</span>
              <input
                className="input"
                type="date"
                value={form.targetDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, targetDate: event.target.value }))
                }
              />
            </label>
          </div>

          <label className="field">
            <span>Teacher notes</span>
            <textarea
              rows={3}
              value={form.teacherNotes}
              onChange={(event) =>
                setForm((current) => ({ ...current, teacherNotes: event.target.value }))
              }
              placeholder="Optional lesson framing, checkpoints, or reminders."
            />
          </label>

          <div className="quiz-builder-actions">
            {editingId ? (
              <button type="button" className="button" onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null}
            <button type="submit" className="button-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Lesson Lab" : "Save Lesson Lab"}
            </button>
          </div>
        </form>

        <div className="goals-section">
          <div className="question-section-title">Active lesson lab items</div>
          {loading ? <p className="muted">Loading lesson lab...</p> : null}
          {!loading && activeGoals.length === 0 ? (
            <p className="muted">No active lesson lab items yet.</p>
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
              <div className="quiz-library-actions">
                <button type="button" className="button" onClick={() => beginEdit(goal)}>
                  Edit
                </button>
                <button type="button" className="button" onClick={() => handleDelete(goal._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="goals-section">
          <div className="question-section-title">Completed lesson lab items</div>
          {!loading && completedGoals.length === 0 ? (
            <p className="muted">No completed lesson lab items yet.</p>
          ) : null}
          {completedGoals.map((goal) => (
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
              </div>
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
      </div>
    </section>
  );
}
