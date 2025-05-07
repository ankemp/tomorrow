import { FormatDurationPipe } from './format-duration.pipe';

describe('FormatDurationPipe', () => {
  let pipe: FormatDurationPipe;

  beforeEach(() => {
    pipe = new FormatDurationPipe();
  });

  it('should format durations less than 60 minutes correctly', () => {
    const result = pipe.transform(45);
    expect(result).toBe('45m');
  });

  it('should format durations of exactly 60 minutes correctly', () => {
    const result = pipe.transform(60);
    expect(result).toBe('1h 0m');
  });

  it('should format durations greater than 60 minutes correctly', () => {
    const result = pipe.transform(125);
    expect(result).toBe('2h 5m');
  });

  it('should format durations of 0 minutes correctly', () => {
    const result = pipe.transform(0);
    expect(result).toBe('0m');
  });

  it('should handle edge cases with negative durations gracefully', () => {
    const result = pipe.transform(-30);
    expect(result).toBe('-30m');
  });
});
