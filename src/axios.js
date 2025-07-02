import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true,
})

axios.defaults.withCredentials = true;

export default instance