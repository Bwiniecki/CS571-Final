// src/pages/SavedDealsPage.jsx
import React from 'react';

// Dummy data to simulate saved properties
const dummySavedDeals = [
    { id: 1, address: "123 Main St, Austin, TX", price: 350000, coc: 12.5, cashflow: 3800, status: "High Performer" },
    { id: 2, address: "456 Oak Dr, Austin, TX", price: 300000, coc: 6.2, cashflow: 1860, status: "Needs Review" },
    { id: 3, address: "789 Pine Ave, Austin, TX", price: 400000, coc: 10.1, cashflow: 4040, status: "Excellent Deal" },
];

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const SavedDealsPage = () => {
    return (
        <div className="mt-5 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">💾 Saved Deals & Portfolio</h2>
            <p className="text-gray-700 mb-6">
                This page lists properties you've flagged as potential investments.
            </p>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500 border border-gray-200">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 border-b">Address</th>
                            <th className="px-6 py-3 border-b">Price</th>
                            <th className="px-6 py-3 border-b">Yearly Cashflow</th>
                            <th className="px-6 py-3 border-b">CoC Return</th>
                            <th className="px-6 py-3 border-b">Status</th>
                            <th className="px-6 py-3 border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dummySavedDeals.map(deal => (
                            <tr key={deal.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{deal.address}</td>
                                <td className="px-6 py-4">{formatter.format(deal.price)}</td>
                                <td className="px-6 py-4">{formatter.format(deal.cashflow)}</td>
                                <td className={`px-6 py-4 font-bold ${deal.coc > 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {deal.coc.toFixed(2)}%
                                </td>
                                <td className="px-6 py-4">{deal.status}</td>
                                <td className="px-6 py-4">
                                    <button className="text-red-600 hover:text-red-900 font-semibold border border-red-200 px-3 py-1 rounded hover:bg-red-50">
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SavedDealsPage;