import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
// Import your component
import '@testing-library/jest-dom'
import VideoFilters from './VideoFilters';
import * as ReactDOM  from 'react-router-dom';
import axios from 'axios';
import { renderWithClient, renderWithRouter } from '../../testUtils';
import { Tag } from '../../models';

// Create a new query client instance
// Mock data for tags
let mockTags: Tag[] = [
  { name: 'Tag1' },
  { name: 'Tag2' },
  { name: 'Tag3' },
];

describe('VideoFilters Component', () => {
  it('renders loading state while tags are being fetched', () => {
    renderWithClient(renderWithRouter(<VideoFilters />));

    // Assert that loading state is displayed
    expect(screen.getByTestId('loading-tags')).toBeInTheDocument();
  });

  it('renders tags correctly when fetched successfully', async () => {
    // Mock the useQuery hook to return successful state
    jest.spyOn(axios, 'get').mockReturnValue(Promise.resolve({data: mockTags}))

    renderWithClient(renderWithRouter(<VideoFilters />));

    // Assert that each tag is displayed
    for (const tagIdx in mockTags){
      expect(await screen.findByText(mockTags[tagIdx].name)).toBeInTheDocument();
    }
  });

  it('handles tag button clicks correctly', async () => {
    const setter = jest.fn();
    jest.spyOn(axios, 'get').mockReturnValue(Promise.resolve({data: mockTags}));
    jest.spyOn(ReactDOM, 'useSearchParams').mockImplementation((init) => [new URLSearchParams(), setter]);

    renderWithClient(renderWithRouter(<VideoFilters />));

    expect(await screen.findByText(mockTags[0].name)).toBeInTheDocument();

    let button = screen.getByText(mockTags[0].name)
    //// Click on the first tag button
    fireEvent.click(button);
    ////
    let params = new URLSearchParams()
    params.set("filters", mockTags[0].name)
    expect(setter).toHaveBeenCalledWith(params);
  });
});
