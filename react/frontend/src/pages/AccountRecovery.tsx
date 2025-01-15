import React from 'react';
import { Modal } from '../shared/View';
import { useNavigate } from 'react-router-dom';
import MainPagePreAuth from './MainPagePreAuth';
import { useMutation } from '@tanstack/react-query';
import { recoverAccount } from '../api/auth';
import { useForm } from 'react-hook-form';

const AccountRecovery = () => {

  const navigate = useNavigate()

  const {
    register,
    trigger,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm();


  const recAccMut = useMutation({
    mutationFn: (email: string) => recoverAccount(email)
  });

  const handleLogin = async (data: any) => {
    // Trigger the recover mutation

    clearErrors(["email"])
    const isValid = await trigger()

    if (isValid) {
      recAccMut.mutate(data.email);
    }

  };

  return (
    <>
      <MainPagePreAuth></MainPagePreAuth>
      <Modal open onClose={() => { navigate('/'); }}>
        <div className="flex items-center justify-center ">
          <div className="max-w-lg w-full p-8">
            <h2 className="text-4xl text-header">Recover Account</h2>
            {recAccMut.isSuccess ? (
              <p>Email has been sent to recover you account.</p>
            ) : (
              <>
                <p>Please provide your account email below to recover your account</p>
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
                  {recAccMut.isError && <p className="text-red-500">Something went wrong</p>}
                  <div className="flex flex-row space-x-4 items-center">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={recAccMut.isPending}
                    >
                      {recAccMut.isPending ? 'Requesting...' : 'Request'}
                    </button>
                  </div>
                </form>
              </>
            )
            }
          </div>
        </div>
      </Modal>
    </>
  );
};


export default AccountRecovery
