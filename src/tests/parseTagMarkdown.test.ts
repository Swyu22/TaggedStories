import { describe, it, expect } from 'vitest';
import { parseTagMarkdown } from '../lib/parseTagMarkdown';

describe('parseTagMarkdown', () => {
  // 1. 标题加无序列表
  it('1. should parse headings with unordered list items', () => {
    const md = `
## 题材标签
- 奇幻
- 玄幻
- 科幻
`;
    const categories = parseTagMarkdown(md);
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('题材标签');
    expect(categories[0].tags.map((t) => t.label)).toEqual(['奇幻', '玄幻', '科幻']);
  });

  // 2. 标题加顿号分隔
  it('2. should parse headings with dunhao separated tags', () => {
    const md = `
## 情感标签
爱情、虐恋、暗恋、双向救赎。
`;
    const categories = parseTagMarkdown(md);
    expect(categories).toHaveLength(1);
    expect(categories[0].tags.map((t) => t.label)).toEqual([
      '爱情',
      '虐恋',
      '暗恋',
      '双向救赎',
    ]);
  });

  // 3. 大类与子类
  it('3. should support primary category and subcategories', () => {
    const md = `
## 人物标签
### 主角身份
医生、律师、教师
### 人物关系
青梅竹马、宿敌、师徒
`;
    const categories = parseTagMarkdown(md);
    expect(categories).toHaveLength(2);
    expect(categories[0].displayPath).toBe('人物标签／主角身份');
    expect(categories[0].tags.map((t) => t.label)).toEqual(['医生', '律师', '教师']);
    expect(categories[1].displayPath).toBe('人物标签／人物关系');
    expect(categories[1].tags.map((t) => t.label)).toEqual(['青梅竹马', '宿敌', '师徒']);
  });

  // 4. 粗体标签
  it('4. should clean markdown bold and italic formatting in tags', () => {
    const md = `
## 风格标签
1. **黑暗**
2. *治愈*
3. **史诗**
`;
    const categories = parseTagMarkdown(md);
    expect(categories[0].tags.map((t) => t.label)).toEqual(['黑暗', '治愈', '史诗']);
  });

  // 5. 编号标签
  it('5. should strip various numbering formats (1. 2、 (3))', () => {
    const md = `
## 模式
1. 升级流
2、 凡人流
(3) 赘婿流
（4） 模拟器
`;
    const categories = parseTagMarkdown(md);
    expect(categories[0].tags.map((t) => t.label)).toEqual([
      '升级流',
      '凡人流',
      '赘婿流',
      '模拟器',
    ]);
  });

  // 6. 说明区忽略
  it('6. should ignore instruction and documentation sections', () => {
    const md = `
## 核心标签
奇幻、科幻

## 十六、说明部分
### 使用说明
这些是说明文字，不应作为标签。
### 结语
结束语。
`;
    const categories = parseTagMarkdown(md);
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('核心标签');
  });

  // 7. 同分类内去重
  it('7. should deduplicate identical tags within the same category', () => {
    const md = `
## 标签组
奇幻、科幻、奇幻、奇幻、武侠
`;
    const categories = parseTagMarkdown(md);
    expect(categories[0].tags.map((t) => t.label)).toEqual(['奇幻', '科幻', '武侠']);
  });

  // 8. 跨分类同名标签保留
  it('8. should preserve identical tag labels across different categories', () => {
    const md = `
## 频道A
神医、团宠
## 频道B
神医、兵王
`;
    const categories = parseTagMarkdown(md);
    expect(categories).toHaveLength(2);
    expect(categories[0].tags.map((t) => t.label)).toContain('神医');
    expect(categories[1].tags.map((t) => t.label)).toContain('神医');
  });

  // 9. 分类和标签原始顺序保留
  it('9. should preserve the exact original sequence of categories and tags', () => {
    const md = `
## 标签A
Z、A、M
## 标签B
B、C、A
`;
    const categories = parseTagMarkdown(md);
    expect(categories[0].name).toBe('标签A');
    expect(categories[0].tags.map((t) => t.label)).toEqual(['Z', 'A', 'M']);
    expect(categories[1].name).toBe('标签B');
    expect(categories[1].tags.map((t) => t.label)).toEqual(['B', 'C', 'A']);
  });

  // 10. 空文件
  it('10. should return empty array for empty string or whitespace', () => {
    expect(parseTagMarkdown('')).toEqual([]);
    expect(parseTagMarkdown('   \n\n   ')).toEqual([]);
  });

  // 11. 只有说明、没有标签
  it('11. should return empty array if document only contains instruction sections', () => {
    const md = `
# 标题
## 使用说明
这里没有任何有效标签。
## 注意事项
注意安全。
`;
    expect(parseTagMarkdown(md)).toEqual([]);
  });

  // 12. 中英文标点混用
  it('12. should handle mixed Chinese and English punctuation delimiters', () => {
    const md = `
## 混合标点
标签一,标签二，标签三、标签四;标签五；标签六|标签七。
`;
    const categories = parseTagMarkdown(md);
    expect(categories[0].tags.map((t) => t.label)).toEqual([
      '标签一',
      '标签二',
      '标签三',
      '标签四',
      '标签五',
      '标签六',
      '标签七',
    ]);
  });
});
