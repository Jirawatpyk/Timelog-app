/**
 * SearchResultsCount Tests - Story 5.7
 *
 * Tests for the search results count display.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchResultsCount } from './SearchResultsCount';

describe('SearchResultsCount', () => {
  it('displays count correctly', () => {
    render(<SearchResultsCount count={10} query="test" />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('displays singular "entry" for count of 1', () => {
    render(<SearchResultsCount count={1} query="test" />);
    expect(screen.getByText(/entry/)).toBeInTheDocument();
    expect(screen.queryByText(/entries/)).not.toBeInTheDocument();
  });

  it('displays plural "entries" for count other than 1', () => {
    render(<SearchResultsCount count={5} query="test" />);
    expect(screen.getByText(/entries/)).toBeInTheDocument();
  });

  it('displays plural "entries" for count of 0', () => {
    render(<SearchResultsCount count={0} query="test" />);
    expect(screen.getByText(/entries/)).toBeInTheDocument();
  });

  it('displays the search query', () => {
    render(<SearchResultsCount count={5} query="marketing" />);
    expect(screen.getByText('marketing')).toBeInTheDocument();
  });

  it('does not show query text when query is empty', () => {
    render(<SearchResultsCount count={5} query="" />);
    expect(screen.queryByText(/for "/)).not.toBeInTheDocument();
  });

  it('shows "Found" prefix', () => {
    render(<SearchResultsCount count={3} query="test" />);
    expect(screen.getByText(/Found/)).toBeInTheDocument();
  });
});
