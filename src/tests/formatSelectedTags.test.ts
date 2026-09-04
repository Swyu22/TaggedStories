import { describe, it, expect } from 'vitest';
import { formatSelectedTags } from '../lib/formatSelectedTags';
import { TagCategory } from '../types';

describe('formatSelectedTags', () => {
  const sampleCategories: TagCategory[] = [
    {
      id: 'cat-1',
      name: '题材标签',
      path: ['题材标签'],
      displayPath: '题材标签',
      order: 0,
      tags: [
        { id: 't1', label: '奇幻', order: 0 },
        { id: 't2', label: '战争', order: 1 },
        { id: 't3', label: '冒险', order: 2 },
      ],
    },
    {
      id: 'cat-2',
      name: '主角身份',
      path: ['人物标签', '主角身份'],
      displayPath: '人物标签／主角身份',
      order: 1,
      tags: [
        { id: 't4', label: '失忆者', order: 0 },
        { id: 't5', label: '王储', order: 1 },
      ],
    },
    {
      id: 'cat-3',
      name: '未选分类',
      path: ['未选分类'],
      displayPath: '未选分类',
      order: 2,
      tags: [{ id: 't6', label: '其他', order: 0 }],
    },
  ];

  it('should return "无" when no tags are selected', () => {
    expect(formatSelectedTags(sampleCategories, {})).toBe('无');
    expect(formatSelectedTags(sampleCategories, { 'cat-1': [] })).toBe('无');
  });

  it('should format selected tags with category displayPath and dunhao', () => {
    const selected = {
      'cat-1': ['t3', 't1'], // Order selected is t3 then t1
      'cat-2': ['t5'],
    };

    const formatted = formatSelectedTags(sampleCategories, selected);
    // Preserves category order and tag order within category (t1 then t3)
    const expected = [
      '题材标签：奇幻、冒险',
      '人物标签／主角身份：王储',
    ].join('\n');

    expect(formatted).toBe(expected);
  });

  it('should omit categories that have zero selected tags', () => {
    const selected = {
      'cat-2': ['t4'],
    };
    const formatted = formatSelectedTags(sampleCategories, selected);
    expect(formatted).toBe('人物标签／主角身份：失忆者');
  });
});
