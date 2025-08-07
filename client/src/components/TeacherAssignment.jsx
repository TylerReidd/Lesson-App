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
    <div className="container">
      <div className="card">
        <h1>Manage Assignments (PDF)</h1>

        {/* Upload Section */}
        <div className="dashboard-section">
          {pdfErr && <p style={{ color: "red" }}>{pdfErr}</p>}
          {pdfMsg && <p style={{ color: "green" }}>{pdfMsg}</p>}

          <form onSubmit={handlePdfUpload}>
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
          <ul className="video-list">
            {assignments.map((f) => (
              <li key={f._id}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-title"
                >
                  {f.filename}
                </a>
                <span className="text-sm text-gray-500 ml-2">
                  {new Date(f.uploadedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(f._id)}
                  className="button-logout"
                  style={{ padding: "4px 8px", marginLeft: "8px" }}
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