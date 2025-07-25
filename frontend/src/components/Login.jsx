import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001') + '/api';

const Login = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log("Frontend Login: Attempting to send:", { userId, password });

        axios.post(`${BACKEND_URL}/login`, { userId, password }) 
            .then(result => {
                console.log("Frontend Login: Backend response:", result);
                if (result.data === "Login successful.") {
                    alert('Login successful!');
                    navigate('/admin');
                } else {
                    alert('Login failed: Unexpected response from server. Please try again.');
                }
            })
            .catch(err => {
                console.error("Login error:", err); 
                if (err.response && err.response.status === 400) {
                    alert(err.response.data || 'Invalid credentials. Please try again.');
                } else if (err.response && err.response.data) {
                    // Catch other backend error messages
                    alert(`Login failed: ${err.response.data}`);
                } else {
                    alert("Login failed. Check console for details.");
                }
            });
    };

    return (
        <div>
            <div className="d-flex justify-content-center align-items-center text-center vh-100">
                <div className="bg-white p-3 rounded" style={{ width: '40%' }}>
                    <h2 className='mb-3 text-primary'>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 text-start">
                            <label htmlFor="inputUserId" className="form-label">
                                <strong>User ID</strong>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter User ID"
                                className="form-control"
                                id="inputUserId"
                                value={userId} 
                                onChange={e => setUserId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3 text-start">
                            <label htmlFor="inputPassword" className="form-label">
                                <strong>Password</strong>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                className="form-control"
                                id="inputPassword"
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-success">Login</button>
                    </form>
                    <p className='container my-2'>Don't have an account?</p>
                    <Link to='/register' className="btn btn-primary">Register</Link>
                    <Link to='/home' className="btn btn-secondary">Back</Link>

                </div>
            </div>
        </div>
    );
};

export default Login;
