import { useFormStore } from '@/store/formStore';
import type { FieldType, FormField } from '@/types/form';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FIELD_TYPES } from './FieldPalette';

export function FormCanvas() {
  const {
    schema,
    selectedFieldId,
    selectedFieldIds,
    selectField,
    toggleFieldSelection,
    addField,
    removeField,
    removeSelected,
    duplicateField,
    duplicateSelected,
    reorderFields,
    undo,
    redo,
  } = useFormStore();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [reorderFrom, setReorderFrom] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'SELECT') return;
        if (selectedFieldIds.size > 0) {
          e.preventDefault();
          removeSelected();
        } else if (selectedFieldId) {
          e.preventDefault();
          removeField(selectedFieldId);
        }
      }
      if (mod && e.key === 'd') {
        e.preventDefault();
        if (selectedFieldIds.size > 0) {
          duplicateSelected();
        } else if (selectedFieldId) {
          duplicateField(selectedFieldId);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, removeSelected, removeField, duplicateField, duplicateSelected, selectedFieldId, selectedFieldIds]);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index?: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setDragOverIndex(index ?? schema.fields.length);
    },
    [schema.fields.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const fieldType = e.dataTransfer.getData('field-type') as FieldType;
      const reorderIdx = e.dataTransfer.getData('reorder-index');

      if (reorderIdx !== '' && dragOverIndex !== null) {
        const from = parseInt(reorderIdx, 10);
        if (from !== dragOverIndex && from !== dragOverIndex - 1) {
          reorderFields(from, dragOverIndex > from ? dragOverIndex - 1 : dragOverIndex);
        }
      } else if (fieldType) {
        addField(fieldType, dragOverIndex ?? undefined);
      }

      setDragOverIndex(null);
      setReorderFrom(null);
    },
    [addField, reorderFields, dragOverIndex]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setDragOverIndex(null);
    }
  }, []);

  const handleFieldDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('reorder-index', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setReorderFrom(index);
  }, []);

  const handleFieldClick = useCallback(
    (e: React.MouseEvent, fieldId: string) => {
      if (e.ctrlKey || e.metaKey) {
        toggleFieldSelection(fieldId);
      } else {
        selectField(fieldId);
      }
    },
    [selectField, toggleFieldSelection]
  );

  const isFieldSelected = (id: string) => selectedFieldId === id || selectedFieldIds.has(id);
  const multiCount = selectedFieldIds.size;

  return (
    <div
      ref={canvasRef}
      className="flex-1 bg-canvas min-h-full p-4 md:p-6 overflow-y-auto"
      onDragOver={(e) => handleDragOver(e)}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {/* Multi-select toolbar */}
      {multiCount > 1 && (
        <div className="max-w-2xl mx-auto mb-3 flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 text-sm">
          <span className="text-muted-foreground">{multiCount} fields selected</span>
          <div className="flex-1" />
          <button
            onClick={duplicateSelected}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium hover:bg-muted transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </button>
          <button
            onClick={removeSelected}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-1">
        {schema.fields.length === 0 && (
          <div
            className={`flex items-center justify-center h-48 rounded-lg border-2 border-dashed transition-colors duration-150 ${
              dragOverIndex !== null
                ? 'border-primary/40 bg-canvas-drop'
                : 'border-border text-muted-foreground'
            }`}
          >
            <p className="text-sm">Drag fields here to build your form</p>
          </div>
        )}

        {schema.fields.map((field, index) => (
          <div key={field.id}>
            <DropIndicator
              visible={dragOverIndex === index}
              onDragOver={(e) => handleDragOver(e, index)}
            />
            <CanvasField
              field={field}
              index={index}
              isSelected={isFieldSelected(field.id)}
              isDragSource={reorderFrom === index}
              onSelect={(e) => handleFieldClick(e, field.id)}
              onRemove={() => removeField(field.id)}
              onDuplicate={() => duplicateField(field.id)}
              onDragStart={(e) => handleFieldDragStart(e, index)}
            />
          </div>
        ))}

        {schema.fields.length > 0 && (
          <DropIndicator
            visible={dragOverIndex === schema.fields.length}
            onDragOver={(e) => handleDragOver(e, schema.fields.length)}
          />
        )}
      </div>
    </div>
  );
}

function DropIndicator({
  visible,
  onDragOver,
}: {
  visible: boolean;
  onDragOver: (e: React.DragEvent) => void;
}) {
  return (
    <div
      className={`h-1 rounded-full mx-2 transition-colors duration-100 ${
        visible ? 'bg-primary' : 'bg-transparent'
      }`}
      onDragOver={onDragOver}
    />
  );
}

interface CanvasFieldProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  isDragSource: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

function CanvasField({
  field,
  isSelected,
  isDragSource,
  onSelect,
  onRemove,
  onDuplicate,
  onDragStart,
}: CanvasFieldProps) {
  const fieldMeta = FIELD_TYPES.find((f) => f.type === field.type);
  const Icon = fieldMeta?.icon;

  return (
    <div
      className={`field-card group flex items-center gap-3 ${
        isSelected ? 'selected' : ''
      } ${isDragSource ? 'opacity-40' : ''}`}
      onClick={onSelect}
    >
      <div
        draggable
        onDragStart={onDragStart}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{field.label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {field.type}
          {field.validation.required ? ' / required' : ''}
          {field.conditions.length > 0 ? ` / ${field.conditions.length} condition(s)` : ''}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity duration-100 p-1"
        aria-label={`Duplicate ${field.label}`}
        title="Duplicate"
      >
        <Copy className="h-4 w-4" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity duration-100 p-1"
        aria-label={`Remove ${field.label}`}
        title="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
