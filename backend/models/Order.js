const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    telegramId: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true
            },
            name: String,
            price: Number,
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    orderStatus: { 
        type: String,
        enum: ['Order Received', 'Prepared', 'On Its Way', 'Delivered', 'Cancelled', 'Payment Pending', 'Payment Failed'],
        default: 'Payment Pending' // Initial status = pending payment
    },
    paymentTransactionId: { // for Stripe Session ID
        type: String,
        unique: true,
        sparse: true
    },
    paymentStatus: { 
        type: String,
        enum: ['pending', 'waiting_payment', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    requiredDate: { // date the customer wants the order delivered
        type: Date,
        required: true
    },
    isImmediate: { // flag to indicate if is immediate order
        type: Boolean,
        default: true
    }
});

const OrderModel = mongoose.model('orders', OrderSchema);

module.exports = OrderModel;
