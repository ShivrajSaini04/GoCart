import { Mail, MapPin, Phone, ShieldCheck, Truck, CreditCard, Globe, Camera, Send, ArrowRight }
    from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo3.png";

import '../style/footer.css'


const Footer = () => {
    return (
        <footer className="site-footer">
            {/* footer Top box  */}
            <div className="footer-top">

                <div className="footer-brand">
                    <img src={logo} alt="GoCart Logo" className="footer-logo-img" />
                    <div>
                        <h3>Go<span>Cart</span></h3>
                        <p>Your everyday shopping destination...</p>
                    </div>
                </div>

                <div className="footer-feature-grid">
                    <div className="feature-item">
                        <Truck size={18} />
                        <span>Free shipping</span>
                    </div>
                    <div className="feature-item">
                        <ShieldCheck size={18} />
                        <span>Secure checkout</span>
                    </div>
                    <div className="feature-item">
                        <CreditCard size={18} />
                        <span>Easy payments</span>
                    </div>
                </div>
            </div>

            {/*  footer Details */}

            <div className="footer-main">
                <div className="footer-column">
                    <h4>About Us</h4>
                    <p>
                        GoCart brings the latest gadgets, lifestyle essentials, and premium products
                        to your doorstep with a smooth shopping experience.
                    </p>
                    <Link to="/about" className="footer-about-link">Read our story</Link>
                    <div className="contact-list">
                        <div className="contact-item">
                            <MapPin size={16} />
                            <span>123 Market Street, New Delhi, India</span>
                        </div>
                        <div className="contact-item">
                            <Phone size={16} />
                            <span>+91 XXXXX XXXXX</span>
                        </div>
                        <div className="contact-item">
                            <Mail size={16} />
                            <span>support@gocart.in</span>
                        </div>
                    </div>
                </div>

                <div className="footer-column">
                    <h4>Customer Care</h4>
                    <ul>
                        <li><Link to="/orders">Track Order</Link></li>
                        <li><a href="#">FAQ</a></li>
                        <li><a href="#">Terms & Conditions</a></li>
                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                        <li><a href="mailto:support@gocart.in">Contact Support</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">All Products</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                        <li><Link to="/products">New Arrivals</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                    </ul>
                </div>

                <div className="footer-column newsletter-column">
                    <h4>Newsletter</h4>
                    <p>Get updates on offers, new arrivals, and exclusive deals.</p>
                    <form className="newsletter-form">
                        <input type="email" placeholder="Your email address" />
                        <button type="submit">
                            Join
                            <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="social-links">
                        <a href="#" aria-label="Facebook"><Globe size={18} /></a>
                        <a href="#" aria-label="Instagram"><Camera size={18} /></a>
                        <a href="#" aria-label="Twitter"><Send size={18} /></a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 GoCart Private Limited. All rights reserved.</p>
                <div className="payment-methods">
                    <span>UPI</span>
                    <span>Cards</span>
                    <span>Wallet</span>
                    <span>NetBanking</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
