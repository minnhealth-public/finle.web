import React, { useEffect } from 'react';
import CareTeamNotes from '../../components/Notes/CareTeamNotes';
import { CareTeam, CareTeamMember } from '../../models/careTeam';
import UserCircle from '../../shared/View/UserCircle';
import { useStore } from '../../store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { careTeamMemberNotified } from '../../api/user';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const MyNotesPage = () => {

  const { careTeam, setCareTeam, user } = useStore()
  const privateAxios = useAxiosPrivate()
  const queryClient = useQueryClient();

  //Send a a request to the back end letting the system know the user has been notified.
  const notifiedMutation = useMutation({
    mutationFn: () => careTeamMemberNotified(privateAxios, careTeam.id),
    onSuccess: (data: CareTeam) => {
      queryClient.invalidateQueries({ queryKey: ['careTeams', user.id] })
      setCareTeam(data);
    }
  })

  useEffect(() => {
    if (careTeam) {
      notifiedMutation.mutate();
    }
  }, [])

  return (
    <div id="notes-page" className="container mx-auto">
      <div className="md:flex relative items-center -z-10">
        <div className="w-20 h-20 " />
        {careTeam?.members.map((member: CareTeamMember, idx: number) => {
          return (
            <div key={idx} className="invisible md:visible absolute">
              <UserCircle
                className={`w-20 h-20 left-[10px] top-0 `}
                style={{ left: `${idx * 25}px` }}
                firstName={member.firstName}
                lastName={member.lastName}
                email={member.email}
              />
            </div>
          )
        })}
        <div style={{ width: `${Math.max(0, (careTeam?.members.length) * 25)}px`}}></div>
        <h4 id="notes-title" className="text-3xl">{careTeam?.name}</h4>
      </div>
      <CareTeamNotes careTeam={careTeam} />
    </div>
  );
};

export default MyNotesPage;
