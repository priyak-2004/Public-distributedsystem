import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const FraudStats = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        // Mock data or fetch aggregated
        // For demo, we can derive from transactions or fetch metrics
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const res = await axios.get('http://localhost:4000/dashboard-metrics');
            // Transform for chart
            const data = [
                { name: 'Legit', value: res.data.totalTransactions - res.data.fraudAlerts },
                { name: 'Fraud', value: res.data.fraudAlerts }
            ];
            setStats(data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Fraud vs Legit Distribution</h2>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {stats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 1 ? '#FF8042' : '#00C49F'} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FraudStats;
