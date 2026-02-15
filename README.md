# Virtual Data Room

A secure, browser-based document repository built for managing due diligence workflows. Think Google Drive or Dropbox, scoped to a single "Data Room" that acts as the top-level container for organizing and viewing documents.

## Live Demo

> _Deployed URL will go here once hosted on Vercel._

---

## Features

- **Data Room Management** - Create, rename, and delete data rooms. Each data room is an isolated container with its own folder hierarchy.
- **Nested Folders** - Create folders at any depth. A collapsible sidebar tree and breadcrumb trail let you navigate the hierarchy quickly.
- **PDF Upload & Viewing** - Upload PDF files (up to 50 MB) and view them in a full-screen viewer with page navigation, zoom controls, and keyboard shortcuts.
- **Rename & Delete** - Every item (data room, folder, file) can be renamed or deleted via a kebab menu. Deleting a folder cascades to all nested content, with a confirmation dialog showing the impact count.
- **Duplicate Name Handling** - Folders with duplicate names are rejected with an error. Files with duplicate names are automatically suffixed (e.g., `report (1).pdf`).
- **Persistent Storage** - All data is stored in IndexedDB and survives page refreshes. No server required.
- **Responsive Layout** - Sidebar collapses on tablet widths; mobile gets a full-width content area.

---

## Tech Stack

| Layer              | Choice                                 |
| ------------------ | -------------------------------------- |
| Framework          | React 19 + TypeScript 5.9              |
| Build Tool         | Vite 7                                 |
| Styling            | Tailwind CSS 4 (CSS-based theme)       |
| Icons              | Lucide React                           |
| Routing            | React Router v7                        |
| State Management   | React Context + `useReducer`           |
| Persistence        | IndexedDB via the `idb` library        |
| PDF Rendering      | `react-pdf` (backed by PDF.js)         |
| Utilities          | `uuid`, `clsx`, `tailwind-merge`       |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/sirghiea/VirtualDataRoom.git
cd VirtualDataRoom

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be running at **http://localhost:5173**.

### Other Commands

