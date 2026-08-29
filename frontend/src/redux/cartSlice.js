import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItem: localStorage.getItem("cartItem")
        ? JSON.parse(localStorage.getItem("cartItem"))
        : []
};

// A shoe in two different sizes is two different cart lines, so the line identity
// is the product id plus the chosen size (falling back to the id for items with
// no size, e.g. added straight from a product card).
const keyOf = (item) => item.cartKey || `${item._id}__${item.size || 'default'}`;

const persist = (state) => {
    localStorage.setItem('cartItem', JSON.stringify(state.cartItem));
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const cartKey = keyOf(item);
            const existItem = state.cartItem.find((x) => keyOf(x) === cartKey);
            // Adding a product that is already in the cart is a no-op: the quantity
            // is only ever changed from the cart's own +/- controls, so clicking
            // "Add to cart" again never bumps the count.
            if (!existItem) {
                state.cartItem.push({ ...item, cartKey, quantity: item.quantity || 1 });
                persist(state);
            }
        },
        removeFromCart: (state, action) => {
            const key = action.payload;
            state.cartItem = state.cartItem.filter((x) => keyOf(x) !== key);
            persist(state);
        },
        updateCartQuantity: (state, action) => {
            const { cartKey, quantity } = action.payload;
            const item = state.cartItem.find((x) => keyOf(x) === cartKey);
            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    state.cartItem = state.cartItem.filter((x) => keyOf(x) !== cartKey);
                }
            }
            persist(state);
        },
        clearCart: (state) => {
            state.cartItem = [];
            localStorage.removeItem('cartItem');
        }
    }

});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
