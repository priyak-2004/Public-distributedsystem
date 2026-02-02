import React, { useState, useEffect } from 'react';
import { Clock, Loader2, AlertCircle } from 'lucide-react';
import { eventService } from '../services/api';
import TransactionCard from './TransactionCard';
import { generateEventRecordedPDF } from '../services/pdfGenerator';

const EventTimeline = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getAllEvents();
      const sortedEvents = data.sort((a, b) => {
        const timestampA = a.timestamp?.toString() || '0';
        const timestampB = b.timestamp?.toString() || '0';
        return timestampB.localeCompare(timestampA);
      });
      setEvents(sortedEvents);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (event) => {
    generateEventRecordedPDF(event);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Processing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Event Timeline
        </h1>
        <p className="text-gray-600">
          Secure, immutable record of all PDS distributions.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No events recorded</h2>
          <p className="text-gray-500">Start by creating a new distribution event.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => {
            const cardData = {
              txHash: event.txHash || event.hash || 'PENDING',
              riskLevel: event.riskLevel || 'LOW',
              shopId: event.shopId || 'N/A',
              quantity: event.quantity || 0,
              timestamp: event.timestamp ? Number(event.timestamp) * 1000 : Date.now(),
              ipfsHash: event.ipfsHash || 'N/A',
              fraudScore: event.fraudScore || 0
            };

            return (
              <TransactionCard
                key={index}
                transaction={cardData}
                onDownloadReceipt={() => handleDownloadReceipt(event)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventTimeline;
