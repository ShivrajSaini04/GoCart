import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, UserRound } from 'lucide-react';
import apiService from '../services/api';
import '../style/auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        // if (form.password !== form.confirmPassword) {
        //     setError('Both passwords must match.');
        //     return;
        // }

        setSubmitting(true);

        try {
            await apiService.signup(form.name, form.email, form.password);
            navigate('/verify-otp', { replace: true, state: { email: form.email } });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <header className="auth-header">
                    <h1>Create your account</h1>
                    <p>Sign up to track orders and check out faster.</p>
                </header>

                {error && <p className="auth-error">{error}</p>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="auth-field">
                        <span>Full name</span>
                        <div className="auth-input">
                            <UserRound size={18} />
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                autoComplete="name"
                                required
                            />
                        </div>
                    </label>

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
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </label>

                    {/* <label className="auth-field">
                        <span>Confirm password</span>
                        <div className="auth-input">
                            <Lock size={18} />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </label> */}

                    <button type="submit" className="auth-submit" disabled={submitting}>
                        {submitting ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="auth-note">Your account is created once you enter the code we email you.</p>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </section>
        </main>
    );
};

export default Signup;
