export const FREE_SHIPPING_ABOVE = 999;
export const SHIPPING_FEE = 49;

export const formatPrice = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(value || 0);

// used by the cart and the checkout so both send the same total to the backend
export const getCartTotals = (cartItem) => {
    const subtotal = cartItem.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;

    return { subtotal, shipping, total: subtotal + shipping };
};
