import { Link, useLocation } from 'react-router-dom';
import { Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { setCommandOpen } from '@/store/slices/uiSlice';

export default function Header() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.04]">
      {/* Gradient accent line at top */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="glass-strong flex h-14 items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
            <Shield size={18} className="text-primary" />
            <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-foreground leading-tight">
              Virtual Data Room
            </span>
            <span className="text-[10px] text-muted font-medium tracking-widest uppercase">
              Secure Documents
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {!isHome && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-muted hover:text-foreground bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] h-8 px-3 transition-all duration-200"
              onClick={() => dispatch(setCommandOpen(true))}
            >
              <Search size={13} className="text-muted" />
              <span className="text-xs text-muted">Search...</span>
              <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 font-mono text-[10px] font-medium text-muted/80">
                <span className="text-[11px]">&#8984;</span>K
              </kbd>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
