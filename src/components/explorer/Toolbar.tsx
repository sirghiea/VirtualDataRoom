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
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted/60" />
        <Input
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          placeholder="Filter..."
          className="h-8 w-44 pl-8 pr-7 text-xs bg-white/[0.02] border-white/[0.06] focus:border-primary/30 focus:bg-white/[0.04] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => dispatch(setSearchQuery(''))}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted/50 hover:text-foreground transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="toolbar-group">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground px-2 py-1 rounded-md hover:bg-white/[0.06] transition-colors">
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

      <div className="h-5 w-[1px] bg-gradient-to-b from-transparent via-white/[0.08] to-transparent hidden sm:block mx-0.5" />

      {/* Actions */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
        onClick={onNewFolder}
      >
        <FolderPlus size={14} />
        <span className="hidden sm:inline">New Folder</span>
      </Button>
      <Button
        size="sm"
        className="h-8 text-xs shadow-md shadow-primary/15 hover:shadow-primary/25 transition-shadow"
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
