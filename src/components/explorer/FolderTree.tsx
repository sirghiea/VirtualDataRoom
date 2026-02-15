import { useState } from 'react';
import { ChevronRight, Folder as FolderIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Folder } from '@/types';
import { cn } from '@/lib/utils';
import RenameDialog from '@/components/shared/RenameDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface FolderTreeProps {
  folders: Folder[];
  currentFolderId: string | null;
  rootFolderId: string;
  onNavigate: (folderId: string) => void;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  getDescendantCounts: (id: string) => Promise<{ folders: number; files: number }>;
}

export default function FolderTree({
  folders,
  currentFolderId,
  rootFolderId,
  onNavigate,
  onRename,
  onDelete,
  getDescendantCounts,
}: FolderTreeProps) {
  return (
    <div className="text-sm">
      <TreeNode
        folder={folders.find((f) => f.id === rootFolderId)!}
        folders={folders}
        currentFolderId={currentFolderId}
        onNavigate={onNavigate}
        onRename={onRename}
        onDelete={onDelete}
        getDescendantCounts={getDescendantCounts}
        depth={0}
        defaultExpanded
      />
    </div>
  );
}

interface TreeNodeProps {
  folder: Folder;
  folders: Folder[];
  currentFolderId: string | null;
  onNavigate: (folderId: string) => void;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  getDescendantCounts: (id: string) => Promise<{ folders: number; files: number }>;
  depth: number;
  defaultExpanded?: boolean;
}

function TreeNode({
  folder,
  folders,
  currentFolderId,
  onNavigate,
  onRename,
  onDelete,
  getDescendantCounts,
  depth,
  defaultExpanded = false,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteDesc, setDeleteDesc] = useState('');

  const children = folders.filter((f) => f.parentId === folder.id);
  const hasChildren = children.length > 0;
  const isActive = folder.id === currentFolderId;
  const isRoot = folder.parentId === null;

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
    <div>
      <div
        className={cn(
          'group flex w-full items-center rounded-lg transition-colors',
          isActive ? 'bg-primary/15 text-primary font-medium' : 'text-foreground/80 hover:bg-white/5 hover:text-foreground'
        )}
      >
        <button
          onClick={() => {
            onNavigate(folder.id);
            if (hasChildren) setExpanded(true);
          }}
          className="flex flex-1 min-w-0 items-center gap-1.5 py-1.5 text-left"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <span
            className={cn('shrink-0 transition-transform', hasChildren && expanded && 'rotate-90')}
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) setExpanded((v) => !v);
            }}
          >
            {hasChildren ? (
              <ChevronRight size={14} />
            ) : (
              <span className="inline-block w-3.5" />
            )}
          </span>
          <FolderIcon size={14} className="shrink-0 text-amber-400/80" />
          <span className="truncate">
            {isRoot ? 'Root' : folder.name}
          </span>
        </button>

        {/* Three-dot menu — hidden for root folder */}
        {!isRoot && (
          <div className="relative shrink-0 pr-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="rounded-md p-0.5 text-muted opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:text-foreground transition-all"
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl shadow-xl overflow-hidden bg-[#1e1e2e] border border-white/10">
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
        )}
      </div>

      {expanded &&
        children
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((child) => (
            <TreeNode
              key={child.id}
              folder={child}
              folders={folders}
              currentFolderId={currentFolderId}
              onNavigate={onNavigate}
              onRename={onRename}
              onDelete={onDelete}
              getDescendantCounts={getDescendantCounts}
              depth={depth + 1}
            />
          ))}

      {/* Rename Dialog */}
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

      {/* Delete Confirm Dialog */}
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
    </div>
  );
}
