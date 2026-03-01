import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, RefreshCw } from 'lucide-react';
import { REGIONS } from '../constants/regions';
import { SHOPS } from '../constants/shops';
import { useWallet } from '../context/WalletContext';
import { eventService } from '../services/api';
import { generateEventRecordedPDF } from '../services/pdfGenerator';
import QrCodeDisplay from './QrCodeDisplay';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000'; // Or from env

const EventForm = () => {
  const { isConnected } = useWallet();
  const { t } = useTranslation();
  const [eventType, setEventType] = useState('PDS_DISTRIBUTION'); // Default to PDS
  const [file, setFile] = useState(null);

  // PDS Fields
  const [pdsData, setPdsData] = useState({
    beneficiaryId: '',
    shopId: 'SHOP-001',
    quantity: 10,
    commodity: 'rice', // Default commodity
    region: 'Zone-1'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [eventResponse, setEventResponse] = useState(null); // Blockchain/Backend response

  // Stock & Quota State
  const [shopStock, setShopStock] = useState(null);
  const [beneficiaryUsage, setBeneficiaryUsage] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);

  // Validations
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (eventType === 'PDS_DISTRIBUTION') {
      fetchStock(pdsData.shopId);
    }
  }, [pdsData.shopId, eventType]);

  useEffect(() => {
    if (eventType === 'PDS_DISTRIBUTION' && pdsData.beneficiaryId.length > 3) {
      // Debounce or just fetch if valid length
      const timer = setTimeout(() => {
        fetchBeneficiaryUsage(pdsData.beneficiaryId);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pdsData.beneficiaryId, eventType]);

  // Validation Effect
  useEffect(() => {
    validateTransaction();
  }, [pdsData, shopStock, beneficiaryUsage]);


  const fetchStock = async (shopId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pds/stock/${shopId}`);
      setShopStock(res.data);
    } catch (err) {
      console.error("Failed to fetch stock", err);
    }
  };

  const fetchBeneficiaryUsage = async (benId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pds/beneficiary/${benId}`);
      setBeneficiaryUsage(res.data);
    } catch (err) {
      console.error("Failed to fetch beneficiary usage", err);
    }
  };

  const validateTransaction = () => {
    setValidationError(null);
    if (eventType !== 'PDS_DISTRIBUTION') return;

    const qty = Number(pdsData.quantity);
    const comm = pdsData.commodity;

    if (qty <= 0) return; // Ignore invalid input for now

    // Check Stock
    if (shopStock && shopStock[comm] !== undefined) {
      if (qty > shopStock[comm]) {
        setValidationError(`Insufficient stock at this shop. Only ${shopStock[comm]} kg available.`);
        return;
      }
    }

    // Check Quota
    if (beneficiaryUsage) {
      const limit = beneficiaryUsage.quota[comm];
      const used = beneficiaryUsage.usage[comm];
      const remaining = beneficiaryUsage.remaining[comm];

      if (qty > remaining) {
        setValidationError(`Monthly quota exceeded for ${comm}. Remaining: ${remaining} kg.`);
        return;
      }
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

  const handleShopChange = (e) => {
    const selectedShopId = e.target.value;
    const shop = SHOPS.find(s => s.id === selectedShopId);
    const region = REGIONS.find(r => r.id === shop.regionId);

    setPdsData({
      ...pdsData,
      shopId: selectedShopId,
      region: region.name,
      regionRisk: region.risk // Pass risk to backend
    });
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setEventResponse(null);

    // Initial check
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (eventType === 'PDS_DISTRIBUTION') {
        // Unifed PDS Flow
        const response = await eventService.distributePDS({
          ...pdsData,
          // Add dummy AI params if needed or let backend default
          regionRisk: 0,
          shopFrequency: 1,
          monthlyTotal: 0,
          timeGap: 720
        });

        if (response.success) {
          setSuccess(response.message);
          setEventResponse({
            ...pdsData, // Snapshot current PDS data before clearing
            eventType: 'PDS_DISTRIBUTION',
            timestamp: Date.now(),
            // Unify keys for PDF generator
            txHash: response.txHash,
            ipfsHash: response.ipfsHash,
            // Keep original keys if needed for display, but prefer unified
            transactionHash: response.txHash,
            metadataHash: response.ipfsHash,
            // fraud details
            fraudScore: response.fraudScore,
            riskLevel: response.riskLevel,
            reasons: response.reasons // Capture AI reasons
          });

          // Refresh data
          fetchStock(pdsData.shopId);
          fetchBeneficiaryUsage(pdsData.beneficiaryId);

        } else {
          setError("Distribution Failed: " + response.message || "Unknown error");
        }

      } else {
        // Standard Event Flow
        if (!isConnected) {
          throw new Error('Please connect your wallet first');
        }
        if (!file) throw new Error('Please select a file to upload');

        let metadata;

        if (file.type.startsWith('text/') || file.type === 'application/json') {
          const fileContent = await readFileAsText(file);
          metadata = JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            content: fileContent,
            size: file.size,
          });
        } else {
          const base64Content = await readFileAsBase64(file);
          metadata = JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            content: base64Content,
            size: file.size,
          });
        }

        const response = await eventService.createEvent(eventType, metadata);
        setEventResponse({
          ...response,
          eventType: eventType, // Ensure type is captured
          txHash: response.transactionHash,
          ipfsHash: response.metadataHash,
          timestamp: Date.now()
        });
        setSuccess('Event created successfully!');
        setFile(null);
      }
      e.target.reset(); // This might wipe PDS state, handled below
      if (eventType === 'PDS_DISTRIBUTION') {
        // Keep some fields?
        setPdsData({ ...pdsData, beneficiaryId: '' }); // Clear ben ID only
        setBeneficiaryUsage(null); // specific to ben
      }

    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to create event'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="card">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {eventType === 'PDS_DISTRIBUTION' ? 'PDS Distribution' : 'Add New Event'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {eventType === 'PDS_DISTRIBUTION'
              ? 'Process a distribution. AI will analyze for fraud before recording on Blockchain.'
              : 'Upload a file and specify an event type to record on the unified ledger.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Event Source / Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="input-field dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              disabled={loading}
            >
              <option value="PDS_DISTRIBUTION">PDS Distribution</option>
              <option value="certificate">Digital Certificate</option>
              <option value="document"> Document</option>
              <option value="other">Other Event</option>
            </select>
          </div>

          {eventType === 'PDS_DISTRIBUTION' ? (
            <div className="space-y-4 bg-blue-50 dark:bg-slate-800/50 p-4 rounded-lg border border-blue-100 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('shop')}</label>
                  <select
                    name="shopId"
                    value={pdsData.shopId}
                    onChange={handleShopChange}
                    className="input-field mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                  >
                    {SHOPS.map(shop => {
                      const region = REGIONS.find(r => r.id === shop.regionId);
                      return (
                        <option key={shop.id} value={shop.id}>
                          {shop.id} ({region ? region.name.split(' ')[1] : 'Unknown'})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Stock Display */}
                <div className="col-span-2 md:col-span-1">
                  {shopStock ? (
                    <div className="text-xs bg-white dark:bg-slate-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                      <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Available Stock at {pdsData.shopId}:</p>
                      <div className="grid grid-cols-3 gap-1">
                        <div><span className="block text-gray-500">Rice</span> <b>{shopStock.rice}kg</b></div>
                        <div><span className="block text-gray-500">Wheat</span> <b>{shopStock.wheat}kg</b></div>
                        <div><span className="block text-gray-500">Sugar</span> <b>{shopStock.sugar}kg</b></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 p-2">Loading stock...</div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('beneficiary')}</label>
                  <input name="beneficiaryId" value={pdsData.beneficiaryId} onChange={handlePdsChange} className="input-field mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white" placeholder="BEN-1234" required />
                </div>

                {/* Quota Display */}
                {beneficiaryUsage && (
                  <div className="col-span-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800 transition-all">
                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-2">Monthly Entitlement ({pdsData.beneficiaryId}):</p>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded text-xs grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Commodity</p>
                        <p className="font-semibold capitalize text-lg">{pdsData.commodity}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Used / Limit</p>
                        <p>{beneficiaryUsage.usage[pdsData.commodity]} / {beneficiaryUsage.quota[pdsData.commodity]} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Remaining</p>
                        <p className={`font-bold ${beneficiaryUsage.remaining[pdsData.commodity] <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {beneficiaryUsage.remaining[pdsData.commodity]} kg
                        </p>
                      </div>
                    </div>
                  </div>
                )}


                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Commodity</label>
                  <select
                    name="commodity"
                    value={pdsData.commodity}
                    onChange={handlePdsChange}
                    className="input-field mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white capitalize"
                  >
                    <option value="rice">Rice</option>
                    <option value="wheat">Wheat</option>
                    <option value="sugar">Sugar</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('quantity')} (kg)</label>
                  <input type="number" name="quantity" value={pdsData.quantity} onChange={handlePdsChange} className="input-field mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white" min="0.1" step="0.1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('region')}</label>
                  <input
                    name="region"
                    value={pdsData.region}
                    readOnly
                    disabled
                    className="input-field mt-1 bg-gray-100 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 cursor-not-allowed"
                  />
                  <input type="hidden" name="regionRisk" value={pdsData.regionRisk || 0} />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                File Upload
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  {file ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            disabled={loading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">Any file type supported</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!validationError || (eventType !== 'PDS_DISTRIBUTION' && (!isConnected || !file))}
            className={`btn-primary w-full flex items-center justify-center space-x-2 ${loading || validationError ? 'opacity-70 cursor-not-allowed' : ''} ${validationError ? 'bg-red-500 hover:bg-red-600' : ''}`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : validationError ? (
              <>
                <X className="h-5 w-5" />
                <span>Blocked: Check Error</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>{eventType === 'PDS_DISTRIBUTION' ? t('submit') : 'Record Event'}</span>
              </>
            )}
          </button>
        </form>

        {validationError && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm flex items-center shadow-sm">
            <AlertCircle className="w-5 h-5 mr-2" />
            {validationError}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-slide-up">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3 animate-slide-up">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {eventResponse && (
          <div className="mt-6 card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-800">
                {eventResponse.riskLevel === 'HIGH' ? 'Event Recorded (FLAGGED)' : 'Event Recorded Successfully'}
              </h3>
            </div>

            {eventResponse.fraudScore !== undefined && (
              <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-700">AI Fraud Score:</span>
                  <span className={`font-bold ${eventResponse.riskLevel === 'HIGH' ? 'text-red-600' : 'text-green-600'}`}>
                    {(eventResponse.fraudScore * 100).toFixed(1)}% ({eventResponse.riskLevel})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className={`h-2.5 rounded-full ${eventResponse.riskLevel === 'HIGH' ? 'bg-red-600' : 'bg-green-600'}`}
                    style={{ width: `${eventResponse.fraudScore * 100}%` }}
                  ></div>
                </div>

                {/* AI Reasons Display */}
                {eventResponse.reasons && eventResponse.reasons.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1">AI Reasons:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {eventResponse.reasons.map((reason, idx) => (
                        <li key={idx} className="text-xs text-gray-600">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">IPFS Hash:</span>
                <span className="font-mono text-xs text-gray-900 break-all">{eventResponse.metadataHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Transaction Hash:</span>
                <span className="font-mono text-xs text-gray-900 break-all">{eventResponse.transactionHash}</span>
              </div>
            </div>

            <div className="flex flex-col items-center mt-6 pt-4 border-t border-gray-200">
              <div className="mb-4">
                <QrCodeDisplay data={JSON.stringify({
                  tx: eventResponse.transactionHash,
                  ipfs: eventResponse.metadataHash,
                  score: eventResponse.fraudScore
                })} />
              </div>

              <button
                onClick={() => generateEventRecordedPDF({
                  ...pdsData,
                  ...eventResponse,
                  timestamp: Date.now()
                })}
                className="btn-primary w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-5 w-5" />
                <span>Download Official Receipt (PDF)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default EventForm;
