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
  X,
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
      <div className="relative group/search">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted/50 group-focus-within/search:text-primary/60 transition-colors" />
        <Input
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          placeholder="Filter..."
          className="h-8 w-44 pl-8 pr-7 text-xs bg-white/[0.02] border-white/[0.05] focus:border-primary/30 focus:bg-white/[0.04] transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => dispatch(setSearchQuery(''))}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted/40 hover:text-foreground transition-colors p-0.5 rounded hover:bg-white/[0.06]"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="toolbar-group">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 text-xs text-muted/70 hover:text-foreground px-2 py-1 rounded-lg hover:bg-white/[0.06] transition-all duration-150">
              <ArrowUpDown size={13} />
              <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            {(Object.keys(sortLabels) as SortBy[]).map((key) => (
              <DropdownMenuItem
                key={key}
                onClick={() => dispatch(setSortBy(key))}
                className={sortBy === key ? 'bg-primary/10 text-primary' : ''}
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
      </div>

      {/* View mode */}
      <div className="toolbar-group">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && dispatch(setViewMode(v as 'grid' | 'list'))}
        >
          <ToggleGroupItem value="grid" aria-label="Grid view" className="h-7 w-7 p-0">
            <LayoutGrid size={13} />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="h-7 w-7 p-0">
            <List size={13} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="h-5 w-[1px] bg-gradient-to-b from-transparent via-white/[0.08] to-transparent hidden sm:block mx-1" />

      {/* Actions */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={onNewFolder}
      >
        <FolderPlus size={14} />
        <span className="hidden sm:inline">New Folder</span>
      </Button>
      <Button
        size="sm"
        className="h-8 text-xs"
        onClick={() => fileInputRef.current?.click()}
      >
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
