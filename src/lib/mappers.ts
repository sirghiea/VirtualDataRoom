import type { DataRoom, Folder, FileEntry } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Map a `data_rooms` row to the app-level `DataRoom` type. */
export function toDataRoom(row: any): DataRoom {
  return {
    id: row.id,
    name: row.name,
    rootFolderId: row.root_folder_id,
    ownerId: row.owner_id,
    passwordHash: row.password_hash ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map a `folders` row to the app-level `Folder` type. */
export function toFolder(row: any): Folder {
  return {
    id: row.id,
    dataRoomId: row.data_room_id,
    parentId: row.parent_id ?? null,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map a `files` row to the app-level `FileEntry` type. */
export function toFileEntry(row: any): FileEntry {
  return {
    id: row.id,
    dataRoomId: row.data_room_id,
    folderId: row.folder_id,
    name: row.name,
    extension: row.extension,
    mimeType: row.mime_type,
    size: Number(row.size),
    storagePath: row.storage_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
