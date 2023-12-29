import React, { ReactNode, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMultiply } from '@fortawesome/free-solid-svg-icons';

interface ModalProps {
  isOpen: boolean;
  disableClose?: boolean;
  onClose: () => void;
  children?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, disableClose, onClose, children }) => {
  const [isModalOpen, setModalOpen] = useState(isOpen);
  const [showClose, setShowClose] = useState(
    !(typeof disableClose !== undefined
    && disableClose)
  )

  const handleClose = () => {
    setModalOpen(false);
    onClose();
  };

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen])

  return (
    <>
      {isModalOpen && (
        <div data-testid="modal" className="overscroll-contain overflow-auto fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="flex items-center justify-center mt-[10vh]">
            <div className="mx-auto md:max-w-6xl overflow-visible relative p-14 bg-white-1 bg-opacity-100 rounded-md shadow-md">
              { showClose &&
              <button
                onClick={handleClose}
                className="absolute top-0 right-0 py-2 px-3 text-teal-500 hover:text-teal-400 focus:outline-none"
              >
                  <FontAwesomeIcon icon={faMultiply}/>
              </button>
              }
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
