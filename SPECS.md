# Virtual Data Room - Project Specifications

## 1. Project Overview

**Product:** Virtual Data Room (VDR) MVP for Acme Corp.
**Purpose:** A secure, organized repository for storing and distributing documents during due diligence for a multi-billion dollar acquisition.
**Analogous to:** Google Drive / Dropbox / Box, where the "Data Room" is the top-level drive.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Build Tool | Vite |
| Routing | React Router v6 (SPA) |
| State Management | React Context + useReducer |
| Storage | IndexedDB (via idb library) for persistence |
| File Viewer | react-pdf (for PDF rendering) |
| Deployment | Vercel |

---

## 3. Data Structures

### 3.1 DataRoom

```typescript
interface DataRoom {
  id: string;                // UUID
  name: string;              // User-defined name
  createdAt: string;         // ISO 8601 timestamp
  updatedAt: string;         // ISO 8601 timestamp
  rootFolderId: string;      // ID of the implicit root folder
}
```

### 3.2 Folder

```typescript
interface Folder {
  id: string;                // UUID
  dataRoomId: string;        // Parent data room
  parentId: string | null;   // null = root folder
  name: string;              // Folder name
  createdAt: string;         // ISO 8601 timestamp
  updatedAt: string;         // ISO 8601 timestamp
}
```

### 3.3 File

```typescript
interface FileEntry {
  id: string;                // UUID
  dataRoomId: string;        // Parent data room
  folderId: string;          // Parent folder ID
  name: string;              // Display name (without extension)
  extension: string;         // File extension (e.g., "pdf")
  mimeType: string;          // MIME type (e.g., "application/pdf")
  size: number;              // File size in bytes
  blobKey: string;           // Key to retrieve file blob from IndexedDB
  createdAt: string;         // ISO 8601 timestamp
  updatedAt: string;         // ISO 8601 timestamp
}
```

### 3.4 Storage Schema (IndexedDB)

| Store Name | Key | Indexes |
|-----------|-----|---------|
| `datarooms` | `id` | `name` |
| `folders` | `id` | `dataRoomId`, `parentId`, `[dataRoomId, parentId]` (compound) |
| `files` | `id` | `dataRoomId`, `folderId`, `[dataRoomId, folderId]` (compound) |
| `blobs` | `id` | — (stores raw file ArrayBuffers) |

---

## 4. Functional Requirements

### 4.1 Data Room CRUD

| Operation | Description |
|-----------|-------------|
| **Create** | User can create a new data room with a name. A root folder is auto-created. |
| **View** | Landing page lists all data rooms as cards/rows. Clicking opens the data room. |
| **Update** | User can rename a data room (inline edit or modal). |
| **Delete** | User can delete a data room. Cascades to all folders, files, and blobs within. Requires confirmation dialog. |

### 4.2 Folder CRUD

| Operation | Description |
|-----------|-------------|
| **Create** | User can create a new folder inside any folder. Name must be non-empty. Duplicate names within the same parent are handled (auto-suffix or warning). |
| **View** | Clicking a folder navigates into it, showing its child folders and files. Breadcrumb trail shows hierarchy. |
| **Update** | User can rename a folder (inline edit or modal). Same duplicate-name handling applies. |
| **Delete** | User can delete a folder. Recursively deletes all nested folders and files. Requires confirmation dialog showing impact count. |

### 4.3 File CRUD

| Operation | Description |
|-----------|-------------|
| **Upload** | User can upload PDF files into the current folder. Files are stored as blobs in IndexedDB. Duplicate file names within the same folder are handled (auto-suffix or warning). Max file size: 50MB (configurable). |
| **View** | Clicking a file opens a PDF viewer panel/modal. The viewer supports page navigation and zoom. |
| **Update** | User can rename a file (inline edit or modal). Extension is preserved. |
| **Delete** | User can delete a file. Blob is also removed from storage. Requires confirmation dialog. |

---

## 5. UI / UX Specifications

### 5.1 Page Structure (Routes)

| Route | View | Description |
|-------|------|-------------|
| `/` | **Home / Data Room List** | Lists all data rooms. "Create Data Room" button. |
| `/dataroom/:id` | **Data Room Explorer** | File explorer view. Breadcrumbs, folder tree, file grid/list. |
| `/dataroom/:id/file/:fileId` | **File Viewer** | PDF viewer (can also be a modal overlay on the explorer). |

### 5.2 Layout Components

