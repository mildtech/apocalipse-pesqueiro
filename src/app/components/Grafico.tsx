// components/Grafico.tsx
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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

  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="rodada" domain={[0, gameState?.limiteRodadas]} tick={{ fill: 'black' }} />
      <YAxis tick={{ fill: 'black' }} />
      <Tooltip />
      <Legend wrapperStyle={{ color: 'black' }} />
      <Line type="monotone" dataKey="quantidadePeixesLago" stroke="#8884d8" />
    </LineChart>
  );
}
