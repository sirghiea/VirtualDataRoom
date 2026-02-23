import { supabase } from '@/lib/supabase';
import { toDataRoom, toFolder, toFileEntry } from '@/lib/mappers';
import type { DataRoom, Folder, FileEntry } from '@/types';

// ---------------------------------------------------------------------------
// DataRoom
// ---------------------------------------------------------------------------

export async function getAllDataRooms(): Promise<DataRoom[]> {
  const { data, error } = await supabase
    .from('data_rooms')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toDataRoom);
}

export async function getDataRoom(id: string): Promise<DataRoom | undefined> {
  const { data, error } = await supabase
    .from('data_rooms')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toDataRoom(data) : undefined;
}

export async function getDataRoomByName(name: string): Promise<DataRoom | undefined> {
  const { data, error } = await supabase
    .from('data_rooms')
    .select('*')
    .ilike('name', name)
    .maybeSingle();
  if (error) throw error;
  return data ? toDataRoom(data) : undefined;
}

export async function createDataRoom(name: string): Promise<DataRoom> {
  const rootFolderId = crypto.randomUUID();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Insert data room
  const { error: roomError } = await supabase.from('data_rooms').insert({
    id,
    name,
    root_folder_id: rootFolderId,
    created_at: now,
    updated_at: now,
  });
  if (roomError) throw roomError;

  // Insert root folder
  const { error: folderError } = await supabase.from('folders').insert({
    id: rootFolderId,
    data_room_id: id,
    parent_id: null,
    name: 'Root',
    created_at: now,
    updated_at: now,
  });
  if (folderError) throw folderError;

  return { id, name, rootFolderId, createdAt: now, updatedAt: now };
}

export async function updateDataRoom(id: string, name: string): Promise<DataRoom> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('data_rooms')
    .update({ name, updated_at: now })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return toDataRoom(data);
}

export async function setDataRoomPassword(
  id: string,
  passwordHash: string | null,
): Promise<DataRoom> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('data_rooms')
    .update({ password_hash: passwordHash, updated_at: now })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return toDataRoom(data);
}

export async function deleteDataRoom(id: string): Promise<void> {
  // Collect storage paths for all files in this room so we can remove blobs
  const { data: files } = await supabase
    .from('files')
    .select('storage_path')
    .eq('data_room_id', id);

  const paths = (files ?? []).map((f) => f.storage_path as string).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from('files').remove(paths);
  }

  // Cascade delete via foreign keys handles folders + files rows
  const { error } = await supabase.from('data_rooms').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

export async function getFoldersByParent(
  dataRoomId: string,
  parentId: string | null,
): Promise<Folder[]> {
  let query = supabase
    .from('folders')
    .select('*')
    .eq('data_room_id', dataRoomId);

  if (parentId === null) {
    query = query.is('parent_id', null);
  } else {
    query = query.eq('parent_id', parentId);
  }

  const { data, error } = await query.order('name');
  if (error) throw error;
  return (data ?? []).map(toFolder);
}

export async function getAllFoldersInDataRoom(dataRoomId: string): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('data_room_id', dataRoomId)
    .order('name');
  if (error) throw error;
  return (data ?? []).map(toFolder);
}

export async function getFolder(id: string): Promise<Folder | undefined> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toFolder(data) : undefined;
}

export async function createFolder(
  dataRoomId: string,
  parentId: string,
  name: string,
): Promise<Folder> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const { error } = await supabase.from('folders').insert({
    id,
    data_room_id: dataRoomId,
    parent_id: parentId,
    name,
    created_at: now,
    updated_at: now,
  });
  if (error) throw error;

  return { id, dataRoomId, parentId, name, createdAt: now, updatedAt: now };
}

export async function updateFolder(id: string, name: string): Promise<Folder> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('folders')
    .update({ name, updated_at: now })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return toFolder(data);
}

export async function deleteFolder(id: string): Promise<void> {
  // Collect all descendant folder IDs recursively
  const folderIds: string[] = [id];
  let queue = [id];

  while (queue.length > 0) {
    const { data: children } = await supabase
      .from('folders')
      .select('id')
      .in('parent_id', queue);

    const childIds = (children ?? []).map((c) => c.id as string);
    folderIds.push(...childIds);
    queue = childIds;
  }

  // Collect storage paths of all files in those folders
  const { data: files } = await supabase
    .from('files')
    .select('storage_path')
    .in('folder_id', folderIds);

  const paths = (files ?? []).map((f) => f.storage_path as string).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from('files').remove(paths);
  }

  // Delete the root folder — cascade will remove children + files rows
  const { error } = await supabase.from('folders').delete().eq('id', id);
  if (error) throw error;
}

