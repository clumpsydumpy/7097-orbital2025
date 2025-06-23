import React, { useState, useEffect } from 'react';
// useEffect used to fetch data
// useState used to store and render data
import { Link } from "react-router-dom";
import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001'; // backend URL

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const orderStatuses = ['Order Received', 'Prepared', 'On Its Way', 'Delivered', 'Cancelled'];

  const fetchOrders = () => {
    axios.get(`${BACKEND_URL}/orders`)
      .then(response => {
        setOrders(response.data);
      })
      .catch(error => {
        console.error("Error fetching orders:", error);
      });
  };

  useEffect(() => {
    fetchOrders(); // Initial fetch
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (window.confirm(`Are you sure you want to change status of order ${orderId} to '${newStatus}'?`)) {
      try {
        const response = await axios.put(`${BACKEND_URL}/orders/${orderId}/status`, { status: newStatus });
        console.log("Order status updated:", response.data);
        alert(`Order ${orderId} status updated to ${newStatus}.`);
        fetchOrders(); // Re-fetch orders to update UI
      } catch (error) {
        console.error("Error updating order status:", error);
        alert("Failed to update order status. Check console for details.");
      }
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center vh-100">
        <h1>Admin Dashboard</h1>
        <p> This is the admin page where you can manage orders and extensions.</p>

        <hr className="my-4" style={{ width: '80%' }} />

        <h2 className='mb-3'>All Orders</h2>
        {orders.length === 0 ? (
          <p>No orders placed yet.</p>
        ) : (
          <div style={{ width: '80%', maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Telegram ID</th>
                  <th>Address</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Order Date</th>
                  <th>Status</th> 
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
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={index}>{item.name} (x{item.quantity}) - SGD{item.price.toFixed(2)} each</li>
                        ))}
                      </ul>
                    </td>
                    <td>SGD{order.totalAmount.toFixed(2)}</td>
                    <td>{new Date(order.orderDate).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${
                          order.orderStatus === 'Delivered' ? 'bg-success' :
                          order.orderStatus === 'Cancelled' ? 'bg-danger' :
                          order.orderStatus === 'On Its Way' ? 'bg-primary' :
                          order.orderStatus === 'Prepared' ? 'bg-warning text-dark' :
                          'bg-info' // Order Received
                      }`}>
                          {order.orderStatus}
                      </span>
                    </td> 
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={order.orderStatus === 'Cancelled' || order.orderStatus === 'Delivered'} // Disable if final status
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

        <p className="mt-4"> Extensions can incude low stock reminder, and empowering store owners with functionality to update order progress of order.</p>
        <Link to='/home' className="btn btn-secondary">Log Out</Link>
    </div>
  )
}

export default Admin