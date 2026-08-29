import { Link } from 'react-router-dom';
import '../style/page.css';

const sections = [
    {
        title: 'What we collect',
        body: [
            'Account details: your name, email address and a password that is stored only as a bcrypt hash. We never keep the password you type.',
            'Order details: the items you buy, the quantity and price of each item, your order total and the shipping address you enter at checkout.',
            'Payment reference: the payment id returned by Razorpay after a successful payment. Card and UPI details are handled by Razorpay and never reach our servers.'
        ]
    },
    {
        title: 'How we use it',
        body: [
            'To create your account and keep you logged in on this device.',
            'To process orders, send the confirmation email and update you as the order status changes.',
            'To keep an accurate record of stock and past purchases on your account.'
        ]
    },
    {
        title: 'Stored on your device',
        body: [
            'Your login token and basic profile are saved in your browser so you stay signed in between visits.',
            'Your cart is also stored in your browser, which is how items survive a page refresh.',
            'Logging out clears the token and profile immediately.'
        ]
    },
    {
        title: 'Who else is involved',
        body: [
            'Razorpay processes payments and receives the amount and order reference.',
            'Cloudinary hosts product images.',
            'Our email provider delivers registration and order emails to your inbox.'
        ]
    },
    {
        title: 'Your choices',
        body: [
            'You can ask us to remove your account and order history by writing to support@gocart.in.',
            'You can clear the cart and log out at any time to remove the data held in your browser.',
            'We do not sell your personal data to anyone.'
        ]
    }
];

const PrivacyPolicy = () => (
    <main className="static-page">
        <div className="static-container">
            <header className="static-header">
                <p className="static-eyebrow">Legal</p>
                <h1>Privacy Policy</h1>
                <p className="static-intro">
                    This page explains what GoCart stores when you shop with us, why we store it, and
                    what stays on your own device. Last updated August 2026.
                </p>
            </header>

            {sections.map((section) => (
                <section className="static-section" key={section.title}>
                    <h2>{section.title}</h2>
                    <ul className="static-list">
                        {section.body.map((line) => <li key={line}>{line}</li>)}
                    </ul>
                </section>
            ))}

            <section className="static-section">
                <h2>Contact</h2>
                <p>
                    Questions about this policy can go to
                    <a href="mailto:support@gocart.in"> support@gocart.in</a>, or read more
                    <Link to="/about"> about who we are</Link>.
                </p>
            </section>
        </div>
    </main>
);

export default PrivacyPolicy;
