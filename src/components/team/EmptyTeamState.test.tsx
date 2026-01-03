/**
 * Empty Team State Tests - Story 6.1
 *
 * Tests for EmptyTeamState component
 * AC8: Empty team state
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyTeamState } from './EmptyTeamState';

describe('EmptyTeamState', () => {
  it('renders no team members heading', () => {
    render(<EmptyTeamState />);

    expect(screen.getByText('No Team Members')).toBeInTheDocument();
  });

  it('renders explanatory message', () => {
    render(<EmptyTeamState />);

    expect(
      screen.getByText('No members found in your managed departments. Please contact Admin.')
    ).toBeInTheDocument();
  });

  it('renders Users icon', () => {
    render(<EmptyTeamState />);

    // Check for icon container
    const iconContainer = document.querySelector('[class*="rounded-full"]');
    expect(iconContainer).toBeInTheDocument();
  });

  it('uses centered layout', () => {
    render(<EmptyTeamState />);

    const container = document.querySelector('[class*="flex-col"]');
    expect(container).toHaveClass('text-center');
  });
});
