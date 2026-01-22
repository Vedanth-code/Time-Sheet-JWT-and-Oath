import React, { useState } from 'react';
import { Mail, Lock, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Popup from '../components/Popup';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: '',
    type: 'success' // 'success' or 'failure'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth route
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "username": formData.email,
          "password": formData.password
        })
      });

      const data = await response.json();
      console.log("-----------------------------------------the data is ", data);


      if (response.ok) {
        // Store username for Sidebar display
        // Try to get name from response, or fallback to email input
        const userDisplay = data.user.name;
        localStorage.setItem('username', userDisplay);

        setPopup({
          show: true,
          message: 'Login Successful!',
          type: 'success'
        });
      } else {
        throw new Error(data.message || 'Login failed');
      }

    } catch (error) {
      console.error('Error:', error);
      setPopup({
        show: true,
        message: error.message || 'Invalid email or password',
        type: 'failure'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopupClose = () => {
    setPopup({ ...popup, show: false });
    if (popup.type === 'success') {
      navigate('/dashboard');
    } else {
      // For failure, we just close the popup and stay on login page
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Success/Failure Popup */}
      <Popup
        show={popup.show}
        type={popup.type}
        title={popup.type === 'success' ? 'Success!' : 'Error'}
        message={popup.message}
        onClose={handlePopupClose}
      />

      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Please enter your details to sign in</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <div className="auth-options">
            <label className="remember-me">
              <input type="checkbox" disabled={isLoading} />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Google OAuth button */}
          <button onClick={handleGoogleLogin}>
            Sign in with Google
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?
            <Link to="/register" className="auth-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
