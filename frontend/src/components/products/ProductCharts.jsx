import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ProductCharts = ({ products }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (!products.length) return;

    const labels = products.map(p => p.name);
    const prices = products.map(p => p.vendor_price);
    const commissions = products.map(p => p.custom_commission);

    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Price', data: prices, backgroundColor: '#4f46e5' },
          { label: 'Commission', data: commissions, backgroundColor: '#f59e0b' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    return () => chart.destroy();
  }, [products]);

  return <canvas ref={chartRef} style={{ width: '100%', height: '300px' }} />;
};

export default ProductCharts;
