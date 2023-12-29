import React from "react";

interface SetupFinishedProps {
    nextStep: VoidFunction
}

const SetupFinished: React.FC<SetupFinishedProps > = ({nextStep}) => {

    const submit = () => {
      const currentTime = new Date().toUTCString()
      localStorage.setItem(
        'user',
        JSON.stringify(
          {...JSON.parse(localStorage.getItem('user')), lastLogin: currentTime })
      );
      nextStep();
    }

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl text-blue-450 md:w-3/5">
          Congratulations! You're good to go.
        </h2>
        <p className="font-bold">
          Start using MemCar Planner.
        </p>
        <div>
        <button
          className="text-sm uppercase bg-teal-500 hover:bg-teal-400 rounded-md py-2 px-12 text-white-1"
          onClick={() => submit()}
          >
           Get Started
        </button>

        </div>
     </div>
   );
}

export default SetupFinished;
