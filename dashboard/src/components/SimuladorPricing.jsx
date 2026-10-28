import React, { useState, useEffect } from 'react';

export default function SimuladorPricing() {
  const [dados, setDados] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [variacao, setVariacao] = useState(0);

  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((data) => {
        setDados(data);
        if (data.produtos && data.produtos.length > 0) {
          setProdutoSelecionado(data.produtos[0]);
        }
      })
      .catch((err) => console.error("Erro ao carregar dados do pricing:", err));
  }, []);

  if (!dados || !produtoSelecionado) {
    return <div className="p-6 text-center text-gray-500">Carregando simulador de pricing...</div>;
  }

  const cenarioAtual = produtoSelecionado.curva.find((c) => c.variacao === 0);
  const cenarioSimulado = produtoSelecionado.curva.find((c) => c.variacao === variacao) || cenarioAtual;
  
  const deltaMargem = ((cenarioSimulado.margem / cenarioAtual.margem) - 1) * 100;
  const [fMin, fMax] = produtoSelecionado.faixa_historica;
  const foraDaFaixa = variacao < fMin || variacao > fMax;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Simulador de Reajuste de Preço</h2>
        <p className="text-sm text-gray-500">Baseado nos modelos de elasticidade (regressão log-log) do notebook.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {dados.produtos.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setProdutoSelecionado(p);
              setVariacao(0);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              produtoSelecionado.id === p.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p.nome}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <span className="text-xs text-gray-500 block">Classificação</span>
          <span className="text-lg font-semibold text-gray-800">
            {produtoSelecionado.classificacao} (e = {produtoSelecionado.elasticidade})
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block">Preço Atual</span>
          <span className="text-lg font-semibold text-gray-800">
            R$ {cenarioAtual.preco.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block">Preço de Ótimo (Margem Máxima)</span>
          <span className="text-lg font-semibold text-amber-600">
            R$ {produtoSelecionado.otimo.preco.toFixed(2)} ({produtoSelecionado.otimo.variacao > 0 ? `+${produtoSelecionado.otimo.variacao}` : produtoSelecionado.otimo.variacao}%)
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>Variação de Preço: <strong>{variacao > 0 ? `+${variacao}` : variacao}%</strong></span>
          <span>Preço Simulado: <strong className="text-blue-600">R$ {cenarioSimulado.preco.toFixed(2)}</strong></span>
        </div>
        <input
          type="range"
          min="-20"
          max="40"
          step="1"
          value={variacao}
          onChange={(e) => setVariacao(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>-20%</span>
          <span>Atual (0%)</span>
          <span>+40%</span>
        </div>
      </div>

      {foraDaFaixa && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-sm text-amber-700">
          ⚠️ <strong>Atenção:</strong> Variação fora da faixa histórica observada ({fMin}% a +{fMax}%). O resultado representa uma extrapolação do modelo.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <span className="text-xs text-blue-600 font-medium block">Margem Semanal Simulada</span>
          <span className="text-xl font-bold text-blue-900">
            R$ {cenarioSimulado.margem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-semibold block mt-1 ${deltaMargem >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {deltaMargem >= 0 ? `+${deltaMargem.toFixed(1)}%` : `${deltaMargem.toFixed(1)}%`} vs. atual
          </span>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-500 font-medium block">Quantidade Estimada</span>
          <span className="text-xl font-bold text-gray-800">
            {Math.round(cenarioSimulado.qtd)} un/sem
          </span>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-500 font-medium block">Receita Estimada</span>
          <span className="text-xl font-bold text-gray-800">
            R$ {cenarioSimulado.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
