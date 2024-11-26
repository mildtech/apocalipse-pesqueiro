// components/Grafico.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Rodada } from '../types/Rodada';

type GraficoProps = {
  rodadas: Rodada[];
};

export default function Grafico({ rodadas }: GraficoProps) {
  // Prepara os dados para o gráfico
  const data = [];

  // Adiciona dados das rodadas existentes
  for (let i = 0; i < rodadas.length; i++) {
    data.push({
      rodada: i + 1,
      quantidadePeixesLago: rodadas[i].quantidadeLagoFinal,
    });
  }

  // Preenche o restante até a rodada 10 com valores nulos
  for (let i = rodadas.length; i < 10; i++) {
    data.push({
      rodada: i + 1,
      quantidadePeixesLago: null,
    });
  }

  console.log("Dados do gráfico:", data); // Verifica os dados sendo passados para o gráfico

  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="rodada" domain={[1, 10]} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="quantidadePeixesLago" stroke="#8884d8" />
    </LineChart>
  );
}
