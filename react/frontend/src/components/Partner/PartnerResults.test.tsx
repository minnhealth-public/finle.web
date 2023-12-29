import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PartnerResults from './PartnerResults';
import { renderWithClient, renderWithRouter } from '../../testUtils';

jest.mock('../../api/partners', () => ({
  getPartners: jest.fn(() => Promise.resolve([])),
}));

const mockPartners = [
  {
    id: 1,
    name: "ABC Corporation",
    description: "A leading innovator in technology solutions",
    logo: "abc-logo.png",
    link: "https://www.abc.com"
  },
  {
    id: 2,
    name: "XYZ Healthcare",
    description: "Dedicated to providing quality healthcare services",
    logo: "xyz-logo.png",
    link: "https://www.xyzhealthcare.com"
  }
];

describe('PartnerResults', () => {
  it('renders loading state', async () => {
    jest.spyOn(require('../../api/partners'), 'getPartners').mockResolvedValueOnce(mockPartners);
    renderWithClient(renderWithRouter(<PartnerResults />));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    const getpartnersMock = jest.spyOn(require('../../api/partners'), 'getPartners');
    getpartnersMock.mockRejectedValueOnce(new Error('Error fetching data'));

    renderWithClient(renderWithRouter(<PartnerResults />));
    expect(await screen.findByText('Error Fetching data')).toBeInTheDocument();
  });

  it('renders terms and letters', async () => {
    jest.spyOn(require('../../api/partners'), 'getPartners').mockResolvedValueOnce(mockPartners);

    renderWithClient(renderWithRouter(<PartnerResults />));
    expect(await screen.findByText(mockPartners[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockPartners[1].name)).toBeInTheDocument();

  });

  // Add more test cases as needed
});
