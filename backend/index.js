const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const orderId = session.metadata.order_id;

            console.log(`Checkout Session Completed for order ID: ${orderId}`);

            if (orderId) {
                try {
                    const OrderModel = require('./models/Order');
                    const order = await OrderModel.findOneAndUpdate(
                        { _id: orderId, paymentTransactionId: session.id },
                        { paymentStatus: 'paid', orderStatus: 'Order Received' },
                        { new: true }
                    );

                    if (order) {
                        console.log(`Order ${order._id} successfully updated to Paid.`);
                    } else {
                        console.warn(`Order not found or session mismatch for Checkout Session ID: ${session.id}, Order ID: ${orderId}`);
                    }
                } catch (dbError) {
                    console.error(`Database update error for order ${orderId}:`, dbError);
                    return res.status(500).send(`Database error: ${dbError.message}`);
                }
            } else {
                console.warn('Order ID not found in session metadata for completed checkout.');
            }
            break;
        case 'payment_intent.succeeded':
            console.log('PaymentIntent was successful!');
            break;
        case 'payment_intent.payment_failed':
            console.log('PaymentIntent failed!');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

app.use(express.json());
app.use(cors());

app.use(express.static('public'));

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);