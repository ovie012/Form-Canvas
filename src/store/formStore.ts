import { create } from 'zustand';
import type { FormField, FormSchema, BuilderMode, FieldType } from '@/types/form';

function generateId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createDefaultField(type: FieldType): FormField {
  const base: FormField = {
    id: generateId(),
    type,
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
    placeholder: '',
    validation: {},
    conditions: [],
  };

  if (type === 'select') {
    base.options = [
      { label: 'Option 1', value: 'option_1' },
      { label: 'Option 2', value: 'option_2' },
    ];
  }

  return base;
}

interface HistoryEntry {
  fields: FormField[];
}

interface FormStore {
  schema: FormSchema;
  selectedFieldId: string | null;
  selectedFieldIds: Set<string>;
  mode: BuilderMode;
  draggedType: FieldType | null;
  savedSchemas: FormSchema[];

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;

  addField: (type: FieldType, index?: number) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  reorderFields: (fromIndex: number, toIndex: number) => void;
  selectField: (id: string | null) => void;
  toggleFieldSelection: (id: string) => void;
  selectAllFields: () => void;
  clearSelection: () => void;
  duplicateField: (id: string) => void;
  duplicateSelected: () => void;
  removeSelected: () => void;
  setMode: (mode: BuilderMode) => void;
  setDraggedType: (type: FieldType | null) => void;
  saveSchema: () => void;
  loadSchema: (id: string) => void;
  resetSchema: () => void;
  setSchemaName: (name: string) => void;
  importSchema: (schema: FormSchema) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function createEmptySchema(): FormSchema {
  return {
    id: `schema_${Date.now()}`,
    name: 'Untitled Form',
    fields: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function loadSavedSchemas(): FormSchema[] {
  try {
    const data = localStorage.getItem('form_schemas');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

const MAX_HISTORY = 50;

function pushHistory(state: FormStore): Pick<FormStore, 'history' | 'historyIndex'> {
  const entry: HistoryEntry = { fields: JSON.parse(JSON.stringify(state.schema.fields)) };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(entry);
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

export const useFormStore = create<FormStore>((set, get) => ({
  schema: createEmptySchema(),
  selectedFieldId: null,
  selectedFieldIds: new Set<string>(),
  mode: 'builder',
  draggedType: null,
  savedSchemas: loadSavedSchemas(),
  history: [{ fields: [] }],
  historyIndex: 0,

  addField: (type, index) => {
    const field = createDefaultField(type);
    set((state) => {
      const fields = [...state.schema.fields];
      if (index !== undefined) {
        fields.splice(index, 0, field);
      } else {
        fields.push(field);
      }
      const hist = pushHistory({ ...state, schema: { ...state.schema, fields } });
      return {
        schema: { ...state.schema, fields, updatedAt: new Date().toISOString() },
        selectedFieldId: field.id,
        selectedFieldIds: new Set<string>(),
        ...hist,
      };
    });
  },

  removeField: (id) => {
    set((state) => {
      const fields = state.schema.fields.filter((f) => f.id !== id);
      const hist = pushHistory({ ...state, schema: { ...state.schema, fields } });
      return {
        schema: { ...state.schema, fields, updatedAt: new Date().toISOString() },
        selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
        ...hist,
      };
    });
  },

  updateField: (id, updates) => {
    set((state) => {
      const fields = state.schema.fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
      const hist = pushHistory({ ...state, schema: { ...state.schema, fields } });
      return {
        schema: { ...state.schema, fields, updatedAt: new Date().toISOString() },
        ...hist,
      };
    });
  },

  reorderFields: (fromIndex, toIndex) => {
    set((state) => {
      const fields = [...state.schema.fields];
      const [moved] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, moved);
      const hist = pushHistory({ ...state, schema: { ...state.schema, fields } });
      return { schema: { ...state.schema, fields, updatedAt: new Date().toISOString() }, ...hist };
    });
  },

  selectField: (id) => set({ selectedFieldId: id, selectedFieldIds: new Set<string>() }),

  toggleFieldSelection: (id) => {
    set((state) => {
      const next = new Set(state.selectedFieldIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedFieldIds: next, selectedFieldId: next.size === 1 ? [...next][0] : null };
    });
  },

  selectAllFields: () => {
    set((state) => ({
      selectedFieldIds: new Set(state.schema.fields.map((f) => f.id)),
      selectedFieldId: null,
    }));
  },

  clearSelection: () => set({ selectedFieldIds: new Set<string>(), selectedFieldId: null }),

  duplicateField: (id) => {
    set((state) => {
      const idx = state.schema.fields.findIndex((f) => f.id === id);
      if (idx < 0) return state;
      const original = state.schema.fields[idx];
      const clone: FormField = {
        ...JSON.parse(JSON.stringify(original)),
        id: generateId(),
        label: `${original.label} (copy)`,
      };
      const fields = [...state.schema.fields];
      fields.splice(idx + 1, 0, clone);
      const hist = pushHistory({ ...state, schema: { ...state.schema, fields } });
      return {
        schema: { ...state.schema, fields, updatedAt: new Date().toISOString() },
        selectedFieldId: clone.id,
        selectedFieldIds: new Set<string>(),
        ...hist,
      };
    });
  },

  duplicateSelected: () => {
    set((state) => {
      if (state.selectedFieldIds.size === 0) return state;
      const fields = [...state.schema.fields];
      const newIds = new Set<string>();
      // Process in reverse to maintain insertion order
      const indices = state.schema.fields
        .map((f, i) => (state.selectedFieldIds.has(f.id) ? i : -1))
        .filter((i) => i >= 0)
        .reverse();
      for (const idx of indices) {
        const original = fields[idx];
        const clone: FormField = {
          ...JSON.parse(JSON.stringify(original)),
          id: generateId(),
          label: `${original.label} (copy)`,
        };
        fields.splice(idx + 1, 0, clone);
        newIds.add(clone.id);
      }
      const hist = pushHistory({ ...state, schema: { ...state.schema, fields } });
      return {
        schema: { ...state.schema, fields, updatedAt: new Date().toISOString() },
        selectedFieldIds: newIds,
        selectedFieldId: null,
        ...hist,
      };
    });
  },

  removeSelected: () => {
    set((state) => {
      if (state.selectedFieldIds.size === 0) return state;
      const fields = state.schema.fields.filter((f) => !state.selectedFieldIds.has(f.id));
      const hist = pushHistory({ ...state, schema: { ...state.schema, fields } });
      return {
        schema: { ...state.schema, fields, updatedAt: new Date().toISOString() },
        selectedFieldIds: new Set<string>(),
        selectedFieldId: null,
        ...hist,
      };
    });
  },

  setMode: (mode) => set({ mode, selectedFieldId: null, selectedFieldIds: new Set<string>() }),

  setDraggedType: (type) => set({ draggedType: type }),

  saveSchema: () => {
    const { schema, savedSchemas } = get();
    const updated = { ...schema, updatedAt: new Date().toISOString() };
    const existing = savedSchemas.findIndex((s) => s.id === updated.id);
    const newList = [...savedSchemas];
    if (existing >= 0) {
      newList[existing] = { ...updated };
    } else {
      newList.push({ ...updated });
    }
    localStorage.setItem('form_schemas', JSON.stringify(newList));
    set({ savedSchemas: newList, schema: updated });
  },

  loadSchema: (id) => {
    const { savedSchemas } = get();
    const found = savedSchemas.find((s) => s.id === id);
    if (found) {
      const schema = { ...found };
      set({
        schema,
        selectedFieldId: null,
        selectedFieldIds: new Set<string>(),
        mode: 'builder',
        history: [{ fields: JSON.parse(JSON.stringify(schema.fields)) }],
        historyIndex: 0,
      });
    }
  },

  resetSchema: () => {
    const empty = createEmptySchema();
    set({
      schema: empty,
      selectedFieldId: null,
      selectedFieldIds: new Set<string>(),
      mode: 'builder',
      history: [{ fields: [] }],
      historyIndex: 0,
    });
  },

  setSchemaName: (name) => {
    set((state) => ({
      schema: { ...state.schema, name, updatedAt: new Date().toISOString() },
    }));
  },

  importSchema: (schema) => {
    set({
      schema: { ...schema, updatedAt: new Date().toISOString() },
      selectedFieldId: null,
      selectedFieldIds: new Set<string>(),
      mode: 'builder',
      history: [{ fields: JSON.parse(JSON.stringify(schema.fields)) }],
      historyIndex: 0,
    });
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      const entry = state.history[newIndex];
      return {
        historyIndex: newIndex,
        schema: {
          ...state.schema,
          fields: JSON.parse(JSON.stringify(entry.fields)),
          updatedAt: new Date().toISOString(),
        },
        selectedFieldId: null,
        selectedFieldIds: new Set<string>(),
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      const entry = state.history[newIndex];
      return {
        historyIndex: newIndex,
        schema: {
          ...state.schema,
          fields: JSON.parse(JSON.stringify(entry.fields)),
          updatedAt: new Date().toISOString(),
        },
        selectedFieldId: null,
        selectedFieldIds: new Set<string>(),
      };
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
