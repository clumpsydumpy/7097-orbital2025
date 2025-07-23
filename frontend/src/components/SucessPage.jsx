import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

const SuccessPage = () => {
    const location = useLocation();
    const [orderId, setOrderId] = useState(null);
    const [orderStatus, setOrderStatus] = useState('Verifying payment...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const order_id = queryParams.get('order_id');
        const session_id = queryParams.get('session_id'); 

        if (order_id) {
            setOrderId(order_id);
            // Clear cart from local storage after successful order
            localStorage.removeItem('cart');

            const fetchOrderStatus = async () => {
                try {
                    const response = await axios.get(`${BACKEND_URL}/orders/${order_id}`);
                    setOrderStatus(response.data.orderStatus);
                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching order status:", err);
                    setError("Could not retrieve order details. Please check your order history.");
                    setLoading(false);
                }
            };
            fetchOrderStatus();

        } else {
            setError("No order ID found in the URL.");
            setLoading(false);
        }
    }, [location]);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center text-center vh-100">
            <div className="bg-white p-5 rounded shadow-lg" style={{ maxWidth: '600px', width: '90%' }}>
                <h2 className="text-success mb-4">Payment Successful!</h2>
                {loading ? (
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : (
                    <>
                        <p className="lead mb-3">Your order has been placed successfully.</p>
                        <p className="fs-5 mb-4">
                            Your Order ID is: <strong className="text-primary">{orderId}</strong>
                        </p>
                        <p className="mb-4">
                            Current Status: <span className="badge bg-success">{orderStatus}</span>
                        </p>
                        <Link to="/home" className="btn btn-primary btn-lg">
                            Back to Home
                        </Link>
                        <p className="mt-3 text-muted">You can track your order using the Order ID on the Home page.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default SuccessPage;
