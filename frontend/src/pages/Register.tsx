import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Calendar, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        address: formData.address || undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logoContainer}>
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#FFFFFF" />
              <path d="M8 16H24M16 8V24" stroke="#0057B8" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={styles.brandTitle}>DemoPatientPortal</h1>
          <p style={styles.brandSubtitle}>
            Join thousands of patients who manage their healthcare online
          </p>
          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>✓</div>
              <span>Secure messaging with your care team</span>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>✓</div>
              <span>Access your health records anytime</span>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>✓</div>
              <span>Schedule appointments online</span>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>✓</div>
              <span>Request prescription refills</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Fill in your details to get started</p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label htmlFor="firstName" style={styles.label}>First Name</label>
                <div style={styles.inputWrapper}>
                  <User size={20} style={styles.inputIcon} />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    style={styles.input}
                    required
                  />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="lastName" style={styles.label}>Last Name</label>
                <div style={styles.inputWrapper}>
                  <User size={20} style={styles.inputIcon} />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    style={styles.input}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={20} style={styles.inputIcon} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label htmlFor="password" style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={20} style={styles.inputIcon} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    style={styles.input}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={20} style={styles.inputIcon} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    style={styles.input}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label htmlFor="dateOfBirth" style={styles.label}>Date of Birth (Optional)</label>
                <div style={styles.inputWrapper}>
                  <Calendar size={20} style={styles.inputIcon} />
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="phoneNumber" style={styles.label}>Phone Number (Optional)</label>
                <div style={styles.inputWrapper}>
                  <Phone size={20} style={styles.inputIcon} />
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="address" style={styles.label}>Address (Optional)</label>
              <div style={styles.inputWrapper}>
                <MapPin size={20} style={styles.inputIcon} />
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  style={styles.input}
                />
              </div>
            </div>

            <button
              type="submit"
              style={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={styles.loginPrompt}>
            <span>Already have an account? </span>
            <Link to="/login" style={styles.loginLink}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #0057B8 0%, #004494 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  brandContent: {
    maxWidth: '400px',
    color: '#FFFFFF',
  },
  logoContainer: {
    marginBottom: '1.5rem',
  },
  brandTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },
  brandSubtitle: {
    fontSize: '1.25rem',
    opacity: 0.9,
    marginBottom: '2.5rem',
    lineHeight: 1.6,
  },
  features: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
    opacity: 0.9,
  },
  featureIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: '#F5F5F5',
    overflowY: 'auto' as const,
  },
  formContainer: {
    width: '100%',
    maxWidth: '520px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  formHeader: {
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1A1A1A',
    marginBottom: '0.5rem',
  },
  formSubtitle: {
    fontSize: '1rem',
    color: '#666666',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.9375rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#333333',
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute' as const,
    left: '0.875rem',
    color: '#999999',
    pointerEvents: 'none' as const,
  },
  input: {
    width: '100%',
    padding: '0.75rem 0.875rem 0.75rem 2.75rem',
    fontSize: '0.9375rem',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
    outline: 'none',
  },
  passwordToggle: {
    position: 'absolute' as const,
    right: '0.875rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#999999',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    width: '100%',
    padding: '0.875rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#FFFFFF',
    backgroundColor: '#0057B8',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
    marginTop: '0.5rem',
  },
  loginPrompt: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    fontSize: '0.9375rem',
    color: '#666666',
  },
  loginLink: {
    color: '#0057B8',
    fontWeight: 500,
    textDecoration: 'none',
  },
};

export default Register;
