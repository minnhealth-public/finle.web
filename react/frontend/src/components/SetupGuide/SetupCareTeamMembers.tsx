import React, { useContext, useEffect } from "react";
import { ProgressBar } from "../../shared/View";
import CareTeamMemberList from "../../shared/View/CareTeamEdit/CareTeamMemberList";
import CareTeamMemberForm from "../../shared/View/CareTeamEdit/CareTeamMemberForm";
import CareTeamContext from "../../contexts/CareTeamContext";
import { useSearchParams } from "react-router-dom";


interface SetupCareTeamMembersProps {
  nextStep: VoidFunction
}

const SetupCareTeamMembers: React.FC<SetupCareTeamMembersProps> = ({ nextStep }) => {

  const [searchParams, setSearchParams] = useSearchParams();
  const { careTeam } = useContext(CareTeamContext);

  useEffect(() => {
    if (careTeam) {
      searchParams.set("careTeamId", `${careTeam.id}`);
      setSearchParams(searchParams);
    }
  }, [careTeam])

  return <>
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl text-header md:w-3/5">You're almost done.</h2>
      <ProgressBar value={3} range={4}></ProgressBar>
      <p className="font-bold">
        Who should be on your care team?
      </p>
      <div className="flex flex-col space-y-4 ">
        <CareTeamMemberList />
        <CareTeamMemberForm />
        <div className="flex justify-between ">
          <button
            onClick={() => nextStep()}
            className="text-sm uppercase py-2 px-12 "
          >Skip
          </button>
          <button
            onClick={() => nextStep()}
            className="text-sm uppercase bg-primary_alt hover:bg-primary focus:bg-primary rounded-md py-2 px-12 text-white-1"
          >
            Next
          </button>
        </div>
      </div>
    </div>

  </>
}

export default SetupCareTeamMembers;
