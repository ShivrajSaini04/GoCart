import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

// keeps checkout and orders behind a login, sending the user back after they sign in
const ProtectedRoute = ({ children, requireVerified = false, requireAdmin = false }) => {
    const { token, user } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // admin-only routes
    if (requireAdmin && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // ordering needs a confirmed email, and a session saved before verifying existed may lack one
    if (requireVerified && !user?.verified) {
        return <Navigate to="/verify-otp" state={{ email: user?.email }} replace />;
    }

    return children;
};

export default ProtectedRoute;
