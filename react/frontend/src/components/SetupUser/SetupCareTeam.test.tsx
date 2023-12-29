import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SetupCareTeam from './SetupCareTeam';

describe('SetupCareTeam Component', () => {
  test('renders SetupCareTeam component', () => {
    render(<SetupCareTeam nextStep={() => {}} />);

    // Assert that the component renders without crashing
    expect(screen.getByText(/You're almost done./)).toBeInTheDocument();
  });
  test('adds a care team member', async () => {
    render(<SetupCareTeam nextStep={() => {}} />);

    // Simulate adding a care team member
    fireEvent.change(screen.getByLabelText(/First Name/), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Relation or connection/), { target: { value: 'Family Member' } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'john.doe@example.com' } });

    fireEvent.click(screen.getByText(/Add Another Person/));
    await screen.findByText(/John Doe/)

    // Assert that the new care team member is added
    expect(screen.getByText(/John Doe john.doe@example.com/)).toBeInTheDocument();
  });

  test('edits a care team member', async () => {
    render(<SetupCareTeam nextStep={() => {}} />);

    // Simulate adding a care team member
    const firstName: HTMLInputElement = screen.getByLabelText(/First Name/);
    fireEvent.change(firstName, { target: { value: 'Jane' } });

    expect(firstName.value).toBe('Jane')

    fireEvent.change(screen.getByLabelText(/Last Name/), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Relation or connection/), { target: { value: 'Family Member' } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'jane.doe@example.com' } });

    fireEvent.click(screen.getByText(/Add Another Person/));
    await screen.findByText(/Jane Doe/)
    // Assert that the new care team member is added
    expect(screen.getByText(/Jane Doe jane.doe@example.com/)).toBeInTheDocument();

    // Simulate editing the added care team member
    fireEvent.click(screen.getByText(/edit/));

    await screen.findByText(/Family Member/)
    // Update the email
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'edited.email@example.com' } });

    // Submit the form to save changes
    fireEvent.click(screen.getByText(/Add Another Person/));

    await screen.findByText(/Jane Doe/)
    // Assert that the edited care team member is displayed
    expect(screen.getByText(/Jane Doe edited.email@example.com/)).toBeInTheDocument();
  });

  // Add more test cases based on your component's behavior.
});
