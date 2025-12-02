import React, { useState } from 'react';
import { FitMode } from '../types';
import { getSuggestedDimensions } from '../services/geminiService';
import { Sparkles, Loader2, Maximize, ArrowRight, Monitor } from 'lucide-react';

interface ControlPanelProps {
  width: number;
  height: number;
  fitMode: FitMode;
  setWidth: (w: number) => void;
  setHeight: (h: number) => void;
  setFitMode: (m: FitMode) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  width,
  height,
  fitMode,
  setWidth,
  setHeight,
  setFitMode,
  onProcess,
  isProcessing
}) => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiSuggest = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const suggestion = await getSuggestedDimensions(aiQuery);
      setWidth(suggestion.width);
      setHeight(suggestion.height);
    } catch (err) {
      setAiError('Error al obtener sugerencia. Intenta de nuevo.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-80 flex-shrink-0 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-8 overflow-y-auto h-full z-10">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          Batch_Joselito
        </h1>
        <p className="text-gray-400 text-sm">Procesamiento de imágenes por lotes.</p>
      </div>

      {/* AI Smart Input */}
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <label className="text-sm font-semibold text-gray-200">Dimensiones Inteligentes</label>
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSuggest()}
            placeholder="ej. 'Historia de Instagram', 'Fondo 4K'"
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            onClick={handleAiSuggest}
            disabled={aiLoading || !aiQuery.trim()}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 rounded-lg transition-all"
          >
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Pedir tamaño a la IA'}
          </button>
          {aiError && <p className="text-xs text-red-400 mt-1">{aiError}</p>}
        </div>
      </div>

      <div className="space-y-6">
        {/* Dimensions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Maximize className="w-4 h-4" /> Tamaño Objetivo (px)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ancho</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Alto</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Fit Mode */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Modo de Ajuste
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'cover', label: 'Cubrir (Recortar)', desc: 'Llena el área, recorta el exceso' },
              { id: 'contain', label: 'Contener (Ajustar)', desc: 'Muestra todo, añade relleno' },
              { id: 'fill', label: 'Estirar (Relleno)', desc: 'Estira la imagen al tamaño exacto' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setFitMode(mode.id as FitMode)}
                className={`flex flex-col items-start p-3 rounded-lg border transition-all ${
                  fitMode === mode.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-100'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span className="text-sm font-medium">{mode.label}</span>
                <span className="text-xs opacity-60">{mode.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-800">
        <button
          onClick={onProcess}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Procesando...
            </>
          ) : (
            <>
              Aplicar Redimensión <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;