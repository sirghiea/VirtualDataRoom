import { ChevronRight, Home } from 'lucide-react';
import type { Folder } from '@/types';

interface BreadcrumbProps {
  items: Folder[];
  onNavigate: (folderId: string) => void;
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  if (items.length === 0) return null;

  const maxVisible = 4;
  let displayItems = items;
  let truncated = false;

  if (items.length > maxVisible) {
    displayItems = [items[0], items[items.length - 2], items[items.length - 1]];
    truncated = true;
  }

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto min-w-0">
      {displayItems.map((item, i) => {
        const isRoot = item.parentId === null;
        const isLast = i === displayItems.length - 1;
        const label = isRoot ? 'Root' : item.name;

        return (
          <span key={item.id} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight size={13} className="text-muted/40 shrink-0" />}
            {truncated && i === 1 && (
              <>
                <span className="text-muted/40 text-xs shrink-0">...</span>
                <ChevronRight size={13} className="text-muted/40 shrink-0" />
              </>
            )}
            {isLast ? (
              <span
                className="font-semibold text-foreground text-sm truncate max-w-[200px] block"
                title={label}
              >
                {label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(item.id)}
                className="text-muted hover:text-foreground transition-colors duration-150 text-sm flex items-center gap-1 min-w-0"
                title={label}
              >
                {isRoot && <Home size={13} className="text-muted/60 shrink-0" />}
                <span className="truncate max-w-[150px]">{label}</span>
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
