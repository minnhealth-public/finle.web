import axios from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { setAuth, logoutUser } = useAuth();

    const refresh = async () => {
        try {
            const resp = await axios.get(
                '/api/auth/token/refresh/',
                {
                    withCredentials: true // send with http cookie for refresh
                }
            )
            setAuth((prev: any) => {
                return {
                    ...prev,
                    roles: resp.data.roles,
                    accessToken: resp.data.access
                }
            });
            return resp.data.access;
        } catch (err) {
            console.error(err);
            logoutUser()
            return null;
        }
    }
    return refresh;
};

export default useRefreshToken;
