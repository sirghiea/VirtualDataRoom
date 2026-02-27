import { useState } from 'react';
import { FileText, MoreVertical, Pencil, Trash2, Eye, Download, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FileEntry } from '@/types';
import { cn, formatBytes, formatDate } from '@/lib/utils';
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
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export default function FileCard({
  file,
  onView,
  onRename,
  onDelete,
  viewMode,
  index = 0,
  isSelected,
  onToggleSelect,
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
          className="h-7 w-7 text-muted opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/[0.08]"
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
          className={cn(
            'list-row group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5',
            isSelected && 'ring-1 ring-primary/40 bg-primary/[0.04]'
          )}
        >
          {onToggleSelect && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSelect(file.id); }}
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-150',
                isSelected
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-white/20 hover:border-white/40 opacity-0 group-hover:opacity-100',
              )}
            >
              {isSelected && <Check size={12} />}
            </button>
          )}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400/15 to-rose-400/5 ring-1 ring-rose-400/10">
            <FileText size={15} className="text-rose-400" />
          </div>
          <span className="flex-1 text-sm text-foreground truncate" title={displayName}>
            {displayName}
          </span>
          <span className="text-[11px] text-muted shrink-0 w-20 uppercase font-medium tracking-wide">
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
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={() => onView(file)}
        draggable
        onDragStart={(e) => {
          (e as unknown as React.DragEvent).dataTransfer?.setData('text/file-id', file.id);
        }}
        className={cn(
          'card-premium inner-glow-rose group relative flex cursor-pointer flex-col rounded-2xl overflow-hidden',
          isSelected && 'ring-2 ring-primary/50 border-primary/30'
        )}
      >
        {/* File preview zone - taller visual area */}
        <div className="relative h-28 bg-gradient-to-b from-rose-400/[0.04] to-transparent flex items-center justify-center overflow-hidden">
          {/* Selection checkbox */}
          {onToggleSelect && (
            <div
              className={cn(
                'absolute top-3 left-3 z-10 transition-opacity duration-200',
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSelect(file.id); }}
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-150',
                  isSelected
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-white/20 bg-black/40 hover:border-white/40'
                )}
              >
                {isSelected && <Check size={12} />}
              </button>
            </div>
          )}

          {/* Dot pattern */}
          <div className="absolute inset-0 dot-pattern opacity-30" />

          {/* Central icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-rose-400/15 rounded-xl blur-xl opacity-0 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400/20 to-rose-400/5 ring-1 ring-rose-400/15 group-hover:ring-rose-400/30 transition-all duration-400 group-hover:shadow-lg group-hover:shadow-rose-400/15">
              <FileText size={26} className="text-rose-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>

          {/* Extension badge - top right */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-bold tracking-widest uppercase bg-rose-400/10 text-rose-300/90 border-rose-400/15">
              {file.extension}
            </Badge>
          </div>

          {/* View overlay on hover */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
              <Eye size={16} />
              Preview
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="relative p-4 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span
                className="text-sm font-semibold text-foreground truncate block group-hover:text-white transition-colors duration-200"
                title={displayName}
              >
                {file.name}
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-[11px] text-muted/70 tabular-nums">
                  <Download size={10} />
                  {formatBytes(file.size)}
                </span>
                <span className="text-[11px] text-muted/50">
                  {formatDate(file.createdAt)}
                </span>
              </div>
            </div>
            <div className="shrink-0 -mt-0.5">{menu}</div>
          </div>
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
