import { useState } from 'react';
import { Menu, User, X } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  userName?: string;
}

export function Header({ onNavigate, isLoggedIn, onLogout, userName }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowMenu(!showMenu)} className="lg:hidden">
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 
              className="text-2xl cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              ParkMe
            </h1>
            <nav className="hidden lg:flex gap-6 ml-8">
              <button onClick={() => onNavigate('home')} className="hover:text-blue-200">
                Home
              </button>
              <button onClick={() => onNavigate('about')} className="hover:text-blue-200">
                About
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <Button 
                onClick={() => onNavigate('signup')}
                variant="outline"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Sign Up
              </Button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 hover:text-blue-200"
                >
                  <User size={20} />
                  <span>{userName || 'Profile'}</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      My Bookings
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {showMenu && (
          <nav className="lg:hidden mt-4 flex flex-col gap-3">
            <button onClick={() => {
              onNavigate('home');
              setShowMenu(false);
            }} className="text-left hover:text-blue-200">
              Home
            </button>
            <button onClick={() => {
              onNavigate('about');
              setShowMenu(false);
            }} className="text-left hover:text-blue-200">
              About
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
