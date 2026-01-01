import { describe, it, expect } from 'vitest';
import {
  hoursToMinutes,
  minutesToHours,
  formatDuration,
  isValidDurationIncrement,
  DURATION_PRESETS,
} from './duration';

describe('hoursToMinutes', () => {
  it('converts whole hours to minutes', () => {
    expect(hoursToMinutes(1)).toBe(60);
    expect(hoursToMinutes(2)).toBe(120);
    expect(hoursToMinutes(8)).toBe(480);
  });

  it('converts decimal hours to minutes', () => {
    expect(hoursToMinutes(0.5)).toBe(30);
    expect(hoursToMinutes(1.5)).toBe(90);
    expect(hoursToMinutes(2.25)).toBe(135);
    expect(hoursToMinutes(0.25)).toBe(15);
  });

  it('handles edge cases', () => {
    expect(hoursToMinutes(0)).toBe(0);
    expect(hoursToMinutes(24)).toBe(1440);
  });
});

describe('minutesToHours', () => {
  it('converts minutes to hours', () => {
    expect(minutesToHours(60)).toBe(1);
    expect(minutesToHours(120)).toBe(2);
    expect(minutesToHours(480)).toBe(8);
  });

  it('converts to decimal hours', () => {
    expect(minutesToHours(30)).toBe(0.5);
    expect(minutesToHours(90)).toBe(1.5);
    expect(minutesToHours(135)).toBe(2.25);
    expect(minutesToHours(15)).toBe(0.25);
  });

  it('handles edge cases', () => {
    expect(minutesToHours(0)).toBe(0);
    expect(minutesToHours(1440)).toBe(24);
  });
});

describe('formatDuration', () => {
  describe('short format', () => {
    it('formats whole hours', () => {
      expect(formatDuration(60, 'short')).toBe('1 ชม.');
      expect(formatDuration(120, 'short')).toBe('2 ชม.');
      expect(formatDuration(480, 'short')).toBe('8 ชม.');
    });

    it('formats decimal hours', () => {
      expect(formatDuration(30, 'short')).toBe('0.5 ชม.');
      expect(formatDuration(90, 'short')).toBe('1.5 ชม.');
      expect(formatDuration(135, 'short')).toBe('2.25 ชม.');
    });

    it('defaults to short format', () => {
      expect(formatDuration(60)).toBe('1 ชม.');
    });
  });

  describe('long format', () => {
    it('formats whole hours', () => {
      expect(formatDuration(60, 'long')).toBe('1 ชม.');
      expect(formatDuration(120, 'long')).toBe('2 ชม.');
      expect(formatDuration(480, 'long')).toBe('8 ชม.');
    });

    it('formats minutes only', () => {
      expect(formatDuration(30, 'long')).toBe('30 นาที');
      expect(formatDuration(15, 'long')).toBe('15 นาที');
      expect(formatDuration(45, 'long')).toBe('45 นาที');
    });

    it('formats hours and minutes', () => {
      expect(formatDuration(90, 'long')).toBe('1 ชม. 30 นาที');
      expect(formatDuration(135, 'long')).toBe('2 ชม. 15 นาที');
      expect(formatDuration(75, 'long')).toBe('1 ชม. 15 นาที');
    });

    it('handles zero', () => {
      expect(formatDuration(0, 'long')).toBe('0 นาที');
    });
  });
});

describe('isValidDurationIncrement', () => {
  it('accepts valid 0.25 increments', () => {
    expect(isValidDurationIncrement(0.25)).toBe(true);
    expect(isValidDurationIncrement(0.5)).toBe(true);
    expect(isValidDurationIncrement(0.75)).toBe(true);
    expect(isValidDurationIncrement(1)).toBe(true);
    expect(isValidDurationIncrement(1.25)).toBe(true);
    expect(isValidDurationIncrement(1.5)).toBe(true);
    expect(isValidDurationIncrement(2)).toBe(true);
    expect(isValidDurationIncrement(8)).toBe(true);
  });

  it('rejects invalid increments', () => {
    expect(isValidDurationIncrement(0.1)).toBe(false);
    expect(isValidDurationIncrement(0.3)).toBe(false);
    expect(isValidDurationIncrement(1.1)).toBe(false);
    expect(isValidDurationIncrement(1.33)).toBe(false);
    expect(isValidDurationIncrement(2.6)).toBe(false);
  });

  it('handles edge cases', () => {
    expect(isValidDurationIncrement(0)).toBe(true);
    expect(isValidDurationIncrement(24)).toBe(true);
  });
});

describe('DURATION_PRESETS', () => {
  it('contains expected preset values', () => {
    expect(DURATION_PRESETS).toEqual([0.5, 1, 2, 4, 8]);
  });

  it('all presets are valid increments', () => {
    DURATION_PRESETS.forEach((preset) => {
      expect(isValidDurationIncrement(preset)).toBe(true);
    });
  });
});
