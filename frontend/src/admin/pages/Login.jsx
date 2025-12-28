/**
 * Admin Login Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setAuthTokens } from '../../lib/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(email, password);
      if (response.data) {
        setAuthTokens(response.data.accessToken, response.data.refreshToken);
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">🎟️</span>
          <h1>Admin Login</h1>
          <p>Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/">← Back to website</a>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-background, #0f172a);
          padding: 1rem;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: var(--color-surface, #1e293b);
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }

        .login-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text, #f8fafc);
          margin: 0 0 0.5rem;
        }

        .login-header p {
          color: var(--color-text-muted, #94a3b8);
          margin: 0;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-muted, #94a3b8);
        }

        .form-group input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: var(--color-text, #f8fafc);
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--color-primary, #3b82f6);
        }

        .form-group input::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }

        .login-btn {
          width: 100%;
          padding: 1rem;
          background: var(--color-primary, #3b82f6);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .login-btn:hover {
          opacity: 0.9;
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 1.5rem;
          text-align: center;
        }

        .login-footer a {
          color: var(--color-text-muted, #94a3b8);
          font-size: 0.875rem;
          text-decoration: none;
        }

        .login-footer a:hover {
          color: var(--color-primary, #3b82f6);
        }
      `}</style>
    </div>
  );
}

