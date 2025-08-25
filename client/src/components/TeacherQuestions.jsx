// src/components/TeacherQuestions.jsx
import React, { useEffect, useState } from "react";
import axios from "../axios.js";
import { useLocation } from "react-router-dom";

export default function TeacherQuestions({ studentId }) {
  const [questions, setQuestions] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { search } = useLocation();
  const qsStudentId = new URLSearchParams(search).get("studentId");
  const [openId, setOpenId] = useState(null);
  const effectiveStudentId = studentId ?? qsStudentId ?? null;

  const fetchQuestions = async () => {
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
      setQuestions(list);
    } catch (e) {
      console.error("Failed to load questions", e);
      setErr(e?.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [effectiveStudentId]);

  const respond = async (id) => {
    const answer = drafts[id]?.trim();
    if (!answer) return;
    try {
      await axios.put(`/questions/${id}/respond`, { answer });
      setDrafts((d) => ({ ...d, [id]: "" }));
      fetchQuestions();
    } catch (e) {
      console.error("Failed to respond", e);
      setErr(e?.response?.data?.message || "Failed to submit answer");
    }
  };

  return (
    <div className="questions-page">
      <h1>Student Questions</h1>

      {err && <p className="text-red-500" style={{ marginBottom: 8 }}>{err}</p>}
      {loading && <div>Loading…</div>}

      {!loading && !questions.length && (
        <p className="no-assignments">No questions yet.</p>
      )}

      <div className="questions-list">
        {questions.map((q) => {
          const id = q._id || q.id;
          const isAnswered = Boolean(q.answer);
          const questionText = q.text || q.question;

          return (
            <div
              key={id}
              className={`q-card ${isAnswered ? "answered" : "unanswered"}`}
            >
              <div
                className="q-summary"
                onClick={() => setOpenId(openId === id ? null : id)}
              >
                <h3 className="q-text">{questionText}</h3>
                <span className="badge">
                  {isAnswered ? "Answered" : "Awaiting Response"}
                </span>
                <small className="ts">
                  {new Date(q.createdAt).toLocaleString()}
                </small>
              </div>

              {openId === id && (
                <div className="thread">
                  {/* Student’s original question */}
                  <div className="bubble student">
                    <p>{questionText}</p>
                    <small>{new Date(q.createdAt).toLocaleString()}</small>
                  </div>

                  {/* Teacher’s answer if present */}
                  {isAnswered && (
                    <div className="bubble teacher">
                      <p>{q.answer}</p>
                      <small>
                        {new Date(q.answeredAt || q.updatedAt).toLocaleString()}
                      </small>
                    </div>
                  )}

                  {/* Answer form if not answered */}
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
