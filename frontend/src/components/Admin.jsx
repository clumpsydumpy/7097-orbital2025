import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001'; 

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState(''); 
  const orderStatuses = ['Order Received', 'Prepared', 'On Its Way', 'Delivered', 'Cancelled']; 

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/orders`);
      setOrders(response.data);
      setMessage('');
    } catch (error) {
      console.error("Error fetching orders:", error);
      setMessage("Failed to load orders.");
    }
  };

  useEffect(() => {
    fetchOrders(); 
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (window.confirm(`Are you sure you want to change status of order ${orderId} to '${newStatus}'?`)) {
      try {
        const response = await axios.put(`${BACKEND_URL}/orders/${orderId}/status`, { status: newStatus });
        console.log("Order status updated:", response.data);
        alert(`Order ${orderId} status updated to ${newStatus}.`);
        fetchOrders(); 
      } catch (error) {
        console.error("Error updating order status:", error);
        alert("Failed to update order status. Check console for details.");
      }
    }
  };

  return (
    <div className="d-flex flex-column align-items-center text-center min-vh-100 pt-4">
        <h1>Admin Dashboard</h1>
        <p> This is the admin page where you can manage orders and extensions.</p>

        <hr className="my-4" style={{ width: '80%' }} />

        <h2 className='mb-3'>All Orders</h2>
        {message && <div className="alert alert-info mt-3">{message}</div>} 

        {orders.length === 0 && !message ? ( 
          <p>No orders placed yet.</p>
        ) : (
          <div style={{ width: '95%', maxHeight: '600px', overflowY: 'auto' }} className="table-responsive"> 
            <table className="table table-striped table-bordered table-hover"> 
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Telegram ID</th>
                  <th>Address</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Order Date</th>
                  <th>Required Date</th>
                  <th>Payment Status</th> 
                  <th>Order Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.firstName} {order.lastName}</td>
                    <td>{order.telegramId}</td>
                    <td>{order.address}</td>
                    <td>
                      <ul className="list-unstyled mb-0"> 
                        {order.items.map((item, index) => (
                          <li key={index}>{item.name} (x{item.quantity})</li>
                        ))}
                      </ul>
                    </td>
                    <td>SGD{order.totalAmount.toFixed(2)}</td>
                    <td>{new Date(order.orderDate).toLocaleString()}</td>
                    <td>
                        {order.isImmediate ? 'Immediate' : new Date(order.requiredDate).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      <span className={`badge ${
                          order.paymentStatus === 'paid' ? 'bg-success' :
                          order.paymentStatus === 'failed' ? 'bg-danger' :
                          'bg-warning text-dark' // pending, waiting_payment
                      }`}>
                          {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                          order.orderStatus === 'Delivered' ? 'bg-success' :
                          order.orderStatus === 'Cancelled' || order.orderStatus === 'Payment Failed' ? 'bg-danger' :
                          order.orderStatus === 'On Its Way' ? 'bg-primary' :
                          order.orderStatus === 'Prepared' ? 'bg-warning text-dark' :
                          'bg-info' // Order Received, Payment Pending
                      }`}>
                          {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        // Disable if the order is already in a final state (Delivered, Cancelled, Payment Failed)
                        disabled={['Delivered', 'Cancelled', 'Payment Failed'].includes(order.orderStatus)}
                      >
                        {orderStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
               
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <hr className="my-4" style={{ width: '80%' }} />

        <p className="mt-4"> Extensions can include low stock reminder, and empowering store owners with functionality to update order progress of order.</p>
        <Link to='/home' className="btn btn-secondary">Log Out</Link>
    </div>
  )
}

export default Admin;