```
┌─────────────────────────────────────────────────────┐
│  Header (Logo, App Name, optional search)           │
├──────────┬──────────────────────────────────────────┤
│          │  Breadcrumb: DataRoom > Folder > Sub     │
│  Sidebar │──────────────────────────────────────────│
│  (Folder │  Toolbar: [New Folder] [Upload File]     │
│   Tree)  │──────────────────────────────────────────│
│          │                                          │
│          │  Content Area                            │
│          │  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│          │  │ 📁 │ │ 📁 │ │ 📄 │ │ 📄 │           │
│          │  │Sub1│ │Sub2│ │Doc1│ │Doc2│           │
│          │  └────┘ └────┘ └────┘ └────┘           │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│  (Optional) Status Bar                              │
└─────────────────────────────────────────────────────┘
```

### 5.3 Component Hierarchy

```
App
├── HomePage
│   ├── DataRoomCard (× N)
│   │   ├── RenameAction
│   │   └── DeleteAction
│   └── CreateDataRoomDialog
│
├── DataRoomPage
│   ├── Breadcrumb
│   ├── Sidebar
│   │   └── FolderTree
│   │       └── FolderTreeNode (recursive)
│   ├── Toolbar
│   │   ├── NewFolderButton
│   │   └── UploadFileButton
│   ├── ContentArea
│   │   ├── FolderCard (× N)
│   │   └── FileCard (× N)
│   └── ContextMenu (right-click: rename, delete)
│
├── FileViewerModal
│   ├── PDFViewer
│   │   ├── PageNavigation
│   │   └── ZoomControls
│   └── CloseButton
│
└── Shared
    ├── ConfirmDialog
    ├── RenameDialog
    ├── EmptyState
    ├── LoadingSpinner
    └── ErrorBoundary
```

### 5.4 Interaction Patterns

| Interaction | Behavior |
|-------------|----------|
| **Create Data Room** | Click button → Modal with name input → Submit creates data room and navigates into it |
| **Create Folder** | Click "New Folder" → Inline editable folder appears in content area, or modal with name input |
| **Upload File** | Click "Upload" → Native file picker (accept=".pdf") → Progress indicator → File appears in grid |
| **Navigate into folder** | Single click or double-click on folder → URL updates, breadcrumb updates, content reloads |
| **Rename** | Right-click context menu or kebab menu → "Rename" → Inline edit with save/cancel |
| **Delete** | Right-click context menu or kebab menu → "Delete" → Confirmation dialog → Removed with animation |
| **View file** | Click on file → Modal/panel with PDF viewer |
| **Breadcrumb navigation** | Click any breadcrumb segment to jump to that folder level |
| **Sidebar tree** | Collapsible tree view. Click folder to navigate. Shows expand/collapse arrows. |

---

## 6. Edge Cases & Error Handling

### 6.1 File Upload

| Edge Case | Handling |
|-----------|----------|
| Non-PDF file selected | Show toast error: "Only PDF files are supported" |
| File exceeds size limit | Show toast error: "File exceeds 50MB limit" |
| Duplicate file name in same folder | Append suffix: `document.pdf` → `document (1).pdf` |
| Upload fails (storage full) | Show toast error with explanation. Suggest deleting unused files. |
| Empty file (0 bytes) | Reject with toast: "Cannot upload empty file" |

### 6.2 Folder Operations

| Edge Case | Handling |
|-----------|----------|
| Duplicate folder name in same parent | Prevent creation, show inline validation error |
| Empty folder name | Prevent creation, show inline validation error |
| Folder name with special characters | Allow but sanitize display (trim whitespace, limit length to 255 chars) |
| Delete folder with nested content | Show confirmation with count: "Delete folder and its X files and Y subfolders?" |
| Deeply nested folders (10+ levels) | Allow but breadcrumb truncates with "..." for middle segments |

### 6.3 General

| Edge Case | Handling |
|-----------|----------|
| IndexedDB unavailable | Show full-page error: "Storage unavailable. Please enable browser storage." |
| Very long names | Truncate with ellipsis in UI. Full name shown on hover (tooltip). |
| No data rooms exist | Show empty state with illustration and CTA: "Create your first Data Room" |
| Empty folder | Show empty state: "This folder is empty" with upload/create folder prompts |
| Browser back/forward | URL-driven state ensures correct navigation behavior |
| Concurrent tab edits | Not handled in MVP (single-tab assumption) |

---

