import React, { useContext, useState } from 'react';
import { Modal } from '../../shared/View';
import CareTeamMemberForm from '../../shared/View/CareTeamEdit/CareTeamMemberForm';
import CareTeamContext from '../../contexts/CareTeamContext';


const CareMemberAdd: React.FC = () => {
  // Currenlty we have no image for the user
  const [isCareTeamModalOpen, setIsCareTeamModalOpen] = useState<boolean>(false);
  const { setCurrentMember, careTeam } = useContext(CareTeamContext);

  return (
    <>
      <div className="flex items-center flex-col">
        <button
          className="hover:text-primary text-primary_alt uppercase font-extrabold text-sm"
          aria-label="addMember"
          onClick={() => {
            setIsCareTeamModalOpen(true)
            setCurrentMember(null);
          }}>
          <div className="relative w-20 h-20">
            <div className="w-full h-full bg-gray-300 rounded-full flex flex-row">
            </div>
          </div>

          <div className="mt-2 text-center">
            <p>
              Add Member
            </p>
          </div>
        </button>
      </div>
      {isCareTeamModalOpen &&
        <Modal
          open={isCareTeamModalOpen}
          onClose={() => {
            setIsCareTeamModalOpen(false)
            setCurrentMember(null);
          }}
        >
          <div className="flex flex-col">
            <h2 className="text-3xl">{careTeam.name}</h2>
            <h2 className="text-5xl text-header ">Add Member</h2>
            <p className="text-lg pb-10">An invite will be sent out to the email below for the user to create their account.</p>
            <CareTeamMemberForm onSubmit={() => setIsCareTeamModalOpen(false)} />
          </div>
        </Modal>
      }
    </>
  )
}

export default CareMemberAdd;
