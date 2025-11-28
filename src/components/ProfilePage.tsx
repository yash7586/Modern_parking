import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, QrCode as QrCodeIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { QRCodeDisplay } from './QRCodeDisplay';
import { PaymentGateway } from './PaymentGateway';
import { projectId } from '../utils/supabase/info.tsx';

interface Booking {
  id: string;
  parkingId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: string;
  qrCode: string;
  createdAt: string;
}

interface ProfilePageProps {
  accessToken: string;
  onBack: () => void;
}

export function ProfilePage({ accessToken, onBack }: ProfilePageProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [extendingBooking, setExtendingBooking] = useState<Booking | null>(null);
  const [showExtendPayment, setShowExtendPayment] = useState(false);
  const [extensionHours, setExtensionHours] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9c2e4e69/bookings`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings);
      } else {
        toast.error(`Failed to fetch bookings: ${data.error}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendTime = (booking: Booking) => {
    setExtendingBooking(booking);
    setShowExtendPayment(true);
  };

  const handleExtensionPaymentSuccess = async (paymentId: string) => {
    if (!extendingBooking) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9c2e4e69/extend-booking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            bookingId: extendingBooking.id,
            additionalHours: extensionHours,
            amount: 50 * extensionHours, // Assuming ₹50/hour
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Booking extended successfully!');
        fetchBookings();
        setShowExtendPayment(false);
        setExtendingBooking(null);
      } else {
        toast.error(`Extension failed: ${data.error}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleExtensionPaymentCancel = () => {
    setShowExtendPayment(false);
    setExtendingBooking(null);
  };

  const liveBookings = bookings.filter((b) => {
    const endTime = new Date(b.endTime);
    return b.status === 'active' && endTime > new Date();
  });

  const pastBookings = bookings.filter((b) => {
    const endTime = new Date(b.endTime);
    return b.status !== 'active' || endTime <= new Date();
  });

  if (showQR && selectedBooking) {
    return (
      <QRCodeDisplay
        booking={selectedBooking}
        onBack={() => {
          setShowQR(false);
          setSelectedBooking(null);
        }}
      />
    );
  }

  if (showExtendPayment && extendingBooking) {
    return (
      <PaymentGateway
        amount={50 * extensionHours}
        onSuccess={handleExtensionPaymentSuccess}
        onCancel={handleExtensionPaymentCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="p-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Button>

          <h2 className="mb-6">My Bookings</h2>

          <Tabs defaultValue="live">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="live">Live Bookings ({liveBookings.length})</TabsTrigger>
              <TabsTrigger value="past">Past Bookings ({pastBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="live">
              {loading ? (
                <p className="text-center text-gray-500 py-8">Loading bookings...</p>
              ) : liveBookings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No active bookings</p>
              ) : (
                <div className="space-y-4">
                  {liveBookings.map((booking) => (
                    <Card key={booking.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="mb-2">Booking #{booking.id.slice(0, 8)}</h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>
                                {new Date(booking.startTime).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={16} />
                              <span>
                                {new Date(booking.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={16} />
                              <span>Slot: {booking.slotId.split('_').pop()}</span>
                            </div>
                          </div>
                          <p className="mt-3 text-green-600">Amount Paid: ₹{booking.amount}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowQR(true);
                            }}
                            className="whitespace-nowrap"
                          >
                            <QrCodeIcon size={16} className="mr-2" />
                            View QR Code
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleExtendTime(booking)}
                          >
                            Extend Time
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {loading ? (
                <p className="text-center text-gray-500 py-8">Loading bookings...</p>
              ) : pastBookings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No past bookings</p>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} className="p-6 opacity-75">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="mb-2">Booking #{booking.id.slice(0, 8)}</h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>
                                {new Date(booking.startTime).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={16} />
                              <span>
                                {new Date(booking.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={16} />
                              <span>Slot: {booking.slotId.split('_').pop()}</span>
                            </div>
                          </div>
                          <p className="mt-3 text-gray-600">Amount Paid: ₹{booking.amount}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Completed
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
