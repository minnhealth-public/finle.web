import React, { useContext } from 'react';
import { Modal } from '../shared/View';
import AuthContext from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const LoginPage = () => {

  let {loginUser, user} = useContext(AuthContext);

  const handleLogin = async (event: any) => {
    // Trigger the login mutation
    event.preventDefault();
    loginUser.mutate({ email:event.target.email.value, password:event.target.password.value });
  };

  if (user) {
    return <Navigate to='/shorts'></Navigate>
  }

  return (
    <Modal isOpen onClose={() => {}} disableClose={true}>
    <div className="flex items-center justify-center ">
      <div className="max-w-md w-full p-8">
        <h2 className="text-4xl text-blue-450">Login</h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="text"
              id="email"
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your password"
            />
          </div>
          <div>
            <button
              type="submit"
              className="text-sm uppercase bg-teal-500 hover:bg-teal-400 rounded-md py-2 px-12 text-white-1"
              disabled={loginUser.isPending}
            >
              {loginUser.isPending? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Modal>
  );
};

export default LoginPage;
