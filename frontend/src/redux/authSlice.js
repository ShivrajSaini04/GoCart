import { createSlice } from "@reduxjs/toolkit";
import { readUser, readToken, writeSession, clearSession } from "../services/authStorage";

const initialState = {
    user: readUser(),
    token: readToken()
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // takes the login/register response straight from the backend
        setCredentials: (state, action) => {
            const { token, ...user } = action.payload;
            state.user = user;
            state.token = token;
            writeSession(user, token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            clearSession();
        }
    }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
