import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { removeFromCart, updateCartQuantity, clearCart } from '../redux/cartSlice';
import { formatPrice, getCartTotals, FREE_SHIPPING_ABOVE } from '../utils/price';
import '../style/cart.css';

const Cart = () => {
    const cartItem = useSelector((state) => state.cart.cartItem);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { subtotal, shipping, total } = getCartTotals(cartItem);

    // Older carts saved before sizes existed have no cartKey; rebuild it the same
    // way the reducer does so remove/update still target the right line.
    const keyOf = (item) => item.cartKey || `${item._id}__${item.size || 'default'}`;

    const changeQuantity = (item, amount) => {
        dispatch(updateCartQuantity({ cartKey: keyOf(item), quantity: (item.quantity || 1) + amount }));
    };

    if (cartItem.length === 0) {
        return (
            <main className="cart-page">
                <div className="cart-empty">
                    <ShoppingBag size={42} />
                    <h1>Your cart is empty</h1>
                    <p>Browse the store and add the products you like.</p>
                    <Link to="/products" className="cart-primary-btn">Start shopping</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="cart-container">
                <header className="cart-header">
                    <h1>Shopping cart</h1>
                    <button type="button" className="cart-clear-btn" onClick={() => dispatch(clearCart())}>
                        Clear cart
                    </button>
                </header>

                <div className="cart-layout">
                    <section className="cart-items">
                        {cartItem.map((item) => (
                            <article className="cart-item" key={keyOf(item)}>
                                <Link to={`/products/${item._id}`} className="cart-item-image">
                                    <img src={item.imageUrl || '/placeholder.jpg'} alt={item.name} />
                                </Link>

                                <div className="cart-item-details">
                                    <Link to={`/products/${item._id}`} className="cart-item-name">{item.name}</Link>
                                    {item.size && <span className="cart-item-size">Size: UK {item.size}</span>}
                                    <p className="cart-item-price">{formatPrice(item.price)}</p>

                                    <div className="cart-item-controls">
                                        <div className="cart-quantity">
                                            <button
                                                type="button"
                                                onClick={() => changeQuantity(item, -1)}
                                                aria-label={`Decrease quantity of ${item.name}`}
                                            >
                                                <Minus size={15} />
                                            </button>
                                            <span>{item.quantity || 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => changeQuantity(item, 1)}
                                                aria-label={`Increase quantity of ${item.name}`}
                                            >
                                                <Plus size={15} />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            className="cart-remove-btn"
                                            onClick={() => dispatch(removeFromCart(keyOf(item)))}
                                        >
                                            <Trash2 size={16} /> Remove
                                        </button>
                                    </div>
                                </div>

                                <p className="cart-item-total">{formatPrice(item.price * (item.quantity || 1))}</p>
                            </article>
                        ))}
                    </section>

                    <aside className="cart-summary">
                        <h2>Order summary</h2>

                        <div className="cart-summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>

                        <div className="cart-summary-row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                        </div>

                        {shipping > 0 && (
                            <p className="cart-summary-hint">
                                Add {formatPrice(FREE_SHIPPING_ABOVE - subtotal)} more for free shipping.
                            </p>
                        )}

                        <div className="cart-summary-row cart-summary-total">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>

                        <button type="button" className="cart-primary-btn" onClick={() => navigate('/checkout')}>
                            Proceed to checkout
                        </button>

                        <Link to="/products" className="cart-continue-link">Continue shopping</Link>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default Cart;
