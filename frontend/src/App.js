import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddEvent from './pages/AddEvent';
import Timeline from './pages/Timeline';
import VerifyEvent from './pages/VerifyEvent';
import PDSDashboard from './pages/PDSDashboard';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 transition-colors duration-200">
          <Navbar />
          <main className="pb-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pds" element={<PDSDashboard />} />
              <Route path="/add-event" element={<AddEvent />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/verify" element={<VerifyEvent />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