## 7. Design System

### 7.1 Visual Guidelines

| Property | Value |
|----------|-------|
| **Font** | Inter (via Google Fonts) or system font stack |
| **Primary Color** | Blue-600 (`#2563EB`) — actions, links, selected states |
| **Destructive Color** | Red-600 (`#DC2626`) — delete actions |
| **Background** | White (`#FFFFFF`) with Gray-50 (`#F9FAFB`) for sidebar/surfaces |
| **Border Radius** | `8px` for cards, `6px` for buttons, `4px` for inputs |
| **Spacing Scale** | Tailwind default (4px base) |
| **Icon Set** | Lucide React (ships with shadcn) |
| **Shadows** | Subtle: `shadow-sm` for cards, `shadow-lg` for modals |

### 7.2 Responsive Behavior

| Breakpoint | Behavior |
|-----------|----------|
| Desktop (≥1024px) | Full layout with sidebar |
| Tablet (768–1023px) | Collapsible sidebar (hamburger toggle) |
| Mobile (<768px) | No sidebar. Full-width content. Bottom sheet for actions. |

---

## 8. State Management

### 8.1 Context Structure

```typescript
interface AppState {
  dataRooms: DataRoom[];
  currentDataRoom: DataRoom | null;
  currentFolderId: string | null;
  folders: Folder[];           // Folders in current data room
  files: FileEntry[];          // Files in current data room
  breadcrumb: Folder[];        // Computed from currentFolderId → root
  isLoading: boolean;
  error: string | null;
}
```

### 8.2 Actions

```typescript
type Action =
  // Data Rooms
  | { type: 'SET_DATAROOMS'; payload: DataRoom[] }
  | { type: 'ADD_DATAROOM'; payload: DataRoom }
  | { type: 'UPDATE_DATAROOM'; payload: { id: string; name: string } }
  | { type: 'DELETE_DATAROOM'; payload: string }
  // Folders
  | { type: 'SET_FOLDERS'; payload: Folder[] }
  | { type: 'ADD_FOLDER'; payload: Folder }
  | { type: 'UPDATE_FOLDER'; payload: { id: string; name: string } }
  | { type: 'DELETE_FOLDER'; payload: string }
  // Files
  | { type: 'SET_FILES'; payload: FileEntry[] }
  | { type: 'ADD_FILE'; payload: FileEntry }
  | { type: 'UPDATE_FILE'; payload: { id: string; name: string } }
  | { type: 'DELETE_FILE'; payload: string }
  // Navigation
  | { type: 'SET_CURRENT_FOLDER'; payload: string | null }
  | { type: 'SET_BREADCRUMB'; payload: Folder[] }
  // UI
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
```

### 8.3 Data Access Layer

A `StorageService` class abstracts IndexedDB operations:

```typescript
class StorageService {
  // DataRooms
  getAllDataRooms(): Promise<DataRoom[]>
  createDataRoom(name: string): Promise<DataRoom>
  updateDataRoom(id: string, name: string): Promise<DataRoom>
  deleteDataRoom(id: string): Promise<void>   // cascades

  // Folders
  getFoldersByParent(dataRoomId: string, parentId: string | null): Promise<Folder[]>
  getAllFoldersInDataRoom(dataRoomId: string): Promise<Folder[]>
  createFolder(dataRoomId: string, parentId: string | null, name: string): Promise<Folder>
  updateFolder(id: string, name: string): Promise<Folder>
  deleteFolder(id: string): Promise<void>     // recursive cascade
  getFolderPath(folderId: string): Promise<Folder[]>  // for breadcrumbs

  // Files
  getFilesByFolder(dataRoomId: string, folderId: string): Promise<FileEntry[]>
  uploadFile(dataRoomId: string, folderId: string, file: File): Promise<FileEntry>
  getFileBlob(blobKey: string): Promise<ArrayBuffer>
  updateFile(id: string, name: string): Promise<FileEntry>
  deleteFile(id: string): Promise<void>        // also deletes blob
}
```

---

