import { StoryFormData, SelectedTagState, TagCategory } from '../types';
import { EMPTY_TITLE_RECOMMENDATION } from '../config/promptTemplate';
import { normalizeText } from './text';

export interface ParsedExportResult {
  form: StoryFormData;
  selectedTags: SelectedTagState;
  matchedTagsCount: number;
}

/**
 * Parses a previously exported Markdown prompt document and recovers
 * the four form fields and selected tags.
 */
export function parseExportedMarkdown(
  markdown: string,
  categories: TagCategory[]
): ParsedExportResult {
  const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Extract sections between headers
  const getSectionContent = (header: string, nextHeaders: string[]): string => {
    const headerIndex = normalized.indexOf(header);
    if (headerIndex === -1) return '';

    const contentStart = headerIndex + header.length;
    let contentEnd = normalized.length;

    for (const next of nextHeaders) {
      const nextIndex = normalized.indexOf(next, contentStart);
      if (nextIndex !== -1 && nextIndex < contentEnd) {
        contentEnd = nextIndex;
      }
    }

    return normalized.slice(contentStart, contentEnd).trim();
  };

  const storyNameRaw = getSectionContent('【故事名称】', [
    '【故事标签】',
    '【原始故事梗概】',
  ]);

  const tagsRaw = getSectionContent('【故事标签】', [
    '【原始故事梗概】',
    '【不可更改的核心设定】',
  ]);

  const synopsisRaw = getSectionContent('【原始故事梗概】', [
    '【不可更改的核心设定】',
    '【其他创作要求】',
  ]);

  const immutableRaw = getSectionContent('【不可更改的核心设定】', [
    '【其他创作要求】',
    '现在，请根据以上全部资料',
  ]);

  const requirementsRaw = getSectionContent('【其他创作要求】', [
    '现在，请根据以上全部资料',
  ]);

  // Clean form fields
  let title = '';
  if (
    storyNameRaw &&
    storyNameRaw !== EMPTY_TITLE_RECOMMENDATION &&
    !storyNameRaw.includes('未填写。请根据原始故事梗概')
  ) {
    title = storyNameRaw.trim();
  }

  const originalSynopsis = normalizeText(synopsisRaw);

  let immutableCore = '';
  if (immutableRaw && immutableRaw.trim() !== '无') {
    immutableCore = normalizeText(immutableRaw);
  }

  let otherRequirements = '';
  if (requirementsRaw && requirementsRaw.trim() !== '无') {
    otherRequirements = normalizeText(requirementsRaw);
  }

  // Parse tags
  const selectedTags: SelectedTagState = {};
  let matchedTagsCount = 0;

  if (tagsRaw && tagsRaw.trim() !== '无') {
    const lines = tagsRaw.split('\n');

    // Build helper maps for fast category lookup
    const displayPathMap = new Map<string, TagCategory>();
    const nameMap = new Map<string, TagCategory[]>();

    for (const cat of categories) {
      displayPathMap.set(cat.displayPath, cat);
      // Normalized path without Roman numerals e.g. "受众定位／受众与市场定位标签／频道与消费倾向"
      const cleanPath = cat.displayPath.replace(/^[一二三四五六七八九十]+、/, '');
      displayPathMap.set(cleanPath, cat);

      const existing = nameMap.get(cat.name) || [];
      existing.push(cat);
      nameMap.set(cat.name, existing);
    }

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line === '无') continue;

      // Expect format: 分类路径：标签1、标签2 or 分类路径: 标签1, 标签2
      const match = line.match(/^(.+?)[：:](.+)$/);
      if (!match) continue;

      const categoryPathStr = match[1].trim();
      const tagsStr = match[2].trim();

      // Find matching category
      let matchedCategory: TagCategory | undefined =
        displayPathMap.get(categoryPathStr) ||
        displayPathMap.get(categoryPathStr.replace(/^[一二三四五六七八九十]+、/, ''));

      if (!matchedCategory) {
        // Try loose matching on path suffix or leaf name
        for (const cat of categories) {
          if (
            cat.displayPath.endsWith(categoryPathStr) ||
            categoryPathStr.endsWith(cat.displayPath) ||
            cat.name === categoryPathStr
          ) {
            matchedCategory = cat;
            break;
          }
        }
      }

      const tagLabels = tagsStr
        .split(/[、，,]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      for (const tagLabel of tagLabels) {
        let foundTagId: string | undefined;
        let foundCatId: string | undefined;

        if (matchedCategory) {
          const tagItem = matchedCategory.tags.find((t) => t.label === tagLabel);
          if (tagItem) {
            foundTagId = tagItem.id;
            foundCatId = matchedCategory.id;
          }
        }

        // If not found in matched category, search across all categories
        if (!foundTagId) {
          for (const cat of categories) {
            const tagItem = cat.tags.find((t) => t.label === tagLabel);
            if (tagItem) {
              foundTagId = tagItem.id;
              foundCatId = cat.id;
              break;
            }
          }
        }

        if (foundTagId && foundCatId) {
          if (!selectedTags[foundCatId]) {
            selectedTags[foundCatId] = [];
          }
          if (!selectedTags[foundCatId].includes(foundTagId)) {
            selectedTags[foundCatId].push(foundTagId);
            matchedTagsCount++;
          }
        }
      }
    }
  }

  return {
    form: {
      title,
      originalSynopsis,
      immutableCore,
      otherRequirements,
    },
    selectedTags,
    matchedTagsCount,
  };
}
