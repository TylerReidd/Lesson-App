import React, { useState, useEffect } from "react";
import axios from "../axios.js";

export default function TeacherQuestions() {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("/questions");
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to load questions", err);
      }
    };
    fetchQuestions();
  }, [])


const handleAnswer = async (questionId) => {
  if(!answers[questionId]?.trim()) {
    alert("enter an answer");
    return 
  }

  try {
    const res = await axios.put(`/questions/${questionId}/respond`, {
      answer: answers[questionId],
    })

    setQuestions((prev) => 
      prev.map((q) => 
        q._id === questionId ? {...q, answer: res.data.answer} : q 
        )
      )
      alert("Answer submitted successfully");
  } catch (err) {
    console.error("Failed to submit each answer",err)
    alert("Could not submit answer. Try again")
  }
}
      return (
        <div className="container">
          <div className="card">
            <h1>Student Questions</h1>
            <ul className="video-list">
              {Array.isArray(questions) && questions.length > 0 ? (
                questions.map((q) => (
                  <li key={q._id}>
                    <p><strong>Q:</strong> {q.question}</p>
                    <p>
                      <strong>Student:</strong> {q.studentName || "Unknown"}
                    </p>
    
                    {q.answer ? (
                      <p style={{ color: "green" }}>
                        <strong>Answer:</strong> {q.answer}
                      </p>
                    ) : (
                      <>
                        <textarea
                          placeholder="Type your answer..."
                          value={answers[q._id] || ""}
                          onChange={(e) =>
                            setAnswers({ ...answers, [q._id]: e.target.value })
                          }
                          className="question-textarea"
                        />
                        <button
                          onClick={() => handleAnswer(q._id)}
                          className="button"
                        >
                          Submit Answer
                        </button>
                      </>
                    )}
                  </li>
                ))
              ) : (
                <li>No questions from students yet.</li>
              )}
            </ul>
          </div>
        </div>
      );
}