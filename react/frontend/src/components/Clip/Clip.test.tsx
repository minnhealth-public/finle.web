import React, { useContext } from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import Clip from './Clip';
import '@testing-library/jest-dom';
import { Video } from '../../models';
import { User } from '../../models/user';
import { useStore } from '../../store';
import * as ReactQuery from "@tanstack/react-query";
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

// Mocking the useContext function
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

const mockShort: Video = {
  "id": 1,
  "type": "SHORT",
  "name": "Estate Planning Documents after Dementia Diagnosis",
  "video": "JaE-GMeO6SA",
  "videoUrl": "kdkdk",
  "startTime": 0,
  "endTime": 1266000000,
  "topicsAddressed": [],
  "longerClip": null,
  "entireClip": null,
  "keyTakeaways": [],
  "tasks": [],
  "tags": [1, 2],
  "saved": false,
  "watched": false
}

let mockUser: User = {
  id: 3,
  lastLogin: "this is a date",
  firstName: "Fred",
  lastName: "Davis",
  email: "fred@davis.com",
}

const queryClient = new ReactQuery.QueryClient()

describe('Short Component', () => {
  beforeEach(() => {
    // Mocking the ShortContext value
    (useContext as jest.Mock).mockReturnValue(mockShort);
  });
  beforeAll(() => {
    useStore.setState({ user: mockUser });
  })
  afterAll(() => {
    useStore.setState({});
  })

  it('renders the component correctly', async () => {
    render(<Clip />);

    // Add assertions for important elements in your component
    expect(screen.getByText(/Need more information still?/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Leave yourself and your team a note.../)).toBeInTheDocument();
    // ... Add more assertions as needed
  });

  it('saves the video when "Save" button is clicked', async () => {
    render(<Clip />);
    const saveButton = screen.getByText('save to team notes');

    fireEvent.click(saveButton);

    // Add assertions to check if the saveVideo function is called
  });

  // Add more tests based on your component's behavior
});
