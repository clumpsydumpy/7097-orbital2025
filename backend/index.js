// for loading environment variables like api key, mongodb
require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const FormDataModel = require('./models/FormData');
const ProductModel = require('./models/Product'); 
const OrderModel = require('./models/Order');     

// initialise app
const app = express();
app.use(express.json());
app.use(cors());
// serve static files from public folder
app.use(express.static('public'));


const dbURL = process.env.MONGO_URI;

mongoose.connect(
    dbURL,
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(async () => { // await requires sync
    console.log("MongoDB connected");
    // seed initial product data if no data
    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
        console.log("Initalising product data...");
        await ProductModel.insertMany([
            { name: "Rose Bouquet", price: 45.00, imageUrl: "/rose.png" },
            { name: "Sunflower Bouquet", price: 35.00, imageUrl: "/sunflower.png" }
        ]);
        console.log("Product data seeded.");
    }
})
.catch(err => console.error("MongoDB connection error:", err));

app.post('/register', async (req, res) => {
    const { userId, password } = req.body;

    try {
        const existingUser = await FormDataModel.findOne();
        if (existingUser) {
            return res.status(403).json("Registration closed: only one user allowed.");
        }
        const newUser = await FormDataModel.create({ _id: 'singleton', userId, password });
        res.json(newUser);
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json("Server error during registration.");
    }
});

app.post('/login', (req, res) => {
    const { userId, password } = req.body;

    FormDataModel.findOne({ userId })
        .then(user => {
            if (!user) return res.json("No records found!");
            if (user.password === password) {
                res.json("Success");
            } else {
                res.json("Wrong password");
            }
        })
        .catch(err => {
            console.error("Login error:", err);
            res.status(500).json("Server error");
        });
});

// for home.jsx
app.get('/products', async (req, res) => {
    try {
        const products = await ProductModel.find({});
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json("Server error fetching products.");
    }
});


//for checkout.jsx
app.post('/orders', async (req, res) => {
    const { firstName, lastName, telegramId, address, items } = req.body;

    try {
        if (!items || items.length === 0) {
            return res.status(400).json("Order must contain items.");
        }

        // Fetch product details to ensure valid prices and names
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
            totalAmount
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json(`Server error creating order: ${err.message}`);
    }
});

// for admin.jsx
app.get('/orders', async (req, res) => {
    try {
        const orders = await OrderModel.find({}).sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json("Server error fetching orders.");
    }
});

// used in home.jsx
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

// used in admin.jsx
app.put('/orders/:id/status', async (req, res) => {
    const { status } = req.body; // status shld be one of the enum values

    if (!['Order Received', 'Prepared', 'On Its Way', 'Delivered', 'Cancelled'].includes(status)) {
        return res.status(400).json("Invalid order status.");
    }

    try {
        const order = await OrderModel.findByIdAndUpdate(
            req.params.id,
            { orderStatus: status },
            { new: true, runValidators: true } // Return the updated document and run schema validators
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

// Cancel order only if order stilll at 'Order Received' stage
// used in home.jsx
app.put('/orders/:id/cancel', async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).json("Order not found.");
        }

        if (order.orderStatus !== 'Order Received') {
            return res.status(403).json("Order can only be cancelled if it's in 'Order Received' status.");
        }

        order.orderStatus = 'Cancelled';
        await order.save();
        res.json(order);
    } catch (err) {
        console.error("Error cancelling order:", err);
        res.status(500).json("Server error cancelling order.");
    }
});

app.listen(3001, () => {
    console.log("Server listening on http://127.0.0.1:3001");
});
