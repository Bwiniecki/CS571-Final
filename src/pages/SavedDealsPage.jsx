// src/pages/SavedDealsPage.jsx

import React from 'react';
import { Container, Table } from 'react-bootstrap';

// Dummy data to simulate saved properties
const dummySavedDeals = [
    { id: 1, address: "123 Main St, Austin, TX", price: 350000, coc: 12.5, cashflow: 3800, status: "High Performer" },
    { id: 2, address: "456 Oak Dr, Austin, TX", price: 300000, coc: 6.2, cashflow: 1860, status: "Needs Review" },
    { id: 3, address: "789 Pine Ave, Austin, TX", price: 400000, coc: 10.1, cashflow: 4040, status: "Excellent Deal" },
];

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const SavedDealsPage = () => {
    return (
        <Container className="mt-5 p-4 bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">💾 Saved Deals & Portfolio Comparison</h2>
            <p className="text-gray-700 mb-6">
                This page lists properties you've flagged as potential investments (using dummy data for now).
            </p>

            <Table striped bordered hover responsive className="text-sm">
                <thead className="bg-gray-200">
                    <tr>
                        <th>Address</th>
                        <th>Price</th>
                        <th>Yearly Cashflow</th>
                        <th>CoC Return</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {dummySavedDeals.map(deal => (
                        <tr key={deal.id}>
                            <td>{deal.address}</td>
                            <td>{formatter.format(deal.price)}</td>
                            <td>{formatter.format(deal.cashflow)}</td>
                            <td className={deal.coc > 10 ? 'text-success font-bold' : 'text-warning font-bold'}>
                                {deal.coc.toFixed(2)}%
                            </td>
                            <td>{deal.status}</td>
                            <td>
                                <button className="btn btn-sm btn-outline-danger">Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default SavedDealsPage;