import React from 'react'

type JogadorProps = {
    nome: string;
    quantidadeTotalPescada?: number;
}
export default function Jogador(jogadorProps: JogadorProps) {

    return (
        <div>
            <h1>Jogador {jogadorProps.nome}</h1>
            {jogadorProps.quantidadeTotalPescada != null ? 
                <h2>Quantidade Pescada {jogadorProps.quantidadeTotalPescada}</h2>
            : null} 
        </div>
    )
}
