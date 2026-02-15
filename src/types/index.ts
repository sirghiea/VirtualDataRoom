export interface DataRoom {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rootFolderId: string;
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
  blobKey: string;
  createdAt: string;
  updatedAt: string;
}
