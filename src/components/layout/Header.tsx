import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Header() {
  return (
    <header className="glass sticky top-0 z-40 flex h-14 items-center px-4 lg:px-6">
      <Link to="/" className="flex items-center gap-2.5 font-semibold text-foreground">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <Shield size={18} className="text-primary" />
        </div>
        <span className="text-base tracking-tight">Virtual Data Room</span>
      </Link>
    </header>
  );
}
