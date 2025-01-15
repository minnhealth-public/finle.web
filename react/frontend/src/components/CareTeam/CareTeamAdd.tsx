import React, { useContext, useEffect, useState } from "react";
import { Modal } from "../../shared/View";
import { useNavigate, useSearchParams } from "react-router-dom";
import CreateCareTeamStep from "../CareTeamSetup/CreateCareTeamStep";
import CreateCareTeamMemberStep from "../CareTeamSetup/CreateCareTeamMemberStep";
import CareTeamContext from "../../contexts/CareTeamContext";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../store";


const CareTeamAdd: React.FC = () => {

  const navigate = useNavigate()
  const { user } = useStore()
  const [isModalOpen, setModalOpen] = useState(false);
  const { setCareTeam } = useContext(CareTeamContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const queryClient = useQueryClient()

  useEffect(() => {
    if (isModalOpen && !searchParams.get("step")) {
      // clear out possible care team
      setCareTeam(null);
      searchParams.set("step", "0");
      setSearchParams(searchParams);
    }
  }, [searchParams, isModalOpen, setSearchParams])

  const getStep = () => {
    const step = searchParams.get("step");
    if (step) {
      let index = parseInt(step);
      return careTeamSetup[index];
    }
    return <></>
  }

  const nextStep = () => {
    const step = searchParams.get("step");
    if (step) {
      // last step
      if (parseInt(step) + 1 >= careTeamSetup.length) {
        searchParams.delete("step")
        searchParams.delete("careTeamId")
        queryClient.invalidateQueries({ queryKey: ["careTeams", user.id] })
        setModalOpen(false);
        setSearchParams(searchParams);
        navigate('/account');

      } else {
        searchParams.set("step", `${parseInt(step) + 1}`)
        setSearchParams(searchParams);
      }
    }
  }

  let careTeamSetup = [
    <CreateCareTeamStep nextStep={nextStep} />,
    <CreateCareTeamMemberStep nextStep={nextStep} />,
  ];

  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row md:space-x-8 md:space-y-0 space-y-8">
        <button
          className="btn-primary"
          onClick={() => { setModalOpen(true) }}
        >
          Add Care Team
        </button>
      </div>
      <div>
        <Modal open={isModalOpen} onClose={() => {
          setModalOpen(false);
          setSearchParams({});
        }}>

          {getStep()}
        </Modal>
      </div>
    </div>
  )
}

export default CareTeamAdd;
