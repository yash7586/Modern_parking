import { useState } from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { PaymentGateway } from './PaymentGateway';
import { QRCodeDisplay } from './QRCodeDisplay';

interface Parking {
  id: string;
  name: string;
  address: string;
  pricePerHour: number;
}

interface BookingPageProps {
  parking: Parking;
  slotId: string;
  accessToken: string;
  onBack: () => void;
  onBookingComplete: (booking: any) => void;
}

export function BookingPage({ parking, slotId, accessToken, onBack, onBookingComplete }: BookingPageProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState('2');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [showPayment, setShowPayment] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const calculateAmount = () => {
    return parking.pricePerHour * parseInt(duration);
  };

  const handleProceedToPayment = () => {
    if (!date || !startTime || !duration) {
      toast.error('Please fill in all booking details');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      // Create booking
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + parseInt(duration));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9c2e4e69/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            parkingId: parking.id,
            slotId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            amount: calculateAmount(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment successful! Generating your QR code...');
        setCompletedBooking(data.booking);
        setShowQRCode(true);
      } else {
        toast.error(`Booking failed: ${data.error}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleQRCodeBack = () => {
    onBookingComplete(completedBooking);
  };

  if (showQRCode && completedBooking) {
    return (
      <QRCodeDisplay
        booking={completedBooking}
        onBack={handleQRCodeBack}
      />
    );
  }

  if (showPayment) {
    return (
      <PaymentGateway
        amount={calculateAmount()}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>

          <h2 className="mb-2">Complete Your Booking</h2>
          <p className="text-gray-600 mb-6">{parking.name}</p>

          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                <Calendar size={18} />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time" className="flex items-center gap-2 mb-2">
                  <Clock size={18} />
                  Start Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="period" className="mb-2 block">Period</Label>
                <Select value={period} onValueChange={(value: 'AM' | 'PM') => setPeriod(value)}>
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <Label htmlFor="duration" className="mb-2 block">Duration (hours)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="3">3 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Booking Summary */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <h3 className="mb-2">Booking Summary</h3>
              <div className="flex justify-between text-sm">
                <span>Price per hour:</span>
                <span>₹{parking.pricePerHour}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Duration:</span>
                <span>{duration} hours</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between">
                <span>Total Amount:</span>
                <span className="text-xl text-blue-600">₹{calculateAmount()}</span>
              </div>
            </div>

            {/* Payment Button */}
            <Button onClick={handleProceedToPayment} className="w-full">
              Proceed to Payment
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { projectId } from '../utils/supabase/info.tsx';
