// components/Grafico.tsx
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Rodada } from '../types/Rodada';
import { GameState } from '../types/GameState';

type GraficoProps = {
  gameState: GameState;
  quantidadeJogadores: number;
};

export default function Grafico({ gameState, quantidadeJogadores }: GraficoProps) {

  // Prepara os dados para o gráfico
  const data = [{
    rodada: 0,
    quantidadePeixesLago: gameState?.quantidadeInicialPeixesJogador * quantidadeJogadores || null,
  }];

  // Adiciona dados das rodadas existentes
  for (let i = 0; i < gameState.rodadas.length; i++) {
    data.push({
      rodada: i + 1,
      quantidadePeixesLago: Number(gameState.rodadas[i].quantidadeLagoFinal?.toFixed(2)) || null,
    });
  }

  // Preenche o restante até a rodada 10 com valores nulos
  for (let i = gameState.rodadas.length; i < gameState.limiteRodadas; i++) {
    data.push({
      rodada: i + 1,
      quantidadePeixesLago: null,
    });
  }

  //console.log("Dados do gráfico:", data); // Verifica os dados sendo passados para o gráfico

  const renderLastLabel = (props: any) => {
    const { x, y, value, index } = props;
    // Encontre o índice do último valor válido
    const lastValidIndex = data
      .map((d, i) => (d.quantidadePeixesLago !== null ? i : -1))
      .filter(i => i !== -1)
      .pop();

    if (index === lastValidIndex) {
      return (
        <text x={x} y={y - 10} fill="black" fontSize="14" textAnchor="start">
          {value} peixes
        </text>
      );
    }
    return null;
  };


  return (
    <div className="w-full mx-auto p-4">
      <h2 className="text-lg font-semibold mb-2">Quantidade de Peixes</h2>
      <div className="w-full aspect-[2/1] min-h-[200px] max-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rodada" domain={[0, gameState?.limiteRodadas]} tick={{ fill: 'black' }} />
            <Tooltip />
            <Line type="monotone" dataKey="quantidadePeixesLago" stroke="#8884d8" strokeWidth={5}>
              <LabelList dataKey="quantidadePeixesLago" content={renderLastLabel} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div >
  );
}
