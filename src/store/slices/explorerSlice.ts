import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { DataRoom, Folder, FileEntry } from '@/types';
import * as storage from '@/services/storage';
import { getUniqueFileName } from '@/lib/utils';
import type { RootState } from '../index';

interface ExplorerState {
  currentDataRoom: DataRoom | null;
  folders: Folder[];
  currentFolderId: string | null;
  currentFiles: FileEntry[];
  breadcrumb: Folder[];
  viewingFile: FileEntry | null;
  isLoading: boolean;
}

const initialState: ExplorerState = {
  currentDataRoom: null,
  folders: [],
  currentFolderId: null,
  currentFiles: [],
  breadcrumb: [],
  viewingFile: null,
  isLoading: false,
};

export const openDataRoom = createAsyncThunk('explorer/openDataRoom', async (id: string) => {
  const room = await storage.getDataRoom(id);
  if (!room) throw new Error('Data room not found');

  const allFolders = await storage.getAllFoldersInDataRoom(id);
  const files = await storage.getFilesByFolder(id, room.rootFolderId);
  const breadcrumb = await storage.getFolderPath(room.rootFolderId);

  return { room, folders: allFolders, files, breadcrumb };
});

export const navigateToFolder = createAsyncThunk(
  'explorer/navigateToFolder',
  async (folderId: string, { getState }) => {
    const state = getState() as RootState;
    const dataRoom = state.explorer.currentDataRoom;
    if (!dataRoom) throw new Error('No data room open');

    const files = await storage.getFilesByFolder(dataRoom.id, folderId);
    const breadcrumb = await storage.getFolderPath(folderId);

    return { folderId, files, breadcrumb };
  }
);

export const createFolder = createAsyncThunk(
  'explorer/createFolder',
  async (name: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const { currentDataRoom, currentFolderId, folders } = state.explorer;
    if (!currentDataRoom || !currentFolderId) return rejectWithValue('No folder context');

    const siblings = folders.filter((f) => f.parentId === currentFolderId);
    if (siblings.some((f) => f.name === name)) {
      return rejectWithValue('A folder with this name already exists');
    }

    return storage.createFolder(currentDataRoom.id, currentFolderId, name);
  }
);

export const renameFolder = createAsyncThunk(
  'explorer/renameFolder',
  async ({ id, name }: { id: string; name: string }) => {
    return storage.updateFolder(id, name);
  }
);

export const deleteFolder = createAsyncThunk(
  'explorer/deleteFolder',
  async (id: string, { getState }) => {
    await storage.deleteFolder(id);
    const state = getState() as RootState;
    const { currentDataRoom, currentFolderId } = state.explorer;

    const allFolders = currentDataRoom
      ? await storage.getAllFoldersInDataRoom(currentDataRoom.id)
      : [];
    const files =
      currentDataRoom && currentFolderId
        ? await storage.getFilesByFolder(currentDataRoom.id, currentFolderId)
        : [];

    return { deletedId: id, allFolders, files };
  }
);

export const uploadFiles = createAsyncThunk(
  'explorer/uploadFiles',
  async (fileList: File[], { getState }) => {
    const state = getState() as RootState;
    const { currentDataRoom, currentFolderId, currentFiles } = state.explorer;
    if (!currentDataRoom || !currentFolderId) throw new Error('No folder context');

    const entries: FileEntry[] = [];
    const existingNames = [...currentFiles.map((f) => `${f.name}.${f.extension}`)];

    for (const file of fileList) {
      const ext = file.name.split('.').pop() ?? '';
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const uniqueName = getUniqueFileName(baseName, ext, [
        ...existingNames,
        ...entries.map((e) => `${e.name}.${e.extension}`),
      ]);

      const entry = await storage.uploadFile(
        currentDataRoom.id,
        currentFolderId,
        file,
        uniqueName
      );
      entries.push(entry);
    }

    return entries;
  }
);

export const renameFile = createAsyncThunk(
  'explorer/renameFile',
  async ({ id, name }: { id: string; name: string }) => {
    return storage.updateFile(id, name);
  }
);

