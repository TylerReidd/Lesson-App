import React, { useState, useEffect } from "react";
import axios from "../axios.js";

export default function StudentQuestions() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("/questions/student");
      setQuestions(res.data);
    } catch (err) {
      console.error("Failed to load questions", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!newQuestion) return;

    try {
      await axios.post("/questions", { question: newQuestion });
      setNewQuestion("");
      fetchQuestions();
    } catch (err) {
      console.error("Failed to submit question", err);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Ask a Question</h1>
        <form onSubmit={handleAsk} className="dashboard-section">
          <div className="form-group">
            <textarea
              placeholder="Type your question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="question-textarea"
            />
          </div>
          <button type="submit" className="button">
            Submit Question
          </button>
        </form>

        <h2 className="mt-4">Previous Questions</h2>
        <ul className="video-list">
          {Array.isArray(questions) && questions.length > 0 ? (
            questions.map((q) => (
              <li key={q._id}>
              <p><strong>You: </strong>{q.question}</p>
              {q.answer ?  (
              <p style={{ color: "green" }}>
                <strong>Teacher</strong> {q.answer}
              </p>
          ) : (
            <p style={{ color: "gray" }}>Awaiting Teachers response...</p>
          )}
            </li>
          ))
          ) : (
            <li>No questions Yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}