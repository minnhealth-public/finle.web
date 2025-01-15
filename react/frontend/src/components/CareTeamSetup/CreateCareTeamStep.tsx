import React, { useContext, useEffect } from "react";
import { ProgressBar } from "../../shared/View";
import CareTeamForm from "../../shared/View/CareTeamEdit/CareTeamForm";
import CareTeamContext from "../../contexts/CareTeamContext";
import { useSearchParams } from "react-router-dom";


interface SetupCareTeamProps {
  nextStep: VoidFunction
}

const CreateCareTeamStep: React.FC<SetupCareTeamProps> = ({ nextStep }) => {

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

    //searchParams.set("careTeamId", `${careTeam?.id}`);
    //setSearchParams(searchParams);
  }

  return <>
    <div className="flex flex-col gap-6">
      <h2 className="text-4xl text-header">We just need a few things.</h2>
      <ProgressBar value={0} range={2}></ProgressBar>
      <p className="font-bold">
        Setup your care team
      </p>
      <div className="flex flex-col space-y-4 ">
        <CareTeamForm onSubmit={() => { nextWithParams() }}>
          <div className="flex items-end justify-end">
            <input type="submit"
              className="text-sm uppercase bg-primary_alt hover:bg-primary focus:bg-primary rounded-md py-2 px-12 text-white-1"
              value="Next"
            />
          </div>
        </CareTeamForm>
      </div>
    </div>

  </>
}

export default CreateCareTeamStep;
