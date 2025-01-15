import React, { } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchInput } from '../../shared/Form';
import { GlossaryResults } from '../../components/Glossary';
import {PageSubtitle, PageTitle} from '../../shared/View';


const GlossaryPage: React.FC = () => {
  const [_, setSearchParams] = useSearchParams();

  const clearAll = () => {
    setSearchParams({});
  }

  return (
    <div id="glossary-page" className="container mx-auto mb-14">
      <div id="glossary-title" className="flex flex-col gap-5">
        <PageTitle>Glossary</PageTitle>
        <div className="mb-4 md:flex md:flex-row align-center justify-between items-baseline">
          <PageSubtitle>Don't let unfamiliar words or concepts slow down your planning. Look them up in our glossary to find clear
            definitions.</PageSubtitle>

        </div>
        <div className="flex">
          <SearchInput />
          <button
            className="
              mx-6 font-sans text-gray-350 font-bold uppercase text-md bold
              hover:text-gray-400 active:text-gray-400 focus:text-gray-400
            "
            onClick={() => clearAll()}>reset</button>
        </div>
        <GlossaryResults></GlossaryResults>
      </div>
    </div>
  );
};

export default GlossaryPage;
