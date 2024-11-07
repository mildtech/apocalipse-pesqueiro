import { Rodada } from "./Rodada";

export type GameState = {
  limiteSustentavel: number;
  limitePossivelRodada: number;
  taxaCrescimento: number;
  custoFiscalizacao: number;
  quantidadeInicialPeixesJogador: number;
  quantidadePeixesLago: number;
  quantidadeBanca: number;
  rodadas: Rodada[];
};
