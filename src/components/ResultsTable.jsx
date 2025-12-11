import React from 'react';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

const TableRow = ({ item, onExportPDF, onSave }) => {
    // Accessibility Fix: Darker colors for WCAG AA contrast against white background
    const cocColor = item.coc > 10 ? 'text-green-700' : item.coc > 5 ? 'text-yellow-700' : 'text-red-700';
    
    return (
        <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">
                {/* Security Fix: Added rel="noopener noreferrer" which was already present, kept for completeness */}
                <a href={`https://www.zillow.com/homedetails/${item.zpid}_zpid/`} target="_blank" className="hover:underline text-indigo-700" rel="noopener noreferrer">
                    {item.address}
                </a>
            </td>
            <td className="px-6 py-4">{formatter.format(item.price)}</td>
            <td className="px-6 py-4">{formatter.format(item.rent)}/mo</td>
            <td className="px-6 py-4">{formatter.format(item.capital)}</td>
            <td className="px-6 py-4">{formatter.format(item.cashflow)}</td>
            <td className={`px-6 py-4 font-bold ${cocColor}`}>{item.coc.toFixed(2)}%</td>
            <td className="px-6 py-4 flex gap-2">
                 {/* Accessibility Fix: Added aria-label for screen readers */}
                 <button
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={() => onSave(item)}
                    aria-label={`Save property at ${item.address}`}
                >
                    Save
                </button>
                {/* Accessibility Fix: Added aria-label for screen readers */}
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => onExportPDF(item)}
                    aria-label={`Export PDF for ${item.address}`}
                >
                    PDF
                </button>
            </td>
        </tr>
    );
};

const ResultsTable = ({ results, onExportPDF, onSave, sortState, setSortState }) => {

    const handleSort = (column) => {
        if (sortState.column === column) {
            setSortState(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
        } else {
            setSortState({ column, direction: 'desc' });
        }
    };

    if (!results.length) {
        return <div className="text-center p-8 text-gray-500">No valid results to display.</div>;
    }

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
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Analysis Results</h2>
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
                                        className={`px-6 py-3 cursor-pointer hover:bg-gray-200 text-gray-800 ${index === 0 ? 'rounded-l-lg' : ''}`}
                                        onClick={() => handleSort(columnKey)}
                                        aria-sort={sortState.column === columnKey ? (sortState.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    >
                                        <div className="flex items-center">
                                            {header}
                                            {sortState.column === columnKey && (
                                                <span className="ml-1">{sortState.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                            <th scope="col" className="px-6 py-3 rounded-r-lg text-gray-800">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedResults.map(item => (
                            <TableRow key={item.zpid} item={item} onExportPDF={onExportPDF} onSave={onSave} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsTable;