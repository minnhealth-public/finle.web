import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlossaryItem } from '../../models';
import GlossaryModal from './GlossaryModal';
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

const mockRelatedTerms: GlossaryItem[] = [
  { id: 2, term: 'RelatedTerm1', definition: 'RelatedDefinition1', source: 'RelatedSource1', related_terms: [], related_clips: [] },
  { id: 3, term: 'RelatedTerm2', definition: 'RelatedDefinition2', source: 'RelatedSource2', related_terms: [], related_clips: [] },
];

describe('GlossaryModal', () => {

  it('renders the modal with item and related terms', () => {
    render(
      renderWithRouter(<GlossaryModal item={mockItem} relatedTerms={mockRelatedTerms} />)
    )

    // Check if the item details are rendered
    expect(screen.getByText('TestTerm')).toBeInTheDocument();
    expect(screen.getByText('TestDefinition')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('TestSource')).toBeInTheDocument();

    // Check if the related terms are rendered
    expect(screen.getByText('RelatedTerm1')).toBeInTheDocument();
    expect(screen.getByText('RelatedTerm2')).toBeInTheDocument();
  });

  it('sets the search parameter on related term click', () => {
    const setter = jest.fn();
    jest.spyOn(ReactDOM, 'useSearchParams').mockImplementation((init) => [new URLSearchParams(), setter]);

    render(
      renderWithRouter(<GlossaryModal item={mockItem} relatedTerms={mockRelatedTerms}/>)
    )
    // Click the button to activate the term

    // Click the related term button
    fireEvent.click(screen.getByText('RelatedTerm1'));

    let params = new URLSearchParams()
    // Check if the search parameter is set correctly
    params.set("term", "2")
    expect(setter).toHaveBeenCalledWith(params);

  });
});
