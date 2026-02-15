import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background px-4 lg:px-6">
      <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
        <Shield size={22} className="text-primary" />
        <span className="text-base">Virtual Data Room</span>
      </Link>
    </header>
  );
}
