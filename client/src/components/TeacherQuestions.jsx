import React, { useState, useEffect } from "react";
import axios from "../axios.js";

export default function TeacherQuestions() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [openId, setOpenId] = useState(null)
  const [loadingId, setLoadingId] = useState(null)


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
      setLoadingId(questionId)
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
      } finally {
        setLoadingId(null)
      }
    };


  return (
    <div className="questions-page">
      <h1>Student Questions</h1>
        <div className="question-list">
          {questions.length === 0 && <p>No questions from students yet.</p>}
            {questions.map((q) => {
              const id = q._id || q.id;
              const isAnswered = Boolean(q.answer)
              const questionText = q.text || q.question

              return (
                <div 
                  ley={id}
                  className={`q-card ${isAnswered ? 'answered' : 'unanswered'}`}
                  >
                    <div
                      className="q-summary"
                      onClick={() => setOpenId(openId === id ? null : id)}
                    >
                      <h3 className="q-text">{questionText}</h3>
                      <span className="badge">
                        {isAnswered ? 'Answered' : 'Awaiting response...'}
                      </span>
                      <small className="ts">
                        {new Date(q.createdAt).toLocaleString()}
                      </small>
                    </div>

                    {openId === id && (
                      <div className="thread">
                        <div className="bubble student">
                          <p>{questionText}</p>
                          <small>{new Date(q.createdAt).toLocaleString()}</small>
                        </div>
                        {isAnswered ? (
                          <div className="bubble teacher">
                            <p>{q.answer}</p>
                            <small>
                              {new Date(q.answeredAt || q.updatedAt).toLocaleString()}
                            </small>
                          </div>
                        ) : (
                          <div className="bubble teacher">
                            <textarea 
                              placeholder="Type your answer..."  
                              value={answers[id] || ''}
                              className="question-textarea"
                              onChange={(e) => {
                                setAnswers((ans) => ({...ans, [id]: e.target.value}))}
                              }
                               />
                               <button
                                onClick={() => handleAnswer(id)}
                                disabled={loadingId === id}
                                className="button"
                               >
                                {loadingId === id ? 'Submitting...': 'Submit Answer'}
                               </button>
                            </div>
                        )}
                      </div>
                    )}
                  </div>
              )
            })}
        </div>
    </div>
  );
}
