import React, {SyntheticEvent, useContext, useEffect, useRef, useState} from "react";
import { useForm, FieldValues } from "react-hook-form"
import CareTeamContext from "../../../contexts/CareTeamContext";
import { CareTeamMember } from "../../../models/careTeam";
import InputSelect from "../../Form/InputSelect";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../../store";
import { useSearchParams } from "react-router-dom";

interface CareTeamMemberFormProps {
  onSubmit?: () => void;
}

const CareTeamMemberForm: React.FC<CareTeamMemberFormProps> = ({ onSubmit }) => {

  const {
    register,
    setValue,
    getValues,
    trigger,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm();

  const {
    careTeam,
    addCareTeamMember,
    updateCareTeamMember,
    setCurrentMember,
    selectedMember,
    selectedMemberIdx
  } = useContext(CareTeamContext);

  const { user } = useStore()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams();

  const formRef = useRef(null);

  const [isTeamAdmin, setIsTeamAdmin] = useState(selectedMember?.isCareteamAdmin || false);
  const handleRoleChange = (role: String) => {
   if (role === 'admin') {
      setIsTeamAdmin(true);
    } else {
      setIsTeamAdmin(false);
    }
  };

  /* call when members change to reset the values */
  useEffect(() => {
    clearErrors();
    setValue('email', selectedMember?.email);
    setValue('relation', selectedMember?.relation);
    setValue('memberId', selectedMember?.memberId);
    setValue('teamId', selectedMember?.teamId || careTeam?.id);
    setValue('isCareteamAdmin', selectedMember?.isCareteamAdmin);
    setValue('isCaree', selectedMember?.isCaree);
  }, [careTeam, selectedMember, setValue])

  useEffect(() => {
    reset();
    clearErrors();
  }, [])

  const addMember = async (evt: SyntheticEvent) => {
    evt.preventDefault();
    const careTeamAdminKey = "isCareteamAdmin";
    const careTeamCareeKey = "isCaree";
    const body = new FormData(formRef.current);
    const values: FieldValues = {};
    body.forEach((value, key) => {
      if ([careTeamAdminKey, careTeamCareeKey].includes(key))
        values[key] = true;
      else
        values[key] = value;
    })

    // checkboxes don't show up if they aren't checked so change to false here for careTeamMember
    if (!body.has(careTeamAdminKey))
      values[careTeamAdminKey] = false;

    if (!body.has(careTeamCareeKey))
      values[careTeamCareeKey] = false;
    //

    setValue("relation", values["relation"]);

    const member: CareTeamMember = values as CareTeamMember;
    trigger().then(async (isValid: boolean) => {
      if (!isValid)
        return

      if (selectedMemberIdx === null)
        await addCareTeamMember(member, true)
      else {
        await updateCareTeamMember(member, selectedMemberIdx, true)
      }
      reset();
      setCurrentMember(null);
      clearErrors(["relation", "email"])
      queryClient.invalidateQueries({ queryKey: ["careTeams", user.id] })
      if (onSubmit)
        onSubmit();
    })
  }

  const checkRelation = (relation: string) => {
    return getValues("isCaree") || !!relation;
  }

  return <>
    <form
      ref={formRef}
      className="flex flex-col gap-y-4"
      id="care-team-members-form"
      onSubmit={(evt) => addMember(evt)}
    >
      <div className="flex flex-row flex-wrap gap-2">
        <div className="flex-grow">
          <label hidden htmlFor="email">Email</label>
          <input
            {...register('email', { required: true, pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i })}
            className={`border-2 rounded-md p-3 w-full ${selectedMemberIdx === null ? "" : "text-gray-400"} placeholder:text-lg`}
            placeholder='Type email here'
            autoFocus
            disabled={(selectedMemberIdx !== null)}
            type="email"
            name="email"
            id="email"
          >
          </input>
          {errors.email && <p className="text-red-500">Email is required.</p>}
        </div>
        <div className="flex-grow relative z-10">
          <label hidden htmlFor="relation">Relation or connection</label>
          <InputSelect
            {...register('relation', { validate: checkRelation })}
            options={["Family Member", "Clinician", "Spouse", "Elder Care"]}
            placeholder={"Select relation or connection"}
            name={"relation"}
            id={"relation"}
          />
          {errors.relation && <p className="text-red-500">Relation is required.</p>}
        </div>
      </div>

      <div className="border-b-2 border-primary"></div>

      <label htmlFor="isTeamParticipant" className="cursor-pointer flex gap-2">
        <input
          {...register('isCareteamAdmin')}
          type="checkbox"
          checked={!isTeamAdmin}
          onChange={() => handleRoleChange('participant')}
          className="border-2 cursor-pointer rounded-md p-3"
          name="isTeamParticipant"
          id="isTeamParticipant"
        />
        Invite as team participant
      </label>

      <label htmlFor="isCareteamAdmin" className="cursor-pointer flex gap-2">
        <input
          {...register('isCareteamAdmin')}
          type="checkbox"
          onChange={() => handleRoleChange('admin')}
          checked={isTeamAdmin}
          className="border-2 cursor-pointer rounded-md p-3"
          name="isCareteamAdmin"
          id="isCareteamAdmin"
        />
        Invite as team admin
      </label>

      <div className="border-b-2 border-primary"></div>

      <label htmlFor="isCaree" className="cursor-pointer flex gap-2">
        <input
          {...register('isCaree')}
          defaultChecked={selectedMember?.isCaree || false}
          className="border-2 cursor-pointer rounded-md p-3"
          type="checkbox"
          name="isCaree"
          id="isCaree"
        />
        Is this person living with dementia? If yes, please check this box.
      </label>

      <input
        {...register('memberId')}
        className="border-2 rounded-md p-3"
        type="hidden"
        name="memberId"
        id="memberId"
      />
      <input
        {...register('teamId')}
        className="border-2 rounded-md p-3"
        type="hidden"
        name="teamId"
        id="teamId"
      />

      <div className="self-end">
        <input
          className="btn-primary"
          type="submit"
          value={searchParams.get("careTeamId") ? "Add" : "Finish"}
        />
      </div>
    </form>
  </>
}

export default CareTeamMemberForm;
