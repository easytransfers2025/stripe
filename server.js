require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.sk_test_51QkUXQ2MFkLan8PiEU02mNTw6pI4DoXBKqojPo5GmYFMSaSbB1Ds5XMbjRIGpeJUIiUuLvX2OkYTY3hLpEEOsYla00Hxuzho6I);
const cors = require('cors');

const app = express();

// CORS konfiguracija za Webflow i Render
const allowedOrigins = [
  'https://www.transferstosplit.com', // Tvoj frontend
  'https://stripe-payment-backend-fywd.onrender.com' // Backend (opcionalno)
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['POST', 'OPTIONS'], // Dopusti OPTIONS za preflight
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rukovanje OPTIONS zahtjevima (preflight)
app.options('*', cors());

app.use(express.json());

// Stripe checkout endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount } = req.body;

    // Validacija iznosa
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Neispravan iznos" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { 
            name: 'Transfer Service',
            description: 'Premium transfer service between locations'
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://www.transferstosplit.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.transferstosplit.com/cancel',
    });

    res.json({ id: session.id });

  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ 
      error: 'Došlo je do greške prilikom kreiranja plaćanja',
      details: error.message 
    });
  }
});

// Health check endpoint za Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
