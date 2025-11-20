// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Components
import NavBar from './components/NavBar';
import Calculator from './Calculator'; // The core analyzer tool
import MetricsPage from './pages/MetricsPage'; 
import SavedDealsPage from './pages/SavedDealsPage'; 

function App() {
  return (
    // The <></> fragment ensures the NavBar sits outside the max-width container 
    // but still wraps the whole application.
    <>
      <NavBar /> {/* Primary Navigation Bar */}
      
      {/* The main content wrapper, now with the centering fix */}
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <main>
          {/* React Router Routes */}
          <Routes>
            {/* Home Page: The Analyzer Tool */}
            <Route path="/" element={<Calculator />} />
            
            {/* Secondary Pages */}
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/saved" element={<SavedDealsPage />} />
            
            {/* 404 Catch-all */}
            <Route path="*" element={
              <div className="text-center p-10">
                <h2 className="text-4xl font-bold text-red-600">404</h2>
                <p className="text-xl text-gray-600">Page Not Found</p>
              </div>
            } /> 
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;