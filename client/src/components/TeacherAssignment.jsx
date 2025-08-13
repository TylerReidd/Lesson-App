// src/components/TeacherAssignment.jsx
import React, { useState, useEffect } from "react";
import axios from "../axios.js";

export default function TeacherAssignments({ studentId, defaultRecipientEmail }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfEmail, setPdfEmail] = useState("");
  const [pdfErr, setPdfErr] = useState("");
  const [pdfMsg, setPdfMsg] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);

  const fetchAssignments = async () => {
    try {
      const url = studentId
        ? `/resources/assignments?studentId=${studentId}`
        : `/resources/assignments`;
      const res = await axios.get(url);
      const list = Array.isArray(res.data?.assignments) ? res.data.assignments 
                                                        : Array.isArray(res.data?.items)
                                                        ? res.data.items 
                                                        : Array.isArray(res.data)
                                                        ? res.data 
                                                        : []
      setAssignments(list.map(a =>({
        id: a.id || a._id,
        filename: a.filename,
        url: a.url || a.path,
        uploadedAt: a.uploadedAt || a.createdAt,
        owner: a.owner,
        recipient: a.recipient
    })));
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
  }, [studentId]);

  // Optional UX: prefill email when a student is selected
  useEffect(() => {
    if (defaultRecipientEmail) setPdfEmail(defaultRecipientEmail);
  }, [defaultRecipientEmail]);

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    setPdfErr("");
    setPdfMsg("");

    if (!pdfFile) return setPdfErr("Select a PDF");
    if (!studentId && !pdfEmail) return setPdfErr("Enter student email (or pick a student)");

    try {
      // Resolve recipient target id
      let targetId = studentId;
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
      if (!studentId) setPdfEmail(""); // keep email field if using selection
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
    <div className="content">
      <div className="dashboard-panel">
        <h1>Manage Assignments (PDF)</h1>

        {/* Upload Section */}
        <div className="dashboard-section">
          <form onSubmit={handlePdfUpload} className="form-centered">
            {pdfErr && <p style={{ color: "red" }}>{pdfErr}</p>}
            {pdfMsg && <p style={{ color: "green" }}>{pdfMsg}</p>}

            <div>
              <label>Student Email</label>
              <input
                type="email"
                value={pdfEmail}
                onChange={(e) => setPdfEmail(e.target.value)}
                placeholder="student@example.com"
                disabled={!!studentId} // if a student is selected, no email needed
              />
            </div>

            <div style={{ marginLeft: "50px" }}>
              <label style={{ marginLeft: "90px" }}>Select Your PDF:</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
            </div>

            <button type="submit" className="button">Upload PDF</button>
          </form>
        </div>

        {/* Assignments List */}
        <div className="dashboard-section">
          <h2>Uploaded Assignments</h2>
          <ul className="assignment-list">
            {assignments.map((f) => {
              const id = f.id || f._id;
              const canDelete =
                user?.role === "teacher" ||
                String(f.owner) === String(user?.id) ||
                String(f.recipient) === String(user?.id);

              return (
                <li key={id} className="assignment-card">
                  <a
                    href={f.url || f.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="assignment-link"
                  >
                    <span className="assignment-icon">📄</span>
                    <div className="assignment-info">
                      <span className="assignment-title">{f.filename || f.title || "Assignment"}</span>
                      <span className="assignment-date">
                        {new Date(f.uploadedAt || f.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </a>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(id)}
                      className="delete-btn"
                      aria-label="Delete Assignment"
                    >
                      Delete
                    </button>
                  )}
                </li>
              );
            })}
            {!assignments.length && <div className="no-assignments">No assignments yet.</div>}
          </ul>
        </div>
      </div>
    </div>
  );
}
