import { Link, useLocation } from 'react-router-dom';
import { Film, Settings } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Film className="h-7 w-7 text-primary" />
          <span className="font-display text-2xl tracking-wider text-foreground">
            Uni <span className="text-gradient-cinema">Movies X</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
              isAdmin ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
