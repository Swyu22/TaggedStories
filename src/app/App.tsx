import { useState, useMemo, useRef, useCallback } from 'react';
import defaultTagMarkdown from '../data/story-tags.md?raw';
import { parseTagMarkdown } from '../lib/parseTagMarkdown';
import { buildPrompt } from '../lib/buildPrompt';
import { copyToClipboard } from '../lib/clipboard';
import { downloadMarkdown } from '../lib/downloadMarkdown';
import { parseExportedMarkdown } from '../lib/parseExportedMarkdown';
import { useLocalDraft } from '../hooks/useLocalDraft';
import { useToast } from '../hooks/useToast';
import { AppHeader } from '../components/AppHeader';
import { StoryFormSection } from '../components/StoryFormSection';
import { TagLibrarySection } from '../components/TagLibrarySection';
import { GenerateActions } from '../components/GenerateActions';
import { PromptResultPanel } from '../components/PromptResultPanel';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { PromptBuildResult } from '../types';

export const App = () => {
  // Custom uploaded markdown or default
  const [activeMarkdown, setActiveMarkdown] = useState<string>(defaultTagMarkdown);

  // Parse categories from markdown
  const categories = useMemo(() => {
    return parseTagMarkdown(activeMarkdown);
  }, [activeMarkdown]);

  // Toast notifications
  const { toasts, showToast, removeToast } = useToast();

  // Local draft persistence & state
  const {
    form,
    setForm,
    selectedTags,
    setSelectedTags,
    lastResult,
    setLastResult,
    clearDraft,
  } = useLocalDraft(categories);

  // Validation & UI states
  const [synopsisError, setSynopsisError] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [copyFeedbackText, setCopyFeedbackText] = useState<string>('');

  // Refs for accessible focus management
  const synopsisTextareaRef = useRef<HTMLTextAreaElement>(null);
  const resultPanelRef = useRef<HTMLDivElement>(null);

  // Form field update
  const handleFormFieldChange = useCallback(
    (field: keyof typeof form, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (field === 'originalSynopsis' && synopsisError && value.trim()) {
        setSynopsisError('');
      }
    },
    [setForm, synopsisError]
  );

  // Import previously exported markdown to restore form & tags
  const handleImportExportedMarkdown = useCallback(
    (content: string) => {
      try {
        const parsed = parseExportedMarkdown(content, categories);
        if (!parsed.form.originalSynopsis && parsed.matchedTagsCount === 0 && !parsed.form.title) {
          showToast('未能识别到有效的提示词结构，请确认文件是否为此前导出的 MD', 'error');
          return;
        }
        setForm(parsed.form);
        setSelectedTags(parsed.selectedTags);
        setLastResult({
          text: content,
          characterCount: content.length,
          generatedAt: new Date().toISOString(),
          isRestoredDraft: true,
        });
        setSynopsisError('');
        const titleDisplay = parsed.form.title ? `《${parsed.form.title}》` : '';
        showToast(
          `已成功载入${titleDisplay}文档，已恢复故事资料并自动勾选 ${parsed.matchedTagsCount} 个标签`,
          'success'
        );
      } catch (e: any) {
        showToast(e?.message || '载入 MD 文档解析失败', 'error');
      }
    },
    [categories, setForm, setSelectedTags, setLastResult, showToast]
  );

  // Tag selection handlers
  const handleToggleTag = useCallback(
    (categoryId: string, tagId: string) => {
      setSelectedTags((prev) => {
        const currentList = prev[categoryId] || [];
        const isSelected = currentList.includes(tagId);
        const updatedList = isSelected
          ? currentList.filter((id) => id !== tagId)
          : [...currentList, tagId];

        if (updatedList.length === 0) {
          const next = { ...prev };
          delete next[categoryId];
          return next;
        }
        return { ...prev, [categoryId]: updatedList };
      });
    },
    [setSelectedTags]
  );

  const handleSelectAllInCategory = useCallback(
    (categoryId: string) => {
      const targetCategory = categories.find((c) => c.id === categoryId);
      if (!targetCategory) return;
      setSelectedTags((prev) => ({
        ...prev,
        [categoryId]: targetCategory.tags.map((t) => t.id),
      }));
    },
    [categories, setSelectedTags]
  );

  const handleClearCategory = useCallback(
    (categoryId: string) => {
      setSelectedTags((prev) => {
        const next = { ...prev };
        delete next[categoryId];
        return next;
      });
    },
    [setSelectedTags]
  );

  const handleRemoveSingleTag = useCallback(
    (categoryId: string, tagId: string) => {
      handleToggleTag(categoryId, tagId);
    },
    [handleToggleTag]
  );

  const handleClearAllSelectedTags = useCallback(() => {
    setSelectedTags({});
    showToast('已清空全部已选标签', 'info', 2000);
  }, [setSelectedTags, showToast]);

  // Import custom markdown
  const handleImportCustomMarkdown = useCallback(
    (content: string) => {
      try {
        const parsed = parseTagMarkdown(content);
        if (parsed.length === 0) {
          showToast('导入的 Markdown 文件中未识别到有效分类或标签', 'error');
          return;
        }
        setActiveMarkdown(content);
        showToast(`成功解析 ${parsed.length} 个分类`, 'success');
      } catch (e) {
        showToast('标签 Markdown 解析失败，请检查文件格式', 'error');
        console.error(e);
      }
    },
    [showToast]
  );

  // Core Prompt Generation
  const handleGenerate = useCallback(
    async (autoCopy: boolean) => {
      if (isGenerating) return;

      // 1. Validate synopsis
      if (!form.originalSynopsis.trim()) {
        const errorMsg = '请先填写原始故事梗概';
        setSynopsisError(errorMsg);
        showToast(errorMsg, 'error');
        synopsisTextareaRef.current?.focus();
        return;
      }

      setSynopsisError('');
      setIsGenerating(true);

      try {
        // 2. Build full prompt
        const promptText = buildPrompt({
          form,
          categories,
          selectedTags,
        });

        const newResult: PromptBuildResult = {
          text: promptText,
          characterCount: promptText.length,
          generatedAt: new Date().toISOString(),
          isRestoredDraft: false,
        };

        setLastResult(newResult);

        // 3. Handle Clipboard
        if (autoCopy) {
          const copied = await copyToClipboard(promptText);
          if (copied) {
            setCopyFeedbackText('已自动复制');
            showToast('完整提示词已生成并复制到剪贴板', 'success');
          } else {
            setCopyFeedbackText('未允许自动复制');
            showToast(
              '完整提示词已生成，但浏览器未允许自动复制，请点击“再次复制”或手动复制',
              'warning',
              5000
            );
          }
        } else {
          setCopyFeedbackText('');
          showToast('完整提示词预览已生成', 'info');
        }

        // 4. Smooth scroll and focus
        setTimeout(() => {
          resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          resultPanelRef.current?.focus();
        }, 100);
      } catch (err: any) {
        showToast(err?.message || '生成提示词时发生错误', 'error');
      } finally {
        setIsGenerating(false);
      }
    },
    [form, categories, selectedTags, isGenerating, setLastResult, showToast]
  );

  // Re-copy prompt
  const handleCopyAgain = useCallback(async () => {
    if (!lastResult?.text) return;
    const copied = await copyToClipboard(lastResult.text);
    if (copied) {
      showToast('已复制到剪贴板', 'success');
      setCopyFeedbackText('已重新复制');
    } else {
      showToast('复制失败，请在下方文本框全选手动复制', 'warning');
    }
  }, [lastResult, showToast]);

  // Download markdown
  const handleDownload = useCallback(() => {
    if (!lastResult?.text) return;
    try {
      const filename = downloadMarkdown(lastResult.text, form.title);
      showToast(`已下载 Markdown 文件：${filename}`, 'success');
    } catch (err) {
      showToast('下载文件失败，请手动复制文本保存', 'error');
      console.error(err);
    }
  }, [lastResult, form.title, showToast]);

  // Clear all confirmation
  const handleConfirmClearAll = useCallback(() => {
    clearDraft();
    setIsClearModalOpen(false);
    setSynopsisError('');
    setCopyFeedbackText('');
    showToast('已清空全部内容和本地草稿', 'info');
  }, [clearDraft, showToast]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Step 1: Story Information */}
        <StoryFormSection
          ref={synopsisTextareaRef}
          form={form}
          onChange={handleFormFieldChange}
          errorSynopsis={synopsisError}
          onImportExportedMarkdown={handleImportExportedMarkdown}
        />

        {/* Step 2: Tag Selection */}
        <TagLibrarySection
          categories={categories}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          onSelectAllInCategory={handleSelectAllInCategory}
          onClearCategory={handleClearCategory}
          onRemoveSingleTag={handleRemoveSingleTag}
          onClearAllSelectedTags={handleClearAllSelectedTags}
          onImportCustomMarkdown={handleImportCustomMarkdown}
        />

        {/* Step 3: Action Buttons */}
        <GenerateActions
          onGenerateAndCopy={() => handleGenerate(true)}
          onGeneratePreviewOnly={() => handleGenerate(false)}
          onCopyAgain={handleCopyAgain}
          onDownloadMarkdown={handleDownload}
          onConfirmClearAll={() => setIsClearModalOpen(true)}
          hasResult={!!lastResult}
          isGenerating={isGenerating}
        />

        {/* Result Area */}
        <PromptResultPanel
          ref={resultPanelRef}
          result={lastResult}
          onCopyAgain={handleCopyAgain}
          onDownloadMarkdown={handleDownload}
          copyFeedbackText={copyFeedbackText}
        />
      </main>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearModalOpen}
        title="确认清空全部内容？"
        message="此操作将清空您填写的表单、已选标签、生成的提示词以及当前浏览器的本地草稿，且无法恢复。"
        confirmLabel="确认清空"
        cancelLabel="取消"
        onConfirm={handleConfirmClearAll}
        onCancel={() => setIsClearModalOpen(false)}
      />

      {/* Global Toast Manager */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-serif font-medium text-slate-700">
            Tagged Story Synopsis · 本地化故事梗概提示词生成器
          </p>
          <p>
            全过程在浏览器本地完成 · 不调用任何外部 AI 接口 · 不收集或上传用户创作数据
          </p>
        </div>
      </footer>
    </div>
  );
};
