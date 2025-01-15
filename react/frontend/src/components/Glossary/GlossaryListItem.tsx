import React from 'react';
import { GlossaryItem } from '../../models';
import { useSearchParams } from 'react-router-dom';
import DesktopIcon from '../../shared/Icon/DesktopIcon';

interface GlossaryListItemProps {
  item: GlossaryItem;
  idx: number;
}

const GlossaryListItem: React.FC<GlossaryListItemProps> = ({ item, idx }) => {

  let [searchParams, setSearchParams] = useSearchParams();

  const setActiveTerm = () => {
    searchParams.set("term", item.id.toString());
    setSearchParams(searchParams);
  }

  return (
    <button
      className="text-left flex flex-row items-center gap-3 hover:text-primary active:text-primary cursor-pointer"
      onClick={() => setActiveTerm()}>
      <div id={`term-${idx}`} className="text-lg">{item.term}</div>
      {item.relatedClips.length > 0 &&
        <div data-testid="desktop-icon" className="mr-2 w-4">
          <DesktopIcon />
        </div>
      }
    </button>
  );
};

export default GlossaryListItem;
