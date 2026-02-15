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
        onDoubleClick={() => onView(file)}
        className="group relative flex cursor-pointer items-center gap-3 rounded-lg border bg-background p-3 transition-all hover:shadow-sm hover:border-primary/30"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
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
            className="rounded-md p-1 text-muted opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground transition-all"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-md border bg-background shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onView(file);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
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
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
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
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-red-50 transition-colors"
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
