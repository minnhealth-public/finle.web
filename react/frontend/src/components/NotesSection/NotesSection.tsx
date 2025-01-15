import React from 'react'
import { useStore } from '../../store';
import {useQuery} from '@tanstack/react-query';
import {
  PaginatedNoteResponse,
  getCareTeamNotesForClip,
  getCareTeamNotesForGlossaryTerm, getCareTeamNotesForResource, getCareTeamNotesForTodo
} from '../../api/notes';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import NoteCard from "../Notes/NoteCard.tsx";
import NewNote from "../Notes/NewNote.tsx";
import {Link} from "react-router-dom";
import ChevronIcon from "../../shared/Icon/ChevronIcon.tsx";

interface NotesSectionProps {
  clipId?: number,
  glossaryTermId?: number
  resourceId?: number
  todoId?: number
}

const NotesSection: React.FC<NotesSectionProps> = ({
  clipId,
  glossaryTermId,
  resourceId,
  todoId,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const { user, careTeam } = useStore();

  const queryKey = clipId ? ["notesForClip", careTeam?.id] :
                                    glossaryTermId ? ["notesForTerm", careTeam?.id] :
                                    resourceId ? ["notesForResource", careTeam?.id] :
                                    todoId ? ["notesForTask", careTeam?.id] : null;

  const queryFn = () => {
    if (clipId) return getCareTeamNotesForClip(axiosPrivate, careTeam, clipId);
    if (glossaryTermId) return getCareTeamNotesForGlossaryTerm(axiosPrivate, careTeam, glossaryTermId);
    if (todoId) return getCareTeamNotesForTodo(axiosPrivate, careTeam, todoId);
    if (resourceId) return getCareTeamNotesForResource(axiosPrivate, careTeam, resourceId);
    throw new Error("Input not defined");
  };

  const notesQuery = useQuery<PaginatedNoteResponse>({
    queryKey,
    queryFn,
    enabled: !!queryKey,
  });

  function getInputText(): string {
    if (!!clipId) {
      return "video";
    }
    if (!!glossaryTermId) {
      return "glossary term";
    }
    if (!!resourceId) {
      return "resource";
    }
    if (!!todoId) {
      return "task";
    }
    return "item";
  }

  return (
    <div className="flex flex-col gap-2 flex-grow">
      {/*Heaader*/}
      <div>
        <h3 className="text-primary_alt text-4xl pb-2">
          Notes
        </h3>
        {notesQuery?.data?.results.length > 0 && (
         <div className="text-sm">
            These notes are associated with this glossary term.
          </div>
        )}
      </div>

      {/*Note input area*/}
      <NewNote clipId={clipId} glossaryTermId={glossaryTermId} resourceId={resourceId} todoId={todoId}/>

      {/*Existing Notes*/}
      <div className="overflow-y-scroll max-h-[calc(3*5rem)] scrollbar">
        {notesQuery?.data?.results.length > 0 ? (
          notesQuery?.data?.results.map((note: any) => (
            <div key={note.id} className="flex items-center p-2">
              <NoteCard note={note} cardColor={"bg-primary bg-opacity-10"} right={note.userId === user.id} includeAttachment={false}/>
            </div>
          ))
        ) : (
          <div className="text-xl text-center py-6 px-5">
            There aren't any team notes associated with this {getInputText()} yet.
          </div>
        )}
      </div>

      <Link
        id="GoToNotesButton"
        className="link-primary text-xl flex pt-4"
        to={'/my-notes'}
      >
        go to notes
        <div className="w-[0.5em] rotate-180 ml-2 text-color-400"><ChevronIcon /></div>
      </Link>
    </div>
  )
}

export default NotesSection
