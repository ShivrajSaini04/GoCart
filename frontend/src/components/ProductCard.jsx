
import '../style/productCard.css';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({
    _id,
    name,
    description,
    price,
    category,
    stock,
    imageUrl,
    rating = 0,
    numReviews = 0,
    onAddToCart,
    onWishlist
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const showProduct = (event) => {
        if (event.target.closest('button')) return;
        navigate(`/products/${_id}`);
    };

    const handleAddToCart = () => {
        if (stock > 0) {
            const productData = {
                _id,
                name,
                price,
                imageUrl,
                quantity: 1
            };

            // Dispatch to Redux cart
            dispatch(addToCart(productData));

            // Call custom callback if provided
            if (onAddToCart) {
                onAddToCart(productData);
            }
        }
    };

    const handleBuyNow = () => {
        if (stock > 0) {
            dispatch(addToCart({ _id, name, price, imageUrl, quantity: 1 }));
            navigate('/checkout');
        }
    };

    const handleWishlist = () => {
        if (onWishlist) {
            onWishlist({ _id, name, imageUrl, price });
        }
    };

    const stockStatus = stock > 0 ? 'In Stock' : 'Out of Stock';
    const isOutOfStock = stock === 0;

    return (
        <div
            className="product-card"
            onClick={showProduct}
            onKeyDown={(event) => event.key === 'Enter' && showProduct(event)}
            role="link"
            tabIndex={0}
            aria-label={`View ${name} details`}
        >
            <div className="product-image-container">
                <img src={imageUrl || '/placeholder.jpg'} alt={name} />
                {isOutOfStock && <div className="product-badge out-of-stock">Out of Stock</div>}
                {stock < 5 && stock > 0 && <div className="product-badge low-stock">Only {stock} Left</div>}
                <button
                    className="btn-wishlist"
                    onClick={handleWishlist}
                    title="Add to Wishlist"
                    aria-label="Add to wishlist"
                >
                    ♡
                </button>
            </div>

            <div className="product-info">
                <h3 className="product-name">{name || 'Product Name'}</h3>

                {description && <p className="product-description">{description}</p>}

                {(rating > 0 || numReviews > 0) && (
                    <div className="product-rating">
                        <span className="rating-stars">
                            {'★'.repeat(Math.floor(rating))}
                            {'☆'.repeat(5 - Math.floor(rating))}
                        </span>
                        <span className="rating-count">({numReviews})</span>
                    </div>
                )}

                <div className="product-price-section">
                    <span className="product-price">₹{price || '0'}</span>
                    <span className={`stock-status ${isOutOfStock ? 'out-of-stock' : ''}`}>
                        {stockStatus}
                    </span>
                </div>

                <div className="product-actions">
                    <button
                        className="btn-add-to-cart"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                    >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                        className="btn-buy-now"
                        onClick={handleBuyNow}
                        disabled={isOutOfStock}
                    >
                        Buy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
