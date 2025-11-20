import React, { useState } from 'react';
import ResultsTable from './components/ResultsTable';

// --- Global Constants ---
// NOTE: For a real-world application, store API keys in environment variables (e.g., in a .env file), 
// not directly in the source code, as this key will be public after deployment.
const apiKey = "5666032946mshf07b62e13d3c7b0p1f1f4bjsn7632de349410";

// --- Utility Functions ---

const filterOutliers = (data, key) => {
    if (data.length < 3) return data;
    const values = data.map(item => item[key]);
    const mean = values.reduce((a, b) => a + b) / values.length;
    
    // Calculate Standard Deviation
    const std = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / values.length);
    
    // Simple filter: keep results within one standard deviation of the mean
    const upperBound = mean + std;
    const lowerBound = mean - std;
    return data.filter(item => item[key] >= lowerBound && item[key] <= upperBound);
};


// Custom Hook to manage form state and calculations
const useInvestmentCalculator = () => {
    const [location, setLocation] = useState('');
    const [params, setParams] = useState({
        down_payment: 20,
        interest_rate: 7.0,
        mortgage_length: 30,
        property_tax: 1.1,
        maintenance: 10,
        vacancy: 10,
        property_management: 0,
        insurance: 5,
        closing_costs: 2,
    });
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState({ message: 'Enter your criteria and click "Analyze Properties" to begin.', type: 'info' });
    const [isLoading, setIsLoading] = useState(false);
    const [sortState, setSortState] = useState({ column: 'coc', direction: 'desc' });

    // Helper to update status message in the UI
    const updateStatus = (message, type = 'info') => {
        setStatus({ message, type });
    };

    // Function to process a single listing and calculate metrics
    const processListings = (listings, currentParams) => {
        const processed = [];
        if (!listings) return processed;

        // Convert percentage inputs to decimal
        const p = {
            down_payment: currentParams.down_payment / 100,
            interest_rate: currentParams.interest_rate / 100,
            mortgage_length: currentParams.mortgage_length,
            maintenance: currentParams.maintenance / 100,
            vacancy: currentParams.vacancy / 100,
            property_management: currentParams.property_management / 100,
            insurance: currentParams.insurance / 100,
            closing_costs: currentParams.closing_costs / 100,
            tax_rate: currentParams.property_tax / 100
        };
        
        for (const listing of listings) {
            // Filter out properties missing essential data
            if (!listing.rentZestimate || !listing.price || !listing.streetAddress || listing.price === 0) {
                continue;
            }

            const rent = listing.rentZestimate;
            const cost = listing.price;
            
            // Loan Calculation (P&I)
            const loanAmount = cost * (1 - p.down_payment);
            const i = p.interest_rate / 12; // Monthly interest rate
            const n = p.mortgage_length * 12; // Total number of payments
            
            let monthlyPayment = 0;
            if (n > 0 && i > 0) {
                // Formula for P&I: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
                monthlyPayment = loanAmount * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
            } else if (n > 0 && i === 0) {
                 monthlyPayment = loanAmount / n; 
            }
            
            const monthlyIncome = rent;
            
            // Operating Expenses (OpEx) - Based on Monthly Rent
            const mgmtFee = monthlyIncome * p.property_management;
            const maintenanceFee = monthlyIncome * p.maintenance;
            const vacancyLoss = monthlyIncome * p.vacancy;
            
            // Operating Expenses (OpEx) - Based on Property Cost
            const taxes = (cost * p.tax_rate) / 12;
            const insuranceCost = (cost * p.insurance) / 12; // Note: Original code divided p.insurance by 100 again, corrected here
            
            const totalMonthlyExpenses = mgmtFee + maintenanceFee + vacancyLoss + taxes + insuranceCost;
            
            const monthlyCashflow = monthlyIncome - monthlyPayment - totalMonthlyExpenses;
            const yearlyCashflow = monthlyCashflow * 12;
            
            // Capital Needed
            const downPaymentAmount = cost * p.down_payment;
            const closingCostsAmount = cost * p.closing_costs;
            const capital = downPaymentAmount + closingCostsAmount;
            
            // Cash on Cash Return
            const cocReturn = capital > 0 ? (yearlyCashflow / capital) * 100 : 0; 
            
            processed.push({
                address: listing.streetAddress, price: cost, rent: rent,
                capital: capital, cashflow: yearlyCashflow, coc: cocReturn, zpid: listing.zpid, imgSrc: listing.imgSrc
            });
        }
        return processed;
    };

    const runAnalysis = async () => {
        if (!location) {
            updateStatus('Please provide a location.', 'error');
            return;
        }

        setIsLoading(true);
        setResults([]);
        updateStatus('Starting property analysis...', 'loading');
        
        let allProperties = [];
        let currentPage = 1;
        let totalPages = 1;

        try {
            while (currentPage <= totalPages) {
                updateStatus(`Fetching property page ${currentPage} of ${totalPages}...`, 'loading');
                // API constraints from original HTML logic: isMultiFamily=true, price_min=100000, price_max=400000
                const url = `https://zillow56.p.rapidapi.com/search?location=${encodeURIComponent(location)}&page=${currentPage}&output=json&status=forSale&isMultiFamily=true&price_min=100000&price_max=400000`;
                const options = {
                    method: 'GET',
                    headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'zillow56.p.rapidapi.com' }
                };
                
                const response = await fetch(url, options);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API Error: ${errorData.message || response.statusText}`);
                }
                
                const data = await response.json();
                
                if (currentPage === 1) {
                    totalPages = data.totalPages || 1;
                    updateStatus(`Found ${data.totalResultCount} total properties across ${totalPages} pages.`, 'info');
                    if (data.totalResultCount === 0) break;
                }

                const processedPage = processListings(data.results, params);
                allProperties.push(...processedPage);
                
                currentPage++;
                await new Promise(resolve => setTimeout(resolve, 1100)); // Rate limit buffer
            }

            if (allProperties.length === 0) {
                 updateStatus('No valid multi-family properties with rent estimates found in that range.', 'warning');
            } else {
                const filteredProperties = filterOutliers(allProperties, 'coc');
                setResults(filteredProperties);
                updateStatus(`Analysis complete. Displaying top ${filteredProperties.length} results after filtering.`, 'success');
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            updateStatus(`An error occurred: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Function to generate PDF
    const generatePDF = async (property) => {
        // Check for jspdf availability since it's loaded via CDN in index.html
        if (!window.jspdf) {
            updateStatus('PDF library (jspdf) is not loaded. Cannot export.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        updateStatus('Generating PDF report...', 'loading');

        const currency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
        const percent = (num) => `${(num * 100).toFixed(2)}%`;

        // Convert percentage inputs to decimal
        const p = {
            down_payment: params.down_payment / 100,
            interest_rate: params.interest_rate / 100,
            mortgage_length: params.mortgage_length,
            maintenance: params.maintenance / 100,
            vacancy: params.vacancy / 100,
            property_management: params.property_management / 100,
            insurance: params.insurance / 100,
            closing_costs: params.closing_costs / 100,
            tax_rate: params.property_tax / 100
        };
        
        // --- Re-calculate metrics for the specific property ---
        const cost = property.price;
        const rent = property.rent;
        const downPaymentAmount = cost * p.down_payment;
        const loanAmount = cost - downPaymentAmount;
        const i = p.interest_rate / 12;
        const n = p.mortgage_length * 12;
        
        let monthlyPI = 0;
        if (n > 0 && i > 0) {
            monthlyPI = (loanAmount * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));
        } else if (n > 0 && i === 0) {
             monthlyPI = loanAmount / n;
        }

        const monthlyTax = (cost * p.tax_rate) / 12;
        const monthlyInsurance = (cost * p.insurance) / 12; 
        const monthlyMaintenance = rent * p.maintenance;
        const monthlyVacancy = rent * p.vacancy;
        const monthlyMgmt = rent * p.property_management;

        const totalMonthlyExpenses = monthlyPI + monthlyTax + monthlyInsurance + monthlyMaintenance + monthlyVacancy + monthlyMgmt;
        const monthlyCashflow = rent - totalMonthlyExpenses;
        const yearlyCashflow = monthlyCashflow * 12;

        const closingCostsAmount = cost * p.closing_costs;
        const totalCapitalNeeded = downPaymentAmount + closingCostsAmount;
        const cocReturn = totalCapitalNeeded > 0 ? (yearlyCashflow / totalCapitalNeeded) : 0;
        // --- End Calculations ---

        // --- PDF Generation Logic (using jspdf) ---

        // PDF Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("Investment Property Analysis", 105, 20, { align: "center" });

        doc.setFontSize(14);
        doc.text(property.address, 105, 30, { align: "center" });

        // Property Image (Proxying via allorigins for CORS)
        if (property.imgSrc) {
            try {
                const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(property.imgSrc)}`);
                if (!response.ok) throw new Error('Image fetch failed');
                const blob = await response.blob();
                const imgData = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
                doc.addImage(imgData, 'JPEG', 15, 40, 75, 50);
            } catch (e) {
                console.error("Could not load property image for PDF:", e);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setFillColor(240, 240, 240);
                doc.rect(15, 40, 75, 50, 'F');
                doc.setTextColor(150, 150, 150);
                doc.text("Image not available", 52.5, 67.5, { align: "center" });
                doc.setTextColor(0, 0, 0);
            }
        } else {
             doc.setFont("helvetica", "normal");
             doc.setFontSize(10);
             doc.setFillColor(240, 240, 240);
             doc.rect(15, 40, 75, 50, 'F');
             doc.setTextColor(150, 150, 150);
             doc.text("No image provided", 52.5, 67.5, { align: "center" });
             doc.setTextColor(0, 0, 0);
        }
        
        // Key Financials Table
        let yPos = 45;
        const xPosMetrics = 105;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Key Financials (Year 1)", xPosMetrics, yPos);
        yPos += 7;

        doc.setFont("helvetica", "normal");
        const metrics = [
            ["Purchase Price:", currency(cost)],
            ["Est. Monthly Rent:", currency(rent)],
            ["Yearly Cash Flow:", currency(yearlyCashflow)],
            ["Capital Needed:", currency(totalCapitalNeeded)],
            ["CoC Return:", { text: percent(cocReturn), color: cocReturn > 0.1 ? [0, 128, 0] : (cocReturn > 0.05 ? [255, 165, 0] : [255, 0, 0]) }]
        ];
        
        metrics.forEach(([label, value]) => {
            doc.setFont("helvetica", "normal");
            doc.text(label, xPosMetrics, yPos);
            if(typeof value === 'object'){
                doc.setFont("helvetica", "bold");
                doc.setTextColor(value.color[0], value.color[1], value.color[2]);
                doc.text(value.text, 200, yPos, {align: "right"});
                doc.setTextColor(0,0,0);
            } else {
                doc.setFont("helvetica", "normal");
                doc.text(value, 200, yPos, {align: "right"});
            }
            yPos += 7;
        });

        // Income vs Expenses Breakdown
        yPos = 100;
        doc.setFont("helvetica", "bold"); doc.setFontSize(12);
        doc.text("Monthly Breakdown (Year 1)", 15, yPos);
        yPos += 7; doc.setLineWidth(0.5); doc.line(15, yPos - 3, 200, yPos - 3);

        // Income Column
        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text("Income", 15, yPos);
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        doc.text("Gross Rent", 15, yPos + 6);
        doc.text(currency(rent), 95, yPos + 6, { align: 'right' });
        doc.setLineWidth(0.2); doc.line(15, yPos + 10, 95, yPos + 10);
        doc.setFont("helvetica", "bold");
        doc.text("Total Income", 15, yPos + 14);
        doc.text(currency(rent), 95, yPos + 14, { align: 'right' });

        // Expenses Column
        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text("Expenses", 105, yPos);
        let expenseY = yPos + 6;
        const expenses = [
            ["Mortgage (P&I)", monthlyPI],
            [`Property Tax`, monthlyTax],
            [`Insurance`, monthlyInsurance],
            [`Maintenance`, monthlyMaintenance],
            [`Vacancy`, monthlyVacancy],
            [`Management`, monthlyMgmt]
        ];
         doc.setFont("helvetica", "normal");
        expenses.forEach(([label, value]) => {
            doc.text(label, 105, expenseY);
            doc.text(currency(value), 200, expenseY, { align: 'right' });
            expenseY += 6;
        });
        doc.line(105, expenseY - 2, 200, expenseY-2);
        doc.setFont("helvetica", "bold");
        doc.text("Total Expenses", 105, expenseY);
        doc.text(currency(totalMonthlyExpenses), 200, expenseY, { align: 'right' });

        // 5-Year Projection
        yPos = expenseY + 15;
        doc.setFont("helvetica", "bold"); doc.setFontSize(12);
        doc.text("5-Year Investment Projection", 15, yPos);
        yPos += 7;
        doc.setLineWidth(0.5); doc.line(15, yPos - 3, 200, yPos - 3);

        // Projection Table Headers
        doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        const headersX = [15, 50, 85, 125, 165];
        doc.text("Year", headersX[0], yPos);
        doc.text("Annual Rent", headersX[1], yPos);
        doc.text("Annual Expenses", headersX[2], yPos);
        doc.text("Cash Flow", headersX[3], yPos);
        doc.text("Cumulative Return", headersX[4], yPos);
        yPos += 5;
        
        // Projection Logic
        let projectedYearlyRent = rent * 12;
        let projectedYearlyOpEx = (totalMonthlyExpenses - monthlyPI) * 12; // Operating expenses (non-mortgage)
        const annualMortgage = monthlyPI * 12;
        const rentAppreciationRate = 0.03; // 3%
        const expenseInflationRate = 0.025; // 2.5%
        let cumulativeCashFlow = 0;
        
        doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        for (let year = 1; year <= 5; year++) {
            if (year > 1) {
                projectedYearlyRent *= (1 + rentAppreciationRate);
                projectedYearlyOpEx *= (1 + expenseInflationRate);
            }
            const totalAnnualExpenses = projectedYearlyOpEx + annualMortgage;
            const annualCashFlow = projectedYearlyRent - totalAnnualExpenses;
            cumulativeCashFlow += annualCashFlow;
            
            doc.text(year.toString(), headersX[0], yPos);
            doc.text(currency(projectedYearlyRent), headersX[1], yPos);
            doc.text(currency(totalAnnualExpenses), headersX[2], yPos);
            doc.text(currency(annualCashFlow), headersX[3], yPos);
            doc.text(currency(cumulativeCashFlow), headersX[4], yPos);
            yPos += 6;
        }
        doc.setFontSize(7);
        doc.text(`*Assumes ${percent(rentAppreciationRate)} annual rent appreciation and ${percent(expenseInflationRate)} annual expense inflation.`, 15, yPos + 2);

        // Filename and Save
        const filename = `Property_Analysis_${property.address.replace(/[^\w]/g, '_')}.pdf`;
        doc.save(filename);
        updateStatus(`Successfully generated report for ${property.address}.`, 'success');
        setIsLoading(false);
    };


    const handleParamChange = (e) => {
        const { id, value } = e.target;
        // The id matches the state key (e.g., down_payment)
        setParams(prev => ({ ...prev, [id]: parseFloat(value) }));
    };

    return {
        location, setLocation,
        params, handleParamChange,
        results, status,
        isLoading, runAnalysis,
        generatePDF,
        sortState, setSortState
    };
};

// --- Calculator Component (Renders the UI) ---
const Calculator = () => {
    const {
        location, setLocation,
        params, handleParamChange,
        results, status,
        isLoading, runAnalysis,
        generatePDF,
        sortState, setSortState
    } = useInvestmentCalculator();

    const handleSubmit = (e) => {
        e.preventDefault();
        runAnalysis();
    };

    const StatusDisplay = () => {
        if (!status.message) return null;
        let colorClasses = 'bg-gray-100 text-gray-800';
        if (status.type === 'error') colorClasses = 'bg-red-100 text-red-800';
        if (status.type === 'success') colorClasses = 'bg-green-100 text-green-800';
        if (status.type === 'warning') colorClasses = 'bg-yellow-100 text-yellow-800';
        if (status.type === 'loading') colorClasses = 'bg-blue-100 text-blue-800';

        return (
            <div className="text-center">
                <div className={`p-4 mb-4 text-sm rounded-lg ${colorClasses}`} role="alert">
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

    const SliderInput = ({ id, label, min, max, step, unit, note = '' }) => (
        <div>
            <label htmlFor={id} className="flex justify-between text-sm font-medium text-gray-700">
                <span className="slider-label">{label}</span>
                <span className="slider-value font-bold text-indigo-600">
                    {params[id].toFixed(id === 'mortgage_length' ? 0 : 1)}{unit}
                </span>
            </label>
            <input
                type="range"
                id={id}
                min={min}
                max={max}
                value={params[id]}
                step={step || 1}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                onChange={handleParamChange}
            />
            {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
        </div>
    );

    return (
        <>
            {/* Control Panel */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 border-b pb-3">Analysis Parameters</h2>
                
                <form id="analyzer-form" onSubmit={handleSubmit}>
                    {/* Location Input */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                id="location"
                                placeholder="e.g., Austin, TX"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Financial Parameters with Sliders */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t">Financials</h3>
                        <SliderInput id="down_payment" label="Down Payment" min={0} max={100} step={1} unit="%" />
                        <SliderInput id="interest_rate" label="Interest Rate" min={1} max={15} step={0.1} unit="%" />
                        <SliderInput id="mortgage_length" label="Mortgage Length" min={5} max={40} step={1} unit=" yrs" />
                        <SliderInput id="property_tax" label="Property Tax Rate" min={0} max={10} step={0.1} unit="%" />
                        <SliderInput id="maintenance" label="Maintenance" min={0} max={30} step={1} unit="%" />
                        <SliderInput id="vacancy" label="Vacancy" min={0} max={30} step={1} unit="%" />
                        <SliderInput id="property_management" label="Property Mgmt" min={0} max={30} step={1} unit="%" note="Fee is based on monthly rent." />
                        <SliderInput id="insurance" label="Insurance" min={0} max={30} step={1} unit="%" />
                        <SliderInput id="closing_costs" label="Closing Costs" min={0} max={10} step={1} unit="%" />
                    </div>

                    {/* Action Button */}
                    <div className="mt-8 pt-6 border-t">
                        <button
                            type="submit"
                            id="analyze-button"
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                </>
                            ) : (
                                'Analyze Properties'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                <StatusDisplay />
                {results.length > 0 && (
                    <ResultsTable
                        results={results}
                        onExportPDF={generatePDF}
                        sortState={sortState}
                        setSortState={setSortState}
                    />
                )}
            </div>
        </>
    );
};

export default Calculator;