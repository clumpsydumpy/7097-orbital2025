import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const Login = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        axios.post('http://localhost:3001/login', { userId, password })
            .then(result => {
                console.log(result);
                if (result.data === "Success") {
                    alert('Login successful!');
                    navigate('/admin');
                } else {
                    alert('Incorrect User ID or Password! Please try again.');
                }
            })
            .catch(err => console.log("Login error:", err));
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
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Login</button>
                    </form>
                    <p className='container my-2'>Don't have an account?</p>
                    <Link to='/register' className="btn btn-secondary">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
