import React, { useState, useEffect } from 'react';
import baseurl from '../ApiService/ApiService';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const AdminProfileForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });

  const token = localStorage.getItem('authToken');

  // Toggle password visibility
  const handleClickShowPassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Fetch admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(baseurl + '/api/admin/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json();
        if (data.success) {
          setFormData({
            username: data.data.username,
            email: data.data.email
          });
        } else {
          setError(data.msg || 'Failed to load profile');
        }
      } catch (err) {
        setError('Something went wrong while fetching profile');
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setError('No token found. Please log in again.');
    }
  }, [token]);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMsg('');
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordMsg('');
    setPasswordError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(baseurl + '/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setMsg(data.msg || 'Profile updated successfully');
        if (data.accessToken) {
          localStorage.setItem('authToken', data.accessToken);
        }
      } else {
        setError(data.msg || 'Failed to update profile');
      }
    } catch (err) {
      setError('Something went wrong while updating profile');
    }

    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);

    try {
      const res = await fetch(baseurl + '/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await res.json();
      if (data.success) {
        setPasswordMsg(data.msg || 'Password updated successfully');
        setPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(data.msg || 'Failed to update password');
      }
    } catch (err) {
      setPasswordError('Something went wrong while updating password');
    }

    setPasswordLoading(false);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      background: '#fff',
      padding: '30px 40px',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      fontFamily: 'sans-serif'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Admin Profile</h2>

      {/* Profile Update Form */}
      <form onSubmit={handleProfileSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px' }}>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleProfileChange}
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px' }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleProfileChange}
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#00b074',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>

        {msg && <p style={{ color: 'green', marginTop: '15px' }}>{msg}</p>}
        {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      </form>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

      {/* Password Change Form */}
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Change Password</h3>
      <form onSubmit={handlePasswordSubmit}>
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px' }}>New Password</label>
          <input
            type={showPassword.newPassword ? 'text' : 'password'}
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder='••••••••••'
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '14px',
              paddingRight: '40px' // Make space for the icon
            }}
          />
          <InputAdornment position="end" style={{
            position: 'absolute',
            right: '10px',
            top: '50px',
            transform: 'translateY(-50%)'
          }}>
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => handleClickShowPassword('newPassword')}
              onMouseDown={handleMouseDownPassword}
              edge="end"
              size="small"
            >
              {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        </div>

        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px' }}>Confirm Password</label>
          <input
            type={showPassword.confirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder='••••••••••'
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '14px',
              paddingRight: '40px' // Make space for the icon
            }}
          />  
          <InputAdornment position="end" style={{
            position: 'absolute',
            right: '10px',
            top: '50px',
            transform: 'translateY(-50%)'
          }}>
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => handleClickShowPassword('confirmPassword')}
              onMouseDown={handleMouseDownPassword}
              edge="end"
              size="small"
            >
              {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        </div>

        <button
          type="submit"
          disabled={passwordLoading}
          style={{
            backgroundColor: '#00b074',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {passwordLoading ? 'Changing...' : 'Change Password'}
        </button>

        {passwordMsg && <p style={{ color: 'green', marginTop: '15px' }}>{passwordMsg}</p>}
        {passwordError && <p style={{ color: 'red', marginTop: '15px' }}>{passwordError}</p>}
      </form>
    </div>
  );
};

export default AdminProfileForm;