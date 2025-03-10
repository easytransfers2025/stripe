const stripe = require('stripe')(process.env.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);

exports.handler = async (event) => {
  const { amount, metadata } = JSON.parse(event.body);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name: 'Transfer Service' },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    metadata: metadata,
    mode: 'payment',
    success_url: 'https://tvoj-webflow-sajt.webflow.io/success',
    cancel_url: 'https://tvoj-webflow-sajt.webflow.io/cart',
  });

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ id: session.id }),
  };
};
