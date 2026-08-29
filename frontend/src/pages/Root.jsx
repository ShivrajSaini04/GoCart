import React, { useState, useEffect, useMemo } from 'react';
import { House, ShieldCheck, Truck } from 'lucide-react';
import '../style/root.css';
import ProductCard from '../components/ProductCard';
import apiService from '../services/api';
import Loading from '../components/Loading';
import { Link, useSearchParams } from 'react-router-dom';

const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
];

// Same photo treatment as the split cards on the home page, so the two pages match.
const banner = (id) => `https://images.unsplash.com/photo-${id}?q=85&w=1600&auto=format&fit=crop`;

const headerImages = {
    Men: banner('1552346154-21d32810aba3'),
    Women: banner('1595950653106-6c9ebd614d3a'),
    default: banner('1549298916-f52d724204b4'),
};

const sortProducts = (list, sortBy) => {
    const sorted = [...list];

    if (sortBy === 'price-low') {
        return sorted.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high') {
        return sorted.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating') {
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const Root = () => {
    // The category and search filters live in the URL, so the navbar drives them.
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || '';
    const searchTerm = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort') || 'newest';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await apiService.getAllProducts();
                setProducts(data);
            } catch (err) {
                setError('Failed to load products. Please try again.');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        let result = products;

        if (category) {
            result = result.filter(p => p.category === category);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.description.toLowerCase().includes(term)
            );
        }

        return sortProducts(result, sortBy);
    }, [products, category, searchTerm, sortBy]);

    const handleRetry = () => {
        window.location.reload();
    };

    const handleSortChange = (value) => {
        const next = new URLSearchParams(searchParams);
        next.set('sort', value);
        setSearchParams(next, { replace: true });
    };

    return (
        <div className="root-page">
            <div className="root-container">
                {/* Page Header */}
                <header
                    className="root-header"
                    style={{ backgroundImage: `url(${headerImages[category] || headerImages.default})` }}
                >
                    <div className="root-header-inner">
                        <nav className="root-crumbs" aria-label="Breadcrumb">
                            <Link to="/"><House size={15} /> Home</Link>
                            <span className="root-crumb-sep">/</span>
                            <span className="root-crumb-current">
                                {category || (searchTerm ? 'Search' : 'All Sneakers')}
                            </span>
                        </nav>
                        <div className="root-header-row">
                            <div className="root-header-title">
                                <span className="root-eyebrow">GoCart Sneakers</span>
                                <h1>
                                    {category
                                        ? <>{category}'s <em>Sneakers</em></>
                                        : searchTerm
                                            ? <>Results for <em>“{searchTerm}”</em></>
                                            : <>Designed to Be <em>Noticed</em></>}
                                </h1>
                            </div>
                            <ul className="root-header-meta">
                                <li><Truck size={15} /> Free shipping over ₹999</li>
                                <li><ShieldCheck size={15} /> 100% authentic</li>
                            </ul>
                        </div>
                    </div>
                </header>

                {/* Filter / sort bar */}
                {!loading && !error && (
                    <div className="filter-bar">
                        <span className="filter-bar-label">Sort by</span>
                        <div className="filter-chips">
                            {sortOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`filter-chip ${sortBy === opt.value ? 'active' : ''}`}
                                    onClick={() => handleSortChange(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="loading-container">
                        {/* <div className="spinner"></div> */}
                        <Loading />
                        <p className="loading-text">Loading amazing products...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h3 className="error-title">Oops! Something went wrong</h3>
                        <p className="error-message">{error}</p>
                        <button className="retry-btn" onClick={handleRetry}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* Results Info */}
                {/* {!loading && !error && (
                    <div className="results-info">
                        <span className="result-count">
                            Showing {filteredProducts.length} of {products.length} products
                        </span>
                    </div>
                )} */}

                {/* Products Grid */}
                {!loading && !error && filteredProducts.length > 0 && (
                    <div className="products-container">
                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product._id}
                                    {...product}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredProducts.length === 0 && (
                    <div className="empty-container">
                        <div className="empty-icon">🔍</div>
                        <h3 className="empty-title">No sneakers found</h3>
                        <p className="empty-message">
                            {searchTerm || category
                                ? "Try a different category or search term"
                                : "No sneakers available at the moment"}
                        </p>
                        {(searchTerm || category) && (
                            <button className="clear-filters-btn" onClick={() => setSearchParams({})}>
                                Show All Sneakers
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Root;
