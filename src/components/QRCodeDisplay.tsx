import { useEffect, useRef } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import QRCode from 'qrcode';

interface Booking {
  id: string;
  qrCode: string;
  startTime: string;
  endTime: string;
  slotId: string;
  amount: number;
}

interface QRCodeDisplayProps {
  booking: Booking;
  onBack: () => void;
}

export function QRCodeDisplay({ booking, onBack }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        booking.qrCode,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR Code generation error:', error);
        }
      );
    }
  }, [booking.qrCode]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `parking-qr-${booking.id}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2">Booking Confirmed!</h2>
          <p className="text-sm text-gray-600">Your unique QR code has been generated</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-inner mb-6">
          <div className="flex justify-center">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-4 space-y-2 text-sm border border-blue-200">
          <h3 className="text-center mb-3 text-blue-900">Booking Details</h3>
          <div className="flex justify-between">
            <span className="text-gray-600">Booking ID:</span>
            <span className="font-mono text-xs">{booking.id.slice(0, 16)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Slot Number:</span>
            <span className="font-semibold text-blue-600">#{booking.slotId.split('_').pop()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Start Time:</span>
            <span className="text-xs">{new Date(booking.startTime).toLocaleString('en-IN', { 
              day: '2-digit', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">End Time:</span>
            <span className="text-xs">{new Date(booking.endTime).toLocaleString('en-IN', { 
              day: '2-digit', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
          <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="text-lg text-green-600">₹{booking.amount}</span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 mb-6 border border-blue-200">
          <p className="text-xs text-center text-blue-800">
            ✓ This QR code contains encrypted booking information<br/>
            ✓ Valid only for your booked time slot<br/>
            ✓ Single-use verification code included
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleDownload} variant="outline" className="w-full">
            <Download size={16} className="mr-2" />
            Download QR Code
          </Button>

          <Button onClick={onBack} className="w-full">
            View All Bookings
          </Button>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-center text-yellow-800">
              <strong>Important:</strong> Show this QR code at the parking entrance and exit
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
