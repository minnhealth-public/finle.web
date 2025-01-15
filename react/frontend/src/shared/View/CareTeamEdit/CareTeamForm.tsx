import React, { ReactNode, SyntheticEvent, useContext, useRef } from "react";
import { useForm, FieldValues } from "react-hook-form"
import CareTeamContext from "../../../contexts/CareTeamContext";
import { CareTeam } from "../../../models/careTeam";
import InputSelect from "../../Form/InputSelect";
import { useStore } from "../../../store";

interface CareTeamFormProps {
  children?: ReactNode
  onSubmit?: () => void;
}

const CareTeamForm: React.FC<CareTeamFormProps> = ({ onSubmit, children }) => {

  const {
    register,
    trigger,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm();

  const { user } = useStore();

  const {
    createCareTeam,
    setCareTeam
  } = useContext(CareTeamContext);

  const formRef = useRef(null);

  const submit = async (evt: SyntheticEvent) => {
    evt.preventDefault();
    const body = new FormData(formRef.current);
    const values: FieldValues = {};
    body.forEach((value, key) => {
      values[key] = value;
    })

    trigger().then((isValid: boolean) => {
      if (!isValid)
        return
      //TODO
      const careTeam: CareTeam = {
        name: values["name"],
        members: [
          {
            relation: values['relation'],
            memberId: user.id,
            email: user.email,
            isCareteamAdmin: true
          }
        ]
      };
      createCareTeam.mutate(careTeam, {
        onSuccess: (data: CareTeam) => {
          reset();
          clearErrors(["name", "relation"])
          onSubmit();
        },
        onError: () => {/*TODO*/ },
      });
    })
  }
  return <>
    <form
      ref={formRef}
      className="flex flex-col space-y-4"
      id="care-team-form"
      onSubmit={(evt) => submit(evt)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-row space-x-3">
          <label
            htmlFor="name"
            className="block"
          >
            <input
              {...register('name', { required: true })}
              className={`border-2 rounded-md p-3 `}
              placeholder='Care Team Name'
              type="text"
              name="name"
              id="name"
            />
            {errors.name && <p className="text-red-500">Name is required.</p>}
          </label>
          <input
            {...register('teamId')}
            className="border-2 rounded-md p-3"
            type="hidden"
            name="teamId"
            id="teamId"
          />
          <InputSelect
            {...register('relation')}
            options={["Person with Dementia", "Care Partner", "Family/Friend", "Advocate"]}
            placeholder={"My role"}
            name={"relation"}
            className="flex-grow"
            id={"relation"}
          />
        </div>
      </div>
      <div>
        {children}
      </div>
    </form>
  </>
}

export default CareTeamForm;