export const deleteFile = createAsyncThunk('explorer/deleteFile', async (id: string) => {
  await storage.deleteFile(id);
  return id;
});

export const moveFile = createAsyncThunk(
  'explorer/moveFile',
  async ({ fileId, targetFolderId }: { fileId: string; targetFolderId: string }, { getState }) => {
    const updated = await storage.moveFile(fileId, targetFolderId);
    const state = getState() as RootState;
    const { currentFolderId } = state.explorer;
    // If file moved out of current folder, remove from view
    return { updated, removedFromView: targetFolderId !== currentFolderId };
  }
);

export const moveFolder = createAsyncThunk(
  'explorer/moveFolder',
  async (
    { folderId, targetParentId }: { folderId: string; targetParentId: string },
    { getState }
  ) => {
    const updated = await storage.moveFolder(folderId, targetParentId);
    const state = getState() as RootState;
    const { currentDataRoom } = state.explorer;
    const allFolders = currentDataRoom
      ? await storage.getAllFoldersInDataRoom(currentDataRoom.id)
      : [];
    return { updated, allFolders };
  }
);

const explorerSlice = createSlice({
  name: 'explorer',
  initialState,
  reducers: {
    setViewingFile(state, action: PayloadAction<FileEntry | null>) {
      state.viewingFile = action.payload;
    },
    clearExplorer(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // openDataRoom
      .addCase(openDataRoom.pending, (state) => {
        state.isLoading = true;
        state.viewingFile = null; // FIX: clear viewer when switching rooms
      })
      .addCase(openDataRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDataRoom = action.payload.room;
        state.folders = action.payload.folders;
        state.currentFolderId = action.payload.room.rootFolderId;
        state.currentFiles = action.payload.files;
        state.breadcrumb = action.payload.breadcrumb;
      })
      .addCase(openDataRoom.rejected, (state) => {
        state.isLoading = false;
      })
      // navigateToFolder
      .addCase(navigateToFolder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(navigateToFolder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFolderId = action.payload.folderId;
        state.currentFiles = action.payload.files;
        state.breadcrumb = action.payload.breadcrumb;
      })
      .addCase(navigateToFolder.rejected, (state) => {
        state.isLoading = false;
      })
      // createFolder
      .addCase(createFolder.fulfilled, (state, action) => {
        state.folders.push(action.payload);
      })
      // renameFolder
      .addCase(renameFolder.fulfilled, (state, action) => {
        const idx = state.folders.findIndex((f) => f.id === action.payload.id);
        if (idx !== -1) state.folders[idx] = action.payload;
        state.breadcrumb = state.breadcrumb.map((f) =>
          f.id === action.payload.id ? action.payload : f
        );
      })
      // deleteFolder
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = action.payload.allFolders;
        state.currentFiles = action.payload.files;
      })
      // uploadFiles
      .addCase(uploadFiles.fulfilled, (state, action) => {
        state.currentFiles.push(...action.payload);
      })
      // renameFile
      .addCase(renameFile.fulfilled, (state, action) => {
        const idx = state.currentFiles.findIndex((f) => f.id === action.payload.id);
        if (idx !== -1) state.currentFiles[idx] = action.payload;
        if (state.viewingFile?.id === action.payload.id) {
          state.viewingFile = action.payload;
        }
      })
      // deleteFile
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.currentFiles = state.currentFiles.filter((f) => f.id !== action.payload);
        if (state.viewingFile?.id === action.payload) {
          state.viewingFile = null;
        }
      })
      // moveFile
      .addCase(moveFile.fulfilled, (state, action) => {
        if (action.payload.removedFromView) {
          state.currentFiles = state.currentFiles.filter(
            (f) => f.id !== action.payload.updated.id
          );
        }
      })
      // moveFolder
      .addCase(moveFolder.fulfilled, (state, action) => {
        state.folders = action.payload.allFolders;
      });
  },
});

export const { setViewingFile, clearExplorer } = explorerSlice.actions;
export default explorerSlice.reducer;
