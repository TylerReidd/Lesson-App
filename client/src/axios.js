import axios from 'axios'

const isDev = import.meta.env.MODE === 'development';

axios.defaults.baseURL = isDev
? '/api'
: 'https://lesson-app-4pp6.onrender.com/api'

axios.interceptors.response.use(
  response => response, 
  error => {
    if (error.response?.status === 401) {
      return Promise.resolve({data: {user: null}})
    }
    return Promise.reject(error)
  }
)

axios.defaults.withCredentials = true

export default axios