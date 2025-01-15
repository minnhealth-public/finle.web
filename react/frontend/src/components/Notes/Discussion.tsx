import React, { useEffect, useRef, useState } from 'react';
import { Note } from '../../models/note';
import NoteCard from './NoteCard';
import { useStore } from '../../store';
import { useQuery } from '@tanstack/react-query';
import { PaginatedNoteResponse, getCareTeamNotes } from '../../api/notes';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import humps from 'humps';
import Spinner from '../../shared/Spinner';
import NewNote from "./NewNote.tsx";

interface DiscussionProps {
  // Add any props you might need for the Discussion component
}

const Discussion: React.FC<DiscussionProps> = ({ }) => {
  let { careTeam, user } = useStore();
  const axiosPrivate = useAxiosPrivate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [nextPage, setNextPage] = useState<string>(null);
  const [pageIdx, setPageIdx] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(null);
  const [lastElement, setLastElement] = useState(null);

  const careTeamNotesQuery = useQuery<PaginatedNoteResponse>({
    queryKey: ["careTeamNotes", careTeam?.id],
    queryFn: () => getCareTeamNotes(axiosPrivate, careTeam)
  });

  useEffect(() => {
    if (!!careTeamNotesQuery.data) {
      setNotes(careTeamNotesQuery.data.results);
      setNextPage(careTeamNotesQuery.data.next);
      setTotalCount(careTeamNotesQuery.data.count);
    }
  }, [careTeamNotesQuery.data])

  useEffect(() => {
    if (!!nextPage) {
      callNextNotes();
    }
  }, [pageIdx])

  const callNextNotes = async () => {
    setIsLoading(true);
    let resp: PaginatedNoteResponse = humps.camelizeKeys(
      (await axiosPrivate.get(nextPage)).data
    ) as PaginatedNoteResponse;
    setNextPage(resp.next);
    setNotes([...notes, ...resp.results])
    setIsLoading(false);
  }

  const observer = useRef(
    new IntersectionObserver(
      (entries: any) => {
        const first = entries[0];
        if (first.isIntersecting) {
          setPageIdx((pageNumber) => pageNumber + 1);
        }
      }
    )
  )
  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = observer.current;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastElement]);

  return <>
    <div className="flex flex-col space-y-4">
      <div className="bg-slate-300 bg-opacity-20 rounded-lg px-4">
        <NewNote />
      </div>
      {notes.map((note: Note, idx: number) => {
        let cardColor = "";
        let isRight = false;
        // switch side depending on if the previous comment was a different user

        if (idx % 2 === 1 && notes[idx - 1].userId !== note.userId || note.userId === user.id) {
          isRight = true;
          cardColor = "bg-primary bg-opacity-10"
        }
        if (idx === notes.length - 1) {
          return <div key={idx} ref={setLastElement} >
            <NoteCard note={note} cardColor={cardColor} right={isRight} />
          </div>
        } else {
          return <NoteCard key={idx} note={note} cardColor={cardColor} right={isRight} />
        }
      })}
      {isLoading && <Spinner />}

    </div>
  </>
};

export default Discussion;
