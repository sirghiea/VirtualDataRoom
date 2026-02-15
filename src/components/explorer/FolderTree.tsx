import { useState } from 'react';
import { ChevronRight, Folder as FolderIcon } from 'lucide-react';
import type { Folder } from '@/types';
import { cn } from '@/lib/utils';

interface FolderTreeProps {
  folders: Folder[];
  currentFolderId: string | null;
  rootFolderId: string;
  onNavigate: (folderId: string) => void;
}

export default function FolderTree({
  folders,
  currentFolderId,
  rootFolderId,
  onNavigate,
}: FolderTreeProps) {
  return (
    <div className="text-sm">
      <TreeNode
        folder={folders.find((f) => f.id === rootFolderId)!}
        folders={folders}
        currentFolderId={currentFolderId}
        onNavigate={onNavigate}
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
  depth: number;
  defaultExpanded?: boolean;
}

function TreeNode({
  folder,
  folders,
  currentFolderId,
  onNavigate,
  depth,
  defaultExpanded = false,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const children = folders.filter((f) => f.parentId === folder.id);
  const hasChildren = children.length > 0;
  const isActive = folder.id === currentFolderId;

  return (
    <div>
      <button
        onClick={() => {
          onNavigate(folder.id);
          if (hasChildren) setExpanded(true);
        }}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left transition-colors',
          isActive ? 'bg-primary/15 text-primary font-medium' : 'text-foreground/80 hover:bg-white/5 hover:text-foreground'
        )}
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
          {folder.parentId === null ? 'Root' : folder.name}
        </span>
      </button>

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
              depth={depth + 1}
            />
          ))}
    </div>
  );
}
