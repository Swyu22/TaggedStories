import { generateMarkdownFilename } from './filename';

/**
 * Initiates local browser download of markdown content encoded as UTF-8 Blob.
 * Does not make any network requests.
 */
export function downloadMarkdown(content: string, storyTitle?: string): string {
  const filename = generateMarkdownFilename(storyTitle);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);

  return filename;
}
