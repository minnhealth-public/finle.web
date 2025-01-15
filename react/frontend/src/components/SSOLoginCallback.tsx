import React, { useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuthToken } from '../api/auth';
import { useNavigate } from "react-router-dom";
import Spinner from '../shared/Spinner';
import AuthContext from '../contexts/AuthContext';


const SSOLoginCallBack: React.FC = () => {
  const navigate = useNavigate()
  const { loginResponse } = useContext(AuthContext);

  const { data, isError, error } = useQuery({
    queryKey: ["get_token"],
    queryFn: () => getAuthToken(),
  });

  if (isError) {
    console.error(error);
    navigate('/')
  }
  useEffect(() => {
    if (data) {
      loginResponse(data);
      navigate('/videos')
    }
  }, [data])

  return (<Spinner />)
}

export default SSOLoginCallBack;
