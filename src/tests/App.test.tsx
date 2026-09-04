import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../app/App';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('App Component Interaction Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // 1. 原始梗概为空时无法生成
  it('should show error and prevent generation when original synopsis is empty', async () => {
    render(<App />);

    const generateBtn = screen.getByRole('button', { name: /生成并复制完整提示词/i });
    fireEvent.click(generateBtn);

    expect(screen.getAllByText('请先填写原始故事梗概').length).toBeGreaterThanOrEqual(1);
  });

  // 2. 填写梗概并生成预览
  it('should generate preview when synopsis is filled', async () => {
    render(<App />);

    const synopsisInput = screen.getByPlaceholderText(/请填写故事的大致人物/i);
    fireEvent.change(synopsisInput, { target: { value: '一名普通少年意外获得了穿越时间的能力。' } });

    const previewBtn = screen.getByRole('button', { name: /仅生成预览/i });
    fireEvent.click(previewBtn);

    expect(await screen.findByText('完整提示词已生成')).toBeInTheDocument();
    const resultTextarea = screen.getByLabelText('生成的完整提示词内容') as HTMLTextAreaElement;
    expect(resultTextarea.value).toContain('一名普通少年意外获得了穿越时间的能力');
  });

  // 3. 点击一级折叠展开二级分类，点击二级折叠展开标签并可选中与取消
  it('should support two-level accordion expansion and tag selection', async () => {
    render(<App />);

    // Level 1: Expand "一、受众定位"
    const groupBtn = screen.getByRole('button', { name: /一、受众定位/i });
    fireEvent.click(groupBtn);

    // Verify Level 2 subcategories appear
    const subcategoryBtn = screen.getByRole('button', { name: /频道与消费倾向/i });
    expect(subcategoryBtn).toBeInTheDocument();

    // Level 2: Expand "频道与消费倾向"
    fireEvent.click(subcategoryBtn);

    // Click on "男性向" tag
    const tagOption = screen.getByRole('checkbox', { name: /男性向/i });
    expect(tagOption).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(tagOption);
    expect(tagOption).toHaveAttribute('aria-checked', 'true');

    // Check that it appears in selected tags panel
    expect(screen.getByText('已选择 1 个标签')).toBeInTheDocument();

    // Toggle off
    fireEvent.click(tagOption);
    expect(tagOption).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('已选择 0 个标签')).toBeInTheDocument();
  });

  // 4. 清空全部需要确认
  it('should open confirm modal when clicking clear all', async () => {
    render(<App />);

    const clearAllBtn = screen.getByRole('button', { name: /清空全部内容/i });
    fireEvent.click(clearAllBtn);

    expect(screen.getByText('确认清空全部内容？')).toBeInTheDocument();
  });

  // 5. 搜索功能过滤分类但不清除选中状态，且自动展开匹配项
  it('should filter tags during search while keeping selection', async () => {
    render(<App />);

    // Expand Level 1 & Level 2 and select a tag
    const groupBtn = screen.getByRole('button', { name: /一、受众定位/i });
    fireEvent.click(groupBtn);

    const subcategoryBtn = screen.getByRole('button', { name: /频道与消费倾向/i });
    fireEvent.click(subcategoryBtn);

    const tagOption = screen.getByRole('checkbox', { name: /男性向/i });
    fireEvent.click(tagOption);
    expect(tagOption).toHaveAttribute('aria-checked', 'true');

    // Search for another tag (auto expands matching categories)
    const searchInput = screen.getByPlaceholderText(/搜索标签名称或分类名称/i);
    fireEvent.change(searchInput, { target: { value: '悬疑' } });

    // The selected tags panel should still have the tag
    expect(screen.getByText('已选择 1 个标签')).toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('已选择 1 个标签')).toBeInTheDocument();
  });

  // 6. 载入已导出的 MD 文件并恢复资料与标签
  it('should load an exported MD file and restore form fields and checked tags', async () => {
    render(<App />);

    const exportedMd = `
你的身份是一名资深职业编剧...

以下是我提供的创作资料：

【故事名称】
流浪地球探秘

【故事标签】
一、受众定位／受众与市场定位标签／频道与消费倾向：男性向

【原始故事梗概】
太阳即将毁灭，人类开启行星发动机逃离太阳系。

【不可更改的核心设定】
地球必须保留地下城设定。

【其他创作要求】
强化史诗感与牺牲精神。

现在，请根据以上全部资料，直接输出一篇1000—1500字、符合5W1H原则、因果完整、冲突清晰、结构闭环的专业故事梗概。
    `;

    // Locate the file input for loading MD
    const fileInput = screen.getByLabelText(/载入 MD 文档/i);
    const file = new File([exportedMd], 'Tagged_Story_Synopsis_流浪地球探秘.md', {
      type: 'text/markdown',
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Verify form fields restored
    expect(await screen.findByDisplayValue('流浪地球探秘')).toBeInTheDocument();
    expect(screen.getByDisplayValue('太阳即将毁灭，人类开启行星发动机逃离太阳系。')).toBeInTheDocument();
    expect(screen.getByDisplayValue('地球必须保留地下城设定。')).toBeInTheDocument();
    expect(screen.getByDisplayValue('强化史诗感与牺牲精神。')).toBeInTheDocument();

    // Verify tag restored in selected tags panel
    expect(screen.getByText('已选择 1 个标签')).toBeInTheDocument();
  });
});
