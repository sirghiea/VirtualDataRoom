import { openDB, type IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import type { DataRoom, Folder, FileEntry } from '@/types';

const DB_NAME = 'virtual-data-room';
const DB_VERSION = 1;

type VDRSchema = {
  datarooms: {
    key: string;
    value: DataRoom;
    indexes: { name: string };
  };
  folders: {
    key: string;
    value: Folder;
    indexes: {
      dataRoomId: string;
      parentId: string;
      'dataRoomId_parentId': [string, string | null];
    };
  };
  files: {
    key: string;
    value: FileEntry;
    indexes: {
      dataRoomId: string;
      folderId: string;
      'dataRoomId_folderId': [string, string];
    };
  };
  blobs: {
    key: string;
    value: { id: string; data: ArrayBuffer };
  };
};

let dbPromise: Promise<IDBPDatabase<VDRSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<VDRSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<VDRSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const dataroomStore = db.createObjectStore('datarooms', { keyPath: 'id' });
        dataroomStore.createIndex('name', 'name');

        const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
        folderStore.createIndex('dataRoomId', 'dataRoomId');
        folderStore.createIndex('parentId', 'parentId');
        folderStore.createIndex('dataRoomId_parentId', ['dataRoomId', 'parentId']);

        const fileStore = db.createObjectStore('files', { keyPath: 'id' });
        fileStore.createIndex('dataRoomId', 'dataRoomId');
        fileStore.createIndex('folderId', 'folderId');
        fileStore.createIndex('dataRoomId_folderId', ['dataRoomId', 'folderId']);

        db.createObjectStore('blobs', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

// --- DataRoom ---

export async function getAllDataRooms(): Promise<DataRoom[]> {
  const db = await getDb();
  return db.getAll('datarooms');
}

export async function getDataRoom(id: string): Promise<DataRoom | undefined> {
  const db = await getDb();
  return db.get('datarooms', id);
}

export async function createDataRoom(name: string): Promise<DataRoom> {
  const db = await getDb();
  const now = new Date().toISOString();
  const rootFolderId = uuidv4();
  const dataRoom: DataRoom = {
    id: uuidv4(),
    name,
    createdAt: now,
    updatedAt: now,
    rootFolderId,
  };

  const rootFolder: Folder = {
    id: rootFolderId,
    dataRoomId: dataRoom.id,
    parentId: null,
    name: 'Root',
    createdAt: now,
    updatedAt: now,
  };

  const tx = db.transaction(['datarooms', 'folders'], 'readwrite');
  await Promise.all([
    tx.objectStore('datarooms').put(dataRoom),
    tx.objectStore('folders').put(rootFolder),
    tx.done,
  ]);

  return dataRoom;
}

export async function updateDataRoom(id: string, name: string): Promise<DataRoom> {
  const db = await getDb();
  const existing = await db.get('datarooms', id);
  if (!existing) throw new Error('Data room not found');

  const updated: DataRoom = { ...existing, name, updatedAt: new Date().toISOString() };
  await db.put('datarooms', updated);
  return updated;
}

export async function deleteDataRoom(id: string): Promise<void> {
  const db = await getDb();

  const folders = await db.getAllFromIndex('folders', 'dataRoomId', id);
  const files = await db.getAllFromIndex('files', 'dataRoomId', id);

  const tx = db.transaction(['datarooms', 'folders', 'files', 'blobs'], 'readwrite');
  const promises: Promise<void>[] = [
    tx.objectStore('datarooms').delete(id) as unknown as Promise<void>,
  ];

  for (const folder of folders) {
    promises.push(tx.objectStore('folders').delete(folder.id) as unknown as Promise<void>);
  }
  for (const file of files) {
    promises.push(tx.objectStore('files').delete(file.id) as unknown as Promise<void>);
    promises.push(tx.objectStore('blobs').delete(file.blobKey) as unknown as Promise<void>);
  }

  promises.push(tx.done);
  await Promise.all(promises);
}

// --- Folders ---

export async function getFoldersByParent(
  dataRoomId: string,
  parentId: string | null
): Promise<Folder[]> {
  const db = await getDb();
  return db.getAllFromIndex('folders', 'dataRoomId_parentId', [dataRoomId, parentId!]);
}

export async function getAllFoldersInDataRoom(dataRoomId: string): Promise<Folder[]> {
  const db = await getDb();
  return db.getAllFromIndex('folders', 'dataRoomId', dataRoomId);
}

export async function getFolder(id: string): Promise<Folder | undefined> {
  const db = await getDb();
  return db.get('folders', id);
}

export async function createFolder(
  dataRoomId: string,
  parentId: string,
  name: string
): Promise<Folder> {
  const db = await getDb();
  const now = new Date().toISOString();
  const folder: Folder = {
    id: uuidv4(),
    dataRoomId,
    parentId,
    name,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('folders', folder);
  return folder;
}

export async function updateFolder(id: string, name: string): Promise<Folder> {
  const db = await getDb();
  const existing = await db.get('folders', id);
  if (!existing) throw new Error('Folder not found');

  const updated: Folder = { ...existing, name, updatedAt: new Date().toISOString() };
  await db.put('folders', updated);
  return updated;
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDb();

  // Collect all descendant folder IDs recursively
  const folderIdsToDelete: string[] = [id];
  let queue = [id];
  while (queue.length > 0) {
    const nextQueue: string[] = [];
    for (const parentId of queue) {
      const folder = await db.get('folders', parentId);
      if (!folder) continue;
      const children = await db.getAllFromIndex(
        'folders',
        'dataRoomId_parentId',
        [folder.dataRoomId, parentId]
      );
      for (const child of children) {
        folderIdsToDelete.push(child.id);
        nextQueue.push(child.id);
      }
    }
    queue = nextQueue;
  }

  // Collect all files in those folders
  const filesToDelete: FileEntry[] = [];
  for (const folderId of folderIdsToDelete) {
    const files = await db.getAllFromIndex('files', 'folderId', folderId);
    filesToDelete.push(...files);
  }

  const tx = db.transaction(['folders', 'files', 'blobs'], 'readwrite');
  const promises: Promise<void>[] = [];

  for (const folderId of folderIdsToDelete) {
    promises.push(tx.objectStore('folders').delete(folderId) as unknown as Promise<void>);
  }
  for (const file of filesToDelete) {
    promises.push(tx.objectStore('files').delete(file.id) as unknown as Promise<void>);
    promises.push(tx.objectStore('blobs').delete(file.blobKey) as unknown as Promise<void>);
  }

  promises.push(tx.done);
  await Promise.all(promises);
}

export async function getFolderPath(folderId: string): Promise<Folder[]> {
  const db = await getDb();
  const path: Folder[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder: Folder | undefined = await db.get('folders', currentId);
    if (!folder) break;
    path.unshift(folder);
    currentId = folder.parentId;
  }

  return path;
}

export async function getDescendantCounts(
  folderId: string
): Promise<{ folders: number; files: number }> {
  const db = await getDb();
  let folderCount = 0;
  let fileCount = 0;

  let queue = [folderId];
  while (queue.length > 0) {
    const nextQueue: string[] = [];
    for (const parentId of queue) {
      const folder = await db.get('folders', parentId);
      if (!folder) continue;
      const children = await db.getAllFromIndex(
        'folders',
        'dataRoomId_parentId',
        [folder.dataRoomId, parentId]
      );
      const files = await db.getAllFromIndex('files', 'folderId', parentId);
      folderCount += children.length;
      fileCount += files.length;
      for (const child of children) {
        nextQueue.push(child.id);
      }
    }
    queue = nextQueue;
  }

  return { folders: folderCount, files: fileCount };
}

// --- Files ---

export async function getFilesByFolder(
  dataRoomId: string,
  folderId: string
): Promise<FileEntry[]> {
  const db = await getDb();
  return db.getAllFromIndex('files', 'dataRoomId_folderId', [dataRoomId, folderId]);
}

export async function getFile(id: string): Promise<FileEntry | undefined> {
  const db = await getDb();
  return db.get('files', id);
}

export async function uploadFile(
  dataRoomId: string,
  folderId: string,
  file: File,
  uniqueName: string
): Promise<FileEntry> {
  const db = await getDb();
  const now = new Date().toISOString();
  const blobKey = uuidv4();
  const buffer = await file.arrayBuffer();

  const ext = file.name.split('.').pop() ?? '';
  const fileEntry: FileEntry = {
    id: uuidv4(),
    dataRoomId,
    folderId,
    name: uniqueName,
    extension: ext,
    mimeType: file.type,
    size: file.size,
    blobKey,
    createdAt: now,
    updatedAt: now,
  };

  const tx = db.transaction(['files', 'blobs'], 'readwrite');
  await Promise.all([
    tx.objectStore('files').put(fileEntry),
    tx.objectStore('blobs').put({ id: blobKey, data: buffer }),
    tx.done,
  ]);

  return fileEntry;
}

export async function getFileBlob(blobKey: string): Promise<ArrayBuffer | undefined> {
  const db = await getDb();
  const record = await db.get('blobs', blobKey);
  return record?.data;
}

export async function updateFile(id: string, name: string): Promise<FileEntry> {
  const db = await getDb();
  const existing = await db.get('files', id);
  if (!existing) throw new Error('File not found');

  const updated: FileEntry = { ...existing, name, updatedAt: new Date().toISOString() };
  await db.put('files', updated);
  return updated;
}

export async function deleteFile(id: string): Promise<void> {
  const db = await getDb();
  const file = await db.get('files', id);
  if (!file) return;

  const tx = db.transaction(['files', 'blobs'], 'readwrite');
  await Promise.all([
    tx.objectStore('files').delete(id),
    tx.objectStore('blobs').delete(file.blobKey),
    tx.done,
  ]);
}
