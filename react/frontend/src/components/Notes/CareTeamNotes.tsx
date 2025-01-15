import React from 'react';
import { CareTeam } from '../../models/careTeam';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Note } from '../../models/note';
import { axiosPrivate } from '../../api/axios';
import { PaginatedNoteResponse, getCareTeamNotes } from '../../api/notes';
import Discussion from './Discussion';
import Pinned from './Pinned';
import PleaseCreateTeam from '../PleaseCreateTeam';

interface CareTeamNotesProps {
  careTeam?: CareTeam;
}

const CareTeamNotes: React.FC<CareTeamNotesProps> = ({ careTeam }) => {

  const [searchParams, setSearchParams] = useSearchParams();

  const careTeamNotesQuery = useQuery<PaginatedNoteResponse>({
    queryKey: ["careTeamNotes", careTeam?.id],
    queryFn: () => getCareTeamNotes(axiosPrivate, careTeam)
  });

  const showContent = () => {
    if (!careTeam)
      return <PleaseCreateTeam />

    if (searchParams.get("noteTab") === "discussion" || searchParams.get("noteTab") == null)
      return <Discussion />
    if (searchParams.get("noteTab") === "pinned")
      return <Pinned notes={careTeamNotesQuery?.data?.results.filter((note: Note) => note.pinned)} />
  }

  return (
    <div className="my-8 ">
      <div className="sm:flex flex-row sm:space-x-12">
        <div className="mb-6">
          <h2
            className={`pb-4 px-2 text-2xl font-semibold mb-2 cursor-pointer ${(searchParams.get("noteTab") === "discussion" || searchParams.get("noteTab") == null) ? "border-b-4 border-solid border-primary" : ""}`}
            onClick={() => {
              setSearchParams(params => {
                params.set("noteTab", "discussion");
                return params;
              })
            }}
          >
            Discussion
          </h2>

          {/* Discussion content goes here */}
        </div>

        <div className="mb-6">
          <h2
            className={`pb-4 px-2 text-2xl font-semibold mb-2 cursor-pointer ${(searchParams.get("noteTab") === "pinned") ? "border-b-4 border-solid border-primary" : ""}`}
            onClick={() => {
              setSearchParams(params => {
                params.set("noteTab", "pinned");
                return params;
              })
            }}
          >
            Pinned
          </h2>
          {/* Pinned content goes here */}
        </div>

      </div>
      {showContent()}
    </div>
  );
};

export default CareTeamNotes;
