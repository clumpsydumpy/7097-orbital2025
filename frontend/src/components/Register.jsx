import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        axios.post('http://localhost:3001/register', { userId, password })
            .then(result => {
                console.log(result);
                alert("Registered successfully! Directing to login.");
                navigate('/login');
                }
            )
            .catch(err => {
                if (err.response.status === 409) {
                    console.warn("Server says registration is closed.");
                    alert("Registered owner found. Only owner can register. Directing to login.");
                    navigate('/login');
                } 
                else {
                    console.error("Register error:", err);
                    alert("Registration failed. Check console for details.");
            }
            });
    };

    return (
        <div>
            <div className="d-flex justify-content-center align-items-center text-center vh-100">
                <div className="bg-white p-3 rounded" style={{ width: '40%' }}>
                    <h2 className='mb-3 text-primary'>Register</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 text-start">
                            <label htmlFor="inputUserId" className="form-label">
                                <strong>User ID</strong>
                            </label>
                            <input
                                type="text"
                                placeholder="Set User ID"
                                className="form-control"
                                id="inputUserId"
                                onChange={(e) => setUserId(e.target.value)}
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
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-success">Register</button>
                    </form>

                    <p className='container my-2'>Already have an account?</p>
                    <Link to='/login' className="btn btn-primary">Login</Link>
                    <Link to='/home' className="btn btn-secondary">Back</Link>

                </div>
            </div>
        </div>
    );
};

export default Register;
