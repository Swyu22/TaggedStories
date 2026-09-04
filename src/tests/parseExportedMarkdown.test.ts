import { describe, it, expect } from 'vitest';
import { parseExportedMarkdown } from '../lib/parseExportedMarkdown';
import { buildPrompt } from '../lib/buildPrompt';
import { TagCategory } from '../types';

describe('parseExportedMarkdown', () => {
  const sampleCategories: TagCategory[] = [
    {
      id: 'cat-1',
      name: '频道与消费倾向',
      path: ['一、受众定位', '受众与市场定位标签', '频道与消费倾向'],
      displayPath: '一、受众定位／受众与市场定位标签／频道与消费倾向',
      order: 0,
      tags: [
        { id: 't1', label: '男性向', order: 0 },
        { id: 't2', label: '男频', order: 1 },
      ],
    },
    {
      id: 'cat-2',
      name: '一级主类型标签',
      path: ['三、一级主类型', '一级主类型标签'],
      displayPath: '三、一级主类型／一级主类型标签',
      order: 1,
      tags: [
        { id: 't3', label: '奇幻', order: 0 },
        { id: 't4', label: '科幻', order: 1 },
      ],
    },
  ];

  it('should roundtrip buildPrompt and parseExportedMarkdown with all fields and tags', () => {
    const originalInput = {
      form: {
        title: '时间裂隙的旅人',
        originalSynopsis: '主角林晨在实验室发生意外，能够回溯三分钟前的时间。\n在这个过程中他发现了城市的惊天秘密。',
        immutableCore: '时间回溯能力每次使用有严重代价，不可更改。',
        otherRequirements: '强调科幻悬疑感与步步紧逼的节奏。',
      },
      categories: sampleCategories,
      selectedTags: {
        'cat-1': ['t1'],
        'cat-2': ['t3', 't4'],
      },
    };

    const exportedMarkdown = buildPrompt(originalInput);
    const parsed = parseExportedMarkdown(exportedMarkdown, sampleCategories);

    expect(parsed.form.title).toBe(originalInput.form.title);
    expect(parsed.form.originalSynopsis).toBe(originalInput.form.originalSynopsis);
    expect(parsed.form.immutableCore).toBe(originalInput.form.immutableCore);
    expect(parsed.form.otherRequirements).toBe(originalInput.form.otherRequirements);
    expect(parsed.matchedTagsCount).toBe(3);
    expect(parsed.selectedTags['cat-1']).toEqual(['t1']);
    expect(parsed.selectedTags['cat-2']).toEqual(['t3', 't4']);
  });

  it('should restore empty title when exported with recommendation block', () => {
    const originalInput = {
      form: {
        title: '',
        originalSynopsis: '普通的少年在平凡的小镇生活。',
        immutableCore: '',
        otherRequirements: '',
      },
      categories: sampleCategories,
      selectedTags: {},
    };

    const exportedMarkdown = buildPrompt(originalInput);
    const parsed = parseExportedMarkdown(exportedMarkdown, sampleCategories);

    expect(parsed.form.title).toBe('');
    expect(parsed.form.originalSynopsis).toBe('普通的少年在平凡的小镇生活。');
    expect(parsed.form.immutableCore).toBe('');
    expect(parsed.form.otherRequirements).toBe('');
    expect(parsed.matchedTagsCount).toBe(0);
    expect(Object.keys(parsed.selectedTags)).toHaveLength(0);
  });
});
