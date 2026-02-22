import { useMemo } from 'react';
import { FolderOpen } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import type { Folder, FileEntry } from '@/types';
import FolderCard from './FolderCard';
import FileCard from './FileCard';
import EmptyState from '@/components/shared/EmptyState';
import { useAppSelector } from '@/store/hooks';
import type { SortBy, SortDirection } from '@/store/slices/uiSlice';

interface ContentAreaProps {
  folders: Folder[];
  files: FileEntry[];
  currentFolderId: string | null;
  onOpenFolder: (folderId: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onViewFile: (file: FileEntry) => void;
  onRenameFile: (id: string, name: string) => void;
  onDeleteFile: (id: string) => void;
  getDescendantCounts: (id: string) => Promise<{ folders: number; files: number }>;
}

function sortFolders(folders: Folder[], sortBy: SortBy, direction: SortDirection): Folder[] {
  const sorted = [...folders];
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'date':
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        cmp = a.name.localeCompare(b.name);
    }
    return direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

function sortFiles(files: FileEntry[], sortBy: SortBy, direction: SortDirection): FileEntry[] {
  const sorted = [...files];
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'date':
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'size':
        cmp = a.size - b.size;
        break;
      case 'type':
        cmp = a.extension.localeCompare(b.extension);
        break;
    }
    return direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

export default function ContentArea({
  folders,
  files,
  currentFolderId,
  onOpenFolder,
  onRenameFolder,
  onDeleteFolder,
  onViewFile,
  onRenameFile,
  onDeleteFile,
  getDescendantCounts,
}: ContentAreaProps) {
  const { viewMode, sortBy, sortDirection, searchQuery } = useAppSelector((s) => s.ui);

  const childFolders = useMemo(() => {
    let filtered = folders.filter((f) => f.parentId === currentFolderId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((f) => f.name.toLowerCase().includes(q));
    }
    return sortFolders(filtered, sortBy, sortDirection);
  }, [folders, currentFolderId, sortBy, sortDirection, searchQuery]);

  const sortedFiles = useMemo(() => {
    let filtered = [...files];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((f) =>
        `${f.name}.${f.extension}`.toLowerCase().includes(q)
      );
    }
    return sortFiles(filtered, sortBy, sortDirection);
  }, [files, sortBy, sortDirection, searchQuery]);

  if (childFolders.length === 0 && sortedFiles.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpen size={48} />}
        title={searchQuery ? 'No results found' : 'This folder is empty'}
        description={
          searchQuery
            ? 'Try a different search term.'
            : 'Create a new folder or upload PDF files to get started.'
        }
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-0.5">
        {/* List header */}
        <div className="flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-muted uppercase tracking-wider border-b border-white/5 mb-1">
          <span className="w-4" />
          <span className="flex-1">Name</span>
          <span className="w-20">Type</span>
          <span className="w-24 text-right">Size</span>
          <span className="w-28">Created</span>
          <span className="w-7" />
        </div>
        <AnimatePresence mode="popLayout">
          {childFolders.map((folder, i) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onOpen={onOpenFolder}
              onRename={onRenameFolder}
              onDelete={onDeleteFolder}
              getDescendantCounts={getDescendantCounts}
              viewMode="list"
              index={i}
            />
          ))}
          {sortedFiles.map((file, i) => (
            <FileCard
              key={file.id}
              file={file}
              onView={onViewFile}
              onRename={onRenameFile}
              onDelete={onDeleteFile}
              viewMode="list"
              index={childFolders.length + i}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {childFolders.map((folder, i) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            onOpen={onOpenFolder}
            onRename={onRenameFolder}
            onDelete={onDeleteFolder}
            getDescendantCounts={getDescendantCounts}
            viewMode="grid"
            index={i}
          />
        ))}
        {sortedFiles.map((file, i) => (
          <FileCard
            key={file.id}
            file={file}
            onView={onViewFile}
            onRename={onRenameFile}
            onDelete={onDeleteFile}
            viewMode="grid"
            index={childFolders.length + i}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
