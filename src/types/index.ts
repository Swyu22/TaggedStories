export interface StoryFormData {
  title: string;
  originalSynopsis: string;
  immutableCore: string;
  otherRequirements: string;
}

export interface TagItem {
  id: string;
  label: string;
  order: number;
}

export interface TagCategory {
  id: string;
  name: string;
  path: string[];
  displayPath: string;
  order: number;
  tags: TagItem[];
}

export interface SelectedTagState {
  [categoryId: string]: string[];
}

export interface PromptInput {
  form: StoryFormData;
  categories: TagCategory[];
  selectedTags: SelectedTagState;
}

export interface PromptBuildResult {
  text: string;
  characterCount: number;
  generatedAt: string;
  isRestoredDraft?: boolean;
}

export interface LocalDraft {
  form: StoryFormData;
  selectedTags: SelectedTagState;
  lastResult?: PromptBuildResult | null;
  savedAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface TagGroup {
  id: string;
  name: string;
  order: number;
  categories: TagCategory[];
}
