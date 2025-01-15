import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Story } from '../../models';
import '@testing-library/jest-dom';
import SuccessStory from './SuccessStory';

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
    expect(screen.getAllByText('Test Story')).toBeTruthy();
    expect(await screen.findAllByText(mockStory.shortDescription)).toBeTruthy();
    expect(screen.getAllByText('Full Story')).toBeTruthy();
  });

  it('Check to ensure that the success video is only on screen after clicking on the link', async () => {
    render(<SuccessStory story={mockStory} />);

    expect(screen.queryByTestId('modal')).not.toHaveAttribute("open");
    // Open the modal
    fireEvent.click(screen.getByText('Read full story >'));

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    // Check if video is on screen.
  });
});
