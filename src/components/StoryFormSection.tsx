import { forwardRef } from 'react';
import { StoryFormData } from '../types';
import { BookMarked, AlertCircle } from 'lucide-react';

interface StoryFormSectionProps {
  form: StoryFormData;
  onChange: (field: keyof StoryFormData, value: string) => void;
  errorSynopsis?: string;
}

export const StoryFormSection = forwardRef<HTMLTextAreaElement, StoryFormSectionProps>(
  ({ form, onChange, errorSynopsis }, ref) => {
    return (
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-100">
          <BookMarked className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold font-serif text-slate-900">
            步骤一：填写故事资料
          </h2>
        </div>

        <div className="space-y-5">
          {/* 1. 作品名称 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="story-title"
                className="text-sm font-semibold text-slate-800"
              >
                作品名称
                <span className="text-xs font-normal text-slate-400 ml-1.5">（选填）</span>
              </label>
              <span className="text-xs text-slate-400 tabular-nums font-mono">
                {form.title.length} 字符
              </span>
            </div>
            <input
              id="story-title"
              type="text"
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="可留空；留空时会在最终提示词中要求 AI 推荐作品名称"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* 2. 原始故事梗概 (必填) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="story-synopsis"
                className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"
              >
                <span>原始故事梗概</span>
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.2 rounded">
                  必填
                </span>
              </label>
              <span className="text-xs text-slate-400 tabular-nums font-mono">
                {form.originalSynopsis.length} 字符
              </span>
            </div>
            <textarea
              ref={ref}
              id="story-synopsis"
              rows={9}
              value={form.originalSynopsis}
              onChange={(e) => onChange('originalSynopsis', e.target.value)}
              placeholder="请填写故事的大致人物、背景、主要事件、冲突或结局方向。内容可以不完整，最终提示词会要求 AI 进行专业补充。"
              aria-invalid={!!errorSynopsis}
              aria-describedby={errorSynopsis ? 'synopsis-error' : undefined}
              className={`w-full min-h-[240px] px-3.5 py-3 rounded-lg border text-sm leading-relaxed placeholder:text-slate-400 focus:outline-none transition-all resize-y ${
                errorSynopsis
                  ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200 focus:border-red-500'
                  : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            {errorSynopsis && (
              <div
                id="synopsis-error"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 font-medium"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorSynopsis}</span>
              </div>
            )}
          </div>

          {/* 3. 不可更改的故事核心设定 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="story-immutable"
                className="text-sm font-semibold text-slate-800"
              >
                不可更改的故事核心设定
                <span className="text-xs font-normal text-slate-400 ml-1.5">（选填）</span>
              </label>
              <span className="text-xs text-slate-400 tabular-nums font-mono">
                {form.immutableCore.length} 字符
              </span>
            </div>
            <textarea
              id="story-immutable"
              rows={4}
              value={form.immutableCore}
              onChange={(e) => onChange('immutableCore', e.target.value)}
              placeholder="填写必须保留的人物身份、人物关系、世界观规则、关键事件、人物命运、既定结局或其他限制。"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 text-sm leading-relaxed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y"
            />
          </div>

          {/* 4. 其他创作要求 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="story-requirements"
                className="text-sm font-semibold text-slate-800"
              >
                其他创作要求
                <span className="text-xs font-normal text-slate-400 ml-1.5">（选填）</span>
              </label>
              <span className="text-xs text-slate-400 tabular-nums font-mono">
                {form.otherRequirements.length} 字符
              </span>
            </div>
            <textarea
              id="story-requirements"
              rows={4}
              value={form.otherRequirements}
              onChange={(e) => onChange('otherRequirements', e.target.value)}
              placeholder="填写希望强化的内容，例如悬疑、爱情、权谋、战争、人物成长、反转、悲剧感、史诗感、商业性或特定受众。"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 text-sm leading-relaxed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y"
            />
          </div>
        </div>
      </section>
    );
  }
);

StoryFormSection.displayName = 'StoryFormSection';
