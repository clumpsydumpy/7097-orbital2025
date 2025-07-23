import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

const BACKEND_URL =process.env.BACKEND_URL || 'http://localhost:3001';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [orderIdToTrack, setOrderIdToTrack] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [upcomingEvent, setUpcomingEvent] = useState(null); 

  useEffect(() => {
    axios.get(`${BACKEND_URL}/products`)
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
      });

    axios.get(`${BACKEND_URL}/api/upcoming-event`)
      .then(response => {
        setUpcomingEvent(response.data);
      })
      .catch(error => {
        console.error("Error fetching upcoming event:", error);
      });
  }, []);

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cart.findIndex(item => item._id === product._id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  const handleTrackOrder = async () => {
    setTrackedOrder(null);
    setTrackingError('');

    if (!orderIdToTrack) {
      setTrackingError("Please enter an Order ID.");
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/orders/${orderIdToTrack}`);
      setTrackedOrder(response.data);
    } catch (error) {
      console.error("Error tracking order:", error);
      if (error.response && error.response.status === 404) {
        setTrackingError("Order not found. Please check the ID.");
      } else {
        setTrackingError("Failed to track order. Please try again.");
      }
    }
  };

  const handleCancelOrder = async () => {
    if (!trackedOrder || (trackedOrder.orderStatus !== 'Order Received' && trackedOrder.orderStatus !== 'Payment Pending')) {
      alert("Order can only be cancelled if it's in 'Order Received' or 'Payment Pending' status.");
      return;
    }

    if (window.confirm(`Are you sure you want to cancel order ${trackedOrder._id}?`)) {
      try {
        const response = await axios.put(`${BACKEND_URL}/orders/${trackedOrder._id}/cancel`);
        setTrackedOrder(response.data); // Update status in UI
        alert("Order cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling order:", error);
        if (error.response && error.response.data) {
          alert(`Cancellation failed: ${error.response.data}`);
        } else {
          alert("Failed to cancel order. Please try again.");
        }
      }
    }
  };


  return (

    <div className="d-flex flex-column align-items-center text-center min-vh-100 pt-4">
        {upcomingEvent && upcomingEvent.name && upcomingEvent.daysToGo !== undefined && (
            <div
                className="alert alert-info w-75 mb-4 py-3 rounded shadow-sm" 
                role="alert" 
                style={{
                    maxWidth: '800px'
                }}
            >
                <h3>Just {upcomingEvent.daysToGo} days to go until {upcomingEvent.name} — the perfect time to gift flowers! 🎉🎉</h3>
            </div>
        )}

        <h1> Our Products </h1>

        <div className="d-flex flex-wrap p-3 justify-content-center" style={{ gap: '16px' }}>
          {products.map(product => (
            <div key={product._id} className="card" style={{ width: '300px', marginBottom: '20px' }}>
              <img
                src={`${BACKEND_URL}${product.imageUrl}`}
                className="card-img-top"
                alt={product.name}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">SGD{product.price.toFixed(2)}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", marginTop: '20px', marginBottom: '100px' }}>
          <p className="me-5"> For Admin Use Only: </p>
          <Link to='/register' className="btn btn-secondary me-2">Register</Link>
          <Link to='/login' className="btn btn-secondary me-2">Login</Link>
          <Link to='/cart' className="btn btn-info">View Cart</Link>
        </div>

        {/* Order Tracking Section */}
        <hr style={{ width: '80%', margin: '40px 0' }} />
        <h2>Track Your Order</h2>
        <div className="input-group mb-3" style={{ width: '50%', maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Order ID"
            value={orderIdToTrack}
            onChange={(e) => setOrderIdToTrack(e.target.value)}
          />
          <button className="btn btn-outline-primary" type="button" onClick={handleTrackOrder}>
            Track
          </button>
        </div>
        {trackingError && <div className="alert alert-danger" role="alert">{trackingError}</div>}

        {trackedOrder && (
          <div className="card text-start p-3 my-3" style={{ width: '80%', maxWidth: '600px' }}>
            <h5>Order ID: {trackedOrder._id}</h5>
            <p><strong>Customer:</strong> {trackedOrder.firstName} {trackedOrder.lastName}</p>
            <p><strong>Status:</strong> <span className={`badge ${trackedOrder.orderStatus === 'Delivered' ? 'bg-success' : trackedOrder.orderStatus === 'Cancelled' || trackedOrder.orderStatus === 'Payment Failed' ? 'bg-danger' : 'bg-info'}`}>{trackedOrder.orderStatus}</span></p>
            <p>
                <strong>Required Date:</strong> {' '}
                {trackedOrder.isImmediate ? 'Immediate' : new Date(trackedOrder.requiredDate).toLocaleDateString('en-GB')}
            </p>
            <p><strong>Items:</strong></p>
            <ul>
              {trackedOrder.items.map((item, index) => (
                <li key={index}>{item.name} (x{item.quantity}) - SGD{item.price.toFixed(2)} each</li>
              ))}
            </ul>
            <p><strong>Total:</strong> SGD{trackedOrder.totalAmount.toFixed(2)}</p>
            <p><strong>Order Date:</strong> {new Date(trackedOrder.orderDate).toLocaleString()}</p>

            {(trackedOrder.orderStatus === 'Order Received' || trackedOrder.orderStatus === 'Payment Pending') && (
              <button
                className="btn btn-danger mt-3"
                onClick={handleCancelOrder}
              >
                Cancel Order
              </button>
            )}
          </div>
        )}
    </div>
  )
}

export default Home;
