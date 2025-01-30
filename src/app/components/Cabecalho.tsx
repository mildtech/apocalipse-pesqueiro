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
        <div className="relative w-full h-full">
            <div className="w-full">
                <Jogador key={cabecalhoProps.jogador?.id} id={cabecalhoProps.jogador?.id} nome={cabecalhoProps.jogador?.getProfile().name} photo={cabecalhoProps.jogador?.getProfile().photo} quantidadeTotalPescada={cabecalhoProps.jogador?.getState(PEIXES_CESTO)} />
            </div>
            <div className="grid gap-2 grid-cols-1 grid-rows-3 w-full">
                <div className="w-full">
                    Quantidade da banca: {cabecalhoProps.gameState.quantidadeBanca}
                </div>
                <div className="w-full">
                    Rodada : {cabecalhoProps.gameState.rodadas.length + 1} / 10
                </div>
            </div>

        </div>)


}
