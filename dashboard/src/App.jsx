import React from 'react';
import SimuladorPricing from './components/SimuladorPricing';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Consultoria de Pricing</h1>
        <p className="text-gray-600 mt-2">Simulador interativo de elasticidade de preço e margem</p>
      </header>
      <main>
        <SimuladorPricing />
      </main>
    </div>
  );
}

export default App;
