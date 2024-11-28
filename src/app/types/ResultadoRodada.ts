import { PlayerProfile } from "playroomkit";
import { Jogada } from "./Jogada";

export type ResultadoRodada = {
  roubou: boolean;
  fiscalizadores: PlayerProfile[];
  rateioGanhado: number;
  peixesPescadosJogador: number;
  crescimentoLago: number;
};
