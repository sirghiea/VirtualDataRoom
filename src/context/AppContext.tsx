import { createContext, useContext, useReducer, type ReactNode, useCallback } from 'react';
import type { DataRoom, Folder, FileEntry } from '@/types';
import * as storage from '@/services/storage';
import { getUniqueFileName } from '@/lib/utils';

interface AppState {
  dataRooms: DataRoom[];
  currentDataRoom: DataRoom | null;
  folders: Folder[];
  currentFolderId: string | null;
  currentFiles: FileEntry[];
  breadcrumb: Folder[];
  isLoading: boolean;
  error: string | null;
  viewingFile: FileEntry | null;
}

type Action =
  | { type: 'SET_DATAROOMS'; payload: DataRoom[] }
  | { type: 'ADD_DATAROOM'; payload: DataRoom }
  | { type: 'UPDATE_DATAROOM'; payload: DataRoom }
  | { type: 'DELETE_DATAROOM'; payload: string }
  | { type: 'SET_CURRENT_DATAROOM'; payload: DataRoom | null }
  | { type: 'SET_FOLDERS'; payload: Folder[] }
  | { type: 'ADD_FOLDER'; payload: Folder }
  | { type: 'UPDATE_FOLDER'; payload: Folder }
  | { type: 'DELETE_FOLDER'; payload: string }
  | { type: 'SET_CURRENT_FOLDER'; payload: string | null }
  | { type: 'SET_FILES'; payload: FileEntry[] }
  | { type: 'ADD_FILE'; payload: FileEntry }
  | { type: 'UPDATE_FILE'; payload: FileEntry }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'SET_BREADCRUMB'; payload: Folder[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VIEWING_FILE'; payload: FileEntry | null };

const initialState: AppState = {
  dataRooms: [],
  currentDataRoom: null,
  folders: [],
  currentFolderId: null,
  currentFiles: [],
  breadcrumb: [],
  isLoading: false,
  error: null,
  viewingFile: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_DATAROOMS':
      return { ...state, dataRooms: action.payload };
    case 'ADD_DATAROOM':
      return { ...state, dataRooms: [...state.dataRooms, action.payload] };
    case 'UPDATE_DATAROOM':
      return {
        ...state,
        dataRooms: state.dataRooms.map((dr) =>
          dr.id === action.payload.id ? action.payload : dr
        ),
        currentDataRoom:
          state.currentDataRoom?.id === action.payload.id
            ? action.payload
            : state.currentDataRoom,
      };
    case 'DELETE_DATAROOM':
      return {
        ...state,
        dataRooms: state.dataRooms.filter((dr) => dr.id !== action.payload),
      };
    case 'SET_CURRENT_DATAROOM':
      return { ...state, currentDataRoom: action.payload };
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload };
    case 'ADD_FOLDER':
      return { ...state, folders: [...state.folders, action.payload] };
    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map((f) =>
          f.id === action.payload.id ? action.payload : f
        ),
        breadcrumb: state.breadcrumb.map((f) =>
          f.id === action.payload.id ? action.payload : f
        ),
      };
    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter((f) => f.id !== action.payload),
      };
    case 'SET_CURRENT_FOLDER':
      return { ...state, currentFolderId: action.payload };
    case 'SET_FILES':
      return { ...state, currentFiles: action.payload };
    case 'ADD_FILE':
      return { ...state, currentFiles: [...state.currentFiles, action.payload] };
    case 'UPDATE_FILE':
      return {
        ...state,
        currentFiles: state.currentFiles.map((f) =>
          f.id === action.payload.id ? action.payload : f
        ),
        viewingFile:
          state.viewingFile?.id === action.payload.id ? action.payload : state.viewingFile,
      };
    case 'DELETE_FILE':
      return {
        ...state,
        currentFiles: state.currentFiles.filter((f) => f.id !== action.payload),
        viewingFile: state.viewingFile?.id === action.payload ? null : state.viewingFile,
      };
    case 'SET_BREADCRUMB':
      return { ...state, breadcrumb: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_VIEWING_FILE':
      return { ...state, viewingFile: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  loadDataRooms: () => Promise<void>;
  createDataRoom: (name: string) => Promise<DataRoom>;
  renameDataRoom: (id: string, name: string) => Promise<void>;
  removeDataRoom: (id: string) => Promise<void>;
  openDataRoom: (id: string) => Promise<void>;
  navigateToFolder: (folderId: string) => Promise<void>;
  createFolder: (name: string) => Promise<Folder | null>;
  renameFolder: (id: string, name: string) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  uploadFile: (file: File) => Promise<FileEntry | null>;
  renameFile: (id: string, name: string) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  viewFile: (file: FileEntry | null) => void;
  getFileBlob: (blobKey: string) => Promise<ArrayBuffer | undefined>;
  getDescendantCounts: (folderId: string) => Promise<{ folders: number; files: number }>;
  clearError: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadDataRooms = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const rooms = await storage.getAllDataRooms();
      dispatch({ type: 'SET_DATAROOMS', payload: rooms });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: (e as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createDataRoomAction = useCallback(async (name: string) => {
    const room = await storage.createDataRoom(name);
    dispatch({ type: 'ADD_DATAROOM', payload: room });
    return room;
  }, []);

  const renameDataRoom = useCallback(async (id: string, name: string) => {
    const updated = await storage.updateDataRoom(id, name);
    dispatch({ type: 'UPDATE_DATAROOM', payload: updated });
  }, []);

  const removeDataRoom = useCallback(async (id: string) => {
    await storage.deleteDataRoom(id);
    dispatch({ type: 'DELETE_DATAROOM', payload: id });
  }, []);

  const openDataRoom = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const room = await storage.getDataRoom(id);
      if (!room) throw new Error('Data room not found');

      const allFolders = await storage.getAllFoldersInDataRoom(id);
      const files = await storage.getFilesByFolder(id, room.rootFolderId);
      const breadcrumb = await storage.getFolderPath(room.rootFolderId);

      dispatch({ type: 'SET_CURRENT_DATAROOM', payload: room });
      dispatch({ type: 'SET_FOLDERS', payload: allFolders });
      dispatch({ type: 'SET_CURRENT_FOLDER', payload: room.rootFolderId });
      dispatch({ type: 'SET_FILES', payload: files });
      dispatch({ type: 'SET_BREADCRUMB', payload: breadcrumb });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: (e as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const navigateToFolder = useCallback(
    async (folderId: string) => {
      if (!state.currentDataRoom) return;
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const files = await storage.getFilesByFolder(state.currentDataRoom.id, folderId);
        const breadcrumb = await storage.getFolderPath(folderId);

        dispatch({ type: 'SET_CURRENT_FOLDER', payload: folderId });
        dispatch({ type: 'SET_FILES', payload: files });
        dispatch({ type: 'SET_BREADCRUMB', payload: breadcrumb });
      } catch (e) {
        dispatch({ type: 'SET_ERROR', payload: (e as Error).message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.currentDataRoom]
  );

  const createFolderAction = useCallback(
    async (name: string) => {
      if (!state.currentDataRoom || !state.currentFolderId) return null;

      const siblings = state.folders.filter(
        (f) => f.parentId === state.currentFolderId
      );
      if (siblings.some((f) => f.name === name)) {
        dispatch({ type: 'SET_ERROR', payload: 'A folder with this name already exists' });
        return null;
      }

      const folder = await storage.createFolder(
        state.currentDataRoom.id,
        state.currentFolderId,
        name
      );
      dispatch({ type: 'ADD_FOLDER', payload: folder });
      return folder;
    },
    [state.currentDataRoom, state.currentFolderId, state.folders]
  );

  const renameFolder = useCallback(async (id: string, name: string) => {
    const updated = await storage.updateFolder(id, name);
    dispatch({ type: 'UPDATE_FOLDER', payload: updated });
  }, []);

  const removeFolder = useCallback(async (id: string) => {
    await storage.deleteFolder(id);
    dispatch({ type: 'DELETE_FOLDER', payload: id });
    // Also remove child files from current view
    const allFolders = state.currentDataRoom
      ? await storage.getAllFoldersInDataRoom(state.currentDataRoom.id)
      : [];
    dispatch({ type: 'SET_FOLDERS', payload: allFolders });
    if (state.currentDataRoom && state.currentFolderId) {
      const files = await storage.getFilesByFolder(
        state.currentDataRoom.id,
        state.currentFolderId
      );
      dispatch({ type: 'SET_FILES', payload: files });
    }
  }, [state.currentDataRoom, state.currentFolderId]);

  const uploadFileAction = useCallback(
    async (file: File) => {
      if (!state.currentDataRoom || !state.currentFolderId) return null;

      const ext = file.name.split('.').pop() ?? '';
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const existingNames = state.currentFiles.map(
        (f) => `${f.name}.${f.extension}`
      );
      const uniqueName = getUniqueFileName(baseName, ext, existingNames);

      const entry = await storage.uploadFile(
        state.currentDataRoom.id,
        state.currentFolderId,
        file,
        uniqueName
      );
      dispatch({ type: 'ADD_FILE', payload: entry });
      return entry;
    },
    [state.currentDataRoom, state.currentFolderId, state.currentFiles]
  );

  const renameFile = useCallback(async (id: string, name: string) => {
    const updated = await storage.updateFile(id, name);
    dispatch({ type: 'UPDATE_FILE', payload: updated });
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await storage.deleteFile(id);
    dispatch({ type: 'DELETE_FILE', payload: id });
  }, []);

  const viewFile = useCallback((file: FileEntry | null) => {
    dispatch({ type: 'SET_VIEWING_FILE', payload: file });
  }, []);

  const getFileBlobAction = useCallback(async (blobKey: string) => {
    return storage.getFileBlob(blobKey);
  }, []);

  const getDescendantCountsAction = useCallback(async (folderId: string) => {
    return storage.getDescendantCounts(folderId);
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value: AppContextValue = {
    state,
    loadDataRooms,
    createDataRoom: createDataRoomAction,
    renameDataRoom,
    removeDataRoom,
    openDataRoom,
    navigateToFolder,
    createFolder: createFolderAction,
    renameFolder,
    removeFolder,
    uploadFile: uploadFileAction,
    renameFile,
    removeFile,
    viewFile,
    getFileBlob: getFileBlobAction,
    getDescendantCounts: getDescendantCountsAction,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
