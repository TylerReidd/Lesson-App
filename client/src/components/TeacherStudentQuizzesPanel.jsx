import { useEffect, useMemo, useState } from "react";
import axios from "../axios.js";

export default function TeacherStudentQuizzesPanel({ studentId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [reviewAssignmentId, setReviewAssignmentId] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [gradeDraft, setGradeDraft] = useState({ answers: {}, feedback: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const publishedQuizzes = useMemo(
    () => quizzes.filter((quiz) => quiz.status !== "archived"),
    [quizzes]
  );
  const assignableGoals = useMemo(
    () => goals.filter((goal) => goal.status !== "completed"),
    [goals]
  );

  useEffect(() => {
    if (!studentId) return;
    loadData();
  }, [studentId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [{ data: quizData }, { data: assignmentData }, { data: goalData }] = await Promise.all([
        axios.get("/quizzes"),
        axios.get(`/quizzes/assignments?studentId=${studentId}`),
        axios.get(`/goals/teacher/${studentId}`),
      ]);
      setQuizzes(Array.isArray(quizData?.quizzes) ? quizData.quizzes : []);
      setAssignments(
        Array.isArray(assignmentData?.assignments) ? assignmentData.assignments : []
      );
      setGoals(Array.isArray(goalData?.goals) ? goalData.goals : []);
    } catch (err) {
      console.error("Failed to load student quizzes", err);
      setError(err?.response?.data?.message || "Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedQuizId) {
      setError("Choose a quiz first.");
      setMessage("");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setMessage("");
      const { data } = await axios.post(`/quizzes/${selectedQuizId}/assign`, {
        studentId,
        goalId: selectedGoalId || null,
        dueAt: dueAt || null,
      });
      if (data?.assignment) {
        setAssignments((current) => [data.assignment, ...current]);
      } else {
        await loadData();
      }
      setSelectedQuizId("");
      setSelectedGoalId("");
      setDueAt("");
      setMessage("Quiz assigned to student.");
    } catch (err) {
      console.error("Failed to assign quiz", err);
      setError(err?.response?.data?.message || "Failed to assign quiz.");
    } finally {
      setAssigning(false);
    }
  }

  async function openReview(assignmentId) {
    try {
      setReviewAssignmentId(assignmentId);
      setReviewLoading(true);
      setError("");
      setMessage("");
      const { data } = await axios.get(`/quizzes/assignments/${assignmentId}`);
      const assignment = data?.assignment ?? null;
      setReviewData(assignment);

      const nextAnswers = {};
      for (const answer of assignment?.submission?.answers || []) {
        nextAnswers[answer.questionId] = {
          manualPoints:
            typeof answer.manualPoints === "number" ? String(answer.manualPoints) : "0",
          teacherFeedback: answer.teacherFeedback || "",
        };
      }
      setGradeDraft({
        answers: nextAnswers,
        feedback: assignment?.submission?.feedback || "",
      });
    } catch (err) {
      console.error("Failed to load submission review", err);
      setError(err?.response?.data?.message || "Failed to load submission.");
      setReviewData(null);
    } finally {
      setReviewLoading(false);
    }
  }

  function updateGradeDraft(questionId, key, value) {
    setGradeDraft((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [questionId]: {
          manualPoints: current.answers[questionId]?.manualPoints || "0",
          teacherFeedback: current.answers[questionId]?.teacherFeedback || "",
          [key]: value,
        },
      },
    }));
  }

  async function handleGradeSubmit(event) {
    event.preventDefault();
    if (!reviewData?.submission?._id) return;

    try {
      setGrading(true);
      setError("");
      setMessage("");
      const payload = {
        answers: Object.entries(gradeDraft.answers).map(([questionId, value]) => ({
          questionId,
          manualPoints: Number(value.manualPoints) || 0,
          teacherFeedback: value.teacherFeedback || "",
        })),
        feedback: gradeDraft.feedback || "",
      };

      const { data } = await axios.put(
        `/quizzes/submissions/${reviewData.submission._id}/grade`,
        payload
      );
      const nextSubmission = data?.submission || null;
      setReviewData((current) =>
        current ? { ...current, submission: nextSubmission } : current
      );
      setAssignments((current) =>
        current.map((assignment) =>
          assignment._id === reviewData._id
            ? {
                ...assignment,
                status: "graded",
                submission: {
                  ...(assignment.submission || {}),
                  status: nextSubmission?.status || "graded",
                  finalScore: nextSubmission?.finalScore ?? assignment.submission?.finalScore,
                  maxScore: nextSubmission?.maxScore ?? assignment.submission?.maxScore,
                  submittedAt:
                    nextSubmission?.submittedAt ?? assignment.submission?.submittedAt,
                  gradedAt: nextSubmission?.gradedAt ?? new Date().toISOString(),
                },
              }
            : assignment
        )
      );
      setMessage("Submission graded.");
    } catch (err) {
      console.error("Failed to grade submission", err);
      setError(err?.response?.data?.message || "Failed to save grade.");
    } finally {
      setGrading(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-h">Quizzes</div>
      <div className="panel-b quiz-student-panel">
        {error ? <p className="form-note error">{error}</p> : null}
        {message ? <p className="form-note success">{message}</p> : null}

        <div className="quiz-student-assign">
          <label className="field">
            <span>Assign a saved quiz</span>
            <select
              className="input"
              value={selectedQuizId}
              onChange={(event) => setSelectedQuizId(event.target.value)}
            >
              <option value="">Select a quiz</option>
              {publishedQuizzes.map((quiz) => (
                <option key={quiz._id} value={quiz._id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Due date</span>
            <input
              className="input"
              type="date"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Link to lesson lab</span>
            <select
              className="input"
              value={selectedGoalId}
              onChange={(event) => setSelectedGoalId(event.target.value)}
            >
              <option value="">No linked lesson lab</option>
              {assignableGoals.map((goal) => (
                <option key={goal._id} value={goal._id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </label>

          <div className="quiz-builder-actions">
            <button
              type="button"
              className="button-primary"
              disabled={assigning}
              onClick={handleAssign}
            >
              {assigning ? "Assigning..." : "Assign Quiz"}
            </button>
          </div>
        </div>

        <div className="quiz-assignment-list">
          {loading ? <p className="muted">Loading assigned quizzes...</p> : null}
          {!loading && assignments.length === 0 ? (
            <p className="muted">No quizzes assigned yet.</p>
          ) : null}

          {assignments.map((assignment) => (
            <article key={assignment._id} className="quiz-assignment-card">
              <div className="quiz-library-card-top">
                <div>
                  <h2 className="h2">{assignment.quiz?.title || "Quiz"}</h2>
                  <p className="muted">
                    {assignment.quiz?.questions?.length || 0} questions
                  </p>
                </div>
                <span className={`quiz-status-pill ${assignment.status || "assigned"}`}>
                  {(assignment.status || "assigned").replace("_", " ")}
                </span>
              </div>

              <div className="quiz-library-meta">
                <span>
                  Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                </span>
                <span>
                  {assignment.goal?.title ? `Lesson Lab: ${assignment.goal.title}` : "No linked lesson lab"}
                </span>
                <span>
                  {assignment.dueAt
                    ? `Due ${new Date(assignment.dueAt).toLocaleDateString()}`
                    : "No due date"}
                </span>
                <span>
                  {assignment.submission?.submittedAt
                    ? `Submitted ${new Date(assignment.submission.submittedAt).toLocaleDateString()}`
                    : "Not submitted yet"}
                </span>
                {typeof assignment.submission?.finalScore === "number" ? (
                  <span>
                    Score {assignment.submission.finalScore}/{assignment.submission.maxScore}
                  </span>
                ) : null}
              </div>

              {assignment.submission ? (
                <div className="quiz-library-actions">
                  <button
                    type="button"
                    className="button"
                    onClick={() =>
                      reviewAssignmentId === assignment._id
                        ? setReviewAssignmentId(null)
                        : openReview(assignment._id)
                    }
                  >
                    {reviewAssignmentId === assignment._id ? "Close Review" : "Review"}
                  </button>
                </div>
              ) : null}

              {reviewAssignmentId === assignment._id ? (
                <div className="quiz-review-panel">
                  {reviewLoading ? <p className="muted">Loading submission...</p> : null}
                  {!reviewLoading && !reviewData?.submission ? (
                    <p className="muted">This quiz has not been submitted yet.</p>
                  ) : null}

                  {!reviewLoading && reviewData?.submission ? (
                    <form className="quiz-composer-form" onSubmit={handleGradeSubmit}>
                      {reviewData.submission.answers.map((answer, index) => (
                        <div key={answer.questionId} className="quiz-question-card">
                          <div className="quiz-question-card-top">
                            <div className="quiz-question-card-title">
                              {index + 1}. {answer.question?.prompt || "Question"}
                            </div>
                            <span className="muted">
                              {answer.question?.points || 1} pt
                            </span>
                          </div>

                          <div className="quiz-review-response">
                            <div className="muted">Student response</div>
                            <div>{String(answer.response || "No answer provided.")}</div>
                          </div>

                          {answer.question?.type === "multiple_choice" ? (
                            <div className="quiz-review-response">
                              <div className="muted">Auto grading</div>
                              <div>
                                {answer.autoCorrect ? "Correct" : "Incorrect"}
                                {answer.question?.correctAnswer
                                  ? ` • Correct answer: ${answer.question.correctAnswer}`
                                  : ""}
                              </div>
                            </div>
                          ) : (
                            <div className="quiz-grade-grid">
                              <label className="field">
                                <span>Manual points</span>
                                <input
                                  className="input"
                                  type="number"
                                  min="0"
                                  max={answer.question?.points || 1}
                                  step="1"
                                  value={
                                    gradeDraft.answers[answer.questionId]?.manualPoints || "0"
                                  }
                                  onChange={(event) =>
                                    updateGradeDraft(
                                      answer.questionId,
                                      "manualPoints",
                                      event.target.value
                                    )
                                  }
                                />
                              </label>

                              <label className="field">
                                <span>Teacher feedback</span>
                                <textarea
                                  rows={3}
                                  value={
                                    gradeDraft.answers[answer.questionId]?.teacherFeedback || ""
                                  }
                                  onChange={(event) =>
                                    updateGradeDraft(
                                      answer.questionId,
                                      "teacherFeedback",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Optional notes for the student."
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      ))}

                      <label className="field">
                        <span>Overall feedback</span>
                        <textarea
                          rows={3}
                          value={gradeDraft.feedback}
                          onChange={(event) =>
                            setGradeDraft((current) => ({
                              ...current,
                              feedback: event.target.value,
                            }))
                          }
                          placeholder="Optional overall notes for this submission."
                        />
                      </label>

                      <div className="quiz-builder-actions">
                        <div className="muted">
                          Auto score {reviewData.submission.autoScore}/{reviewData.submission.maxScore}
                          {typeof reviewData.submission.finalScore === "number"
                            ? ` • Current final ${reviewData.submission.finalScore}/${reviewData.submission.maxScore}`
                            : ""}
                        </div>
                        <button
                          type="submit"
                          className="button-primary"
                          disabled={grading}
                        >
                          {grading ? "Saving..." : "Save Grade"}
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
