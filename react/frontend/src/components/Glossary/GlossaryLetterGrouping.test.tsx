import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // For enhanced Jest matchers
import GlossaryLetterGrouping from './GlossaryLetterGrouping';
import { GlossaryItem } from '../../models';

jest.mock('./GlossaryListItem', () => ({ item }: { item: GlossaryItem }) => (
  <div data-testid={`glossary-list-item-${item.id}`}>{item.term}</div>
));

const mockTerms: GlossaryItem[] = [
  { id: 1, term: 'TestTerm1', definition: 'TestDefinition1', source: 'TestSource1', related_terms: [], related_clips: [] },
  { id: 2, term: 'TestTerm2', definition: 'TestDefinition2', source: 'TestSource2', related_terms: [], related_clips: [] },
];

describe('GlossaryLetterGrouping', () => {
  it('renders letter and terms correctly', () => {
    render(<GlossaryLetterGrouping letter="A" terms={mockTerms} />);

    // Check if the letter is rendered
    expect(screen.getByText('A')).toBeInTheDocument();

    // Check if each term is rendered
    mockTerms.forEach((term) => {
      expect(screen.getByTestId(`glossary-list-item-${term.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`glossary-list-item-${term.id}`).textContent).toBe(term.term);
    });
  });
});
