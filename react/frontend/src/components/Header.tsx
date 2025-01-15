import React from 'react'
import { useNavigate } from 'react-router-dom';
import HeaderAuth from './HeaderAuth';
import { useStore } from '../store';
import { usePageTracking } from '../hooks/usePageTracking';

const Header: React.FC = () => {

  usePageTracking()
  const { user } = useStore();
  const navigate = useNavigate();

  return (
    <header className="bg-sky-970 text-white text-center ">
      <div id="header" className="container p-4 mx-auto flex md:flex-row-reverse">
        <div className="flex justify-end md:gap-3 text-white-1 ">
          {user ? (<HeaderAuth></HeaderAuth>)
            :
            (
              <>
                <button
                  // onClick={() => navigate('/setup')} // Temporarily disabled for focus groups.
                  className="
                 bg-white-1 leading-none text-center uppercase text-base  text-sky-970 py-3 px-8 font-semibold rounded-md
                 hover:bg-primary_alt focus:bg-primary_alt hover:text-white-1 focus:text-white-1
                 transition-colors ease-out delay-150  duration-500
                 "
                >
                  Sign Up
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="
                  bg-white-1 leading-none text-center uppercase text-base  text-sky-970 py-3 px-8 font-semibold rounded-md
                 hover:bg-primary_alt focus:bg-primary_alt hover:text-white-1 focus:text-white-1
                 transition-colors ease-out delay-150  duration-500
                  ">
                  Login
                </button>
              </>
            )
          }
        </div>
      </div>
    </header>
  );
}

export default Header
