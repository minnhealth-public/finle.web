import axios, { AxiosInstance } from 'axios';

export default axios.create({
  baseURL: process.env.VITE_REACT_APP_BACKEND_HOST
})

export const axiosPrivate: AxiosInstance = axios.create({
  baseURL: process.env.VITE_REACT_APP_BACKEND_HOST,
  withCredentials: true
})
