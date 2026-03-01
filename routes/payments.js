const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/payments/create-payment-intent
// Creates a PaymentIntent for an existing order
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/webhook
// Stripe webhook — receives raw body (set up before express.json())
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const order = await Order.findOne({ paymentIntentId: pi.id });
      if (order) {
        order.status = 'paid';
        order.paidAt = new Date();
        await order.save();

        // Deduct stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
        }
        console.log(`✅ Order ${order._id} paid`);
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      const order = await Order.findOne({ paymentIntentId: pi.id });
      if (order) {
        order.status = 'cancelled';
        await order.save();
      }
      break;
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  res.json({ received: true });
});

// POST /api/payments/confirm
// Called by frontend after Stripe.js confirms payment (fallback)
router.post('/confirm', protect, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.status === 'succeeded') {
      const order = await Order.findOne({ paymentIntentId });
      if (order && order.status === 'pending') {
        order.status = 'paid';
        order.paidAt = new Date();
        await order.save();
      }
      return res.json({ success: true, orderId: order?._id });
    }
    res.status(400).json({ message: 'Payment not confirmed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;