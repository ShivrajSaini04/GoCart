// API Service for GoCart Backend
import { readToken } from './authStorage';

// the backend listens on port 8080; override with VITE_API_URL when it runs elsewhere
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const request = async (path, { method = 'GET', body, auth = false } = {}) => {
    const headers = {};

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    if (auth) {
        const token = readToken();
        if (!token) throw new Error('Please log in to continue');
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });
    } catch {
        // fetch only rejects when the request never reached a server
        throw new Error(`Cannot reach the GoCart server at ${API_BASE_URL}. Start the backend and try again.`);
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
        // every GoCart route answers with JSON, so anything else is a different app on this port
        throw new Error(`${API_BASE_URL} is not answering as the GoCart API. Check which app is using that port.`);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        // the backend replies with { message } on most routes and { error } on payment routes
        throw new Error(data?.message || data?.error || 'Something went wrong. Please try again.');
    }

    return data;
};

export const apiService = {
    // Products
    getAllProducts: () => request('/products'),

    getProductById: (id) => request(`/products/${id}`),

    // Auth
    login: (email, password) =>
        request('/auth/login', { method: 'POST', body: { email, password } }),

    signup: (name, email, password) =>
        request('/auth/register', { method: 'POST', body: { name, email, password } }),

    verifyOtp: (email, otp) =>
        request('/auth/verify-otp', { method: 'POST', body: { email, otp } }),

    resendOtp: (email) =>
        request('/auth/resend-otp', { method: 'POST', body: { email } }),

    // Orders — the backend reads the capitalised Items and Address keys
    createOrder: ({ items, address, paymentId, totalAmount }) =>
        request('/orders', {
            method: 'POST',
            auth: true,
            body: { Items: items, Address: address, paymentId, totalAmount }
        }),

    getMyOrders: (userId) => request(`/orders/${userId}/myorders`, { auth: true }),

    // Payment
    createPaymentOrder: (amount) =>
        request('/payment/order', { method: 'POST', auth: true, body: { amount } }),

    verifyPayment: (payment) =>
        request('/payment/verify', { method: 'POST', auth: true, body: payment }),

    // Products (admin) — multipart/form-data for image upload
    createProduct: (formData) =>
        fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${readToken()}`
            },
            body: formData
        }).then(async (response) => {
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to create product');
            }
            return data;
        })
};

export default apiService;
