import { useState } from 'react';
import { CreditCard, Smartphone, Building, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';

interface PaymentGatewayProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

export function PaymentGateway({ amount, onSuccess, onCancel }: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form states
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const handlePayment = () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      
      // Generate mock payment ID
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      setTimeout(() => {
        onSuccess(paymentId);
      }, 1500);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Generating your unique QR code...</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2>Payment</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X size={24} />
          </Button>
        </div>

        {/* Amount Display */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
          <p className="text-3xl text-blue-600">₹{amount}</p>
        </div>

        {/* Payment Method Selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setPaymentMethod('upi')}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'upi'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Smartphone className={`mx-auto mb-2 ${paymentMethod === 'upi' ? 'text-blue-600' : 'text-gray-600'}`} />
            <p className="text-sm">UPI</p>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'card'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard className={`mx-auto mb-2 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-600'}`} />
            <p className="text-sm">Card</p>
          </button>
          <button
            onClick={() => setPaymentMethod('netbanking')}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'netbanking'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Building className={`mx-auto mb-2 ${paymentMethod === 'netbanking' ? 'text-blue-600' : 'text-gray-600'}`} />
            <p className="text-sm">Net Banking</p>
          </button>
        </div>

        {/* Payment Form */}
        <div className="space-y-4 mb-6">
          {paymentMethod === 'upi' && (
            <div>
              <Label htmlFor="upi">UPI ID</Label>
              <Input
                id="upi"
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-2">
                Popular UPI apps: Google Pay, PhonePe, Paytm, BHIM
              </p>
            </div>
          )}

          {paymentMethod === 'card' && (
            <>
              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  type="text"
                  placeholder="Name on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    maxLength={3}
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === 'netbanking' && (
            <div>
              <Label htmlFor="bank">Select Your Bank</Label>
              <select
                id="bank"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Punjab National Bank</option>
                <option>Bank of Baroda</option>
                <option>Other</option>
              </select>
            </div>
          )}
        </div>

        {/* Pay Button */}
        <Button
          onClick={handlePayment}
          disabled={processing}
          className="w-full"
        >
          {processing ? 'Processing Payment...' : `Pay ₹${amount}`}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          This is a demo payment gateway for prototype purposes only
        </p>
      </Card>
    </div>
  );
}
