import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders current page and total pages', () => {
    render(<Pagination currentPage={2} totalPages={5} baseUrl="/admin/users" />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows Page X of Y format', () => {
    render(<Pagination currentPage={3} totalPages={10} baseUrl="/admin/users" />);

    expect(screen.getByText(/Page/)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/of/)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('has Previous and Next buttons', () => {
    render(<Pagination currentPage={2} totalPages={5} baseUrl="/admin/users" />);

    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} baseUrl="/admin/users" />);

    const prevButton = screen.getByLabelText('Go to previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} baseUrl="/admin/users" />);

    const nextButton = screen.getByLabelText('Go to next page');
    expect(nextButton).toBeDisabled();
  });

  it('enables both buttons on middle page', () => {
    render(<Pagination currentPage={3} totalPages={5} baseUrl="/admin/users" />);

    expect(screen.getByLabelText('Go to previous page')).not.toBeDisabled();
    expect(screen.getByLabelText('Go to next page')).not.toBeDisabled();
  });

  it('generates correct URL for previous page', () => {
    render(<Pagination currentPage={3} totalPages={5} baseUrl="/admin/users" />);

    const prevLink = screen.getByLabelText('Go to previous page').closest('a');
    expect(prevLink).toHaveAttribute('href', '/admin/users?page=2');
  });

  it('generates correct URL for next page', () => {
    render(<Pagination currentPage={3} totalPages={5} baseUrl="/admin/users" />);

    const nextLink = screen.getByLabelText('Go to next page').closest('a');
    expect(nextLink).toHaveAttribute('href', '/admin/users?page=4');
  });

  it('has navigation aria-label for accessibility', () => {
    render(<Pagination currentPage={1} totalPages={5} baseUrl="/admin/users" />);

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('highlights current page with aria-current and visual styling', () => {
    render(<Pagination currentPage={3} totalPages={5} baseUrl="/admin/users" />);

    const currentPageElement = screen.getByText('3');
    expect(currentPageElement).toHaveAttribute('aria-current', 'page');
    expect(currentPageElement).toHaveClass('bg-primary');
  });

  it('preserves existing query params when generating URLs', () => {
    render(<Pagination currentPage={2} totalPages={5} baseUrl="/admin/users?filter=active" />);

    const nextLink = screen.getByLabelText('Go to next page').closest('a');
    expect(nextLink).toHaveAttribute('href', '/admin/users?filter=active&page=3');
  });

  it('overwrites existing page param in URL', () => {
    render(<Pagination currentPage={2} totalPages={5} baseUrl="/admin/users?page=1" />);

    const nextLink = screen.getByLabelText('Go to next page').closest('a');
    expect(nextLink).toHaveAttribute('href', '/admin/users?page=3');
  });
});
