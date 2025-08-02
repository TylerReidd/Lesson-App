import {Outlet, Link, useNavigate} from 'react-router-dom'
import axios from '../axios.js'


export default function StudentLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      navigate('/login')
    } catch (err) {
      console.err("Logout Failed", err)
    }
  }

  return (
    <div className='container'>
      <nav className="navbar card">
        <ul className="video-list">
          <li><Link to='student/videos'>Videos</Link></li>
          <li><Link to='student/assignments'>Assignments</Link></li>
          <li><Link to='student/questions'>Q&A</Link></li>
        </ul>
        <button className='button-logout' onClick={handleLogout}>Logout</button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
 }