export async function getFolderPath(folderId: string): Promise<Folder[]> {
  const path: Folder[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const { data, error }: { data: Record<string, unknown> | null; error: unknown } = await supabase
      .from('folders')
      .select('*')
      .eq('id', currentId)
      .maybeSingle();
    if (error) throw error;
    if (!data) break;
    path.unshift(toFolder(data));
    currentId = (data.parent_id as string | null);
  }

  return path;
}

export async function getDescendantCounts(
  folderId: string,
): Promise<{ folders: number; files: number }> {
  const { data, error } = await supabase.rpc('get_descendant_counts', {
    root_id: folderId,
  });
  if (error) throw error;

  // RPC returns an array with one row
  const row = Array.isArray(data) ? data[0] : data;
  return {
    folders: Number(row?.folder_count ?? 0),
    files: Number(row?.file_count ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export async function getFilesByFolder(
  dataRoomId: string,
  folderId: string,
): Promise<FileEntry[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('data_room_id', dataRoomId)
    .eq('folder_id', folderId)
    .order('name');
  if (error) throw error;
  return (data ?? []).map(toFileEntry);
}

export async function getFile(id: string): Promise<FileEntry | undefined> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toFileEntry(data) : undefined;
}

export async function uploadFile(
  dataRoomId: string,
  folderId: string,
  file: File,
  uniqueName: string,
): Promise<FileEntry> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const ext = file.name.split('.').pop() ?? '';
  const storagePath = `${dataRoomId}/${id}.${ext}`;

  // Upload blob to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('files')
    .upload(storagePath, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  // Insert file metadata row
  const { error: insertError } = await supabase.from('files').insert({
    id,
    data_room_id: dataRoomId,
    folder_id: folderId,
    name: uniqueName,
    extension: ext,
    mime_type: file.type,
    size: file.size,
    storage_path: storagePath,
    created_at: now,
    updated_at: now,
  });
  if (insertError) {
    // Rollback storage upload on DB insert failure
    await supabase.storage.from('files').remove([storagePath]);
    throw insertError;
  }

  return {
    id,
    dataRoomId,
    folderId,
    name: uniqueName,
    extension: ext,
    mimeType: file.type,
    size: file.size,
    storagePath,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getFileBlob(storagePath: string): Promise<ArrayBuffer | undefined> {
  const { data, error } = await supabase.storage.from('files').download(storagePath);
  if (error) throw error;
  if (!data) return undefined;
  return data.arrayBuffer();
}

export async function updateFile(id: string, name: string): Promise<FileEntry> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('files')
    .update({ name, updated_at: now })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return toFileEntry(data);
}

export async function deleteFile(id: string): Promise<void> {
  // Get storage path before deleting the row
  const { data: file } = await supabase
    .from('files')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle();

  if (file?.storage_path) {
    await supabase.storage.from('files').remove([file.storage_path]);
  }

  const { error } = await supabase.from('files').delete().eq('id', id);
  if (error) throw error;
}

export async function moveFile(fileId: string, targetFolderId: string): Promise<FileEntry> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('files')
    .update({ folder_id: targetFolderId, updated_at: now })
    .eq('id', fileId)
    .select()
    .single();
  if (error) throw error;
  return toFileEntry(data);
}

export async function moveFolder(folderId: string, targetParentId: string): Promise<Folder> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('folders')
    .update({ parent_id: targetParentId, updated_at: now })
    .eq('id', folderId)
    .select()
    .single();
  if (error) throw error;
  return toFolder(data);
}

export async function getRoomStats(
  rooms: DataRoom[],
): Promise<Record<string, { folders: number; files: number }>> {
  const result: Record<string, { folders: number; files: number }> = {};
  await Promise.all(
    rooms.map(async (room) => {
      result[room.id] = await getDescendantCounts(room.rootFolderId);
    }),
  );
  return result;
}

export async function searchInDataRoom(
  dataRoomId: string,
  query: string,
): Promise<{ folders: Folder[]; files: FileEntry[] }> {
  const pattern = `%${query}%`;

  const [foldersRes, filesRes] = await Promise.all([
    supabase
      .from('folders')
      .select('*')
      .eq('data_room_id', dataRoomId)
      .not('parent_id', 'is', null)
      .ilike('name', pattern),
    supabase
      .from('files')
      .select('*')
      .eq('data_room_id', dataRoomId)
      .ilike('name', pattern),
  ]);

  if (foldersRes.error) throw foldersRes.error;
  if (filesRes.error) throw filesRes.error;

  return {
    folders: (foldersRes.data ?? []).map(toFolder),
    files: (filesRes.data ?? []).map(toFileEntry),
  };
}
