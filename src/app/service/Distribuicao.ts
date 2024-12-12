// Função que distribui peixes proporcionalmente entre os jogadores
// retorna um objeto com o id do jogador e a quantidade de peixes pescados por ele
// ex: { "jogador1": 10, "jogador2": 20, "jogador3": 30 }
export const distribuirPeixesProporcional = (
  jogadas: { idJogador: string; quantidadePescada: number }[],
  totalPeixesDisponiveis: number
): Record<string, number> => {
  const resultado: Record<string, number> = {};
  let peixesRestantes = totalPeixesDisponiveis;

  // Calcula a quantidade base de peixes que cada jogador pode pescar
  const quantidadeBase = Math.floor(totalPeixesDisponiveis / jogadas.length);

  // verifica quais jogadores estão dentro e fora do limite
  const jogadoresDentreLimite = jogadas.filter(
    (j) => j.quantidadePescada <= quantidadeBase
  );
  const jogadoresAcimaLimite = jogadas.filter(
    (j) => j.quantidadePescada > quantidadeBase
  );

  // distribui peixes para jogadores dentro do limite
  jogadoresDentreLimite.forEach((jogada) => {
    const pescou = Math.min(jogada.quantidadePescada, peixesRestantes);
    resultado[jogada.idJogador] = pescou;
    peixesRestantes -= pescou;
  });

  // distribui peixes para jogadores acima do limite
  if (jogadoresAcimaLimite.length > 0) {
    const peixesPorJogador = peixesRestantes / jogadoresAcimaLimite.length;
    jogadoresAcimaLimite.forEach((jogada) => {
      resultado[jogada.idJogador] = peixesPorJogador;
    });
  }

  return resultado;
};
