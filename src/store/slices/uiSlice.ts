import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';
export type HomeSortBy = 'name' | 'created' | 'updated';
export type HomeFilter = 'all' | 'protected' | 'unprotected';

interface UiState {
  viewMode: ViewMode;
  sortBy: SortBy;
  sortDirection: SortDirection;
  searchQuery: string;
  sidebarOpen: boolean;
  commandOpen: boolean;
  error: string | null;
  homeSearchQuery: string;
  homeSortBy: HomeSortBy;
  homeSortDirection: SortDirection;
  homeFilter: HomeFilter;
}

const initialState: UiState = {
  viewMode: 'grid',
  sortBy: 'name',
  sortDirection: 'asc',
  searchQuery: '',
  sidebarOpen: true,
  commandOpen: false,
  error: null,
  homeSearchQuery: '',
  homeSortBy: 'created',
  homeSortDirection: 'desc',
  homeFilter: 'all',
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
    setHomeSearchQuery(state, action: PayloadAction<string>) {
      state.homeSearchQuery = action.payload;
    },
    setHomeSortBy(state, action: PayloadAction<HomeSortBy>) {
      state.homeSortBy = action.payload;
    },
    toggleHomeSortDirection(state) {
      state.homeSortDirection = state.homeSortDirection === 'asc' ? 'desc' : 'asc';
    },
    setHomeFilter(state, action: PayloadAction<HomeFilter>) {
      state.homeFilter = action.payload;
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
  setHomeSearchQuery,
  setHomeSortBy,
  toggleHomeSortDirection,
  setHomeFilter,
} = uiSlice.actions;

export default uiSlice.reducer;
