import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Activity, ShieldAlert, TrendingUp } from 'lucide-react';

const PDSDashboard = () => {

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Activity className="mr-2 h-8 w-8 text-blue-600" />
                        Authority Dashboard
                    </h1>
                    <p className="text-gray-600">Real-time oversight for Authority Admins</p>
                </div>
                <Link
                    to="/add-event"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                >
                    <PlusCircle className="h-5 w-5" />
                    <span>New Distribution</span>
                </Link>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">1,284</h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Fraud Alerts</p>
                            <h3 className="text-2xl font-bold text-red-600 mt-1">12</h3>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Shops</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">42</h3>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>


            {/* Trust and Risk Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Shop Trust Score */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Shop Trust Score</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left text-gray-500">Shop ID</th>
                                    <th className="p-3 text-left text-gray-500">Trust Score</th>
                                    <th className="p-3 text-left text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="p-3 font-mono text-gray-900">SHOP-001</td>
                                    <td className="p-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500">9.8/10</span>
                                    </td>
                                    <td className="p-3"><span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">TRUSTED</span></td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono text-gray-900">SHOP-042</td>
                                    <td className="p-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500">6.5/10</span>
                                    </td>
                                    <td className="p-3"><span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">WATCH</span></td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono text-gray-900">SHOP-X99</td>
                                    <td className="p-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500">1.2/10</span>
                                    </td>
                                    <td className="p-3"><span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">BLOCKED</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Region Risk Heatmap (List Representation) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Regional Fraud Analytics</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg text-center border border-red-100">
                            <h3 className="text-sm font-bold text-red-800">Zone-3 (Tribal)</h3>
                            <p className="text-2xl font-bold text-red-600 mt-2">HIGH</p>
                            <p className="text-xs text-gray-500 mt-1">Avg Risk: 0.82</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg text-center border border-yellow-100">
                            <h3 className="text-sm font-bold text-yellow-800">Zone-2 (Rural)</h3>
                            <p className="text-2xl font-bold text-yellow-600 mt-2">MED</p>
                            <p className="text-xs text-gray-500 mt-1">Avg Risk: 0.45</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg text-center border border-green-100 col-span-2">
                            <h3 className="text-sm font-bold text-green-800">Zone-1 (Urban)</h3>
                            <p className="text-2xl font-bold text-green-600 mt-2">LOW</p>
                            <p className="text-xs text-gray-500 mt-1">Avg Risk: 0.12</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDSDashboard;
