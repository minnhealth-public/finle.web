import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom';
import * as ReactQuery from "@tanstack/react-query";
import ResourcePage from './ResourcePage';
import { AuthProvider } from '../../contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import axios from '../../api/axios';
import Resource from '../../models/resource';
const nock = require('nock')

const mockResources: Resource[] = [
  {
    id: "1",
    title: "Resource 1",
    description: "this is a description",
    link: "http://google.com",
    type: "default",
    isFree: true,
    requiresAccount: true
  },
  {
    id: "2",
    title: "Resource 2",
    description: "Different description",
    link: "http://google.com",
    type: "default",
    isFree: true,
    requiresAccount: true
  },
];

const mockUser: any  = { user: { lastLogin: null } };
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

const wrapper = (children:any, query?: string) => {
  const entries = [];
  const internals = (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {children}
    </AuthProvider>
  </QueryClientProvider>
  );

  if(query){
    entries.push(`?query=${query}`)
    return (
      <MemoryRouter initialEntries={entries}>
        {internals}
      </MemoryRouter>
    )
  }
  return (
    <MemoryRouter>
      {internals}
    </MemoryRouter>
  )
}

describe('ResourcePage Component', () => {
  beforeEach(() => {
    mockUser.user = mockUser;
    nock('http://localhost:80').post('/api/auth/register').reply(201, {access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA2NzIyMzE2LCJpYXQiOjE3MDY3MTg3MTYsImp0aSI6Ijc4ZTYzMDQ1ZDVmYzQ5OGVhMTRhNzA5NzEwYmZiMmU3IiwidXNlcl9pZCI6MTQsImZpcnN0TmFtZSI6ImJlbiIsImxhc3ROYW1lIjoibWV0IiwiZW1haWwiOiJib2JAbWV0emdlci5jYyIsImxhc3RMb2dpbiI6bnVsbH0.3iJJQqdukTaTVTVQhtAoyqIM5p1yTAFbhSgEagSx868"})
    nock('http://localhost:80').get('/api/resources').reply(200, mockResources)
  });

  test('renders ResourcePage as logged in user', () => {
    render(wrapper(<ResourcePage/>));
    // Assert that the modal is rendered.
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });

  test('Should display resources', async () => {
    render(wrapper(<ResourcePage/>));
    expect(await screen.findByText('Resource 1')).toBeInTheDocument();
    expect(await screen.findByText('Resource 2')).toBeInTheDocument();
  });

  test('Should filter resources', async () => {
    render(wrapper(<ResourcePage/>, "Different"));
    expect(await screen.findByText('Resource 2')).toBeInTheDocument();

    expect(screen.queryByText('Resource 1')).not.toBeInTheDocument();
  });

  // Add more test cases based on your component's behavior.
});
