import { Link } from 'react-router-dom';
import { CreditCard, Headphones, ShieldCheck, Truck } from 'lucide-react';
import '../style/page.css';

const values = [
    { icon: Truck, title: 'Fast delivery', text: 'Orders leave our warehouse within 24 hours and ship free above ₹999.' },
    { icon: ShieldCheck, title: 'Secure checkout', text: 'Payments are handled by Razorpay, so your card details never reach us.' },
    { icon: CreditCard, title: 'Easy payments', text: 'Pay by card, UPI, netbanking, wallet, or simply pay on delivery.' },
    { icon: Headphones, title: 'Real support', text: 'A support team that answers questions about orders, returns and refunds.' }
];

const About = () => (
    <main className="static-page">
        <div className="static-container">
            <header className="static-header">
                <p className="static-eyebrow">About us</p>
                <h1>Shopping that stays simple</h1>
                <p className="static-intro">
                    GoCart is an online store built around one idea: finding the right product should
                    take minutes, not afternoons. We stock electronics, fashion, home essentials and
                    accessories, and we keep the buying part short.
                </p>
            </header>

            <section className="static-section">
                <h2>What we care about</h2>
                <div className="static-grid">
                    {values.map(({ icon: Icon, title, text }) => (
                        <article className="static-card" key={title}>
                            <Icon size={22} />
                            <h3>{title}</h3>
                            <p>{text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="static-section">
                <h2>How we work</h2>
                <p>
                    Every product listed on GoCart is checked for stock before it goes live, so the
                    availability you see on a product page is the availability in our warehouse. When
                    you place an order you get a confirmation email with the items, the total and the
                    shipping address, and the order status moves from pending to shipped to delivered
                    as it travels to you.
                </p>
                <p>
                    We are a small team, which means feedback reaches the people who can act on it.
                    If something about your order looks wrong, write to
                    <a href="mailto:support@gocart.in"> support@gocart.in</a> and we will sort it out.
                </p>
            </section>

            <section className="static-cta">
                <h2>Ready to look around?</h2>
                <p>Browse the full catalogue and see what fits.</p>
                <Link to="/products" className="static-cta-btn">Shop all products</Link>
            </section>
        </div>
    </main>
);

export default About;
