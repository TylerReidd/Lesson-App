import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { FiEdit2, FiFileText, FiBookOpen } from 'react-icons/fi';
import Accordion from '../components/Accordion'

export default function StudentDashboard() {
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [assignError, setAssignError] = useState('');
  const [privateVideos, setPrivateVideos] = useState([]);
  const [videoError, setVideoError] = useState('')
  const [publicVideos, setPublicVideos]= useState([])
  const [publicErr, setPublicErr] = useState('')
  const [email, setEmail] = useState('')
  const [videos, setVideos] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    axios.get('/questions/me').then(res => setQuestions(res.data.questions))
      .catch(() => setError('Couldn’t load questions'));
    axios.get('/resources/assignments').then(res => setAssignments(res.data.assignments))
      .catch(() => setAssignError('Couldn’t load assignments'));

    axios.get('/resources/videos/private')
    .then(res => setPrivateVideos(res.data.videos))
    .catch(() => setVideoError('Failed to load your videos'))

    axios.get('/resources/videos/public')
    .then(res => setPublicVideos(res.data.videos))
    .catch(() => setPublicErr('Failed to load public videos'))


  }, []);

  const fetchVideos = async () => {
    if(!email) return setErr("Enter your email")
    try {

  const userRes = await axios.get("/auth/user", {params: { email }})
  const userId = userRes.data._id

  const res = await axios.get('/resources/videos', {
    params: {userId}
  })
  setVideos(res.data)
  setErr("")
} catch (e) {
  console.error("Fetch Videos Error", e)
  setErr(e.response?.data?.error || "Failed to load videos")
  }
}

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


  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout')
      navigate('/login', {replace: true})
    } catch (err){
      console.error("Logout Failed", err)
    }
  }



  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl mb-4">Student Video Dashboard</h1>

      <div className="mb-6">
        <input
          type="email"
          placeholder="Your school email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <button
          onClick={fetchVideos}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Load My Videos
        </button>
        {err && <p className="text-red-500 mt-2">{err}</p>}
      </div>

      <ul className="space-y-4">
        {videos.map(v => (
          <li key={v.id} className="border p-3 rounded">
            <p className="font-medium">{v.name}</p>
            <p className="text-sm text-gray-600">
              Uploaded: {new Date(v.uploadedAt).toLocaleString()}
            </p>
            <a
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mt-1 inline-block"
            >
              View / Download
            </a>
          </li>
        ))}
      </ul>
      <button onClick={handleLogout} className='px-3 py-1'>Logout</button>
    </div>
  );
  
}
