import React from 'react';
import { Wallet, PlusCircle, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: Wallet,
      title: 'Wallet Integration',
      description: 'Connect your MetaMask wallet to interact with the blockchain',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: PlusCircle,
      title: 'Add Events',
      description: 'Upload files and create verifiable events stored on IPFS and blockchain',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: Clock,
      title: 'Event Timeline',
      description: 'View all events in a chronological timeline with full details',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: ShieldCheck,
      title: 'Verify Events',
      description: 'Verify event authenticity using IPFS hash or QR code scanning',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Data Input',
      description: 'Authority inputs PDS distribution details (Beneficiary ID, Shop ID, Quantity) via the secure portal.',
    },
    {
      number: '2',
      title: 'AI Validation',
      description: 'Our AI engine analyzes the transaction in real-time, assigning a fraud score and risk level before processing.',
    },
    {
      number: '3',
      title: 'Immutable Storage',
      description: 'Verified transactions are encrypted, stored on IPFS, and linked to the Ethereum Blockchain for a tamper-proof record.',
    },
    {
      number: '4',
      title: 'Live Verification',
      description: 'Transactions appear instantly on the public timeline, verifiable by anyone via QR code or IPFS hash.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in leading-tight">
              EventChain: <br />AI-Enabled Intelligent PDS Monitoring Platform
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6 font-light">
              Unified verifiable ledger for PDS distributions with real-time AI fraud detection.
            </p>
            <p className="text-lg text-blue-50 max-w-3xl mx-auto mb-8">
              Seamlessly integrating blockchain transparency, IPFS decentralized storage, and AI-powered intelligence to ensure fair and verifiable PDS distributions.
            </p>
            <Link
              to="/add-event"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 font-semibold py-4 px-8 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <span>Distribute Ration</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Core Capabilities</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A comprehensive solution for the Public Distribution System
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="card group hover:scale-105 transition-all duration-300 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">PDS Distribution</h3>
            <p className="text-gray-600 text-sm">Digitally record ration distributions with AI-assisted validation.</p>
          </div>
          <div className="card group hover:scale-105 transition-all duration-300 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">AI Fraud Detection</h3>
            <p className="text-gray-600 text-sm">Real-time analysis of transaction inputs to flag potential fraud before recording.</p>
          </div>
          <div className="card group hover:scale-105 transition-all duration-300 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Verifiable Ledger</h3>
            <p className="text-gray-600 text-sm">Immutable record of all distributions on Blockchain & IPFS.</p>
          </div>
          <div className="card group hover:scale-105 transition-all duration-300 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Authority Dashboard</h3>
            <p className="text-gray-600 text-sm">Live monitoring of system health, transaction flows, and fraud alerts.</p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="card bg-gradient-to-br from-gray-50 to-blue-50 border-blue-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">System Workflow</h2>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Built with React, Tailwind CSS, ethers.js, Node.js, and Python AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
