import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { TagCategory } from '../types';
import { TagOption } from './TagOption';
import { ChevronDown, CheckCheck, RotateCcw } from 'lucide-react';

interface TagCategoryAccordionProps {
  groupTitle: string;
  categories: TagCategory[];
  selectedMap: Record<string, string[]>;
  searchQuery: string;
  isGloballyExpanded: boolean | null;
  onToggleTag: (categoryId: string, tagId: string) => void;
  onSelectAllInCategory: (categoryId: string) => void;
  onClearCategory: (categoryId: string) => void;
}

export const TagCategoryAccordion: FC<TagCategoryAccordionProps> = ({
  groupTitle,
  categories,
  selectedMap,
  searchQuery,
  isGloballyExpanded,
  onToggleTag,
  onSelectAllInCategory,
  onClearCategory,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate group total & selected
  let totalTagsInGroup = 0;
  let selectedTagsInGroup = 0;
  let hasMatchingSearch = false;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filter categories according to search query
  const filteredCategories = categories.map((cat) => {
    totalTagsInGroup += cat.tags.length;
    const currentSelected = selectedMap[cat.id] || [];
    selectedTagsInGroup += currentSelected.length;

    if (!normalizedQuery) {
      return { cat, visibleTags: cat.tags };
    }

    const catMatches =
      cat.displayPath.toLowerCase().includes(normalizedQuery) ||
      cat.name.toLowerCase().includes(normalizedQuery) ||
      groupTitle.toLowerCase().includes(normalizedQuery);

    const visibleTags = catMatches
      ? cat.tags
      : cat.tags.filter((t) => t.label.toLowerCase().includes(normalizedQuery));

    if (visibleTags.length > 0) {
      hasMatchingSearch = true;
    }

    return { cat, visibleTags };
  });

  // Automatically expand if matching search query
  useEffect(() => {
    if (normalizedQuery) {
      if (hasMatchingSearch) {
        setIsExpanded(true);
      }
    }
  }, [normalizedQuery, hasMatchingSearch]);

  // Handle global expand/collapse
  useEffect(() => {
    if (isGloballyExpanded !== null) {
      setIsExpanded(isGloballyExpanded);
    }
  }, [isGloballyExpanded]);

  // If search query is active and nothing in this group matches, hide group
  if (normalizedQuery && !hasMatchingSearch) {
    return null;
  }

  return (
    <div className="border border-parchment-200 rounded-lg bg-white overflow-hidden shadow-paper mb-3 transition-colors">
      {/* Group Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-parchment-50/70 hover:bg-parchment-100/70 text-left transition-colors focus:outline-none focus-visible:bg-parchment-100"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-serif font-bold text-ink-900 text-sm sm:text-base">
            {groupTitle}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-parchment-200/70 text-ink-600">
            {selectedTagsInGroup > 0 ? (
              <span className="font-semibold text-vermilion">
                已选 {selectedTagsInGroup} / {totalTagsInGroup}
              </span>
            ) : (
              <span>共 {totalTagsInGroup} 标签</span>
            )}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-ink-400 transition-transform duration-200 flex-shrink-0 ${
            isExpanded ? 'rotate-180 text-ink-700' : ''
          }`}
        />
      </button>

      {/* Group Content */}
      {isExpanded && (
        <div className="p-4 space-y-5 divide-y divide-parchment-100">
          {filteredCategories.map(({ cat, visibleTags }) => {
            if (visibleTags.length === 0) return null;

            const selectedInCat = selectedMap[cat.id] || [];
            const subTitle =
              cat.path.length > 1
                ? cat.path.slice(1).join(' · ')
                : cat.name;

            return (
              <div key={cat.id} className="pt-4 first:pt-0">
                {/* Subcategory Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-ink-800">
                      {subTitle}
                    </h3>
                    <span className="text-xs text-ink-400 font-mono">
                      ({selectedInCat.length}/{cat.tags.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => onSelectAllInCategory(cat.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-ink-500 hover:text-ink-800 hover:bg-parchment-100 transition-colors"
                      title="全选当前子分类下的标签"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>全选</span>
                    </button>
                    <span className="text-ink-300">|</span>
                    <button
                      type="button"
                      onClick={() => onClearCategory(cat.id)}
                      disabled={selectedInCat.length === 0}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-ink-500 hover:text-ink-800 hover:bg-parchment-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      title="清空当前子分类下的选择"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>清空</span>
                    </button>
                  </div>
                </div>

                {/* Tags List */}
                <div className="flex flex-wrap gap-2">
                  {visibleTags.map((tag) => {
                    const isSelected = selectedInCat.includes(tag.id);
                    return (
                      <TagOption
                        key={tag.id}
                        tag={tag}
                        isSelected={isSelected}
                        onToggle={(tagId) => onToggleTag(cat.id, tagId)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
