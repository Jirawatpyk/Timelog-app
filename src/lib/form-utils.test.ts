import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  scrollToFirstError,
  triggerErrorHaptic,
  triggerSuccessHaptic,
  TIME_ENTRY_FIELD_ORDER,
} from './form-utils';

describe('scrollToFirstError (Story 4.8 - AC4)', () => {
  let mockElement: HTMLElement;
  let scrollIntoViewMock: ReturnType<typeof vi.fn>;
  let focusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollIntoViewMock = vi.fn();
    focusMock = vi.fn();

    mockElement = document.createElement('button');
    mockElement.id = 'clientId';
    mockElement.tabIndex = 0;
    mockElement.scrollIntoView = scrollIntoViewMock;
    mockElement.focus = focusMock;
    document.body.appendChild(mockElement);

    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    vi.useRealTimers();
  });

  it('scrolls to first error field in order', () => {
    const errors = {
      clientId: { message: 'Please select a Client', type: 'required' },
      projectId: { message: 'Please select a Project', type: 'required' },
    };

    scrollToFirstError(errors);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
  });

  it('focuses element after scroll delay', () => {
    const errors = {
      clientId: { message: 'Please select a Client', type: 'required' },
    };

    scrollToFirstError(errors);

    expect(focusMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(focusMock).toHaveBeenCalled();
  });

  it('does nothing when no errors', () => {
    scrollToFirstError({});

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it('skips fields not in error object', () => {
    // clientId is first in order but not in errors
    const errors = {
      projectId: { message: 'Please select a Project', type: 'required' },
    };

    // Since clientId element exists but projectId doesn't,
    // the function should look for projectId element
    scrollToFirstError(errors);

    // Element won't be found since we only created clientId
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it('uses custom field order', () => {
    const errors = {
      serviceId: { message: 'Please select a Service', type: 'required' },
      clientId: { message: 'Please select a Client', type: 'required' },
    };

    // Custom order puts serviceId first
    scrollToFirstError(errors, ['serviceId', 'clientId']);

    // serviceId element doesn't exist, so nothing happens
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });
});

describe('TIME_ENTRY_FIELD_ORDER', () => {
  it('includes all required form fields', () => {
    expect(TIME_ENTRY_FIELD_ORDER).toContain('clientId');
    expect(TIME_ENTRY_FIELD_ORDER).toContain('projectId');
    expect(TIME_ENTRY_FIELD_ORDER).toContain('jobId');
    expect(TIME_ENTRY_FIELD_ORDER).toContain('serviceId');
    expect(TIME_ENTRY_FIELD_ORDER).toContain('durationHours');
    expect(TIME_ENTRY_FIELD_ORDER).toContain('entryDate');
  });

  it('has correct order matching form layout', () => {
    // Client should come before Project
    expect(TIME_ENTRY_FIELD_ORDER.indexOf('clientId')).toBeLessThan(
      TIME_ENTRY_FIELD_ORDER.indexOf('projectId')
    );

    // Project should come before Job
    expect(TIME_ENTRY_FIELD_ORDER.indexOf('projectId')).toBeLessThan(
      TIME_ENTRY_FIELD_ORDER.indexOf('jobId')
    );

    // Duration should come before Date
    expect(TIME_ENTRY_FIELD_ORDER.indexOf('durationHours')).toBeLessThan(
      TIME_ENTRY_FIELD_ORDER.indexOf('entryDate')
    );
  });
});

describe('triggerErrorHaptic (Story 4.8)', () => {
  it('calls navigator.vibrate with error pattern', () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateMock,
      writable: true,
    });

    triggerErrorHaptic();

    expect(vibrateMock).toHaveBeenCalledWith([50, 50, 50]);
  });

  it('does not throw when vibrate is not supported', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      writable: true,
    });

    expect(() => triggerErrorHaptic()).not.toThrow();
  });
});

describe('triggerSuccessHaptic', () => {
  it('calls navigator.vibrate with success pattern', () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateMock,
      writable: true,
    });

    triggerSuccessHaptic();

    expect(vibrateMock).toHaveBeenCalledWith(50);
  });
});
