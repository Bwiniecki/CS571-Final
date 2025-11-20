// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Components
import NavBar from './components/NavBar';
import Calculator from './Calculator'; 
import MetricsPage from './pages/MetricsPage'; 
import SavedDealsPage from './pages/SavedDealsPage'; 

function App() {
  return (
    // The main wrapper is now bg-gray-50 for a clean background
    <div className="bg-gray-50 min-h-screen"> 
      
      <NavBar /> {/* Primary Navigation Bar is always full width */}
      
      {/* The content wrapper: centered and padded, matching the NavBar's max width */}
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <main>
          {/* React Router Routes */}
          <Routes>
            <Route path="/" element={<Calculator />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/saved" element={<SavedDealsPage />} />
            <Route path="*" element={
              <div className="text-center p-10 bg-white rounded-xl shadow-lg mt-8">
                <h2 className="text-4xl font-bold text-red-600">404</h2>
                <p className="text-xl text-gray-600">Page Not Found</p>
              </div>
            } /> 
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;