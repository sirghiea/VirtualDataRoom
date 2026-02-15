import { ChevronRight } from 'lucide-react';
import type { Folder } from '@/types';

interface BreadcrumbProps {
  items: Folder[];
  onNavigate: (folderId: string) => void;
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  if (items.length === 0) return null;

  // Truncate middle segments if too many
  const maxVisible = 4;
  let displayItems = items;
  let truncated = false;

  if (items.length > maxVisible) {
    displayItems = [items[0], items[items.length - 2], items[items.length - 1]];
    truncated = true;
  }

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto">
      {displayItems.map((item, i) => (
        <span key={item.id} className="flex items-center gap-1 shrink-0">
          {i > 0 && <ChevronRight size={14} className="text-muted-foreground" />}
          {truncated && i === 1 && (
            <>
              <span className="text-muted-foreground">...</span>
              <ChevronRight size={14} className="text-muted-foreground" />
            </>
          )}
          {i === displayItems.length - 1 ? (
            <span className="font-medium text-foreground">
              {item.parentId === null ? 'Root' : item.name}
            </span>
          ) : (
            <button
              onClick={() => onNavigate(item.id)}
              className="text-muted hover:text-foreground transition-colors"
            >
              {item.parentId === null ? 'Root' : item.name}
            </button>
          )}
        </span>
      ))}
    </nav>
  );
}
