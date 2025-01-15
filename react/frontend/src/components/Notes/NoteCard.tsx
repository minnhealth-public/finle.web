import React, { } from 'react';
import { Note } from '../../models/note';
import UserCircle from '../../shared/View/UserCircle';
import { CareTeamMember } from '../../models/careTeam';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../store';
import { PatchNote, updateCareTeamNote } from '../../api/notes';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import VideoCardSlim from '../VideoCard/VideoCardSlim';
import ThumbtackIcon from '../../shared/Icon/ThumbtackIcon';

interface NoteProps {
  note: Note;
  cardColor?: string
  right?: boolean
  includeAttachment? : boolean
}

const NoteCard: React.FC<NoteProps> = ({ note, cardColor, right, includeAttachment = true }) => {
  const { careTeam, user } = useStore();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const member: CareTeamMember = careTeam?.members.find((member: CareTeamMember) => member.memberId === note.userId)

  const displayName = () => {
    if (member.memberId === user.id) {
      return "You";
    } else return (`${member?.firstName}${member?.lastName}` === "" ? member.email : `${member.firstName} ${member.lastName}`)
  }

  const getDate = () => {
    var localDate = new Date(note.ctime);
    return localDate.toLocaleString('en-US')
  }

  const updateNoteMutation = useMutation({
    mutationFn: (patchNote: PatchNote) => updateCareTeamNote(axiosPrivate, patchNote),
    onSuccess: (() => {
      // invalidate note query to refresh the data.
      queryClient.invalidateQueries(
        { queryKey: ['careTeamNotes', careTeam.id] }
      )
    })
  })

  const updateNotePin = () => {
    const updateNote: PatchNote = {
      noteId: note.id,
      teamId: careTeam.id,
      pinned: !note.pinned
    };
    updateNoteMutation.mutate(updateNote);
  }

  return (
    <>
      <div className={`md:flex flex-row w-full text-lg ${right ? "flex-row-reverse" : ""}`} >
        {member &&
          <>
            <div>
              <UserCircle
                className="relative w-16 h-16 mt-2 mx-2"
                firstName={member?.firstName}
                lastName={member?.lastName}
                email={member?.email}
                isCaree={member?.isCaree}
              />
            </div>
            <div className={`flex flex-col p-4 mx-0 flex-grow rounded-lg justify-end ${cardColor}`}>
              <div className={`flex items-center space-x-2 ${right ? "justify-end" : ""}`}>
                <p className="text-xl"><b>{displayName()}</b></p>
                <p className="text-base">
                  {getDate()}
                </p>
                <div
                  className={`w-4 ${note.pinned ? "text-primary" : "text-gray-300"} cursor-pointer`}
                  onClick={updateNotePin}
                >
                  <ThumbtackIcon />
                </div>
              </div>
              <div className={`flex flex-col gap-4 ${right ? "justify-end" : ""}`}>
                {note.clip && includeAttachment &&
                  <div className="md:w-3/5 opacity-80 bg-gray-50 rounded-lg p-2 border-l-4 border-primary_alt">
                    <VideoCardSlim video={note.clip} />
                  </div>
                }
                {note.glossary &&
                  <div className="md:w-4/5 opacity-80 bg-gray-50 rounded-lg p-2 border-l-4 border-primary_alt">
                    <a
                      target='_blank'
                      href={`glossary?term=${note.glossary.id}`}
                      className="line-clamp-4 hover:underline">
                      <h4 className="text-xl text-header">{note.glossary.term}</h4>
                      <p>{note.glossary.definition}</p>
                    </a>
                  </div>
                }
                {note.resource &&
                  <div className="md:w-4/5 opacity-80 bg-gray-50 rounded-lg p-2 border-l-4 border-primary_alt">
                    <a
                      target='_blank'
                      href={`resources?resource=${note.resource.id}`}
                      className="line-clamp-4 hover:underline">
                      <h4 className="text-xl text-header">{note.resource.title}</h4>
                      <p>{note.resource.description}</p>
                    </a>
                  </div>
                }
                {note.task &&
                  <div className="md:w-4/5 opacity-80 bg-gray-50 rounded-lg p-2 border-l-4 border-primary_alt">
                    <a
                      target='_blank'
                      href={`todos/${note.task.id}`}
                      className="line-clamp-4 hover:underline">
                      <h4 className="text-xl text-header">{note.task.title}</h4>
                      <p>{note.task.shortDescription}</p>
                    </a>
                  </div>
                }

                {note.text}
              </div>
            </div>
          </>
        }
      </div>
    </>
  );
};

export default NoteCard;
