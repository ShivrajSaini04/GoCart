import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck } from 'lucide-react';
import { setCredentials } from '../redux/authSlice';
import apiService from '../services/api';
import '../style/auth.css';

// the backend emails a 5 digit code that stays valid for 10 minutes
const OTP_LENGTH = 5;

const VerifyOtp = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);

    const email = location.state?.email || user?.email;

    // the code belongs to an email address, so there is nothing to verify without one
    if (!email) {
        return <Navigate to="/signup" replace />;
    }

    const handleChange = (event) => {
        setOtp(event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setNotice('');
        setSubmitting(true);

        try {
            const data = await apiService.verifyOtp(email, otp);
            dispatch(setCredentials(data));
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setNotice('');
        setResending(true);

        try {
            const data = await apiService.resendOtp(email);
            setOtp('');
            setNotice(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setResending(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <header className="auth-header">
                    <h1>Verify your email</h1>
                    <p>We sent a {OTP_LENGTH} digit code to <strong>{email}</strong>.</p>
                </header>

                {error && <p className="auth-error">{error}</p>}
                {notice && <p className="auth-notice">{notice}</p>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="auth-field">
                        <span>Verification code</span>
                        <input
                            className="otp-input"
                            type="text"
                            name="otp"
                            value={otp}
                            onChange={handleChange}
                            placeholder="00000"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            aria-label="Verification code"
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={submitting || otp.length !== OTP_LENGTH}
                    >
                        {submitting ? 'Verifying...' : 'Verify my email'}
                    </button>
                </form>

                <p className="auth-note">
                    <ShieldCheck size={15} /> Your account is not active until this code is
                    confirmed, so you cannot log in or order before then.
                </p>

                <p className="auth-switch">
                    Code did not arrive?{' '}
                    <button
                        type="button"
                        className="auth-link-button"
                        onClick={handleResend}
                        disabled={resending}
                    >
                        {resending ? 'Sending...' : 'Send a new one'}
                    </button>
                </p>
            </section>
        </main>
    );
};

export default VerifyOtp;
