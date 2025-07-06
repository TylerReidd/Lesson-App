import React, { useState, useEffect } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";


// Fetch assignments and PDFs


export default function TeacherDashboard({onLogout}) {
  const navigate = useNavigate()
  const [videoFile, setVideoFile]   = useState(null);
  const [videoEmail, setVideoEmail] = useState("");
  const [videoErr, setVideoErr]     = useState("");
  const [videoMsg, setVideoMsg]     = useState("");

  const [pdfEmail, setPdfEmail] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfErr, setPdfErr] = useState('')
  const [pdfMsg, setPdfMsg] = useState('')
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    axios
    .get('/resources/assignments/teacher')
    .then(res => setAssignments(res.data))
    .catch(err => console.error("fetch Assignments failed", err))
  }, [])

  // TeacherDashboard.jsx
const handlePdfUpload = async e => {
  e.preventDefault();
  if (!pdfFile) return setPdfErr("Must select a PDF");
  if (!pdfEmail) return setPdfErr("Enter student email");
  let studentId;
  try {
    const userRes = await axios.get('/auth/user', {
      params: { email: pdfEmail },
      withCredentials: true
    });
    studentId = userRes.data._id;
  } catch {
    return setPdfErr("Student not found");
  }


  const formData = new FormData();
  formData.append('file', pdfFile);            // matches upload.single('file')
  formData.append('recipient', studentId);     // matches req.body.recipient


  try {
    const res = await axios.post(
      '/resources/assignments/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    setPdfMsg(res.data.message);
    setPdfErr("");
    setAssignments(a => [res.data, ...a]);
    setPdfFile(null);
    setPdfEmail("");
  } catch (err) {
    console.error("PDF upload failed", err.response?.data || err);
    setPdfErr(err.response?.data?.message || "Upload failed");
  }
};


  const handleVideoUpload = async e => {
    e.preventDefault();
    if (!videoFile) return setVideoErr("Select a video");
    if (!videoEmail) return setVideoErr("Enter student Email")



    let studentId
    try {
      const userRes = await axios.get('/auth/user', {
        params: {email: videoEmail},
        withCredentials: true
      })
      studentId = userRes.data._id
    } catch {
      return setVideoErr('Student not found')
    }

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("recipient", studentId)
 

    try {
      const res = await axios.post(
        "/resources/videos/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setVideoMsg(res.data.message);
      setVideoErr("");
      setVideoFile(null);
      setVideoEmail("");
    } catch (err) {
      console.error("upload error →", err.response?.data || err);
      setVideoErr(err.response?.data?.error || "Video upload failed");
    }
  };


  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout')
      onLogout()
      navigate('/login', {replace: true})
    } catch (err){
      console.error("Logout Failed", err)
    }
  }

  return (
    <div className="spaced">
      <h1>Teacher Dashboard</h1>
      {videoErr && <p style={{ color: "red" }}>{videoErr}</p>}
      {videoMsg && <p style={{ color: "green" }}>{videoMsg}</p>}

      <form onSubmit={handleVideoUpload} className="spaced">
        <div className="form-group">
          <label>Student Email (optional)</label>
          <input
            type="email"
            value={videoEmail}
            onChange={e => setVideoEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Select Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={e => setVideoFile(e.target.files[0])}
          />
        </div>
        <button type="submit" className="button">
          Upload Video
        </button>
      </form>

      <hr className='my-4' />

      <h2>
        Upload Assignment (PDF Only--For now)
      </h2>
        {pdfErr && <p style={{color: 'red' }}>{pdfErr}</p>}
        {pdfMsg && <p style={{color: 'green' }}>{pdfMsg}</p>}




      <form onSubmit={handlePdfUpload} classname='spaced'>
        <div className="form-group">
          <label>Student Email</label>
          <input 
            type="email"
            value={pdfEmail}
            onChange={e => setPdfEmail(e.target.value)}
            required
            />
          <label>Select PDF</label>
          <input 
            type='file'
            accept='application/pdf'
            onChange={e => setPdfFile(e.target.files[0])}
          />
          <button type='submit' className="button">
            Upload PDF
          </button>
        </div>
      </form>


      <h3 className="mt-6 text-lg">Available Assignments</h3>
      <ul className="list-disc pl-5">
        {assignments.map(f => (
          <li key={f._id || f.id}>
            <a 
              href={f.url}
              target="_blank"
              rel='noopener noreferror'>
                {f.originalName || f.filename}
              </a>
              <span className="text-sm text-gray-500 ml-2">
                {new Date(f.uploadedAt).toLocaleDateString()}  
              </span> 
          </li>
        ))}
      </ul>

      <button onClick={handleLogout} className='px-3 py-1'>Logout</button>

    </div>
  );
}
