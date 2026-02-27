import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PanelLeftClose, PanelLeft, Upload, FolderUp, Database, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  openDataRoom,
  navigateToFolder,
  createFolder,
  renameFolder,
  deleteFolder,
  uploadFiles,
  renameFile,
  deleteFile,
  setViewingFile,
  moveFile,
  toggleFolderSelection,
  toggleFileSelection,
  selectAll,
  clearSelection,
  bulkDelete,
} from '@/store/slices/explorerSlice';
import { unlockRoom } from '@/store/slices/dataRoomsSlice';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { verifyPassword } from '@/lib/crypto';
import * as storage from '@/services/storage';
import Breadcrumb from '@/components/explorer/Breadcrumb';
import Toolbar from '@/components/explorer/Toolbar';
import ContentArea from '@/components/explorer/ContentArea';
import FolderTree from '@/components/explorer/FolderTree';
import BulkActionBar from '@/components/explorer/BulkActionBar';
import FileViewerModal from '@/components/file-viewer/FileViewerModal';
import RenameDialog from '@/components/shared/RenameDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import PasswordDialog from '@/components/dataroom/PasswordDialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DataRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentDataRoom, folders, currentFolderId, currentFiles, breadcrumb, viewingFile, isLoading, selectedFolderIds, selectedFileIds } =
    useAppSelector((s) => s.explorer);
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const unlockedRoomIds = useAppSelector((s) => s.dataRooms.unlockedRoomIds);

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [fileDragOver, setFileDragOver] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const totalSelected = selectedFolderIds.length + selectedFileIds.length;
  const hasSelection = totalSelected > 0;

  // Check if all visible items are selected
  const childFolderIds = useMemo(
    () => folders.filter((f) => f.parentId === currentFolderId).map((f) => f.id),
    [folders, currentFolderId]
  );
  const allSelected = useMemo(() => {
    const totalItems = childFolderIds.length + currentFiles.length;
    if (totalItems === 0) return false;
    const allFoldersSelected = childFolderIds.every((id) => selectedFolderIds.includes(id));
    const allFilesSelected = currentFiles.every((f) => selectedFileIds.includes(f.id));
    return allFoldersSelected && allFilesSelected;
  }, [childFolderIds, currentFiles, selectedFolderIds, selectedFileIds]);

  // Sibling folder names for validation
  const siblingFolderNames = useMemo(
    () => folders.filter((f) => f.parentId === currentFolderId).map((f) => f.name),
    [folders, currentFolderId]
  );

  // Is the room locked?
  const isRoomLocked =
    !!currentDataRoom?.passwordHash && !unlockedRoomIds.includes(currentDataRoom.id);

  useEffect(() => {
    if (id) {
      dispatch(openDataRoom(id)).unwrap().catch(() => navigate('/'));
    }
  }, [id, dispatch, navigate]);

  const handlePasswordUnlock = async (password: string) => {
    if (!currentDataRoom?.passwordHash) return;
    const valid = await verifyPassword(password, currentDataRoom.passwordHash);
    if (valid) {
      dispatch(unlockRoom(currentDataRoom.id));
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const handleNewFolder = () => setNewFolderOpen(true);

  const handleCreateFolder = async (name: string) => {
    setNewFolderOpen(false);
    const result = await dispatch(createFolder(name));
    if (createFolder.rejected.match(result)) {
      toast.error(result.payload as string);
    }
  };

  const handleUploadFiles = async (files: File[]) => {
    const result = await dispatch(uploadFiles(files));
    if (uploadFiles.fulfilled.match(result)) {
      toast.success(
        result.payload.length === 1
          ? `Uploaded "${result.payload[0].name}.${result.payload[0].extension}"`
          : `Uploaded ${result.payload.length} files`
      );
    } else {
      toast.error('Upload failed');
    }
  };

  const handleRenameFolder = (folderId: string, name: string) => {
    dispatch(renameFolder({ id: folderId, name }));
  };

  const handleDeleteFolder = (folderId: string) => {
    dispatch(deleteFolder(folderId));
    toast.success('Folder deleted');
  };

  const handleRenameFile = (fileId: string, name: string) => {
    dispatch(renameFile({ id: fileId, name }));
  };

  const handleDeleteFile = (fileId: string) => {
    dispatch(deleteFile(fileId));
    toast.success('File deleted');
  };

  const handleViewFile = (file: import('@/types').FileEntry) => {
    dispatch(setViewingFile(file));
  };

  const getFileBlob = useCallback(async (storagePath: string) => {
    return storage.getFileBlob(storagePath);
  }, []);

  const getDescendantCounts = useCallback(async (folderId: string) => {
    return storage.getDescendantCounts(folderId);
  }, []);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (allSelected) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAll());
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteOpen(false);
    const result = await dispatch(bulkDelete({ folderIds: selectedFolderIds, fileIds: selectedFileIds }));
    if (bulkDelete.fulfilled.match(result)) {
      toast.success(`Deleted ${totalSelected} item${totalSelected !== 1 ? 's' : ''}`);
    } else {
      toast.error('Bulk delete failed');
    }
  };

  // Escape key to clear selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && hasSelection) {
        dispatch(clearSelection());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSelection, dispatch]);

  const handleDropFileOnFolder = (fileId: string, targetFolderId: string) => {
    if (targetFolderId === currentFolderId) return;
    dispatch(moveFile({ fileId, targetFolderId }));
    toast.success('File moved');
  };

  // Drag and drop file upload from OS
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      setFileDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setFileDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFileDragOver(false);
    const fileList = Array.from(e.dataTransfer.files);
    if (fileList.length > 0) {
      const pdfs = fileList.filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
      );
      if (pdfs.length === 0) {
        toast.error('Only PDF files are supported');
        return;
      }
      if (pdfs.length < fileList.length) {
        toast.warning(`${fileList.length - pdfs.length} non-PDF file(s) skipped`);
      }
      handleUploadFiles(pdfs);
    }
  };

  // Loading state
  if (isLoading && !currentDataRoom) {
    return (
      <div className="flex h-[calc(100vh-3.75rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse" />
          </div>
          <span className="text-xs text-muted/80 font-medium tracking-wide">Loading data room...</span>
        </div>
      </div>
    );
  }

  // Not found
  if (!currentDataRoom) {
    return (
      <div className="flex h-[calc(100vh-3.75rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.08]">
            <FolderUp size={28} className="text-muted/60" />
          </div>
          <div>
            <p className="text-foreground font-medium">Data room not found</p>
            <p className="text-sm text-muted/70 mt-1">It may have been deleted or the link is invalid.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Password gate — blocks content until room is unlocked
  if (isRoomLocked) {
    return (
      <div className="flex h-[calc(100vh-3.75rem)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400/10 rounded-full blur-3xl scale-[2]" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/15 to-amber-400/5 ring-1 ring-amber-400/20">
              <Lock size={32} className="text-amber-400/80" />
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{currentDataRoom.name}</p>
            <p className="text-sm text-muted/70 mt-1">This data room is password protected</p>
          </div>
        </motion.div>

        <PasswordDialog
          open={true}
          mode="unlock"
          onSubmit={handlePasswordUnlock}
          onCancel={() => navigate('/')}
          error={passwordError}
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-3.75rem)] relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 272, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden md:flex shrink-0 flex-col border-r border-white/[0.04] bg-white/[0.01] overflow-hidden"
          >
            {/* Sidebar header with data room name */}
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/15">
                  <Database size={14} className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {currentDataRoom.name}
                </span>
              </div>
              <div className="divider-gradient" />
            </div>

            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted/60">
                Folders
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted/50 hover:text-foreground"
                onClick={() => dispatch(setSidebarOpen(false))}
              >
                <PanelLeftClose size={14} />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="px-2 pb-2">
                <FolderTree
                  folders={folders}
                  currentFolderId={currentFolderId}
                  rootFolderId={currentDataRoom.rootFolderId}
                  onNavigate={(fId) => dispatch(navigateToFolder(fId))}
                  onRename={handleRenameFolder}
                  onDelete={handleDeleteFolder}
                  getDescendantCounts={getDescendantCounts}
                  onDropFile={handleDropFileOnFolder}
                />
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-2.5 gap-4 bg-white/[0.01]">
          <div className="flex items-center gap-3 min-w-0">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-7 w-7 text-muted hover:text-foreground"
                onClick={() => dispatch(setSidebarOpen(true))}
              >
                <PanelLeft size={15} />
              </Button>
            )}
            <Breadcrumb
              items={breadcrumb}
              onNavigate={(fId) => dispatch(navigateToFolder(fId))}
            />
          </div>
          <Toolbar
            onNewFolder={handleNewFolder}
            onUploadFiles={handleUploadFiles}
            hasSelection={hasSelection}
            allSelected={allSelected}
            onToggleSelectAll={handleToggleSelectAll}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <ContentArea
            folders={folders}
            files={currentFiles}
            currentFolderId={currentFolderId}
            onOpenFolder={(fId) => dispatch(navigateToFolder(fId))}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onViewFile={handleViewFile}
            onRenameFile={handleRenameFile}
            onDeleteFile={handleDeleteFile}
            getDescendantCounts={getDescendantCounts}
            selectedFolderIds={selectedFolderIds}
            selectedFileIds={selectedFileIds}
            onToggleFolderSelect={(id) => dispatch(toggleFolderSelection(id))}
            onToggleFileSelect={(id) => dispatch(toggleFileSelection(id))}
          />
        </div>
      </main>

      {/* New Folder Dialog */}
      <RenameDialog
        open={newFolderOpen}
        title="New Folder"
        currentName=""
        existingNames={siblingFolderNames}
        entityLabel="Folder name"
        onSave={handleCreateFolder}
        onCancel={() => setNewFolderOpen(false)}
      />

      {/* File Viewer */}
      {viewingFile && (
        <FileViewerModal
          file={viewingFile}
          getBlob={getFileBlob}
          onClose={() => dispatch(setViewingFile(null))}
        />
      )}

      {/* Bulk action bar */}
      <AnimatePresence>
        {hasSelection && (
          <BulkActionBar
            selectedCount={totalSelected}
            onDelete={() => setBulkDeleteOpen(true)}
            onClearSelection={() => dispatch(clearSelection())}
          />
        )}
      </AnimatePresence>

      {/* Bulk delete confirmation */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete Selected Items"
        description={
          <>
            Are you sure you want to delete{' '}
            <strong>{totalSelected} item{totalSelected !== 1 ? 's' : ''}</strong>?
            {selectedFolderIds.length > 0 && ' Folders and all their contents will be permanently removed.'}
            {' '}This action cannot be undone.
          </>
        }
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />

      {/* File drop overlay */}
      <AnimatePresence>
        {fileDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="flex flex-col items-center gap-5"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl scale-150 animate-pulse" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/30 shadow-2xl shadow-primary/20">
                  <Upload size={40} className="text-primary" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">Drop PDF files to upload</p>
                <p className="text-sm text-muted/70 mt-1.5">Files will be added to the current folder</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
