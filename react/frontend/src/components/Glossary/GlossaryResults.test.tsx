import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossaryResults from './GlossaryResults';
import { renderWithClient, renderWithRouter } from '../../testUtils';
import * as ReactDOM  from 'react-router-dom';
import { GlossaryItem } from '../../models';

jest.mock('../../api/glossary', () => ({
  getGlossary: jest.fn(() => Promise.resolve([])),
}));

const mockGlossary = [
  { id: 1, term: 'TestTerm1', definition: 'TestDefinition1', source: 'TestSource1', related_terms: [] as GlossaryItem[], related_clips: [] as string[]},
  { id: 2, term: 'TestTerm2', definition: 'TestDefinition2', source: 'TestSource2', related_terms: [] as GlossaryItem[], related_clips: [] as string[]},
];

describe('GlossaryResults', () => {
  it('renders loading state', async () => {
    jest.spyOn(require('../../api/glossary'), 'getGlossary').mockResolvedValueOnce(mockGlossary);
    renderWithClient(renderWithRouter(<GlossaryResults />));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    const getGlossaryMock = jest.spyOn(require('../../api/glossary'), 'getGlossary');
    getGlossaryMock.mockRejectedValueOnce(new Error('Error fetching data'));

    renderWithClient(renderWithRouter(<GlossaryResults />));
    expect(await screen.findByText('Error Fetching data')).toBeInTheDocument();
  });

  it('renders terms and letters', async () => {
    jest.spyOn(require('../../api/glossary'), 'getGlossary').mockResolvedValueOnce(mockGlossary);

    renderWithClient(renderWithRouter(<GlossaryResults />));
    expect(await screen.findByText('TestTerm1')).toBeInTheDocument();
    expect(screen.getByText('TestTerm2')).toBeInTheDocument();

    // Check if letters are rendered
    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'A' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'T' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'T' })).not.toBeDisabled();
    // Add more letters as needed
  });

  it('handles letter group selection', async () => {

    jest.spyOn(require('../../api/glossary'), 'getGlossary').mockResolvedValueOnce([mockGlossary[0]]);
    const setter = jest.fn();
    jest.spyOn(ReactDOM, 'useSearchParams').mockImplementation(() => [new URLSearchParams(), setter]);


    renderWithClient(renderWithRouter(<GlossaryResults />));
    expect(await screen.findByText('TestTerm1')).toBeInTheDocument();

    // Click on a letter button
    fireEvent.click(screen.getByRole('button', { name: 'T' }));

    let params = new URLSearchParams()
    // Check if the search parameter is set correctly
    params.set("letterGroup", "T")
    expect(setter).toHaveBeenCalledWith(params);
  });

  it('clicking on letter group with no terms does not change search params', async () => {
    jest.spyOn(require('../../api/glossary'), 'getGlossary').mockResolvedValueOnce([mockGlossary[0]]);
    const setter = jest.fn();
    jest.spyOn(ReactDOM, 'useSearchParams').mockImplementation(() => [new URLSearchParams(), setter]);


    renderWithClient(renderWithRouter(<GlossaryResults />));
    expect(await screen.findByText('TestTerm1')).toBeInTheDocument();

    // Click on a letter button
    fireEvent.click(screen.getByRole('button', { name: 'A' }));
    expect(setter).toHaveBeenCalledTimes(0);
  });
  // Add more test cases as needed
});
