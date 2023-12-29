import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import InputSelect from './InputSelect';
import '@testing-library/jest-dom';

describe('InputSelect', () => {
  test('renders the component', () => {
    render(<InputSelect options={['Option 1', 'Option 2']} />);
    // You can add more assertions based on your component structure
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('toggles the select options on clicking the icon', () => {
    render(<InputSelect options={['Option 1', 'Option 2']} />);
    const icon = screen.getByTestId('chevron-down-icon');

    fireEvent.click(icon);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  test('selects an option on clicking it', () => {
    render(<InputSelect options={['Option 1', 'Option 2']} />);
    const icon = screen.getByTestId('chevron-down-icon');

    fireEvent.click(icon);

    const option = screen.getByText('Option 1');
    fireEvent.click(option);

    const input: HTMLInputElement = screen.getByRole('textbox');
    expect(input.value).toBe('Option 1');
  });

  test('handles Enter key on the icon to toggle options', () => {
    render(<InputSelect options={['Option 1', 'Option 2']} />);
    const icon = screen.getByTestId('chevron-down-icon');

    fireEvent.keyUp(icon, { key: 'Enter' });

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  test('handles Enter key on an option to select it', () => {
    render(<InputSelect options={['Option 1', 'Option 2']} />);
    const icon = screen.getByTestId('chevron-down-icon');

    fireEvent.click(icon);

    const option = screen.getByText('Option 1');
    fireEvent.keyUp(option, { key: 'Enter' });

    const input: HTMLInputElement = screen.getByRole('textbox');
    expect(input.value).toBe('Option 1');
  });
});
