// src/components/NavBar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { name: "Analyzer", path: "/" },
    { name: "Metrics Explained", path: "/metrics" },
    { name: "Saved Deals", path: "/saved" },
];

const NavBar = () => {
    const location = useLocation();

    return (
        <nav className="bg-gray-800 text-white shadow-lg">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-xl font-bold tracking-wider hover:text-indigo-400 transition-colors">
                            🏡 RE Investment Analyzer
                        </Link>
                    </div>

                    {/* Navigation Links (Always Visible) */}
                    <div className="flex space-x-4">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`
                                        px-3 py-2 rounded-md text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }
                                    `}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;