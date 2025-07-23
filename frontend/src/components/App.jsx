import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'; 
import Register from './Register'; 
import Login from './Login'; 
import Cart from './Cart'; 
import Checkout from './Checkout'; 
import AdminDashboard from './Admin'; 
import SuccessPage from './SucessPage'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/checkout-success" element={<SuccessPage />} />
        <Route path="/checkout-cancel" element={<Checkout />} />
      </Routes>
    </Router>
  );
}

export default App;
