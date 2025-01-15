import React, { useContext, useRef, useState } from "react";
import CareMemberAdd from "./CareMemberAdd";
import { CareMemberProfile, Modal } from "../../shared/View";
import { CareTeam, CareTeamMember } from "../../models/careTeam";
import { useStore } from "../../store";
import AreYouSureForm from "../../shared/Form/AreYouSureForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { deleteCareTeam } from "../../api/user";
import EditCareTeamForm from "../../shared/Form/EditCareTeam";
import CareTeamContext from "../../contexts/CareTeamContext";


interface CareTeamListProps {
  careTeam: CareTeam
}

const CareTeamList: React.FC<CareTeamListProps> = ({ careTeam }) => {
  const { user } = useStore();
  const deleteModalRef = useRef(null);
  const editModalRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient()
  const { setCurrentMember } = useContext(CareTeamContext);
  const [isUserCareAdmin, setIsUserCareAdmin] = useState<boolean>(
    careTeam.members.find((careTeamMember: CareTeamMember) => careTeamMember.memberId === user.id)?.isCareteamAdmin
  )

  const deleteCareTeamMutation = useMutation({
    mutationFn: (careTeamId: string) => deleteCareTeam(axiosPrivate, careTeamId),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["careTeams", user.id] })
      deleteModalRef.current.close()
    },
  })

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-row justify-between">
        <h3 className="font-bold text-3xl flex gap-4 items-baseline">
          {careTeam?.name}
          {isUserCareAdmin &&
            <>
              <button
                onClick={() => editModalRef.current.showModal()}
                className="
                text-primary_alt text-sm uppercase font-extrabold
                hover:text-primary focus:text-primary
              "
              >
                edit
              </button>

              <button
                onClick={() => deleteModalRef.current.showModal()}
                className="
                text-primary_alt text-sm uppercase font-extrabold
                hover:text-primary focus:text-primary
              "
              >
                delete
              </button>
            </>
          }
        </h3>
      </div>
      <div className="flex flex-col md:flex-row md:space-x-8 md:space-y-0 space-y-8 overflow-auto scrollbar">
        <div>
          <CareMemberAdd />
        </div>
        {careTeam?.members.map((careMember: CareTeamMember, idx: number) => {
          return (
            <CareMemberProfile
              memberIdx={idx}
              member={careMember}
              allowEdit={isUserCareAdmin}
              key={idx}
            />
          )
        })}
      </div>
      <div className="relative">
        <Modal ref={editModalRef} onClose={() => { setCurrentMember(null) }}>
          <EditCareTeamForm
            careTeam={careTeam}
            onCancel={() => editModalRef.current.close()}
          />
        </Modal>
        <Modal ref={deleteModalRef} onClose={() => { }}>
          <AreYouSureForm
            onConfirm={() => {
              deleteCareTeamMutation.mutate(careTeam.id.toString())
            }}
            onCancel={() => { deleteModalRef.current.close() }}
            message="Members of this team will no longer be able to see tasks, videos, and notes. Are you sure you want to delete the team?"
          />
        </Modal>
      </div>
    </div>
  )
}

export default CareTeamList;
