import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lock,
  Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  setHomeSearchQuery,
  setHomeSortBy,
  toggleHomeSortDirection,
  setHomeFilter,
  type HomeSortBy,
  type HomeFilter,
} from '@/store/slices/uiSlice';

const sortLabels: Record<HomeSortBy, string> = {
  name: 'Name',
  created: 'Created',
  updated: 'Updated',
};

interface HomeToolbarProps {
  onCreateNew: () => void;
}

export default function HomeToolbar({ onCreateNew }: HomeToolbarProps) {
  const dispatch = useAppDispatch();
  const { homeSearchQuery, homeSortBy, homeSortDirection, homeFilter } =
    useAppSelector((s) => s.ui);

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      {/* Search */}
      <div className="relative group/search">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted/50 group-focus-within/search:text-primary/60 transition-colors"
        />
        <Input
          value={homeSearchQuery}
          onChange={(e) => dispatch(setHomeSearchQuery(e.target.value))}
          placeholder="Search rooms..."
          className="h-8 w-52 pl-8 pr-7 text-xs bg-white/[0.02] border-white/[0.05] focus:border-primary/30 focus:bg-white/[0.04] transition-all duration-200"
        />
        {homeSearchQuery && (
          <button
            onClick={() => dispatch(setHomeSearchQuery(''))}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted/40 hover:text-foreground transition-colors p-0.5 rounded hover:bg-white/[0.06]"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="toolbar-group">
        <ToggleGroup
          type="single"
          value={homeFilter}
          onValueChange={(v) => v && dispatch(setHomeFilter(v as HomeFilter))}
        >
          <ToggleGroupItem value="all" className="h-7 px-2.5 text-[11px]">
            All
          </ToggleGroupItem>
          <ToggleGroupItem
            value="protected"
            className="h-7 px-2.5 text-[11px]"
          >
            <Lock size={11} className="mr-1" />
            Protected
          </ToggleGroupItem>
          <ToggleGroupItem
            value="unprotected"
            className="h-7 px-2.5 text-[11px]"
          >
            Open
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Sort */}
      <div className="toolbar-group">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 text-xs text-muted/70 hover:text-foreground px-2 py-1 rounded-lg hover:bg-white/[0.06] transition-all duration-150">
              <ArrowUpDown size={13} />
              <span className="hidden sm:inline">
                {sortLabels[homeSortBy]}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            {(Object.keys(sortLabels) as HomeSortBy[]).map((key) => (
              <DropdownMenuItem
                key={key}
                onClick={() => dispatch(setHomeSortBy(key))}
                className={
                  homeSortBy === key ? 'bg-primary/10 text-primary' : ''
                }
              >
                {sortLabels[key]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => dispatch(toggleHomeSortDirection())}
            >
              {homeSortDirection === 'asc' ? (
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* New Data Room */}
      <Button size="sm" className="h-8 text-xs" onClick={onCreateNew}>
        <Plus size={14} />
        <span className="hidden sm:inline">New Data Room</span>
      </Button>
    </div>
  );
}
