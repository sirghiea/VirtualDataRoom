import { useState } from 'react';
import { FileText, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import type { FileEntry } from '@/types';
import { formatBytes, formatDate } from '@/lib/utils';
import RenameDialog from '@/components/shared/RenameDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface FileCardProps {
  file: FileEntry;
  onView: (file: FileEntry) => void;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function FileCard({ file, onView, onRename, onDelete }: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const displayName = `${file.name}.${file.extension}`;

  return (
    <>
      <div
        onClick={() => onView(file)}
        className="glass group relative flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:bg-glass-hover hover:border-primary/20"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400">
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground truncate block" title={displayName}>
            {displayName}
          </span>
          <span className="text-xs text-muted">
            {formatBytes(file.size)} &middot; {formatDate(file.createdAt)}
          </span>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="rounded-lg p-1 text-muted opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:text-foreground transition-all"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl shadow-xl overflow-hidden bg-[#1e1e2e] border border-white/10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onView(file);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-white/10 transition-colors"
                >
                  <Eye size={14} />
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    setRenameOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-white/10 transition-colors"
                >
                  <Pencil size={14} />
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    setDeleteOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-white/10 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <RenameDialog
        open={renameOpen}
        title="Rename File"
        currentName={file.name}
        onSave={(name) => {
          onRename(file.id, name);
          setRenameOpen(false);
        }}
        onCancel={() => setRenameOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete File"
        description={`Are you sure you want to delete "${displayName}"? This action cannot be undone.`}
        onConfirm={() => {
          onDelete(file.id);
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
