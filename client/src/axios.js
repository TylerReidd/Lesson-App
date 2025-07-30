import axios from 'axios'

const dev = import.meta.env.MODE === 'development';

const instance = axios.create({
  baseURL: dev 
  ? '/api'
  : 'https://lesson-app.onrender.com',
  withCredentials: true,
})


export default instance