import React from 'react';
import { Modal } from '../shared/View';
import { useNavigate } from 'react-router-dom';
import MainPagePreAuth from './MainPagePreAuth';
import AccountResetForm from '../shared/Form/AccountResetForm';

const AccountReset = () => {

  const navigate = useNavigate()

  return (
    <>
      <MainPagePreAuth></MainPagePreAuth>
      <Modal open onClose={() => { navigate('/'); }}>
        <div className="flex items-center justify-center ">
          <div className="max-w-lg w-full p-8">
            <h2 className="text-4xl text-header">Reset Account</h2>
            <p>Please provide a new password for your account</p>
            <AccountResetForm onSubmit={() => { }}></AccountResetForm>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AccountReset
