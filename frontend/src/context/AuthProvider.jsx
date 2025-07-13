import React, {useState, useEffect, useCallback} from 'react';
import axios from '../api/axios';
import {AuthContext} from './AuthContext';


const authChannel = new BroadcastChannel('auth_channel');

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    // Add a loading state to prevent UI flicker on initial page load
    const [loading, setLoading] = useState(true);

    // Centralized function to fetch user data and set state
    const fetchUser = useCallback(async (token) => {
        try {
            const res = await axios.get('/auth/user/me', {
                headers: {Authorization: `Bearer ${token}`}
            });
            setUser(res.data);
        } catch {
            // If token is invalid, clear it and log out the user
            localStorage.removeItem('token');
            setUser(null);
        }
    }, []);

    // Effect to handle messages from other tabs
    useEffect(() => {
        const handleAuthChange = (event) => {
            const {type, token} = event.data;
            if (type === 'logout') {
                // Another tab logged out, so we update our state
                setUser(null);
            } else if (type === 'login' && token) {
                // Another tab logged in, so we sync our state
                localStorage.setItem('token', token); // Ensure our localStorage is also synced
                fetchUser(token);
            }
        };

        authChannel.addEventListener('message', handleAuthChange);

        // Cleanup listener on component unmount
        return () => {
            authChannel.removeEventListener('message', handleAuthChange);
        };
    }, [fetchUser]);

    // Effect for the very first load of the application
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            fetchUser(storedToken).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [fetchUser]);

    const login = async (email, password) => {
      try {
        const form = new URLSearchParams();
        form.append('username', email); // OAuth expects 'username'
        form.append('password', password);

        const res = await axios.post('/auth/token', form, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { access_token } = res.data;
        localStorage.setItem('token', access_token);
        // Notify other tabs that a login occurred
        authChannel.postMessage({ type: 'login', token: access_token });
        await fetchUser(access_token); // Set user state
      } catch (err) {
        console.error(err);
        // Re-throw the error so the UI component can handle it
        throw new Error(err.response?.data?.detail || 'Login failed');
      }
    };

    const register = async (payload) => {
        try {
            const res = await axios.post('/auth/register', payload);
            const {access_token} = res.data;
            localStorage.setItem('token', access_token);
            // Notify other tabs that a login occurred
            authChannel.postMessage({type: 'login', token: access_token});
            await fetchUser(access_token);
        } catch (err) {
            console.error(err);
            throw new Error(err.response?.data?.detail || 'Registration failed');
        }
    };

    const logout = () => {
        // Notify other tabs FIRST, before removing the token
        authChannel.postMessage({type: 'logout'});
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, loading, login, register, logout}}>
            {/* Don't render children until we've checked for a token */}
            {!loading && children}
        </AuthContext.Provider>
    );
};