```bash
npm run build    # Type-check + production build (output in dist/)
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

---

## How to Use the App

### 1. Create a Data Room

From the home page, click **"New Data Room"**, give it a name, and press **Create**. You'll be taken straight into the explorer view.

### 2. Organize with Folders

Click **"New Folder"** in the toolbar to create a folder inside the current directory. Double-click any folder to navigate into it. Use the **sidebar tree** or **breadcrumb trail** to jump to any level of the hierarchy.

### 3. Upload PDFs

Click **"Upload PDF"** in the toolbar and select a `.pdf` file from your computer. The file appears in the current folder. Only PDF files up to 50 MB are accepted; all other types are rejected with an error message.

### 4. View a PDF

Double-click a file (or use the kebab menu and choose **View**) to open the full-screen PDF viewer. Controls:

| Action          | How                          |
| --------------- | ---------------------------- |
| Next page       | Right arrow key or `>` button |
| Previous page   | Left arrow key or `<` button  |
| Zoom in/out     | `+` / `-` buttons            |
| Reset zoom      | Fit-width button             |
| Close viewer    | `Esc` key or `X` button      |

### 5. Rename or Delete Items

Click the **three-dot menu** on any data room card, folder, or file to see **Rename** and **Delete** options. Deleting a folder shows how many subfolders and files will be removed before you confirm.

---

## Design Decisions

### Why IndexedDB instead of localStorage?

localStorage is limited to ~5 MB of string data. IndexedDB supports structured storage of large binary blobs (ArrayBuffers), which is essential for storing PDF files in the browser. The `idb` library provides a clean Promise-based wrapper that keeps the code readable.

### Why Context + useReducer instead of Redux or Zustand?

For an MVP with a single global store and straightforward CRUD actions, React's built-in Context + `useReducer` pattern is sufficient and avoids adding another dependency. The reducer centralizes state transitions, making the data flow predictable without the boilerplate of Redux.

### Blob separation from file metadata

File metadata (`FileEntry`) is stored in one IndexedDB object store, while the raw PDF binary is stored in a separate `blobs` store keyed by a UUID (`blobKey`). This separation means listing files is fast (no large blobs loaded), and blob cleanup is handled transactionally during delete operations.

### Recursive cascade deletes

Deleting a folder traverses all descendants using a BFS queue, collects every child folder and file, then performs a single IndexedDB transaction to remove everything atomically. This ensures no orphaned records are left behind.

### Compound indexes for efficient queries

The `folders` and `files` stores use compound indexes (e.g., `[dataRoomId, parentId]`) so that listing the children of a specific folder is a single indexed lookup rather than a full table scan followed by filtering.

### Native `<dialog>` element

All modals use the native HTML `<dialog>` element with `showModal()`, which provides built-in focus trapping, backdrop, and `Esc` to close — without needing a third-party modal library.

### Tailwind v4 CSS-based theming

Instead of a `tailwind.config.js` file, the project uses Tailwind v4's `@theme` directive in CSS to define design tokens (colors, radii, fonts). This keeps the theme co-located with styles and eliminates a config file.

---

## Project Structure

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Router + providers
├── index.css                         # Tailwind v4 theme tokens
│
├── types/
│   └── index.ts                      # DataRoom, Folder, FileEntry interfaces
│
├── lib/
│   └── utils.ts                      # cn(), formatBytes(), formatDate(), getUniqueFileName()
│
├── services/
│   └── storage.ts                    # IndexedDB data access layer (all CRUD operations)
│
├── context/
│   └── AppContext.tsx                 # React Context provider + useReducer + action creators
│
├── pages/
│   ├── HomePage.tsx                  # Data room list with create/rename/delete
│   └── DataRoomPage.tsx              # File explorer: sidebar, breadcrumb, toolbar, content
│
├── components/
│   ├── layout/
│   │   └── Header.tsx                # App header with logo
│   ├── dataroom/
│   │   ├── DataRoomCard.tsx          # Card with kebab menu
│   │   └── CreateDataRoomDialog.tsx  # Modal to create a data room
│   ├── explorer/
│   │   ├── Breadcrumb.tsx            # Clickable folder path
│   │   ├── Toolbar.tsx               # New Folder + Upload PDF buttons
│   │   ├── FolderTree.tsx            # Recursive collapsible sidebar tree
│   │   ├── FolderCard.tsx            # Folder item in content grid
│   │   ├── FileCard.tsx              # File item in content grid
│   │   └── ContentArea.tsx           # Renders folder + file cards (or empty state)
│   ├── file-viewer/
│   │   └── FileViewerModal.tsx       # Full-screen PDF viewer with zoom + pagination
│   └── shared/
│       ├── ConfirmDialog.tsx         # Reusable delete confirmation modal
│       ├── RenameDialog.tsx          # Reusable rename / create-name modal
│       ├── EmptyState.tsx            # Placeholder with icon, title, description, CTA
│       └── Toast.tsx                 # Auto-dismissing error/success notification
```

---

## Edge Cases Handled

| Scenario                        | Behavior                                                    |
| ------------------------------- | ----------------------------------------------------------- |
| Non-PDF file selected           | Rejected with alert message                                 |
| File > 50 MB                    | Rejected with alert message                                 |
| Empty (0-byte) file             | Rejected with alert message                                 |
| Duplicate file name in folder   | Auto-suffixed: `report.pdf` becomes `report (1).pdf`        |
| Duplicate folder name in parent | Rejected with error toast                                   |
| Empty folder/file name          | Submit button disabled; form won't submit                   |
| Name > 255 characters           | Input capped at `maxLength="255"`                           |
| Long names in UI                | Truncated with CSS `text-overflow: ellipsis`; full on hover |
| Delete folder with children     | Confirmation shows count of nested folders and files         |
| Deep nesting (10+ levels)       | Breadcrumb truncates middle segments with `...`              |
| No data rooms                   | Empty state with illustration and create CTA                |
| Empty folder                    | Empty state prompting upload or folder creation             |

---

## Deployment (Vercel)

1. Push the repo to GitHub (already done).
2. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
3. Click **"Add New Project"** and import the `VirtualDataRoom` repository.
4. Vercel auto-detects Vite. No additional configuration needed.
5. Click **Deploy**. Your app will be live at the provided URL.

For SPA routing to work on Vercel, add a `vercel.json` at the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## License

MIT
