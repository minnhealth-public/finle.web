import React, { useContext, useEffect } from "react";
import { ProgressBar } from "../../shared/View";
import CareTeamForm from "../../shared/View/CareTeamEdit/CareTeamForm";
import CareTeamContext from "../../contexts/CareTeamContext";
import { useSearchParams } from "react-router-dom";


interface SetupCareTeamProps {
  nextStep: VoidFunction
}

const SetupCareTeam: React.FC<SetupCareTeamProps> = ({ nextStep }) => {

  const { careTeam } = useContext(CareTeamContext);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (careTeam) {
      searchParams.set("careTeamId", `${careTeam.id}`);
      setSearchParams(searchParams);
    }
  }, [careTeam, searchParams, setSearchParams])

  const nextWithParams = () => {
    nextStep()

    searchParams.set("careTeamId", `${careTeam.id}`);
    setSearchParams(searchParams);
  }

  return <>
    <div className="flex flex-col gap-6">
      <h2 className="text-4xl text-header md:w-3/5">You're almost done.</h2>
      <ProgressBar value={3} range={4}></ProgressBar>
      <p className="font-bold">
        Setup your care team
      </p>
      <div className="relative flex flex-col space-y-4 ">
        <CareTeamForm onSubmit={() => { nextWithParams() }}>
          <div className="flex justify-between">
            <input type="submit"
              className="text-sm uppercase bg-primary_alt hover:bg-primary focus:bg-primary rounded-md py-2 px-12 text-white-1"
              value="Next"
            />
          </div>
        </CareTeamForm>
      </div>
      <div className="flex justify-between ">
      </div>
    </div>

  </>
}

export default SetupCareTeam;
