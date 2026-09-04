import { useState, useMemo } from 'react';
import type { FC, ChangeEvent } from 'react';
import { TagCategory, SelectedTagState } from '../types';
import { TagCategoryAccordion } from './TagCategoryAccordion';
import { SelectedTagsPanel } from './SelectedTagsPanel';
import { Search, ChevronDown, ChevronUp, Layers, Upload, Trash2, X } from 'lucide-react';

interface TagLibrarySectionProps {
  categories: TagCategory[];
  selectedTags: SelectedTagState;
  onToggleTag: (categoryId: string, tagId: string) => void;
  onSelectAllInCategory: (categoryId: string) => void;
  onClearCategory: (categoryId: string) => void;
  onRemoveSingleTag: (categoryId: string, tagId: string) => void;
  onClearAllSelectedTags: () => void;
  onImportCustomMarkdown?: (markdownContent: string) => void;
}

export const TagLibrarySection: FC<TagLibrarySectionProps> = ({
  categories,
  selectedTags,
  onToggleTag,
  onSelectAllInCategory,
  onClearCategory,
  onRemoveSingleTag,
  onClearAllSelectedTags,
  onImportCustomMarkdown,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGloballyExpanded, setIsGloballyExpanded] = useState<boolean | null>(null);

  // Group categories by top-level section: category.path[0]
  const groupedCategories = useMemo(() => {
    const groups: { [groupName: string]: TagCategory[] } = {};
    for (const cat of categories) {
      const groupName = cat.path[0] || '未分类';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(cat);
    }
    return Object.entries(groups).map(([groupTitle, cats]) => ({
      groupTitle,
      categories: cats,
    }));
  }, [categories]);

  // Handle local file import
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportCustomMarkdown) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportCustomMarkdown(content);
      }
    };
    reader.readAsText(file, 'utf-8');
    // Reset input so same file can be reselected
    e.target.value = '';
  };

  const totalTagsInLibrary = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.tags.length, 0);
  }, [categories]);

  return (
    <section className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold font-serif text-slate-900">
              步骤二：选择故事标签
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-brand-50 text-brand-700 border border-brand-200">
              共 {categories.length} 分类 · {totalTagsInLibrary} 标签
            </span>
          </div>

          {/* Import option (PRD Section 14.2) */}
          {onImportCustomMarkdown && (
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>导入备用标签库 (.md)</span>
              <input
                type="file"
                accept=".md,text/markdown,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Search & Global Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标签名称或分类名称（如：大女主、悬疑、先婚后爱）..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                aria-label="清空搜索"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsGloballyExpanded(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              <span>展开全部</span>
            </button>
            <button
              type="button"
              onClick={() => setIsGloballyExpanded(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              <span>收起全部</span>
            </button>
            <button
              type="button"
              onClick={onClearAllSelectedTags}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>清空已选</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected tags summary box */}
      <SelectedTagsPanel
        categories={categories}
        selectedTags={selectedTags}
        onRemoveTag={onRemoveSingleTag}
        onClearAllSelected={onClearAllSelectedTags}
      />

      {/* Category Accordions */}
      {categories.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500">
          <p className="text-sm font-medium mb-2">未找到内置标签清单</p>
          <p className="text-xs text-slate-400">
            请检查 src/data/story-tags.md，或点击右上角导入一份 Markdown 标签清单。
          </p>
        </div>
      ) : (
        <div>
          {groupedCategories.map(({ groupTitle, categories: catGroup }) => (
            <TagCategoryAccordion
              key={groupTitle}
              groupTitle={groupTitle}
              categories={catGroup}
              selectedMap={selectedTags}
              searchQuery={searchQuery}
              isGloballyExpanded={isGloballyExpanded}
              onToggleTag={onToggleTag}
              onSelectAllInCategory={onSelectAllInCategory}
              onClearCategory={onClearCategory}
            />
          ))}
        </div>
      )}
    </section>
  );
};
