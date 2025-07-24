require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const FormDataModel = require('./models/Formdata'); 
const ProductModel = require('./models/Product');
const OrderModel = require('./models/Order');
const EventModel = require('./models/Event');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;


// Stripe configuration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

console.log('FRONTEND_URL from .env:', process.env.FRONTEND_URL);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
console.log('FRONTEND_URL used in app:', FRONTEND_URL);

// for cross-origin requests from  Vercel frontend.
app.use(cors());

app.use(express.static('public'));

mongoose.connect(
    MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(async () => {
    console.log("MongoDB connected");

    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
        console.log("Initialising product data...");
        await ProductModel.insertMany([
            { name: "Rose Bouquet", price: 45.00, imageUrl: "/rose.png" },
            { name: "Sunflower Bouquet", price: 35.00, imageUrl: "/sunflower.png" }
        ]);
        console.log("Product data seeded.");
    }

    const eventCount = await EventModel.countDocuments();
    if (eventCount === 0) {
        console.log("Initialising event data...");
        await EventModel.insertMany([
            { name: "Valentine’s Day", date: new Date('2026-02-14T00:00:00Z') },
            { name: "Mother’s Day", date: new Date('2026-05-10T00:00:00Z') },
            { name: "Father’s Day", date: new Date('2026-06-21T00:00:00Z') }
        ]);
        console.log("Event data seeded.");
    }
})
.catch(err => console.error("MongoDB connection error:", err));


