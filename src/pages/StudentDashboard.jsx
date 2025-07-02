import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments]   = useState([]);
  const [publicVideos, setPublicVideos] = useState([]);
  const [privateVideos, setPrivateVideos] = useState([]);
  const [questions, setQuestions]       = useState([]);
  const [newQuestion, setNewQuestion]   = useState('');
  const [error, setError]               = useState('');
  
  // Load all data
  useEffect(() => {
    // 1) Assignments
    axios.get('/assignments/my')
      .then(res => setAssignments(res.data))
      .catch(() => console.error('Failed to load assignments'));

    // 2) Public videos
    axios.get('/videos/public')
      .then(res => setPublicVideos(res.data))
      .catch(() => console.error('Failed to load public videos'));

    // 3) Private videos
    axios.get('/videos/private')
      .then(res => setPrivateVideos(res.data))
      .catch(() => console.error('Failed to load private videos'));

    // 4) Q&A
    axios.get('/questions/my')
      .then(res => setQuestions(res.data))
      .catch(() => console.error('Failed to load questions'));
  }, []);

  // Submit a new question
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      setError('Question cannot be empty');
      return;
    }
    try {
      await axios.post('/questions', { text: newQuestion });
      // refresh
      const { data } = await axios.get('/questions/my');
      setQuestions(data);
      setNewQuestion('');
      setError('');
    } catch {
      setError('Failed to post question');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>

      {/* Assignments */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Your Assignments & Notes</h2>
        <ul className="list-disc list-inside space-y-1">
          {assignments.length
            ? assignments.map(a => (
                <li key={a._id}>{a.content}</li>
              ))
            : <li className="text-gray-500">No assignments yet.</li>
          }
        </ul>
      </section>

      {/* Public Videos */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Videos for Everyone</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publicVideos.map(v => (
            <video key={v._id} controls className="w-full rounded shadow">
              <source src={`http://localhost:5001/${v.path}`} type="video/mp4" />
            </video>
          ))}
          {!publicVideos.length && (
            <p className="text-gray-500">No public videos yet.</p>
          )}
        </div>
      </section>

      {/* Private Videos */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Your Private Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {privateVideos.map(v => (
            <video key={v._id} controls className="w-full rounded shadow">
              <source src={`http://localhost:5001/${v.path}`} type="video/mp4" />
            </video>
          ))}
          {!privateVideos.length && (
            <p className="text-gray-500">No private videos yet.</p>
          )}
        </div>
      </section>

      {/* Q&A Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Q&amp;A with Your Teacher</h2>

        <form onSubmit={handleQuestionSubmit} className="space-y-2">
          <textarea
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            rows={3}
            placeholder="Ask your question here..."
            className="w-full border rounded p-2"
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Question
          </button>
        </form>

        <ul className="space-y-4">
          {questions.map(q => (
            <li key={q._id} className="border rounded p-3">
              <p className="font-medium">{q.text}</p>
              {q.response
                ? <p className="mt-2 text-green-700">Teacher: {q.response}</p>
                : <p className="mt-2 text-gray-500 italic">No response yet.</p>
              }
            </li>
          ))}
          {!questions.length && (
            <p className="text-gray-500">You haven’t asked any questions yet.</p>
          )}
        </ul>
      </section>
    </div>
  );
};

export default StudentDashboard;