import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom';
import SetupUser from './SetupUser';

const mockUser: any  = { user: { lastLogin: null } };
jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  default: () => (mockUser),
}));

describe('SetupUser Component', () => {
  beforeEach(() => {
    mockUser.user.lastLogin = null;
  });

  test('renders SetupUser component with modal when lastLogin is null', () => {
    render(<MemoryRouter><SetupUser/></MemoryRouter>);
    // Assert that the modal is rendered.
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  test('renders SetupUser component without modal when lastLogin is not null', () => {
    mockUser.user.lastLogin = "something";

    render(<MemoryRouter><SetupUser/></MemoryRouter>);
    // Assert that the modal is not rendered.
    expect(screen.queryByTestId('modal')).toBeNull();
  });

  test('walk through steps', () => {
    render(<MemoryRouter initialEntries={['/step/0']}><SetupUser/></MemoryRouter>);

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // crisis
    expect(screen.getByText(/Are you currently in crisis or planning?/)).toBeInTheDocument();

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    // Change route to simulate progressing to the next step
    fireEvent.click(screen.getByText(/Next/));

    // concern
    expect(screen.getByText(/What are your bigest concerns?/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Next/));

    // decision method

    expect(screen.getByText(/How do you make your best decisions?/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Next/));

    // care team

    expect(screen.getByText(/Who should be on your care team?/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Submit/));
  });

  // Add more test cases based on your component's behavior.
});
