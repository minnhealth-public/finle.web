import React, {useContext} from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import NotesSection from './NotesSection';
import '@testing-library/jest-dom';

// Mocking the useContext function
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

describe('NotesSection Component', () => {
  beforeEach(() => {
    // Mocking the ShortContext value
    (useContext as jest.Mock).mockReturnValue({});
  });

  it('renders the component correctly', () => {
   render(<NotesSection />);

    const inputElement = screen.getByPlaceholderText('Leave your comments here');
    const submitButton = screen.getByText('Send');

    expect(inputElement).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('calls addNewNote function when the form is submitted', () => {
    render(<NotesSection />);
    const inputElement = screen.getByPlaceholderText('Leave your comments here');
    const submitButton = screen.getByText('Send');

    // Type a comment in the input
    fireEvent.change(inputElement, { target: { value: 'Test comment' } });

    // Submit the form
    fireEvent.click(submitButton);

    // You can add more assertions based on the expected behavior of your addNewNote function
    // For example, you can check if the function is called with the correct parameters or if it logs the message
    // expect(console.log).toHaveBeenCalledWith('Add new note');
  });

  it('prevents default form submission and logs "Add new note"', () => {
    render(<NotesSection />);
    const inputElement = screen.getByPlaceholderText('Leave your comments here');
    const submitButton = screen.getByText('Send');

    // Spy on console.log to check if it's called
    jest.spyOn(console, 'log');

    // Submit the form
    fireEvent.click(submitButton);

    // Ensure addNewNote is not called (since we're preventing default form submission)
    expect(console.log).toHaveBeenCalledWith('Add new note');
  });

  // Add more tests as needed based on your component's behavior
});
