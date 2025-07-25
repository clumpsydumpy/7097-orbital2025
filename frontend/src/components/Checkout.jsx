import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

// REACT DATE PICKER
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import { format } from 'date-fns'; // for formatting the date to send to backend
import { enUS } from 'date-fns/locale'; 

const stripePromise = loadStripe('pk_test_51Rl2ga01aNNsvDc0Qn2HIFq0draBRCGBDzbppsR5yAw2hOHWUZqWkDFdoIUBbjQgIGbULMfQ4NkuPtKkoeCoNtpv00Fwv9lzlY'); //STRIPE PUBLISHABLE KEY

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001') + '/api';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [telegramId, setTelegramId] = useState('');
    const [address, setAddress] = useState('');
    const [deliveryOption, setDeliveryOption] = useState('immediate'); 
    const [requiredDate, setRequiredDate] = useState(null); 
    const [dateError, setDateError] = useState(''); 
    const [paymentStatus, setPaymentStatus] = useState('input_details'); 
    const navigate = useNavigate();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (storedCart.length === 0) {
            alert("Your cart is empty. Please add items before checking out.");
            navigate('/home');
        }
        setCartItems(storedCart);
    }, [navigate]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handlePlaceOrderAndInitiatePayment = async (event) => {
        event.preventDefault();
        setPaymentStatus('processing');
        setDateError('');

        let finalRequiredDate = null;
        if (deliveryOption === 'later') {
            if (!requiredDate) {
                setDateError("Please select a required delivery date.");
                setPaymentStatus('input_details');
                return;
            }
            finalRequiredDate = format(requiredDate, 'yyyy-MM-dd');
        }

        const orderDetails = {
            firstName,
            lastName,
            telegramId,
            address,
            items: cartItems.map(item => ({
                productId: item._id,
                quantity: item.quantity,
                name: item.name,
                price: item.price,
            })),
            totalAmount: calculateTotal(),
            requiredDate: finalRequiredDate,
            isImmediate: deliveryOption === 'immediate',
        };

        try {
            const orderCreationResponse = await axios.post(`${BACKEND_URL}/orders`, orderDetails);
            const newOrderId = orderCreationResponse.data._id;

            const stripeSessionResponse = await axios.post(`${BACKEND_URL}/api/stripe/create-checkout-session`, {
                orderId: newOrderId,
                items: orderDetails.items,
                customerDetails: {
                    firstName: orderDetails.firstName,
                    lastName: orderDetails.lastName,
                    telegramId: orderDetails.telegramId,
                    email: `${orderDetails.telegramId}@example.com`,
                },
            });

            setPaymentStatus('redirecting');

            if (stripeSessionResponse.data.url) {
                window.location.href = stripeSessionResponse.data.url;
            } else {
                console.error("Stripe session URL not found in response.");
                alert("Failed to get Stripe checkout URL. Please try again.");
                setPaymentStatus('failed');
            }

        } catch (error) {
            console.error("Error during order placement or Stripe session creation:", error.response ? error.response.data : error.message);
            alert(`Failed to place order or initiate payment: ${error.response?.data?.message || error.message}`);
            setPaymentStatus('failed');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center text-center vh-100">
            <div className="bg-white p-4 rounded" style={{ width: '60%', maxWidth: '700px' }}>
                <h2 className='mb-4 text-primary'>Checkout</h2>
                <h4 className="mb-3">Order Summary:</h4>
                <ul className="list-group mb-4">
                    {cartItems.map(item => (
                        <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                            {item.name} (x{item.quantity})
                            <span>SGD{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                    <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                        Total Amount:
                        <span>SGD{calculateTotal().toFixed(2)}</span>
                    </li>
                </ul>

                {paymentStatus === 'input_details' && (
                    <form onSubmit={handlePlaceOrderAndInitiatePayment}>
                        <div className="mb-3 text-start">
                            <label htmlFor="firstName" className="form-label">
                                <strong>First Name</strong>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter First Name"
                                className="form-control"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3 text-start">
                            <label htmlFor="lastName" className="form-label">
                                <strong>Last Name</strong>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Last Name"
                                className="form-control"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3 text-start">
                            <label htmlFor="telegramId" className="form-label">
                                <strong>Telegram ID</strong>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Telegram ID"
                                className="form-control"
                                id="telegramId"
                                value={telegramId}
                                onChange={(e) => setTelegramId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3 text-start">
                            <label htmlFor="address" className="form-label">
                                <strong>Delivery Address</strong>
                            </label>
                            <textarea
                                placeholder="Enter Delivery Address"
                                className="form-control"
                                id="address"
                                rows="3"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div className="mb-3 text-start">
                            <label className="form-label">
                                <strong>Delivery Date</strong>
                            </label>
                            <div>
                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="deliveryOption"
                                        id="deliveryImmediate"
                                        value="immediate"
                                        checked={deliveryOption === 'immediate'}
                                        onChange={() => {
                                            setDeliveryOption('immediate');
                                            setRequiredDate(null);
                                            setDateError('');
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor="deliveryImmediate">Immediate</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="deliveryOption"
                                        id="deliveryLater"
                                        value="later"
                                        checked={deliveryOption === 'later'}
                                        onChange={() => setDeliveryOption('later')}
                                    />
                                    <label className="form-check-label" htmlFor="deliveryLater">Later</label>
                                </div>
                            </div>
                        </div>

                        {deliveryOption === 'later' && (
                            <div className="mb-3 text-start">
                                <label htmlFor="requiredDate" className="form-label">
                                    <strong>Required Date</strong>
                                </label>
                                <DatePicker
                                    selected={requiredDate}
                                    onChange={(date) => {
                                        setRequiredDate(date);
                                        setDateError(''); 
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    minDate={new Date()} // Prevent select past dates
                                    placeholderText="Select a date"
                                    className={`form-control ${dateError ? 'is-invalid' : ''}`} 
                                    wrapperClassName="w-100" 
                                    required={deliveryOption === 'later'}
                                    locale={enUS}
                                />
                                {dateError && <div className="invalid-feedback d-block">{dateError}</div>}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-100" disabled={paymentStatus === 'processing'}>
                            {paymentStatus === 'processing' ? 'Processing...' : 'Pay with PayNow (Stripe)'}
                        </button>
                    </form>
                )}

                {paymentStatus === 'processing' && (
                    <div className="mt-4 alert alert-info">
                        <h4>Processing your order and redirecting to Stripe...</h4>
                        <p>Please wait, do not close this window.</p>
                    </div>
                )}

                {paymentStatus === 'redirecting' && (
                    <div className="mt-4 alert alert-info">
                        <h4>Redirecting to Stripe to complete payment...</h4>
                        <p>If you are not redirected automatically, please check your browser settings.</p>
                    </div>
                )}

                {paymentStatus === 'paid' && (
                    <div className="mt-4 alert alert-success">
                        <h4>Payment Confirmed!</h4>
                        <p>Your order has been placed successfully.</p>
                    </div>
                )}

                {paymentStatus === 'failed' && (
                    <div className="mt-4 alert alert-danger">
                        <h4>Payment Initiation Failed.</h4>
                        <p>Please try again or contact support if the issue persists.</p>
                        <button className="btn btn-primary" onClick={() => setPaymentStatus('input_details')}>Retry Payment</button>
                    </div>
                )}

                <Link to="/cart" className="btn btn-secondary mt-3">Back to Cart</Link>
            </div>
        </div>
    );
};

export default Checkout;
