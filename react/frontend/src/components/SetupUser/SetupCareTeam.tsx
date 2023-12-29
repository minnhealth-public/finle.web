import React, { useRef, useState } from "react";
import { ProgressBar } from "../../shared/View";
import InputSelect from "../../shared/Form/InputSelect";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form"


interface SetupCareTeamProps {
    nextStep: VoidFunction
}

interface CareTeamMember {
  firstName: string,
  lastName: string,
  association: string,
  email: string
}

const SetupCareTeam: React.FC<SetupCareTeamProps> = ({nextStep}) => {

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm();

  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const formRef = useRef(null);

  const submit = () => {
    nextStep();
  }

  const addMember = async () => {
    const body = new FormData(formRef.current)
    const values: FieldValues = {};
    body.forEach((value, key) => {
      values[key] = value
    })
    const isValid = await trigger()
    if (isValid){
      const member: CareTeamMember = values as CareTeamMember;
      setCareTeam([...careTeam, member])
      reset();
    }
  }

  const editMember = (memberIdx: number) => {
    const member = careTeam[memberIdx];

    setValue('email', member.email);
    setValue('firstName', member.firstName);
    setValue('lastName', member.lastName);
    setValue('association', member.association);

    const updatedData = [...careTeam];
    // Use splice to remove the item at the specified index
    updatedData.splice(memberIdx, 1);
    // Set the updated array as the new state
    setCareTeam(updatedData);
  }

  const onSubmit: SubmitHandler<CareTeamMember> = (data) => console.log(data)

  return <>
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl text-blue-450 md:w-3/5">You're almost done.</h2>
        <ProgressBar value={3} range={4}></ProgressBar>
        <p className="font-bold">
            Who should be on your care team?
        </p>
        <div>
          {careTeam.map((member: CareTeamMember, idx: number) => {
            return (
              <div key={idx} className="flex flex-row justify-between">
                <div>{member.firstName} {member.lastName} {member.email}</div>
                <button onClick={() => editMember(idx)}>edit</button>
              </div>
            )
          })}
        </div>

        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} action="#" method="post" className="flex" id="care-team-form">
          <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-3">
              <label hidden htmlFor="firstName">First Name</label>
              <input
                {...register('firstName', {required: true})}
                className="border-2 rounded-md p-3"
                placeholder='First Name'
                name="firstName"
                type="input"
                id="firstName"
              />
              {errors.firstName && <p>First name is required.</p>}

              <label hidden htmlFor="lastName">Last Name</label>
              <input
                {...register('lastName')}
                className="border-2 rounded-md p-3"
                placeholder='Last Name'
                name="lastName"
                type="input"
                id="lastName"
              />

              <label hidden htmlFor="association">Relation or connection</label>
              <InputSelect
               {...register('association')}
               options={["Family Member", "Clinician", "Spouse"]}
               placeholder={"Relation or connection"}
               name={"association"}
               id={"association"}
              />
            </div>
            <div className="flex flex-row gap-3">
              <label hidden htmlFor="email">Email</label>
              <input
                {...register('email', {required: true, pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i }) }
                className="border-2 rounded-md p-3"
                placeholder='Email'
                type="email"
                name="email"
                id="email"
              />
              {errors.email && <p>Email is required.</p>}
            </div>
          </div>
        </form>
        <div className="flex flex-row-reverse">
          <button
            className="text-sm uppercase bg-teal-500 hover:bg-teal-400 focus:bg-teal-400 rounded-md py-2 px-12 text-white-1"
            onClick={() => addMember()}
            >
              Add Another Person
          </button>

        </div>
        <div className="flex justify-between ">
          <button>Skip</button>
          <button
            className="text-sm uppercase bg-teal-500 hover:bg-teal-400 focus:bg-teal-400 rounded-md py-2 px-12 text-white-1"
            onClick={() => submit()}
            >
             Submit
          </button>
        </div>
      </div>

  </>
}

export default SetupCareTeam;
