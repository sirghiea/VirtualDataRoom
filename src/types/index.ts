export interface DataRoom {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rootFolderId: string;
  ownerId: string;
  /** SHA-256 hash of the room password. null/undefined = no password protection. */
  passwordHash?: string | null;
}

export interface Folder {
  id: string;
  dataRoomId: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileEntry {
  id: string;
  dataRoomId: string;
  folderId: string;
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
}
