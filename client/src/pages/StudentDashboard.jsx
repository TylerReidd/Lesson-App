import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { FiEdit2, FiFileText, FiBookOpen } from 'react-icons/fi';

export default function StudentDashboard() {
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [assignError, setAssignError] = useState('');
  const [privateVideos, setPrivateVideos] = useState([]);
  const [videoError, setVideoError] = useState('')

  useEffect(() => {
    axios.get('/questions/me').then(res => setQuestions(res.data.questions))
      .catch(() => setError('Couldn’t load questions'));
    axios.get('/resources/assignments').then(res => setAssignments(res.data.assignments))
      .catch(() => setAssignError('Couldn’t load assignments'));

    axios.get('/resources/videos/private')
    .then(res => setPrivateVideos(res.data.videos))
    .catch(() => setVideoError('Failed to load your videos'))


  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!text.trim()) return setError('Please enter a question');
    setError(''); setSuccess('');
    try {
      const res = await axios.post('/questions', { text });
      setSuccess(res.data.message || 'Question submitted');
      setQuestions(prev => [res.data.question, ...prev]);
      setText('');
    } catch {
      setError('Submission failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-indigo-600">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome! Manage your questions and access assignments here.</p>
        </header>

        {/* Question Form */}
        <section className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FiEdit2 className="text-indigo-500 w-6 h-6 mr-2" />
            <h2 className="text-2xl font-semibold">Ask a Question</h2>
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          {success && <p className="text-green-500 mb-2">{success}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Type your question here..."
            />
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              Submit Question
            </button>
          </form>
        </section>

        {/* Your Questions */}
        <section className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FiBookOpen className="text-indigo-500 w-6 h-6 mr-2" />
            <h2 className="text-2xl font-semibold">Your Questions</h2>
          </div>
          {questions.length === 0 ? (
            <p className="text-gray-500">No questions posted yet.</p>
          ) : (
            <ul className="space-y-4">
              {questions.map(q => (
                <li key={q._id} className="border-l-4 border-indigo-300 bg-indigo-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-800">{q.text}</p>
                  {q.answer ? (
                    <p className="mt-2 text-green-700">Answer: {q.answer}</p>
                  ) : (
                    <p className="mt-2 text-gray-600 italic">Pending answer...</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Assignments */}
        <section className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FiFileText className="text-indigo-500 w-6 h-6 mr-2" />
            <h2 className="text-2xl font-semibold">Your Assignments</h2>
          </div>
          {assignError && <p className="text-red-500 mb-2">{assignError}</p>}
          {assignments.length === 0 ? (
            <p className="text-gray-500">No assignments available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assignments.map(a => (
                <a
                  key={a._id}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center border border-gray-200 hover:border-indigo-300 p-4 rounded-lg bg-gray-50 hover:bg-white transition"
                >
                  <FiFileText className="w-5 h-5 text-indigo-500 mr-3" />
                  <span className="text-gray-800">{a.filename}</span>
                </a>
              ))}
            </div>
          )}
        </section>


        <section>
        <h2 className="text-2xl font-semibold mb-2">Your Videos</h2>
        {videoError && <p className="text-red-500">{videoError}</p>}

        {privateVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {privateVideos.map(v => (
              <video
                key={v._id}
                controls
                src={v.url}
                className="w-full rounded shadow"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No videos available yet.</p>
        )}
      </section>
      </div>
    </div>
  );
}
