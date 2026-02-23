# Virtual Data Room

A secure, cloud-backed document repository built for managing due diligence workflows. Create data rooms, organize documents in nested folders, upload and preview PDFs, protect rooms with passwords, and collaborate with your team — all with a polished dark glassmorphism UI.

## Live Demo

🔗 [https://virtual-data-room.vercel.app/](https://virtual-data-room.vercel.app/)

---

## Features

### Authentication
- **Email & Password Auth** — Sign up and log in with email/password via Supabase Auth
- **Protected Routes** — Unauthenticated users are redirected to the login page
- **User Menu** — Header shows logged-in user email with a sign-out dropdown

### Data Rooms
- **Create, Rename, Delete** — Full CRUD for data rooms from the homepage
- **Password Protection** — Set, change, or remove passwords on individual rooms (SHA-256 hashed)
- **Room Stats** — Each card shows folder/file counts and relative timestamps ("2h ago")

### File Management
- **Nested Folders** — Create folders at any depth with a collapsible sidebar tree and breadcrumb navigation
- **PDF Upload & Viewing** — Upload PDFs (up to 50 MB) and view in a full-screen viewer with zoom, pagination, and keyboard shortcuts
- **Drag & Drop** — Drag files from your OS into the browser to upload, or drag between folders to move
- **Rename & Delete** — Every item has a context menu. Folder deletes cascade with an impact count confirmation

### Homepage
- **Glass Stat Cards** — Dashboard hero with Total Rooms, Protected, and Total Files stats
- **Search, Filter & Sort** — Search rooms by name, filter by protection status, sort by name/created/updated
- **Grid Layout** — Responsive card grid with hover animations

### UI & Design
- **Dark Glassmorphism Theme** — Premium dark theme with glass effects, gradient borders, and inner glows
- **Grid & List Views** — Toggle between card grid and compact list views in the explorer
- **Framer Motion Animations** — Smooth entrance animations, hover effects, and transitions
- **Responsive Layout** — Sidebar collapses on tablet; mobile gets full-width content

---

## Tech Stack

| Layer            | Choice                                     |
| ---------------- | ------------------------------------------ |
| Framework        | React 19 + TypeScript 5.9                  |
| Build Tool       | Vite 7                                     |
| Styling          | Tailwind CSS 4 (CSS-based theme)           |
| Icons            | Lucide React                               |
| Routing          | React Router v7                            |
| State Management | Redux Toolkit (RTK)                        |
| Auth             | Supabase Auth (email/password)             |
| Database         | Supabase PostgreSQL                        |
| File Storage     | Supabase Storage                           |
| PDF Rendering    | react-pdf (PDF.js)                         |
| Validation       | Zod                                        |
| Animations       | Framer Motion                              |
| UI Components    | shadcn/ui + Radix UI                       |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A **Supabase** project (free tier works)

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migration in the SQL Editor (see [Database Schema](#database-schema) below)
3. Copy your **Project URL** and **anon key** from Project Settings > API Keys

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/sirghiea/VirtualDataRoom.git
cd VirtualDataRoom

# 2. Install dependencies
npm install

# 3. Create .env.local with your Supabase credentials
cat > .env.local << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF

# 4. Start the dev server
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

## Database Schema

Run this SQL in your Supabase SQL Editor to set up the tables, RLS policies, and storage bucket:

```sql
-- Tables
create table data_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  root_folder_id uuid not null,
  password_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table folders (
  id uuid primary key default gen_random_uuid(),
  data_room_id uuid not null references data_rooms(id) on delete cascade,
  parent_id uuid references folders(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table files (
  id uuid primary key default gen_random_uuid(),
  data_room_id uuid not null references data_rooms(id) on delete cascade,
  folder_id uuid not null references folders(id) on delete cascade,
  name text not null,
  extension text not null,
  mime_type text not null,
  size bigint not null,
  storage_path text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies (shareable model: all authenticated users have full access)
alter table data_rooms enable row level security;
alter table folders enable row level security;
alter table files enable row level security;

create policy "Authenticated full access" on data_rooms for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on folders for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on files for all using (auth.role() = 'authenticated');

-- Recursive descendant count function
create or replace function get_descendant_counts(root_id uuid)
returns table(folder_count bigint, file_count bigint) as $$
  with recursive descendants as (
    select id from folders where parent_id = root_id
    union all
    select f.id from folders f join descendants d on f.parent_id = d.id
  )
  select
    (select count(*) from descendants) as folder_count,
    (select count(*) from files where folder_id = root_id or folder_id in (select id from descendants)) as file_count;
$$ language sql stable;

-- Storage bucket for file blobs
insert into storage.buckets (id, name, public) values ('files', 'files', false);
create policy "Auth upload" on storage.objects for insert with check (auth.role() = 'authenticated' and bucket_id = 'files');
create policy "Auth read" on storage.objects for select using (auth.role() = 'authenticated' and bucket_id = 'files');
create policy "Auth delete" on storage.objects for delete using (auth.role() = 'authenticated' and bucket_id = 'files');
```

---

## How to Use

### 1. Sign Up / Log In

Visit the app and create an account with your email and password. Passwords require 8+ characters, an uppercase letter, a number, and a special character.

### 2. Create a Data Room

From the homepage dashboard, click **"New Data Room"**, give it a name, and press Create. Optionally set a password to protect it.

### 3. Organize with Folders

Click **"New Folder"** in the toolbar. Double-click folders to navigate. Use the **sidebar tree** or **breadcrumb** to jump between levels.

### 4. Upload PDFs

Click **"Upload PDF"** or drag files from your OS into the browser. Only PDFs up to 50 MB are accepted.

### 5. View a PDF

Double-click a file to open the full-screen viewer:

| Action        | How                           |
| ------------- | ----------------------------- |
| Next page     | Right arrow or `>` button     |
| Previous page | Left arrow or `<` button      |
| Zoom in/out   | `+` / `-` buttons             |
| Reset zoom    | Fit-width button              |
| Close viewer  | `Esc` or `X` button           |

### 6. Manage Items

Click the **three-dot menu** on any card for Rename, Delete, or password options. Folder deletes show a confirmation with the count of nested content.

---

## Project Structure

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Router + providers + AuthGuard
├── index.css                         # Tailwind v4 theme tokens
│
├── types/
│   └── index.ts                      # DataRoom, Folder, FileEntry interfaces
│
├── lib/
│   ├── utils.ts                      # cn(), formatBytes(), formatDate(), formatRelativeDate()
│   ├── crypto.ts                     # SHA-256 password hashing + verification
│   ├── supabase.ts                   # Supabase client singleton
│   └── mappers.ts                    # DB row (snake_case) → TypeScript (camelCase)
│
├── services/
│   └── storage.ts                    # Supabase data access layer (all CRUD operations)
│
├── contexts/
│   ├── auth-context.ts               # AuthContext + AuthState type
│   └── AuthContext.tsx                # AuthProvider (session management)
│
├── hooks/
│   ├── useAuth.ts                    # useAuth() hook
│   └── useFilteredRooms.ts           # Homepage search/filter/sort logic
│
├── store/
│   ├── index.ts                      # Redux store configuration
│   ├── hooks.ts                      # Typed useAppSelector / useAppDispatch
│   └── slices/
│       ├── dataRoomsSlice.ts         # Data room CRUD + stats thunks
│       ├── explorerSlice.ts          # File explorer state + thunks
│       └── uiSlice.ts               # View mode, sort, search, sidebar state
│
├── pages/
│   ├── HomePage.tsx                  # Dashboard with glass stat cards + room grid
│   ├── DataRoomPage.tsx              # File explorer: sidebar, breadcrumb, toolbar, content
│   ├── LoginPage.tsx                 # Email/password sign in
│   └── SignupPage.tsx                # Registration with password strength meter
│
├── components/
│   ├── auth/
│   │   └── AuthGuard.tsx             # Route protection (redirect to /login)
│   ├── layout/
│   │   └── Header.tsx                # App header with logo + user menu
│   ├── dataroom/
│   │   ├── DataRoomCard.tsx          # Room card with stats + password badge
│   │   ├── HomeToolbar.tsx           # Search + filter + sort + create button
│   │   ├── PasswordDialog.tsx        # Set/change/remove/unlock password modal
│   │   └── CreateDataRoomDialog.tsx  # Create data room modal
│   ├── explorer/
│   │   ├── Breadcrumb.tsx            # Clickable folder path
│   │   ├── Toolbar.tsx               # New Folder + Upload buttons + view toggle
│   │   ├── FolderTree.tsx            # Recursive collapsible sidebar tree
│   │   ├── FolderCard.tsx            # Folder card with subfolder/file counts
│   │   ├── FileCard.tsx              # File card with extension badge
│   │   └── ContentArea.tsx           # Grid/list rendering + empty states
│   ├── file-viewer/
│   │   └── FileViewerModal.tsx       # Full-screen PDF viewer
│   └── shared/
│       ├── ConfirmDialog.tsx         # Reusable delete confirmation
│       ├── RenameDialog.tsx          # Reusable rename/create-name modal
│       └── EmptyState.tsx            # Empty state placeholder
```

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key
4. Deploy. Vercel auto-detects Vite.

For SPA routing, add a `vercel.json` at the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## License

MIT
