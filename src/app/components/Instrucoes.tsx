import React, { useState } from 'react'
import { Rodada } from '../types/Rodada'
import { PlayerState } from 'playroomkit';
import { PEIXES_CESTO } from '../types/Constants';

type IntrucoesProps = {
  onClick?: () => void;
};

export default function Instrucoes(instrucoeslProps: IntrucoesProps) {

  const handleIniciarClick = () => {
    if (instrucoeslProps.onClick) {
      instrucoeslProps.onClick();
    }
  }
  const textoInicial = "";


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleIniciarClick}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Instruções</h1>

          {textoInicial}
          <ul className="list-disc text-left">
            <li>Cada jogador entrou com 100 peixes no lago comunitário.</li>
            <li>Você escolhe quanto pescar e se quer fiscalizar alguém na cada rodada.</li>
            <li>Se pescar até a quantidade sustentável, pode pagar e fiscalizar um jogador - e pegar parte de seus peixes caso ele tenha pescado mais que o sustentável.</li>
            <li>Caso você pesque mais que o limite sustentável e seja fiscalizado por outro jogador, perderá seus peixes da rodada. </li>
          </ul>
          {/* Restart button className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"*/}
          <button
            onClick={handleIniciarClick}
            className={"bg-cyan-800 text-white rounded-md border-2 px-4 py-2 mb-4 w-full"}
          >
            Iniciar
          </button>
        </div>
      </div>
    </div>
  );
}
