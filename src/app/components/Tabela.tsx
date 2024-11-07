import React from 'react'
import { Rodada } from '../types/Rodada'

type TabelaProps = {
    rodadas: Rodada[] | undefined;
};

export default function Tabela(tabelaProps: TabelaProps) {

    return (
        tabelaProps.rodadas?.map((rodada, index) => {
            return (
                <div key={index}>
                    <h1>Rodada {index + 1}</h1>
                    <p>Quantidade nos cestos: {rodada.quantidadeNosCestos}</p>
                    <p>Quantidade no lago: {rodada.quantidadeLagoInicial}</p>
                    <p>Saldo da banca: {rodada.saldoBanca}</p>
                    <p>Quantidade no lago final: {rodada.quantidadeLagoFinal}</p>
                </div>

            )
        })
    )
}
