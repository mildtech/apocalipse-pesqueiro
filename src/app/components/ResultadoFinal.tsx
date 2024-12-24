import React from 'react'
import { Rodada } from '../types/Rodada'
import { PlayerState } from 'playroomkit';
import { PEIXES_CESTO } from '../types/Constants';

type ResultadoFinalProps = {
  jogadores: PlayerState[] | undefined;
  onClick?: () => void;
};

export default function ResultadoFinal(resultadoFinalProps: ResultadoFinalProps) {
  const handleResultadoClick = () => {
    if (resultadoFinalProps.onClick) {
      resultadoFinalProps.onClick();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleResultadoClick}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resultado</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Ranking</h2>

          <ol className="space-y-3 mb-8">
            {resultadoFinalProps.jogadores?.sort(
              (a, b) => b.getState(PEIXES_CESTO) - a.getState(PEIXES_CESTO)
            ).map((jogador, index) => (
              <li
                key={jogador.id}
                className={`flex justify-between items-center p-3 rounded-lg ${index === 0 ? 'bg-yellow-100' : 'bg-gray-50'
                  }`}
              >
                <span className="font-medium">{jogador.getProfile().name}</span>
                <span className="text-blue-600 font-bold">
                  {jogador.getState(PEIXES_CESTO)} peixes
                </span>
              </li>
            ))}
          </ol>

          {/* Restart button */}
          <button
            onClick={handleResultadoClick}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
