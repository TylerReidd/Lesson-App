import React, { useState, useEffect, useContext } from "react";
import axios from "../axios.js";
import { AuthContext } from "../AuthContext.jsx";

export default function StudentQuestions() {
  const { user } = useContext(AuthContext);

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  useEffect(() => {
    if (!questions.length) {
      setOpenId(null);
      return;
    }
    if (!openId || !questions.some((q) => q.id === openId)) {
      setOpenId(questions[0].id);
    }
  }, [questions, openId]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const res = await axios.get("/questions/me", { withCredentials: true });
      const items = (res.data || []).map((q) => ({
        ...q,
        id: String(q.id || q._id),
        replies: Array.isArray(q.replies) ? q.replies : [],
      })).sort((a, b) => {
        const aAnswered = Boolean(a.answer);
        const bAnswered = Boolean(b.answer);
        if (aAnswered !== bAnswered) return aAnswered ? 1 : -1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      setQuestions(items);
    } catch (err) {
      console.error("Failed to load questions", err);
    }
  }

  async function loadReplies(qid) {
    const idStr = String(qid);
    const { data } = await axios.get(`/questions/${idStr}/replies`, {
      withCredentials: true,
    });
    const replies = Array.isArray(data?.replies) ? data.replies : [];
    // Normalize reply shape: allow role or authorRole from server
    const norm = replies.map((m) => ({
      id: String(m.id || m._id || m.createdAt),
      text: m.text,
      createdAt: m.createdAt,
      authorRole: m.authorRole || m.role || "student",
    }));
    setQuestions((prev) =>
      prev.map((q) => (q.id === idStr ? { ...q, replies: norm } : q))
    );
  }

  const handleAsk = async (e) => {
    e.preventDefault();
    const text = newQuestion.trim();
    if (!text) return;
    try {
      setLoading(true);
      await axios.post("/questions", { text }, { withCredentials: true });
      setNewQuestion("");
      await fetchQuestions();
    } catch (err) {
      console.error("Failed to submit question", err);
      alert("Could not submit question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (qid) => {
    const idStr = String(qid);
    if (!window.confirm("Are you sure you want to do that?")) return;
    try {
      await axios.delete(`/questions/${idStr}`, { withCredentials: true });
      await fetchQuestions();
      setOpenId((cur) => (cur === idStr ? null : cur));
    } catch (err) {
      console.error("Failed to delete question", err);
    }
  };

  const sendReply = async (qid) => {
    const idStr = String(qid);
    const text = (replyDrafts[idStr] || "").trim();
    if (!text) return;
    try {
      await axios.post(
        `/questions/${idStr}/replies`,
        { text },
        { withCredentials: true }
      );
      setReplyDrafts((d) => ({ ...d, [idStr]: "" }));
      await loadReplies(idStr); // refresh only this thread
    } catch (err) {
      console.error("Failed to send reply", err);
    }
  };

  return (
    <div className="questions-page">
      <div className="question-page-header">
        <span className="hero-eyebrow">Student workspace</span>
        <h1 className="hero-title question-page-title">Questions</h1>
        <p className="hero-subtitle question-page-subtitle">
          Keep open questions easy to find and work through the full thread in a cleaner split layout.
        </p>
      </div>

      <section className="panel">
        <div className="panel-h">Ask a Question</div>
        <div className="panel-b">
          <form onSubmit={handleAsk} className="ask-form">
            <textarea
              rows={3}
              placeholder="Type your question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <button type="submit" disabled={loading} className="button">
              {loading ? "Submitting..." : "Submit Question"}
            </button>
          </form>
        </div>
      </section>

      <div className="questions-layout">
        <aside className="questions-sidebar">
          <QuestionSection
            title="Needs Response"
            items={questions.filter((q) => !q.answer)}
            openId={openId}
            setOpenId={setOpenId}
            loadReplies={loadReplies}
            handleDelete={handleDelete}
          />
          <QuestionSection
            title="Answered"
            items={questions.filter((q) => q.answer)}
            openId={openId}
            setOpenId={setOpenId}
            loadReplies={loadReplies}
            handleDelete={handleDelete}
          />
        </aside>

        <section className="question-detail-panel">
          {questions.length === 0 ? <p className="muted">No questions yet.</p> : null}
          {questions
            .filter((q) => q.id === openId)
            .map((q) => {
              const id = String(q.id || q._id);
              const isAnswered = Boolean(q.answer);
              const questionText = q.text || q.question;

              return (
                <div key={id} className="thread question-thread-panel">
                  <div className="question-detail-header">
                    <div>
                      <h2 className="h2">{questionText}</h2>
                      <p className="muted">
                        {q.createdAt ? new Date(q.createdAt).toLocaleString() : ""}
                      </p>
                    </div>
                    <span className={`question-status-pill ${isAnswered ? "answered" : "unanswered"}`}>
                      {isAnswered ? "Answered" : "Awaiting Response"}
                    </span>
                  </div>

                  <div className="bubble student">
                    <p>{questionText}</p>
                    <small>{new Date(q.createdAt).toLocaleString()}</small>
                  </div>

                  {isAnswered && (
                    <div className="bubble teacher">
                      <p>{q.answer}</p>
                      <small>
                        {new Date(q.answeredAt || q.updatedAt).toLocaleString()}
                      </small>
                    </div>
                  )}

                  {Array.isArray(q.replies) &&
                    q.replies.map((m) => (
                      <div
                        key={m.id}
                        className={`bubble ${
                          m.authorRole === "teacher" ? "teacher" : "student"
                        }`}
                      >
                        <p>{m.text}</p>
                        <small>
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleString()
                            : ""}
                        </small>
                      </div>
                    ))}

                  <div className="question-reply-box">
                    <textarea
                      rows={3}
                      placeholder="Write a reply..."
                      value={replyDrafts[id] ?? ""}
                      onChange={(e) =>
                        setReplyDrafts((d) => ({ ...d, [id]: e.target.value }))
                      }
                    />
                    <button
                      className="button"
                      onClick={() => sendReply(id)}
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              );
            })}
        </section>
      </div>
    </div>
  );
}

function QuestionSection({ title, items, openId, setOpenId, loadReplies, handleDelete }) {
  return (
    <div className="question-section">
      <div className="question-section-title">{title}</div>
      <div className="question-list-compact">
        {items.length === 0 ? <p className="muted">None</p> : null}
        {items.map((q) => {
          const id = String(q.id || q._id);
          const isAnswered = Boolean(q.answer);
          const questionText = q.text || q.question;
          return (
            <button
              key={id}
              type="button"
              className={`question-list-card ${openId === id ? "active" : ""}`}
              onClick={async () => {
                setOpenId(id);
                await loadReplies(id);
              }}
            >
              <div className="question-list-card-top">
                <span className={`question-status-pill ${isAnswered ? "answered" : "unanswered"}`}>
                  {isAnswered ? "Answered" : "Open"}
                </span>
                <span
                  className="question-list-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(id);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  ×
                </span>
              </div>
              <div className="question-list-text">{questionText}</div>
              <div className="question-list-meta">
                {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
