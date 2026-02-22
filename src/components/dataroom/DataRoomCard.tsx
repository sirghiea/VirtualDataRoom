import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, MoreVertical, Pencil, Trash2, ArrowRight, Clock, Layers } from 'lucide-react';
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={() => navigate(`/dataroom/${dataRoom.id}`)}
        className="card-premium gradient-border inner-glow-purple group relative cursor-pointer rounded-2xl p-6 overflow-hidden"
      >
        {/* Dot pattern background */}
        <div className="absolute inset-0 dot-pattern opacity-40" />

        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-blue-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Top highlight line */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Icon with layered glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all duration-400 group-hover:shadow-lg group-hover:shadow-primary/20">
                <Database size={24} className="text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0 pt-0.5">
              <h3
                className="font-semibold text-[15px] text-foreground line-clamp-1 group-hover:text-white transition-colors duration-200"
                title={dataRoom.name}
              >
                {dataRoom.name}
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-muted/60" />
                  <span className="text-[11px] text-muted/80">
                    {formatDate(dataRoom.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers size={11} className="text-muted/60" />
                  <span className="text-[11px] text-muted/80">
                    Secure
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/[0.08]"
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
        <div className="relative flex items-center justify-between mt-5 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
            <span className="text-[10px] text-muted/60 font-medium uppercase tracking-wider">Active</span>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] text-muted group-hover:text-primary transition-colors duration-300">
            Open room
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
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
