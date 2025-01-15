import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";

interface SetupFinishedProps {
  nextStep: (data: any) => void
}

const SetupFinished: React.FC<SetupFinishedProps> = ({ nextStep }) => {

  const buttonRef = useRef(null)
  const { setShowTutorial, setTutorial } = useStore()
  const navigate = useNavigate();
  useEffect(() => {
    buttonRef.current.focus();
  }, [])

  const onTutorialStart = () => {
    setShowTutorial(true);
    setTutorial({ run: true, stepIndex: 0 });
    navigate('/todos');
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-6xl text-header ">Congratulations, <br></br> your account is setup</h2>
      <div className="flex gap-4 mt-4 justify-center">
        <button tabIndex={0} ref={buttonRef} className="btn-primary" onClick={onTutorialStart}>
          Start Tutorial
        </button>
      </div>
    </div>
  );
}

export default SetupFinished;
