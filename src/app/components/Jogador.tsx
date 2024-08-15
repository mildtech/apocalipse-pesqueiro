import React, { useState } from 'react'

type JogadorProps = {
    nome: string;
    quantidadeTotalPescada?: number;
    onClick?: (nome: string) => void;
}
export default function Jogador(jogadorProps: JogadorProps) {
    const [selected, setSelected] = useState(false);

    const handleJogadorClick = () => {
        console.log('Jogador clicado', jogadorProps.nome)
        setSelected(!selected);
        if (jogadorProps.onClick) {
            jogadorProps.onClick(jogadorProps.nome);
        }
    }

    return (
        <div className={( selected ? 'bg-lime-400' : 'bg-lime-200' )} onClick={handleJogadorClick}>
            <h1>Jogador {jogadorProps.nome}</h1>
            {jogadorProps.quantidadeTotalPescada != null ? 
                <h2>Quantidade Pescada {jogadorProps.quantidadeTotalPescada}</h2>
            : null} 
        </div>
    )
}
