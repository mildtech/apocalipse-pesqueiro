import React from 'react'
import { GameState } from '../types/GameState';
import Jogador from './Jogador';
import { PlayerState } from 'playroomkit';
import { PEIXES_CESTO } from '../types/Constants';

type ConfiguracoesProps = {
    gameState: GameState;
    jogador: PlayerState;
    isEditable: boolean;
    isConfigVisible: boolean;
    onChange: (value: Partial<GameState>) => void;
};

export default function Configuracoes(configuracoesProps: ConfiguracoesProps) {

    const handleOnChange = (value: Partial<GameState>) => {
        if (configuracoesProps.onChange) {
            configuracoesProps.onChange(value);
        }
    }

    return configuracoesProps.isConfigVisible && (
        <div className="relative w-full h-full">
            <div className="grid gap-2 grid-cols-2 grid-rows-3 mt-2">
                <div>
                    Limite Sustentável: {configuracoesProps.isEditable ? (
                        <input
                            type="number"
                            value={configuracoesProps.gameState.limiteSustentavel}
                            onChange={(e) => handleOnChange({ limiteSustentavel: Number(e.target.value) })}
                            className="w-20 px-2 border rounded"
                        />
                    ) : configuracoesProps.gameState.limiteSustentavel}
                </div>
                <div>
                    Limite máximo Possível: {configuracoesProps.isEditable ? (
                        <input
                            type="number"
                            value={configuracoesProps.gameState.limitePossivelRodada}
                            onChange={(e) => handleOnChange({ limitePossivelRodada: Number(e.target.value) })}
                            className="w-20 px-2 border rounded"
                        />
                    ) : configuracoesProps.gameState.limitePossivelRodada}
                </div>
                <div>
                    Custo fiscalização: {configuracoesProps.isEditable ? (
                        <input
                            type="number"
                            value={configuracoesProps.gameState.custoFiscalizacao}
                            onChange={(e) => handleOnChange({ custoFiscalizacao: Number(e.target.value) })}
                            className="w-20 px-2 border rounded"
                        />
                    ) : configuracoesProps.gameState.custoFiscalizacao}
                </div>
                <div>
                    Taxa de crescimento: {configuracoesProps.isEditable ? (
                        <input
                            type="number"
                            value={configuracoesProps.gameState.taxaCrescimento}
                            onChange={(e) => handleOnChange({ taxaCrescimento: Number(e.target.value) })}
                            className="w-20 px-2 border rounded"
                        />
                    ) : configuracoesProps.gameState.taxaCrescimento}
                </div>
            </div>
        </div>)

}
