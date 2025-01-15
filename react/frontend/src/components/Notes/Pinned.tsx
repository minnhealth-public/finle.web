import React from "react";
import { Note } from "../../models/note"
import NoteCard from "./NoteCard";

interface PinnedProps {
  // Add any props you might need for the Discussion component
  notes: Note[]
}

const Pinned: React.FC<PinnedProps> = ({ notes }) => {

  return (
    <>
      <div className="flex flex-col space-y-4">
        {notes?.map((note: Note, idx: number) => {
          let cardColor = "";
          let isRight = false;
          // switch side depending on if the previous comment was a different user

          if (idx % 2 === 1 && notes[idx - 1].userId !== note.userId) {
            isRight = true;
            cardColor = "bg-primary bg-opacity-10"
          }
          return <NoteCard
            key={idx}
            note={note}
            cardColor={cardColor}
            right={isRight} />
        })}

      </div>
    </>
  );

}

export default Pinned;
