import React from 'react';

const Footer = () => (
    <footer className="bg-gray-800 text-gray-400 py-8 mt-12 text-center">
        <div className="container mx-auto px-4">
            <p>&copy; {new Date().getFullYear()} RE Investment Analyzer. All rights reserved.</p>
            <p className="text-sm mt-2">Data provided by RapidAPI (US Housing Market Data).</p>
        </div>
    </footer>
);

export default Footer;