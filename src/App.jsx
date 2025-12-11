import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Header from './components/Header'; // NEW
import Footer from './components/Footer'; // NEW
import Calculator from './Calculator'; 
import MetricsPage from './pages/MetricsPage'; 
import SavedDealsPage from './pages/SavedDealsPage'; 

function App() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col"> 
      <NavBar />
      
      <div className="container mx-auto p-4 md:p-8 max-w-7xl flex-grow">
        <Header /> {/* Meaningful component usage */}
        <main>
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
      <Footer /> {/* Meaningful component usage */}
    </div>
  );
}

export default App;