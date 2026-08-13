// src/components/TeacherAssignments.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../axios.js";

export default function TeacherAssignments({ studentId, defaultRecipientEmail }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfEmail, setPdfEmail] = useState("");
  const [pdfErr, setPdfErr] = useState("");
  const [pdfMsg, setPdfMsg] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);

  const { search } = useLocation();
  const qsStudentId = new URLSearchParams(search).get("studentId");
  const effectiveStudentId = studentId ?? qsStudentId ?? null;

  const fetchAssignments = async () => {
    try {
      const url = effectiveStudentId
        ? `/resources/assignments?studentId=${effectiveStudentId}`
        : `/resources/assignments`;
      const res = await axios.get(url);
      const list = Array.isArray(res.data?.assignments)
        ? res.data.assignments
        : Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
        ? res.data
        : [];
      setAssignments(
        list.map((a) => ({
          id: a.id || a._id,
          filename: a.filename,
          url: a.url || a.path,
          uploadedAt: a.uploadedAt || a.createdAt,
          owner: a.owner,
          recipient: a.recipient,
        }))
      );
    } catch (err) {
      console.error("Failed to load assignments", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    axios
      .get("/auth/me")
      .then(({ data }) => {
        const id = data.id ?? data._id ?? data.user?.id ?? data.user?._id;
        const role = data.role ?? data.user?.role;
        setUser(id ? { id, role } : null);
      })
      .catch(() => setUser(null));
  }, [effectiveStudentId]);

  useEffect(() => {
    if (defaultRecipientEmail) setPdfEmail(defaultRecipientEmail);
  }, [defaultRecipientEmail]);

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    setPdfErr("");
    setPdfMsg("");

    if (!pdfFile) return setPdfErr("Select a file to upload");
    const isValidType =
      pdfFile.type === "application/pdf" || pdfFile.type.startsWith("image/");
    if (!isValidType) {
      return setPdfErr("Only PDF or common image files can be uploaded.");
    }
    if (!effectiveStudentId && !pdfEmail)
      return setPdfErr("Enter student email (or pick a student)");

    try {
      // resolve target student
      let targetId = effectiveStudentId;
      if (!targetId) {
        const { data: student } = await axios.get("/auth/user", {
          params: { email: pdfEmail },
        });
        targetId = student._id;
      }

      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("recipient", targetId);

      const res = await axios.post("/resources/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPdfMsg(res.data.message || "Upload complete");
      setPdfFile(null);
      if (!effectiveStudentId) setPdfEmail("");
      await fetchAssignments();
    } catch (err) {
      console.error("PDF upload failed", err.response?.data || err);
      setPdfErr(err.response?.data?.error || "Upload failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await axios.delete(`/resources/assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      console.error("Failed to delete assignment", err);
    }
  };

  return (
    <div className="assignments-page">
      <div className="assignment-page-header">
        <span className="hero-eyebrow">Student workspace</span>
        <h1 className="hero-title assignment-page-title">Assignment library</h1>
        <p className="hero-subtitle assignment-page-subtitle">
          Upload PDFs or images, keep them centered, and review shared materials in a cleaner library view.
        </p>
      </div>

      <section className="panel assignment-upload-panel">
        <div className="panel-h">Upload Assignment</div>
        <div className="panel-b">
          <form onSubmit={handlePdfUpload} className="assignment-upload-form">
            {pdfErr && <p className="form-note error">{pdfErr}</p>}
            {pdfMsg && <p className="form-note success">{pdfMsg}</p>}

            <label className="field">
              <span>Select PDF or image</span>
              <input
                className="input-lg"
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
            </label>

            <div className="assignment-upload-actions">
              <button type="submit" className="button">
                Upload File
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="assignment-library">
        <h2>Uploaded Assignments</h2>
        {assignments.length > 0 ? (
          <div className="assignment-grid">
            {assignments.map((f) => {
              const id = f.id || f._id;
              const canDelete =
                user?.role === "teacher" ||
                String(f.owner) === String(user?.id) ||
                String(f.recipient) === String(user?.id);

              return (
                <div key={id} className="assignment-card assignment-library-card">
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(id)}
                      className="delete-btn"
                      aria-label="Delete Assignment"
                    >
                      🗑️
                    </button>
                  )}
                  <a
                    href={f.url || f.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="assignment-link assignment-library-link"
                  >
                    <div className="assignment-icon">📄</div>
                    <div className="assignment-info">
                      <span className="assignment-title">
                        {f.filename || f.title || "Assignment"}
                      </span>
                      <span className="assignment-date">
                        {new Date(f.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-assignments">No assignments yet.</p>
        )}
      </div>
    </div>
  );
}
