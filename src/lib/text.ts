/**
 * Normalizes input text:
 * - Unifies line endings to \n
 * - Trims leading and trailing whitespaces
 * - Preserves internal line breaks
 */
export function normalizeText(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

/**
 * Returns character count of string
 */
export function countCharacters(value: string | undefined | null): number {
  if (!value) return 0;
  return value.length;
}
