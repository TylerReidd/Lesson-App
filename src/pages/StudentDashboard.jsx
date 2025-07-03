import React, { useState, useEffect } from 'react';
import axios from '../axios';

export default function StudentDashboard() {
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [assignments, setAssignments] = useState([]);
  const[assignError, setAssignError] = useState('')

  // Fetch student's own questions on mount
  useEffect(() => {
    //fetch questions
    axios
      .get('/questions/me', { withCredentials: true })
      .then(res => setQuestions(res.data.questions))
      .catch(() => setError('Failed to load questions'));

      // fetch assignments
      axios.get('resources/assignments', {withCredentials: true})
      .then(res => (setAssignments(res.data.assignments)))
      .catch(() => {setAssignError("failed to load assignments")})
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!text.trim()) {
      setError('Please enter a question before submitting');
      return;
    }
    try {
      const res = await axios.post(
        '/questions',
        { text },
        { withCredentials: true }
      );
      setSuccess(res.data.message || 'Question posted');
      setQuestions(prev => [res.data.question, ...prev]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post question');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>

      {/* Question posting form */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Post a Question</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            className="w-full border rounded p-2"
            placeholder="Type your question here..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit Question
          </button>
        </form>
      </section>

      {/* Questions list */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Your Questions</h2>
        {questions.length === 0 ? (
          <p className="text-gray-500">You haven't posted any questions yet.</p>
        ) : (
          <ul className="space-y-4">
            {questions.map(q => (
              <li key={q._id} className="border-b pb-2">
                <p className="font-medium">{q.text}</p>
                {q.answer ? (
                  <p className="mt-1 text-green-700">Answer: {q.answer}</p>
                ) : (
                  <p className="mt-1 text-gray-600 italic">Pending answer...</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className='bg-white p-4 rounded shadow'>
        <h2 className='text-xl font-semibold mb-2'>Your Assignments</h2>
        {assignError && <p classname="text-red-500 mb-2">{assignError}</p>}
        {assignments.length === 0 ? (
          <p classname="text-gray-500">No assignments available.</p>
        ) : (
          <ul className='space-y-2'>
            {assignments.map(a => (
              <li key={a._id}>
                <a
                  href={a.url}
                  target='blank'
                  rel="noopener noreferrer"
                  className='text-blue-600 underline'
                  >
                    {a.filename|| "View Assignment"}
                  </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
