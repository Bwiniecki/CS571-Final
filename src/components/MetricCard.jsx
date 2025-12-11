import React from 'react';

const MetricCard = ({ title, description, formula, footer }) => (
    <article className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <h3 className="text-xl font-bold text-indigo-700 mb-2">{title}</h3>
        <p className="text-gray-800 mb-3">{description}</p>
        
        <div className="bg-white p-3 rounded border border-gray-300 font-mono text-sm text-gray-900">
            {formula}
        </div>
        
        {footer && <p className="text-xs text-gray-600 mt-2 italic">{footer}</p>}
    </article>
);

export default MetricCard;