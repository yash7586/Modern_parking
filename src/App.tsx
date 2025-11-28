import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SignupPage } from './components/SignupPage';
import { MainPage } from './components/MainPage';
import { ParkingDetailPage } from './components/ParkingDetailPage';
import { BookingPage } from './components/BookingPage';
import { ProfilePage } from './components/ProfilePage';
import { Toaster } from './components/ui/sonner';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info.tsx';

interface Parking {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  totalSlots: number;
  pricePerHour: number;
}

type Page = 'home' | 'signup' | 'profile' | 'parking-detail' | 'booking' | 'about';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      setIsLoggedIn(true);
      setAccessToken(data.session.access_token);
      setUserName(data.session.user?.user_metadata?.name || data.session.user?.email?.split('@')[0] || 'User');
    }
  };

  const handleLoginSuccess = (token: string, name: string) => {
    setAccessToken(token);
    setUserName(name);
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setAccessToken('');
    setUserName('');
    setCurrentPage('home');
  };

  const handleNavigate = (page: string) => {
    if (page === 'profile' && !isLoggedIn) {
      setCurrentPage('signup');
      return;
    }
    setCurrentPage(page as Page);
  };

  const handleSelectParking = (parking: Parking) => {
    setSelectedParking(parking);
    setCurrentPage('parking-detail');
  };

  const handleProceedToBooking = (slotId: string, parking: Parking) => {
    if (!isLoggedIn) {
      setCurrentPage('signup');
      return;
    }
    setSelectedSlotId(slotId);
    setSelectedParking(parking);
    setCurrentPage('booking');
  };

  const handleBookingComplete = (booking: any) => {
    setCurrentPage('profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        userName={userName}
      />

      {currentPage === 'home' && (
        <MainPage
          onSelectParking={handleSelectParking}
          accessToken={accessToken}
        />
      )}

      {currentPage === 'signup' && (
        <SignupPage onLoginSuccess={handleLoginSuccess} />
      )}

      {currentPage === 'profile' && isLoggedIn && (
        <ProfilePage
          accessToken={accessToken}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'parking-detail' && selectedParking && (
        <ParkingDetailPage
          parking={selectedParking}
          onBack={() => setCurrentPage('home')}
          onProceedToBooking={handleProceedToBooking}
        />
      )}

      {currentPage === 'booking' && selectedParking && selectedSlotId && isLoggedIn && (
        <BookingPage
          parking={selectedParking}
          slotId={selectedSlotId}
          accessToken={accessToken}
          onBack={() => setCurrentPage('parking-detail')}
          onBookingComplete={handleBookingComplete}
        />
      )}

      {currentPage === 'about' && (
        <div className="container mx-auto p-8 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="mb-4">About ParkMe</h1>
            <p className="mb-4">
              ParkMe is your convenient parking solution across India. Find, book, and manage parking spots with ease.
            </p>
            <h3 className="mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Real-time parking availability</li>
              <li>Interactive slot selection</li>
              <li>Secure online payment</li>
              <li>QR code based entry/exit</li>
              <li>Extend parking time</li>
              <li>Booking history</li>
            </ul>
            <button
              onClick={() => setCurrentPage('home')}
              className="mt-6 text-blue-600 hover:underline"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
    </div>
  );
}
