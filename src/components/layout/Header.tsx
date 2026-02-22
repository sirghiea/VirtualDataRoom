import { Link } from 'react-router-dom';
import { Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { setCommandOpen } from '@/store/slices/uiSlice';

export default function Header() {
  const dispatch = useAppDispatch();

  return (
    <header className="glass-strong sticky top-0 z-40 flex h-14 items-center justify-between px-4 lg:px-6">
      <Link to="/" className="flex items-center gap-2.5 font-semibold text-foreground">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <Shield size={18} className="text-primary" />
        </div>
        <span className="text-base tracking-tight">Virtual Data Room</span>
      </Link>

      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-2 text-muted"
        onClick={() => dispatch(setCommandOpen(true))}
      >
        <Search size={14} />
        <span className="text-xs">Search...</span>
        <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </Button>
    </header>
  );
}
