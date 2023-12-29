import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import SuccessStory from './SuccessStory';
import { Story } from '../models';
import '@testing-library/jest-dom';

const mockStory: Story = {
  title: 'Test Story',
  shortDescription: 'Short Description',
  fullStory: 'Full Story',
  videoUrl: 'https://www.youtube.com/watch?v=abc123',
};

describe('SuccessStory component', () => {
  it('renders story details correctly', async () => {
    render(<SuccessStory story={mockStory} />);

    // Check if story details are rendered
    expect(screen.getByText('Test Story')).toBeInTheDocument();
    expect(await screen.findByText(mockStory.shortDescription)).toBeInTheDocument();
    expect(screen.getByText('Full Story')).toBeInTheDocument();
  });

  it('Check to ensure that the success video is only on screen after clicking on the link', async () => {
    render(<SuccessStory story={mockStory} />);

    expect(screen.queryByTestId('success-video')).toBeFalsy();
    // Open the modal
    fireEvent.click(screen.getByText('Read full story >'));

    // Check if video is on screen.
    await act(async () => {
      // Check if video is not playing initially
      expect(screen.getByTestId('success-video')).toBeInTheDocument();
    });
  });
});
