import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.05 }}
        onClick={() => navigate(`/dataroom/${dataRoom.id}`)}
        className="glass group relative cursor-pointer rounded-xl p-5 transition-all hover:bg-glass-hover hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1" title={dataRoom.name}>
                {dataRoom.name}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Created {formatDate(dataRoom.createdAt)}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted"
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
