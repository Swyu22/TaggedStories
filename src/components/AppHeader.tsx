import { useState } from 'react';
import type { FC } from 'react';
import { ShieldCheck, BookOpen, ChevronDown, ChevronUp, Feather } from 'lucide-react';

export const AppHeader: FC = () => {
  const [showPromptInfo, setShowPromptInfo] = useState(false);

  return (
    <header className="border-b border-parchment-200 bg-white/70 backdrop-blur-md sticky top-0 z-30 shadow-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-vermilion text-white flex items-center justify-center shadow-sm">
                <Feather className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-ink-900">
                Tagged Story Synopsis
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-parchment-100 text-ink-700 border border-parchment-300">
                标签化故事梗概提示词生成器
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-ink-500 font-sans">
              填写故事资料并选择标签，一键生成、复制和保存专业故事梗概提示词。
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>纯本地浏览器运算 · 绝不上传隐私</span>
            </div>

            <button
              type="button"
              onClick={() => setShowPromptInfo(!showPromptInfo)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-parchment-100 hover:bg-parchment-200 text-ink-700 border border-parchment-300 transition-colors"
              aria-expanded={showPromptInfo}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>内置提示词说明</span>
              {showPromptInfo ? (
                <ChevronUp className="w-3 h-3 text-ink-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-ink-400" />
              )}
            </button>
          </div>
        </div>

        {showPromptInfo && (
          <div className="mt-3 p-4 rounded-lg bg-parchment-50 border border-parchment-300 text-xs sm:text-sm text-ink-700 leading-relaxed animate-in fade-in duration-200">
            <p className="font-semibold text-ink-900 mb-1">
              关于内置专业编剧长篇提示词：
            </p>
            <p>
              本工具内置一份包含资深职业编剧身份、经典结构理论（亚里士多德、三幕/五幕、英雄之旅、救猫咪等）、
              5W1H 核心要素规范以及 20 项严苛戏剧审校标准的母模板。
              当您点击生成时，系统会将您的故事名称、题材分类标签、原始梗概、不可更改核心设定与定制要求精准注入模板中，
              免去手动编写复杂编剧提示词的繁琐，直接用于驱动大语言模型生成高质量 1000—1500 字故事大纲。
            </p>
          </div>
        )}
      </div>
    </header>
  );
};
