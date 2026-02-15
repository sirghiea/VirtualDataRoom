import { useState } from 'react';
import { Folder as FolderIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Folder } from '@/types';
import RenameDialog from '@/components/shared/RenameDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface FolderCardProps {
  folder: Folder;
  onOpen: (folderId: string) => void;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  getDescendantCounts: (id: string) => Promise<{ folders: number; files: number }>;
}

export default function FolderCard({
  folder,
  onOpen,
  onRename,
  onDelete,
  getDescendantCounts,
}: FolderCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteDesc, setDeleteDesc] = useState('');

  const handleDeleteClick = async () => {
    setMenuOpen(false);
    const counts = await getDescendantCounts(folder.id);
    const parts: string[] = [];
    if (counts.folders > 0) parts.push(`${counts.folders} subfolder${counts.folders > 1 ? 's' : ''}`);
    if (counts.files > 0) parts.push(`${counts.files} file${counts.files > 1 ? 's' : ''}`);
    const detail = parts.length > 0 ? ` This will also delete ${parts.join(' and ')}.` : '';
    setDeleteDesc(`Are you sure you want to delete "${folder.name}"?${detail}`);
    setDeleteOpen(true);
  };

  return (
    <>
      <div
        onClick={() => onOpen(folder.id)}
        className="glass group relative flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:bg-glass-hover hover:border-primary/20"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
          <FolderIcon size={20} />
        </div>
        <span
          className="text-sm font-medium text-foreground truncate flex-1"
          title={folder.name}
        >
          {folder.name}
        </span>

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
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl shadow-xl overflow-hidden bg-[#1e1e2e] border border-white/10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onOpen(folder.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-white/10 transition-colors"
                >
                  <FolderIcon size={14} />
                  Open
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
                    handleDeleteClick();
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
        title="Rename Folder"
        currentName={folder.name}
        onSave={(name) => {
          onRename(folder.id, name);
          setRenameOpen(false);
        }}
        onCancel={() => setRenameOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Folder"
        description={deleteDesc}
        onConfirm={() => {
          onDelete(folder.id);
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
