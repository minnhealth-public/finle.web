import React, { useContext, useRef } from 'react';
import { CareTeamMember } from '../../models/careTeam';
import CareTeamContext from '../../contexts/CareTeamContext';
import { Modal } from '.';
import CareTeamMemberForm from './CareTeamEdit/CareTeamMemberForm';
import UserCircle from './UserCircle';
import { useStore } from '../../store';
import AreYouSureForm from '../Form/AreYouSureForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createShareToken } from '../../api/auth';


interface CareMemberProfileProps {
  member: CareTeamMember,
  memberIdx: number,
  allowEdit?: boolean
}

const CareMemberProfile: React.FC<CareMemberProfileProps> = ({ member, memberIdx, allowEdit }) => {
  const { user } = useStore()
  const { removeMemberMutation, setCurrentMember } = useContext(CareTeamContext);
  const deleteMemberRef = useRef(null);
  const editMemberRef = useRef(null);
  const queryClient = useQueryClient()

  const shareAccessMutation = useMutation({
    mutationFn: () => createShareToken(member.memberId, member.teamId)
  })

  return (
    <div className="flex items-center flex-col">
      <UserCircle
        className="relative w-20 h-20"
        firstName={member.firstName}
        lastName={member.lastName}
        email={member.email}
        isCaree={member.isCaree}
      />

      {/* User information */}
      <div className="mt-2 text-center">
        {(member.firstName || member.lastName) ?
          <>
            <p className="text-base font-extrabold">{member.firstName}</p>
            <p className="text-base font-extrabold">{member.lastName}</p>
          </>
          :
          <p className="text-base font-extrabold">{member.email}</p>
        }
        {member.relation != "" && <p className="text-base  font-extrabold text-gray-350">({member.relation})</p>}
        {allowEdit && member.memberId !== user.id &&
          <>
            <p>
              <button
                className="hover:text-primary text-primary_alt uppercase font-extrabold text-sm"
                onClick={() => {
                  editMemberRef.current.showModal();
                  setCurrentMember(memberIdx);
                }}
              >
                edit
              </button>
            </p>

            <p>
              <button
                className="hover:text-primary text-primary_alt uppercase font-extrabold text-sm"
                onClick={() => { deleteMemberRef.current.showModal() }}>
                remove
              </button>
            </p>

            <p>
              <button
                className="hover:text-primary text-primary_alt uppercase font-extrabold text-sm"
                onClick={() => shareAccessMutation.mutate()}>
                send access
              </button>
            </p>
          </>
        }
      </div>
      <Modal
        ref={editMemberRef}
        onClose={() => { editMemberRef.current.close() }}
      >
        <div className="flex flex-col">
          <h2 className="text-5xl text-header ">Edit Member</h2>
          <p className="text-lg pb-10 pr-14">Update this member's relation, role, and dementia status below.</p>
          <CareTeamMemberForm
            onSubmit={() => {
              editMemberRef.current.close()
              setCurrentMember(null);
            }}
          />
        </div>
      </Modal>
      <Modal ref={deleteMemberRef} onClose={() => { deleteMemberRef.current.close() }}>
        <AreYouSureForm
          onConfirm={() => {
            removeMemberMutation.mutate(member, {
              onSuccess: () => {
                deleteMemberRef.current.close()
                queryClient.invalidateQueries({ queryKey: ["careTeams", user.id] })
              }
            })
          }}
          onCancel={() => { deleteMemberRef.current.close() }}
        />
      </Modal>
    </div >
  )
}

export default CareMemberProfile;
