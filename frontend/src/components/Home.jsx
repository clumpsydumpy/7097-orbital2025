import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001';

const Home = () => {
  const [products, setProducts] = useState([]); //initiliase as empty array
  const [orderIdToTrack, setOrderIdToTrack] = useState(''); //initialise as empty string
  const [trackedOrder, setTrackedOrder] = useState(null); //initialise as unknown data
  const [trackingError, setTrackingError] = useState('');

  useEffect(() => {
    axios.get(`${BACKEND_URL}/products`)
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
      });
  }, []); // last part is bcos tis useEffect has no dependencies, so itll shld oni run once

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // if localstorage empty, use empty array
    const existingItemIndex = cart.findIndex(item => item._id === product._id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 }); //spread operator to copy product details and add qty  field
    }
    localStorage.setItem('cart', JSON.stringify(cart)); //local storage only stores as string
    alert(`${product.name} added to cart!`);
  };

  const handleTrackOrder = async () => {
    setTrackedOrder(null); //reset previous state
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
    if (!trackedOrder || trackedOrder.orderStatus !== 'Order Received') {
      alert("Order can only be cancelled if it's in 'Order Received' status.");
      return;
    }

    if (window.confirm(`Are you sure you want to cancel order ${trackedOrder._id}?`)) {
      try {
        const response = await axios.put(`${BACKEND_URL}/orders/${trackedOrder._id}/cancel`);
        setTrackedOrder(response.data); 
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
    <div className="d-flex flex-column justify-content-center align-items-center text-center">
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
        <div> 
          <p> Admin Restricted Login and Register.</p>
        </div>
        <div style={{ display: "flex", marginTop: '20px', marginBottom: '100px' }}>
          <p> 
          <Link to='/cart' className="btn btn-info me-2">View Cart</Link>
          <Link to='/register' className="btn btn-secondary me-2">Register</Link>
          <Link to='/login' className="btn btn-secondary me-2">Login</Link>
          </p>
        </div>

        <hr style={{ width: '80%', margin: '40px 0' }} />

        <h2>Track Your Order</h2>
        <div> <p> If you have a valid ID, you can track your order here: </p></div>

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
        
        {trackedOrder && (
          <div className="card text-start p-3 my-3" style={{ width: '80%', maxWidth: '600px' }}>
            <h5>Order ID: {trackedOrder._id}</h5>
            <p><strong>Customer:</strong> {trackedOrder.firstName} {trackedOrder.lastName}</p>
            <p><strong>Status:</strong> <span className={`badge ${trackedOrder.orderStatus === 'Delivered' ? 'bg-success' : trackedOrder.orderStatus === 'Cancelled' ? 'bg-danger' : 'bg-info'}`}>{trackedOrder.orderStatus}</span></p>
            <p><strong>Items:</strong></p>
            <ul>
              {trackedOrder.items.map((item, index) => (
                <li key={index}>{item.name} (x{item.quantity}) - SGD{item.price.toFixed(2)}</li>
              ))}
            </ul>
            <p><strong>Total:</strong> SGD{trackedOrder.totalAmount.toFixed(2)}</p>
            <p><strong>Order Date:</strong> {new Date(trackedOrder.orderDate).toLocaleString()}</p>

            {trackedOrder.orderStatus === 'Order Received' && (
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

export default Home