## 9. File Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router setup
├── index.css                   # Tailwind imports + globals
│
├── types/
│   └── index.ts                # DataRoom, Folder, FileEntry interfaces
│
├── services/
│   └── storage.ts              # IndexedDB StorageService
│
├── context/
│   ├── AppContext.tsx           # Context provider + reducer
│   └── useAppContext.ts        # Custom hook
│
├── pages/
│   ├── HomePage.tsx            # Data room list
│   └── DataRoomPage.tsx        # Explorer view
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── dataroom/
│   │   ├── DataRoomCard.tsx
│   │   └── CreateDataRoomDialog.tsx
│   │
│   ├── explorer/
│   │   ├── Breadcrumb.tsx
│   │   ├── Toolbar.tsx
│   │   ├── ContentArea.tsx
│   │   ├── FolderCard.tsx
│   │   ├── FileCard.tsx
│   │   └── FolderTree.tsx
│   │
│   ├── file-viewer/
│   │   └── FileViewerModal.tsx
│   │
│   └── shared/
│       ├── ConfirmDialog.tsx
│       ├── RenameDialog.tsx
│       ├── EmptyState.tsx
│       └── ErrorBoundary.tsx
│
├── hooks/
│   ├── useDataRooms.ts         # Data room CRUD operations
│   ├── useFolders.ts           # Folder CRUD operations
│   └── useFiles.ts             # File CRUD operations
│
├── lib/
│   └── utils.ts                # Utility functions (cn, formatBytes, generateId)
│
└── components/ui/              # shadcn/ui components (auto-generated)
    ├── button.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── dropdown-menu.tsx
    ├── toast.tsx
    └── ...
```

---

## 10. Implementation Phases

### Phase 1: Project Setup & Infrastructure
- Initialize Vite + React + TypeScript project
- Install and configure Tailwind CSS + shadcn/ui
- Set up React Router
- Implement IndexedDB `StorageService`
- Define TypeScript interfaces
- Create `AppContext` with reducer

### Phase 2: Data Room CRUD + Home Page
- Build `HomePage` with data room list (cards/grid)
- Implement Create Data Room dialog
- Implement Rename and Delete for data rooms
- Empty state for no data rooms

### Phase 3: Folder CRUD + Explorer
- Build `DataRoomPage` layout (sidebar + content area)
- Implement breadcrumb navigation
- Implement folder creation (with duplicate name handling)
- Implement folder navigation (click to enter)
- Implement folder rename and delete (with cascade confirmation)
- Build `FolderTree` sidebar component

### Phase 4: File CRUD + Upload
- Implement PDF file upload with validation
- Display files in content area with file icon, name, size
- Implement file rename and delete
- Handle duplicate file names

### Phase 5: PDF Viewer
- Implement `FileViewerModal` with react-pdf
- Page navigation (prev/next, page number input)
- Zoom controls (fit width, zoom in/out)

### Phase 6: Polish & Edge Cases
- Loading states and skeleton screens
- Error boundaries and toast notifications
- Responsive design adjustments
- Keyboard accessibility (Tab, Enter, Escape for dialogs)
- Empty states with helpful CTAs
- Animation/transitions (folder open, delete fade-out)

### Phase 7: Deployment
- Configure Vercel deployment
- Write README with design decisions and setup instructions
- Final testing pass

---

## 11. Optional / Extra Credit Features

These are **not** in scope for MVP but documented for future consideration:

| Feature | Notes |
|---------|-------|
| **Backend + Blob Storage** | Deploy API (Node/Express or Next.js API routes) + S3/R2 for file storage |
| **Authentication** | NextAuth.js or Clerk for social auth / email+password |
| **Search & Filtering** | Full-text search on file names, folder names. Content search via PDF text extraction. |
| **Drag & Drop** | Drag files/folders to move between folders |
| **Multi-select** | Shift/Ctrl+click for batch operations |
| **Sort & View Toggle** | Sort by name/date/size. Toggle grid vs list view. |

---

## 12. Acceptance Criteria

- [ ] User can create, view, rename, and delete data rooms
- [ ] User can create, navigate, rename, and delete folders (including nested)
- [ ] User can upload PDF files, view them, rename them, and delete them
- [ ] Deleting a folder cascades to all nested content
- [ ] Duplicate names are handled gracefully (folders: prevented, files: auto-suffixed)
- [ ] PDF viewer renders documents with page navigation
- [ ] Breadcrumb navigation works correctly at all nesting levels
- [ ] Sidebar folder tree reflects current hierarchy
- [ ] Empty states are shown where appropriate
- [ ] Error states are handled with user-friendly messages
- [ ] Data persists across page refreshes (IndexedDB)
- [ ] Application is responsive (desktop, tablet, mobile)
- [ ] No unimplemented features or dead UI elements
- [ ] Clean, readable code with consistent conventions
