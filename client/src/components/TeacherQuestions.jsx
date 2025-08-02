import React, { useState, useEffect } from "react";
import axios from "../axios.js";

export default function TeacherQuestions() {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("/questions/teacher");
      setQuestions(res.data);
    } catch (err) {
      console.error("Failed to load questions", err);
      setError("Failed to load questions");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleRespond = async (id, answer) => {
    if (!answer) return;
    try {
      await axios.put(`/questions/${id}/respond`, { answer });
      fetchQuestions();
    } catch (err) {
      console.error("Failed to send response", err);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Student Questions</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="dashboard-section">
          {questions.length === 0 && (
            <p>No student questions available.</p>
          )}
          <ul className="video-list">
            {questions.map((q) => (
              <li key={q._id} className="question-item">
                <div>
                  <p className="video-title">
                    {q.studentEmail}: {q.question}
                  </p>
                  {q.answer && (
                    <p style={{ color: "green" }}>
                      Teacher Response: {q.answer}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <textarea
                    placeholder="Type your response..."
                    defaultValue={q.answer || ""}
                    onBlur={(e) => handleRespond(q._id || q.id, e.target.value)}
                    className="question-textarea"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}