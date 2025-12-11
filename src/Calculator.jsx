import React, { useState } from 'react';
import ResultsTable from './components/ResultsTable';
import SliderInput from './components/SliderInput';
import StatusDisplay from './components/StatusDisplay';

// --- Global Constants ---
const apiKey = "5666032946mshf07b62e13d3c7b0p1f1f4bjsn7632de349410";
const apiHost = "us-housing-market-data1.p.rapidapi.com";

// --- Utility Functions ---
const filterOutliers = (data, key) => {
    if (data.length < 3) return data;
    const values = data.map(item => item[key]);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const std = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / values.length);
    const upperBound = mean + std;
    const lowerBound = mean - std;
    return data.filter(item => item[key] >= lowerBound && item[key] <= upperBound);
};

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

    const updateStatus = (message, type = 'info') => {
        setStatus({ message, type });
    };

    // --- SAVE LOGIC ---
    const saveToPortfolio = (property) => {
        try {
            const existingRaw = localStorage.getItem('savedDeals');
            const existingDeals = existingRaw ? JSON.parse(existingRaw) : [];

            const isDuplicate = existingDeals.some(d => d.zpid === property.zpid);
            if (isDuplicate) {
                updateStatus('Property already in your Saved Deals!', 'warning');
                return;
            }

            const newDeal = { ...property, status: 'New', savedAt: new Date().toISOString() };
            const updatedDeals = [...existingDeals, newDeal];
            
            localStorage.setItem('savedDeals', JSON.stringify(updatedDeals));
            updateStatus('Property successfully saved to your portfolio!', 'success');
        } catch (error) {
            console.error("Save failed", error);
            updateStatus('Failed to save property.', 'error');
        }
    };

    const processListings = (listings, currentParams) => {
        const processed = [];
        if (!listings) return processed;

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
            if (!listing.rentZestimate || !listing.price || !listing.address || listing.price === 0) {
                continue;
            }

            const rent = listing.rentZestimate;
            const cost = listing.price;
            
            const loanAmount = cost * (1 - p.down_payment);
            const i = p.interest_rate / 12;
            const n = p.mortgage_length * 12;
            
            let monthlyPayment = 0;
            if (n > 0 && i > 0) {
                monthlyPayment = loanAmount * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
            } else if (n > 0 && i === 0) {
                 monthlyPayment = loanAmount / n; 
            }
            
            const monthlyIncome = rent;
            const mgmtFee = monthlyIncome * p.property_management;
            const maintenanceFee = monthlyIncome * p.maintenance;
            const vacancyLoss = monthlyIncome * p.vacancy;
            const taxes = (cost * p.tax_rate) / 12;
            const insuranceCost = (cost * p.insurance) / 12; 
            
            const totalMonthlyExpenses = mgmtFee + maintenanceFee + vacancyLoss + taxes + insuranceCost;
            const monthlyCashflow = monthlyIncome - monthlyPayment - totalMonthlyExpenses;
            const yearlyCashflow = monthlyCashflow * 12;
            
            const downPaymentAmount = cost * p.down_payment;
            const closingCostsAmount = cost * p.closing_costs;
            const capital = downPaymentAmount + closingCostsAmount;
            
            const cocReturn = capital > 0 ? (yearlyCashflow / capital) * 100 : 0; 
            
            processed.push({
                address: listing.address, 
                price: cost, 
                rent: rent,
                capital: capital, 
                cashflow: yearlyCashflow, 
                coc: cocReturn, 
                zpid: listing.zpid, 
                imgSrc: listing.imgSrc
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
                const url = `https://us-housing-market-data1.p.rapidapi.com/propertyExtendedSearch?location=${encodeURIComponent(location)}&page=${currentPage}&status_type=ForSale&home_type=Multi-family`;
                const options = {
                    method: 'GET',
                    headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': apiHost }
                };
                
                const response = await fetch(url, options);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API Error: ${errorData.message || response.statusText}`);
                }
                
                const data = await response.json();
                console.log("API Response:", data);

                if (currentPage === 1) {
                    totalPages = data.totalPages || 1;
                    updateStatus(`Found ${data.totalResultCount} total properties across ${totalPages} pages.`, 'info');
                    if (data.totalResultCount === 0) break;
                }

                const listings = data.props || [];
                const processedPage = processListings(listings, params);
                allProperties.push(...processedPage);
                
                currentPage++;
                await new Promise(resolve => setTimeout(resolve, 1100)); 
            }

            if (allProperties.length === 0) {
                 updateStatus('No valid multi-family properties with rent estimates found. Try a different location or check "Single Family" listings.', 'warning');
            } else {
                const finalResults = allProperties.length > 5 ? filterOutliers(allProperties, 'coc') : allProperties;
                setResults(finalResults);
                updateStatus(`Analysis complete. Displaying ${finalResults.length} results.`, 'success');
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            updateStatus(`An error occurred: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    // PDF Generation Logic
    const generatePDF = async (property) => {
        if (!window.jspdf) {
            updateStatus('PDF library (jspdf) is not loaded. Cannot export.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        updateStatus('Generating PDF report...', 'loading');

        const currency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
        const percent = (num) => `${(num * 100).toFixed(2)}%`;
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

        doc.setFont("helvetica", "bold"); doc.setFontSize(20);
        doc.text("Investment Property Analysis", 105, 20, { align: "center" });
        doc.setFontSize(14); doc.text(property.address, 105, 30, { align: "center" });

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
                // Ignore image error
            }
        }
        
        let yPos = 45;
        doc.setFont("helvetica", "bold"); doc.setFontSize(12);
        doc.text("Key Financials (Year 1)", 105, yPos); yPos += 7;
        doc.setFont("helvetica", "normal");
        const metrics = [
            ["Purchase Price:", currency(cost)],
            ["Est. Monthly Rent:", currency(rent)],
            ["Yearly Cash Flow:", currency(yearlyCashflow)],
            ["Capital Needed:", currency(totalCapitalNeeded)],
            ["CoC Return:", { text: percent(cocReturn), color: cocReturn > 0.1 ? [0, 128, 0] : (cocReturn > 0.05 ? [255, 165, 0] : [255, 0, 0]) }]
        ];
        metrics.forEach(([label, value]) => {
            doc.setFont("helvetica", "normal"); doc.text(label, 105, yPos);
            if(typeof value === 'object'){
                doc.setFont("helvetica", "bold"); doc.setTextColor(value.color[0], value.color[1], value.color[2]);
                doc.text(value.text, 200, yPos, {align: "right"}); doc.setTextColor(0,0,0);
            } else {
                doc.setFont("helvetica", "normal"); doc.text(value, 200, yPos, {align: "right"});
            }
            yPos += 7;
        });

        const filename = `Property_Analysis_${property.address.replace(/[^\w]/g, '_')}.pdf`;
        doc.save(filename);
        updateStatus(`Successfully generated report for ${property.address}.`, 'success');
        setIsLoading(false);
    };

    const handleParamChange = (e) => {
        const { id, value } = e.target;
        setParams(prev => ({ ...prev, [id]: parseFloat(value) }));
    };

    return {
        location, setLocation,
        params, handleParamChange,
        results, status,
        isLoading, runAnalysis,
        generatePDF,
        saveToPortfolio,
        sortState, setSortState
    };
};

const Calculator = () => {
    const {
        location, setLocation,
        params, handleParamChange,
        results, status,
        isLoading, runAnalysis,
        generatePDF,
        saveToPortfolio,
        sortState, setSortState
    } = useInvestmentCalculator();

    const handleSubmit = (e) => {
        e.preventDefault();
        runAnalysis();
    };

    return (
        <>
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-900">Analysis Parameters</h2>
                
                <form id="analyzer-form" onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                id="location"
                                placeholder="e.g., Austin, TX"
                                className="w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black placeholder-gray-500"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 pt-4 border-t">Financials</h3>
                        {/* Using Imported Components */}
                        <SliderInput id="down_payment" label="Down Payment" value={params.down_payment} onChange={handleParamChange} min={0} max={100} step={1} unit="%" />
                        <SliderInput id="interest_rate" label="Interest Rate" value={params.interest_rate} onChange={handleParamChange} min={1} max={15} step={0.1} unit="%" />
                        <SliderInput id="mortgage_length" label="Mortgage Length" value={params.mortgage_length} onChange={handleParamChange} min={5} max={40} step={1} unit=" yrs" />
                        <SliderInput id="property_tax" label="Property Tax Rate" value={params.property_tax} onChange={handleParamChange} min={0} max={10} step={0.1} unit="%" />
                        <SliderInput id="maintenance" label="Maintenance" value={params.maintenance} onChange={handleParamChange} min={0} max={30} step={1} unit="%" />
                        <SliderInput id="vacancy" label="Vacancy" value={params.vacancy} onChange={handleParamChange} min={0} max={30} step={1} unit="%" />
                        <SliderInput id="property_management" label="Property Mgmt" value={params.property_management} onChange={handleParamChange} min={0} max={30} step={1} unit="%" note="Fee is based on monthly rent." />
                        <SliderInput id="insurance" label="Insurance" value={params.insurance} onChange={handleParamChange} min={0} max={30} step={1} unit="%" />
                        <SliderInput id="closing_costs" label="Closing Costs" value={params.closing_costs} onChange={handleParamChange} min={0} max={10} step={1} unit="%" />
                    </div>

                    <div className="mt-8 pt-6 border-t">
                        <button
                            type="submit"
                            id="analyze-button"
                            className="w-full bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Properties'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                {/* Using Imported Component */}
                <StatusDisplay status={status} />
                {results.length > 0 && (
                    <ResultsTable
                        results={results}
                        onExportPDF={generatePDF}
                        onSave={saveToPortfolio}
                        sortState={sortState}
                        setSortState={setSortState}
                    />
                )}
            </div>
        </>
    );
};

export default Calculator;