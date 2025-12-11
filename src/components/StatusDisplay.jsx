import React from 'react';

const StatusDisplay = ({ status }) => {
    if (!status || !status.message) return null;

    let colorClasses = 'bg-gray-100 text-gray-800';
    if (status.type === 'error') colorClasses = 'bg-red-100 text-red-800 border border-red-200';
    if (status.type === 'success') colorClasses = 'bg-green-100 text-green-800 border border-green-200';
    if (status.type === 'warning') colorClasses = 'bg-yellow-50 text-yellow-800 border border-yellow-200'; // Darker yellow for contrast
    if (status.type === 'loading') colorClasses = 'bg-blue-100 text-blue-800 border border-blue-200';

    return (
        <div className="text-center" role="status" aria-live="polite">
            <div className={`p-4 mb-4 text-sm rounded-lg ${colorClasses}`}>
                {status.type === 'loading' && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {status.message}
            </div>
        </div>
    );
};

export default StatusDisplay;