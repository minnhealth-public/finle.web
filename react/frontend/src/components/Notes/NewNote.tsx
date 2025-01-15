import React, { useRef } from 'react'
import UserCircle from '../../shared/View/UserCircle';
import { useStore } from '../../store';
import { NoteArrow } from '../../shared/Icon';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  PostNote,
  createCareTeamNote,
} from '../../api/notes';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

interface NewNoteProps {
  clipId?: number,
  glossaryTermId?: number
  resourceId?: number
  todoId?: number
}

const NewNote: React.FC<NewNoteProps> = ({
  clipId,
  glossaryTermId,
  resourceId,
  todoId,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const textInputRef = useRef(null);
  const { user, careTeam } = useStore();

  const createNoteMutation = useMutation({
    mutationFn: (postNote: PostNote) =>
      createCareTeamNote(axiosPrivate, postNote),
    onSuccess: () => {
      //clear value of input after success
      textInputRef.current.value = null
      queryClient.invalidateQueries({ queryKey: ['careTeamNotes', careTeam.id] })
      queryClient.invalidateQueries({ queryKey: ['notesForClip', careTeam.id] })
      queryClient.invalidateQueries({ queryKey: ['notesForTerm', careTeam.id] })
      queryClient.invalidateQueries({ queryKey: ['notesForResource', careTeam.id] })
      queryClient.invalidateQueries({ queryKey: ['notesForTask', careTeam.id] })
    }
  });

  function addNewNote(event: any) {
    event.preventDefault();
    createNoteMutation.mutate({
      userId: user.id,
      teamId: careTeam.id,
      clipId: clipId,
      glossaryId: glossaryTermId,
      resourceId: resourceId,
      taskId: todoId,
      text: textInputRef.current.value
    })

    return false;
  }

  return (
  <div className="bg-white-1 p-3 my-3 w-full rounded-lg">
    <form className="flex md:flex-row gap-2 items-center " onSubmit={addNewNote}>
      <UserCircle
        className="w-5 h-5 "
        firstName={user.firstName}
        lastName={user.lastName}
        email={user.email} />
      <input
        required
        name="videoComment"
        type="text"
        role="input"
        ref={textInputRef}
        placeholder="Type your note here..."
        className="border-2 flex-1 border-transparent min-w-0 placeholder:text-lg"
      />
      <div className="flex justify-end justify-self-end">
        <button
          disabled={createNoteMutation.isPending}
          type="submit"
          aria-label='send'
          className="
              w-10 h-10 md:w-15 md:h-15
              text-primary hover:text-primary_alt active:text-primary_alt focus:text-primary_alt hover:font-bold
              active:font-bold cursor-pointer"
        >
          <NoteArrow />
        </button>
      </div>
    </form >
  </div >
 )
}

export default NewNote
