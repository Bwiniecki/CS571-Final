import React from 'react';
import MetricCard from '../components/MetricCard'; // NEW IMPORT

const MetricsPage = () => {
    return (
        <div className="mt-5 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Investment Metrics Explained</h2>
            <p className="text-gray-700 mb-6">
                Understand the key formulas used by the analyzer to evaluate property investment potential.
            </p>

            <div className="space-y-6">
                <MetricCard 
                    title="Cash-on-Cash (CoC) Return"
                    description="The annual percentage return on the actual cash invested (down payment + closing costs)."
                    formula="CoC Return = (Yearly Cash Flow / Total Capital Invested)"
                />
                
                <MetricCard 
                    title="Net Operating Income (NOI)"
                    description="A property's income before accounting for debt (mortgage payments)."
                    formula="NOI = (Gross Rental Income) - (Operating Expenses)"
                />
                
                <MetricCard 
                    title="Principal & Interest (P&I)"
                    description="The portion of the monthly mortgage payment that goes toward repaying the loan balance and interest."
                    formula="M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]"
                    footer="Where P is principal, i is monthly interest rate, and n is number of payments."
                />
            </div>
        </div>
    );
};

export default MetricsPage;