/**
 * StatusFilter Component Tests
 * Story 3.5: Master Data Admin UI Layout (AC: 5)
 *
 * Tests for status filter dropdown
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { StatusFilter } from './StatusFilter';

describe('StatusFilter', () => {
  describe('Rendering', () => {
    it('renders select trigger', () => {
      render(<StatusFilter value="all" onChange={() => {}} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays current value "All"', () => {
      render(<StatusFilter value="all" onChange={() => {}} />);

      expect(screen.getByRole('combobox')).toHaveTextContent('All');
    });

    it('displays current value "Active"', () => {
      render(<StatusFilter value="active" onChange={() => {}} />);

      expect(screen.getByRole('combobox')).toHaveTextContent('Active');
    });

    it('displays current value "Inactive"', () => {
      render(<StatusFilter value="inactive" onChange={() => {}} />);

      expect(screen.getByRole('combobox')).toHaveTextContent('Inactive');
    });
  });

  describe('Options', () => {
    it('shows all options when opened', async () => {
      const user = userEvent.setup();
      render(<StatusFilter value="all" onChange={() => {}} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Inactive' })).toBeInTheDocument();
    });

    it('calls onChange when option is selected', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<StatusFilter value="all" onChange={handleChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Active' }));

      expect(handleChange).toHaveBeenCalledWith('active');
    });

    it('calls onChange with "inactive" when Inactive is selected', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<StatusFilter value="all" onChange={handleChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Inactive' }));

      expect(handleChange).toHaveBeenCalledWith('inactive');
    });

    it('calls onChange with "all" when All is selected', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<StatusFilter value="active" onChange={handleChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'All' }));

      expect(handleChange).toHaveBeenCalledWith('all');
    });
  });

  describe('Accessibility', () => {
    it('is keyboard navigable', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<StatusFilter value="all" onChange={handleChange} />);

      const trigger = screen.getByRole('combobox');
      trigger.focus();

      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenCalled();
    });

    it('has proper combobox role', () => {
      render(<StatusFilter value="all" onChange={() => {}} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has consistent width', () => {
      render(<StatusFilter value="all" onChange={() => {}} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('w-[140px]');
    });
  });
});
