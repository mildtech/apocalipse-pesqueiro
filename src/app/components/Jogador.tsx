import React from 'react'

type JogadorProps = {
    nome: string;
    idade?: number;
}
export default function Jogador(jogadorProps: JogadorProps) {

    return (
        <div>
            <h1>Jogador {jogadorProps.nome} - idade : {jogadorProps.idade}</h1>
        </div>
    )
}
