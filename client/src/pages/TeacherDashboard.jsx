import React, {useState, useEffect} from 'react'
import axios from '../axios'


const TeacherDashboard = () => {
  const [studentEmail, setStudentEmail] = useState('')
  const [assignmentText, setAssignmentText] = useState('')
  const [assignMsg, setAssignMsg] = useState('')
  const [assignErr, setAssignErr] = useState('')

  const [videoFile, setVideoFile] = useState(null)
  const [videoEmail, setVideoEmail] = useState('')
  const[videoMsg, setVideoMsg] = useState('')
  const [videoErr, setVideoErr] = useState('')

  const [publicVideos,  setPublicVideos]  = useState([]);
  const [privateVideos, setPrivateVideos] = useState([]);

  const [pdfFile, setPdfFile] = useState(null)
  const [pdfEmail, setPdfEmail] = useState('')
  const [pdfMsg, setPdfMsg] = useState('')
  const [pdfErr, setPdfErr] = useState('')

  const [questions, setQuestions] = useState([])
  const [responseText, setResponseText] = useState({})
  const [respErr, setRespErr] = useState('')

  useEffect(() => {
    axios.get('/questions')
    .then(res=> setQuestions(res.data))
    .catch(() => console.error("failed to load questions"))

    axios.get('/videos/public')
    .then(res => setPublicVideos(res.data))
    .catch(() => console.error('failed to load public videos'));

    axios.get('/videos/private')
    .then(res => setPrivateVideos(res.data))
    .catch(() => console.error('failed to load private videos'));
  }, [])



  const handleAssignmentSubmit = async (e) => {
    e.preventDefault()
    setAssignErr(''); setAssignMsg('');
    if(!studentEmail.trim() || !assignmentText.trim()) {
      setAssignErr("Email an assignment content are required")
      return;
    }

    try {
      await axios.post('/assignments', {studentEmail, content: assignmentText})
      setAssignMsg("Assignment savedd successfully")
      setStudentEmail('')
      setAssignmentText('')
    } catch {
      setAssignErr("failed to save assignment")
    }
  }

  const handleVideoUpload = async (e) => {
    e.preventDefault()
    setVideoErr(''); setVideoMsg('');
    if(!videoFile) {
      setVideoErr('Please select video file')
      return;
    }
    const formData = new FormData();
    formData.append('video', videoFile)
    if(videoEmail) formData.append('studentEmail', videoEmail);
    try {
      await axios.post('/uploads/video', formData, {
        headers: {'Content-Type' : 'multipart/form-data'}
      })
      setVideoMsg("video uploaded successfully");
      setVideoFile(null)
      setVideoEmail('')
    } catch {
      setVideoErr("Video upload failed")
    }
  } 

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    setPdfErr('');setPdfMsg('')
    if(!pdfFile) {
      setPdfErr('Please select a pdf file')
      return;
    }
    const formData = new FormData()
    formData.append('pdf', pdfFile)
    if(pdfEmail) formData.append('studentEmail', pdfEmail);
    try {
      await axios.post('/uploads/pdf', formData, {
        headers: {'Content-Type' :'multipart/form-data'}
      })
      setPdfMsg('PDF uploaded successfully')
      setPdfFile(null)
      setPdfEmail('')
    } catch {
      setPdfErr("PDF upload failed ")
    }
  } 

  const handleRespond = async (id) => {
    if (!responseText[id]?.trim()) {
      setRespErr('Response cannot be empty')
      return;
    }
    try {
      await axios.put(`/questions/${id}/respond`, {response: responseText[id]})
      const {data} =await axios.get('/questions');
      setQuestions(data)
      setRespErr('')
    } catch {
      setRespErr('Failed to send response')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Teacher Dashboard</h1>

      {/* Create/Update Assignments */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Create or Update Assignments</h2>
        <form onSubmit={handleAssignmentSubmit} className="space-y-2">
          <input
            type="email"
            placeholder="Student Email"
            value={studentEmail}
            onChange={e => setStudentEmail(e.target.value)}
            className="w-full border rounded p-2"
          />
          <textarea
            placeholder="Assignment details..."
            value={assignmentText}
            onChange={e => setAssignmentText(e.target.value)}
            rows={4}
            className="w-full border rounded p-2"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save Assignment
          </button>
          {assignMsg && <p className="text-green-600">{assignMsg}</p>}
          {assignErr && <p className="text-red-600">{assignErr}</p>}
        </form>
      </section>

      <section>
  <h2 className="text-2xl font-semibold mb-2">Public Videos</h2>
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

  <h2 className="mt-6 text-2xl font-semibold mb-2">Private Videos</h2>
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

      {/* Upload Videos */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Upload Videos</h2>
        <form onSubmit={handleVideoUpload} className="space-y-2">
          <input
            type="email"
            placeholder="Student Email (optional)"
            value={videoEmail}
            onChange={e => setVideoEmail(e.target.value)}
            className="w-full border rounded p-2"
          />
          <input
            type="file"
            accept="video/*"
            onChange={e => setVideoFile(e.target.files[0])}
            className="w-full"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Upload Video
          </button>
          {videoMsg && <p className="text-green-600">{videoMsg}</p>}
          {videoErr && <p className="text-red-600">{videoErr}</p>}
        </form>
      </section>

      {/* Upload PDFs */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Upload PDFs</h2>
        <form onSubmit={handlePdfUpload} className="space-y-2">
          <input
            type="email"
            placeholder="Student Email (optional)"
            value={pdfEmail}
            onChange={e => setPdfEmail(e.target.value)}
            className="w-full border rounded p-2"
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={e => setPdfFile(e.target.files[0])}
            className="w-full"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Upload PDF
          </button>
          {pdfMsg && <p className="text-green-600">{pdfMsg}</p>}
          {pdfErr && <p className="text-red-600">{pdfErr}</p>}
        </form>
      </section>

      {/* Q&A Responses */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Q&A Responses</h2>
        <ul className="space-y-4">
          {questions.length ? questions.map(q => (
            <li key={q._id} className="border rounded p-3">
              <p className="font-medium">Student: {q.text}</p>
              {q.response ? (
                <p className="mt-2 text-green-700">Your Response: {q.response}</p>
              ) : (
                <> 
                  <textarea
                    rows={2}
                    placeholder="Write your response..."
                    value={responseText[q._id] || ''}
                    onChange={e => setResponseText(prev => ({ ...prev, [q._id]: e.target.value }))}
                    className="w-full border rounded p-2 mb-2"
                  />
                  <button
                    onClick={() => handleRespond(q._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Send Response
                  </button>
                </>
              )}
            </li>
          )) : (
            <p className="text-gray-500">No questions yet.</p>
          )}
        </ul>
        {respErr && <p className="text-red-600 mt-2">{respErr}</p>}
      </section>
    </div>
  )
}

export default TeacherDashboard;


// src/pages/TeacherDashboard.jsx
// import React from 'react';

// export default function TeacherDashboard() {
//   return (
//     <div style={{ padding: '2rem', background: '#f0f0f0' }}>
//       <h1>🛠 Teacher Dashboard Loaded</h1>
//     </div>
//   );
// }
