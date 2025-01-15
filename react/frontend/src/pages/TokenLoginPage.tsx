import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainPagePreAuth from './MainPagePreAuth';
import { loginUserWithToken } from '../api/auth';
import { JwtData } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import humps from 'humps';
import { useStore } from '../store';
import { useQuery } from '@tanstack/react-query';

const TokenLoginPage = () => {

  const { setUser, setToken } = useStore();
  const navigate = useNavigate()
  let [searchParams, setSearchParams] = useSearchParams();

  const { data, isError } = useQuery({
    queryKey: ["tokenLogin", searchParams.get("access")],
    queryFn: () => loginUserWithToken(searchParams.get("access")),
    enabled: !!searchParams.get("access")
  });

  useEffect(() => {
    if (data) {
      const tmpUser: JwtData = (humps.camelizeKeys(jwtDecode(data.access)) as any)
      setUser({
        id: tmpUser.userId,
        firstName: tmpUser.firstName,
        lastName: tmpUser.lastName,
        email: tmpUser.email,
        lastLogin: tmpUser.lastLogin
      });
      setToken(data.access);

      navigate('/videos')
    }
  }, [data])

  return (
    <>
      <MainPagePreAuth></MainPagePreAuth>
    </>
  );
};

export default TokenLoginPage;
