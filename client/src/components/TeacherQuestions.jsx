import React, { useState, useEffect } from "react";
import axios from "../axios.js";

export default function TeacherQuestions() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {

        const res = await axios.get("/questions/teacher", { withCredentials: true });
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to load questions", err);
      }
    };
    fetchQuestions();
  }, []);

    // inside your TeacherQuestions component, after your useState/useEffect:
    const handleAnswer = async (questionId) => {
      const answerText = answers[questionId]?.trim();
      if (!answerText) {
        return alert("Please enter an answer before submitting.");
      }

      try {
        // 1) Send the answer to your backend
        const res = await axios.put(
          `/questions/${questionId}/respond`,
          { answer: answerText },
          { withCredentials: true }
        );
        // 2) Optimistically update local UI with the returned answer
        setQuestions((qs) =>
          qs.map((q) =>
            q.id === questionId
              ? { ...q, answer: res.data.answer }
              : q
          )
        );
        // 3) Clear out the textarea for that question
        setAnswers((ans) => ({ ...ans, [questionId]: "" }));
      } catch (err) {
        console.error("Failed to submit answer:", err);
        alert("Could not submit answer—check console for details.");
      }
    };


  return (
    <div className="container">
      <div className="card">
        <h1>Student Questions</h1>
        <ul className="video-list">
          {questions.length > 0 ? (
            questions.map((q) => (
              <li key={q.id}>
                <p><strong>Q:</strong> {q.text}</p>
                <p><strong>Student:</strong> {q.student.name || "Unknown"}</p>
                {q.answer ? (
                  <p style={{ color: "green" }}>
                    <strong>Answer:</strong> {q.answer}
                  </p>
                ) : (
                  <>
                    <textarea
                      placeholder="Type your answer..."
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                      className="question-textarea"
                    />
                    <button
                      onClick={() => handleAnswer(q.id)}
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
