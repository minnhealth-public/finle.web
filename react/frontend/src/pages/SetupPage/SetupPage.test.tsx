import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom';
import * as ReactQuery from "@tanstack/react-query";
import SetupPage from './SetupPage';
import { AuthProvider } from '../../contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import axios from '../../api/axios';
const nock = require('nock')

const mockUser: any = { user: { lastLogin: null } };
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

const wrapper = (children: any) => {
  return (
    <MemoryRouter initialEntries={["?step=0"]}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe('SetupUser Component', () => {
  beforeEach(() => {
    mockUser.user = mockUser;
    nock('http://localhost:80').get('/api/stories').reply(200, {})
    nock('http://localhost:80').get('/api/careTeam/1').reply(200, {})
    nock('http://localhost:80').get('/api/shorts').reply(200, [])
    nock('http://localhost:80').post('/api/auth/register').reply(201, { access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzA2NzIyMzE2LCJpYXQiOjE3MDY3MTg3MTYsImp0aSI6Ijc4ZTYzMDQ1ZDVmYzQ5OGVhMTRhNzA5NzEwYmZiMmU3IiwidXNlcl9pZCI6MTQsImZpcnN0TmFtZSI6ImJlbiIsImxhc3ROYW1lIjoibWV0IiwiZW1haWwiOiJib2JAbWV0emdlci5jYyIsImxhc3RMb2dpbiI6bnVsbH0.3iJJQqdukTaTVTVQhtAoyqIM5p1yTAFbhSgEagSx868" })

  });

  test('renders SetupUser', () => {
    render(wrapper(<SetupPage />));
    // Assert that the modal is rendered.
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  test('walk through steps', async () => {
    mockUser.user = null;
    render(wrapper(<SetupPage />));

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    expect(screen.getByText(/To sign up, please answer/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Next/));

    //user setup
    expect(screen.getByText(/Please provide the following information so we can create your account./)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("EMAIL"), { target: { value: "ben@metzger.cc" } });
    fireEvent.change(screen.getByPlaceholderText("FIRST NAME"), { target: { value: "ben" } });
    fireEvent.change(screen.getByPlaceholderText("LAST NAME"), { target: { value: "metzger" } });
    fireEvent.change(screen.getByPlaceholderText("PASSWORD"), { target: { value: "letmein" } });
    fireEvent.change(screen.getByPlaceholderText("CONFIRM PASSWORD"), { target: { value: "letmein" } });

    await fireEvent.click(screen.getByText(/Sign up/));

    // Add more test cases based on your component's behavior.
  });
});
