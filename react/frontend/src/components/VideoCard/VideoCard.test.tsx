
import { render, screen, fireEvent } from '@testing-library/react';
import VideoCard from './VideoCard';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

const mockVideo = {
  id: 1,
  name: 'Sample Video',
  video: 'sample-video-id',
  videoUrl: "kdkdk",
  startTime: 0,
  endTime: 60,
  topicsAddressed: [1, 2],
  tags: [1, 2],
  keyTakeaways: [{ id: 1, text: 'Key Takeaway 1' }, { id: 2, text: 'Key Takeaway 2' }],
  tasks: [{id: 1, title: 'To Do Task 1'}]
};

const wrapper = (children:any) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
)

describe('VideoCard', () => {

  test('renders video card correctly', () => {
    render(wrapper(<VideoCard video={mockVideo} />));

    // Assert the presence of video name and duration
    expect(screen.getAllByText('Sample Video')[0]).toBeInTheDocument();
    expect(screen.getAllByText('60s')[0]).toBeInTheDocument();
  });

  test('opens modal on click', () => {
    render(wrapper(<VideoCard video={mockVideo} isModal={true} />));

    // Assert that the modal is closed initially
    expect(HTMLDialogElement.prototype.show).not.toHaveBeenCalled()
    //expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

    // Click on the video card to open the modal
    fireEvent.click(screen.getAllByAltText(/Sample Video/)[0]);

    // Assert that the modal is open
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  test('navigates to video details page', () => {
    render(wrapper(<VideoCard video={mockVideo} isModal={false} />));

    // Assert that the video card is a link
    expect(screen.getByRole('link')).toBeInTheDocument();

    // Click on the video card to navigate to the video details page
    fireEvent.click(screen.getByRole('link'));

    // Add assertions for navigation if needed
    // Example: expect(mockHistory.push).toHaveBeenCalledWith('/videos/1');
  });
});
