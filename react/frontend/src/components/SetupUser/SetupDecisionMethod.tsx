import React from "react";
import { ProgressBar } from "../../shared/View";

interface SetupDecisionMethodProps {
    nextStep: VoidFunction
}

const SetupDecisionMethod: React.FC<SetupDecisionMethodProps> = ({nextStep}) => {
    const submit = () => {
        //DO stuff
        nextStep();
    }

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-3xl text-blue-450 md:w-3/5">You're getting closer.</h2>
            <ProgressBar value={2} range={4}></ProgressBar>
            <p className="font-bold">
                How do you make your best decisions?
            </p>
            <form action="#" method="post" className="flex gap-6" id="decision-method-form">
              <label>
                <input className="mr-3 accent-teal-500" type="checkbox" name="method1" value="Method 1"/>
                Method 1
              </label>

              <label>
                <input className="mr-3 accent-teal-500" type="checkbox" name="method2" value="Method 2"/>
                Method 2
              </label>

              <label>
                <input className="mr-3 accent-teal-500" type="checkbox" name="method3" value="Method 3"/>
                Method 3
              </label>

              <label>
                <input className="mr-3 accent-teal-500" type="checkbox" name="method4" value="Method 4"/>
                Method 4
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

export default SetupDecisionMethod;
