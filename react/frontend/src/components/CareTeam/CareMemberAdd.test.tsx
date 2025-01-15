import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // for additional matchers
import CareMemberAdd from './CareMemberAdd';
import { CareTeamProvider } from '../../contexts/CareTeamContext';
import { CareTeam } from '../../models/careTeam';
import { AuthProvider } from '../../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import * as ReactQuery from "@tanstack/react-query";


const dummyCareTeam: CareTeam = {
  id: 1,
  name: 'My Care Team',
  members: [
    {
      teamId: 1,
      memberId: 1,
      relation: 'Family Member',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      isCareteamAdmin: true,
    },
  ],
};

const mockUser: any  = { user: { lastLogin: null } };
jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  default: () => (mockUser),
}));

jest.mock('../../api/axios', () => ({
  axiosPrivate: jest.fn()
}))
jest.mock('../../hooks/useAxiosPrivate', () => ({
  __esModule: true,
  default: () => ({}),
}));

// Mock the react-query hook
jest.mock('@tanstack/react-query', () => {
  const original: typeof ReactQuery = jest.requireActual("@tanstack/react-query");
  return {
        ...original,
        useQuery: jest.fn(),
        useMutation: jest.fn(),
  };
});

const queryClient = new ReactQuery.QueryClient()

const wrapper = (children:any) => (
  <MemoryRouter>
    <AuthProvider>
      <ReactQuery.QueryClientProvider client={queryClient}>
          {children}
      </ReactQuery.QueryClientProvider>
    </AuthProvider>
  </MemoryRouter>
)

describe('Add Member', () => {

  test('opens modal when "Add Member" button is clicked', async () => {
    render(wrapper(<CareTeamProvider careTeam={dummyCareTeam}><CareMemberAdd /></CareTeamProvider>));

    // Click the "Add Member" button
    const addButton = await screen.findByText(/Finish/i);

    fireEvent.click(addButton);

    // Check if the modal is opened
    const modalTitle = await screen.findByText(/An invite will be sent/i);
    expect(modalTitle).toBeInTheDocument();
  });
})
