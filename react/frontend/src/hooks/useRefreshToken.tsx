import axios from '../api/axios';
import { useStore } from '../store';
import useAuth from './useAuth';

const useRefreshToken = () => {
  const { logoutUser } = useAuth();
  const { setToken } = useStore();
  const refresh = async () => {
    try {
      const resp = await axios.get(
        '/api/auth/token/refresh/',
        {
          withCredentials: true // send with http cookie for refresh
        }
      )
      setToken(resp.data.access);
      return resp.data.access;
    } catch (err) {
      console.error(err);
      logoutUser.mutate()
      return null;
    }
  }
  return refresh;
};

export default useRefreshToken;
