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
        <div className="stock-ledger-view">
            <div className="ledger-top-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: '24px',
                marginBottom: '24px'
            }}>
                {/* 1. Entry Form (Left) */}
                <section style={{ flex: 2 }}>
                    <StockLedgerForm onSuccess={handleSuccess} />
                </section>

                {/* 2. Low Stock Widget (Right) */}
                <section style={{ flex: 1 }}>
                    <LowStockWidget stockItems={stockItems} />
                </section>
            </div>

            {/* 3. Balance Table (Full Width) */}
            <section className="ledger-table-section">
                <StockBalanceTable refreshTrigger={refreshKey} highlightId={highlightId} />
            </section>
        </div>
    );
};

export default StockLedgerView;
