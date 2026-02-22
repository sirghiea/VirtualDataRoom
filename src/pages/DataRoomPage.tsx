import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PanelLeftClose, PanelLeft, Upload } from 'lucide-react';
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
} from '@/store/slices/explorerSlice';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import * as storage from '@/services/storage';
import Breadcrumb from '@/components/explorer/Breadcrumb';
import Toolbar from '@/components/explorer/Toolbar';
import ContentArea from '@/components/explorer/ContentArea';
import FolderTree from '@/components/explorer/FolderTree';
import FileViewerModal from '@/components/file-viewer/FileViewerModal';
import RenameDialog from '@/components/shared/RenameDialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DataRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentDataRoom, folders, currentFolderId, currentFiles, breadcrumb, viewingFile, isLoading } =
    useAppSelector((s) => s.explorer);
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [fileDragOver, setFileDragOver] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(openDataRoom(id)).unwrap().catch(() => navigate('/'));
    }
  }, [id, dispatch, navigate]);

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

  const getFileBlob = useCallback(async (blobKey: string) => {
    return storage.getFileBlob(blobKey);
  }, []);

  const getDescendantCounts = useCallback(async (folderId: string) => {
    return storage.getDescendantCounts(folderId);
  }, []);

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
      const pdfs = fileList.filter((f) => f.type === 'application/pdf');
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

  if (isLoading && !currentDataRoom) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentDataRoom) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-muted">Data room not found.</p>
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-3.5rem)] relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden md:flex shrink-0 flex-col border-r border-white/5 bg-white/[0.02] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-3 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Folders
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => dispatch(setSidebarOpen(false))}
              >
                <PanelLeftClose size={16} />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2">
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
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-7 w-7"
                onClick={() => dispatch(setSidebarOpen(true))}
              >
                <PanelLeft size={16} />
              </Button>
            )}
            <Breadcrumb
              items={breadcrumb}
              onNavigate={(fId) => dispatch(navigateToFolder(fId))}
            />
          </div>
          <Toolbar onNewFolder={handleNewFolder} onUploadFiles={handleUploadFiles} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
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
          />
        </div>
      </main>

      {/* New Folder Dialog */}
      <RenameDialog
        open={newFolderOpen}
        title="New Folder"
        currentName=""
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

      {/* File drop overlay */}
      <AnimatePresence>
        {fileDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none"
          >
            <div className="flex flex-col items-center gap-3 text-primary">
              <Upload size={48} />
              <p className="text-lg font-medium text-foreground">Drop PDF files to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
