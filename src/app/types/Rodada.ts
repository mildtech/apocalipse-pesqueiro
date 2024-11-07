import { Jogada } from "./Jogada";

export type Rodada = {
  numero: number;
  quantidadeLagoInicial: number;
  quantidadeLagoFinal?: number;
  quantidadeNosCestos?: number;
  saldoBanca?: number;
  jogadas: Jogada[];
};
