
import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await API.post('/auth/login', formData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      const role = response.data.role;

      if (
        role === 'ADMIN' ||
        role === 'MANAGER' ||
        role === 'SUPER_ADMIN'
      ) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error('Login error:', err);

      setError(
        err.response?.data?.message ||
        'Invalid email or password'
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '50px auto',
        fontFamily: 'sans-serif'
      }}
    >
      <h2>Login to OpsFlow</h2>

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: '10px' }}>
          <label>Email Address</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: '10px 20px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>

      </form>

      <p style={{ marginTop: '15px' }}>
        Don't have an account?{' '}
        <Link to="/register">
          Register here
        </Link>
      </p>
    </div>
  );
}

