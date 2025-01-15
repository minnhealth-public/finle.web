import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import VideoFilters from './VideoFilters';
import { renderWithClient, renderWithRouter } from '../../testUtils';
import { Filter } from '../../models/Filter';

const nock = require('nock')

// Create a new query client instance
// Mock data for filters
let mockFilters: Filter[] = [
  { id: 1, name: 'Tag1', tasks: [] },
  { id: 2, name: 'Tag2', tasks: [] },
  { id: 3, name: 'Tag3', tasks: [] },
];

describe('VideoFilters Component', () => {
  beforeEach(() => {
    nock('http://localhost:80')
      .get('/api/filters')
      .reply(200, mockFilters)
  })

  /*
    it('renders loading state while tags are being fetched', () => {
      renderWithClient(renderWithRouter(<VideoFilters />));
      // Assert that loading state is displayed
      expect(screen.getByTestId('loading-tags')).toBeInTheDocument();
    });
    */

  it('renders tags correctly when fetched successfully', async () => {

    // Mock the useQuery hook to return successful state
    renderWithClient(renderWithRouter(<VideoFilters />));

    // Assert that each tag is displayed
    for (const tagIdx in mockFilters) {
      expect(await screen.findByText(mockFilters[tagIdx].name)).toBeInTheDocument();
    }
  });

  /*
    it('handles tag button clicks correctly', async () => {
      renderWithClient(renderWithRouter(<VideoFilters />));

      const spy = jest.spyOn(VideoFilters.prototype, "enableFilter")

      expect(await screen.findByText(mockFilters[0].name)).toBeInTheDocument();

      let button = screen.getByText(mockFilters[0].name)
      //// Click on the first tag button
      fireEvent.click(button);
      ////
      expect(spy).toHaveBeenCalled();
    });
    */

});
