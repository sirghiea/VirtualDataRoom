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
        icon={
          <div className="relative">
            <div className="absolute inset-0 bg-primary/8 rounded-full blur-xl scale-150" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.08]">
              <FolderOpen size={28} className="text-muted/50" />
            </div>
          </div>
        }
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
        <div className="flex items-center gap-3 px-3 py-2 text-[11px] font-semibold text-muted/60 uppercase tracking-widest mb-1">
          <span className="w-8" />
          <span className="flex-1">Name</span>
          <span className="w-20">Type</span>
          <span className="w-24 text-right">Size</span>
          <span className="w-28">Created</span>
          <span className="w-7" />
        </div>
        <div className="divider-gradient mb-2" />
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
