import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('email');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginData = {
        password: formData.password,
        ...(loginType === 'email' ? { email: formData.email } : { phone: formData.phone })
      };

      const result = await login(loginData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h1 className="form-title">Login</h1>

        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Login with:</label>
          <div className="flex gap-16">
            <label>
              <input
                type="radio"
                value="email"
                checked={loginType === 'email'}
                onChange={(e) => setLoginType(e.target.value)}
              />
              Email
            </label>
            <label>
              <input
                type="radio"
                value="phone"
                checked={loginType === 'phone'}
                onChange={(e) => setLoginType(e.target.value)}
              />
              Phone
            </label>
          </div>
        </div>

        {loginType === 'email' ? (
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone (10 digits)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              maxLength="10"
              pattern="[0-9]{10}"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="text-center mt-16">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="nav-link">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
