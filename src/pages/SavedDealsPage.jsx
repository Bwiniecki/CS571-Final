// src/pages/SavedDealsPage.jsx
import React, { useEffect, useState } from 'react';

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const SavedDealsPage = () => {
    const [savedDeals, setSavedDeals] = useState([]);

    // Load from Local Storage on mount
    useEffect(() => {
        const storedDeals = localStorage.getItem('savedDeals');
        if (storedDeals) {
            setSavedDeals(JSON.parse(storedDeals));
        }
    }, []);

    const removeDeal = (zpid) => {
        const updated = savedDeals.filter(d => d.zpid !== zpid);
        setSavedDeals(updated);
        localStorage.setItem('savedDeals', JSON.stringify(updated));
    };

    return (
        <div className="mt-5 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">💾 Saved Deals & Portfolio</h2>
            <p className="text-gray-700 mb-6">
                This page lists properties you have saved from the analyzer. Data is stored in your browser.
            </p>

            {savedDeals.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg text-gray-500">
                    You haven't saved any deals yet. Go to the Analyzer to add properties here!
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-500 border border-gray-200">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 border-b">Address</th>
                                <th className="px-6 py-3 border-b">Price</th>
                                <th className="px-6 py-3 border-b">Yearly Cashflow</th>
                                <th className="px-6 py-3 border-b">CoC Return</th>
                                <th className="px-6 py-3 border-b">Saved At</th>
                                <th className="px-6 py-3 border-b">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedDeals.map(deal => (
                                <tr key={deal.zpid} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <a href={`https://www.zillow.com/homedetails/${deal.zpid}_zpid/`} target="_blank" className="hover:underline text-indigo-600" rel="noopener noreferrer">
                                            {deal.address}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">{formatter.format(deal.price)}</td>
                                    <td className="px-6 py-4">{formatter.format(deal.cashflow)}</td>
                                    <td className={`px-6 py-4 font-bold ${deal.coc > 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {deal.coc.toFixed(2)}%
                                    </td>
                                    <td className="px-6 py-4">{new Date(deal.savedAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => removeDeal(deal.zpid)}
                                            className="text-red-600 hover:text-red-900 font-semibold border border-red-200 px-3 py-1 rounded hover:bg-red-50"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SavedDealsPage;