import React from 'react';

// Utility function for formatting currency (from original JS)
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

// Utility function for rendering a single row
const TableRow = ({ item, onExportPDF }) => {
    const cocColor = item.coc > 10 ? 'text-green-600' : item.coc > 5 ? 'text-yellow-600' : 'text-red-600';
    
    return (
        <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">
                <a href={`https://www.zillow.com/homedetails/${item.zpid}_zpid/`} target="_blank" className="hover:underline text-indigo-600" rel="noopener noreferrer">
                    {item.address}
                </a>
            </td>
            <td className="px-6 py-4">{formatter.format(item.price)}</td>
            <td className="px-6 py-4">{formatter.format(item.rent)}/mo</td>
            <td className="px-6 py-4">{formatter.format(item.capital)}</td>
            <td className="px-6 py-4">{formatter.format(item.cashflow)}</td>
            <td className={`px-6 py-4 font-bold ${cocColor}`}>{item.coc.toFixed(2)}%</td>
            <td className="px-6 py-4">
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded"
                    onClick={() => onExportPDF(item)}
                >
                    PDF
                </button>
            </td>
        </tr>
    );
};

const ResultsTable = ({ results, onExportPDF, sortState, setSortState }) => {

    const handleSort = (column) => {
        if (sortState.column === column) {
            setSortState(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
        } else {
            setSortState({ column, direction: 'desc' });
        }
    };

    if (!results.length) {
        return (
             <div className="text-center p-8 text-gray-500">
                No valid results to display.
            </div>
        );
    }

    // Sort the data based on current state
    const sortedResults = [...results].sort((a, b) => {
        let valA = a[sortState.column];
        let valB = b[sortState.column];

        if (typeof valA === 'string') {
            return sortState.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return sortState.direction === 'asc' ? valA - valB : valB - valA;
        }
    });

    return (
        <div id="results-container">
            <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
            <div className="table-container overflow-x-auto max-h-[70vh] relative">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                        <tr>
                            {['Address', 'Price', 'Est. Rent', 'Capital Needed', 'Yearly Cashflow', 'CoC Return'].map((header, index) => {
                                const columnKey = ['address', 'price', 'rent', 'capital', 'cashflow', 'coc'][index];
                                return (
                                    <th
                                        key={columnKey}
                                        scope="col"
                                        className={`px-6 py-3 cursor-pointer hover:bg-gray-200 ${index === 0 ? 'rounded-l-lg' : ''} ${index === 5 ? 'rounded-r-lg' : ''}`}
                                        onClick={() => handleSort(columnKey)}
                                    >
                                        {header}
                                        {sortState.column === columnKey && (
                                            sortState.direction === 'asc' ? ' 🔼' : ' 🔽'
                                        )}
                                    </th>
                                );
                            })}
                            <th scope="col" className="px-6 py-3">Export</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedResults.map(item => (
                            <TableRow key={item.zpid} item={item} onExportPDF={onExportPDF} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsTable;