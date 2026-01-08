// ... imports
import React, { useState } from 'react';
import { Mail, Lock, User, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import Popup from '../components/Popup';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [modalState, setModalState] = useState({
        show: false,
        type: 'success', // 'success' or 'error'
        title: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Register attempt:', formData);

        try {
            const result = await fetch("http://localhost:8080/saveUser", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({
                    "name": formData.fullName,
                    "email": formData.email,
                    "password": formData.password
                })
            });
            const data = await result.json();
            if (data.status === 200) {
                setModalState({
                    show: true,
                    type: 'success',
                    title: 'Success!',
                    message: 'User registration successful!'
                });
            } else {
                setModalState({
                    show: true,
                    type: 'error',
                    title: 'Registration Failed',
                    message: data.message || 'Something went wrong. Please try again.'
                });
            }
            console.log(data);
        } catch (error) {
            console.error("Registration error:", error);
            setModalState({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to connect to the server.'
            });
        }
    };

    const handleModalClose = () => {
        if (modalState.type === 'success') {
            setModalState({ ...modalState, show: false });
            navigate('/'); // Navigate to Login (root) or /login
        } else {
            setModalState({ ...modalState, show: false });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join us today! Enter your details below.</p>
                </div>

                {/* Modal Popup */}
                <Popup
                    show={modalState.show}
                    type={modalState.type}
                    title={modalState.title}
                    message={modalState.message}
                    onClose={handleModalClose}
                />


                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            name="fullName"
                            className="auth-input"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            name="email"
                            className="auth-input"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            name="password"
                            className="auth-input"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <CheckCircle className="input-icon" size={20} />
                        <input
                            type="password"
                            name="confirmPassword"
                            className="auth-input"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn">
                        Sign Up
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account?
                        <Link to="/login" className="auth-link">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
