import React, { useState, useEffect } from "react";
import axios from "../axios.js";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {    axios
      .get("/resources/assignments", { withCredentials: true })
      .then((res) => {
        const data = Array.isArray(res.data.assignments)
          ? res.data.assignments
          : Array.isArray(res.data)
          ? res.data
          : [];
        setAssignments(data);
      })
      .catch((err) => {
        console.error("Failed to fetch assignments", err);
        setAssignments([]);
      });
  }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to do that?")) return;
    try {
      await axios.delete(
        `/resources/assignments/${id}`,
        {withCredentials: true}
      );
      setAssignments((prev) => prev.filter(a => a._id !== id && a.id !== id))
    } catch (err) {
      console.error("Delete failed", err)
      alert("Could not delete. Try again")
    }
  }

  return (
    <div className="assignments-page">
      <div className="assignment-page-header">
        <span className="hero-eyebrow">Student workspace</span>
        <h1 className="hero-title assignment-page-title">Assignment library</h1>
        <p className="hero-subtitle assignment-page-subtitle">
          Browse shared PDFs and images in a cleaner library layout instead of a simple running list.
        </p>
      </div>

      {assignments.length > 0 ? (
        <div className="assignment-grid">
          {assignments.map((a) => (
            <div key={a._id || a.id} className="assignment-card assignment-library-card">
              <button className="delete-btn" onClick={() => handleDelete(a._id || a.id)}>
                🗑️
              </button>
              <a
                href={a.url}
                target="_blank"
                rel="noopener"
                className="assignment-link assignment-library-link"
              >
                <div className="assignment-icon">📄</div>
                <div className="assignment-info">
                  <span className="assignment-title">{a.filename}</span>
                  <span className="assignment-date">
                    {a.uploadedAt
                      ? new Date(a.uploadedAt).toLocaleDateString()
                      : ""}
                  </span>
                  {a.goal?.title ? (
                    <span className="assignment-date">Lesson Lab: {a.goal.title}</span>
                  ) : null}
                </div>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-assignments">No assignments available.</p>
      )}
    </div>
  );
}
