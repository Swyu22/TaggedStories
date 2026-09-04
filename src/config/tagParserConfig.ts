/**
 * Configuration for Tag Markdown Parser
 * Headings containing any of these keywords will be excluded from tag parsing along with their sub-trees.
 */
export const DEFAULT_IGNORE_HEADING_KEYWORDS: string[] = [
  '说明',
  '使用说明',
  '备注',
  '附录',
  '标签使用建议',
  '注意事项',
  '结语',
  '辨析',
  '公式',
  '立项模板',
  '最容易混淆',
];

/**
 * Separator patterns supported for parsing tags inside paragraph or list lines.
 * Supported: 、，,；;| and newline. Space is intentionally NOT a separator.
 */
export const TAG_SEPARATORS_REGEX = /[、，,；;|\n]+/;
