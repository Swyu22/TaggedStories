/**
 * Formats a date into YYYYMMDD-HHmm format using local time
 */
export function formatLocalTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${yyyy}${MM}${dd}-${HH}${mm}`;
}

/**
 * Cleans a filename component by removing illegal filesystem characters: \ / : * ? " < > |
 * Collapses consecutive spaces or underscores to a single underscore.
 * Truncates title to maximum 40 characters for safety.
 */
export function sanitizeFilenamePart(part: string | undefined | null): string {
  if (!part || !part.trim()) {
    return 'Untitled';
  }
  let cleaned = part.trim()
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/[\s_]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!cleaned) {
    return 'Untitled';
  }

  return cleaned.slice(0, 40);
}

/**
 * Generates the standardized markdown export filename:
 * Tagged_Story_Synopsis_<作品名称或Untitled>_<YYYYMMDD-HHmm>.md
 */
export function generateMarkdownFilename(title: string | undefined | null, date: Date = new Date()): string {
  const safeTitle = sanitizeFilenamePart(title);
  const timestamp = formatLocalTimestamp(date);
  return `Tagged_Story_Synopsis_${safeTitle}_${timestamp}.md`;
}
