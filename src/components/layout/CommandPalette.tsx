import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Folder as FolderIcon, Database } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCommandOpen } from '@/store/slices/uiSlice';
import { navigateToFolder, setViewingFile } from '@/store/slices/explorerSlice';
import * as storage from '@/services/storage';
import type { Folder, FileEntry } from '@/types';

export default function CommandPalette() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const open = useAppSelector((s) => s.ui.commandOpen);
  const currentDataRoom = useAppSelector((s) => s.explorer.currentDataRoom);
  const dataRooms = useAppSelector((s) => s.dataRooms.rooms);

  const [searchResults, setSearchResults] = useState<{
    folders: Folder[];
    files: FileEntry[];
  }>({ folders: [], files: [] });
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dispatch(setCommandOpen(!open));
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [dispatch, open]);

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value);
      if (!currentDataRoom || value.trim().length < 2) {
        setSearchResults({ folders: [], files: [] });
        return;
      }
      const results = await storage.searchInDataRoom(currentDataRoom.id, value.trim());
      setSearchResults(results);
    },
    [currentDataRoom]
  );

  const handleSelectFolder = (folder: Folder) => {
    dispatch(setCommandOpen(false));
    dispatch(navigateToFolder(folder.id));
  };

  const handleSelectFile = (file: FileEntry) => {
    dispatch(setCommandOpen(false));
    dispatch(navigateToFolder(file.folderId));
    dispatch(setViewingFile(file));
  };

  const handleSelectDataRoom = (id: string) => {
    dispatch(setCommandOpen(false));
    navigate(`/dataroom/${id}`);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(v) => {
        dispatch(setCommandOpen(v));
        if (!v) {
          setQuery('');
          setSearchResults({ folders: [], files: [] });
        }
      }}
    >
      <CommandInput
        placeholder={
          currentDataRoom
            ? `Search in ${currentDataRoom.name}...`
            : 'Search data rooms...'
        }
        value={query}
        onValueChange={handleSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {!currentDataRoom && dataRooms.length > 0 && (
          <CommandGroup heading="Data Rooms">
            {dataRooms.map((room) => (
              <CommandItem
                key={room.id}
                onSelect={() => handleSelectDataRoom(room.id)}
              >
                <Database className="text-primary" />
                <span>{room.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {searchResults.folders.length > 0 && (
          <CommandGroup heading="Folders">
            {searchResults.folders.slice(0, 10).map((folder) => (
              <CommandItem
                key={folder.id}
                onSelect={() => handleSelectFolder(folder)}
              >
                <FolderIcon className="text-amber-400" />
                <span>{folder.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {searchResults.files.length > 0 && (
          <CommandGroup heading="Files">
            {searchResults.files.slice(0, 10).map((file) => (
              <CommandItem
                key={file.id}
                onSelect={() => handleSelectFile(file)}
              >
                <FileText className="text-rose-400" />
                <span>
                  {file.name}.{file.extension}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
