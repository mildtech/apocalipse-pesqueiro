import { distribuirPeixesProporcional } from "@/app/service/Distribuicao";
import { Jogada } from "@/app/types/Jogada";

describe("Testes para a função: distribuirPeixesProporcional", () => {
  it("deve distribuir peixes proporcionalmente quando o total de peixes a serem pescados é maior que o disponível", () => {
    const jogadas: Jogada[] = [
      {
        idJogador: "1",
        quantidadePescada: 10,
        jogadorAFiscalizar: null,
        quantidadeAcumulada: 0,
        fiscalizadoPor: [],
        roubou: false,
        multa: 0,
        rateioGanhado: 0,
        rateioPerdido: 0,
      },
      {
        idJogador: "2",
        quantidadePescada: 20,
        jogadorAFiscalizar: null,
        quantidadeAcumulada: 0,
        fiscalizadoPor: [],
        roubou: false,
        multa: 0,
        rateioGanhado: 0,
        rateioPerdido: 0,
      },
      {
        idJogador: "3",
        quantidadePescada: 30,
        jogadorAFiscalizar: null,
        quantidadeAcumulada: 0,
        fiscalizadoPor: [],
        roubou: false,
        multa: 0,
        rateioGanhado: 0,
        rateioPerdido: 0,
      },
    ];
    const totalPeixesDisponiveis = 45;

    const resultado = distribuirPeixesProporcional(
      jogadas,
      totalPeixesDisponiveis
    );

    expect(resultado).toEqual({ "1": 10, "2": 17.5, "3": 17.5 });
  });

  it("deve distribuir peixes proporcionalmente quando o total de peixes a serem pescados é menor que o disponível", () => {
    const jogadas: Jogada[] = [
      {
        idJogador: "1",
        quantidadePescada: 10,
        jogadorAFiscalizar: null,
        quantidadeAcumulada: 0,
        fiscalizadoPor: [],
        roubou: false,
        multa: 0,
        rateioGanhado: 0,
        rateioPerdido: 0,
      },
      {
        idJogador: "2",
        quantidadePescada: 20,
        jogadorAFiscalizar: null,
        quantidadeAcumulada: 0,
        fiscalizadoPor: [],
        roubou: false,
        multa: 0,
        rateioGanhado: 0,
        rateioPerdido: 0,
      },
      {
        idJogador: "3",
        quantidadePescada: 30,
        jogadorAFiscalizar: null,
        quantidadeAcumulada: 0,
        fiscalizadoPor: [],
        roubou: false,
        multa: 0,
        rateioGanhado: 0,
        rateioPerdido: 0,
      },
    ];
    const totalPeixesDisponiveis = 100;

    const resultado = distribuirPeixesProporcional(
      jogadas,
      totalPeixesDisponiveis
    );

    expect(resultado).toEqual({ "1": 10, "2": 20, "3": 30 });
  });

  it("deve lidar com o caso limite quando não há peixes disponíveis para atender a demanda minima de cada jogador", () => {
    const jogadas: Jogada[] = [
      {
        idJogador: "1",
        quantidadePescada: 10,
        jogadorAFiscalizar: null,
        quantidadeAcumulada: 0,
        fiscalizadoPor: [],
        roubou: false,
        multa: 0,
        rateioGanhado: 0,
        rateioPerdido: 0,
      },
      {
        idJogador: "2",
        quantidadePescada: 20,
        jogadorAFiscalizar: null,
        quantidadeAcumulada: 0,
        fiscalizadoPor: [],
        roubou: false,
        multa: 0,
        rateioGanhado: 0,
        rateioPerdido: 0,
      },
      {
        idJogador: "3",
        quantidadePescada: 30,
        jogadorAFiscalizar: null,
        quantidadeAcumulada: 0,
        fiscalizadoPor: [],
        roubou: false,
        multa: 0,
        rateioGanhado: 0,
        rateioPerdido: 0,
      },
      {
        idJogador: "4",
        quantidadePescada: 30,
        jogadorAFiscalizar: null,
        quantidadeAcumulada: 0,
        fiscalizadoPor: [],
        roubou: false,
        multa: 0,
        rateioGanhado: 0,
        rateioPerdido: 0,
      },
    ];
    const totalPeixesDisponiveis = 10;

    const resultado = distribuirPeixesProporcional(
      jogadas,
      totalPeixesDisponiveis
    );

    expect(resultado).toEqual({ "1": 2.5, "2": 2.5, "3": 2.5, "4": 2.5 });
  });
});
