import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from '../axios'
import Accordion from '../components/Accordion';
import { FiEdit2, FiVideo, FiFileText, FiMessageCircle } from 'react-icons/fi';
import FileUpload from '../components/FileUpload';



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

  const navigate = useNavigate();

  // useEffect(() => {
    // axios.get('/questions/me')
    // .then(res=> setQuestions(res.data))
    // .catch(() => console.error("failed to load questions"))

    // axios.get('/videos/public')
    // .then(res => setPublicVideos(res.data))
    // .catch(() => console.error('failed to load public videos'));

    // axios.get('/videos/private')
    // .then(res => setPrivateVideos(res.data))
    // .catch(() => console.error('failed to load private videos'));
  // }, [])



  // const handleAssignmentSubmit = async (e) => {
  //   e.preventDefault()
  //   setAssignErr(''); setAssignMsg('');
  //   if(!studentEmail.trim() || !assignmentText.trim()) {
  //     setAssignErr("Email an assignment content are required")
  //     return;
  //   }

  //   try {
  //     await axios.post('/assignments', {studentEmail, content: assignmentText})
  //     setAssignMsg("Assignment savedd successfully")
  //     setStudentEmail('')
  //     setAssignmentText('')
  //   } catch {
  //     setAssignErr("failed to save assignment")
  //   }
  // }

  const handleVideoUpload = async e => {
    e.preventDefault();
    if (!videoFile) return setVideoErr('Select a video');

    const formData = new FormData();
    console.log(videoFile)
    formData.append("file", videoFile);
    if (videoEmail) formData.append('recipient', videoEmail);
    formData.append("recipientEmail", videoEmail)
  
    try {
     const res = await axios.post(
      "/resources/videos/upload",
      formData,

      {
        headers: {"Content-Type": "multipart/form-data"}
      }
     )
      setVideoMsg(res.data.message);
      setVideoErr('');
      setVideoFile(null);
      setVideoEmail('');
    } catch (err){
      console.error("upload error: ", err.response || err)
      setVideoErr('Video upload failed');
    }
  };
  
  const handlePdfUpload = async e => {
    e.preventDefault();
    if (!pdfFile) return setPdfErr('Select a PDF');
    const formData = new FormData();
    formData.append('file', pdfFile);
    if (pdfEmail) formData.append('recipient', pdfEmail);
  
    try {
      const res = await axios.post(
        '/resources/assignments/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setPdfMsg(res.data.message);
      setPdfErr('');
      setPdfFile(null);
      setPdfEmail('');
    } catch {
      setPdfErr('PDF upload failed');
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
  

  // const handleRespond = async (id) => {
  //   if (!responseText[id]?.trim()) {
  //     setRespErr('Response cannot be empty')
  //     return;
  //   }
  //   try {
  //     await axios.put(`/questions/${id}/respond`, {response: responseText[id]})
  //     const {data} =await axios.get('/questions');
  //     setQuestions(data)
  //     setRespErr('')
  //   } catch {
  //     setRespErr('Failed to send response')
  //   }
  // }

    return (
      <div className="min-h-screen bg-beige py-8">
        <h1 className="text-3xl text-stormcloud font-bold text-center mb-8">
          Teacher Dashboard
        </h1>
        {/* <FileUpload onUpload={handleVideoUpload} /> */}
    
        <Accordion title="🎥 Upload Video">
          {videoErr && <p className="text-red-500">{videoErr}</p>}
          {videoMsg && <p className="text-green-500">{videoMsg}</p>}
          <form onSubmit={handleVideoUpload} className="space-y-4" encType="multipart/form-data">
            <input
              type="email"
              placeholder="Student Email (optional)"
              value={videoEmail}
              onChange={e => setVideoEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:ring focus:outline-none"
            />
            <input
              type="file"
              accept="video/*,video/quicktime"
              onChange={e => setVideoFile(e.target.files[0])}
              className="w-full"
            />
            <button
              type="submit"
              className="bg-sunset text-white px-4 py-2 rounded hover:bg-sunset/90"
            >
              Upload Video
            </button>
          </form>
        </Accordion>
    
        <Accordion title="📄 Upload PDF">
          {pdfErr && <p className="text-red-500">{pdfErr}</p>}
          {pdfMsg && <p className="text-green-500">{pdfMsg}</p>}
          <form onSubmit={handlePdfUpload} className="space-y-4" encType="multipart/form-data">
            <input
              type="email"
              placeholder="Student Email (optional)"
              value={pdfEmail}
              onChange={e => setPdfEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:ring focus:outline-none"
            />
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setPdfFile(e.target.files[0])}
              className="w-full"
            />
            <button
              type="submit"
              className="bg-sunset text-white px-4 py-2 rounded hover:bg-sunset/90"
            >
              Upload PDF
            </button>
          </form>
        </Accordion>

        <button onClick={handleLogout} className='px-3 py-1'>Logout</button>
      </div>
    );
    

}


export default TeacherDashboard;

