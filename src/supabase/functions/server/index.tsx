import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize sample parking data
async function initializeData() {
  const existingParkings = await kv.get('parkings_initialized');
  if (existingParkings) return;

  // Sample parking locations in India (major cities)
  const parkings = [
    {
      id: 'park1',
      name: 'Select City Walk Mall',
      address: 'Saket, New Delhi',
      lat: 28.5244,
      lng: 77.2066,
      totalSlots: 50,
      pricePerHour: 50,
    },
    {
      id: 'park2',
      name: 'Phoenix Market City',
      address: 'Kurla, Mumbai',
      lat: 19.0877,
      lng: 72.8901,
      totalSlots: 100,
      pricePerHour: 60,
    },
    {
      id: 'park3',
      name: 'Brigade Road Parking',
      address: 'MG Road, Bangalore',
      lat: 12.9716,
      lng: 77.5946,
      totalSlots: 40,
      pricePerHour: 40,
    },
    {
      id: 'park4',
      name: 'Anna Nagar Tower Park',
      address: 'Anna Nagar, Chennai',
      lat: 13.0878,
      lng: 80.2088,
      totalSlots: 30,
      pricePerHour: 35,
    },
  ];

  await kv.set('parkings', parkings);
  
  // Initialize slots for each parking
  for (const parking of parkings) {
    const slots = [];
    for (let i = 1; i <= parking.totalSlots; i++) {
      slots.push({
        id: `${parking.id}_slot_${i}`,
        parkingId: parking.id,
        slotNumber: i,
        status: 'available', // available, booked
      });
    }
    await kv.set(`slots_${parking.id}`, slots);
  }

  await kv.set('parkings_initialized', true);
}

// Call initialization
initializeData();

// Sign up endpoint
app.post('/make-server-9c2e4e69/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Error during user signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Error in signup endpoint: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get all parkings
app.get('/make-server-9c2e4e69/parkings', async (c) => {
  try {
    const parkings = await kv.get('parkings') || [];
    return c.json({ parkings });
  } catch (error) {
    console.log(`Error fetching parkings: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get slots for a specific parking
app.get('/make-server-9c2e4e69/slots/:parkingId', async (c) => {
  try {
    const parkingId = c.req.param('parkingId');
    const slots = await kv.get(`slots_${parkingId}`) || [];
    return c.json({ slots });
  } catch (error) {
    console.log(`Error fetching slots: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Create booking
app.post('/make-server-9c2e4e69/bookings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      console.log('Unauthorized booking attempt');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { parkingId, slotId, startTime, endTime, amount } = await c.req.json();

    // Get current slots
    const slots = await kv.get(`slots_${parkingId}`) || [];
    const slotIndex = slots.findIndex((s: any) => s.id === slotId);
    
    if (slotIndex === -1) {
      return c.json({ error: 'Slot not found' }, 404);
    }

    if (slots[slotIndex].status === 'booked') {
      return c.json({ error: 'Slot already booked' }, 400);
    }

    // Update slot status
    slots[slotIndex].status = 'booked';
    await kv.set(`slots_${parkingId}`, slots);

    // Create booking with unique ID
    const timestamp = Date.now();
    const bookingId = `booking_${timestamp}_${user.id.substring(0, 8)}`;
    
    // Generate unique QR code data with comprehensive booking information
    const qrCodeData = JSON.stringify({
      bookingId,
      userId: user.id,
      parkingId,
      slotId,
      startTime,
      endTime,
      amount,
      timestamp,
      verification: `${bookingId}_${timestamp}_${Math.random().toString(36).substring(2, 15)}`,
    });
    
    const booking = {
      id: bookingId,
      userId: user.id,
      parkingId,
      slotId,
      startTime,
      endTime,
      amount,
      status: 'active',
      qrCode: qrCodeData,
      createdAt: new Date().toISOString(),
    };

    // Store booking
    const userBookings = await kv.get(`user_bookings_${user.id}`) || [];
    userBookings.push(booking);
    await kv.set(`user_bookings_${user.id}`, userBookings);

    return c.json({ success: true, booking });
  } catch (error) {
    console.log(`Error creating booking: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get user bookings
app.get('/make-server-9c2e4e69/bookings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      console.log('Unauthorized booking fetch attempt');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookings = await kv.get(`user_bookings_${user.id}`) || [];
    return c.json({ bookings });
  } catch (error) {
    console.log(`Error fetching bookings: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Extend booking
app.post('/make-server-9c2e4e69/extend-booking', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      console.log('Unauthorized extend booking attempt');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { bookingId, additionalHours, amount } = await c.req.json();

    const bookings = await kv.get(`user_bookings_${user.id}`) || [];
    const bookingIndex = bookings.findIndex((b: any) => b.id === bookingId);
    
    if (bookingIndex === -1) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    // Extend end time
    const currentEndTime = new Date(bookings[bookingIndex].endTime);
    currentEndTime.setHours(currentEndTime.getHours() + additionalHours);
    bookings[bookingIndex].endTime = currentEndTime.toISOString();
    bookings[bookingIndex].amount += amount;

    await kv.set(`user_bookings_${user.id}`, bookings);

    return c.json({ success: true, booking: bookings[bookingIndex] });
  } catch (error) {
    console.log(`Error extending booking: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Process payment (mock for prototype)
app.post('/make-server-9c2e4e69/payment', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      console.log('Unauthorized payment attempt');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { amount, type } = await c.req.json();

    // Mock payment processing
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const payment = {
      id: paymentId,
      userId: user.id,
      amount,
      type, // 'booking' or 'extension'
      status: 'success',
      createdAt: new Date().toISOString(),
    };

    return c.json({ success: true, payment });
  } catch (error) {
    console.log(`Error processing payment: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);
