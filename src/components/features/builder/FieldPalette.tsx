import { type FieldType } from '@/types/form';
import {
  Type,
  Hash,
  Mail,
  List,
  CheckSquare,
  Calendar,
  AlignLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useFormStore } from '@/store/formStore';

interface FieldTypeConfig {
  type: FieldType;
  label: string;
  icon: LucideIcon;
}

export const FIELD_TYPES: FieldTypeConfig[] = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'select', label: 'Select', icon: List },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'textarea', label: 'Text Area', icon: AlignLeft },
];

interface FieldPaletteProps {
  className?: string;
}

export function FieldPalette({ className }: FieldPaletteProps) {
  const isTouchDevice =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const { addField } = useFormStore();

  const handleDragStart = (e: React.DragEvent, type: FieldType) => {
    e.dataTransfer.setData('field-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = (type: FieldType) => {
  if (isTouchDevice) {
    addField(type);
  }
};

  return (
    <div className={className}>
      <div className="panel-section">
        <h3 className="panel-heading">Field Types</h3>
        <div className="grid grid-cols-2 gap-2">
          {FIELD_TYPES.map((field) => (
            <div
              key={field.type}
              draggable
              onDragStart={(e) => handleDragStart(e, field.type)}
              onClick={() => handleClick(field.type)}
              className="flex items-center gap-2 rounded-md border border-border bg-card p-2.5 text-sm font-medium text-foreground cursor-grab active:cursor-grabbing hover:bg-field-hover transition-colors duration-100 select-none"
            >
              <field.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{field.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
