import { forwardRef } from 'react';
import { PromptBuildResult } from '../types';
import { FileText, Copy, Download, CheckCircle2 } from 'lucide-react';

interface PromptResultPanelProps {
  result: PromptBuildResult | null;
  onCopyAgain: () => void;
  onDownloadMarkdown: () => void;
  copyFeedbackText?: string;
}

export const PromptResultPanel = forwardRef<HTMLDivElement, PromptResultPanelProps>(
  ({ result, onCopyAgain, onDownloadMarkdown, copyFeedbackText }, ref) => {
    if (!result) return null;

    const isRestored = result.isRestoredDraft;

    return (
      <section
        ref={ref}
        tabIndex={-1}
        className="bg-white rounded-xl border border-parchment-200 p-5 sm:p-6 shadow-paper focus:outline-none scroll-mt-24"
      >
        {/* Header and status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-parchment-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-sage text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif text-ink-900">
                  {isRestored ? '上次生成结果（本地草稿）' : '完整提示词已生成'}
                </h2>
                {copyFeedbackText && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{copyFeedbackText}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-400 mt-0.5 font-mono">
                总计 {result.characterCount} 字符 · 生成时间：{new Date(result.generatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopyAgain}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-ink-800 bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-ink-600" />
              <span>复制全文</span>
            </button>
            <button
              type="button"
              onClick={onDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-ink-800 hover:bg-ink-900 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-white/90" />
              <span>下载 .md</span>
            </button>
          </div>
        </div>

        {/* Read-only full text area */}
        <div className="relative">
          <textarea
            readOnly
            value={result.text}
            rows={18}
            className="w-full font-mono text-xs sm:text-sm leading-relaxed p-4 rounded-lg bg-parchment-50/70 border border-parchment-200 text-ink-800 focus:outline-none focus:ring-1 focus:ring-parchment-400 resize-y"
            aria-label="生成的完整提示词内容"
          />
        </div>
      </section>
    );
  }
);

PromptResultPanel.displayName = 'PromptResultPanel';
