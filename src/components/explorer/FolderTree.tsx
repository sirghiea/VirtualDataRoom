import { useState } from 'react';
import { ChevronRight, Folder as FolderIcon, MoreVertical, Pencil, Trash2, Home } from 'lucide-react';
import type { Folder } from '@/types';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import RenameDialog from '@/components/shared/RenameDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface FolderTreeProps {
  folders: Folder[];
  currentFolderId: string | null;
  rootFolderId: string;
  onNavigate: (folderId: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  getDescendantCounts: (id: string) => Promise<{ folders: number; files: number }>;
  onDropFile?: (fileId: string, targetFolderId: string) => void;
}

export default function FolderTree({
  folders,
  currentFolderId,
  rootFolderId,
  onNavigate,
  onRename,
  onDelete,
  getDescendantCounts,
  onDropFile,
}: FolderTreeProps) {
  const rootFolder = folders.find((f) => f.id === rootFolderId);
  if (!rootFolder) return null;

  return (
    <div className="text-sm">
      <TreeNode
        folder={rootFolder}
        folders={folders}
        currentFolderId={currentFolderId}
        onNavigate={onNavigate}
        onRename={onRename}
        onDelete={onDelete}
        getDescendantCounts={getDescendantCounts}
        onDropFile={onDropFile}
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
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  getDescendantCounts: (id: string) => Promise<{ folders: number; files: number }>;
  onDropFile?: (fileId: string, targetFolderId: string) => void;
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
  onDropFile,
  depth,
  defaultExpanded = false,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteDesc, setDeleteDesc] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const children = folders.filter((f) => f.parentId === folder.id);
  const siblings = folders.filter((f) => f.parentId === folder.parentId);
  const siblingNames = siblings.map((f) => f.name);
  const hasChildren = children.length > 0;
  const isActive = folder.id === currentFolderId;
  const isRoot = folder.parentId === null;

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const fileId = e.dataTransfer.getData('text/file-id');
    if (fileId && onDropFile) {
      onDropFile(fileId, folder.id);
    }
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'group flex w-full items-center rounded-lg transition-all duration-150',
          isActive
            ? 'bg-primary/10 text-primary font-medium ring-1 ring-primary/15'
            : 'text-foreground/80 hover:bg-white/[0.04] hover:text-foreground',
          dragOver && 'bg-primary/15 ring-1 ring-primary/30'
        )}
      >
        <button
          onClick={() => {
            onNavigate(folder.id);
            if (hasChildren) setExpanded(true);
          }}
          className="flex flex-1 min-w-0 items-center gap-1.5 py-1.5 text-left text-[13px]"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <span
            className={cn(
              'shrink-0 transition-transform duration-150',
              hasChildren && expanded && 'rotate-90'
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) setExpanded((v) => !v);
            }}
          >
            {hasChildren ? (
              <ChevronRight size={13} className="text-muted/60" />
            ) : (
              <span className="inline-block w-[13px]" />
            )}
          </span>
          {isRoot ? (
            <Home size={14} className="shrink-0 text-primary/70" />
          ) : (
            <FolderIcon size={14} className="shrink-0 text-amber-400/80" />
          )}
          <span className="truncate">{isRoot ? 'Root' : folder.name}</span>
        </button>

        {!isRoot && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 mr-1.5 rounded-md p-0.5 text-muted opacity-0 group-hover:opacity-100 hover:bg-white/[0.08] hover:text-foreground transition-all duration-150"
              >
                <MoreVertical size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
              onDropFile={onDropFile}
              depth={depth + 1}
            />
          ))}

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
    </div>
  );
}
