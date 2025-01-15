import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Scroller from './Scroller';
import '@testing-library/jest-dom';

describe('Scroller component', () => {
  it('renders without crashing', () => {
    render(<Scroller ids={['section1', 'section2', 'section3']} />);
  });

  it('scrolls to next ID when button is clicked', () => {
    // Mock document.getElementById
    const getElementByIdMock = jest.fn();
    document.getElementById = getElementByIdMock;

    // Render the component
    render(<Scroller ids={['section1', 'section2', 'section3']} />);

    // Simulate click on button
    fireEvent.click(screen.getByRole('button'));

    // Check if document.getElementById is called with the next ID
    expect(getElementByIdMock).toHaveBeenCalledWith('section1');
  });
});
