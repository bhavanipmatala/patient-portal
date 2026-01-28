import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
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
            Your secure connection to your healthcare team
          </p>
          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>✓</div>
              <span>Secure messaging with your care team</span>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>✓</div>
              <span>View test results and health records</span>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>✓</div>
              <span>Manage appointments and prescriptions</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            <p style={styles.formSubtitle}>Sign in to access your patient portal</p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={20} style={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={20} style={styles.inputIcon} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <div style={styles.forgotPassword}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              style={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={styles.registerPrompt}>
            <span>Don't have an account? </span>
            <Link to="/register" style={styles.registerLink}>Create Account</Link>
          </div>

          <div style={styles.demoCredentials}>
            <p style={styles.demoTitle}>Demo Credentials:</p>
            <p style={styles.demoText}>Email: john.smith@email.com</p>
            <p style={styles.demoText}>Password: password123</p>
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
  },
  formContainer: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  formHeader: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  formTitle: {
    fontSize: '1.75rem',
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
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9375rem',
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
    left: '1rem',
    color: '#999999',
    pointerEvents: 'none' as const,
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem 0.875rem 3rem',
    fontSize: '1rem',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
    outline: 'none',
  },
  passwordToggle: {
    position: 'absolute' as const,
    right: '1rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#999999',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPassword: {
    textAlign: 'right' as const,
  },
  forgotLink: {
    fontSize: '0.875rem',
    color: '#0057B8',
    textDecoration: 'none',
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
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
  registerPrompt: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    fontSize: '0.9375rem',
    color: '#666666',
  },
  registerLink: {
    color: '#0057B8',
    fontWeight: 500,
    textDecoration: 'none',
  },
  demoCredentials: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#E8F4FD',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  demoTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0057B8',
    marginBottom: '0.5rem',
  },
  demoText: {
    fontSize: '0.8125rem',
    color: '#666666',
    margin: '0.25rem 0',
  },
};

export default Login;
