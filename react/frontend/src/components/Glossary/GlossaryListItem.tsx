import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import { GlossaryItem } from '../../models';
import { useSearchParams } from 'react-router-dom';

interface GlossaryListItemProps {
  item : GlossaryItem;
}

const GlossaryListItem: React.FC<GlossaryListItemProps> = ({ item }) => {

  let [searchParams, setSearchParams] = useSearchParams();

  const setActiveTerm = () => {
    searchParams.set("term", item.id.toString());
    setSearchParams(searchParams);
  }

  return (
    <button
      className="text-left flex flex-row items-center gap-3 hover:text-teal-400 active:text-teal-400 cursor-pointer"
      onClick={() => setActiveTerm()}>
      <div className="">{item.term}</div>
      {item.related_clips.length > 0 &&
      <FontAwesomeIcon data-testid="desktop-icon" icon={faDesktop} className="mr-2 w-4" />
      }
    </button>
  );
};

export default GlossaryListItem;
