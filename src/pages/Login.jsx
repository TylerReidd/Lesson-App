import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const res = await axios.post(
        'http://localhost:5001/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
  
      // pull role from res.data.user
      const userRole = res.data.user.role;
  
      if (userRole === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5001/api/auth/logout', {}, {
        withCredentials: true
      })
      window.loction.href = '/login';
    } catch (err) {
      console.error('Logout failed', err)
    }
  } 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}

        <label className="block mb-2">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded"
        />

        <label className="block mb-2">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  )
}

export default Login