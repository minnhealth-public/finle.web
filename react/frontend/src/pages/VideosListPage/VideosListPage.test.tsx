import React from 'react';
import { screen } from '@testing-library/react';
// Import your component
import '@testing-library/jest-dom'
import VideosListPage from './VideosListPage';
import axios from 'axios';
import { renderWithClient, renderWithRouter } from '../../testUtils';
import { Video } from '../../models';

// Create a new query client instance
// Mock data for tags
let mockVideos: Video[] = [
    {
        "id": "16",
        "name": "Able to Understand Legal and Financial Suggestions",
        "description": "A dementia diagnosis is a call to action. Once a diagnosis is made, most people are able to work with professionals who can draft legal documents and create financial plans.",
        "video": "-jJzTHrC3zc",
        "start_time": 163000000,
        "end_time": 288000000,
        "topics_addressed": [],
        "longer_clip": "2",
        "entire_clip": "2"
    },
    {
        "id": "13",
        "name": "Basics Legal Documents",
        "description": "The basic legal documents everyone should have a durable power of attorney for financial and, its counterpart, the durable power of attorney for healthcare.",
        "video": "-jJzTHrC3zc",
        "start_time": 480000000,
        "end_time": 495000000,
        "topics_addressed": [],
        "longer_clip": "2",
        "entire_clip": "2"
    },
];

describe('VideosListPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  /* TODO still no tags end point
  it('renders loading state while tags are being fetched', async () => {
    renderWithClient(renderWithRouter(<VideosListPage />));

    // Assert that loading state is displayed
    expect( await screen.findByText(/Is Loading/)).toBeInTheDocument();
  });
  */

  it('renders videos correctly when fetched successfully', async () => {
    // Mock the useQuery hook to return successful state
    jest.spyOn(axios, 'get').mockReturnValue(Promise.resolve({data: mockVideos}))

    renderWithClient(renderWithRouter(<VideosListPage />));

    // Assert that each tag is displayed
    for (const videoIdx in mockVideos){
      expect(await screen.findByText(mockVideos[videoIdx].name)).toBeInTheDocument();
    }
  });


});
