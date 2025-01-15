import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // for additional matchers
import CareTeamList from './CareTeamList';
import { CareTeamProvider } from '../../contexts/CareTeamContext';
import { CareTeam } from '../../models/careTeam';
import { AuthProvider } from '../../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import * as ReactQuery from "@tanstack/react-query";
import { useStore } from '../../store';

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
describe('CareTeamList Component', () => {

  beforeAll(() => {
    useStore.setState({user: mockUser});
  })
  afterAll(() => {
    useStore.setState({});
  })


  test('Shows the team title, member, and add', async () => {
    render(wrapper(<CareTeamProvider careTeam={dummyCareTeam}><CareTeamList careTeam={dummyCareTeam}/></CareTeamProvider>));

    const addButton = await screen.findByRole('button', {name: /addMember/i });
    const teamName = await screen.findByText(/My Care Team/i);
    const memberName = await screen.findByText(/John/i);

    expect(teamName).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
    expect(memberName).toBeInTheDocument();

  });
})
