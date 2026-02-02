import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, PlusCircle, Clock, ShieldCheck, Menu, X } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import WalletConnector from './WalletConnector';

const Navbar = () => {
  const location = useLocation();
  const { isConnected, account } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Wallet },
    { path: '/add-event', label: 'PDS Distribution', icon: PlusCircle },
    { path: '/timeline', label: 'Event Timeline', icon: Clock },
    { path: '/verify', label: 'Verification', icon: ShieldCheck },
    { path: '/pds', label: 'Authority Dashboard', icon: ShieldCheck },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PDS System
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Wallet Status & Connect */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected && account && (
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-mono text-green-700">
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </span>
              </div>
            )}
            <WalletConnector />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-gray-200">
              {isConnected && account && (
                <div className="px-4 py-2 mb-2">
                  <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-mono text-green-700">
                      {`${account.slice(0, 6)}...${account.slice(-4)}`}
                    </span>
                  </div>
                </div>
              )}
              <div className="px-4">
                <WalletConnector />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
