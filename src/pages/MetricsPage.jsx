// src/pages/MetricsPage.jsx

import React from 'react';
import { Container } from 'react-bootstrap';

const MetricsPage = () => {
    // Utility for currency formatting (optional but good practice)
    const currency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

    return (
        <Container className="mt-5 p-4 bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Investment Metrics Explained</h2>
            <p className="text-gray-700 mb-6">
                Understand the key formulas used by the analyzer to evaluate property investment potential.
            </p>

            <div className="space-y-8">
                {/* Cash-on-Cash Return */}
                <div>
                    <h3 className="text-xl font-semibold text-indigo-600">Cash-on-Cash (CoC) Return</h3>
                    <p className="text-gray-700">
                        The annual percentage return on the actual cash invested (down payment + closing costs). This is the primary metric for gauging year-one profitability.
                    </p>
                    <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                        <p className="font-mono text-sm">
                            CoC Return $\quad = \quad$ (Yearly Cash Flow / Total Capital Invested)
                        </p>
                    </div>
                </div>

                {/* Net Operating Income */}
                <div>
                    <h3 className="text-xl font-semibold text-indigo-600">Net Operating Income (NOI)</h3>
                    <p className="text-gray-700">
                        A property's income before accounting for debt (mortgage payments). It's used for calculating the Cap Rate.
                    </p>
                    <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                        <p className="font-mono text-sm">
                            NOI $\quad = \quad$ (Gross Rental Income) $-$ (Operating Expenses, excluding P&I)
                        </p>
                    </div>
                </div>

                {/* Principal & Interest (P&I) */}
                <div>
                    <h3 className="text-xl font-semibold text-indigo-600">Principal & Interest (P&I)</h3>
                    <p className="text-gray-700">
                        The portion of the monthly mortgage payment that goes toward repaying the loan balance (Principal) and the accrued interest.
                    </p>
                    <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                        <p className="font-mono text-sm">
                            Monthly P&I Payment (M) is calculated using the standard amortization formula:
                        </p>
                        $$M = P \left[ \frac{i(1 + i)^n}{(1 + i)^n - 1} \right]$$
                        <p className="text-xs text-gray-500 mt-2">
                            Where P is the loan principal, $i$ is the monthly interest rate, and $n$ is the total number of payments.
                        </p>
                    </div>
                </div>

            </div>
        </Container>
    );
};

export default MetricsPage;