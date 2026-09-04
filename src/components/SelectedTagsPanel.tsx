import type { FC } from 'react';
import { TagCategory, SelectedTagState } from '../types';
import { Tags, X, Trash2 } from 'lucide-react';

interface SelectedTagsPanelProps {
  categories: TagCategory[];
  selectedTags: SelectedTagState;
  onRemoveTag: (categoryId: string, tagId: string) => void;
  onClearAllSelected: () => void;
}

export const SelectedTagsPanel: FC<SelectedTagsPanelProps> = ({
  categories,
  selectedTags,
  onRemoveTag,
  onClearAllSelected,
}) => {
  // Collect all selected tags maintaining original markdown category & tag order
  const selectedItems: {
    categoryId: string;
    categoryPath: string;
    tagId: string;
    label: string;
  }[] = [];

  for (const cat of categories) {
    const ids = selectedTags[cat.id];
    if (!ids || ids.length === 0) continue;

    const idSet = new Set(ids);
    for (const tag of cat.tags) {
      if (idSet.has(tag.id)) {
        selectedItems.push({
          categoryId: cat.id,
          categoryPath: cat.displayPath,
          tagId: tag.id,
          label: tag.label,
        });
      }
    }
  }

  const totalCount = selectedItems.length;

  return (
    <div className="bg-white rounded-xl border border-parchment-200 p-4 sm:p-5 shadow-paper transition-all">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-parchment-100">
        <div className="flex items-center gap-2">
          <Tags className="w-4 h-4 text-vermilion" />
          <h3 className="text-sm font-bold font-serif text-ink-900">已选标签汇总</h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-vermilion/10 text-vermilion font-semibold">
            已选择 {totalCount} 个标签
          </span>
        </div>

        {totalCount > 0 && (
          <button
            type="button"
            onClick={onClearAllSelected}
            className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空已选</span>
          </button>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="py-6 text-center text-xs text-ink-400">
          尚未选择任何标签，请在下方各分类中勾选您故事匹配的标签。若不选择，生成提示词时将标注为“无”。
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
          {selectedItems.map((item) => (
            <span
              key={`${item.categoryId}-${item.tagId}`}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md text-xs bg-parchment-100 border border-parchment-300 text-ink-800 shadow-paper group"
            >
              <span className="text-ink-400 text-[10px] font-normal">
                {item.categoryPath.split('／').pop()} :
              </span>
              <span className="font-medium text-ink-900">{item.label}</span>
              <button
                type="button"
                onClick={() => onRemoveTag(item.categoryId, item.tagId)}
                className="w-4 h-4 rounded hover:bg-parchment-300 text-ink-400 hover:text-red-600 flex items-center justify-center transition-colors"
                title={`移除标签：${item.label}`}
                aria-label={`移除标签 ${item.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
