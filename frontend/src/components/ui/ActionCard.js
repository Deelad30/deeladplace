import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/components/ActionCard.css';

const ActionCard = ({ label, icon, path, color = 'primary' }) => {
    return (
        <Link to={path} className={`action-card ${color}`}>
            <div className="action-icon-box">
                <FontAwesomeIcon icon={icon} iconSize="lg" />
            </div>
            <span className="action-label">{label}</span>
        </Link>
    );
};

export default ActionCard;
