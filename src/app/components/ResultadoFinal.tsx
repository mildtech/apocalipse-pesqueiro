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
       <div className='absolute inset-0 bg-red-500' onClick={()=>handleResultadoClick()}>
            <h1>Resultado</h1>
            {/* exibe lista de jogadores com mais peixes pescados */}
            <h2>Ranking</h2>
            <ol>
              {resultadoFinalProps.jogadores?.sort(
                (a, b) => b.getState(PEIXES_CESTO) - a.getState(PEIXES_CESTO)
              ).map(jogador => {
                return <li key={jogador.id}>{jogador.getProfile().name}: {jogador.getState(PEIXES_CESTO)}</li>
              })}
            </ol>

          </div>
    )
}
