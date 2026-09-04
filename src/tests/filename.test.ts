import { describe, it, expect } from 'vitest';
import { sanitizeFilenamePart, generateMarkdownFilename } from '../lib/filename';

describe('filename utils', () => {
  it('should sanitize illegal characters', () => {
    expect(sanitizeFilenamePart('My:Story/Part*1?')).toBe('My_Story_Part_1');
    expect(sanitizeFilenamePart('   ')).toBe('Untitled');
    expect(sanitizeFilenamePart(null)).toBe('Untitled');
  });

  it('should generate formatted filename with timestamp', () => {
    const fixedDate = new Date(2026, 8, 5, 2, 30); // Sep 5, 2026 02:30
    const filename = generateMarkdownFilename('大唐双龙传', fixedDate);
    expect(filename).toBe('Tagged_Story_Synopsis_大唐双龙传_20260905-0230.md');
  });

  it('should fallback to Untitled when title is empty', () => {
    const fixedDate = new Date(2026, 8, 5, 2, 30);
    const filename = generateMarkdownFilename('', fixedDate);
    expect(filename).toBe('Tagged_Story_Synopsis_Untitled_20260905-0230.md');
  });
});
