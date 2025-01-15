import React, { useContext } from 'react';
import { render, fireEvent, screen, renderHook, act, prettyDOM } from '@testing-library/react';
import NotesSection from './NotesSection';
import { useStore } from '../../store';
import { User } from '../../models/user';

// Mocking the useContext function
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

let mockUser: User = {
  id: 3,
  lastLogin: "this is a date",
  firstName: "Fred",
  lastName: "Davis",
  email: "fred@davis.com",
}


describe('NotesSection Component', () => {
  beforeEach(() => {
    // Mocking the ShortContext value
    (useContext as jest.Mock).mockReturnValue({});
  });
  beforeAll(() => {
    useStore.setState({ user: mockUser });
  })
  afterAll(() => {
    useStore.setState({});
  })

  it('renders the component correctly', async () => {
    render(<NotesSection />);

    const inputElement = screen.getByPlaceholderText(/Leave yourself and your team a note.../);
    const submitButton = screen.getByRole('button', { name: 'send' });

    expect(inputElement).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('calls addNewNote function when the form is submitted', async () => {
    render(<NotesSection />);
    const inputElement = screen.getByPlaceholderText(/Leave yourself and your team a note.../);
    const submitButton = screen.getByRole('button', { name: 'send' });

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
    const inputElement = screen.getByPlaceholderText(/Leave yourself and your team a note.../);
    const submitButton = screen.getByRole('button', { name: 'send' });

    // Spy on console.log to check if it's called
    expect(inputElement).toBeInTheDocument();
    jest.spyOn(console, 'log');

    // Submit the form
    fireEvent.click(submitButton);

    // Ensure addNewNote is not called (since we're preventing default form submission)
    expect(console.log).toHaveBeenCalledWith('Add new note');
  });

  // Add more tests as needed based on your component's behavior
});
