import { PlayerProfile, PlayerState } from "playroomkit";

export type Jogada = {
  idJogador: string;
  //intencao da jogada
  quantidadePescada: number;
  jogadorAFiscalizar: string | null;
  //resultado da jogada
  quantidadeAcumulada: number;
  fiscalizadoPor: PlayerProfile[];
  roubou: boolean;
  multa: number;
  rateioGanhado: number;
  rateioPerdido: number;
  //resultadoRodada: Res
};
