import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';

interface UiState {
  viewMode: ViewMode;
  sortBy: SortBy;
  sortDirection: SortDirection;
  searchQuery: string;
  sidebarOpen: boolean;
  commandOpen: boolean;
  error: string | null;
}

const initialState: UiState = {
  viewMode: 'grid',
  sortBy: 'name',
  sortDirection: 'asc',
  searchQuery: '',
  sidebarOpen: true,
  commandOpen: false,
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload;
    },
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload;
    },
    setSortDirection(state, action: PayloadAction<SortDirection>) {
      state.sortDirection = action.payload;
    },
    toggleSortDirection(state) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setCommandOpen(state, action: PayloadAction<boolean>) {
      state.commandOpen = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  setViewMode,
  setSortBy,
  setSortDirection,
  toggleSortDirection,
  setSearchQuery,
  setSidebarOpen,
  toggleSidebar,
  setCommandOpen,
  setError,
  clearError,
} = uiSlice.actions;

export default uiSlice.reducer;
