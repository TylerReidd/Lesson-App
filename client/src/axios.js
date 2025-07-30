import axios from 'axios'

const isDev = import.meta.env.MODE === 'development';

axios.defaults.baseURL = isDev
? '/api'
: 'https://lesson-app-4pp6.onrender.com/api'

axios.defaults.withCredentials = true

export default axios