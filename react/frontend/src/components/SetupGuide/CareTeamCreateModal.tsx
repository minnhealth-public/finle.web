import React, { useEffect, useState } from 'react';
import { Modal } from '../../shared/View';
import { useSearchParams } from 'react-router-dom';
import SetupCareTeam from './SetupCareTeamMembers';
import { CareTeamProvider } from '../../contexts/CareTeamContext';
import SetupCareTeamMembers from './SetupCareTeamMembers';
import { useStore } from '../../store';


const SetupUser: React.FC = () => {
  let {user} = useStore();
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
    <SetupCareTeam nextStep={nextStep}/>,
    <SetupCareTeamMembers nextStep={nextStep}/>
  ];

  return (
    <div>
      <Modal open={isModalOpen} onClose={() => {}}>
        <CareTeamProvider>
          {getStep()}
        </CareTeamProvider>
      </Modal>
    </div>
  );
}

export default SetupUser;
