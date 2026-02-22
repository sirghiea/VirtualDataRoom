import { useState } from 'react';
import { Folder as FolderIcon, MoreVertical, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Folder } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import RenameDialog from '@/components/shared/RenameDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface FolderCardProps {
  folder: Folder;
  onOpen: (folderId: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  getDescendantCounts: (id: string) => Promise<{ folders: number; files: number }>;
  viewMode: 'grid' | 'list';
  index?: number;
}

export default function FolderCard({
  folder,
  onOpen,
  onRename,
  onDelete,
  getDescendantCounts,
  viewMode,
  index = 0,
}: FolderCardProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteDesc, setDeleteDesc] = useState('');

  const handleDeleteClick = async () => {
    const counts = await getDescendantCounts(folder.id);
    const parts: string[] = [];
    if (counts.folders > 0)
      parts.push(`${counts.folders} subfolder${counts.folders > 1 ? 's' : ''}`);
    if (counts.files > 0)
      parts.push(`${counts.files} file${counts.files > 1 ? 's' : ''}`);
    const detail =
      parts.length > 0 ? ` This will also delete ${parts.join(' and ')}.` : '';
    setDeleteDesc(`Are you sure you want to delete "${folder.name}"?${detail}`);
    setDeleteOpen(true);
  };

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted opacity-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onOpen(folder.id)}>
          <FolderOpen size={14} />
          Open
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRenameOpen(true)}>
          <Pencil size={14} />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDeleteClick}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 size={14} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: index * 0.02 }}
          onClick={() => onOpen(folder.id)}
          className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-white/5"
        >
          <FolderIcon size={16} className="shrink-0 text-amber-400" />
          <span className="flex-1 text-sm font-medium text-foreground truncate">
            {folder.name}
          </span>
          <span className="text-xs text-muted shrink-0 w-20">Folder</span>
          <span className="text-xs text-muted shrink-0 w-24">&mdash;</span>
          <span className="text-xs text-muted shrink-0 w-28">
            {formatDate(folder.createdAt)}
          </span>
          <div className="shrink-0">{menu}</div>
        </motion.div>

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        onClick={() => onOpen(folder.id)}
        className="glass group relative flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:bg-glass-hover hover:border-primary/20 hover:-translate-y-0.5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
          <FolderIcon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground truncate block" title={folder.name}>
            {folder.name}
          </span>
          <span className="text-xs text-muted">{formatDate(folder.createdAt)}</span>
        </div>
        <div className="shrink-0">{menu}</div>
      </motion.div>

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
