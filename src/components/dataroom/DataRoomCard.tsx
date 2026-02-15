import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { DataRoom } from '@/types';
import { formatDate } from '@/lib/utils';
import RenameDialog from '@/components/shared/RenameDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface DataRoomCardProps {
  dataRoom: DataRoom;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function DataRoomCard({ dataRoom, onRename, onDelete }: DataRoomCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => navigate(`/dataroom/${dataRoom.id}`)}
        className="group relative cursor-pointer rounded-lg border bg-background p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="rounded-md p-1.5 text-muted hover:bg-accent hover:text-foreground transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border bg-background shadow-lg">
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
      </div>

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
