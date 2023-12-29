import React, {useContext} from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import Short from './Short';
import '@testing-library/jest-dom';
import { Video } from '../models';

// Mocking the useContext function
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));
const mockShort: Video = {
    "id": "1",
    "name": "Estate Planning Documents after Dementia Diagnosis",
    "description": "Laurie Scherrer interviews Associate Attorney Rebecca Hobbs, who shares her expertise in Special Needs Trust and Custodial Accounts.",
    "video": "JaE-GMeO6SA",
    "start_time": 0,
    "end_time": 1266000000,
    "topics_addressed": [],
    "longer_clip": null,
    "entire_clip": null
}

describe('Short Component', () => {
  beforeEach(() => {
    // Mocking the ShortContext value
    (useContext as jest.Mock).mockReturnValue(mockShort);
  });

  it('renders the component correctly', async () => {
    render(<Short />);

    // Add assertions for important elements in your component
    expect(await waitFor(() => screen.findByText('Need more information still?'))).toBeInTheDocument();
    expect(await waitFor(() => screen.findByPlaceholderText('Leave your comments here'))).toBeInTheDocument();
    // ... Add more assertions as needed
  });

  it('saves the video when "Save" button is clicked', async () => {
    render(<Short />);
    const saveButton = await waitFor(() => screen.findByText('save'));

    fireEvent.click(saveButton);

    // Add assertions to check if the saveVideo function is called
  });

  // Add more tests based on your component's behavior
});
