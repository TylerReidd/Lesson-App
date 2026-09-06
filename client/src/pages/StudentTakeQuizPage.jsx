import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../axios.js";

export default function StudentTakeQuizPage() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!assignmentId) return;
    loadAssignment();
  }, [assignmentId]);

  async function loadAssignment() {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`/quizzes/student/assignments/${assignmentId}`);
      const nextAssignment = data?.assignment ?? null;
      setAssignment(nextAssignment);

      const nextAnswers = {};
      if (nextAssignment?.submission?.answers?.length) {
        for (const answer of nextAssignment.submission.answers) {
          nextAnswers[answer.questionId] = String(answer.response || "");
        }
      }
      setAnswers(nextAnswers);
    } catch (err) {
      console.error("Failed to load assigned quiz", err);
      setError(err?.response?.data?.message || "Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  }

  const questions = useMemo(
    () => (Array.isArray(assignment?.quiz?.questions) ? assignment.quiz.questions : []),
    [assignment]
  );

  const isSubmitted = Boolean(assignment?.submission);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!assignment || isSubmitted) return;

    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const { data } = await axios.post(
        `/quizzes/student/assignments/${assignment._id}/submit`,
        { answers }
      );
      setMessage("Quiz submitted.");
      setAssignment((current) =>
        current
          ? {
              ...current,
              status: data?.submission?.status === "graded" ? "graded" : "submitted",
              submission: data?.submission || current.submission,
            }
          : current
      );
    } catch (err) {
      console.error("Failed to submit quiz", err);
      setError(err?.response?.data?.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dashboard-shell">
      <main className="dashboard-stack quiz-page-shell">
        <div className="container-center">
          <div className="page-header">
            <span className="hero-eyebrow">Student workspace</span>
            <h1 className="page-title">{assignment?.quiz?.title || "Quiz"}</h1>
            <p className="muted">
              {assignment?.quiz?.description || "Work through the quiz and submit when you are ready."}
            </p>
          </div>
          <Link className="link-back" to="/student">
            ← Back to Dashboard
          </Link>
        </div>

        {error ? <p className="form-note error">{error}</p> : null}
        {message ? <p className="form-note success">{message}</p> : null}

        {loading ? <p className="muted">Loading quiz...</p> : null}

        {!loading && assignment ? (
          <section className="panel">
            <div className="panel-h">
              <div className="quiz-library-card-top">
                <div>
                  <span>
                    {questions.length} questions
                    {assignment.dueAt
                      ? ` • Due ${new Date(assignment.dueAt).toLocaleDateString()}`
                      : ""}
                  </span>
                  {assignment.goal?.title ? (
                    <div className="muted">
                      Lesson Lab: {assignment.goal.title}
                      {assignment.goal.category ? ` • ${assignment.goal.category}` : ""}
                    </div>
                  ) : null}
                </div>
                <span className={`quiz-status-pill ${(assignment.submission?.status || assignment.status || "assigned")}`}>
                  {(assignment.submission?.status || assignment.status || "assigned").replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="panel-b">
              <form className="quiz-composer-form" onSubmit={handleSubmit}>
                {questions.map((question, index) => {
                  const savedAnswer = assignment.submission?.answers?.find(
                    (answer) => answer.questionId === question.id
                  );
                  return (
                    <div key={question.id} className="quiz-question-card">
                      <div className="quiz-question-card-top">
                        <div className="quiz-question-card-title">
                          {index + 1}. {question.prompt}
                        </div>
                        <span className="muted">{question.points || 1} pt</span>
                      </div>

                      {question.type === "multiple_choice" ? (
                        <div className="quiz-choice-list">
                          {(question.choices || []).map((choice) => (
                            <label key={choice} className="quiz-choice-item">
                              <input
                                type="radio"
                                name={question.id}
                                value={choice}
                                checked={(answers[question.id] || "") === choice}
                                disabled={isSubmitted}
                                onChange={(event) =>
                                  setAnswers((current) => ({
                                    ...current,
                                    [question.id]: event.target.value,
                                  }))
                                }
                              />
                              <span>{choice}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          rows={4}
                          value={answers[question.id] || ""}
                          disabled={isSubmitted}
                          onChange={(event) =>
                            setAnswers((current) => ({
                              ...current,
                              [question.id]: event.target.value,
                            }))
                          }
                          placeholder="Write your answer here..."
                        />
                      )}

                      {savedAnswer?.teacherFeedback ? (
                        <p className="muted">{savedAnswer.teacherFeedback}</p>
                      ) : null}
                    </div>
                  );
                })}

                {assignment.submission?.feedback ? (
                  <div className="quiz-review-response">
                    <div className="muted">Teacher feedback</div>
                    <div>{assignment.submission.feedback}</div>
                  </div>
                ) : null}

                <div className="quiz-builder-actions">
                  {assignment.submission ? (
                    <div className="muted">
                      Submitted {new Date(assignment.submission.submittedAt).toLocaleString()}
                      {typeof assignment.submission.finalScore === "number"
                        ? ` • Score ${assignment.submission.finalScore}/${assignment.submission.maxScore}`
                        : ""}
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="button-primary"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Quiz"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
