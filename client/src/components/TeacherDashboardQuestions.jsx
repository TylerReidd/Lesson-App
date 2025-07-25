import React, {useState, useEffect, useContext} from 'react'
import axios from '../axios.js';
import { AuthContext } from '../AuthContext.jsx'



export default function TeacherDashboardQuestions() {
  const {user, loading} = useContext(AuthContext)
  const [questions, setQuestions] = useState([])

  const fetchQuestions = async () => {
    try {
      const {data} = await axios.get(
        '/questions/teacher',
        {withCredentials: true}
      );
      setQuestions(data)
    } catch(err) {
      console.error('Failed to load questions', err)
    }
  } 

  useEffect(() => {
    if(!loading && user.role === 'teacher') {
      fetchQuestions()
    }
  }, [loading, user])

  const sendResponse = async (questionId, answerText) => {
    try {
      await axios.put(
        `/questions/${questionId}/respond`,
        {answer: answerText},
        {withCredentials: true}
      )
      fetchQuestions()
    } catch (err) {
      console.error("fauled to send response:", err)
    }
  }

  if (loading) return <div>Loading questions</div>;
  if(user.role !== 'teacher') return null;


  return (
    <div>
      <h2>Student Q&amp;A</h2>
      {questions.length === 0 ? (
        <p>No questions yet</p>
      ): (
        questions.map(q => (
          <div key={q.id} >
            <p>
              <strong>{q.student.name} asks</strong> {q.text}
            </p>

            {q.answer ? (
              <p><strong>Your Answer:</strong>{q.answer} </p>
            ) : (
              <form onSubmit={e => {
                e.preventDefault()
                const answer = e.target.elements.answer.value;
                sendResponse(q.id, answer)
                e.target.reset()
              }}
              className=''
              >
                <textarea name='answer' placeholder='type your response...' required  />
                <button type='submit' className='button'>Send Response</button>
              </form>
            )}
          </div>
        ))
      )}
    </div>
  )
}