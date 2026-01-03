/**
 * useDebounce Hook Tests - Story 5.7
 *
 * Tests for the debounce hook used in search functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('does not update value before delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Value should still be 'initial' before delay
    expect(result.current).toBe('initial');
  });

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    // Rapid changes
    rerender({ value: 'ab' });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: 'abc' });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: 'abcd' });

    // Should still be 'a' since timer kept resetting
    expect(result.current).toBe('a');

    // Now wait full delay
    act(() => vi.advanceTimersByTime(300));

    // Should be final value
    expect(result.current).toBe('abcd');
  });

  it('uses default delay of 300ms when not specified', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Should still be 'initial' before 300ms
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('initial');

    // Should update after 300ms
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('updated');
  });

  it('works with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Should still be 'initial' at 400ms
    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe('initial');

    // Should update after 500ms total
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('updated');
  });

  it('works with non-string values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 42 } }
    );

    expect(result.current).toBe(42);

    rerender({ value: 100 });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe(100);
  });

  it('works with object values', () => {
    const initial = { name: 'test' };
    const updated = { name: 'updated' };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: initial } }
    );

    expect(result.current).toBe(initial);

    rerender({ value: updated });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe(updated);
  });

  it('handles empty string correctly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'text' } }
    );

    rerender({ value: '' });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe('');
  });
});
