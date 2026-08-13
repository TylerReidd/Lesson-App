import React, { useState } from "react";
import axios from "../axios.js";

export default function TeacherLinkStudentForm({ onLinked }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await axios.post(
        "/teacher/students/link",
        { studentEmail: email },
        { withCredentials: true }
      );
      setSuccess(data?.message || "Student linked!");
      setEmail("");
      onLinked?.(data?.student);
    } catch (err) {
      console.error("Teacher link error:", err);
      setError(err.response?.data?.message || "Failed to link student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form student-link-card">
      <div className="dashboard-copy">
        <span className="hero-eyebrow">Invite by email</span>
        <h3 className="h2">Link a student</h3>
        <p className="muted">Add a student with the email address they used to create their account.</p>
      </div>

      <label className="field">
        <span>Email address</span>
        <input
          type="email"
          className="input"
          placeholder="student@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      {error && <p className="form-note error">{error}</p>}
      {success && <p className="form-note success">{success}</p>}

      <div className="students-actions">
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? "Linking..." : "Link Student"}
        </button>
      </div>
    </form>
  );
}
