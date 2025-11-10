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
    <form onSubmit={handleSubmit} className="form" style={{ marginBottom: 16 }}>
      <h3 style={{ margin: "0 0 8px" }}>Link a Student by Email</h3>
      <input
        type="email"
        className="input"
        style={{ width: "25%", border: "1px solid #ccc", padding: "8px", margin: "auto" }}
        placeholder="student@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {error && <p style={{ color: "red", margin: "4px 0" }}>{error}</p>}
      {success && <p style={{ color: "green", margin: "4px 0" }}>{success}</p>}
      <button type="submit" className="button-primary" 
        style={{width: '25%', margin:'auto'}}
      disabled={loading}>
        {loading ? "Linking..." : "Link Student"}
      </button>
    </form>
  );
}
