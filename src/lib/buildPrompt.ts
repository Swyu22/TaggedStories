import { PromptInput } from '../types';
import { PROMPT_TEMPLATE, EMPTY_TITLE_RECOMMENDATION } from '../config/promptTemplate';
import { formatSelectedTags } from './formatSelectedTags';
import { normalizeText } from './text';

/**
 * Builds the complete prompt strictly following PRD Section 6 & 7.
 * Replaces placeholders with user inputs and formatted tags.
 */
export function buildPrompt(input: PromptInput): string {
  const { form, categories, selectedTags } = input;

  const rawSynopsis = normalizeText(form.originalSynopsis);
  if (!rawSynopsis) {
    throw new Error('原始故事梗概不能为空');
  }

  const rawTitle = normalizeText(form.title);
  const storyNameBlock = rawTitle ? rawTitle : EMPTY_TITLE_RECOMMENDATION;

  const formattedTags = formatSelectedTags(categories, selectedTags);

  const rawImmutable = normalizeText(form.immutableCore);
  const immutableCoreBlock = rawImmutable ? rawImmutable : '无';

  const rawOther = normalizeText(form.otherRequirements);
  const otherRequirementsBlock = rawOther ? rawOther : '无';

  const templatePlaceholders: [string, string][] = [
    ['{{STORY_NAME_BLOCK}}', storyNameBlock],
    ['{{FORMATTED_TAGS}}', formattedTags],
    ['{{ORIGINAL_SYNOPSIS}}', rawSynopsis],
    ['{{IMMUTABLE_CORE}}', immutableCoreBlock],
    ['{{OTHER_REQUIREMENTS}}', otherRequirementsBlock],
  ];

  let prompt = PROMPT_TEMPLATE;
  for (const [placeholder, content] of templatePlaceholders) {
    // Use function replacer to prevent special dollar sign substitutions ($1, $&, etc.)
    prompt = prompt.replace(placeholder, () => content);
  }

  // Safeguard: Check that no template placeholder remains
  for (const [placeholder] of templatePlaceholders) {
    if (prompt.includes(placeholder)) {
      throw new Error(`提示词模板存在未替换的占位符: ${placeholder}`);
    }
  }

  return prompt;
}
