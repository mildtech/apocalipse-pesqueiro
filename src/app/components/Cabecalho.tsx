import React from 'react'
import { GameState } from '../types/GameState';
import Jogador from './Jogador';
import { PlayerState } from 'playroomkit';
import { PEIXES_CESTO } from '../page';

type CabecalhoProps = {
    gameState: GameState;
    jogador: PlayerState;
};

export default function Cabecalho(cabecalhoProps: CabecalhoProps) {

        return (<div>
                    <div className="grid gap-4 grid-cols-2 grid-rows-3">
                        <div>
                            <Jogador key={cabecalhoProps.jogador?.id} id={cabecalhoProps.jogador?.id} nome={cabecalhoProps.jogador?.getProfile().name} quantidadeTotalPescada={cabecalhoProps.jogador?.getState(PEIXES_CESTO)}/>
                        </div>
                        <div>
                            Limite Sustentável: {cabecalhoProps.gameState.limiteSustentavel}
                        </div>
                        <div>
                            Quantidade da banca: {cabecalhoProps.gameState.quantidadeBanca}
                        </div>
                        <div>
                            Limite máximo Possível: {cabecalhoProps.gameState.limitePossivelRodada}
                        </div>
                        <div>
                            Rodada : {cabecalhoProps.gameState.rodadas.length + 1} / 10
                        </div>
                        <div>
                            Custo fiscalização: {cabecalhoProps.gameState.custoFiscalizacao}
                        </div>
                    </div>
                </div>)
        
    
}
