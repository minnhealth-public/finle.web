import React from 'react';
import { GlossaryItem } from '../../models';
import GlossaryListItem from './GlossaryListItem';

interface GlossaryLetterGroupingProps {
  letter: string
  terms: GlossaryItem[];
}

const GlossaryLetterGrouping: React.FC<GlossaryLetterGroupingProps> = ({ letter, terms}) => {
  return (
    <div className="flex flex-col">
      <h3 className="font-normal text-xl">{letter}</h3>
      {terms.map((item) =>
        <GlossaryListItem key={item.id} item={item}/>
      )}
    </div>
  );
};

export default GlossaryLetterGrouping;
