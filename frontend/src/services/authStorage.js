// Single place that owns the logged in session, shared by the api layer and the redux store
const TOKEN_KEY = 'gocartToken';
const USER_KEY = 'gocartUser';

export const readToken = () => localStorage.getItem(TOKEN_KEY);

export const readUser = () => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
};

export const writeSession = (user, token) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
};

export const clearSession = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
};
