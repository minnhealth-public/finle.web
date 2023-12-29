import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import { GlossaryItem } from '../../models';
import GlossaryListItem from './GlossaryListItem';
import { renderWithRouter } from '../../testUtils';
import * as ReactDOM  from 'react-router-dom';

const mockItem: GlossaryItem = {
  id: 1,
  term: 'TestTerm',
  definition: 'TestDefinition',
  source: 'TestSource',
  related_terms: [],
  related_clips: [],
};

describe('GlossaryListItem', () => {
  it('renders the item correctly', () => {
    render(
      renderWithRouter(<GlossaryListItem item={mockItem} />)
    )

    // Check if the term is rendered
    expect(screen.getByText('TestTerm')).toBeInTheDocument();

    // Check if the desktop icon is not initially rendered
    expect(screen.queryByTestId('desktop-icon')).toBeFalsy();
  });

  it('renders desktop icon for terms with related clips', () => {
    const itemWithClips: GlossaryItem = { ...mockItem, term: "hello", related_clips: [1, 2] };
    render(
      renderWithRouter(<GlossaryListItem item={itemWithClips} />)
    )

    // Check if the desktop icon is rendered for terms with related clips
    expect(screen.getByTestId('desktop-icon')).toBeTruthy();
  });

  it('activates the term on click', () => {
    const setter = jest.fn();
    jest.spyOn(ReactDOM, 'useSearchParams').mockImplementation((init) => [new URLSearchParams(), setter]);

    render(
      renderWithRouter(<GlossaryListItem item={mockItem} />)
    );

    // Click the button to activate the term
    fireEvent.click(screen.getByText('TestTerm'));

    let params = new URLSearchParams()
    // Check if the search parameter is set correctly
    params.set("term", "1")
    expect(setter).toHaveBeenCalledWith(params);
  });
});
