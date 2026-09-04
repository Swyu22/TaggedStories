import { TagCategory, TagItem } from '../types';
import { DEFAULT_IGNORE_HEADING_KEYWORDS, TAG_SEPARATORS_REGEX } from '../config/tagParserConfig';

interface HeadingNode {
  level: number;
  title: string;
}

/**
 * Creates a clean slug/hash from a string for stable element IDs
 */
function createSlug(str: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const cleanStr = str
    .replace(/[\s\/／、，,]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .slice(0, 30);
  return `cat-${index}-${Math.abs(hash).toString(36)}-${cleanStr}`;
}

/**
 * Strips formatting artifacts from tag text
 */
function cleanTagToken(token: string): string {
  let cleaned = token;
  // Remove markdown bold/italic/code markers
  cleaned = cleaned.replace(/[*_`]/g, '');
  // Remove list numbering prefixes like 1. 1、 (1) （1）
  cleaned = cleaned.replace(/^(\d+[\.、\)]|[（\(]\d+[）\)])\s*/, '');
  // Remove leading list bullets
  cleaned = cleaned.replace(/^[-*+]\s*/, '');
  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();
  // Strip trailing punctuation often found at the end of lists or paragraphs
  cleaned = cleaned.replace(/[。\.，,、；;]+$/, '').trim();
  return cleaned;
}

/**
 * Parses markdown into structured TagCategory list according to PRD specification.
 */
export function parseTagMarkdown(
  markdown: string,
  ignoreKeywords: string[] = DEFAULT_IGNORE_HEADING_KEYWORDS
): TagCategory[] {
  if (!markdown || !markdown.trim()) {
    return [];
  }

  const lines = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const headingStack: HeadingNode[] = [];
  const categories: TagCategory[] = [];

  let currentCategoryTags: string[] = [];
  let isCurrentBranchIgnored = false;
  let categoryOrder = 0;

  function commitCurrentCategory() {
    if (headingStack.length > 0 && currentCategoryTags.length > 0 && !isCurrentBranchIgnored) {
      // Deduplicate tags within this category while keeping original order
      const seen = new Set<string>();
      const uniqueTags: TagItem[] = [];

      for (const tagLabel of currentCategoryTags) {
        if (!seen.has(tagLabel)) {
          seen.add(tagLabel);
          uniqueTags.push({
            id: `tag-${categories.length}-${uniqueTags.length}-${encodeURIComponent(tagLabel).slice(0, 20)}`,
            label: tagLabel,
            order: uniqueTags.length,
          });
        }
      }

      if (uniqueTags.length > 0) {
        const path = headingStack.map((h) => h.title);
        const name = path[path.length - 1];
        const displayPath = path.length === 1 ? path[0] : path.join('／');
        const id = createSlug(displayPath, categoryOrder);

        categories.push({
          id,
          name,
          path,
          displayPath,
          order: categoryOrder++,
          tags: uniqueTags,
        });
      }
    }
    currentCategoryTags = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check for headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      let title = headingMatch[2].trim();
      // Remove any trailing markdown markup in title
      title = title.replace(/[*_`#]/g, '').trim();

      // H1 is treated as the document title (PRD Section 5.3 Rule 2)
      if (level === 1) {
        continue;
      }

      // Commit tags accumulated in previous heading before changing stack
      commitCurrentCategory();

      // Pop headings with level >= current heading level
      while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
        headingStack.pop();
      }

      headingStack.push({ level, title });

      // Check if any heading in the active hierarchy matches ignore keywords
      isCurrentBranchIgnored = headingStack.some((h) =>
        ignoreKeywords.some((kw) => h.title.includes(kw))
      );

      continue;
    }

    // If currently inside an ignored branch (e.g. 说明部分), skip all content
    if (isCurrentBranchIgnored) {
      continue;
    }

    // Skip empty lines, blockquotes, table rows, horizontal rules
    if (
      !line ||
      line.startsWith('>') ||
      line.startsWith('|') ||
      line.startsWith('---') ||
      line.startsWith('***') ||
      line.startsWith('===')
    ) {
      continue;
    }

    // Check if the line is just introductory text, e.g. starting with "辨析：" or "使用提醒："
    if (/^(辨析[：:]|使用提醒[：:]|注[：:]|说明[：:]|提示[：:])/.test(line)) {
      continue;
    }

    // Strip leading list bullet or numbering from the line first
    // e.g. "- tag", "1. tag", "2、 tag", "(3) tag"
    let lineContent = line
      .replace(/^[-*+]\s*/, '')
      .replace(/^(\d+[\.、\)]|[（\(]\d+[）\)])\s*/, '');

    // Split tags using the configured separators
    const tokens = lineContent.split(TAG_SEPARATORS_REGEX);
    for (const rawToken of tokens) {
      const cleaned = cleanTagToken(rawToken);
      if (cleaned && cleaned.length > 0) {
        // Guard against stray metadata lines that were not filtered or isolated numbers
        if (cleaned.startsWith('http') || cleaned.startsWith('SCREENWRITING') || /^\d+$/.test(cleaned)) {
          continue;
        }
        currentCategoryTags.push(cleaned);
      }
    }
  }

  // Commit last category if any
  commitCurrentCategory();

  return categories;
}
