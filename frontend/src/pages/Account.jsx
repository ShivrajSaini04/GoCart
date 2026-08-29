import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, Mail, PackageSearch, ShieldCheck, UserRound } from 'lucide-react';
import { logout } from '../redux/authSlice';
import '../style/account.css';

const Account = () => {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <main className="account-page">
            <div className="account-container">
                <header className="account-header">
                    <div className="account-avatar"><UserRound size={28} /></div>
                    <div>
                        <h1>{user.name}</h1>
                        <p className="account-email"><Mail size={15} /> {user.email}</p>
                    </div>
                </header>

                <section className="account-details">
                    <div className="account-detail">
                        <span>Account type</span>
                        <strong>{user.role === 'admin' ? 'Administrator' : 'Customer'}</strong>
                    </div>
                    <div className="account-detail">
                        <span>Email status</span>
                        <strong className={user.verified ? 'verified' : 'unverified'}>
                            <ShieldCheck size={15} /> {user.verified ? 'Verified' : 'Not verified'}
                        </strong>
                    </div>
                </section>

                <section className="account-actions">
                    {!user.verified && (
                        <Link to="/verify-otp" className="account-action">
                            <ShieldCheck size={18} />
                            <span>
                                <strong>Verify my email</strong>
                                <small>Enter the code we emailed when you signed up.</small>
                            </span>
                        </Link>
                    )}

                    <Link to="/orders" className="account-action">
                        <PackageSearch size={18} />
                        <span>
                            <strong>My orders</strong>
                            <small>Track what you have bought so far.</small>
                        </span>
                    </Link>

                    <button type="button" className="account-action account-logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>
                            <strong>Log out</strong>
                            <small>Sign out of GoCart on this device.</small>
                        </span>
                    </button>
                </section>
            </div>
        </main>
    );
};

export default Account;
