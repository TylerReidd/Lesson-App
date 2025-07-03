import React, {useState, useEffect} from 'react'
import axios from '../axios'
import { FiEdit2, FiVideo, FiFileText, FiMessageCircle } from 'react-icons/fi';



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
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-indigo-600 mb-8">Teacher Dashboard</h1>
      <div className="space-y-8">
        {/* Create or Update Assignments */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FiEdit2 className="text-indigo-500 mr-2" size={24} />
            <h2 className="text-2xl font-semibold text-gray-800">
              Create or Update Assignments
            </h2>
          </div>
          {assignErr && <p className="text-red-500 mb-2">{assignErr}</p>}
          {assignMsg && <p className="text-green-500 mb-2">{assignMsg}</p>}
          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Student Email"
              value={studentEmail}
              onChange={e => setStudentEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <textarea
              placeholder="Assignment details..."
              value={assignmentText}
              onChange={e => setAssignmentText(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              Save Assignment
            </button>
          </form>
        </section>
  
        {/* Public & Private Videos */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FiVideo className="text-indigo-500 mr-2" size={24} />
                <h2 className="text-2xl font-semibold text-gray-800">
                  Public Videos
                </h2>
              </div>
              <div className="space-y-4">
                {publicVideos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publicVideos.map(v => (
                      <video key={v._id} controls className="w-full rounded shadow">
                        <source src={v.url} type="video/mp4" />
                      </video>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No public videos yet.</p>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center mb-4">
                <FiVideo className="text-indigo-500 mr-2" size={24} />
                <h2 className="text-2xl font-semibold text-gray-800">
                  Private Videos
                </h2>
              </div>
              <div className="space-y-4">
                {privateVideos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {privateVideos.map(v => (
                      <video key={v._id} controls className="w-full rounded shadow">
                        <source src={v.url} type="video/mp4" />
                      </video>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No private videos yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
  
        {/* Upload Video & PDF */}
        <section className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <FiVideo className="text-indigo-500 mr-2" size={24} />
              <h2 className="text-2xl font-semibold text-gray-800">
                Upload Video
              </h2>
            </div>
            {videoErr && <p className="text-red-500 mb-2">{videoErr}</p>}
            {videoMsg && <p className="text-green-500 mb-2">{videoMsg}</p>}
            <form onSubmit={handleVideoUpload} className="space-y-4" encType="multipart/form-data">
              <input
                type="email"
                placeholder="Student Email (optional)"
                value={videoEmail}
                onChange={e => setVideoEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                type="file"
                accept="video/*"
                onChange={e => setVideoFile(e.target.files[0])}
                className="w-full"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                Upload Video
              </button>
            </form>
          </div>
          <div>
            <div className="flex items-center mb-4">
              <FiFileText className="text-indigo-500 mr-2" size={24} />
              <h2 className="text-2xl font-semibold text-gray-800">
                Upload PDF
              </h2>
            </div>
            {pdfErr && <p className="text-red-500 mb-2">{pdfErr}</p>}
            {pdfMsg && <p className="text-green-500 mb-2">{pdfMsg}</p>}
            <form onSubmit={handlePdfUpload} className="space-y-4" encType="multipart/form-data">
              <input
                type="email"
                placeholder="Student Email (optional)"
                value={pdfEmail}
                onChange={e => setPdfEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setPdfFile(e.target.files[0])}
                className="w-full"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                Upload PDF
              </button>
            </form>
          </div>
        </section>
  
        {/* Q&A Responses */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FiMessageCircle className="text-indigo-500 mr-2" size={24} />
            <h2 className="text-2xl font-semibold text-gray-800">Q&A Responses</h2>
          </div>
          {respErr && <p className="text-red-500 mb-4">{respErr}</p>}
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q._id} className="border border-gray-200 rounded p-4">
                <p className="mb-2"><strong>Q:</strong> {q.text}</p>
                {q.response ? (
                  <p><strong>A:</strong> {q.response}</p>
                ) : (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleRespond(q._id);
                    }}
                    className="space-y-2"
                  >
                    <textarea
                      value={responseText[q._id] || ''}
                      onChange={e =>
                        setResponseText(prev => ({
                          ...prev,
                          [q._id]: e.target.value
                        }))
                      }
                      placeholder="Your answer..."
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 h-24"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      Submit Response
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}


export default TeacherDashboard;

