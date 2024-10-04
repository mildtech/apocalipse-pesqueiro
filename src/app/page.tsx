"use client"

import { useCallback, useEffect, useRef, useState } from 'react';
import Jogador from './components/Jogador';
import Tabela from './components/Tabela';
import { insertCoin, myPlayer, onPlayerJoin, useMultiplayerState, usePlayersList, PlayerState } from 'playroomkit';

type Rodada = {
  numero: number;
  quantidadePeixesLago: number;
  quantidadePescadaTotal: number;
  detalhesJogadores: {
    [playerId: string]: {
      quantidadePescada: number;
      fiscalizou: string | null;
      foiFiscalizado: boolean;
      multa: number;
      peixesRecebidos: number;
    }
  }
}

type JogadorState = {
  nome: string;
  quantidadeTotalPescada: number;
  saldoRecursos: number;
}

type GameState = {
  limiteSustentavel: number;
  limitePossivelRodada: number;
  taxaCrescimento: number;
  custoFiscalizacao: number;
  quantidadeInicialPeixesJogador: number;
  quantidadePeixesLago: number;
  rodadaAtual: number;
  rodadas: Rodada[];
  totalJogadores: number;
  saldoCasa: number;
  jogoFinalizado: boolean;
}

const initialState: GameState = {
  limiteSustentavel: 12,
  limitePossivelRodada: 20,
  taxaCrescimento: 1.02,
  custoFiscalizacao: 1,
  quantidadeInicialPeixesJogador: 100,
  quantidadePeixesLago: 0,
  rodadaAtual: 1,
  rodadas: [],
  totalJogadores: 0,
  saldoCasa: 0,
  jogoFinalizado: false,
}

const PEIXES_PESCADOS = 'peixesPescados';
const FISCALIZACAO = 'fiscalizacao';
const SALDO_RECURSOS = 'saldoRecursos';

