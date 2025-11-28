import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

interface Slot {
  id: string;
  parkingId: string;
  slotNumber: number;
  status: 'available' | 'booked';
}

interface Parking {
  id: string;
  name: string;
  address: string;
  totalSlots: number;
  pricePerHour: number;
}

interface ParkingDetailPageProps {
  parking: Parking;
  onBack: () => void;
  onProceedToBooking: (slotId: string, parking: Parking) => void;
}

export function ParkingDetailPage({ parking, onBack, onProceedToBooking }: ParkingDetailPageProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, [parking.id]);

  const fetchSlots = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9c2e4e69/slots/${parking.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSlots(data.slots);
      } else {
        toast.error('Failed to fetch slots');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot: Slot) => {
    if (slot.status === 'booked') {
      toast.error('This slot is already booked');
      return;
    }
    setSelectedSlot(slot.id);
  };

  const handleNext = () => {
    if (!selectedSlot) {
      toast.error('Please select a parking slot');
      return;
    }
    onProceedToBooking(selectedSlot, parking);
  };

  const getSlotColor = (slot: Slot) => {
    if (slot.status === 'booked') return 'bg-red-500';
    if (selectedSlot === slot.id) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const availableSlots = slots.filter((s) => s.status === 'available').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back to Parkings
          </Button>
          <h2 className="mb-2">{parking.name}</h2>
          <p className="text-gray-600 mb-4">{parking.address}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Total Slots</p>
              <p className="text-xl">{parking.totalSlots}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-xl text-green-600">{availableSlots}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <p className="text-sm text-gray-600">Booked</p>
              <p className="text-xl text-red-600">{parking.totalSlots - availableSlots}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Price</p>
              <p className="text-xl text-blue-600">₹{parking.pricePerHour}/hr</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="mb-4">Slot Status</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded"></div>
              <span className="text-sm">Booked</span>
            </div>
          </div>
        </div>

        {/* Parking Layout */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="mb-4">Select Your Parking Slot</h3>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading slots...</p>
          ) : (
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  disabled={slot.status === 'booked'}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center
                    text-white transition-all hover:scale-105
                    ${getSlotColor(slot)}
                    ${slot.status === 'booked' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-xs md:text-sm">{slot.slotNumber}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Next Button */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Button
            onClick={handleNext}
            disabled={!selectedSlot}
            className="w-full md:w-auto md:px-12"
          >
            Next
          </Button>
          {selectedSlot && (
            <p className="text-sm text-gray-600 mt-2">
              Selected Slot: {slots.find((s) => s.id === selectedSlot)?.slotNumber}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
