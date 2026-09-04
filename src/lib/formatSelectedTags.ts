import { TagCategory, SelectedTagState } from '../types';

/**
 * Formats selected tags into final prompt section according to PRD Section 6.4:
 * - Each category on a separate line: 分类路径：标签1、标签2
 * - Categories follow the original markdown order
 * - Tags within each category follow the original markdown order
 * - Only output categories with at least one selected tag
 * - If no tags selected, returns "无"
 */
export function formatSelectedTags(
  categories: TagCategory[],
  selectedTags: SelectedTagState
): string {
  const lines: string[] = [];

  for (const category of categories) {
    const selectedIds = selectedTags[category.id];
    if (!selectedIds || selectedIds.length === 0) {
      continue;
    }

    const selectedSet = new Set(selectedIds);
    // Preserve original tag order from category
    const matchedTagLabels = category.tags
      .filter((t) => selectedSet.has(t.id))
      .map((t) => t.label);

    if (matchedTagLabels.length > 0) {
      lines.push(`${category.displayPath}：${matchedTagLabels.join('、')}`);
    }
  }

  if (lines.length === 0) {
    return '无';
  }

  return lines.join('\n');
}
