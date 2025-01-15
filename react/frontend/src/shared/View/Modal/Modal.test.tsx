import React, { useRef } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Modal from './Modal';

describe('Modal Component', () => {
  test('Ensure showModal', () => {
    const modalRef = React.createRef();
    render(<div>
      <button onClick={() => modalRef.current.showModal()}>Open</button>
      <Modal ref={modalRef} onClose={() => { }} />
    </div>);

    fireEvent.click(screen.getByText('Open'));
    // Assert that the modal is not rendered.
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
  });

  test('calls onClose when close button is clicked', () => {

    const onCloseMock = jest.fn();
    render(<Modal onClose={onCloseMock} />);

    // Click the close button.
    fireEvent.click(screen.getByLabelText('close'));

    // Assert that onClose was called.
    expect(onCloseMock).toHaveBeenCalled();
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
  });

  // Add more test cases based on your component's behavior.
});
