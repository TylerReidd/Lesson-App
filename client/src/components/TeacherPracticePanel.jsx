// src/components/TeacherPracticePanel.jsx
import React, { useEffect, useState } from "react";
import axios from "../axios.js";

export default function TeacherPracticePanel({ studentId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [reviewDraft, setReviewDraft] = useState({}); // { [logId]: { status, teacherComment } }

  useEffect(() => {
    if (!studentId) return;
    fetchLogs(studentId);
  }, [studentId]);

  async function fetchLogs(sid) {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(`/practice/teacher/${String(sid)}`, {
        withCredentials: true,
      });
      const list = Array.isArray(res.data?.logs) ? res.data.logs : [];
      setLogs(list);
      // server may clear unread after fetch (recommended)
    } catch (e) {
      console.error("Failed to load practice logs", e);
      setErr(e?.response?.data?.message || "Failed to load practice logs");
    } finally {
      setLoading(false);
    }
  }

  async function submitReview(logId) {
    const body = reviewDraft[logId] || {};
    try {
      await axios.put(`/practice/${String(logId)}/review`, body, {
        withCredentials: true,
      });
      // Refresh list after review
      await fetchLogs(studentId);
      setReviewDraft((d) => ({
        ...d,
        [logId]: { status: "", teacherComment: "" },
      }));
    } catch (e) {
      console.error("Failed to submit review", e);
      setErr(e?.response?.data?.message || "Failed to submit review");
    }
  }

  if (!studentId) return <div>Select a student to view practice logs.</div>;

  return (
    <div className="practice-panel">
      <h2 className="text-xl font-semibold">Practice Logs</h2>
      {err && <p className="text-red-600 mb-2">{err}</p>}
      {loading && <p>Loading…</p>}
      {!loading && logs.length === 0 && <p>No logs yet.</p>}

      <div className="practice-log-list">
        {logs.map((log) => {
          const id = String(log._id || log.id);
          const rd = reviewDraft[id] || {
            status: log.status || "submitted",
            teacherComment: "",
          };

          return (
            <div key={id} className="practice-log">
              <div className="practice-log-head">
                <div className="practice-log-meta">
                  <div className="font-semibold">
                    {new Date(log.date).toLocaleDateString()}
                    {" · "}
                    {log.durationMin} min
                  </div>
                  <div className="practice-log-details">
                    <>
                      {log.clipTitle && (
                        <>
                          <strong>Clip:</strong> {log.clipTitle}
                        </>
                      )}
                      {log.focus && (
                        <>
                          {log.clipTitle ? " - " : ""}
                          <strong>Focus:</strong> {log.focus}
                        </>
                      )}
                      {log.wins && (
                        <>
                          {" - "}
                          <strong>Wins:</strong> {log.wins}
                        </>
                      )}
                      {log.struggles && (
                        <>
                          {" - "}
                          <strong>Struggles:</strong> {log.struggles}
                        </>
                      )}
                      {log.notes && (
                        <>
                          {" - "}
                          <strong>Notes:</strong> {log.notes}
                        </>
                      )}
                    </>
                  </div>
                  {log.metronome && (
                    <div className="text-xs text-slate-500">
                      Metronome: {log.bpm ? `${log.bpm} bpm` : "on"}
                    </div>
                  )}
                  <div>
                    Status:{" "}
                    <span className="font-semibold">
                      {log.status || "submitted"}
                    </span>
                    {log.goal?.title ? ` · Lesson Lab: ${log.goal.title}` : ""}
                    {log.teacherComment
                      ? ` · Comment: ${log.teacherComment}`
                      : ""}
                  </div>
                </div>
                <div className="muted">
                  {log.start ? new Date(log.start).toLocaleTimeString() : ""} –{" "}
                  {log.end ? new Date(log.end).toLocaleTimeString() : ""}
                </div>
              </div>

              {log.clipUrl ? (
                <div className="practice-clip-review">
                  <audio controls src={log.clipUrl} className="practice-clip-player">
                    Your browser does not support audio playback.
                  </audio>
                  <div className="quiz-library-meta">
                    {log.clipDurationSec ? <span>{log.clipDurationSec}s</span> : null}
                    {log.clipFilename ? <span>{log.clipFilename}</span> : null}
                    {log.goal?.title ? <span>Lesson Lab: {log.goal.title}</span> : null}
                  </div>
                </div>
              ) : null}

              <div className="practice-review md:grid-cols-3">
                <select
                  className="select"
                  value={rd.status}
                  onChange={(e) =>
                    setReviewDraft((d) => ({
                      ...d,
                      [id]: { ...rd, status: e.target.value },
                    }))
                  }
                >
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                </select>
                <input
                  className="input"
                  type="text"
                  placeholder="Add a short comment"
                  value={rd.teacherComment || ""}
                  onChange={(e) =>
                    setReviewDraft((d) => ({
                      ...d,
                      [id]: { ...rd, teacherComment: e.target.value },
                    }))
                  }
                />
                <button
                  className="button-primary"
                  onClick={() => submitReview(id)}
                >
                  Save Review
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
