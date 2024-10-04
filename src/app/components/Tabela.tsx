import React from 'react';

type Rodada = {
  numero: number;
  quantidadePeixesLago: number;
  quantidadePescadaTotal: number;
  detalhesJogadores: {
    [playerId: string]: {
      quantidadePescada: number;
      fiscalizou: string | null;
      foiFiscalizado: boolean;
      multa: number;
      peixesRecebidos: number;
    }
  }
};

type JogadorInfo = {
  id: string;
  nome: string;
};

type TabelaProps = {
  rodadas: Rodada[];
  jogadores: JogadorInfo[];
};

export default function Tabela({ rodadas, jogadores }: TabelaProps) {
  const getJogadorNome = (id: string) => {
    const jogador = jogadores.find((j) => j.id === id);
    return jogador ? jogador.nome : id;
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Rodada</th>
          <th>Peixes no Lago</th>
          <th>Total Pescado</th>
          <th>Detalhes</th>
        </tr>
      </thead>
      <tbody>
        {rodadas.map((rodada) => (
          <tr key={rodada.numero}>
            <td>{rodada.numero}</td>
            <td>{Math.floor(rodada.quantidadePeixesLago)}</td>
            <td>{rodada.quantidadePescadaTotal}</td>
            <td>
              <details>
                <summary>Ver Detalhes</summary>
                {Object.entries(rodada.detalhesJogadores).map(
                  ([playerId, detalhes]) => (
                    <div key={playerId} className="detalhes-jogador">
                      <h4>Jogador: {getJogadorNome(playerId)}</h4>
                      <p>Quantidade Pescada: {detalhes.quantidadePescada}</p>
                      <p>
                        Fiscalizou:{' '}
                        {detalhes.fiscalizou
                          ? getJogadorNome(detalhes.fiscalizou)
                          : 'Nenhum'}
                      </p>
                      <p>
                        Foi Fiscalizado: {detalhes.foiFiscalizado ? 'Sim' : 'Não'}
                      </p>
                      <p>Multa: {detalhes.multa}</p>
                      <p>Peixes Recebidos: {detalhes.peixesRecebidos}</p>
                    </div>
                  )
                )}
              </details>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
