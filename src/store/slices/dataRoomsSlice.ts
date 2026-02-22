import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DataRoom } from '@/types';
import * as storage from '@/services/storage';

interface DataRoomsState {
  rooms: DataRoom[];
  status: 'idle' | 'loading' | 'error';
}

const initialState: DataRoomsState = {
  rooms: [],
  status: 'idle',
};

export const fetchDataRooms = createAsyncThunk('dataRooms/fetchAll', async () => {
  return storage.getAllDataRooms();
});

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

const dataRoomsSlice = createSlice({
  name: 'dataRooms',
  initialState,
  reducers: {},
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
      .addCase(createDataRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      })
      .addCase(renameDataRoom.fulfilled, (state, action) => {
        const idx = state.rooms.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.rooms[idx] = action.payload;
      })
      .addCase(deleteDataRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter((r) => r.id !== action.payload);
      });
  },
});

export default dataRoomsSlice.reducer;
