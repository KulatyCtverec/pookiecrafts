import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { CartIcon } from '../cart/CartIcon';
import { useState } from 'react';
import { cn } from '../ui/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];
  
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-3xl text-primary">PookieCrafts</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-accent transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-2">
            <CartIcon />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          mobileMenuOpen ? 'max-h-96 pb-6' : 'max-h-0'
        )}>
          <div className="flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-accent transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
