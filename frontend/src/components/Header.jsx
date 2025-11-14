import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { ShoppingCart, Package, Home, LogOut, User, MessageSquare } from 'lucide-react';

function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">
            <Link to="/" className="hover:text-primary transition-colors">
              Smart Grocery
            </Link>
          </h1>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>

          {user ? (
            <>
              <Link
                to="/products"
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <Package className="h-4 w-4" />
                Products
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <User className="h-4 w-4" />
                Mon Profil
              </Link>
              <div className="flex items-center gap-3 ml-2 pl-3 border-l">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
