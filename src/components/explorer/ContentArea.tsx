import { FolderOpen } from 'lucide-react';
import type { Folder, FileEntry } from '@/types';
import FolderCard from './FolderCard';
import FileCard from './FileCard';
import EmptyState from '@/components/shared/EmptyState';

interface ContentAreaProps {
  folders: Folder[];
  files: FileEntry[];
  currentFolderId: string | null;
  onOpenFolder: (folderId: string) => void;
  onRenameFolder: (id: string, name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  onViewFile: (file: FileEntry) => void;
  onRenameFile: (id: string, name: string) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
  getDescendantCounts: (id: string) => Promise<{ folders: number; files: number }>;
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
  const childFolders = folders
    .filter((f) => f.parentId === currentFolderId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));

  if (childFolders.length === 0 && sortedFiles.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpen size={48} />}
        title="This folder is empty"
        description="Create a new folder or upload a PDF file to get started."
      />
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {childFolders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onOpen={onOpenFolder}
          onRename={onRenameFolder}
          onDelete={onDeleteFolder}
          getDescendantCounts={getDescendantCounts}
        />
      ))}
      {sortedFiles.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onView={onViewFile}
          onRename={onRenameFile}
          onDelete={onDeleteFile}
        />
      ))}
    </div>
  );
}
