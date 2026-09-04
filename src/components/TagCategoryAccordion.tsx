import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { TagCategory } from '../types';
import { TagOption } from './TagOption';
import { ChevronDown, CheckCheck, RotateCcw, ChevronsDown, ChevronsUp } from 'lucide-react';

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
  // Level 1 accordion state
  const [isExpanded, setIsExpanded] = useState(false);
  // Level 2 accordions: set of expanded category IDs
  const [expandedSubcategoryIds, setExpandedSubcategoryIds] = useState<Set<string>>(new Set());

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
      return { cat, visibleTags: cat.tags, isMatch: false };
    }

    const catMatches =
      cat.displayPath.toLowerCase().includes(normalizedQuery) ||
      cat.name.toLowerCase().includes(normalizedQuery) ||
      groupTitle.toLowerCase().includes(normalizedQuery);

    const visibleTags = catMatches
      ? cat.tags
      : cat.tags.filter((t) => t.label.toLowerCase().includes(normalizedQuery));

    const isMatch = visibleTags.length > 0;
    if (isMatch) {
      hasMatchingSearch = true;
    }

    return { cat, visibleTags, isMatch };
  });

  // Automatically expand Level 1 and matching Level 2 subcategories if searching
  useEffect(() => {
    if (normalizedQuery) {
      if (hasMatchingSearch) {
        setIsExpanded(true);
        const matchingIds = new Set<string>();
        for (const item of filteredCategories) {
          if (item.isMatch) {
            matchingIds.add(item.cat.id);
          }
        }
        setExpandedSubcategoryIds(matchingIds);
      }
    }
  }, [normalizedQuery, hasMatchingSearch]);

  // Handle global expand/collapse: affects both Level 1 and Level 2
  useEffect(() => {
    if (isGloballyExpanded !== null) {
      setIsExpanded(isGloballyExpanded);
      if (isGloballyExpanded) {
        setExpandedSubcategoryIds(new Set(categories.map((c) => c.id)));
      } else {
        setExpandedSubcategoryIds(new Set());
      }
    }
  }, [isGloballyExpanded, categories]);

  // Toggle single Level 2 subcategory
  const toggleSubcategory = (catId: string) => {
    setExpandedSubcategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  // Expand / collapse all Level 2 items in this group
  const handleExpandAllSubcategories = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubcategoryIds(new Set(categories.map((c) => c.id)));
  };

  const handleCollapseAllSubcategories = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubcategoryIds(new Set());
  };

  // If search query is active and nothing in this group matches, hide group
  if (normalizedQuery && !hasMatchingSearch) {
    return null;
  }

  const allSubcategoriesExpanded =
    categories.length > 0 && categories.every((c) => expandedSubcategoryIds.has(c.id));

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm mb-3.5 transition-colors">
      {/* Level 1 Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-slate-50/70 hover:bg-slate-100/70 text-left transition-colors focus:outline-none focus-visible:bg-slate-100"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-serif font-bold text-slate-900 text-sm sm:text-base tracking-tight">
            {groupTitle}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium border bg-white text-slate-600 border-slate-200">
            {selectedTagsInGroup > 0 ? (
              <span className="font-semibold text-brand-600">
                已选 {selectedTagsInGroup} / {totalTagsInGroup}
              </span>
            ) : (
              <span>共 {categories.length} 个二级分类 · {totalTagsInGroup} 标签</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick toggle all Level 2 subcategories inside when Level 1 is open */}
          {isExpanded && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              {allSubcategoriesExpanded ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleCollapseAllSubcategories}
                  onKeyDown={(e) => e.key === 'Enter' && handleCollapseAllSubcategories(e as any)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-200/60 transition-colors"
                  title="收起本组全部二级分类"
                >
                  <ChevronsUp className="w-3.5 h-3.5" />
                  <span>收起二级</span>
                </span>
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleExpandAllSubcategories}
                  onKeyDown={(e) => e.key === 'Enter' && handleExpandAllSubcategories(e as any)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-200/60 transition-colors"
                  title="展开本组全部二级分类"
                >
                  <ChevronsDown className="w-3.5 h-3.5" />
                  <span>展开二级</span>
                </span>
              )}
            </div>
          )}

          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
              isExpanded ? 'rotate-180 text-brand-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Level 1 Content: List of Level 2 Subcategories */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-3 bg-white">
          {filteredCategories.map(({ cat, visibleTags }) => {
            if (visibleTags.length === 0) return null;

            const selectedInCat = selectedMap[cat.id] || [];
            const isSubExpanded = expandedSubcategoryIds.has(cat.id);
            const subTitle =
              cat.path.length > 1
                ? cat.path.slice(1).join(' · ')
                : cat.name;

            return (
              <div
                key={cat.id}
                className="border border-slate-200/90 rounded-lg overflow-hidden bg-white shadow-xs transition-colors hover:border-brand-200"
              >
                {/* Level 2 Subcategory Header */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/60 hover:bg-brand-50/30 transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleSubcategory(cat.id)}
                    aria-expanded={isSubExpanded}
                    className="flex-1 flex items-center gap-2 text-left focus:outline-none"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 flex-shrink-0 ${
                        isSubExpanded ? 'rotate-180 text-brand-600' : ''
                      }`}
                    />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">
                      {subTitle}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({selectedInCat.length}/{cat.tags.length})
                    </span>
                    {selectedInCat.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                    )}
                  </button>

                  {/* Level 2 quick actions: Select All / Clear */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAllInCategory(cat.id);
                        // Auto-expand this subcategory when user selects all
                        setExpandedSubcategoryIds((prev) => new Set(prev).add(cat.id));
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="全选当前子分类下的标签"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>全选</span>
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearCategory(cat.id);
                      }}
                      disabled={selectedInCat.length === 0}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      title="清空当前子分类下的选择"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>清空</span>
                    </button>
                  </div>
                </div>

                {/* Level 2 Content: Tags Pill Grid */}
                {isSubExpanded && (
                  <div className="p-3.5 bg-white border-t border-slate-100 flex flex-wrap gap-2 animate-in fade-in-50 duration-150">
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
