import { useEffect, useState } from 'react';
import { ArrowLeft, Minus, Plus, RotateCcw, ShieldCheck, ShoppingCart, Star, Truck, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import apiService from '../services/api';
import '../style/showProduct.css';
import Loading from '../components/Loading';

const trustPoints = [
    { icon: Truck, label: 'Free shipping', note: 'On orders above ₹999' },
    { icon: RotateCcw, label: '7-day returns', note: 'Wrong size? Send it back' },
    { icon: ShieldCheck, label: '100% authentic', note: 'Sourced from brand partners' },
];

// GoCart lists sneakers in UK sizes; the schema has no per-size stock, so all are
// offered whenever the product itself is in stock.
const SIZES = [6, 7, 8, 9, 10, 11];

const ShowProduct = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState(null);
    const [sizeError, setSizeError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await apiService.getProductById(id);
                if (isMounted) setProduct(data);
            } catch (err) {
                if (isMounted) setError('We could not find this product. It may have been removed.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProduct();
        return () => { isMounted = false; };
    }, [id]);

    // A direct visit has no history to go back to, so the products page is the fallback.
    const goBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate('/products');
    };

    const changeQuantity = (amount) => {
        setQuantity((current) => Math.max(1, Math.min(product.stock, current + amount)));
    };

    const selectSize = (value) => {
        setSize(value);
        setSizeError(false);
    };

    const cartPayload = () => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        size,
        quantity
    });

    const handleAddToCart = () => {
        if (!size) { setSizeError(true); return false; }
        dispatch(addToCart(cartPayload()));
        return true;
    };

    const handleBuyNow = () => {
        if (handleAddToCart()) navigate('/checkout');
    };

    if (loading) {
        return (
            <main className="product-detail-page">
                <div className="product-detail-status">
                    <Loading />
                    <p>Loading product details...</p>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="product-detail-page">
                <div className="product-detail-status product-detail-error">
                    <h1>Product unavailable</h1>
                    <p>{error || 'This product could not be loaded.'}</p>
                    <button type="button" className="product-back-btn" onClick={goBack}>
                        <ArrowLeft size={17} /> Back
                    </button>
                </div>
            </main>
        );
    }

    const inStock = product.stock > 0;
    const lowStock = inStock && product.stock <= 5;
    const rating = Number(product.rating || 0);
    const inr = (value) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(value || 0);

    return (
        <main className="product-detail-page">
            <div className="product-detail-container">
                <div className="product-detail-topbar">
                    <button type="button" className="product-back-btn" onClick={goBack}>
                        <ArrowLeft size={17} /> Back
                    </button>
                    <span className="product-detail-crumb">{product.category} / {product.name}</span>
                </div>

                <section className="product-detail-card">
                    <div className="product-detail-image-wrap">
                        <span className="product-detail-badge">{product.category}</span>
                        <img
                            src={product.imageUrl || '/placeholder.jpg'}
                            alt={product.name}
                            className="product-detail-image"
                        />
                        {rating > 0 && (
                            <span className="product-detail-image-rating">
                                <Star size={14} fill="currentColor" /> {rating.toFixed(1)}
                            </span>
                        )}
                    </div>

                    <div className="product-detail-content">
                        <p className="product-detail-category">{product.category}'s Sneakers</p>
                        <h1>{product.name}</h1>

                        <div className="product-detail-meta">
                            {(rating > 0 || product.numReviews > 0) && (
                                <div className="product-detail-rating" aria-label={`${rating} out of 5 stars`}>
                                    <Star size={16} fill="currentColor" />
                                    <strong>{rating.toFixed(1)}</strong>
                                    <span>({product.numReviews || 0} reviews)</span>
                                </div>
                            )}
                            <span className={`product-detail-stock ${inStock ? (lowStock ? 'low' : 'available') : 'unavailable'}`}>
                                {inStock
                                    ? (lowStock ? `Only ${product.stock} left` : `In stock — ${product.stock} available`)
                                    : 'Out of stock'}
                            </span>
                        </div>

                        <div className="product-detail-price-row">
                            <p className="product-detail-price">{inr(product.price)}</p>
                            <span className="product-detail-tax">Inclusive of all taxes</span>
                        </div>

                        <p className="product-detail-description">{product.description}</p>

                        {inStock && (
                            <div className={`product-detail-sizes ${sizeError ? 'has-error' : ''}`}>
                                <div className="product-detail-sizes-head">
                                    <span className="product-detail-sizes-label">Select size (UK)</span>
                                    <span className="product-detail-sizes-guide">Size guide</span>
                                </div>
                                <div className="size-options" role="radiogroup" aria-label="Select shoe size">
                                    {SIZES.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            role="radio"
                                            aria-checked={size === value}
                                            className={`size-chip ${size === value ? 'active' : ''}`}
                                            onClick={() => selectSize(value)}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                                {sizeError && <p className="size-error">Please select a size to continue.</p>}
                            </div>
                        )}

                        {inStock ? (
                            <>
                                <div className="product-detail-actions">
                                    <div className="quantity-picker" aria-label="Quantity">
                                        <button type="button" onClick={() => changeQuantity(-1)} disabled={quantity === 1} aria-label="Decrease quantity"><Minus size={16} /></button>
                                        <span>{quantity}</span>
                                        <button type="button" onClick={() => changeQuantity(1)} disabled={quantity === product.stock} aria-label="Increase quantity"><Plus size={16} /></button>
                                    </div>
                                    <button type="button" className="product-detail-cart-button" onClick={handleAddToCart}>
                                        <ShoppingCart size={18} /> Add to cart
                                    </button>
                                    <button type="button" className="product-detail-buy-button" onClick={handleBuyNow}>
                                        <Zap size={18} /> Buy now
                                    </button>
                                </div>
                                <p className="product-detail-subtotal">
                                    Subtotal <strong>{inr(product.price * quantity)}</strong> for {quantity} {quantity === 1 ? 'pair' : 'pairs'}
                                </p>
                            </>
                        ) : (
                            <button type="button" className="product-detail-cart-button is-disabled" disabled>
                                Out of stock
                            </button>
                        )}

                        <ul className="product-detail-trust">
                            {trustPoints.map(({ icon: Icon, label, note }) => (
                                <li key={label}>
                                    <Icon size={18} />
                                    <div>
                                        <strong>{label}</strong>
                                        <span>{note}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ShowProduct;
