import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001'; 

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [telegramId, setTelegramId] = useState('');
    const [address, setAddress] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (storedCart.length === 0) {
            alert("Your cart is empty. Please add items before checking out.");
            navigate('/home'); // Redirect to home if cart is empty
        }
        setCartItems(storedCart);
    }, [navigate]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const orderDetails = {
            firstName,
            lastName,
            telegramId,
            address,
            items: cartItems.map(item => ({
                productId: item._id, 
                quantity: item.quantity
            })),
        };

        axios.post(`${BACKEND_URL}/orders`, orderDetails) 
            .then(response => {
                console.log("Order submitted:", response.data);
                const orderId = response.data._id; 
                alert('IMPORTANT: Please save a copy of ORDER ID in next alert for tracking!')
                alert(`Order placed successfully! Your Order ID is: ${orderId}. Please use this to track your order.`);
                localStorage.removeItem('cart'); // Clear cart after successful order
                navigate('/home');
            })
            .catch(error => {
                console.error("Error submitting order:", error);
                alert('Failed to place order. Please try again.');
            });
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

                <form onSubmit={handleSubmit}>
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
                    <button type="submit" className="btn btn-primary w-100">Place Order</button>
                </form>
                <Link to="/cart" className="btn btn-secondary mt-3">Back to Cart</Link>
            </div>
        </div>
    );
};

export default Checkout;