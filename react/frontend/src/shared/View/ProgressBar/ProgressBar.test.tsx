import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with the correct progress percentage', () => {
    render(<ProgressBar value={50} range={100} />);

    expect(screen.getByText('Your setup is 50% Complete')).toBeTruthy();
  });

  it('clamps progress percentage within the valid range (0 to range)', () => {
    render(<ProgressBar value={120} range={100} />);

    expect(screen.getByText('Your setup is 100% Complete')).toBeTruthy();
  });

  it('renders with 0% progress if value is below the valid range', () => {
    render(<ProgressBar value={-10} range={100} />);

    expect(screen.getByText('Your setup is 0% Complete')).toBeTruthy();
  });
});
