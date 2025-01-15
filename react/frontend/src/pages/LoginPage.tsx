import React, { useEffect } from 'react';
import { Modal } from '../shared/View';
import { useNavigate } from 'react-router-dom';
import MainPagePreAuth from './MainPagePreAuth';
import LoginForm from '../shared/Form/LoginForm';
import { useStore } from '../store';
import SSOLogins from '../components/SSOLogins';

const LoginPage = () => {

  let { user } = useStore();
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.lastLogin) {
      navigate('/videos')
    } else if (user) {
      navigate('/todos')
    }
  }, [user])

  return (
    <>
      <MainPagePreAuth></MainPagePreAuth>
      <Modal open onClose={() => { navigate('/'); }}>
        <div className="md:flex justify-center items-stretch ">
          <div className="p-4">
            <h2 className="md:text-6xl text-4xl text-header">Login</h2>
            <LoginForm></LoginForm>
          </div>
          <div className="flex flex-col align-middle md:pt-16 mb-4">
            <div className="border-l flex-grow m-auto mb-2 "></div>
            <div className="text-s md:pl-0 pl-4">or</div>
            <div className="border-l flex-grow m-auto mt-2"></div>
          </div>
          <div className="md:mt-[3.75rem] p-4 md:pt-4 pt-0 ">
            <SSOLogins />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LoginPage;
