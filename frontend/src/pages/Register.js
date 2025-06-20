import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [contactType, setContactType] = useState('email');

  const { register, isAuthenticated } = useAuth();
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
      // Prepare registration data based on contact type
      const registerData = {
        name: formData.name,
        password: formData.password,
        role: formData.role,
        ...(contactType === 'email' ? { email: formData.email } : { phone: formData.phone })
      };

      const result = await register(registerData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h1 className="form-title">Register</h1>

        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            minLength="3"
            maxLength="20"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Primary Contact:</label>
          <div className="flex gap-16">
            <label>
              <input
                type="radio"
                value="email"
                checked={contactType === 'email'}
                onChange={(e) => setContactType(e.target.value)}
              />
              Email
            </label>
            <label>
              <input
                type="radio"
                value="phone"
                checked={contactType === 'phone'}
                onChange={(e) => setContactType(e.target.value)}
              />
              Phone
            </label>
          </div>
        </div>

        {contactType === 'email' ? (
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
            Password (4-10 characters)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            minLength="4"
            maxLength="10"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role" className="form-label">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-select"
          >
            <option value="staff">Staff</option>
            <option value="supplier">Supplier</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <div className="text-center mt-16">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="nav-link">
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
