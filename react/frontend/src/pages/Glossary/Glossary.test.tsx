import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom';
import * as ReactQuery from "@tanstack/react-query";
import Glossary from './Glossary';
import { AuthProvider } from '../../contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import axios from '../../api/axios';
const nock = require('nock')

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

describe('Glossary Component', () => {
  beforeEach(() => {
    mockUser.user = mockUser;
    nock('http://localhost:80').post('/api/auth/register').reply(201, {access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA2NzIyMzE2LCJpYXQiOjE3MDY3MTg3MTYsImp0aSI6Ijc4ZTYzMDQ1ZDVmYzQ5OGVhMTRhNzA5NzEwYmZiMmU3IiwidXNlcl9pZCI6MTQsImZpcnN0TmFtZSI6ImJlbiIsImxhc3ROYW1lIjoibWV0IiwiZW1haWwiOiJib2JAbWV0emdlci5jYyIsImxhc3RMb2dpbiI6bnVsbH0.3iJJQqdukTaTVTVQhtAoyqIM5p1yTAFbhSgEagSx868"})
  });

  test('renders Glossary', () => {
    render(wrapper(<Glossary/>));
   // Assert that the modal is rendered.
    expect(screen.getByText('Glossary')).toBeInTheDocument();
  });
})
