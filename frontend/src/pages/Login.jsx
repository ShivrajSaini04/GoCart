import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Lock, Mail } from 'lucide-react';
import { setCredentials } from '../redux/authSlice';
import apiService from '../services/api';
import '../style/auth.css';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [needsVerifying, setNeedsVerifying] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const redirectTo = location.state?.from || '/';

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setNeedsVerifying(false);
        setSubmitting(true);

        try {
            const data = await apiService.login(form.email, form.password);
            dispatch(setCredentials(data));
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.message);
            // an unverified account still has an OTP waiting, so offer the way back to it
            setNeedsVerifying(err.message.toLowerCase().includes('verify'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <header className="auth-header">
                    <h1>Welcome back</h1>
                    <p>Log in to continue shopping on GoCart.</p>
                </header>

                {error && <p className="auth-error">{error}</p>}

                {needsVerifying && (
                    <p className="auth-switch">
                        <Link to="/verify-otp" state={{ email: form.email }}>
                            Enter your verification code
                        </Link>
                    </p>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="auth-field">
                        <span>Email</span>
                        <div className="auth-input">
                            <Mail size={18} />
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>
                    </label>

                    <label className="auth-field">
                        <span>Password</span>
                        <div className="auth-input">
                            <Lock size={18} />
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Your password"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </label>

                    <button type="submit" className="auth-submit" disabled={submitting}>
                        {submitting ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <p className="auth-switch">
                    New to GoCart? <Link to="/signup">Create an account</Link>
                </p>
            </section>
        </main>
    );
};

export default Login;
