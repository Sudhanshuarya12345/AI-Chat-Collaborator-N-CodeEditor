import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../context/user.context.jsx'
import { useNavigate } from'react-router-dom';
import axios from '../config/axios.js';

const UserAuth = ({ children }) => {
    const { user, setUser } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const authenticate = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                if (isMounted) setLoading(false);
                navigate('/login');
                return;
            }

            if (user) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                const res = await axios.get('/users/profile');
                if (res?.data?.user) {
                    setUser(res.data.user);
                } else {
                    navigate('/login');
                }
            } catch (err) {
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                navigate('/login');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        authenticate();

        return () => {
            isMounted = false;
        };
    }, [navigate, setUser, user])
    
    if(loading) return <h1>Loading...</h1>

    return (
        <div>
            <>
                {children}
            </>
        </div>
    )
}

export default UserAuth
