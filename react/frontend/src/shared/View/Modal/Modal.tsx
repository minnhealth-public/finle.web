import React, {
  DialogHTMLAttributes,
  ForwardedRef,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import XMarkIcon from '../../Icon/XMarkIcon';

interface ModalProps extends DialogHTMLAttributes<HTMLDialogElement> {
  disableClose?: boolean
  onClose: () => void
  children?: ReactNode
}

const Modal = forwardRef<HTMLDialogElement, ModalProps>((
  { open, disableClose, onClose, children, ...props },
  ref: ForwardedRef<HTMLDialogElement>
) => {
  const dialogRef = useRef(null);


  // Expose the internal dialogRef methods to the parent component
  useImperativeHandle(ref, () => dialogRef.current, []);

  useEffect(() => {
    if (open) {
      dialogRef?.current?.showModal();
    } else {
      dialogRef?.current?.close();
    }
  }, [open]);

  const handleClose = () => {
    dialogRef?.current?.close();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      data-id="modal"
      data-testid="modal"
      className={`rounded-md break-word overflow-hidden backdrop:bg-opacity-80 backdrop:bg-black animate-[reveal_1s_ease-in-out] ${props.className}`}
    >
      <div className="flex items-center justify-center">
        <div className="mx-auto md:max-w-6xl overflow-visible relative py-10 px-5 bg-white-1 bg-opacity-100 rounded-md shadow-md">
          {!disableClose &&
            <button
              aria-label="close"
              onClick={handleClose}
              tabIndex={2}
              className="
              transition duration-300
              absolute rounded-full top-0 right-0 w-6 h-6 p-1  m-1
               text-primary_alt hover:bg-primary hover:text-white-1
               focus:bg-primary focus:text-white-1 focus:outline-none
            "
            >
              <XMarkIcon />
            </button>
          }
          <div className="overflow-y-auto overflow-x-hidden max-h-[80vh] scrollbar p-2">
            {children}
          </div>
        </div>
      </div>
    </dialog>
  );
});

export default Modal;
