import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PackageSearch } from 'lucide-react';
import { formatPrice } from '../utils/price';
import apiService from '../services/api';
import '../style/orders.css';

const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
});

const Orders = () => {
    const user = useSelector((state) => state.auth.user);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await apiService.getMyOrders(user._id);
                if (isMounted) setOrders(data);
            } catch (err) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchOrders();
        return () => { isMounted = false; };
    }, [user._id]);

    return (
        <main className="orders-page">
            <div className="orders-container">
                <header className="orders-header">
                    <h1>My orders</h1>
                    <p>Every order placed with your GoCart account.</p>
                </header>

                {loading && <p className="orders-status">Loading your orders...</p>}

                {error && <p className="orders-status orders-error">{error}</p>}

                {!loading && !error && orders.length === 0 && (
                    <div className="orders-empty">
                        <PackageSearch size={40} />
                        <h2>No orders yet</h2>
                        <p>Once you place an order it will show up here.</p>
                        <Link to="/products" className="orders-shop-link">Start shopping</Link>
                    </div>
                )}

                {orders.map((order) => (
                    <article className="order-card" key={order._id}>
                        <header className="order-card-header">
                            <div>
                                <h2>Order #{order._id.slice(-8)}</h2>
                                <p>Placed on {formatDate(order.createdAt)}</p>
                            </div>
                            <span className={`order-status ${order.status}`}>{order.status}</span>
                        </header>

                        <ul className="order-item-list">
                            {order.items.map((item, index) => (
                                <li key={item._id || index}>
                                    <span>{item.product?.name || 'Product'} × {item.quantity}</span>
                                    <span>{formatPrice(item.price * item.quantity)}</span>
                                </li>
                            ))}
                        </ul>

                        <footer className="order-card-footer">
                            <p className="order-address">
                                {order.address.fullname}, {order.address.street}, {order.address.city} {order.address.postalCode}, {order.address.country}
                            </p>
                            <p className="order-total">Total {formatPrice(order.totalAmount)}</p>
                        </footer>
                    </article>
                ))}
            </div>
        </main>
    );
};

export default Orders;
