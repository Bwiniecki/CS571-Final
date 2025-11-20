import Calculator from './Calculator';

function App() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Real Estate Investment Analyzer</h1>
        <p className="text-gray-600 mt-2">Find multi-family properties and analyze their investment potential.</p>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Calculator />
      </main>
    </div>
  );
}

export default App;