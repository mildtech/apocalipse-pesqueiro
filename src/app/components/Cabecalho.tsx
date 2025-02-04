import React from 'react'
import { GameState } from '../types/GameState';
import Jogador from './Jogador';
import { PlayerState } from 'playroomkit';
import { PEIXES_CESTO } from '../types/Constants';

type CabecalhoProps = {
    gameState: GameState;
    jogador: PlayerState;
};

export default function Cabecalho(cabecalhoProps: CabecalhoProps) {

    return (
        <div className="relative grid gap-2 grid-cols-2 grid-rows-1 w-full h-full p-2">
            <div className="w-full">
                <Jogador key={cabecalhoProps.jogador?.id} id={cabecalhoProps.jogador?.id} nome={cabecalhoProps.jogador?.getProfile().name} photo={cabecalhoProps.jogador?.getProfile().photo} quantidadeTotalPescada={cabecalhoProps.jogador?.getState(PEIXES_CESTO)} />
            </div>
            <div className="grid gap-0 grid-cols-1 grid-rows-3 w-full">
                <div className="w-full">
                    Peixes no Lago: {cabecalhoProps.gameState.quantidadePeixesLago.toFixed(1)}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-black-600"> 🐟 Peixes no Cesto:</span>
                    <span className="font-medium">{cabecalhoProps.jogador?.getState(PEIXES_CESTO)?.toFixed(1)}</span>
                </div>
                <div className="w-full">
                    Rodada : {cabecalhoProps.gameState.rodadas.length + 1} / 10
                </div>
            </div>

        </div>)


}
