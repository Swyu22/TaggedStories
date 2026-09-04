import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../lib/buildPrompt';
import { EMPTY_TITLE_RECOMMENDATION } from '../config/promptTemplate';
import { TagCategory } from '../types';

describe('buildPrompt', () => {
  const sampleCategories: TagCategory[] = [
    {
      id: 'c1',
      name: '题材',
      path: ['题材'],
      displayPath: '题材',
      order: 0,
      tags: [
        { id: 't1', label: '奇幻', order: 0 },
        { id: 't2', label: '冒险', order: 1 },
      ],
    },
    {
      id: 'c2',
      name: '情感',
      path: ['情感'],
      displayPath: '情感',
      order: 1,
      tags: [{ id: 't3', label: '双向救赎', order: 0 }],
    },
  ];

  // 1. 所有字段均填写
  it('1. should inject all fields when completely filled', () => {
    const prompt = buildPrompt({
      form: {
        title: '星穹铁道传',
        originalSynopsis: '少年登上一列穿梭于群星之间的神秘列车。',
        immutableCore: '列车长是帕姆，不可更改。',
        otherRequirements: '突出热血与治愈。',
      },
      categories: sampleCategories,
      selectedTags: {
        c1: ['t1'],
      },
    });

    expect(prompt).toContain('【故事名称】\n星穹铁道传');
    expect(prompt).toContain('【故事标签】\n题材：奇幻');
    expect(prompt).toContain('【原始故事梗概】\n少年登上一列穿梭于群星之间的神秘列车。');
    expect(prompt).toContain('【不可更改的核心设定】\n列车长是帕姆，不可更改。');
    expect(prompt).toContain('【其他创作要求】\n突出热血与治愈。');
  });

  // 2. 作品名称为空时插入推荐名称指令
  it('2. should insert recommendation block when title is empty', () => {
    const prompt = buildPrompt({
      form: {
        title: '',
        originalSynopsis: '主角在荒岛苏醒。',
        immutableCore: '',
        otherRequirements: '',
      },
      categories: sampleCategories,
      selectedTags: {},
    });

    expect(prompt).toContain(`【故事名称】\n${EMPTY_TITLE_RECOMMENDATION}`);
  });

  // 3. 不可更改设定为空时写入“无”
  it('3. should write "无" when immutable core is empty', () => {
    const prompt = buildPrompt({
      form: {
        title: '作品A',
        originalSynopsis: '主角在荒岛苏醒。',
        immutableCore: '   ',
        otherRequirements: '',
      },
      categories: sampleCategories,
      selectedTags: {},
    });

    expect(prompt).toContain('【不可更改的核心设定】\n无');
  });

  // 4. 其他要求为空时写入“无”
  it('4. should write "无" when other requirements are empty', () => {
    const prompt = buildPrompt({
      form: {
        title: '作品A',
        originalSynopsis: '主角在荒岛苏醒。',
        immutableCore: '',
        otherRequirements: '',
      },
      categories: sampleCategories,
      selectedTags: {},
    });

    expect(prompt).toContain('【其他创作要求】\n无');
  });

  // 5. 未选标签时写入“无”
  it('5. should write "无" when no tags are selected', () => {
    const prompt = buildPrompt({
      form: {
        title: '作品A',
        originalSynopsis: '主角在荒岛苏醒。',
        immutableCore: '',
        otherRequirements: '',
      },
      categories: sampleCategories,
      selectedTags: {},
    });

    expect(prompt).toContain('【故事标签】\n无');
  });

  // 6. 多分类标签按分类顺序输出
  it('6. should output multi-category tags ordered by original category order', () => {
    const prompt = buildPrompt({
      form: {
        title: '作品A',
        originalSynopsis: '主角在荒岛苏醒。',
        immutableCore: '',
        otherRequirements: '',
      },
      categories: sampleCategories,
      selectedTags: {
        c2: ['t3'],
        c1: ['t2', 't1'],
      },
    });

    expect(prompt).toContain('【故事标签】\n题材：奇幻、冒险\n情感：双向救赎');
  });

  // 7. 用户内部换行被保留
  it('7. should preserve internal newlines in synopsis', () => {
    const synopsis = '第一段背景说明。\n\n第二段主要冲突。\n第三段结局走向。';
    const prompt = buildPrompt({
      form: {
        title: '作品A',
        originalSynopsis: synopsis,
        immutableCore: '',
        otherRequirements: '',
      },
      categories: sampleCategories,
      selectedTags: {},
    });

    expect(prompt).toContain(`【原始故事梗概】\n${synopsis}`);
  });

  // 8. 字段首尾空格被移除
  it('8. should trim leading and trailing spaces from fields', () => {
    const prompt = buildPrompt({
      form: {
        title: '   修仙狂潮   ',
        originalSynopsis: '   主角凡人开局。   ',
        immutableCore: '   单女主。   ',
        otherRequirements: '   升级流爽感。   ',
      },
      categories: sampleCategories,
      selectedTags: {},
    });

    expect(prompt).toContain('【故事名称】\n修仙狂潮');
    expect(prompt).toContain('【原始故事梗概】\n主角凡人开局。');
    expect(prompt).toContain('【不可更改的核心设定】\n单女主。');
    expect(prompt).toContain('【其他创作要求】\n升级流爽感。');
  });

  // 9. 内置提示词完整存在
  it('9. should retain full core screenwriter guidelines in prompt', () => {
    const prompt = buildPrompt({
      form: {
        title: '',
        originalSynopsis: '测试梗概',
        immutableCore: '',
        otherRequirements: '',
      },
      categories: sampleCategories,
      selectedTags: {},
    });

    expect(prompt).toContain('你的身份是一名资深职业编剧');
    expect(prompt).toContain('亚里士多德戏剧理论、三幕式结构');
    expect(prompt).toContain('Who——谁人');
    expect(prompt).toContain('输出一篇1000—1500字的中文故事梗概');
  });

  // 10. 每个占位符均被完全替换
  // 11. 最终文本中不存在 {{...}} 残留
  it('10 & 11. should fully replace all placeholders without {{...}} remaining', () => {
    const prompt = buildPrompt({
      form: {
        title: '测试',
        originalSynopsis: '测试梗概',
        immutableCore: '核心',
        otherRequirements: '要求',
      },
      categories: sampleCategories,
      selectedTags: { c1: ['t1'] },
    });

    expect(prompt).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  // 12. 特殊字符不会破坏生成结果
  it('12. should handle special symbols and quotes safely', () => {
    const specialText = '包含特殊符号：<script>alert("test")</script> & " \' $100 {{STORY}} \\n';
    const prompt = buildPrompt({
      form: {
        title: specialText,
        originalSynopsis: specialText,
        immutableCore: specialText,
        otherRequirements: specialText,
      },
      categories: sampleCategories,
      selectedTags: {},
    });

    expect(prompt).toContain(specialText);
  });

  it('should throw an error if original synopsis is empty', () => {
    expect(() =>
      buildPrompt({
        form: {
          title: '测试',
          originalSynopsis: '   ',
          immutableCore: '',
          otherRequirements: '',
        },
        categories: sampleCategories,
        selectedTags: {},
      })
    ).toThrow('原始故事梗概不能为空');
  });
});
