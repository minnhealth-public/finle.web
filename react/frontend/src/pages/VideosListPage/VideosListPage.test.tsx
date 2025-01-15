import React from 'react';
import { screen } from '@testing-library/react';
// Import your component
import '@testing-library/jest-dom'
import VideosListPage from './VideosListPage';
import axios from 'axios';
import { renderWithClient, renderWithRouter } from '../../testUtils';
import { Video } from '../../models';
const nock = require('nock');

// Create a new query client instance
// Mock data for tags
let mockVideos: Video[] = [
  {
    "id": 16,
    "type": "SHORT",
    "name": "Able to Understand Legal and Financial Suggestions",
    "video": "-jJzTHrC3zc",
    "videoUrl": "-jJzTHrC3zc",
    "startTime": 163000000,
    "endTime": 288000000,
    "topicsAddressed": [],
    "longerClip": null,
    "entireClip": null,
    "keyTakeaways": [],
    "tasks": [],
    "tags": [],
    "saved": false,
    "watched": false
  },
  {
    "id": 13,
    "type": "SHORT",
    "name": "Basics Legal Documents",
    "video": "-jJzTHrC3zc",
    "videoUrl": "-jJzTHrC3zc",
    "startTime": 480000000,
    "endTime": 495000000,
    "topicsAddressed": [],
    "longerClip": null,
    "entireClip": null,
    "keyTakeaways": [],
    "tasks": [],
    "tags": [],
    "saved": false,
    "watched": false
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
    jest.spyOn(require('../../api/shorts'), 'getShorts').mockResolvedValueOnce(mockVideos);

    renderWithClient(renderWithRouter(<VideosListPage />));

    // Assert that each tag is displayed
    for (const videoIdx in mockVideos) {
      expect(await screen.findByText(mockVideos[videoIdx].name)).toBeInTheDocument();
    }
  });


});
