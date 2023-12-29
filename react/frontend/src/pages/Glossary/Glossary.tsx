import React, { } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchInput } from '../../shared/Form';
import { GlossaryResults } from '../../components/Glossary';


const GlossaryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const clearAll = () => {
    setSearchParams({});
  }

  return (
    <div className="container mx-auto p-4">
        <div className="flex flex-col gap-5">
            <h1 className="text-7xl text-blue-450">Glossary</h1>
            <div className="mb-4 md:flex md:flex-row align-center justify-between items-baseline">
              <p className="rounded-font font-bold md:w-1/3 sm:w-full">
                Planning for the future can can be confusing.
                We've collected a list of hard to understand terms and phrases.
              </p>
              <div className="rounded-md border-2">
                <SearchInput/>
              </div>

            </div>
            <div>
              <button className="text-left hover:text-teal-500 active:text-teal-500" onClick={() => clearAll()}>Clear All</button>
            </div>
            <GlossaryResults></GlossaryResults>
        </div>
    </div>
  );
};

export default GlossaryPage;
