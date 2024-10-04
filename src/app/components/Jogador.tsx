import React from 'react';

type JogadorProps = {
  nome: string;
  quantidadeTotalPescada?: number;
  saldoRecursos?: number;
  selected?: boolean;
  onClick?: (nome: string) => void;
};

export default function Jogador(jogadorProps: JogadorProps) {
  const handleJogadorClick = () => {
    if (jogadorProps.onClick) {
      jogadorProps.onClick(jogadorProps.nome);
    }
  };

  return (
    <div
      className={`jogador-card ${jogadorProps.selected ? 'selected' : ''}`}
      onClick={handleJogadorClick}
    >
      <h2>{jogadorProps.nome}</h2>
      {jogadorProps.quantidadeTotalPescada != null && (
        <p>Quantidade Pescada: {jogadorProps.quantidadeTotalPescada}</p>
      )}
      {jogadorProps.saldoRecursos != null && (
        <p>Saldo de Recursos: {jogadorProps.saldoRecursos}</p>
      )}
    </div>
  );
}
