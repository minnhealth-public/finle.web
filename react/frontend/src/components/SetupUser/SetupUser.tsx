import React, { useEffect, useState } from 'react';
import { Modal } from '../../shared/View';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SetupConcerns from './SetupConcerns';
import SetupDecisionMethod from './SetupDecisionMethod';
import SetupCareTeam from './SetupCareTeam';
import SetupCrisis from './SetupCrisis';
import useAuth from '../../hooks/useAuth';
import SetupFinished from './SetupFinished';


const SetupUser: React.FC = () => {
  let {user} = useAuth();
  const navigate = useNavigate()
  let { step } = useParams();
  const [isModalOpen, setModalOpen] = useState(user !== null && user?.lastLogin === null);
  let [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if(isModalOpen && !searchParams.get("step")){
      searchParams.set("step", "0");
      setSearchParams(searchParams);
    }
  }, [searchParams, isModalOpen, setSearchParams])

  const getStep = () => {
    const step = searchParams.get("step");
    if (step){
        let index = parseInt(step);
        return userSetup[index];
    }
    return <></>
  }

  const nextStep = () => {
    const step = searchParams.get("step");
    if(step){

      // last step
      if (parseInt(step) + 1 >= userSetup.length) {
        searchParams.delete("step")
        setModalOpen(false);
        setSearchParams(searchParams);

      } else {
        searchParams.set("step", `${parseInt(step)+1}`)
        setSearchParams(searchParams);
      }
    }
  }

  let userSetup = [
    <SetupCrisis nextStep={nextStep}/>,
    <SetupConcerns nextStep={nextStep}/>,
    <SetupDecisionMethod nextStep={nextStep}/>,
    <SetupCareTeam nextStep={nextStep}/>,
    <SetupFinished nextStep={nextStep}/>
  ];

  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={() => {}}>
          {getStep()}
      </Modal>
    </div>
  );
}

export default SetupUser;
