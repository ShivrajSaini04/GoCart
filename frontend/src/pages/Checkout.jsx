import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, Truck } from 'lucide-react';
import { clearCart } from '../redux/cartSlice';
import { formatPrice, getCartTotals } from '../utils/price';
import { loadRazorpayCheckout } from '../utils/razorpay';
import apiService from '../services/api';
import '../style/checkout.css';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const emptyAddress = { fullname: '', street: '', city: '', postalCode: '', country: 'India' };

const Checkout = () => {
    const cartItem = useSelector((state) => state.cart.cartItem);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [address, setAddress] = useState({ ...emptyAddress, fullname: user?.name || '' });
    const [paymentMethod, setPaymentMethod] = useState(RAZORPAY_KEY ? 'online' : 'cod');
    const [error, setError] = useState('');
    const [placing, setPlacing] = useState(false);

    const { subtotal, shipping, total } = getCartTotals(cartItem);

    const handleChange = (event) => {
        setAddress({ ...address, [event.target.name]: event.target.value });
    };

    // opens the razorpay widget and resolves with the payment response
    const payOnline = async () => {
        const loaded = await loadRazorpayCheckout();
        if (!loaded) throw new Error('Could not load the payment window. Please check your connection.');

        const paymentOrder = await apiService.createPaymentOrder(total);

        return new Promise((resolve, reject) => {
            const checkout = new window.Razorpay({
                key: RAZORPAY_KEY,
                order_id: paymentOrder.id,
                amount: paymentOrder.amount,
                currency: paymentOrder.currency,
                name: 'GoCart',
                description: 'Order payment',
                prefill: { name: user?.name, email: user?.email },
                handler: resolve,
                modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) }
            });

            checkout.open();
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setPlacing(true);

        try {
            let paymentId;

            if (paymentMethod === 'online') {
                const payment = await payOnline();
                await apiService.verifyPayment(payment);
                paymentId = payment.razorpay_payment_id;
            }

            await apiService.createOrder({
                items: cartItem.map((item) => ({
                    product: item._id,
                    quantity: item.quantity || 1,
                    price: item.price
                })),
                address,
                paymentId,
                totalAmount: total
            });

            dispatch(clearCart());
            navigate('/orders', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setPlacing(false);
        }
    };

    if (cartItem.length === 0) {
        return (
            <main className="checkout-page">
                <div className="checkout-empty">
                    <h1>Nothing to check out</h1>
                    <p>Your cart is empty, so there is no order to place yet.</p>
                    <Link to="/products" className="checkout-submit-link">Browse products</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <div className="checkout-container">
                <h1>Checkout</h1>

                {error && <p className="checkout-error">{error}</p>}

                <form className="checkout-layout" onSubmit={handleSubmit}>
                    <section className="checkout-panel">
                        <h2>Shipping address</h2>

                        <label className="checkout-field">
                            <span>Full name</span>
                            <input name="fullname" value={address.fullname} onChange={handleChange} required />
                        </label>

                        <label className="checkout-field">
                            <span>Street address</span>
                            <input name="street" value={address.street} onChange={handleChange} required />
                        </label>

                        <div className="checkout-field-row">
                            <label className="checkout-field">
                                <span>City</span>
                                <input name="city" value={address.city} onChange={handleChange} required />
                            </label>

                            <label className="checkout-field">
                                <span>Postal code</span>
                                <input name="postalCode" value={address.postalCode} onChange={handleChange} required />
                            </label>
                        </div>

                        <label className="checkout-field">
                            <span>Country</span>
                            <input name="country" value={address.country} onChange={handleChange} required />
                        </label>

                        <h2 className="checkout-payment-heading">Payment method</h2>

                        <label className={`checkout-payment ${paymentMethod === 'online' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="online"
                                checked={paymentMethod === 'online'}
                                onChange={() => setPaymentMethod('online')}
                                disabled={!RAZORPAY_KEY}
                            />
                            <CreditCard size={19} />
                            <span>
                                <strong>Pay online</strong>
                                <small>
                                    {RAZORPAY_KEY
                                        ? 'Cards, UPI, netbanking and wallets via Razorpay.'
                                        : 'Add VITE_RAZORPAY_KEY_ID to the frontend env to enable this.'}
                                </small>
                            </span>
                        </label>

                        <label className={`checkout-payment ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={() => setPaymentMethod('cod')}
                            />
                            <Truck size={19} />
                            <span>
                                <strong>Pay on delivery</strong>
                                <small>Pay in cash when the order reaches you.</small>
                            </span>
                        </label>
                    </section>

                    <aside className="checkout-summary">
                        <h2>Your order</h2>

                        <ul className="checkout-item-list">
                            {cartItem.map((item) => (
                                <li key={item._id}>
                                    <span>{item.name} × {item.quantity || 1}</span>
                                    <span>{formatPrice(item.price * (item.quantity || 1))}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="checkout-summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>

                        <div className="checkout-summary-row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                        </div>

                        <div className="checkout-summary-row checkout-summary-total">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>

                        <button type="submit" className="checkout-submit" disabled={placing}>
                            {placing ? 'Placing order...' : 'Place order'}
                        </button>

                        <Link to="/cart" className="checkout-back-link">Back to cart</Link>
                    </aside>
                </form>
            </div>
        </main>
    );
};

export default Checkout;
