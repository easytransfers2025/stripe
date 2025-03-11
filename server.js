require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.sk_test_51QkUXQ2MFkLan8PiEU02mNTw6pI4DoXBKqojPo5GmYFMSaSbB1Ds5XMbjRIGpeJUIiUuLvX2OkYTY3hLpEEOsYla00Hxuzho6I);
const cors = require('cors');

const app = express();

// CORS konfiguracija za Webflow i Render
const allowedOrigins = [
  'https://www.transferstosplit.com/', // Zamijeni sa tvojim stvarnim Webflow domenom
  'https://stripe-payment-backend-fywd.onrender.com' // Dodaj ako želiš dopustiti i backend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Dopusti zahtjeve bez origin header-a (npr. Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST'], // Dopusti samo POST metode
  credentials: true
}));

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
