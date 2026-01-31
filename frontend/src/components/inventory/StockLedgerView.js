import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StockLedgerForm from './StockLedgerForm';
import StockBalanceTable from './StockBalanceTable';
import LowStockWidget from './LowStockWidget';
import { getStockBalance } from '../../api/inventoryLedger';
import '../../styles/shared/PremiumShared.css';

const StockLedgerView = () => {
    const location = useLocation();
    const highlightId = location.state?.highlightId;
    const [refreshKey, setRefreshKey] = useState(0);
    const [stockItems, setStockItems] = useState([]);

    const handleSuccess = () => {
        // Trigger table refresh
        setRefreshKey(prev => prev + 1);
        loadStockData(); // Refresh widget data too
    };

    const loadStockData = async () => {
        try {
            const res = await getStockBalance();
            setStockItems(res.data.stock || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadStockData();
    }, [refreshKey]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column-reverse' }} className="stock-dashboard-layout">
            
            {/* Main Content: Stock Table */}
            {/* <div className="stock-main-content">
                <StockBalanceTable refreshTrigger={refreshKey} highlightId={highlightId} />
            </div> */}

            {/* Sidebar: Actions & Alerts */}
            <div className="stock-sidebar">
                <LowStockWidget stockItems={stockItems} />
                
                {/* Form in Sidebar - simplified layout */}
                <div className="sidebar-form-wrapper">
                    <StockLedgerForm onSuccess={handleSuccess} />
                </div>
            </div>
            
        </div>
    );
};

export default StockLedgerView;
