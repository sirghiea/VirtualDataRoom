import { Link, useLocation } from 'react-router-dom';
import { Shield, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { setCommandOpen } from '@/store/slices/uiSlice';

export default function Header() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.04]">
      {/* Animated gradient accent line */}
      <div className="h-[2px] bg-gradient-to-r from-primary/0 via-primary/60 to-blue-500/0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" style={{ backgroundSize: '200% 100%' }} />
      </div>

      <div className="glass-strong flex h-14 items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-3.5 group">
          {/* Logo with layered glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/25 rounded-xl blur-xl opacity-0 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/25 group-hover:ring-primary/50 transition-all duration-400 group-hover:shadow-lg group-hover:shadow-primary/25">
              <Shield size={20} className="text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground leading-tight group-hover:text-white transition-colors duration-200">
              Virtual Data Room
            </span>
            <span className="text-[10px] text-muted/60 font-medium tracking-[0.2em] uppercase flex items-center gap-1">
              <Sparkles size={8} className="text-primary/50" />
              Secure Documents
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {!isHome && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-muted hover:text-foreground bg-white/[0.02] border-white/[0.06] hover:border-primary/20 hover:bg-white/[0.04] h-8 px-3 transition-all duration-200 group/search"
              onClick={() => dispatch(setCommandOpen(true))}
            >
              <Search size={13} className="text-muted group-hover/search:text-primary/70 transition-colors" />
              <span className="text-xs text-muted">Search...</span>
              <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 font-mono text-[10px] font-medium text-muted/60">
                <span className="text-[11px]">&#8984;</span>K
              </kbd>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
