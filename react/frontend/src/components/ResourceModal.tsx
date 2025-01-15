import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { NotesSection } from './NotesSection';
import { Modal } from '../shared/View';
import Resource from '../models/resource';

interface ResourceModalProps {
  resource: Resource | null;
}

const ResourceModal: React.FC<ResourceModalProps> = ({ resource }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const closeModal = () => {
    searchParams.delete("resource");
    setSearchParams(searchParams);
  }

  return <Modal open onClose={() => closeModal()}>
    <div className="flex flex-col gap-2 w-[65vw]">
      <h2 className="text-3xl text-header">{resource.title}</h2>
      <p>{resource.description}</p>
      <div className="mt-4">
        <Link className="btn-primary" to={resource.link} target="_blank">
          Open Resource
        </Link>
      </div>
      <div className="flex flex-col bg-white-50 mt-10 md:px-8 px-2 md:py-8 py-2 rounded-lg">
        <NotesSection resourceId={resource.id} />
      </div>
    </div>
  </Modal>
}

export default ResourceModal;
