import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/components/StatCard.css';

const StatCard = ({ title, value, icon, trend, trendValue, subtitle, color = 'primary' }) => {
    return (
        <div className={`stat-card card-base ${color}`}>
            <div className="stat-content">
                <span className="stat-title">{title}</span>
                <div className="stat-value">{value}</div>
                
                {trend && (
                    <div className={`stat-trend ${trend}`}>
                        {trend === 'up' ? '▲' : '▼'} {trendValue}
                    </div>
                )}
                
                {subtitle && !trend && (
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                        {subtitle}
                    </div>
                )}
            </div>
            
            <div className="stat-icon-wrapper">
                <FontAwesomeIcon icon={icon} className="stat-icon" />
            </div>
            
            {/* Background decoration */}
            <div className="stat-bg-blob"></div>
        </div>
    );
};

export default StatCard;
