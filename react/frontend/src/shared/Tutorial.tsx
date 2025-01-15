import React from "react";


interface CallBack {
  // start, next, finish
  action: string
}

interface Step {
  target: string,
  content: string | React.ReactElement
  callback?: (data: CallBack) => void
}

interface TutorialProps {
  run: boolean
  steps: Step[]
}


const Tutorial: React.FC<TutorialProps> = ({ run, steps }) => {

  return <></>
}

export default Tutorial;
