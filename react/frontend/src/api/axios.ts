import axios from 'axios';


export default axios.create({
    baseURL: process.env.REACT_APP_BACKEND_HOST
})

export const axiosPrivate = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_HOST,
    withCredentials: true
})
