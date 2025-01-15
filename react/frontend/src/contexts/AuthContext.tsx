import { useMutation } from "@tanstack/react-query";
import { loginUser, logoutUser, registerUser } from "../api/auth";
import React, {createContext, useEffect} from "react";
import { jwtDecode } from 'jwt-decode'
import humps from "humps";
import { useNavigate } from "react-router-dom";
import { LoginUserResp } from "../models";
import { useStore } from "../store";
import { getAnalytics, setUserId } from 'firebase/analytics';

const AuthContext = createContext(null);

export interface JwtData {
  email: string
  firstName: string
  lastName: string
  userId: number
  lastLogin: string
  exp: number
  iat: number
  jti: string
  tokenType: string
}

export const AuthProvider = ({ children }: any) => {
  const navigate = useNavigate()
  const { setUser, token, setToken, user } = useStore();
  const analytics = getAnalytics();

  useEffect(() => {
    if (user && user.id) {
      setUserId(analytics, user.id.toString());
    } else {
      setUserId(analytics, null);
    }
  }, [user, analytics]);

  const loginResponse = (data: LoginUserResp) => {
    const tmpUser: JwtData = (humps.camelizeKeys(jwtDecode(data.access)) as any)
    setUser({
      id: tmpUser.userId,
      firstName: tmpUser.firstName,
      lastName: tmpUser.lastName,
      email: tmpUser.email,
      lastLogin: tmpUser.lastLogin
    });
    setToken(data.access);
  }

  let logoutUserClean = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    navigate('/');
  }

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: loginResponse
  })

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: loginResponse
  })

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: logoutUserClean
  })

  let contextData = {
    auth: token,
    loginUser: loginMutation,
    registerUser: registerMutation,
    logoutUser: logoutMutation,
    loginResponse: loginResponse
  }

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  )
};

export default AuthContext;
