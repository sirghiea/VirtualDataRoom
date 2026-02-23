import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { DataRoom } from '@/types';
import * as storage from '@/services/storage';

interface DataRoomsState {
  rooms: DataRoom[];
  status: 'idle' | 'loading' | 'error';
  /** Room IDs whose password has been verified this session (memory-only). */
  unlockedRoomIds: string[];
  /** File/folder counts per room, keyed by room ID. */
  roomStats: Record<string, { folders: number; files: number }>;
}

const initialState: DataRoomsState = {
  rooms: [],
  status: 'idle',
  unlockedRoomIds: [],
  roomStats: {},
};

export const fetchDataRooms = createAsyncThunk('dataRooms/fetchAll', async () => {
  return storage.getAllDataRooms();
});

export const fetchRoomStats = createAsyncThunk(
  'dataRooms/fetchStats',
  async (rooms: DataRoom[]) => {
    return storage.getRoomStats(rooms);
  }
);

export const createDataRoom = createAsyncThunk(
  'dataRooms/create',
  async (name: string, { rejectWithValue }) => {
    const existing = await storage.getDataRoomByName(name);
    if (existing) {
      return rejectWithValue('A data room with this name already exists');
    }
    return storage.createDataRoom(name);
  }
);

export const renameDataRoom = createAsyncThunk(
  'dataRooms/rename',
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    const existing = await storage.getDataRoomByName(name);
    if (existing && existing.id !== id) {
      return rejectWithValue('A data room with this name already exists');
    }
    return storage.updateDataRoom(id, name);
  }
);

export const deleteDataRoom = createAsyncThunk('dataRooms/delete', async (id: string) => {
  await storage.deleteDataRoom(id);
  return id;
});

export const setRoomPassword = createAsyncThunk(
  'dataRooms/setPassword',
  async ({ id, passwordHash }: { id: string; passwordHash: string | null }) => {
    return storage.setDataRoomPassword(id, passwordHash);
  }
);

const dataRoomsSlice = createSlice({
  name: 'dataRooms',
  initialState,
  reducers: {
    unlockRoom(state, action: PayloadAction<string>) {
      if (!state.unlockedRoomIds.includes(action.payload)) {
        state.unlockedRoomIds.push(action.payload);
      }
    },
    lockRoom(state, action: PayloadAction<string>) {
      state.unlockedRoomIds = state.unlockedRoomIds.filter((id) => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataRooms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDataRooms.fulfilled, (state, action) => {
        state.status = 'idle';
        state.rooms = action.payload;
      })
      .addCase(fetchDataRooms.rejected, (state) => {
        state.status = 'error';
      })
      .addCase(fetchRoomStats.fulfilled, (state, action) => {
        state.roomStats = action.payload;
      })
      .addCase(createDataRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
        state.roomStats[action.payload.id] = { folders: 0, files: 0 };
      })
      .addCase(renameDataRoom.fulfilled, (state, action) => {
        const idx = state.rooms.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.rooms[idx] = action.payload;
      })
      .addCase(deleteDataRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter((r) => r.id !== action.payload);
        state.unlockedRoomIds = state.unlockedRoomIds.filter((id) => id !== action.payload);
        delete state.roomStats[action.payload];
      })
      .addCase(setRoomPassword.fulfilled, (state, action) => {
        const idx = state.rooms.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.rooms[idx] = action.payload;
      });
  },
});

export const { unlockRoom, lockRoom } = dataRoomsSlice.actions;
export default dataRoomsSlice.reducer;
