import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom';
import CareTeamMemberForm from './CareTeamMemberForm';
import { CareTeamProvider } from '../../../contexts/CareTeamContext';
import { AuthProvider } from '../../../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as ReactQuery from "@tanstack/react-query";

// Mock the react-query hook
jest.mock('@tanstack/react-query', () => {
  const original: typeof ReactQuery = jest.requireActual("@tanstack/react-query");
  return {
    ...original,
    useQuery: jest.fn(),
    useMutation: jest.fn(),
  };
});

const mockUser: any = { user: { lastLogin: null } };
jest.mock('../../../hooks/useAuth', () => ({
  __esModule: true,
  default: () => (mockUser),
}));

jest.mock('../../../api/axios', () => ({
  axiosPrivate: jest.fn()
}))

jest.mock('../../../hooks/useAxiosPrivate', () => ({
  __esModule: true,
  default: () => ({}),
}));

const queryClient = new QueryClient()
const wrapper = (children: any) => (
  <MemoryRouter>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CareTeamProvider>
          {children}
        </CareTeamProvider>
      </QueryClientProvider>
    </AuthProvider>
  </MemoryRouter>
)


describe('CareTeamMemberForm Component', () => {
  test('renders CareTeamMemberForm component', async () => {

    render(wrapper(<CareTeamMemberForm />));

    // Assert that the component renders without crashing
    expect(screen.getByText(/Add Member/)).toBeInTheDocument();
  });

  test('adds a care team member', async () => {
    render(wrapper(<CareTeamMemberForm />));

    expect(screen.getByText(/Finish/)).toBeInTheDocument();

    // Simulate adding a care team member
    userEvent.type(screen.getByLabelText(/Email/), 'john.doe@example.com');
    userEvent.type(screen.getByLabelText(/Relation or connection/), 'Family Member');

    // TODO this throws the warnings but wrapping it in act doesn't seem to fix it.
    userEvent.click(screen.getByText(/Finish/));

    await waitFor(() => { expect(screen.queryByText(/John/)).toBeFalsy(); })

  });

});
