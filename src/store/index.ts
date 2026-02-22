import { configureStore } from '@reduxjs/toolkit';
import dataRoomsReducer from './slices/dataRoomsSlice';
import explorerReducer from './slices/explorerSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    dataRooms: dataRoomsReducer,
    explorer: explorerReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
