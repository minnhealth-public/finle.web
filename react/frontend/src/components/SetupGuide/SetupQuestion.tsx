import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

interface SetupQuestionProps {
  nextStep: (data: any) => void
}

const SetupQuestions: React.FC<SetupQuestionProps> = ({ nextStep }) => {

  const [onHereForYou, setOnHereForYou] = useState<boolean>()
  const formRef = useRef(null);
  const firstInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    firstInputRef.current.focus();
  }, [])

  const onSubmit = async (evt: SyntheticEvent) => {
    evt.preventDefault();
    const body = new FormData(formRef.current);
    const values: FieldValues = {};
    body.forEach((value, key) => { values[key] = value; })

    if (values["hereForYou"] === "yes")
      delete values["ableToRepresent"]

    setSearchParams({ ...values });
    nextStep(values);
  };

  const onHereForYouChange = (e: any) => { setOnHereForYou(e.target.value === "yes"); }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="md:text-6xl text-4xl text-header ">To sign up, please answer</h2>
      <form ref={formRef} onSubmit={onSubmit} className="mt-4 flex flex-col space-y-4">
        <p className="font-bold">
          Are you helping plan for yourself or someone else?
        </p>
        <div className="flex">
          <label className="flex gap-2 ">
            <input ref={firstInputRef} type="radio" name="hereForYou" value="no" onChange={onHereForYouChange} />
            Myself
          </label>
          <label className="flex gap-2">
            <input type="radio" name="hereForYou" value="yes" onChange={onHereForYouChange} />
            Someone else
          </label>
        </div>
        <div className={`m-0 ease-in-out
            ${onHereForYou == true ? "animate-[reveal_1s_ease-in-out] mt-4" : "hidden"}
          `}>
          <div>
            <p className="font-bold mb-4">
              Is the person living with dementia unable to represent themselves in legal and financial matters?
            </p>
            <div className="flex">
              <label className="flex gap-2">
                <input
                  tabIndex={onHereForYou == true ? 0 : -1}
                  type="radio"
                  name="ableToRepresent"
                  value="yes" />They cannot represent themselves
              </label>
              <label className="flex gap-2">
                <input
                  tabIndex={onHereForYou == false ? 0 : -1}
                  type="radio"
                  name="ableToRepresent"
                  value="no" />They can represent themselves
              </label>
              <label className="flex gap-2 ">
                <input
                  tabIndex={onHereForYou == true ? 0 : -1}
                  type="radio"
                  name="ableToRepresent"
                  value="unsure" /> Unsure
              </label>
            </div>
          </div>
        </div>
        <div>
          <button
            className="btn-primary"
            type="submit"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}

export default SetupQuestions;
