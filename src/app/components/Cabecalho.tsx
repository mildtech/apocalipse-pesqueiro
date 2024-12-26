import React from 'react'
import { GameState } from '../types/GameState';
import Jogador from './Jogador';
import { PlayerState } from 'playroomkit';
import { PEIXES_CESTO } from '../types/Constants';

type CabecalhoProps = {
    gameState: GameState;
    jogador: PlayerState;
    isEditable: boolean;
    onChange: (value: Partial<GameState>) => void;
};

export default function Cabecalho(cabecalhoProps: CabecalhoProps) {

    const handleOnChange = (value: Partial<GameState>) => {
        if (cabecalhoProps.onChange) {
            cabecalhoProps.onChange(value);
        }
    }

    return (
        <div className="relative w-full h-full">
            <div className="w-full">
                <Jogador key={cabecalhoProps.jogador?.id} id={cabecalhoProps.jogador?.id} nome={cabecalhoProps.jogador?.getProfile().name} quantidadeTotalPescada={cabecalhoProps.jogador?.getState(PEIXES_CESTO)} />
            </div>
            <div className="grid gap-2 grid-cols-1 grid-rows-3 w-full">
                <div className="w-full">
                    Quantidade da banca: {cabecalhoProps.gameState.quantidadeBanca}
                </div>
                <div className="w-full">
                    Rodada : {cabecalhoProps.gameState.rodadas.length + 1} / 10
                </div>
            </div>
            <details className="absolute top-0 right-0 p-4 border rounded bg-white shadow-lg w-auto" open={cabecalhoProps.gameState.rodadas.length === 0}>
                <summary className="font-bold cursor-pointer">Parâmetros do Jogo</summary>
                <div className="grid gap-2 grid-cols-2 grid-rows-3 mt-2">
                    <div>
                        Limite Sustentável: {cabecalhoProps.isEditable ? (
                            <input
                                type="number"
                                value={cabecalhoProps.gameState.limiteSustentavel}
                                onChange={(e) => handleOnChange({ limiteSustentavel: Number(e.target.value) })}
                                className="w-20 px-2 border rounded"
                            />
                        ) : cabecalhoProps.gameState.limiteSustentavel}
                    </div>
                    <div>
                        Limite máximo Possível: {cabecalhoProps.isEditable ? (
                            <input
                                type="number"
                                value={cabecalhoProps.gameState.limitePossivelRodada}
                                onChange={(e) => handleOnChange({ limitePossivelRodada: Number(e.target.value) })}
                                className="w-20 px-2 border rounded"
                            />
                        ) : cabecalhoProps.gameState.limitePossivelRodada}
                    </div>
                    <div>
                        Custo fiscalização: {cabecalhoProps.isEditable ? (
                            <input
                                type="number"
                                value={cabecalhoProps.gameState.custoFiscalizacao}
                                onChange={(e) => handleOnChange({ custoFiscalizacao: Number(e.target.value) })}
                                className="w-20 px-2 border rounded"
                            />
                        ) : cabecalhoProps.gameState.custoFiscalizacao}
                    </div>
                    <div>
                        Taxa de crescimento: {cabecalhoProps.isEditable ? (
                            <input
                                type="number"
                                value={cabecalhoProps.gameState.taxaCrescimento}
                                onChange={(e) => handleOnChange({ taxaCrescimento: Number(e.target.value) })}
                                className="w-20 px-2 border rounded"
                            />
                        ) : cabecalhoProps.gameState.taxaCrescimento}
                    </div>
                </div>
            </details>
        </div>)


}
