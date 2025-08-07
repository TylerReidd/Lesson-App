import React, { useState, useEffect } from "react";
import axios from "../axios.js";

export default function TeacherAssignments() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfEmail, setPdfEmail] = useState("");
  const [pdfErr, setPdfErr] = useState("");
  const [pdfMsg, setPdfMsg] = useState("");
  const [assignments, setAssignments] = useState([]);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get("/resources/assignments", {withCredentials:true});
      setAssignments(res.data.assignments);
    } catch (err) {
      console.error("Failed to load assignments", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile || !pdfEmail) return setPdfErr("All fields required");


    const {data: student} = await axios.get(
      '/auth/user',
      {params: {email: pdfEmail}, withCredentials: true}
    )
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("recipient", student._id);

    try {
      const res = await axios.post("/resources/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPdfMsg(res.data.message);
      setPdfErr("");
      setPdfFile(null);
      setPdfEmail("");
      fetchAssignments();
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

          <form onSubmit={handlePdfUpload} className="ask-form">
            {pdfErr && <p style={{ color: "red" }}>{pdfErr}</p>}
            {pdfMsg && <p style={{ color: "green" }}>{pdfMsg}</p>}
            <div className="form-group">
              <label>Student Email</label>
              <input
                type="email"
                value={pdfEmail}
                onChange={(e) => setPdfEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Select PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
            </div>
            <button type="submit" className="button">
              Upload PDF
            </button>
          </form>
        </div>

        {/* Assignments List */}
        <div className="dashboard-section">
          <h2>Uploaded Assignments</h2>
          <ul className="assignment-list">
            {assignments.map((f) => (
              <li key={f._id} className="assignment-card">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="assignment-link"
                >
                  <span className="assignment-icon">"📄</span>
                  <div className="assignment-info">
                    <span className="assignment-title">{f.filename}</span>
                    <span className="assignment-date">
                      {new Date(f.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </a>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="delete-btn"
                  aria-lable="Delete assignment"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}