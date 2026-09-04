import { useState, useEffect, useRef } from 'react';
import { StoryFormData, SelectedTagState, PromptBuildResult, TagCategory, LocalDraft } from '../types';

const STORAGE_KEY = 'tagged-story-synopsis:draft:v1';

const initialFormData: StoryFormData = {
  title: '',
  originalSynopsis: '',
  immutableCore: '',
  otherRequirements: '',
};

export function useLocalDraft(categories: TagCategory[]) {
  const [form, setForm] = useState<StoryFormData>(initialFormData);
  const [selectedTags, setSelectedTags] = useState<SelectedTagState>({});
  const [lastResult, setLastResult] = useState<PromptBuildResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const draft: LocalDraft = JSON.parse(raw);
        if (draft && typeof draft === 'object') {
          if (draft.form) {
            setForm({
              title: draft.form.title || '',
              originalSynopsis: draft.form.originalSynopsis || '',
              immutableCore: draft.form.immutableCore || '',
              otherRequirements: draft.form.otherRequirements || '',
            });
          }

          // Filter selected tags to only those that exist in categories
          if (draft.selectedTags && categories.length > 0) {
            const validTagIdsByCategory = new Map<string, Set<string>>();
            for (const cat of categories) {
              validTagIdsByCategory.set(cat.id, new Set(cat.tags.map((t) => t.id)));
            }

            const sanitizedSelected: SelectedTagState = {};
            for (const [catId, tagIds] of Object.entries(draft.selectedTags)) {
              const validSet = validTagIdsByCategory.get(catId);
              if (validSet) {
                const validIds = tagIds.filter((id) => validSet.has(id));
                if (validIds.length > 0) {
                  sanitizedSelected[catId] = validIds;
                }
              }
            }
            setSelectedTags(sanitizedSelected);
          }

          if (draft.lastResult && draft.lastResult.text) {
            setLastResult({
              ...draft.lastResult,
              isRestoredDraft: true,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load local draft from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, [categories]);

  // Debounced auto-save (400ms)
  useEffect(() => {
    if (!isLoaded) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const draft: LocalDraft = {
          form,
          selectedTags,
          lastResult,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch (e) {
        console.warn('Failed to save draft to localStorage:', e);
      }
    }, 400);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [form, selectedTags, lastResult, isLoaded]);

  const clearDraft = () => {
    setForm(initialFormData);
    setSelectedTags({});
    setLastResult(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear draft from localStorage:', e);
    }
  };

  return {
    form,
    setForm,
    selectedTags,
    setSelectedTags,
    lastResult,
    setLastResult,
    clearDraft,
    isLoaded,
  };
}
