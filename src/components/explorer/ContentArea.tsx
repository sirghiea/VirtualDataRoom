import { useMemo, useState, useEffect } from 'react';
import { FolderOpen, Search } from 'lucide-react';
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
  selectedFolderIds: string[];
  selectedFileIds: string[];
  onToggleFolderSelect: (id: string) => void;
  onToggleFileSelect: (id: string) => void;
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
  selectedFolderIds,
  selectedFileIds,
  onToggleFolderSelect,
  onToggleFileSelect,
}: ContentAreaProps) {
  const { viewMode, sortBy, sortDirection, searchQuery } = useAppSelector((s) => s.ui);

  // Pre-compute folder descendant counts for display
  const [folderCounts, setFolderCounts] = useState<Record<string, { folders: number; files: number }>>({});

  const childFolderIds = useMemo(
    () => folders.filter((f) => f.parentId === currentFolderId).map((f) => f.id),
    [folders, currentFolderId]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results: Record<string, { folders: number; files: number }> = {};
      await Promise.all(
        childFolderIds.map(async (id) => {
          results[id] = await getDescendantCounts(id);
        })
      );
      if (!cancelled) setFolderCounts(results);
    }
    load();
    return () => { cancelled = true; };
  }, [childFolderIds, getDescendantCounts]);

  // All sibling folder names for validation (unfiltered by search)
  const siblingFolderNames = useMemo(() => {
    return folders
      .filter((f) => f.parentId === currentFolderId)
      .map((f) => f.name);
  }, [folders, currentFolderId]);

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
          searchQuery ? (
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10">
                <Search size={28} className="text-primary/50" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-primary/8 rounded-full blur-xl scale-150" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.08]">
                <FolderOpen size={28} className="text-muted/40" />
              </div>
            </div>
          )
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
        <div className="flex items-center gap-3 px-3 py-2 text-[10px] font-semibold text-muted/50 uppercase tracking-[0.15em] mb-1">
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
              siblingNames={siblingFolderNames}
              counts={folderCounts[folder.id]}
              viewMode="list"
              index={i}
              isSelected={selectedFolderIds.includes(folder.id)}
              onToggleSelect={onToggleFolderSelect}
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
              isSelected={selectedFileIds.includes(file.id)}
              onToggleSelect={onToggleFileSelect}
              index={childFolders.length + i}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {childFolders.map((folder, i) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            onOpen={onOpenFolder}
            onRename={onRenameFolder}
            onDelete={onDeleteFolder}
            getDescendantCounts={getDescendantCounts}
            siblingNames={siblingFolderNames}
            counts={folderCounts[folder.id]}
            viewMode="grid"
            index={i}
            isSelected={selectedFolderIds.includes(folder.id)}
            onToggleSelect={onToggleFolderSelect}
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
            isSelected={selectedFileIds.includes(file.id)}
            onToggleSelect={onToggleFileSelect}
            index={childFolders.length + i}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
