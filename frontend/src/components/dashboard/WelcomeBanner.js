import React from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/WelcomeBanner.css';

const WelcomeBanner = () => {
    const { user } = useAuth();
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="welcome-banner card-base">
            <div className="banner-content">
                <h1>Good Evening, {user?.name?.split(' ')[0]} 👋</h1>
                <p>Here is what's happening with your store today, <span>{date}</span></p>
            </div>
            {/* Abstract decorative shapes */}
            <div className="banner-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>
        </div>
    );
};

export default WelcomeBanner;
