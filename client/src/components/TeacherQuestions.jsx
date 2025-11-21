// src/components/TeacherQuestions.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "../axios.js";
import { useLocation } from "react-router-dom";

export default function TeacherQuestions({ studentId }) {
  const MAX_ATTACHMENTS = 5;
  const [questions, setQuestions] = useState([]);
  const [drafts, setDrafts] = useState({});         // one-off “answer” drafts (existing flow)
  const [replyDrafts, setReplyDrafts] = useState({}); // threaded reply drafts per question
  const [replyFiles, setReplyFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [errType, setErrType] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [dropActiveId, setDropActiveId] = useState(null);
  const fileInputRefs = useRef({});

  const { search } = useLocation();
  const qsStudentId = new URLSearchParams(search).get("studentId");
  const effectiveStudentId = studentId ?? qsStudentId ?? null;
  const isAggregatedView = !effectiveStudentId;

  useEffect(() => { fetchQuestions(); }, [effectiveStudentId]);

  async function fetchQuestions() {
    try {
      setLoading(true);
      setErr("");
      setErrType(null);
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
      setErrType("general");
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuestion(id) {
    if (!isAggregatedView) return;
    const idStr = String(id);
    if (!window.confirm("Delete this question? This cannot be undone.")) return;
    try {
      await axios.delete(`/questions/${idStr}`, { withCredentials: true });
      setQuestions((prev) => prev.filter((q) => q.id !== idStr));
    } catch (e) {
      console.error("Failed to delete question", e);
      setErr(e?.response?.data?.message || "Failed to delete question");
      setErrType("general");
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
      attachments: Array.isArray(m.attachments) ? m.attachments : [],
    }));
    setQuestions((prev) =>
      prev.map((q) => (q.id === idStr ? { ...q, replies: shaped } : q))
    );
  }

  async function sendReply(qid) {
    const idStr = String(qid);
    const text = (replyDrafts[idStr] || "").trim();
    const attachments = replyFiles[idStr] || [];
    if (!text && attachments.length === 0) {
      setErr("Add reply text or attach a file before sending.");
      setErrType("reply");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("text", text);
      attachments.forEach((file) => formData.append("attachments", file));

      await axios.post(`/questions/${idStr}/replies`, formData);
      if (errType === "reply" || errType === "attachment") {
        setErr("");
        setErrType(null);
      }
      setReplyDrafts((d) => ({ ...d, [idStr]: "" }));
      setReplyFiles((files) => ({ ...files, [idStr]: [] }));
      await loadReplies(idStr); // refresh only this thread
    } catch (e) {
      console.error("Failed to send reply", e);
      setErr(e?.response?.data?.message || "Failed to send reply");
      setErrType("general");
    }
  }

  function isAllowedFile(file) {
    if (!file) return false;
    return (
      file.type === "application/pdf" ||
      file.type.startsWith("image/")
    );
  }

  function addFilesToReply(qid, fileList) {
    const idStr = String(qid);
    if (!fileList || !fileList.length) return;

    const incoming = Array.from(fileList);
    const valid = incoming.filter(isAllowedFile);
    const hadInvalid = valid.length !== incoming.length;

    setReplyFiles((prev) => {
      const existing = prev[idStr] || [];
      const available = MAX_ATTACHMENTS - existing.length;
      if (available <= 0) {
        setErr(`You can attach up to ${MAX_ATTACHMENTS} files per reply.`);
        setErrType("attachment");
        return prev;
      }

      const toAdd = valid.slice(0, available);
      if (!toAdd.length) {
        if (hadInvalid) {
          setErr("Only images or PDFs can be attached.");
          setErrType("attachment");
        }
        return prev;
      }

      if (hadInvalid) {
        setErr("Only images or PDFs can be attached.");
        setErrType("attachment");
      } else if (valid.length > toAdd.length) {
        setErr(`Only ${MAX_ATTACHMENTS} attachments allowed per reply.`);
        setErrType("attachment");
      } else {
        if (errType === "attachment") {
          setErr("");
          setErrType(null);
        }
      }

      return {
        ...prev,
        [idStr]: [...existing, ...toAdd],
      };
    });
  }

  function removeAttachment(qid, index) {
    const idStr = String(qid);
    setReplyFiles((prev) => {
      const next = [...(prev[idStr] || [])];
      next.splice(index, 1);
      return { ...prev, [idStr]: next };
    });
  }

  function attachInputRef(id, node) {
    if (!fileInputRefs.current) fileInputRefs.current = {};
    fileInputRefs.current[id] = node;
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
      setErrType("general");
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
          const pendingFiles = replyFiles[id] || [];

          return (
            <div
              key={id}
              className={`q-card ${isAnswered ? "answered" : "unanswered"}`}
            >
              {isAggregatedView && (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    deleteQuestion(id);
                  }}
                  title="Delete question"
                >
                  ×
                </button>
              )}
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
                          {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                            <div className="message-attachments">
                              {m.attachments.map((att) => {
                                const key = `${att.url}-${att.filename}`;
                                const isImage = att.mimetype?.startsWith("image/");
                                return (
                                  <a
                                    key={key}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={isImage ? "attachment-thumb" : "attachment-link"}
                                  >
                                    {isImage ? (
                                      <img src={att.url} alt={att.filename || "Attachment"} />
                                    ) : (
                                      <>
                                        📄 {att.filename || "Attachment"}
                                      </>
                                    )}
                                  </a>
                                );
                              })}
                            </div>
                          )}
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
                    <div
                      className={`attachment-dropzone ${
                        dropActiveId === id ? "active" : ""
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDropActiveId(id);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        const nextTarget = e.relatedTarget;
                        if (
                          dropActiveId === id &&
                          (!nextTarget || !e.currentTarget.contains(nextTarget))
                        ) {
                          setDropActiveId(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDropActiveId(null);
                        addFilesToReply(id, e.dataTransfer?.files);
                      }}
                      onClick={() => fileInputRefs.current[id]?.click()}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        ref={(node) => attachInputRef(id, node)}
                        style={{ display: "none" }}
                        onChange={(e) => {
                          addFilesToReply(id, e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <p>Drag & drop images or PDFs, or click to browse.</p>
                    </div>
                    {pendingFiles.length > 0 && (
                      <ul className="attachment-preview">
                        {pendingFiles.map((file, idx) => (
                          <li key={`${file.name}-${idx}`} className="attachment-chip">
                            <span>{file.name}</span>
                            <button
                              type="button"
                              aria-label="Remove attachment"
                              onClick={() => removeAttachment(id, idx)}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
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
