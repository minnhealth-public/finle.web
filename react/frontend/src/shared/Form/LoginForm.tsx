import React, { useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PasswordInput from './PasswordInput';


const LoginForm: React.FC = () => {

  const {
    register,
    trigger,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm();


  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate()

  const handleLogin = async (data: any) => {
    // Trigger the login mutation

    // If first_name has a value than we know that a robot has seen the hidden field and filled it out.
    if (!!data.first_name)
      return;

    clearErrors(["email", "password"])
    const isValid = await trigger()

    if (isValid) {
      loginUser.mutate({ email: data.email, password: data.password });
    }

  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-600">
            Email
            <input
              {...register('email', { required: "Email is required" })}
              type="email"
              id="email"
              className="input-field"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500">{(errors.email.message as string)}</p>}
          </label>
        </div>
        <div>
          <PasswordInput
            {...register('password', { required: "password is required" })}
            id="password"
            className="input-field"
            placeholder="Enter your password"
          >
            {errors.password && <p className="text-red-500">{(errors.password.message as string)}</p>}
          </PasswordInput>

          <input
            {...register('first_name')}
            type="text"
            id="first_name"
            className="!hidden"
            tabIndex={-1}
            autoComplete='false' />
        </div>
        {loginUser.isError && <p className="text-red-500">Failed to login with the email and password combination</p>}
        <Link className="link-primary !text-xs" to='/account/recover' >Recover account</Link>
        <div className="flex flex-row space-x-4 mt-0 justify-between">
          <button
            type="submit"
            className="btn-primary"
            disabled={loginUser.isPending}
          >
            {loginUser.isPending ? 'Logging in...' : 'LogIn'}
          </button>
          <button
            onClick={() => { navigate('/setup') }}
            className="btn-secondary"
          >
            Sign up
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
