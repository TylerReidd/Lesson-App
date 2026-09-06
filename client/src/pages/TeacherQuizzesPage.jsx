import { useEffect, useState } from "react";
import axios from "../axios.js";

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "short_answer", label: "Short Answer" },
];

function makeQuestion(type = "multiple_choice", position = 0) {
  return {
    id: `question-${Date.now()}-${position}`,
    type,
    prompt: "",
    choicesText: type === "multiple_choice" ? "Option 1\nOption 2" : "",
    correctAnswer: "",
    points: 1,
    explanation: "",
  };
}

function makeFormState() {
  return {
    title: "",
    description: "",
    status: "draft",
    questions: [makeQuestion()],
  };
}

function toPayload(form) {
  return {
    title: form.title,
    description: form.description,
    status: form.status,
    questions: form.questions.map((question, index) => ({
      id: question.id,
      type: question.type,
      prompt: question.prompt,
      choices:
        question.type === "multiple_choice"
          ? question.choicesText.split("\n").map((choice) => choice.trim()).filter(Boolean)
          : [],
      correctAnswer:
        question.type === "multiple_choice" ? question.correctAnswer.trim() : null,
      points: Number(question.points) || 1,
      explanation: question.explanation,
      position: index,
    })),
  };
}

function fromQuiz(quiz) {
  return {
    title: quiz?.title || "",
    description: quiz?.description || "",
    status: quiz?.status || "draft",
    questions: Array.isArray(quiz?.questions) && quiz.questions.length
      ? quiz.questions.map((question, index) => ({
          id: question.id || `question-${Date.now()}-${index}`,
          type: question.type || "multiple_choice",
          prompt: question.prompt || "",
          choicesText: Array.isArray(question.choices) ? question.choices.join("\n") : "",
          correctAnswer:
            typeof question.correctAnswer === "string" ? question.correctAnswer : "",
          points: question.points ?? 1,
          explanation: question.explanation || "",
        }))
      : [makeQuestion()],
  };
}

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [activeAssignId, setActiveAssignId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [assignDrafts, setAssignDrafts] = useState({});
  const [form, setForm] = useState(makeFormState);

  useEffect(() => {
    loadQuizzes();
    loadStudents();
  }, []);

  async function loadQuizzes() {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("/quizzes");
      setQuizzes(Array.isArray(data?.quizzes) ? data.quizzes : []);
    } catch (err) {
      console.error("Failed to load quizzes", err);
      setError(err?.response?.data?.message || "Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents() {
    try {
      const { data } = await axios.get("/teacher/students");
      setStudents(Array.isArray(data?.students) ? data.students : []);
    } catch (err) {
      console.error("Failed to load students", err);
    }
  }

  function resetComposer() {
    setEditingId(null);
    setForm(makeFormState());
  }

  function updateQuestion(index, key, value) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [key]: value } : question
      ),
    }));
  }

  function addQuestion(type = "multiple_choice") {
    setForm((current) => ({
      ...current,
      questions: [...current.questions, makeQuestion(type, current.questions.length)],
    }));
  }

  function removeQuestion(index) {
    setForm((current) => ({
      ...current,
      questions:
        current.questions.length === 1
          ? [makeQuestion()]
          : current.questions.filter((_, questionIndex) => questionIndex !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const payload = toPayload(form);
      const { data } = editingId
        ? await axios.put(`/quizzes/${editingId}`, payload)
        : await axios.post("/quizzes", payload);

      const nextQuiz = data?.quiz;
      setQuizzes((current) => {
        if (!nextQuiz) return current;
        if (editingId) {
          return current.map((quiz) => (quiz._id === nextQuiz._id ? nextQuiz : quiz));
        }
        return [nextQuiz, ...current];
      });
      setMessage(editingId ? "Quiz updated." : "Quiz created.");
      resetComposer();
    } catch (err) {
      console.error("Failed to save quiz", err);
      setError(err?.response?.data?.message || "Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  }

  function beginEdit(quiz) {
    setEditingId(quiz._id);
    setForm(fromQuiz(quiz));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(quizId) {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      setError("");
      setMessage("");
      await axios.delete(`/quizzes/${quizId}`);
      setQuizzes((current) => current.filter((quiz) => quiz._id !== quizId));
      if (editingId === quizId) {
        resetComposer();
      }
      setMessage("Quiz deleted.");
    } catch (err) {
      console.error("Failed to delete quiz", err);
      setError(err?.response?.data?.message || "Failed to delete quiz.");
    }
  }

  function updateAssignDraft(quizId, key, value) {
    setAssignDrafts((current) => ({
      ...current,
      [quizId]: {
        studentId: current[quizId]?.studentId || "",
        dueAt: current[quizId]?.dueAt || "",
        [key]: value,
      },
    }));
  }

  async function handleAssign(quizId) {
    const draft = assignDrafts[quizId] || { studentId: "", dueAt: "" };
    if (!draft.studentId) {
      setError("Choose a student before assigning a quiz.");
      setMessage("");
      return;
    }

    try {
      setAssigningId(quizId);
      setError("");
      setMessage("");
      await axios.post(`/quizzes/${quizId}/assign`, {
        studentId: draft.studentId,
        dueAt: draft.dueAt || null,
      });
      setMessage("Quiz assigned.");
      setActiveAssignId(null);
      setAssignDrafts((current) => ({
        ...current,
        [quizId]: { studentId: "", dueAt: "" },
      }));
    } catch (err) {
      console.error("Failed to assign quiz", err);
      setError(err?.response?.data?.message || "Failed to assign quiz.");
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <div className="dashboard-shell">
      <main className="dashboard-stack quiz-page-shell">
        <header className="dashboard-header">
          <span className="hero-eyebrow">Teacher workspace</span>
          <h1 className="hero-title">Quiz library</h1>
          <p className="hero-subtitle">
            Build reusable lesson checks now, then assign them to students in the next phase.
          </p>
        </header>

        {error ? <p className="form-note error">{error}</p> : null}
        {message ? <p className="form-note success">{message}</p> : null}

        <div className="quiz-layout">
          <section className="panel quiz-composer-panel">
            <div className="panel-h">
              {editingId ? "Edit quiz" : "Create a quiz"}
            </div>
            <div className="panel-b">
              <form className="quiz-composer-form" onSubmit={handleSubmit}>
                <label className="field">
                  <span>Quiz title</span>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="Intervals warm-up"
                    required
                  />
                </label>

                <label className="field">
                  <span>Description</span>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="Short check-in on theory, ear training, or lesson prep."
                  />
                </label>

                <label className="field">
                  <span>Status</span>
                  <select
                    className="input"
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, status: event.target.value }))
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>

                <div className="quiz-question-list">
                  {form.questions.map((question, index) => (
                    <div className="quiz-question-card" key={question.id}>
                      <div className="quiz-question-card-top">
                        <div className="quiz-question-card-title">
                          Question {index + 1}
                        </div>
                        <button
                          type="button"
                          className="button button-ghost"
                          onClick={() => removeQuestion(index)}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="quiz-question-grid">
                        <label className="field">
                          <span>Type</span>
                          <select
                            className="input"
                            value={question.type}
                            onChange={(event) => {
                              const nextType = event.target.value;
                              updateQuestion(index, "type", nextType);
                              if (nextType === "short_answer") {
                                updateQuestion(index, "choicesText", "");
                                updateQuestion(index, "correctAnswer", "");
                              }
                            }}
                          >
                            {QUESTION_TYPES.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="field">
                          <span>Points</span>
                          <input
                            className="input"
                            type="number"
                            min="1"
                            step="1"
                            value={question.points}
                            onChange={(event) =>
                              updateQuestion(index, "points", event.target.value)
                            }
                          />
                        </label>
                      </div>

                      <label className="field">
                        <span>Prompt</span>
                        <textarea
                          rows={3}
                          value={question.prompt}
                          onChange={(event) =>
                            updateQuestion(index, "prompt", event.target.value)
                          }
                          placeholder="What should the student answer?"
                          required
                        />
                      </label>

                      {question.type === "multiple_choice" ? (
                        <>
                          <label className="field">
                            <span>Answer choices</span>
                            <textarea
                              rows={4}
                              value={question.choicesText}
                              onChange={(event) =>
                                updateQuestion(index, "choicesText", event.target.value)
                              }
                              placeholder={"Option 1\nOption 2\nOption 3"}
                            />
                          </label>

                          <label className="field">
                            <span>Correct answer</span>
                            <input
                              className="input"
                              value={question.correctAnswer}
                              onChange={(event) =>
                                updateQuestion(index, "correctAnswer", event.target.value)
                              }
                              placeholder="Must match one choice exactly"
                            />
                          </label>
                        </>
                      ) : (
                        <p className="muted">
                          Short-answer questions will be reviewed manually in the grading phase.
                        </p>
                      )}

                      <label className="field">
                        <span>Explanation or notes</span>
                        <textarea
                          rows={2}
                          value={question.explanation}
                          onChange={(event) =>
                            updateQuestion(index, "explanation", event.target.value)
                          }
                          placeholder="Optional teacher note or answer explanation."
                        />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="quiz-builder-actions">
                  <button
                    type="button"
                    className="button"
                    onClick={() => addQuestion("multiple_choice")}
                  >
                    Add Multiple Choice
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() => addQuestion("short_answer")}
                  >
                    Add Short Answer
                  </button>
                </div>

                <div className="quiz-builder-actions">
                  {editingId ? (
                    <button type="button" className="button" onClick={resetComposer}>
                      Cancel Edit
                    </button>
                  ) : null}
                  <button type="submit" className="button-primary" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update Quiz" : "Save Quiz"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="panel quiz-library-panel">
            <div className="panel-h">Saved quizzes</div>
            <div className="panel-b quiz-library-list">
              {loading ? <p className="muted">Loading quizzes...</p> : null}
              {!loading && quizzes.length === 0 ? (
                <p className="muted">
                  No quizzes yet. Start your first one in the builder.
                </p>
              ) : null}

              {quizzes.map((quiz) => {
                const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
                const mcCount = Array.isArray(quiz.questions)
                  ? quiz.questions.filter((question) => question.type === "multiple_choice").length
                  : 0;
                const shortCount = questionCount - mcCount;

                return (
                  <article key={quiz._id} className="quiz-library-card">
                    <div className="quiz-library-card-top">
                      <div>
                        <h2 className="h2">{quiz.title}</h2>
                        <p className="muted">{quiz.description || "No description yet."}</p>
                      </div>
                      <span className={`quiz-status-pill ${quiz.status || "draft"}`}>
                        {quiz.status || "draft"}
                      </span>
                    </div>

                    <div className="quiz-library-meta">
                      <span>{questionCount} questions</span>
                      <span>{mcCount} multiple choice</span>
                      <span>{shortCount} short answer</span>
                    </div>

                    <div className="quiz-library-footer">
                      <span className="muted">
                        Updated {new Date(quiz.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="quiz-library-actions">
                        <button
                          type="button"
                          className="button"
                          onClick={() =>
                            setActiveAssignId((current) =>
                              current === quiz._id ? null : quiz._id
                            )
                          }
                        >
                          Assign
                        </button>
                        <button
                          type="button"
                          className="button"
                          onClick={() => beginEdit(quiz)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button"
                          onClick={() => handleDelete(quiz._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {activeAssignId === quiz._id ? (
                      <div className="quiz-assign-box">
                        <label className="field">
                          <span>Student</span>
                          <select
                            className="input"
                            value={assignDrafts[quiz._id]?.studentId || ""}
                            onChange={(event) =>
                              updateAssignDraft(quiz._id, "studentId", event.target.value)
                            }
                          >
                            <option value="">Select a student</option>
                            {students.map((student) => (
                              <option key={student._id} value={student._id}>
                                {student.name} ({student.email})
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="field">
                          <span>Due date</span>
                          <input
                            className="input"
                            type="date"
                            value={assignDrafts[quiz._id]?.dueAt || ""}
                            onChange={(event) =>
                              updateAssignDraft(quiz._id, "dueAt", event.target.value)
                            }
                          />
                        </label>

                        <div className="quiz-library-actions">
                          <button
                            type="button"
                            className="button"
                            onClick={() => setActiveAssignId(null)}
                          >
                            Close
                          </button>
                          <button
                            type="button"
                            className="button-primary"
                            disabled={assigningId === quiz._id}
                            onClick={() => handleAssign(quiz._id)}
                          >
                            {assigningId === quiz._id ? "Assigning..." : "Confirm Assign"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
