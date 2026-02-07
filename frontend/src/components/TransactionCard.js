import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, ExternalLink, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import QrCodeDisplay from './QrCodeDisplay';

const TransactionCard = ({ transaction, onDownloadReceipt }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 transition-all duration-200 hover:shadow-md">
            {/* Card Header (Always Visible) */}
            <div
                className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer"
                onClick={toggleExpand}
            >
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-gray-500">
                            {transaction.txHash ? `EVT-${transaction.txHash.slice(0, 8)}` : 'PENDING'}
                        </span>
                        <StatusBadge type={transaction.riskLevel} />
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-700">
                        <span className="font-semibold">Shop ID: {transaction.shopId}</span>
                        <span>Quantity: {transaction.quantity} kg</span>
                        <span className="text-gray-500 text-xs">
                            {new Date(transaction.timestamp).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDownloadReceipt(transaction); }}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        aria-label="Download PDF"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Download PDF</span>
                    </button>
                    {expanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
            </div>

            {/* Expanded Details (Drawer) */}
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 rounded-b-lg animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Col */}
                        <div className="space-y-3">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Timeline</h4>
                                <p className="text-sm text-gray-800 break-all">{transaction.txHash}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">IPFS</h4>
                                <a href={`https://ipfs.io/ipfs/${transaction.ipfsHash}`} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-sm text-blue-600 break-all hover:underline">
                                    <ExternalLink className="h-3 w-3" />
                                    <span>{transaction.ipfsHash}</span>
                                </a>
                            </div>
                        </div>

                        {/* Right Col */}
                        <div className="space-y-3">
                            <div className="bg-white p-3 rounded border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-500 mb-2">AI Analysis</h4>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Fraud Score:</span>
                                    <span className={`font-mono font-bold ${transaction.fraudScore > 0.7 ? 'text-red-600' : 'text-green-600'}`}>
                                        {transaction.fraudScore}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-600">Risk Assessment:</span>
                                    <span className="font-medium text-gray-800">{transaction.riskLevel}</span>
                                </div>
                            </div>

                            {/* Restored QR Code Feature */}
                            <div className="bg-white p-3 rounded border border-gray-200 flex flex-col items-center">
                                <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Digital Certificate QR</h4>
                                <QrCodeDisplay data={transaction.ipfsHash || transaction.txHash} size={100} />
                                <span className="text-[10px] text-gray-400 mt-1 font-mono">Scan to Verify</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionCard;