export default function Home() {
  const quantidadePescadaRef = useRef<HTMLInputElement>(null);
  const fiscalizarRef = useRef<HTMLSelectElement>(null);

  const [gameState, setGameState] = useMultiplayerState('gameState', initialState);
  const [peixesPescados, setPeixesPescados] = useState<number>(0);
  const [saldoRecursos, setSaldoRecursos] = useState<number>(0);
  const [decisaoFiscalizacao, setDecisaoFiscalizacao] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const jogadores = usePlayersList(true);

  useEffect(() => {
    async function setGame() {
      await insertCoin({ matchmaking: true });

      onPlayerJoin((playerState: PlayerState) => {
        console.log(playerState.getProfile().name + ' joined the game');
        playerState.setState(PEIXES_PESCADOS, 0);
        playerState.setState(SALDO_RECURSOS, 0);
        playerState.setState(FISCALIZACAO, null);

        playerState.onQuit(() => {
          console.log(playerState.getProfile().name + ' left the game');
        });
      });
    }

    setGame();

  }, []);

  useEffect(() => {
    // Update total number of players in gameState
    setGameState((prevState) => ({
      ...prevState,
      totalJogadores: jogadores.length,
      quantidadePeixesLago: jogadores.length * prevState.quantidadeInicialPeixesJogador,
    }), true);
  }, [jogadores]);

  function handleJogadorClick(nome: string) {
    console.log('Jogador a ser fiscalizado: ' + nome);
    setDecisaoFiscalizacao(nome);
    myPlayer()?.setState(FISCALIZACAO, nome, true);
  }

  function handlePescar() {
    const quantidadePescada = Number(quantidadePescadaRef.current?.value);
    if (quantidadePescada > gameState.limitePossivelRodada) {
      setError('Quantidade de peixes pescados maior que o limite possível por rodada');
      return;
    }
    if (quantidadePescada < 0) {
      setError('Quantidade de peixes pescados não pode ser negativa');
      return;
    }
    setPeixesPescados(quantidadePescada);
    myPlayer()?.setState(PEIXES_PESCADOS, quantidadePescada, true);

    // If player exceeds sustainable limit, they cannot fiscalize
    if (quantidadePescada > gameState.limiteSustentavel) {
      setDecisaoFiscalizacao(null);
      myPlayer()?.setState(FISCALIZACAO, null, true);
    }
  }

  function handleFiscalizar() {
    const jogadorFiscalizado = fiscalizarRef.current?.value || null;
    setDecisaoFiscalizacao(jogadorFiscalizado);
    myPlayer()?.setState(FISCALIZACAO, jogadorFiscalizado, true);
  }

  function handleFinalizarRodada() {
    // Only proceed if all players have made their choices
    const allPlayersReady = jogadores.every(jogador => jogador.getState(PEIXES_PESCADOS) != null);
    if (!allPlayersReady) {
      setError('Aguardando todos os jogadores terminarem suas ações');
      return;
    }

    // Process the round
    const novaRodada: Rodada = {
      numero: gameState.rodadaAtual,
      quantidadePeixesLago: gameState.quantidadePeixesLago,
      quantidadePescadaTotal: 0,
      detalhesJogadores: {},
    };

    let totalPeixesPescados = 0;
    let totalPeixesMulta = 0;
    let saldoCasa = gameState.saldoCasa;

    // Create a map of player IDs to their data
    const playerData: { [id: string]: PlayerState } = {};
    jogadores.forEach(jogador => {
      playerData[jogador.id] = jogador;
    });

    // First pass: calculate total fish caught and prepare data
    jogadores.forEach(jogador => {
      const quantidadePescada = jogador.getState(PEIXES_PESCADOS) || 0;
      totalPeixesPescados += quantidadePescada;
      novaRodada.quantidadePescadaTotal += quantidadePescada;

      novaRodada.detalhesJogadores[jogador.id] = {
        quantidadePescada: quantidadePescada,
        fiscalizou: jogador.getState(FISCALIZACAO),
        foiFiscalizado: false,
        multa: 0,
        peixesRecebidos: 0,
      };
    });

    // Second pass: process fiscalizations
    jogadores.forEach(jogador => {
      const fiscalizadoNome = jogador.getState(FISCALIZACAO);
      const quantidadePescada = jogador.getState(PEIXES_PESCADOS) || 0;
      const jogadorId = jogador.id;

      if (quantidadePescada <= gameState.limiteSustentavel && fiscalizadoNome) {
        // Find the player being fiscalized
        const fiscalizado = jogadores.find(j => j.getProfile().name === fiscalizadoNome);

        if (fiscalizado) {
          const fiscalizadoId = fiscalizado.id;
          const fiscalizadoQuantidadePescada = fiscalizado.getState(PEIXES_PESCADOS) || 0;

          // Mark that the player was fiscalized
          novaRodada.detalhesJogadores[fiscalizadoId].foiFiscalizado = true;

          if (fiscalizadoQuantidadePescada > gameState.limiteSustentavel) {
            // Player exceeded limit and was fiscalized
            const multa = fiscalizadoQuantidadePescada;
            totalPeixesMulta += multa;
            saldoCasa += multa * 0.1; // House takes 10%
            const peixesParaFiscalizador = multa * 0.9; // Remaining goes to fiscalizer

            // Update the fiscalizer's resources
            const fiscalizadorSaldoRecursos = (jogador.getState(SALDO_RECURSOS) || 0) + peixesParaFiscalizador - gameState.custoFiscalizacao;
            jogador.setState(SALDO_RECURSOS, fiscalizadorSaldoRecursos, true);

            // Update the fiscalized player's resources (lose everything this round)
            fiscalizado.setState(SALDO_RECURSOS, (fiscalizado.getState(SALDO_RECURSOS) || 0) - multa, true);

            // Update details in novaRodada
            novaRodada.detalhesJogadores[fiscalizadoId].multa = multa;
            novaRodada.detalhesJogadores[jogadorId].peixesRecebidos += peixesParaFiscalizador;

          } else {
            // Player did not exceed limit; fiscalizer pays cost
            saldoCasa += gameState.custoFiscalizacao;
            const fiscalizadorSaldoRecursos = (jogador.getState(SALDO_RECURSOS) || 0) - gameState.custoFiscalizacao;
            jogador.setState(SALDO_RECURSOS, fiscalizadorSaldoRecursos, true);
          }
        }
      }
    });

    // Update the lake
    const peixesRestantes = gameState.quantidadePeixesLago - totalPeixesPescados;
    const peixesCrescimento = peixesRestantes > 0 ? peixesRestantes * gameState.taxaCrescimento : 0;
    const novaQuantidadePeixesLago = peixesCrescimento;

    // Update game state
    setGameState(prevState => ({
      ...prevState,
      quantidadePeixesLago: novaQuantidadePeixesLago,
      saldoCasa: saldoCasa,
      rodadas: [...prevState.rodadas, novaRodada],
      rodadaAtual: prevState.rodadaAtual + 1,
    }), true);

    // Reset players' state for next round
    jogadores.forEach(jogador => {
      const quantidadePescada = jogador.getState(PEIXES_PESCADOS) || 0;
      const saldoRecursos = (jogador.getState(SALDO_RECURSOS) || 0) + quantidadePescada;
      jogador.setState(SALDO_RECURSOS, saldoRecursos, true);
      jogador.setState(PEIXES_PESCADOS, null, true);
      jogador.setState(FISCALIZACAO, null, true);
    });

    // Check if game is over
    if (gameState.rodadaAtual > 10 || novaQuantidadePeixesLago <= 0) {
      // Game over
      setGameState(prevState => ({
        ...prevState,
        jogoFinalizado: true,
      }), true);
    }
  }

  const getTotalPeixesLago = useCallback(() => {
    return Math.floor(gameState.quantidadePeixesLago);
  }, [gameState.quantidadePeixesLago]);

  const meuSaldoRecursos = myPlayer()?.getState(SALDO_RECURSOS) || 0;

  return (
    <main>
      <div id="cabecalho">
        <h1>Apocalipse Pesqueiro</h1>
      </div>
      <div id="statusJogo">
        <div>Rodada Atual: {gameState.rodadaAtual}</div>
        <div>Total de Peixes no lago: {getTotalPeixesLago()}</div>
        <div>Limite Sustentável: {gameState.limiteSustentavel}</div>
        <div>Custo Fiscalização: {gameState.custoFiscalizacao}</div>
      </div>
      <Jogador
        key={myPlayer()?.id}
        nome={myPlayer()?.getProfile().name}
        quantidadeTotalPescada={peixesPescados}
        saldoRecursos={meuSaldoRecursos}
        onClick={handleJogadorClick}
      />
      <div>
        <label htmlFor="quantidadePescada">Quantidade de peixes pescados: </label>
        <input type="number" ref={quantidadePescadaRef} id="quantidadePescada" name="quantidadePescada" min="0" max="20" />
        <button onClick={handlePescar}>Confirmar Pesca</button>
      </div>
      {peixesPescados <= gameState.limiteSustentavel &&
        <div>
          <label htmlFor="fiscalizar">Escolha um jogador para fiscalizar: </label>
          <select ref={fiscalizarRef} id="fiscalizar" name="fiscalizar">
            <option value="">Nenhum</option>
            {jogadores.filter(j => j.id !== myPlayer()?.id).map(jogador => (
              <option key={jogador.id} value={jogador.getProfile().name}>{jogador.getProfile().name}</option>
            ))}
          </select>
          <button onClick={handleFiscalizar}>Fiscalizar</button>
        </div>
      }
      <div id="demaisJogadores">
        {jogadores.map(jogador => {
          if (jogador.id !== myPlayer()?.id) {
            return (
              <Jogador
                key={jogador.id}
                nome={jogador.getProfile().name}
                quantidadeTotalPescada={jogador.getState(PEIXES_PESCADOS) || 0}
                saldoRecursos={jogador.getState(SALDO_RECURSOS) || 0}
                onClick={handleJogadorClick}
              />
            );
          }
          return null;
        })}
      </div>
      {error ? <div className='error' onClick={() => setError(null)}>{error}</div> : null}
      <button onClick={handleFinalizarRodada}>Finalizar Rodada</button>
      {gameState.jogoFinalizado && <div>Jogo Finalizado!</div>}
    </main>
  );
}
