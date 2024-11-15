import { Rodada } from "./Rodada";

export type GameState = {
  limiteSustentavel: number;
  limitePossivelRodada: number;
  jogoFinalizado: boolean;
  limiteRodadas: number;
  taxaCrescimento: number;
  custoFiscalizacao: number;
  quantidadeInicialPeixesJogador: number;
  quantidadePeixesLago: number;
  quantidadeBanca: number;
  conteudoChat: string;
  rodadas: Rodada[];
};
