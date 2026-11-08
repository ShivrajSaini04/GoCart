import { useState } from "react";
import {
    Search, Heart, UserRound, ShoppingCart, LogOut, TruckElectric, LayoutDashboard
} from "lucide-react";

import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/logo1.png";
import "../style/navbar.css";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import ConfirmModal from "./ConfirmModal";

const Navbar = () => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const cartItem = useSelector((state) => state.cart.cartItem);
    const cartCount = cartItem.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [searchParams] = useSearchParams();

    // NavLink ignores the query string, so the category links are matched by hand.
    const onProducts = pathname === '/products' || pathname === '/all';
    const activeCategory = onProducts ? searchParams.get('category') || '' : '';
    const activeSort = onProducts ? searchParams.get('sort') || '' : '';

    const categoryLinks = [
        { label: 'Home', to: '/', isActive: pathname === '/' },
        { label: 'All Sneakers', to: '/products', isActive: onProducts && !activeCategory && !activeSort },
        { label: 'Men', to: '/products?category=Men', isActive: activeCategory === 'Men' },
        { label: 'Women', to: '/products?category=Women', isActive: activeCategory === 'Women' },
        { label: 'Best Sellers', to: '/products?sort=rating', isActive: activeSort === 'rating' },
    ];

    const confirmLogOut = () => {
        dispatch(logout());
        setShowLogoutModal(false);
        navigate('/login');
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const term = event.target.elements.search.value.trim();
        navigate(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
    };

    return (
        <header className="navbar-wrapper">

            {/* Top Announcement */}
            <div className="announcement-bar">
                <TruckElectric className="shipping-nav-icon" /> Free Shipping on orders above ₹999
                <span>|</span>
                7-Day Easy Returns
            </div>

            {/* Main Navbar */}
            <div className="navbar-main">

                {/* Logo */}
                <NavLink to="/" className="logo">
                    <img src={logo} alt="GoCart Logo" className="logo-img" />
                </NavLink>

                {/* Search */}
                <form className="search-box" onSubmit={handleSearch}>
                    <input
                        type="text"
                        name="search"
                        placeholder="Search for products, brands, categories..."
                    />
                    <button type="submit" className="search-submit" aria-label="Search products">
                        <Search size={21} />
                    </button>
                </form>

                {/* Right Section */}
                <div className="navbar-actions">

                    {/* Cart component */}
                    <NavLink to="/cart" className="nav-action cart-action">
                        <ShoppingCart size={21} />
                        <span>Cart</span>

                        <span className="cart-count">{cartCount}</span>
                    </NavLink>

                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <NavLink to="/admin/dashboard" className="nav-action">
                                    <LayoutDashboard size={20} />
                                    <span>Admin</span>
                                </NavLink>
                            )}

                            <NavLink to="/account" className="nav-action">
                                <UserRound size={20} />
                                <span>{user.name.split(" ")[0]}</span>
                            </NavLink>

                            <button
                                type="button"
                                className="nav-action nav-logout"
                                onClick={() => setShowLogoutModal(true)}
                                title="Sign out"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <NavLink to="/login" className="nav-action">
                            <UserRound size={20} />
                            <span>Login</span>
                        </NavLink>
                    )}

                </div>
            </div>

            {/* Category Links */}
            <nav className="nav-links">
                {categoryLinks.map((link) => (
                    <Link
                        key={link.label}
                        to={link.to}
                        className={link.isActive ? "active" : ""}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Unified Logout Confirmation Modal */}
            <ConfirmModal
                isOpen={showLogoutModal}
                title="Sign Out"
                message="Are you sure you want to log out of your GoCart account?"
                confirmText={<><LogOut size={16} /> Yes, Logout</>}
                cancelText="Cancel"
                icon={<LogOut size={26} />}
                iconBg="#fff0e6"
                iconColor="#ff6b00"
                confirmVariant="primary"
                onConfirm={confirmLogOut}
                onCancel={() => setShowLogoutModal(false)}
            />

        </header>
    );
};

export default Navbar;
