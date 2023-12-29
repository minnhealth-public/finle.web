import { ProgressBar } from "../../shared/View";
import React from "react";

interface SetupConcernsProps {
    nextStep: VoidFunction
}

const SetupConcerns: React.FC<SetupConcernsProps> = ({nextStep}) => {
    const submit = () => {
        //DO stuff
        nextStep();
    }

    return <>
            <div className="flex flex-col gap-6">
       <h2 className="text-3xl text-blue-450 md:w-3/5">This won't take long.</h2>
        <ProgressBar value={1} range={4}></ProgressBar>
        <p className="font-bold">
            What are your bigest concerns?
        </p>
        <form action="#" method="post" className="flex gap-6" id="concerns-form">
          <label>
            <input className="mr-3 accent-teal-500" type="checkbox" id="concern1" name="concern1" value="Concern 1"/>
            Concern 1
          </label>

          <label>
            <input className="mr-3 accent-teal-500" type="checkbox" id="concern2" name="concern2" value="Concern 2"/>
            Concern 2
          </label>

          <label>
            <input className="mr-3 accent-teal-500" type="checkbox" id="concern3" name="concern3" value="Concern 3"/>
            Concern 3
          </label>

          <label>
            <input className="mr-3 accent-teal-500" type="checkbox" id="concern4" name="concern4" value="Concern 4"/>
            Concern 4
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

    </>
}

export default SetupConcerns;
