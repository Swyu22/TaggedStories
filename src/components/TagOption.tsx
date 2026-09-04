import type { FC, KeyboardEvent } from 'react';
import { Check } from 'lucide-react';
import { TagItem } from '../types';

interface TagOptionProps {
  tag: TagItem;
  isSelected: boolean;
  onToggle: (tagId: string) => void;
}

export const TagOption: FC<TagOptionProps> = ({ tag, isSelected, onToggle }) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle(tag.id);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onToggle(tag.id)}
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all select-none border focus:outline-none focus-visible:ring-2 focus-visible:ring-vermilion focus-visible:ring-offset-1 ${
        isSelected
          ? 'bg-vermilion text-white border-vermilion shadow-sm hover:bg-vermilion-hover'
          : 'bg-white hover:bg-parchment-100 text-ink-700 border-parchment-300 hover:border-parchment-400'
      }`}
    >
      <span
        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
          isSelected
            ? 'bg-white/20 border-white text-white'
            : 'border-parchment-400 bg-parchment-50 text-transparent'
        }`}
      >
        <Check className={`w-2.5 h-2.5 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
      </span>
      <span>{tag.label}</span>
    </button>
  );
};
