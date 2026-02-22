import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, MoreVertical, Pencil, Trash2, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DataRoom } from '@/types';
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

interface DataRoomCardProps {
  dataRoom: DataRoom;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  index?: number;
}

export default function DataRoomCard({ dataRoom, onRename, onDelete, index = 0 }: DataRoomCardProps) {
  const navigate = useNavigate();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={() => navigate(`/dataroom/${dataRoom.id}`)}
        className="card-premium gradient-border group relative cursor-pointer rounded-2xl p-5 overflow-hidden"
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/15 group-hover:ring-primary/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10">
              <Database size={22} className="text-primary" />
            </div>

            {/* Content */}
            <div className="min-w-0 pt-0.5">
              <h3
                className="font-semibold text-foreground line-clamp-1 group-hover:text-white transition-colors duration-200"
                title={dataRoom.name}
              >
                {dataRoom.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Clock size={11} className="text-muted/70" />
                <span className="text-xs text-muted">
                  Created {formatDate(dataRoom.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
        </div>

        {/* Bottom accent */}
        <div className="flex items-center justify-end mt-4 pt-3 border-t border-white/[0.04]">
          <span className="flex items-center gap-1 text-[11px] text-muted group-hover:text-primary transition-colors duration-200">
            Open room
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </div>
      </motion.div>

      <RenameDialog
        open={renameOpen}
        title="Rename Data Room"
        currentName={dataRoom.name}
        onSave={(name) => {
          onRename(dataRoom.id, name);
          setRenameOpen(false);
        }}
        onCancel={() => setRenameOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Data Room"
        description={`Are you sure you want to delete "${dataRoom.name}"? All folders and files inside will be permanently deleted.`}
        onConfirm={() => {
          onDelete(dataRoom.id);
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
