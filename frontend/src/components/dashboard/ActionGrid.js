import React from 'react';
import ActionCard from '../ui/ActionCard';
import { faCashRegister, faWallet, faBoxesStacked, faFileLines } from '@fortawesome/free-solid-svg-icons';

const ActionGrid = () => {
    const actions = [
        { label: 'New Sale', icon: faCashRegister, path: '/pos', color: 'success' },
        { label: 'Log Expense', icon: faWallet, path: '/expenses', color: 'primary' }, // Brand red
        { label: 'Stock Entry', icon: faBoxesStacked, path: '/inventory', color: 'warning' },
        { label: 'View Reports', icon: faFileLines, path: '/reports', color: 'primary' }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {actions.map((action, index) => (
                <ActionCard 
                    key={index}
                    label={action.label}
                    icon={action.icon}
                    path={action.path}
                    color={action.color}
                />
            ))}
        </div>
    );
};

export default ActionGrid;
