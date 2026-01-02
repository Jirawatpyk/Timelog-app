import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormErrorSummary } from './FormErrorSummary';

describe('FormErrorSummary (Story 4.8)', () => {
  it('renders nothing when no errors', () => {
    const { container } = render(<FormErrorSummary errors={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when show is false', () => {
    const errors = {
      clientId: { message: 'Please select a Client', type: 'required' },
    };
    const { container } = render(<FormErrorSummary errors={errors} show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows error count for single error', () => {
    const errors = {
      clientId: { message: 'Please select a Client', type: 'required' },
    };
    render(<FormErrorSummary errors={errors} />);

    expect(screen.getByText('Please fix the following errors')).toBeInTheDocument();
    expect(screen.getByText('1 field requires attention')).toBeInTheDocument();
  });

  it('shows error count for multiple errors', () => {
    const errors = {
      clientId: { message: 'Please select a Client', type: 'required' },
      projectId: { message: 'Please select a Project', type: 'required' },
      serviceId: { message: 'Please select a Service', type: 'required' },
    };
    render(<FormErrorSummary errors={errors} />);

    expect(screen.getByText('3 fields require attention')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    const errors = {
      clientId: { message: 'Please select a Client', type: 'required' },
    };
    render(<FormErrorSummary errors={errors} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has aria-live="polite" for screen readers', () => {
    const errors = {
      clientId: { message: 'Please select a Client', type: 'required' },
    };
    render(<FormErrorSummary errors={errors} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });
});
