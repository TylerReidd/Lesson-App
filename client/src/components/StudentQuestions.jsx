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
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const res = await axios.get("/questions/me", { withCredentials: true });
      const items = (res.data || []).map((q) => ({
        ...q,
        id: String(q.id || q._id),
        replies: Array.isArray(q.replies) ? q.replies : [],
      }));
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
      <h1>Ask a Question</h1>

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

      <h2>Previous Questions</h2>
      <div className="questions-list">
        {questions.length === 0 && <p>No questions yet.</p>}

        {questions.map((q) => {
          const id = String(q.id || q._id);
          const isAnswered = Boolean(q.answer);
          const questionText = q.text || q.question;

          return (
            <div
              key={id}
              className={`q-card ${isAnswered ? "answered" : "unanswered"}`}
            >
              <div
                className="q-summary"
                onClick={async () => {
                  const next = openId === id ? null : id;
                  setOpenId(next);
                  if (next) await loadReplies(id);
                }}
              >
                <h3 className="q-text">{questionText}</h3>
                <span className="badge">
                  {isAnswered ? "Answered" : "Awaiting Response"}
                </span>
                <small className="ts">
                  {new Date(q.createdAt).toLocaleString()}
                </small>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(id);
                  }}
                >
                  🗑️
                </button>
              </div>

              {openId === id && (
                <div className="thread">
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

                  <div className="form-centered" style={{ marginTop: 10 }}>
                    <textarea
                      rows={2}
                      placeholder="Write a reply..."
                      value={replyDrafts[id] ?? ""}
                      onChange={(e) =>
                        setReplyDrafts((d) => ({ ...d, [id]: e.target.value }))
                      }
                      style={{ width: "100%" }}
                    />
                    <button
                      className="button"
                      onClick={() => sendReply(id)}
                      style={{ marginTop: 6 }}
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
