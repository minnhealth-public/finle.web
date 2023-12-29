import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Modal from './Modal';

describe('Modal Component', () => {
  test('renders Modal component when isOpen is true', () => {
    const {getByTestId} = render(<Modal isOpen={true} onClose={() => {}}/>);
    // Assert that the modal is rendered.
    expect(getByTestId('modal')).toBeTruthy();
  });

  test('does not render Modal component when isOpen is false', () => {
    const {queryByTestId} = render(<Modal isOpen={false} onClose={() => {}} />);
    // Assert that the modal is not rendered.
    expect(queryByTestId('modal')).toBeNull();
  });

  test('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    const {getByRole} = render(<Modal isOpen={true} onClose={onCloseMock} />);

    // Click the close button.
    fireEvent.click(getByRole('button'));

    // Assert that onClose was called.
    expect(onCloseMock).toHaveBeenCalled();
  });

  // Add more test cases based on your component's behavior.
});
