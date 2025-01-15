import React from 'react';
import { Modal } from '../../shared/View';
import { GlossaryItem } from '../../models';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RelatedClip, RelatedGlossaryItem } from '../../models/glossary';
import { NotesSection } from '../NotesSection';

interface GlossaryModalProps {
  item: GlossaryItem | null;
}

const GlossaryModal: React.FC<GlossaryModalProps> = ({ item }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigate();

  const closeModal = () => {
    searchParams.delete("term");
    setSearchParams(searchParams);
  }

  const onRelClick = (relItem: RelatedGlossaryItem) => {
    searchParams.set("term", relItem.id.toString());
    setSearchParams(searchParams);
  }

  const onClipClick = (relClip: RelatedClip) => {
    navigation(`/videos/${relClip.id}`);
  }

  if (item === null) return <div></div>

  return <Modal open onClose={() => closeModal()}>
    <div className="flex flex-col gap-2 w-[65vw]">
      <h2 className="text-5xl text-header">{item.term}</h2>
      <p className="text-lg font-semibold">{item.definition}</p>
      <div className="flex flex-row text-lg">
        <p className="pr-2 italic">Source:</p>
        <a className="hover:underline break-all" target="_blank" href={item.source} rel="noreferrer">{item.source}</a>
      </div>
      {item?.relatedTerms?.length > 0 &&
        <div>
          <h3 className="text-xl">Related terms</h3>
          <div className="flex flex-wrap">
            {item?.relatedTerms.map(
              (relTerm: RelatedGlossaryItem, idx: number) => (
                <button
                  key={idx}
                  className="text-lg italic text-left font-bold hover:text-primary_alt active:text-primary_alt"
                  onClick={() => onRelClick(relTerm)}
                >
                  {relTerm?.term}
                  {idx + 1 < item?.relatedTerms?.length ? <span>{","}&nbsp;</span> : ""}
                </button>
              )
            )}
          </div>
        </div>
      }

      {item?.relatedClips?.length > 0 &&
        <>
          <h3 className="text-xl">Related clips</h3>
          <div className="flex flex-wrap">
            {item?.relatedClips.map(
              (relClip: RelatedClip, idx: number) => (
                <button
                  key={idx}
                  className=" italic text-left font-bold hover:text-primary_alt active:text-primary_alt"
                  onClick={() => onClipClick(relClip)}
                >
                  {relClip?.name}
                  {idx + 1 < item?.relatedClips?.length ? <span>{","}&nbsp;</span> : ""}
                </button>
              )
            )}
          </div>
        </>
      }
      <div className="md:basis-1/2 flex flex-col bg-white-50 py-6 rounded-lg mt-10 px-8">
        <NotesSection glossaryTermId={item.id} />
      </div>
    </div>
  </Modal>
}

export default GlossaryModal;
