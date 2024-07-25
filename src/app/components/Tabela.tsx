import React from 'react'

type Rodada = {
  numero: number;
  quantidadePescada: number;
  quantidadeLago: number;
  asdas: number;
};

type TabelaProps = {
    rodadas: Rodada[] | undefined;
};

export default function Tabela(tabelaProps: TabelaProps) {

    return (
        tabelaProps.rodadas?.map((rodada, index) => {
            return (
                <div key={index}>
                    <h1>Rodada {index + 1}</h1>
                    <p>Quantidade pescada: {rodada.quantidadePescada}</p>
                    <p>Quantidade no lago: {rodada.quantidadeLago}</p>
                </div>
            )
        })
    )
}
