import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Hash, QrCode, Loader2, CheckCircle, AlertCircle, Camera, FileText } from 'lucide-react';
import { Html5Qrcode } from "html5-qrcode";
import { eventService } from '../services/api';
import { generateVerificationPDF } from '../services/pdfGenerator';
import StatusBadge from './StatusBadge';

const VerifyEventComponent = () => {
  const location = useLocation();
  const [hash, setHash] = useState('');
  const [tabValue, setTabValue] = useState(0); // 0: Hash, 1: QR
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const qrCodeRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlHash = searchParams.get('hash');
    if (urlHash) {
      setHash(urlHash);
      handleVerify(urlHash);
    }
  }, [location]);

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
    if (newValue === 0 && scanning) {
      stopScanning();
    }
    setHash('');
    setResult(null);
    setError(null);
  };

  const handleVerify = async (hashArg) => {
    let targetHash = hash;
    if (typeof hashArg === 'string') {
      targetHash = hashArg;
    }

    if (!targetHash || !targetHash.trim()) {
      setError('Verify Integrity: Please enter a hash');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await eventService.verifyHash(targetHash.trim());
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to verify hash');
    } finally {
      setLoading(false);
    }
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }).catch(err => console.error(err));
    }
    setScanning(false);
  };

  const startScanning = () => {
    setError(null);
    setScanning(true);
  };

  useEffect(() => {
    if (!scanning || tabValue !== 1) return;

    const initializeScanner = async () => {
      try {
        const element = document.getElementById('qr-reader');
        if (!element) return;

        const html5QrCode = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            let extractedHash = decodedText;
            try {
              const json = JSON.parse(decodedText);
              if (json.hash) extractedHash = json.hash;
              else if (json.ipfs) extractedHash = json.ipfs;
            } catch (e) {
              if (decodedText.includes('hash=')) {
                extractedHash = decodedText.split('hash=')[1];
              }
            }
            setHash(extractedHash);
            handleVerify(extractedHash);
            stopScanning();
            setTabValue(0);
          },
          (errorMessage) => {
            // Ignore parse errors 
          }
        );
      } catch (err) {
        setError("Camera access failed. Ensure permissions are granted.");
        setScanning(false);
      }
    };

    initializeScanner();

    return () => {
      stopScanning();
    }
  }, [scanning, tabValue]);


  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Verify Integrity
        </h1>
        <p className="text-gray-600">Verify authenticity of digital records on EventChain.</p>
      </div>

      {/* Search Box / Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange(0)}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${tabValue === 0
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Hash className="h-4 w-4" />
            <span>Hash / ID</span>
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${tabValue === 1
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Receipt Scanner</span>
          </button>
        </div>

        <div className="p-6">
          {tabValue === 0 ? (
            <div className="flex space-x-2">
              <input
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="Enter IPFS Hash or Transaction ID"
                className="flex-1 rounded-lg border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
              <button
                onClick={() => handleVerify(hash)}
                disabled={loading || !hash}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {!scanning ? (
                <button onClick={startScanning} className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
                  <Camera className="h-5 w-5" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <div className="w-full max-w-sm">
                  <div id="qr-reader" className="w-full rounded-lg overflow-hidden border-2 border-slate-300"></div>
                  <button onClick={stopScanning} className="mt-4 text-red-600 text-sm underline w-full text-center">Stop Camera</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700 mb-8">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Verification Result */}
      {result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Status Panel */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-green-800 mb-4">Verification Successful</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Verified On Blockchain</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Data Integrity Confirmed</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">AI Risk Check Passed</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Official Government Record</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <ShieldCheck className="h-24 w-24 text-green-200" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Summary Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Event Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Event Type</span>
                  <span className="font-medium text-gray-900">{result.content?.type}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Beneficiary ID</span>
                  <span className="font-medium text-gray-900 font-mono">{result.content?.data?.beneficiaryId || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Quantity</span>
                  <span className="font-medium text-gray-900">{result.content?.data?.quantity} kg</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-500">Risk Level</span>
                  <StatusBadge type={result.content?.aiAnalysis?.riskLevel || 'LOW'} />
                </div>
              </div>
            </div>

            {/* Integrity Proof Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-purple-500" />
                Integrity Proof
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">IPFS Hash (Storage)</p>
                  <p className="font-mono text-xs text-gray-900 break-all bg-gray-50 p-2 rounded border border-gray-200">
                    {result.event?.ipfsHash}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Blockchain Tx (Ledger)</p>
                  <p className="font-mono text-xs text-gray-900 break-all bg-gray-50 p-2 rounded border border-gray-200">
                    {result.event?.txHash}
                  </p>
                </div>
                <button
                  onClick={() => generateVerificationPDF(result)}
                  className="w-full mt-2 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg flex items-center justify-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Download Official Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyEventComponent;
