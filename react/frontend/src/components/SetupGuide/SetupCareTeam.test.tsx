import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom';
import SetupCareTeam from './SetupCareTeamMembers';
import { AuthProvider } from '../../contexts/AuthContext';
import { CareTeamProvider } from '../../contexts/CareTeamContext';
import { MemoryRouter } from 'react-router-dom';
import * as ReactQuery from "@tanstack/react-query";
import { CareTeam, CareTeamMember } from '../../models/careTeam';
import axios from '../../api/axios';
const nock = require('nock')

const mockUser: any  = { user: { lastLogin: null } };

const dummyCareTeam: CareTeam = {
  id: 1,
  name: 'My Care Team',
  members: [],
};
const dummyMember: CareTeamMember = {
  teamId: 1,
  memberId: 1,
  relation: 'Family Member',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  isCareteamAdmin: true,
}

jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  default: () => (mockUser),
}));

let mock_axios = axios;

jest.mock('../../hooks/useAxiosPrivate', () => ({
  __esModule: true,
  default: () => mock_axios,
}));

const queryClient = new ReactQuery.QueryClient()

const wrapper = (children:any) => (
  <MemoryRouter initialEntries={["?careTeamId=1"]}>
      <ReactQuery.QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ReactQuery.QueryClientProvider>
  </MemoryRouter>
)

describe('SetupCareTeam Component', () => {
  // Add more test cases based on your component's behavior.
  beforeEach(() => {
   nock('http://localhost:80')
    .get('/api/care-teams/1')
    .reply(200, {...dummyCareTeam, members: [dummyMember]})

   nock('http://localhost:80')
    .put('/api/care-teams/1/members')
    .reply(200, {...dummyCareTeam, members: [dummyMember]})
  })

  test('adds a care team member', async () => {
    render(wrapper(<CareTeamProvider careTeam={dummyCareTeam}><SetupCareTeam nextStep={() => {}}/></CareTeamProvider>));
    const email = 'john.doe@example.com'

    // Simulate adding a care team member
    fireEvent.change(screen.getByPlaceholderText(/Email/), { target: { value: email } });
    fireEvent.change(screen.getByPlaceholderText(/Relation or connection/), { target: { value: 'Family Member' } });

    userEvent.click(screen.getByText(/Add Member/));

    await screen.findByText(/john.doe@example.com/)

    // Assert that the new care team member is added
    await waitFor(() => {
      expect(screen.getByText(/john.doe@example.com/)).toBeInTheDocument();
    })
  });
  /*
  test('edits a care team member', async () => {
    render(wrapper(<CareTeamProvider careTeam={dummyCareTeam}><SetupCareTeam nextStep={() => {}}/></CareTeamProvider>));

    // Simulate adding a care team member
    fireEvent.change(screen.getByPlaceholderText(/Email/), { target: { value: 'jane.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Relation or connection/), { target: { value: 'Family Member' } });
    expect(screen.getByDisplayValue('jane.doe@example.com')).toBeInTheDocument();

    userEvent.click(screen.getByText(/Add Member/));
    // Assert that the new care team member is added
    await screen.findByText(/jane.doe@example.com/)
    expect(screen.getByText(/jane.doe@example.com/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Jane')).toBeFalsy();

    // Simulate editing the added care team member
    userEvent.click(screen.getByText(/edit/));

    expect(screen.getByDisplayValue('jane.doe@example.com')).toBeInTheDocument();

    // Update the email
    fireEvent.change(screen.getByPlaceholderText(/Email/), { target: { value: 'edited.email@example.com' } });

    // Submit the form to save changes
    fireEvent.click(screen.getByText(/Update Member/));

    await screen.findByText(/edited.email@example.com/)
    // Assert that the edited care team member is displayed
    expect(screen.getByText(/edited.email@example.com/)).toBeInTheDocument();
  });
  */
});
