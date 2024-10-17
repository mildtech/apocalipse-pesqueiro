import React, { useState } from 'react'

type JogadorProps = {
    id: string;
    nome: string;
    quantidadeTotalPescada?: number;
    selected?: boolean;
    onClick?: (id: string) => void;
}
export default function Jogador(jogadorProps: JogadorProps) {

    const handleJogadorClick = () => {
        if (jogadorProps.onClick) {
            jogadorProps.onClick(jogadorProps.id);
        }
    }

    return (
        <div className={( jogadorProps.selected ? 'bg-lime-400' : 'bg-lime-200' )} onClick={handleJogadorClick}>
            <h1>Jogador {jogadorProps.nome}</h1>
            {jogadorProps.quantidadeTotalPescada != null ? 
                <h2>Quantidade Pescada {jogadorProps.quantidadeTotalPescada}</h2>
            : null} 
        </div>
    )
}
