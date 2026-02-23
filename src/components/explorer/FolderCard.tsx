import { useState } from 'react';
import { Folder as FolderIcon, FileText, MoreVertical, Pencil, Trash2, FolderOpen, ChevronRight } from 'lucide-react';
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
  siblingNames?: string[];
  counts?: { folders: number; files: number };
}

export default function FolderCard({
  folder,
  onOpen,
  onRename,
  onDelete,
  getDescendantCounts,
  viewMode,
  index = 0,
  siblingNames = [],
  counts,
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
          className="h-7 w-7 text-muted opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/[0.08]"
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
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.02 }}
          onClick={() => onOpen(folder.id)}
          className="list-row group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/15 to-amber-400/5 ring-1 ring-amber-400/10">
            <FolderIcon size={15} className="text-amber-400" />
          </div>
          <span className="flex-1 text-sm font-medium text-foreground truncate">
            {folder.name}
          </span>
          <span className="text-[11px] text-muted shrink-0 w-20">Folder</span>
          <span className="text-[11px] text-muted shrink-0 w-24">&mdash;</span>
          <span className="text-[11px] text-muted shrink-0 w-28">
            {formatDate(folder.createdAt)}
          </span>
          <div className="shrink-0">{menu}</div>
        </motion.div>

        <RenameDialog
          open={renameOpen}
          title="Rename Folder"
          currentName={folder.name}
          existingNames={siblingNames}
          entityLabel="Folder name"
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
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={() => onOpen(folder.id)}
        className="card-premium inner-glow-amber group relative flex cursor-pointer flex-col rounded-2xl p-4 overflow-hidden"
      >
        {/* Dot pattern */}
        <div className="absolute inset-0 dot-pattern opacity-30" />

        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/[0.04] via-transparent to-orange-400/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top highlight */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-amber-400/15 rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-400/5 ring-1 ring-amber-400/15 group-hover:ring-amber-400/30 transition-all duration-400 group-hover:shadow-lg group-hover:shadow-amber-400/10">
                <FolderIcon size={22} className="text-amber-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span
                className="text-sm font-semibold text-foreground truncate block group-hover:text-white transition-colors duration-200"
                title={folder.name}
              >
                {folder.name}
              </span>
              <span className="text-[11px] text-muted/70 mt-1 block">
                {formatDate(folder.createdAt)}
              </span>
            </div>
          </div>
          <div className="shrink-0">{menu}</div>
        </div>

        {/* Content counts */}
        {counts && (
          <div className="relative flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <FolderIcon size={11} className="text-amber-400/50" />
              <span className="text-[11px] text-muted/60 tabular-nums">
                {counts.folders} subfolder{counts.folders !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText size={11} className="text-blue-400/50" />
              <span className="text-[11px] text-muted/60 tabular-nums">
                {counts.files} file{counts.files !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Bottom accent */}
        <div className="relative flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04]">
          <span className="text-[10px] text-muted/50 font-medium uppercase tracking-wider">Folder</span>
          <ChevronRight size={15} className="text-muted/40 group-hover:text-amber-400/70 group-hover:translate-x-1 transition-all duration-300" />
        </div>
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
