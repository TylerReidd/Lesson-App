import React, { useState, useEffect, useContext } from "react";
import axios from "../axios.js";
import { AuthContext } from "../AuthContext.jsx";

export default function StudentQuestions() {
  const {user} = useContext(AuthContext)
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [openId, setOpenId] = useState(null)
  const [loading, setLoading] = useState(false)


  const fetchQuestions = async () => {
    try {
      const res = await axios.get("/questions/me", {withCredentials:true});
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load questions", err);
    }
  };

  useEffect(() => {
  fetchQuestions()
}, [])



  const handleAsk = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      setLoading(true);
      await axios.post("/questions", { text: newQuestion}, {withCredentials:true });
      // setQuestions((prev) => [...prev, res.data]);
      setNewQuestion("")
      await fetchQuestions();
    } catch (err) {
      console.error("Failed to submit question", err);
      alert("Could Not submit question. Please try again.")
    } finally {
      setLoading(false)
    }
  };


  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to do that?")) return; 
    try {
      await axios.delete(
        `/questions/${id}`,
        {withCredentials:true}
      );
      await fetchQuestions();
    } catch (err) {
        console.error("Failed to delete question", err)
    }
  }

  
  return (
    <div className="questions-page">
      <h1>Ask a Question</h1>
      <form onSubmit={handleAsk} className="ask-form">
          <textarea
            rows={3}
            placeholder="Type your question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
        <button type="submit" disabled={loading} className="button">
          {loading ? "Submitting..." : "Submit Question"}
        </button>
      </form>

      <h2>Previous Questions</h2>
      <div className="questions-list">
        {questions.length === 0 && <p>No questions yet.</p>}
          {questions.map((q) => {
            const id = q._id || q.id;
            const isAnswered = Boolean(q.answer);
            const questionText = q.text || q.question

            return (
              <div key={id} className={`q-card ${isAnswered ? 'answered' : "unanswered"}`}>
                <div className="q-summary"
                  onClick={() => setOpenId(openId === id ? null : id)}
                >
                  <h3 className="q-text">{questionText}</h3>
                  <span className="badge">
                    {isAnswered ? "Answered" : "Awaiting Response"}
                  </span>
                  <small className="ts">
                    {new Date(q.createdAt).toLocaleString()}
                  </small>
                  <button className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(q._id || q.id);
                    }}
                  >
                     🗑️
                  </button>
                </div>

                {openId === id && (
                  <div className="thread">
                    <div className="bubble student">
                      <p>{questionText}</p>
                      <small>{new Date(q.createdAt).toLocaleString()}</small>
                    </div>
                    {isAnswered && (
                      <div className="bubble teacher">
                        <p>{q.answer}</p>
                        <small>
                          {new Date(q.answeredAt || q.updatedAt).toLocaleString()}
                        </small>
                      </div>
                    )}
                  </div>
                )}
                </div>
              )
              })}
              </div>
            </div>
            )
          }
