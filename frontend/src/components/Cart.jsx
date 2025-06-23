import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(storedCart);
    }, []);

    const updateQuantity = (id, change) => {
        let updatedCart = cartItems.map(item =>
            item._id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const removeItem = (id) => {
        let updatedCart = cartItems.filter(item => item._id !== id);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center text-center vh-100">
            <div className="bg-white p-4 rounded" style={{ width: '80%', maxWidth: '800px' }}>
                <h2 className='mb-4 text-primary'>Your Cart</h2>
                {cartItems.length === 0 ? (
                    <><p>Your cart is empty.</p><p>
                        <Link to='/home' className="btn btn-secondary me-2">Continue Shopping</Link>
                    </p></>
                    
                ) : (
                    <>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map(item => (
                                    <tr key={item._id}>
                                        <td>{item.name}</td>
                                        <td>SGD{item.price.toFixed(2)}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => updateQuantity(item._id, -1)}>-</button>
                                            {item.quantity}
                                            <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => updateQuantity(item._id, 1)}>+</button>
                                        </td>
                                        <td>SGD{(item.price * item.quantity).toFixed(2)}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => removeItem(item._id)}>Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <h4 className="mt-4">Total: SGD{calculateTotal().toFixed(2)}</h4>
                        <div className="d-flex justify-content-center mt-3">
                            <Link to='/home' className="btn btn-secondary me-2">Continue Shopping</Link>
                            <button
                                className="btn btn-success"
                                onClick={() => navigate('/checkout')}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;