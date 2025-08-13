// src/components/TeacherQuestions.jsx
import React, { useEffect, useState } from "react";
import axios from "../axios.js";

export default function TeacherQuestions({ studentId }) {
  const [questions, setQuestions] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setErr("");
      const url = studentId
        ? `/questions/teacher?studentId=${studentId}`
        : `/questions/teacher`;
      const res = await axios.get(url);
      const list = Array.isArray(res.data?.questions)
      ? res.data.questions
      : Array.isArray(res.data?.items)
      ? res.data.items
      : Array.isArray(res.data)
      ? res.data 
      : []
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
    // re-run whenever the selected student changes
  }, [studentId]);

  const respond = async (id) => {
    const answer = drafts[id]?.trim();
    if (!answer) return;
    try {
      await axios.put(`/questions/${id}/respond`, { answer });
      // clear draft and refresh
      setDrafts((d) => ({ ...d, [id]: "" }));
      fetchQuestions();
    } catch (e) {
      console.error("Failed to respond", e);
      setErr(e?.response?.data?.message || "Failed to submit answer");
    }
  };

  return (
    <div className="dashboard-panel">
      <h1>Student Questions</h1>

      {err && <p className="text-red-500" style={{ marginBottom: 8 }}>{err}</p>}
      {loading && <div>Loading…</div>}

      {!loading && !questions.length && (
        <div className="no-assignments">No questions yet.</div>
      )}

      <ul className="assignment-list">
        {questions.map((q) => (
          <li key={q._id} className="assignment-card" style={{ alignItems: "stretch" }}>
            <div style={{ flex: 1 }}>
              <div className="assignment-title" style={{ marginBottom: 6 }}>
                {q.text}
              </div>
              <div className="assignment-date">
                {new Date(q.createdAt).toLocaleString()}
              </div>

              {q.answer ? (
                <div className="badge" style={{ marginTop: 8 }}>
                  Answer: {q.answer}
                </div>
              ) : (
                <div className="form-centered" style={{ marginTop: 10 }}>
                  <textarea
                    rows={2}
                    placeholder="Type your answer…"
                    value={drafts[q._id] ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [q._id]: e.target.value }))
                    }
                    style={{ width: "100%" }}
                  />
                  <button
                    className="button"
                    onClick={() => respond(q._id)}
                    style={{ marginTop: 6 }}
                  >
                    Send Answer
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
