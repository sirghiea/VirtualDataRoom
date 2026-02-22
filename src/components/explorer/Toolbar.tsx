import { useRef } from 'react';
import {
  FolderPlus,
  Upload,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setViewMode,
  setSortBy,
  toggleSortDirection,
  setSearchQuery,
  type SortBy,
} from '@/store/slices/uiSlice';

interface ToolbarProps {
  onNewFolder: () => void;
  onUploadFiles: (files: File[]) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const sortLabels: Record<SortBy, string> = {
  name: 'Name',
  date: 'Date',
  size: 'Size',
  type: 'Type',
};

export default function Toolbar({ onNewFolder, onUploadFiles }: ToolbarProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { viewMode, sortBy, sortDirection, searchQuery } = useAppSelector((s) => s.ui);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    e.target.value = '';

    const validFiles: File[] = [];
    for (const file of Array.from(fileList)) {
      if (file.type !== 'application/pdf') {
        toast.error(`"${file.name}" is not a PDF file`);
        continue;
      }
      if (file.size === 0) {
        toast.error(`"${file.name}" is empty`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 50MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onUploadFiles(validFiles);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          placeholder="Filter..."
          className="h-8 w-40 pl-8 text-xs"
        />
      </div>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <ArrowUpDown size={14} />
            <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          {(Object.keys(sortLabels) as SortBy[]).map((key) => (
            <DropdownMenuItem
              key={key}
              onClick={() => dispatch(setSortBy(key))}
              className={sortBy === key ? 'bg-white/10' : ''}
            >
              {sortLabels[key]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => dispatch(toggleSortDirection())}>
            {sortDirection === 'asc' ? (
              <>
                <ArrowUp size={14} />
                Ascending
              </>
            ) : (
              <>
                <ArrowDown size={14} />
                Descending
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View mode */}
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(v) => v && dispatch(setViewMode(v as 'grid' | 'list'))}
      >
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <LayoutGrid size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view">
          <List size={14} />
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="h-5 w-px bg-white/10 hidden sm:block" />

      {/* Actions */}
      <Button variant="outline" size="sm" className="h-8" onClick={onNewFolder}>
        <FolderPlus size={14} />
        <span className="hidden sm:inline">New Folder</span>
      </Button>
      <Button size="sm" className="h-8" onClick={() => fileInputRef.current?.click()}>
        <Upload size={14} />
        <span className="hidden sm:inline">Upload PDF</span>
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
