const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

// the razorpay widget is only pulled in when the shopper picks online payment
export const loadRazorpayCheckout = () => new Promise((resolve) => {
    if (window.Razorpay) {
        resolve(true);
        return;
    }

    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
});
