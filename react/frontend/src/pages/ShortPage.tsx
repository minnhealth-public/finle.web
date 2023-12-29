import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {useQuery} from "@tanstack/react-query";
import Short from '../components/Short';
import NotesSection from '../components/NotesSection';
import { ShortContext } from '../contexts/ShortContext';
import { getShort } from '../api/shorts';
import { Video } from '../models';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Arrow } from '../shared/Icon';


const ShortPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const shortId: string | undefined = params.id;

  const shortQuery = useQuery<Video, Error>({
    queryKey: ["shorts", shortId],
    queryFn: () => getShort(shortId)
  });

  if (shortQuery.isLoading) return <>Loading...</>

  if (shortQuery.isError) {
    console.error("Had issue fetching short", shortQuery.error)
  }

  return (
    <div className="container mx-auto">
      <div className="p-4">
        <Link
          to='/videos'
          className={`
           hover:text-teal-500
           active:text-teal-500
            block lg:inline-block
            whitespace-nowrap
            uppercase
            font-semibold
            text-teal-400
            py-3
            text-sm
          `}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-2"/> Back to all
        </Link>
        <h1 className="flex flex-row align-baseline relative text-xl">
          <a className="absolute -left-8 top-1 text-teal-400" href="/shorts/"><Arrow className="w-5"/></a>
          {shortQuery.data.name}
          <a className="absolute -right-8 top-1 text-teal-400" href="/shorts/"><Arrow right className="w-5"/></a>
        </h1>
      </div>
      <div>
        <div>
          <ShortContext.Provider value={shortQuery.data}>
            <Short />
          </ShortContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default ShortPage;
