import React from "react";
import { ProgressBar } from "../../shared/View";

interface SetupCrisisProps {
    nextStep: VoidFunction
}

const SetupCrisis: React.FC<SetupCrisisProps > = ({nextStep}) => {

    const submit = () => {
        //DO stuff
        nextStep();
    }

    return (
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl text-blue-450 md:w-3/5">Looks like we need a couple more things.</h2>
      <ProgressBar value={0} range={4}></ProgressBar>
      <p className="font-bold">
          Are you currently in crisis or planning?
      </p>
      <form className="flex gap-6" id="crisis-form">
          <label>
            <input className="mr-3 accent-teal-500" type="radio" name="currentStatus" id="planning" value="planning"/>
            Planning
          </label>
          <label>
            <input className="mr-3 accent-teal-500" type="radio" name="currentStatus" id="crisis" value="crisis"/>
            Crisis
          </label>
      </form>
      <div className="flex justify-between ">
        <button>Skip</button>
        <button
          className="text-sm uppercase bg-teal-500 hover:bg-teal-400 rounded-md py-2 px-12 text-white-1"
          onClick={() => submit()}
          >
           Next
        </button>
      </div>
    </div>
   );
}

export default SetupCrisis;
