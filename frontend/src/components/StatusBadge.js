import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ type, variant = 'risk' }) => {

    // Normalized type/score handling
    let colorClass = 'bg-gray-100 text-gray-800';
    let Icon = AlertCircle;
    let label = type;

    if (variant === 'risk') {
        const risk = String(type).toUpperCase();
        if (risk === 'HIGH') {
            colorClass = 'bg-red-100 text-red-800 border border-red-200';
            Icon = AlertCircle;
            label = "HIGH";
        } else if (risk === 'MEDIUM') {
            colorClass = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            Icon = AlertTriangle;
            label = "MEDIUM";
        } else {
            colorClass = 'bg-green-100 text-green-800 border border-green-200';
            Icon = CheckCircle;
            label = "LOW";
        }
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            <Icon className="w-3 h-3 mr-1" />
            {label}
        </span>
    );
};

export default StatusBadge;