// Stripe Webhook Endpoint- raw body parser applied  here for integrity of webhook
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Received Stripe webhook event:", event.type);

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const orderId = session.metadata.order_id;

            console.log(`Checkout Session Completed for order ID: ${orderId}`);

            if (orderId) {
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
            }
            break;

        case 'checkout.session.async_payment_succeeded':
            console.log(`Checkout Session Async Payment Succeeded: ${event.data.object.id}`);
            break;

        case 'checkout.session.async_payment_failed':
            const failedSession = event.data.object;
            const failedOrderId = failedSession.metadata.order_id;

            console.log(`Checkout Session Async Payment Failed: ${failedSession.id} for order ${failedOrderId}`);

            if (failedOrderId) {
                const order = await OrderModel.findOneAndUpdate(
                    { _id: failedOrderId, paymentTransactionId: failedSession.id },
                    { paymentStatus: 'failed', orderStatus: 'Payment Failed' },
                    { new: true }
                );
                if (order) {
                    console.log(`Order ${order._id} updated to Payment Failed.`);
                }
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send('Webhook received.');
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// User Authentication route w FormDataModel
app.post('/register', async (req, res) => {
    const { userId, password } = req.body; 
    try {
        // Check if  record already exists- FormDataModel is singleton
        const existingFormData = await FormDataModel.findById('singleton');
        if (existingFormData) {
            return res.status(409).json("Registration already exists. Only one registration is allowed.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newFormData = new FormDataModel({ _id: 'singleton', userId, password: hashedPassword });
        await newFormData.save();
        res.status(201).json("User registered successfully.");
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json("Error registering user.");
    }
});

app.post('/login', async (req, res) => {
    const { userId, password } = req.body; 


    try {
        const formData = await FormDataModel.findById('singleton');
        console.log("  Retrieved formData from DB:", formData);

        if (!formData) {
            console.log("  Login failed: No registration found.");
            return res.status(400).json("No registration found. Please register first.");
        }

        // Compare the provided password with hashed password from FormDataModel
        console.log(`  Comparing plain password '${password}' with stored hash '${formData.password}'`);
        const isMatch = await bcrypt.compare(password, formData.password);
        console.log("  bcrypt.compare result (isMatch):", isMatch);

        if (!isMatch) {
            console.log("  Login failed: Invalid credentials (password mismatch).");
            if (formData.userId !== userId) {
                return res.status(400).json("Invalid credentials (User ID mismatch).");
            }
            return res.status(400).json("Invalid credentials (Password mismatch).");
        }

        // If both userId and password match
        if (formData.userId !== userId) { 
            console.log("  Login failed: Invalid credentials (User ID mismatch after password match).");
            return res.status(400).json("Invalid credentials (User ID mismatch).");
        }

        console.log("  Login successful for userId:", userId);
        res.status(200).json("Login successful.");
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json("Error logging in.");
    }
});


app.get('/products', async (req, res) => {
    try {
        const products = await ProductModel.find({});
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json("Server error fetching products.");
    }
});


app.post('/orders', async (req, res) => {
    const { firstName, lastName, telegramId, address, items, requiredDate, isImmediate } = req.body;

    try {
        if (!items || items.length === 0) {
            return res.status(400).json("Order must contain items.");
        }

        const itemDetails = await Promise.all(items.map(async item => {
            const product = await ProductModel.findById(item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found.`);
            }
            return {
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            };
        }));

        const totalAmount = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = new OrderModel({
            firstName,
            lastName,
            telegramId,
            address,
            items: itemDetails,
            totalAmount,
            orderStatus: 'Payment Pending',
            paymentStatus: 'pending',
            requiredDate: isImmediate ? new Date() : new Date(requiredDate),
            isImmediate: isImmediate
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json(`Server error creating order: ${err.message}`);
    }
});

app.get('/orders', async (req, res) => {
    try {
        const orders = await OrderModel.find({}).sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json("Server error fetching orders.");
    }
});

app.get('/orders/:id', async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json("Order not found.");
        }
        res.json(order);
    } catch (err) {
        console.error("Error fetching order by ID:", err);
        res.status(500).json("Server error fetching order.");
    }
});

app.put('/orders/:id/status', async (req, res) => {
    const { status } = req.body;

    if (!['Order Received', 'Prepared', 'On Its Way', 'Delivered', 'Cancelled', 'Payment Pending', 'Payment Failed'].includes(status)) {
        return res.status(400).json("Invalid order status.");
    }

    try {
        const order = await OrderModel.findByIdAndUpdate(
            req.params.id,
            { orderStatus: status },
            { new: true, runValidators: true }
        );
        if (!order) {
            return res.status(404).json("Order not found.");
        }
        res.json(order);
    } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json("Server error updating order status.");
    }
});

app.put('/orders/:id/cancel', async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).json("Order not found.");
        }

        if (order.orderStatus !== 'Order Received' && order.orderStatus !== 'Payment Pending') {
            return res.status(403).json("Order can only be cancelled if it's in 'Order Received' or 'Payment Pending' status.");
        }

        order.orderStatus = 'Cancelled';
        order.paymentStatus = 'failed';
        await order.save();
        res.json(order);
    } catch (err) {
        console.error("Error cancelling order:", err);
        res.status(500).json("Server error cancelling order.");
    }
});


app.get('/api/upcoming-event', async (req, res) => {
    try {
        const now = new Date();
        const upcomingEvents = await EventModel.find({ date: { $gte: now } }).sort({ date: 1 });

        if (upcomingEvents.length === 0) {
            const allEvents = await EventModel.find({}).sort({ date: 1 });
            if (allEvents.length === 0) {
                return res.json({ message: "No events configured." });
            }

            let closestEvent = null;
            let minDaysDiff = Infinity;

            for (const event of allEvents) {
                let eventDate = new Date(event.date);
                while (eventDate < now) {
                    eventDate.setFullYear(eventDate.getFullYear() + 1);
                }

                const timeDiff = eventDate.getTime() - now.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                if (daysDiff < minDaysDiff) {
                    minDaysDiff = daysDiff;
                    closestEvent = {
                        name: event.name,
                        daysToGo: daysDiff
                    };
                }
            }
            return res.json(closestEvent);

        } else {
            const nextEvent = upcomingEvents[0];
            const timeDiff = nextEvent.date.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            res.json({
                name: nextEvent.name,
                daysToGo: daysDiff
            });
        }
    } catch (err) {
        console.error("Error fetching upcoming event:", err);
        res.status(500).json("Server error fetching upcoming event.");
    }
});

// Stripe Payment Routes
app.post('/api/stripe/create-checkout-session', async (req, res) => {
    const { orderId, items, customerDetails } = req.body;

    if (!orderId || !items || items.length === 0 || !customerDetails) {
        return res.status(400).json({ message: "Order ID, items, and customer details are required." });
    }

    const lineItems = items.map(item => ({
        price_data: {
            currency: 'sgd',
            product_data: {
                name: item.name,
            },
            unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
    }));

    try {
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        const successUrl = `${FRONTEND_URL}/checkout-success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${FRONTEND_URL}/checkout-cancel?order_id=${orderId}`;
        console.log('Stripe success_url:', successUrl);
        console.log('Stripe cancel_url:', cancelUrl);


        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['paynow'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            client_reference_id: orderId,
            metadata: {
                order_id: orderId,
            },
            customer_email: customerDetails.email || `${customerDetails.telegramId}@telegram.com`,
        });

        await OrderModel.findByIdAndUpdate(orderId, {
            paymentTransactionId: session.id,
            paymentStatus: 'waiting_payment'
        });

        res.json({ url: session.url, sessionId: session.id }); 

    } catch (error) {
        console.error("Error creating Stripe Checkout Session:", error.message);
        console.error("Stripe API Error details:", error.raw);
        res.status(500).json({ message: "Failed to create Stripe Checkout Session.", details: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
});
