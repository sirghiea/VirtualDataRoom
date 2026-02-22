import { useState } from 'react';
import { FileText, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FileEntry } from '@/types';
import { formatBytes, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
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

interface FileCardProps {
  file: FileEntry;
  onView: (file: FileEntry) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  viewMode: 'grid' | 'list';
  index?: number;
}

export default function FileCard({
  file,
  onView,
  onRename,
  onDelete,
  viewMode,
  index = 0,
}: FileCardProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const displayName = `${file.name}.${file.extension}`;

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
        <DropdownMenuItem onClick={() => onView(file)}>
          <Eye size={14} />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRenameOpen(true)}>
          <Pencil size={14} />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setDeleteOpen(true)}
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
          onClick={() => onView(file)}
          className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-white/5"
        >
          <FileText size={16} className="shrink-0 text-rose-400" />
          <span className="flex-1 text-sm text-foreground truncate" title={displayName}>
            {displayName}
          </span>
          <span className="text-xs text-muted shrink-0 w-20 uppercase">
            {file.extension}
          </span>
          <span className="text-xs text-muted shrink-0 w-24 text-right">
            {formatBytes(file.size)}
          </span>
          <span className="text-xs text-muted shrink-0 w-28">
            {formatDate(file.createdAt)}
          </span>
          <div className="shrink-0">{menu}</div>
        </motion.div>

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        onClick={() => onView(file)}
        className="glass group relative flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:bg-glass-hover hover:border-primary/20 hover:-translate-y-0.5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400">
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <span
            className="text-sm font-medium text-foreground truncate block"
            title={displayName}
          >
            {displayName}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {file.extension.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted">
              {formatBytes(file.size)}
            </span>
            <span className="text-xs text-muted">&middot;</span>
            <span className="text-xs text-muted">{formatDate(file.createdAt)}</span>
          </div>
        </div>
        <div className="shrink-0">{menu}</div>
      </motion.div>

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
