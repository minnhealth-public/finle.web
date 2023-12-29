import React from 'react';
import { Modal } from '../../shared/View';
import { GlossaryItem } from '../../models';
import { useSearchParams } from 'react-router-dom';

interface GlossaryModalProps {
  item: GlossaryItem | null;
  relatedTerms: GlossaryItem[];
}

const GlossaryModal: React.FC<GlossaryModalProps> = ({item, relatedTerms}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const closeModal = () => {
    searchParams.delete("term");
    setSearchParams(searchParams);
  }

  const onRelClick = (item: GlossaryItem) => {
    searchParams.set("term", item.id.toString());
    setSearchParams(searchParams);
  }

  if (item === null) return <div></div>

  return <Modal isOpen onClose={() => closeModal()}>
    <div className="flex flex-col gap-3">
      <h2 className="text-3xl text-blue-450">{item.term}</h2>
      <p>{item.definition}</p>
      <h3 className="text-xl">Source</h3>
      <a target="_blank" href={item.source} rel="noreferrer">{item.source}</a>

      <h3 className="text-xl">Related terms</h3>
      <div className="flex flex-wrap">
        {relatedTerms.map(
          (item: GlossaryItem, idx:number) => (
            <button
              key={idx}
              className=" italic text-left font-bold hover:text-teal-500 active:text-teal-500"
              onClick={() => onRelClick(item)}
            >
              {item.term}
              {idx+1 < relatedTerms.length?<span>{","}&nbsp;</span>:""}
            </button>
          )
        )}
      </div>

      <h3 className="text-xl">Related clips</h3>
    </div>
  </Modal>
}

export default GlossaryModal;
