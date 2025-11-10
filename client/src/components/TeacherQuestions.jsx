// src/components/TeacherQuestions.jsx
import React, { useEffect, useState } from "react";
import axios from "../axios.js";
import { useLocation } from "react-router-dom";

export default function TeacherQuestions({ studentId }) {
  const [questions, setQuestions] = useState([]);
  const [drafts, setDrafts] = useState({});         // one-off “answer” drafts (existing flow)
  const [replyDrafts, setReplyDrafts] = useState({}); // threaded reply drafts per question
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [openId, setOpenId] = useState(null);

  const { search } = useLocation();
  const qsStudentId = new URLSearchParams(search).get("studentId");
  const effectiveStudentId = studentId ?? qsStudentId ?? null;

  useEffect(() => { fetchQuestions(); }, [effectiveStudentId]);

  async function fetchQuestions() {
    try {
      setLoading(true);
      setErr("");
      const url = effectiveStudentId
        ? `/questions/teacher?studentId=${effectiveStudentId}`
        : `/questions/teacher`;
      const res = await axios.get(url);

      const list = Array.isArray(res.data?.questions)
        ? res.data.questions
        : Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
        ? res.data
        : [];

      // normalize ids + ensure replies array key exists
      const norm = list.map((q) => ({
        ...q,
        id: String(q.id || q._id),
        replies: Array.isArray(q.replies) ? q.replies : [],
      }));
      setQuestions(norm);
    } catch (e) {
      console.error("Failed to load questions", e);
      setErr(e?.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  // ---- threaded replies (GET/POST) ----
  async function loadReplies(qid) {
    const idStr = String(qid);
    const { data } = await axios.get(`/questions/${idStr}/replies`);
    const replies = Array.isArray(data?.replies) ? data.replies : [];
    const shaped = replies.map((m) => ({
      id: String(m.id || m._id || m.createdAt),
      text: m.text,
      createdAt: m.createdAt,
      authorRole: m.authorRole || m.role || "student",
    }));
    setQuestions((prev) =>
      prev.map((q) => (q.id === idStr ? { ...q, replies: shaped } : q))
    );
  }

  async function sendReply(qid) {
    const idStr = String(qid);
    const text = (replyDrafts[idStr] || "").trim();
    if (!text) return;
    try {
      await axios.post(`/questions/${idStr}/replies`, { text });
      setReplyDrafts((d) => ({ ...d, [idStr]: "" }));
      await loadReplies(idStr); // refresh only this thread
    } catch (e) {
      console.error("Failed to send reply", e);
      setErr(e?.response?.data?.message || "Failed to send reply");
    }
  }

  // ---- existing single “answer” flow ----
  async function respond(id) {
    const idStr = String(id);
    const answer = (drafts[idStr] || "").trim();
    if (!answer) return;
    try {
      await axios.put(`/questions/${idStr}/respond`, { answer });
      setDrafts((d) => ({ ...d, [idStr]: "" }));
      await fetchQuestions();
    } catch (e) {
      console.error("Failed to respond", e);
      setErr(e?.response?.data?.message || "Failed to submit answer");
    }
  }

  return (
    <div className="questions-page">
      <h1>Student Questions</h1>

      {err && (
        <p className="text-red-500" style={{ marginBottom: 8 }}>
          {err}
        </p>
      )}
      {loading && <div>Loading…</div>}

      {!loading && !questions.length && (
        <p className="no-assignments">No questions yet.</p>
      )}

      <div className="questions-list">
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
                  if (next) await loadReplies(id); // lazy-load replies on open
                }}
              >
                <h3 className="q-text">{questionText}</h3>
                <span className="badge">
                  {isAnswered ? "Answered" : "Awaiting Response"}
                </span>
                <small className="ts">
                  {q.createdAt ? new Date(q.createdAt).toLocaleString() : ""}
                </small>
              </div>

              {openId === id && (
                <div className="thread">
                  {/* Original student question */}
                  <div className="bubble student">
                    <p>{questionText}</p>
                    <small>
                      {q.createdAt
                        ? new Date(q.createdAt).toLocaleString()
                        : ""}
                    </small>
                  </div>

                  {/* One-off teacher answer if you use it */}
                  {isAnswered && (
                    <div className="bubble teacher">
                      <p>{q.answer}</p>
                      <small>
                        {new Date(q.answeredAt || q.updatedAt).toLocaleString()}
                      </small>
                    </div>
                  )}

                  {/* Threaded messages */}
                  <div className="space-y-2" style={{ marginTop: 8 }}>
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
                  </div>

                  {/* Threaded reply input (teacher) */}
                  <div className="form-centered" style={{ marginTop: 10 }}>
                    <textarea
                      rows={2}
                      placeholder="Write a reply…"
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

                  {/* Legacy one-off “answer” path (keep if desired when unanswered) */}
                  {!isAnswered && (
                    <div className="form-centered" style={{ marginTop: 10 }}>
                      <textarea
                        rows={2}
                        placeholder="Type your answer…"
                        value={drafts[id] ?? ""}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [id]: e.target.value }))
                        }
                        style={{ width: "100%" }}
                      />
                      <button
                        className="button"
                        onClick={() => respond(id)}
                        style={{ marginTop: 6 }}
                      >
                        Send Answer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
