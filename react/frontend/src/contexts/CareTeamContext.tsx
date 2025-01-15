import { useMutation } from "@tanstack/react-query";
import React, { PropsWithChildren, createContext, useState } from "react";
import { CareTeam, CareTeamMember } from "../models/careTeam";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { addCareTeamMember, createCareTeam, getCareTeam, removeCareTeamMember, updateCareTeamMember } from "../api/user";

const CareTeamContext = createContext(null);

type CareTeamProviderProps = {
  careTeam?: CareTeam
}

export const CareTeamProvider = (props: PropsWithChildren<CareTeamProviderProps>) => {


  const [careTeamState, setCareTeamState] = useState<CareTeam>(props.careTeam)
  const [selectedMember, setSelectedMember] = useState<CareTeamMember>(null)
  const [selectedMemberIdx, setSelectedMemberIdx] = useState<number>(null)

  const axiosPrivate = useAxiosPrivate();

  const createCareTeamMutation = useMutation({
    mutationFn: (careTeam: CareTeam) => createCareTeam(axiosPrivate, careTeam),
    onSuccess: (data: CareTeam) => {
      setCareTeamState(data);
      // Set the search param of care team.
    },
  })

  const addCareTeamMemberMutation = useMutation({
    mutationFn: (careTeamMember: CareTeamMember) => addCareTeamMember(axiosPrivate, careTeamMember),
    onSuccess: (data: CareTeam) => {
      setCareTeamState(data)
    },
  })

  const updateCareTeamMemberMutation = useMutation({
    mutationFn: (careTeamMember: CareTeamMember) => updateCareTeamMember(axiosPrivate, careTeamMember),
    onSuccess: (data: CareTeam) => {
      setCareTeamState(data)
    },
    onError: (error) => {
      //throw new Error(error.message)
    }
  })

  const removeCareTeamMemberMutation = useMutation({
    mutationFn: (careTeamMember: CareTeamMember) => removeCareTeamMember(axiosPrivate, careTeamMember),
    onSuccess: (data: CareTeam) => {
      setCareTeamState(data)
    },
  })

  const setMember = (memberIdx: number) => {
    setSelectedMember(careTeamState.members[memberIdx])
    setSelectedMemberIdx(memberIdx);
  }

  const addMember = (member: CareTeamMember, isAsync: boolean) => {
    // If there is a care team we just call the create mutation
    if (careTeamState?.id) {
      if (!!isAsync) {
        return addCareTeamMemberMutation.mutateAsync(member);
      } else {
        return addCareTeamMemberMutation.mutate(member);
      }
    } else {
      setCareTeamState({ ...careTeamState, members: [...careTeamState?.members, member] })
    }
  }

  const updateMember = (member: CareTeamMember, memberIdx: number, isAsync: boolean) => {
    if (careTeamState.id) {
      if (!!isAsync) {
        updateCareTeamMemberMutation.mutate(member);
      } else {
        updateCareTeamMemberMutation.mutateAsync(member);
      }
    } else {
      const memberOld = careTeamState.members[memberIdx]
      let updateMembers = careTeamState.members
      updateMembers.splice(memberIdx, 1, { ...memberOld, ...member })
      setCareTeamState({ ...careTeamState, members: updateMembers })
    }
  }

  const removeMember = (member: CareTeamMember, onSuccess: () => void) => {
    if (careTeamState.id) {
      return removeCareTeamMemberMutation.mutate(member);
    }
  }

  // Pass contextData to providers
  const contextData = {
    careTeam: careTeamState,
    setCareTeam: setCareTeamState,
    selectedMember: selectedMember,
    selectedMemberIdx: selectedMemberIdx,
    createCareTeam: createCareTeamMutation,
    addCareTeamMember: addMember,
    updateCareTeamMember: updateMember,
    removeMember: removeMember,
    setCurrentMember: setMember,
    removeMemberMutation: removeCareTeamMemberMutation
  }

  return (
    <CareTeamContext.Provider value={contextData}>
      {props.children}
    </CareTeamContext.Provider>
  )
};

export default CareTeamContext;
