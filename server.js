require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.sk_test_51QkUXQ2MFkLan8PiEU02mNTw6pI4DoXBKqojPo5GmYFMSaSbB1Ds5XMbjRIGpeJUIiUuLvX2OkYTY3hLpEEOsYla00Hxuzho6I);
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount } = req.body; // Primamo iznos iz frontenda

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Transfer Service' },
          unit_amount: amount * 100, // Stripe koristi cente
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://www.transferstosplit.com/succes', // Zamijeni sa svojim URL-ovima
      cancel_url: 'https://www.transferstosplit.com/fail',
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
