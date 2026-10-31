import { useEffect, useMemo, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import { Link } from "react-router-dom";
import { ArrowRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import ProductCard from "../components/ProductCard";
import apiService from "../services/api";
import "../style/home.css";
import { categoryCard, hero_image } from "../assets/images/hero_image";

const heroSlides = hero_image();

const categoryCards = categoryCard();

const promises = [
    { icon: Truck, title: "Free shipping", text: "On every order above Rs. 999" },
    { icon: RotateCcw, title: "7-day returns", text: "Wrong size? Send it back" },
    { icon: ShieldCheck, title: "100% authentic", text: "Sourced from brand partners" },
];

// Root.jsx filters on name + description, so a brand search returns that brand's pairs.
const brands = ["Nike", "Jordan", "adidas", "Puma", "New Balance", "Vans"];

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await apiService.getAllProducts();
                setProducts(data);
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // The store sells shoes only, so anything left over from the old catalogue is skipped.
    const sneakers = useMemo(
        () => products.filter(p => p.category === "Men" || p.category === "Women"),
        [products]
    );

    const topRated = useMemo(
        () => [...sneakers].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4),
        [sneakers]
    );

    const newArrivals = useMemo(
        () => [...sneakers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4),
        [sneakers]
    );


    return (
        <main className="home-page">
            <section className="home-hero" aria-label="Featured collections">
                <Carousel className="hero-carousel" interval={4500} pause="hover">
                    {heroSlides.map((slide) => (
                        <Carousel.Item key={slide.title}>
                            <div className={`hero-slide ${slide.theme}`}>
                                <div className="hero-copy">
                                    <span className="hero-eyebrow">{slide.eyebrow}</span>
                                    <h2 className="hero-title">{slide.title}</h2>
                                    <p className="hero-text">{slide.text}</p>
                                    <Link className="hero-cta" to={slide.to}>
                                        {slide.cta}
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                                <div className="hero-visual">
                                    <img src={slide.image} alt={slide.alt} />
                                </div>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </section>

            <section className="promise-strip" aria-label="Why shop with GoCart">
                {promises.map(({ icon: Icon, title, text }) => (
                    <div className="promise-item" key={title}>
                        <Icon size={22} />
                        <div>
                            <strong>{title}</strong>
                            <span>{text}</span>
                        </div>
                    </div>
                ))}
            </section>

            <section className="home-section" id="categories">
                <div className="section-heading">
                    <h2>Shop by Category</h2>
                    <Link to="/products">View all</Link>
                </div>
                <div className="category-grid">
                    {categoryCards.map((card) => (
                        <Link className="category-card" to={card.to} key={card.label}>
                            <div className="category-thumb">
                                <img src={card.image} alt={card.alt} />
                            </div>
                            <div className="category-body">
                                <h3>{card.label}</h3>
                                <p>{card.note}</p>
                                <span className="category-link">
                                    Shop now
                                    <ArrowRight size={15} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="brand-strip" aria-label="Shop by brand">
                <span className="brand-strip-label">Shop by brand</span>
                <div className="brand-chips">
                    {brands.map((brand) => (
                        <Link
                            className="brand-chip"
                            to={`/products?search=${encodeURIComponent(brand)}`}
                            key={brand}
                        >
                            {brand}
                        </Link>
                    ))}
                </div>
            </section>

            <section className="home-section" id="trending">
                <div className="section-heading">
                    <h2>Trending Now</h2>
                    <Link to="/products?sort=rating">See more</Link>
                </div>
                {loading ? (
                    <p className="home-status">Loading sneakers...</p>
                ) : (
                    <div className="home-product-grid">
                        {topRated.map((product) => (
                            <ProductCard key={product._id} {...product} />
                        ))}
                    </div>
                )}
            </section>

            <section className="home-section" id="new-arrivals">
                <div className="section-heading">
                    <h2>Just Dropped</h2>
                    <Link to="/products">See more</Link>
                </div>
                {loading ? (
                    <p className="home-status">Loading sneakers...</p>
                ) : (
                    <div className="home-product-grid">
                        {newArrivals.map((product) => (
                            <ProductCard key={product._id} {...product} />
                        ))}
                    </div>
                )}
            </section>

            <section className="split-promo" aria-label="Shop by collection">
                <Link className="split-card split-men" to="/products?category=Men">
                    <div className="split-copy">
                        <span className="split-eyebrow">Men</span>
                        <h3>Built for the court</h3>
                        <span className="split-link">Shop Men<ArrowRight size={16} /></span>
                    </div>
                </Link>
                <Link className="split-card split-women" to="/products?category=Women">
                    <div className="split-copy">
                        <span className="split-eyebrow">Women</span>
                        <h3>Soft on the eye</h3>
                        <span className="split-link">Shop Women<ArrowRight size={16} /></span>
                    </div>
                </Link>
            </section>

            <section className="home-cta" aria-label="Browse the full range">
                <h2>Every silhouette. Both collections.</h2>
                <p>Twenty-four pairs across men's and women's, from skate classics to flagship retros.</p>
                <Link className="home-cta-btn" to="/products">
                    Browse all sneakers
                    <ArrowRight size={18} />
                </Link>
            </section>
        </main>
    );
};

export default Home;
