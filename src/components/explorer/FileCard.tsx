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
          className="h-7 w-7 text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.02 }}
          onClick={() => onView(file)}
          className="list-row group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-400/10">
            <FileText size={15} className="text-rose-400" />
          </div>
          <span className="flex-1 text-sm text-foreground truncate" title={displayName}>
            {displayName}
          </span>
          <span className="text-[11px] text-muted shrink-0 w-20 uppercase font-medium">
            {file.extension}
          </span>
          <span className="text-[11px] text-muted shrink-0 w-24 text-right tabular-nums">
            {formatBytes(file.size)}
          </span>
          <span className="text-[11px] text-muted shrink-0 w-28">
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={() => onView(file)}
        draggable
        onDragStart={(e) => {
          (e as unknown as React.DragEvent).dataTransfer?.setData('text/file-id', file.id);
        }}
        className="card-premium group relative flex cursor-pointer flex-col rounded-2xl p-4 overflow-hidden"
      >
        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-400/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400/15 to-rose-400/5 ring-1 ring-rose-400/10 group-hover:ring-rose-400/25 transition-all duration-300 group-hover:shadow-md group-hover:shadow-rose-400/10">
              <FileText size={20} className="text-rose-400" />
            </div>
            <div className="min-w-0">
              <span
                className="text-sm font-semibold text-foreground truncate block group-hover:text-white transition-colors duration-200"
                title={displayName}
              >
                {file.name}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold tracking-wide">
                  {file.extension.toUpperCase()}
                </Badge>
                <span className="text-[11px] text-muted tabular-nums">
                  {formatBytes(file.size)}
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0">{menu}</div>
        </div>

        {/* Bottom meta */}
        <div className="relative flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.03]">
          <span className="text-[11px] text-muted/70">
            {formatDate(file.createdAt)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted opacity-0 group-hover:opacity-100 group-hover:text-rose-400/70 transition-all duration-200">
            <Eye size={12} />
            Preview
          </span>
        </div>
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
