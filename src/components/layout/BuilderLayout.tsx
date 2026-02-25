import { useState } from 'react';
import styled from 'styled-components';
import { useFormStore } from '@/store/formStore';
import { FieldPalette } from '../features/builder/FieldPalette';
import { FormCanvas } from '../features/builder/FormCanvas';
import { FieldConfig } from '../features/builder/FieldConfig';
import { FormRenderer } from '../features/renderer/FormRenderer';
import { ImportSchemaDialog } from '../features/builder/ImportSchemaDialog';
import {
  PanelLeft,
  PanelRight,
  Eye,
  Pencil,
  Save,
  RotateCcw,
  FileDown,
  FileUp,
  Upload,
  Undo2,
  Redo2,
  X,
  GripVertical,
} from 'lucide-react';

const LogoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LogoIconCover = styled.div`
  width: 25px;
  height: 25px;
  border: 1px solid #9e3030;
  overflow: hidden;
  border-radius: 50%;

  @media screen and (max-width: 450px) {
    display: none;
  }
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export function BuilderLayout() {
  const {
    schema,
    mode,
    setMode,
    saveSchema,
    resetSchema,
    savedSchemas,
    loadSchema,
    setSchemaName,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFormStore();

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'palette' | 'config' | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  const isPreview = mode === 'preview';

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-panel px-4 h-14 shrink-0">
        <div className="flex items-center gap-3">
          <LogoHeader>
            <LogoIconCover>
              <Logo src="/formCanvasLogo.png" alt="Form Canvas Logo" />
            </LogoIconCover>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">Form Canvas</h1>
          </LogoHeader>
          <span className="hidden sm:inline text-xs text-muted-foreground">/</span>
          <input
            className="hidden sm:block text-sm bg-transparent border-none outline-none text-foreground w-40 truncate focus:ring-0"
            value={schema.name}
            onChange={(e) => setSchemaName(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1">
          {/* Mobile panel toggles */}
          <button
            onClick={() => setMobilePanel(mobilePanel === 'palette' ? null : 'palette')}
            className="md:hidden p-2 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Toggle field palette"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobilePanel(mobilePanel === 'config' ? null : 'config')}
            className="md:hidden p-2 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Toggle config panel"
          >
            <PanelRight className="h-4 w-4" />
          </button>

          {/* Mobile actions toggle */}
          <button
            onClick={() => setShowMobileActions(!showMobileActions)}
            className="md:hidden p-2 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Toggle actions panel"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Desktop panel toggles */}
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="hidden md:flex p-2 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Toggle left panel"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setRightOpen(!rightOpen)}
            className="hidden md:flex p-2 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Toggle right panel"
          >
            <PanelRight className="h-4 w-4" />
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Undo / Redo */}
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Redo"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Mode toggle */}
          <button
            onClick={() => setMode(isPreview ? 'builder' : 'preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isPreview
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            {isPreview ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {isPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
        {/* Save / Load / Import / Export / Reset - Desktop only (>450px) */}
        <div className="max-[450px]:hidden flex items-center gap-2">
          <button
            onClick={saveSchema}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Save schema"
            title="Save"
          >
            <Save className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground"
              aria-label="Load schema"
              title="Load"
            >
              <FileUp className="h-4 w-4" />
            </button>
            {showSaved && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Saved Forms</p>
                  {savedSchemas.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">No saved forms</p>
                  )}
                  {savedSchemas.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        loadSchema(s.id);
                        setShowSaved(false);
                      }}
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted truncate"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowImport(true)}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Import schema"
            title="Import JSON"
          >
            <Upload className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              const json = JSON.stringify(schema, null, 2);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${schema.name.replace(/\s+/g, '_')}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Export schema"
            title="Export JSON"
          >
            <FileDown className="h-4 w-4" />
          </button>

          <button
            onClick={resetSchema}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Reset schema"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay panels */}
        {mobilePanel && (
          <div className="absolute inset-0 z-40 md:hidden flex">
            <div className="w-72 bg-panel border-r border-border h-full overflow-y-auto">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {mobilePanel === 'palette' ? 'Fields' : 'Configuration'}
                </span>
                <button onClick={() => setMobilePanel(null)} className="p-1 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {mobilePanel === 'palette' ? <FieldPalette /> : <FieldConfig />}
            </div>
            <div className="flex-1 bg-foreground/20" onClick={() => setMobilePanel(null)} />
          </div>
        )}

        {/* Mobile right-side actions panel */}
        {showMobileActions && (
          <>
            {/* Overlay background */}
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setShowMobileActions(false)}
            />
            {/* Slide-in panel */}
            <div
              className={`
                fixed top-0 right-0 h-full w-64 bg-panel border-l border-border shadow-xl z-50
                flex flex-col p-4 max-[450px]:transition-transform max-[450px]:duration-300
              `}
            >
              {/* Close button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowMobileActions(false)}
                  className="p-1 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={saveSchema}
                  className="p-2 rounded-md hover:bg-muted text-muted-foreground flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> Save
                </button>

                <button
                  onClick={() => setShowSaved(!showSaved)}
                  className="p-2 rounded-md hover:bg-muted text-muted-foreground flex items-center gap-2"
                >
                  <FileUp className="h-4 w-4" /> Load
                </button>

                {showSaved && (
                  <div className="bg-popover border border-border rounded-lg shadow p-2 max-h-40 overflow-y-auto">
                    {savedSchemas.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No saved forms</p>
                    ) : (
                      savedSchemas.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            loadSchema(s.id);
                            setShowSaved(false);
                            setShowMobileActions(false);
                          }}
                          className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted truncate"
                        >
                          {s.name}
                        </button>
                      ))
                    )}
                  </div>
                )}

                <button
                  onClick={() => setShowImport(true)}
                  className="p-2 rounded-md hover:bg-muted text-muted-foreground flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" /> Import
                </button>

                <button
                  onClick={() => {
                    const json = JSON.stringify(schema, null, 2);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${schema.name.replace(/\s+/g, '_')}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="p-2 rounded-md hover:bg-muted text-muted-foreground flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" /> Export
                </button>

                <button
                  onClick={resetSchema}
                  className="p-2 rounded-md hover:bg-muted text-muted-foreground flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
            </div>
          </>
        )}

        {/* Left Panel - Desktop */}
        {leftOpen && !isPreview && (
          <aside className="hidden md:block w-56 lg:w-64 border-r border-border bg-panel overflow-y-auto shrink-0">
            <FieldPalette />
          </aside>
        )}

        {/* Canvas / Preview */}
        <main className="flex-1 overflow-y-auto">
          {isPreview ? <FormRenderer fields={schema.fields} /> : <FormCanvas />}
        </main>

        {/* Right Panel - Desktop */}
        {rightOpen && !isPreview && (
          <aside className="hidden md:block w-64 lg:w-72 border-l border-border bg-panel overflow-y-auto shrink-0">
            <FieldConfig />
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-border bg-panel px-4 h-8 shrink-0 text-xs text-muted-foreground">
        <span>{schema.fields.length} field(s)</span>
        <span className="hidden sm:inline">
          Last updated: {new Date(schema.updatedAt).toLocaleTimeString()}
        </span>
      </footer>

      {/* Import Dialog */}
      <ImportSchemaDialog open={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}