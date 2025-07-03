import axios from 'axios'

const instance = axios.create({
  baseURL: 'api',
  withCredentials: true,
})

axios.defaults.withCredentials = true;

export default instance