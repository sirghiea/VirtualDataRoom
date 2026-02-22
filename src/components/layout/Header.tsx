import { Link } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.04]">
      {/* Animated gradient accent line */}
      <div className="h-[2px] bg-gradient-to-r from-primary/0 via-primary/60 to-blue-500/0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" style={{ backgroundSize: '200% 100%' }} />
      </div>

      <div className="flex h-14 items-center px-5 lg:px-8 bg-[#08080e]/95 backdrop-blur-xl">
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
      </div>
    </header>
  );
}
