import React, { useState, useEffect, useContext } from "react";
import axios from "../axios.js";
import { AuthContext } from "../AuthContext.jsx";

export default function StudentQuestions() {
  const {user} = useContext(AuthContext)
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("/questions/");
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to load questions", err);
      }
    };
    fetchQuestions
  }, [])


  // useEffect(() => {
  //   fetchQuestions();
  // }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim())  {
      alert("please enter a question");
      return
    }

    try {
      const res = await axios.post("/questions", { question: newQuestion, studentId: user?._id });
      setQuestions((prev) => [...prev, res.data]);
      setNewQuestion("")
      alert("Question Submitted successfully")
    } catch (err) {
      console.error("Failed to submit question", err);
      alert("Could Not submit question. Please try again.")
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