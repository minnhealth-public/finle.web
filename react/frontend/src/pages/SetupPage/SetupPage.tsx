import React, { useEffect, useState } from 'react';
import { Modal } from '../../shared/View';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CareTeamProvider } from '../../contexts/CareTeamContext';
import MainPagePreAuth from '../MainPagePreAuth';
import { SetupUser } from '../../components/SetupGuide';
import { useStore } from '../../store';
import SetupQuestions from '../../components/SetupGuide/SetupQuestion';
import SetupFinished from '../../components/SetupGuide/SetupFinished';

interface SetupUserProps { }

const SetupPage: React.FC<SetupUserProps> = ({ }) => {
  const { user } = useStore();
  const navigate = useNavigate()
  const [isModalOpen, setModalOpen] = useState(true)
  let [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => { }, [user])

  useEffect(() => {
    if (isModalOpen && !searchParams.get("step")) {
      searchParams.set("step", "0");
      setSearchParams(searchParams);
    }
  }, [searchParams, isModalOpen, setSearchParams])

  const getStep = () => {
    const step = searchParams.get("step");
    if (step) {
      let index = parseInt(step);
      return userSetup[index];
    }
    return <></>
  }

  const nextStep = (newSearchParams: any) => {
    const step = searchParams.get("step");
    if (step) {
      // last step
      if (parseInt(step) + 1 >= userSetup.length) {
        searchParams.delete("step")
        setModalOpen(false);
        setSearchParams(searchParams);
        navigate('/');

      } else {
        searchParams.set("step", `${parseInt(step) + 1}`)
        newSearchParams["step"] = parseInt(step) + 1
        setSearchParams({ ...newSearchParams });
      }
    }
  }

  let userSetup = [
    <SetupQuestions nextStep={nextStep} />,
    <SetupUser nextStep={nextStep} />,
    <SetupFinished nextStep={nextStep} />,
  ];

  return (
    <>
      <MainPagePreAuth></MainPagePreAuth>
      <CareTeamProvider>
        <Modal data-testid="modal" open onClose={() => { navigate('/') }}>
          <div>
            {getStep()}
          </div>
        </Modal>
      </CareTeamProvider>
    </>
  );
}

export default SetupPage;
