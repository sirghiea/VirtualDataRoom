import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Breadcrumb from '@/components/explorer/Breadcrumb';
import Toolbar from '@/components/explorer/Toolbar';
import ContentArea from '@/components/explorer/ContentArea';
import FolderTree from '@/components/explorer/FolderTree';
import FileViewerModal from '@/components/file-viewer/FileViewerModal';
import RenameDialog from '@/components/shared/RenameDialog';

export default function DataRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    state,
    openDataRoom,
    navigateToFolder,
    createFolder,
    renameFolder,
    removeFolder,
    uploadFile,
    renameFile,
    removeFile,
    viewFile,
    getFileBlob,
    getDescendantCounts,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newFolderOpen, setNewFolderOpen] = useState(false);

  useEffect(() => {
    if (id) {
      openDataRoom(id).catch(() => navigate('/'));
    }
  }, [id, openDataRoom, navigate]);

  const handleNewFolder = () => {
    setNewFolderOpen(true);
  };

  const handleCreateFolder = async (name: string) => {
    setNewFolderOpen(false);
    await createFolder(name);
  };

  const handleUpload = async (file: File) => {
    await uploadFile(file);
  };

  if (state.isLoading && !state.currentDataRoom) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!state.currentDataRoom) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-muted">Data room not found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-surface overflow-y-auto">
          <div className="flex items-center justify-between border-b px-3 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Folders
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded p-1 text-muted hover:bg-accent hover:text-foreground transition-colors"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
          <div className="p-2">
            <FolderTree
              folders={state.folders}
              currentFolderId={state.currentFolderId}
              rootFolderId={state.currentDataRoom.rootFolderId}
              onNavigate={navigateToFolder}
            />
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden md:block rounded p-1 text-muted hover:bg-accent hover:text-foreground transition-colors"
              >
                <PanelLeft size={16} />
              </button>
            )}
            <Breadcrumb items={state.breadcrumb} onNavigate={navigateToFolder} />
          </div>
          <Toolbar onNewFolder={handleNewFolder} onUploadFile={handleUpload} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <ContentArea
            folders={state.folders}
            files={state.currentFiles}
            currentFolderId={state.currentFolderId}
            onOpenFolder={navigateToFolder}
            onRenameFolder={renameFolder}
            onDeleteFolder={removeFolder}
            onViewFile={viewFile}
            onRenameFile={renameFile}
            onDeleteFile={removeFile}
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
      {state.viewingFile && (
        <FileViewerModal
          file={state.viewingFile}
          getBlob={getFileBlob}
          onClose={() => viewFile(null)}
        />
      )}
    </div>
  );
}
