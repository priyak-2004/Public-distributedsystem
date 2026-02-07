import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { eventService } from '../services/api';
import { generateEventRecordedPDF } from '../services/pdfGenerator';
import QrCodeDisplay from './QrCodeDisplay';

const EventForm = () => {
  const { isConnected } = useWallet();
  const [eventType, setEventType] = useState('PDS_DISTRIBUTION');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // PDS Fields
  const [pdsData, setPdsData] = useState({
    beneficiaryId: '',
    shopId: 'SHOP-001',
    quantity: 10,
    region: 'Zone-1'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [eventResponse, setEventResponse] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handlePdsChange = (e) => {
    setPdsData({ ...pdsData, [e.target.name]: e.target.value });
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setEventResponse(null);

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet first.");
      }

      let metadata = {};

      if (eventType === 'PDS_DISTRIBUTION') {
        metadata = {
          type: 'PDS_DISTRIBUTION',
          data: {
            ...pdsData,
            timestamp: new Date().toISOString()
          }
        };
        // Simulated AI delay for UX
        await new Promise(r => setTimeout(r, 1000));

        const response = await eventService.distributePDS(pdsData);
        setEventResponse(response.event);
        setSuccess("Event Recorded Successfully");

      } else {
        // Generic Event Logic (File Upload)
        if (!file) throw new Error("Please select a file.");
        const content = await readFileAsText(file);
        metadata = {
          type: 'GENERIC_DOC',
          data: {
            fileName: file.name,
            fileType: file.type,
            contentPrefix: content.slice(0, 50),
            timestamp: new Date().toISOString()
          }
        };
        const response = await eventService.createEvent(eventType, metadata);
        setEventResponse(response.event);
        setSuccess("Event Created Successfully");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (eventResponse) {
      generateEventRecordedPDF(eventResponse);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Event Type Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-lg border border-gray-200 flex space-x-2">
          <button
            onClick={() => setEventType('PDS_DISTRIBUTION')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${eventType === 'PDS_DISTRIBUTION' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            PDS Distribution
          </button>
          <button
            onClick={() => setEventType('GENERIC')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${eventType === 'GENERIC' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Generic Event
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          {success ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{success}</h3>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                  <span className="font-semibold text-gray-500">IPFS Hash:</span>
                  <span className="font-mono text-gray-800 break-all">{eventResponse?.ipfsHash}</span>

                  <span className="font-semibold text-gray-500">Transaction Hash:</span>
                  <span className="font-mono text-gray-800 break-all">{eventResponse?.txHash}</span>
                </div>

                <div className="mt-4 flex justify-between items-end">
                  <div className="text-sm text-gray-500">Scan to verify authenticty</div>
                  <QrCodeDisplay data={eventResponse?.ipfsHash || ''} size={100} />
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={downloadReceipt}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setSuccess(null);
                    setEventResponse(null);
                    setFile(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Record Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {eventType === 'GENERIC' && (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <Upload />
                  </div>
                  <div className="mt-4 flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">Any file type supported</p>
                  {file && (
                    <div className="mt-4 flex items-center justify-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {file.name}
                    </div>
                  )}
                </div>
              )}

              {eventType === 'PDS_DISTRIBUTION' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Authority Monitoring Active</h3>
                        <p className="mt-1 text-sm text-blue-700">AI Fraud Detection Model v2.1 is active.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Beneficiary ID</label>
                      <input
                        type="text"
                        name="beneficiaryId"
                        value={pdsData.beneficiaryId}
                        onChange={handlePdsChange}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                        placeholder="Enter Ration Card No"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Shop ID</label>
                      <input
                        type="text"
                        name="shopId"
                        value={pdsData.shopId}
                        onChange={handlePdsChange}
                        className="mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={pdsData.quantity}
                        onChange={handlePdsChange}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Region</label>
                      <select
                        name="region"
                        value={pdsData.region}
                        onChange={handlePdsChange}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                      >
                        <option value="Zone-1">Zone-1 (Urban)</option>
                        <option value="Zone-2">Zone-2 (Rural)</option>
                        <option value="Zone-3">Zone-3 (Tribal)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200 text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading || !isConnected}
                  className={`w-full md:w-auto px-8 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(loading || !isConnected) && 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  {loading ? (
                    <><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 inline" />Processing...</>
                  ) : (
                    "Record Event"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventForm;
