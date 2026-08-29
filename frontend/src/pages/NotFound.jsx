import { Link } from 'react-router-dom';
import '../style/page.css';

const NotFound = () => (
    <main className="static-page">
        <div className="notfound-box">
            <p className="notfound-code">404</p>
            <h1>Page not found</h1>
            <p>The page you were looking for does not exist or has been moved.</p>
            <div className="notfound-actions">
                <Link to="/" className="static-cta-btn">Go home</Link>
                <Link to="/products" className="notfound-secondary">Browse products</Link>
            </div>
        </div>
    </main>
);

export default NotFound;
