import type { FC } from 'react';
import { Sparkles, Eye, Copy, Download, Trash } from 'lucide-react';

interface GenerateActionsProps {
  onGenerateAndCopy: () => void;
  onGeneratePreviewOnly: () => void;
  onCopyAgain: () => void;
  onDownloadMarkdown: () => void;
  onConfirmClearAll: () => void;
  hasResult: boolean;
  isGenerating: boolean;
}

export const GenerateActions: FC<GenerateActionsProps> = ({
  onGenerateAndCopy,
  onGeneratePreviewOnly,
  onCopyAgain,
  onDownloadMarkdown,
  onConfirmClearAll,
  hasResult,
  isGenerating,
}) => {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Main generation buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Main action: Generate and copy */}
          <button
            type="button"
            onClick={onGenerateAndCopy}
            disabled={isGenerating}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />
            <span>生成并复制完整提示词</span>
          </button>

          {/* Secondary: Generate preview only */}
          <button
            type="button"
            onClick={onGeneratePreviewOnly}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all disabled:opacity-60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>仅生成预览</span>
          </button>
        </div>

        {/* Result secondary export actions & danger action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onCopyAgain}
            disabled={!hasResult || isGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            title={!hasResult ? '请先生成提示词' : '再次复制提示词到剪贴板'}
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>再次复制</span>
          </button>

          <button
            type="button"
            onClick={onDownloadMarkdown}
            disabled={!hasResult || isGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            title={!hasResult ? '请先生成提示词' : '下载为本地 Markdown 文件'}
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>下载为 Markdown</span>
          </button>

          <button
            type="button"
            onClick={onConfirmClearAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50/80 border border-red-200 transition-all cursor-pointer"
            title="清空表单、标签、结果与本地草稿"
          >
            <Trash className="w-3.5 h-3.5" />
            <span>清空全部内容</span>
          </button>
        </div>
      </div>
    </section>
  );
};
