
import { insertCoin, isHost, myPlayer, onPlayerJoin, PlayerProfile, PlayerState, RPC, useMultiplayerState, usePlayersList, usePlayersState } from 'playroomkit';
import { useCallback, useEffect, useRef, useState } from 'react';
import Jogador from './Jogador';
import Tabela from './Tabela';
import { Rodada } from '../types/Rodada';
import { Jogada } from '../types/Jogada';
import { GameConfig, GameState } from '../types/GameState';
import Cabecalho from './Cabecalho';
import ResultadosJogadas from './ResultadosJogadas';
import ResultadoFinal from './ResultadoFinal';
import Grafico from './Grafico';
import { JOGADA_PENDENTE, MENSAGEM_PENDENTE, PEIXES_CESTO, RESULTADO_JOGADA } from '../types/Constants';
import { distribuirPeixesProporcional } from '../service/Distribuicao';
import { setConfig } from 'next/config';
import { Config } from 'tailwindcss';
import Configuracoes from './Configuracoes';

type Jogador = {
  nome: string;
  quantidadeTotalPescada: number;
}

const initialState: GameState = {
  limiteSustentavel: 11,
  limitePossivelRodada: 20,
  limiteRodadas: 10,
  jogoFinalizado: false,
  taxaCrescimento: 0.02,
  custoFiscalizacao: 2,
  quantidadeInicialPeixesJogador: 100,
  quantidadePeixesLago: 0,
  quantidadeBanca: 0,
  conteudoChat: [],
  rodadas: []
}

export default function GameRoom() {

  const quantidadePescadaRef = useRef<HTMLInputElement>(null);
  const mensagemRef = useRef<HTMLInputElement>(null);
  const [jogadorAFiscalizar, setJogadorAFiscalizar] = useState<string | null>(null);
  const [quantidadePescada, setQuantidadePescada] = useState<number>(0);
  const [isAguardando, setIsAguardando] = useState(false);
  const [isGraficoVisible, setIsGraficoVisible] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isConfigVisible, setIsConfigVisible] = useState(false);
  const [isResultadoVisible, setIsResultadoVisible] = useState(true);

  const [gameState, setGameState] = useMultiplayerState('gameState', initialState);
  //const [peixesCesto, setPeixesCesto] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const jogadores = usePlayersList(true);
  const jogadasPendentes = usePlayersState(JOGADA_PENDENTE);
  //const mensagensPendentes = usePlayersState(MENSAGEM_PENDENTE);

  const mensagensPendentes = jogadores
    .filter((jogador) => jogador.getState(MENSAGEM_PENDENTE) != null)
    .map((jogador) => {
      return {
        player: jogador,
        mensagem: jogador.getState(MENSAGEM_PENDENTE)
      };
    });


  useEffect(() => {
    async function setGame() {
      await insertCoin({ matchmaking: true, skipLobby: true });

      onPlayerJoin((playerState: PlayerState) => {
        // PlayerState is this player's multiplayer state along with it's profile.
        // Probably add a player sprite to the game here.
        console.log(playerState.getProfile().name + ' joined the game');
        playerState.setState(PEIXES_CESTO, 0);
        /*console.log('novaQuantgameState.quantidadePeixesLago: ', gameState.quantidadePeixesLago);
        const novaQuantidadePeixes = gameState.quantidadePeixesLago + gameState.quantidadeInicialPeixesJogador;
        console.log('novaQuantidadePeixes: ', novaQuantidadePeixes);
        
        gameState.quantidadePeixesLago = novaQuantidadePeixes;
        setGameState(gameState, true);*/

        playerState.onQuit(() => {
          // Handle player quitting. Maybe remove player sprite?
          console.log(playerState.getProfile().name + ' left the game');
        });
      });
    }

    setGame();

  }, []);

  useEffect(() => {

    RPC.register('jogadaRealizada', async (data: any, caller: PlayerState) => {
      caller?.setState(RESULTADO_JOGADA, null, true);
      caller?.setState(JOGADA_PENDENTE, data, true);
    });

    RPC.register('mensagemEnviada', async (mensagem: any, caller: PlayerState) => {
      console.log('mensagemEnviada: ' + mensagem);
      gameState.conteudoChat.push(`${caller?.getProfile().name}: ${mensagem}`);
      setGameState(gameState, true);
      //caller?.setState(MENSAGEM_PENDENTE, `${caller?.getProfile().name}: ${mensagem}`, true);
    });

    return () => {
      RPC.register('mensagemEnviada', async (mensagem: any, caller: PlayerState) => {
        //não faça nada para "desregistrar" a função
      });
      RPC.register('jogadaRealizada', async (data: any, caller: PlayerState) => {
        //não faça nada para "desregistrar" a função
      });
    };
  }, []);


  useEffect(() => {
    //processamento das jogadas pendentes quando todas jogadas foram realizadas
    if (isHost()) {
      console.log('eu sou o host');
      const jogadasNaoRealizadas = jogadasPendentes.filter((jogada) => jogada.state == null);
      const novoGameState = { ...gameState };
      if (jogadasNaoRealizadas.length == 0) {
        console.log('todas jogadas realizadas');
        const rodadaAtual: Rodada = {
          numero: gameState.rodadas.length + 1,
          quantidadeLagoInicial: gameState.quantidadePeixesLago,
          jogadas: [],
          crescimentoLago: gameState.quantidadePeixesLago * gameState.taxaCrescimento
        }

        //calcula a quantidade total de peixes pescados por todos os jogadores
        //const somaPeixesPescados = jogadasPendentes.reduce((acumulador, jogada) => acumulador + jogada.state.quantidadePescada, 0);

        //recupera os jogadores que fiscalizaram cada jogador
        //agrupando por jogador fiscalizado
        //Exemplo: { 'idJogadorFiscalizado': [jogador1, jogador2], 'idJogadorFiscalizado2': [jogador3] }
        const jogadoresFiscalizados = jogadasPendentes.reduce((acc: Record<string, PlayerState[]>, jogada) => {
          const jogadorAFiscalizar = jogada.state.jogadorAFiscalizar;

          acc[jogadorAFiscalizar] = acc[jogadorAFiscalizar] || [];
          acc[jogadorAFiscalizar].push(jogada.player);

          return acc;
        }, {} as Record<string, PlayerState[]>);
        //console.log(`jogadoresFiscalizados`)
        //console.dir(jogadoresFiscalizados)

        //calcula o limite de peixes possiveis por jogador de acordo com a quantidade de peixes no lago
        //const limitePeixesPossiveis = (somaPeixesPescados > gameState.quantidadePeixesLago) ?
        //  Math.floor(gameState.quantidadePeixesLago / jogadores.length) :
        //  gameState.quantidadePeixesLago;
        //{ idJogador: jogada.player.id, quantidadePescada: jogada.state.quantidadePescada }
        const limitePeixesPossiveis = distribuirPeixesProporcional(jogadasPendentes.map((jogada) => {
          return { idJogador: jogada.player.id, quantidadePescada: jogada.state.quantidadePescada }
        }), rodadaAtual.quantidadeLagoInicial);


        console.log('limitePeixesPossiveis');
        console.dir(limitePeixesPossiveis);
        let somaPeixesNosCestos = 0;
        let somaBancaNaRodada = 0;
        jogadasPendentes.forEach((jogadaPendente) => {

          const jogada: Jogada = {
            idJogador: jogadaPendente.player.id,
            quantidadePescada: jogadaPendente.state.quantidadePescada,
            jogadorAFiscalizar: jogadaPendente.state.jogadorAFiscalizar,
            quantidadeAcumulada: 0,
            fiscalizadoPor: [],
            roubou: false,
            multa: 0,
            rateioGanhado: 0,
            rateioPerdido: 0
          }

          //recupera peixes no cesto do jogador
          const peixesCesto = jogadaPendente.player.getState(PEIXES_CESTO);

          //verifica se jogador pesca mais que o limite possivel ou quantidade existente no lago
          //let peixesPescadosJogador = (jogadaPendente.state.quantidadePescada > limitePeixesPossiveis) ? limitePeixesPossiveis : jogadaPendente.state.quantidadePescada;
          let peixesPescadosJogador = limitePeixesPossiveis[jogadaPendente.player.id];

          //verifica se jogador fiscalizou alguem e desconta o custo da fiscalizacao
          peixesPescadosJogador -= jogadaPendente.state.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0;

          //verifica se jogador roubou e está sendo fiscalizado
          jogada.roubou = peixesPescadosJogador > gameState.limiteSustentavel;
          jogada.fiscalizadoPor = jogadoresFiscalizados[jogadaPendente.player.id]?.map((fiscalizador: PlayerState) => {
            return fiscalizador.getProfile();
          })

          if (jogada.roubou && jogada.fiscalizadoPor?.length > 0) {
            console.log('Jogador ' + jogadaPendente.player.getProfile().name + ' foi fiscalizado');
            jogada.multa = 0.1 * peixesPescadosJogador;
            jogada.rateioPerdido = 0.9 * peixesPescadosJogador / jogadoresFiscalizados[jogadaPendente.player.id].length;

            let resultadoJogadaJogador = jogadaPendente.player.getState(RESULTADO_JOGADA) || {};

            //resultadoJogadaJogador.mensagem = 'Você foi fiscalizado e perdeu os peixes dessa rodada!';
            resultadoJogadaJogador.fiscalizadores = jogada.fiscalizadoPor;
            resultadoJogadaJogador.crescimentoLago = rodadaAtual.crescimentoLago;

            resultadoJogadaJogador.roubou = true;

            jogadaPendente.player.setState(RESULTADO_JOGADA, resultadoJogadaJogador, true);

            //rateia peixes entre os jogadores que fiscalizaram
            jogadoresFiscalizados[jogadaPendente.player.id].forEach((fiscalizador) => {
              //recupera peixes no cesto do fiscalizador e incrementa com o rateio perdido pelo fiscalizado
              const peixesCestoFiscalizador = fiscalizador.getState(PEIXES_CESTO);
              console.log('peixesCestoFiscalizador: ' + peixesCestoFiscalizador);
              console.log('rateioGanhado: ' + jogada.rateioPerdido);
              fiscalizador.setState(PEIXES_CESTO, peixesCestoFiscalizador + jogada.rateioPerdido, true);
              console.log('peixesCestoFiscalizador + rateio: ' + peixesCestoFiscalizador + jogada.rateioPerdido);

              //Verifica se fiscalizador ja possui um resultado de jogada
              let resultadoJogadaFiscalizador = fiscalizador.getState(RESULTADO_JOGADA) || {};
              resultadoJogadaFiscalizador.rateioGanhado = jogada.rateioPerdido;
              fiscalizador.setState(RESULTADO_JOGADA, resultadoJogadaFiscalizador, true);
              //inclui o rateio na soma total de peixes nos cestos de todos os jogadores
              somaPeixesNosCestos += jogada.rateioPerdido;
            });

            //incrementa a banca com a multa
            novoGameState.quantidadeBanca += jogada.multa;
            somaBancaNaRodada += jogada.multa;

          } else {

            //caso nao tenha sido fiscalizado atribui peixes ao jogador
            jogada.quantidadeAcumulada = peixesCesto + peixesPescadosJogador;
            jogadaPendente.player.setState(PEIXES_CESTO, jogada.quantidadeAcumulada, true);

            let resultadoJogadaJogador = jogadaPendente.player.getState(RESULTADO_JOGADA) || {};

            //resultadoJogadaJogador.mensagem = 'Você acumulou ' + peixesPescadosJogador + ' peixes nessa rodada!';
            resultadoJogadaJogador.fiscalizadores = jogada.fiscalizadoPor;
            resultadoJogadaJogador.peixesPescadosJogador = peixesPescadosJogador;

            //TODO: agrupar os valores referentes ao resultado da rodada que estao na jogada e colocar no resultado da rodada
            resultadoJogadaJogador.crescimentoLago = rodadaAtual.crescimentoLago;

            jogadaPendente.player.setState(RESULTADO_JOGADA, resultadoJogadaJogador, true);

            //incrementa a banca com o custo da fiscalizacao
            novoGameState.quantidadeBanca += jogadaPendente.state.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0;
            somaBancaNaRodada += jogadaPendente.state.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0;
            somaPeixesNosCestos += peixesPescadosJogador;
          }
          jogadaPendente.player.setState(JOGADA_PENDENTE, null, true);

          //inclui a jogada na rodada atual
          rodadaAtual.jogadas.push(jogada);
        });

        rodadaAtual.quantidadeNosCestos = somaPeixesNosCestos;
        rodadaAtual.quantidadeLagoFinal = gameState.quantidadePeixesLago
          - somaPeixesNosCestos
          - somaBancaNaRodada
          + rodadaAtual.crescimentoLago;

        rodadaAtual.saldoBanca = somaBancaNaRodada;

        novoGameState.quantidadePeixesLago = rodadaAtual.quantidadeLagoFinal;




        //atualiza o game state com a rodada atual
        novoGameState.rodadas.push(rodadaAtual);
        novoGameState.jogoFinalizado = (rodadaAtual.numero == gameState.limiteRodadas) || rodadaAtual.quantidadeLagoFinal < 1;
      }

      //processamento das mensagens pendentes
      /*console.log('mensagensPendentes:', mensagensPendentes.length);                      
      mensagensPendentes.forEach((mensagemPendente) => {
        novoGameState.conteudoChat += `${mensagemPendente.player.getProfile().name}: ${mensagemPendente.mensagem} \n`;
        mensagemPendente.player.setState(MENSAGEM_PENDENTE, null, true);
      });*/

      setGameState(novoGameState, true);
    }

  }, [gameState, jogadasPendentes, jogadores, mensagensPendentes, setGameState]);

  function handleJogadorClick(id: string) {
    console.log('jogadorAFiscalizar !== nome ' + jogadorAFiscalizar !== id);
    console.log('jogadorAFiscalizar ' + jogadorAFiscalizar);
    console.log('nome ' + id);


    if (jogadorAFiscalizar !== id) {
      setJogadorAFiscalizar(id);
      console.log('Jogador a ser fiscalizado: ' + id);
    } else {
      setJogadorAFiscalizar(null);
      console.log('nao fiscalizar');
    }
  }

  function handlePescar() {
    const quantidadePescada = Number(quantidadePescadaRef.current?.value);

    console.log('Pescar - quantidadePescada: ', quantidadePescada);
    if (quantidadePescada > gameState.limitePossivelRodada) {
      setError('Quantidade de peixes pescados maior que o limite possível por rodada');
      return;
    }
    if (quantidadePescada > gameState.limiteSustentavel && jogadorAFiscalizar != null) {
      setError('Jogador não pode pescar mais que o limite sustentável e fiscalizar outro jogador');
      return;
    }
    //const totalPescadoRodada = peixesCesto + quantidadePescada;

    //setPeixesCesto(totalPescadoRodada);
    //myPlayer()?.setState(PEIXES_CESTO, totalPescadoRodada, true);

    // Trigger the RPC on the host only
    RPC.call('jogadaRealizada', { quantidadePescada: quantidadePescada, jogadorAFiscalizar: jogadorAFiscalizar }, RPC.Mode.HOST);
    setIsAguardando(true);
  }

  useEffect(() => {

    setIsAguardando(false);

  }, [gameState.rodadas.length]);

  function handleEnviarMensagem() {
    const mensagem = mensagemRef.current?.value;
    //console.dir(mensagemRef.current?.value);
    RPC.call('mensagemEnviada', mensagem, RPC.Mode.HOST);
    //myPlayer().setState(MENSAGEM_PENDENTE, mensagem, true);
  }




  ///fiscalizar   
  // só pode fiscalizar se nao tiver roubado
  //reduz custo fiscalizacao
  //e caso tenha "roubado" soma a "banca" com sendo um jogador a mais aos que ficalizaram o jogador e divide os peixes  


  /*const getTotalPeixesLago = useCallback(() => {
    let totalPeixesPescados = 0;
    
    jogadores.forEach(jogador => {
      const peixesCesto = jogador.getState(PEIXES_CESTO);
      totalPeixesPescados += peixesCesto;
    });
    const totalPeixesLago = (jogadores.length * gameState.quantidadeInicialPeixesJogador) - totalPeixesPescados - gameState.quantidadeBanca;
    gameState.quantidadePeixesLago = totalPeixesLago;
    return totalPeixesLago;
  },[gameState, jogadores]);*/

  const handleReiniciarClick = () => {
    setIsAguardando(true);
    if (isHost()) {
      reiniciarJogo();
    }
  }

  const reiniciarJogo = () => {
    //reset peixes do lago de acordo com quantidade de jogadores
    if (isHost()) {
      //reset Peixes Cesto
      jogadores.forEach(jogador => {
        jogador.setState(PEIXES_CESTO, 0, true);
        jogador.setState(RESULTADO_JOGADA, null, true);
      });
      const gameStateInicial = initialState;
      gameStateInicial.quantidadePeixesLago = jogadores.length * gameStateInicial.quantidadeInicialPeixesJogador;
      setGameState(gameStateInicial, true);
    }
  }

  useEffect(() => {
    if (isHost()) {
      const novoGameState = {
        ...gameState,
        quantidadePeixesLago: jogadores.length * gameState.quantidadeInicialPeixesJogador
      }
      setGameState(novoGameState, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jogadores.length, gameState.quantidadeInicialPeixesJogador]);


  //transforma o conteudo do chat em string
  const getConteudoChat = useCallback(() => {
    let chat = '';
    //console.log('gameState.conteudoChat: ', gameState.conteudoChat.length);
    gameState.conteudoChat.forEach((mensagem) => {
      chat += mensagem + '\n';
    });
    return chat;
  }, [gameState.conteudoChat]);

  const handleEditarParametros = (value: Partial<GameState>) => {
    if (isHost()) {
      const novoGameState = {
        ...gameState,
        ...value
      }
      setGameState(novoGameState, true);
    }
  }

  function handleChatClick(): void {
    setIsChatVisible(!isChatVisible);
  }

  function handleGraficoClick(): void {
    setIsGraficoVisible(!isGraficoVisible);
  }

  function handleConfigClick(): void {
    setIsConfigVisible(!isConfigVisible);
  }

  function handleResultadoClick(): void {
    setIsResultadoVisible(!isResultadoVisible);
  }

  return myPlayer()?.id ? (
    <main className="bg-cyan-700 min-h-screen w-full p-4 flex flex-col items-center justify-start">

      <div id="cabecalho" className="text-center mb-4 text-2xl font-bold w-full">
        Apolicapse Pesqueiro
        {isHost() ? (
          <button
            onClick={handleReiniciarClick}
            className="bg-cyan-800 text-white rounded-full p-2 hover:bg-cyan-900 transition-colors"
            title="Reiniciar Jogo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        ) : null}
      </div>

      <Cabecalho gameState={gameState} jogador={myPlayer()} ></Cabecalho>
      <div className="w-full mb-4 flex justify-center space-x-2">
        <button
          onClick={handleResultadoClick}
          className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
          hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50
          bg-cyan-800 text-white"
        >
          Resultado das Jogadas
        </button>
        <button
          onClick={handleGraficoClick}
          className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 
          hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50
          bg-cyan-800 text-white"
        >
          Gráfico
        </button>
        <button
          onClick={handleChatClick}
          className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
          hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50
          bg-cyan-800 text-white"
        >
          Chat
        </button>
        <button
          onClick={handleConfigClick}
          className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
          hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50
          bg-cyan-800 text-white"
        >
          <span className="inline-block align-middle">⚙️</span> Configurações
        </button>

      </div>

      {isConfigVisible &&
        (<Configuracoes isEditable={isHost() && gameState.rodadas.length === 0} isConfigVisible={isConfigVisible} onChange={handleEditarParametros} jogador={myPlayer()} gameState={gameState} />)
      }
      <ResultadosJogadas visible={isResultadoVisible}
        resultadoJogada={myPlayer()?.getState(RESULTADO_JOGADA)}
      ></ResultadosJogadas>

      {isGraficoVisible && (<div className="w-full mb-4" >
        <h2 className="text-lg font-semibold mb-2">Quantidade de Peixes</h2>
        <Grafico gameState={gameState} quantidadeJogadores={jogadores.length} />
      </div>)
      }

      <div className="w-full mb-4">
        <label htmlFor="quantidadePescada" className="block mb-1">
          Quantidade de peixes pescados:
        </label>
        <input
          className="w-full"
          type="range"
          ref={quantidadePescadaRef}
          id="quantidadePescada"
          name="quantidadePescada"
          min="0"
          max={gameState.limitePossivelRodada}
          value={quantidadePescada}
          onChange={() => setQuantidadePescada(Number(quantidadePescadaRef.current?.value))}
        />
        <span className="ml-2">{quantidadePescada}</span>
      </div>

      <div className="w-full mb-4">
        <h2 className="text-lg font-semibold mb-2">Seleção de Jogador a Fiscalizar:</h2>
        <div id="demaisJogadores" className="flex flex-wrap gap-2">
          {jogadores.filter(j => j.id !== myPlayer()?.id).map(j => (
            <Jogador
              key={j.id}
              id={j.id}
              photo={j.getProfile().photo}
              nome={j.getProfile().name}
              selected={j.id === jogadorAFiscalizar}
              onClick={handleJogadorClick}
            />
          ))}
        </div>
      </div>

      {
        error ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
              <button
                onClick={() => setError(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Erro</h3>
              </div>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        ) : null
      }

      <button
        onClick={handlePescar}
        className={(isAguardando ? `bg-cyan-600 text-gray` : `bg-cyan-800 text-white`) + " rounded-md border-2 px-4 py-2 mb-4 w-full"}
        disabled={isAguardando}
      >
        {isAguardando ? "Aguardando demais jogadores..." : "Jogar"}
      </button>

      {isChatVisible && (
        <>
          <textarea
            readOnly
            value={getConteudoChat()}
            className="bg-cyan-700 rounded-md border-2 w-full h-32 resize-none mb-4"
          ></textarea>

          <div className="w-full mb-4">
            <label htmlFor="mensagem" className="block mb-1">Mensagem:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                ref={mensagemRef}
                id="mensagem"
                name="mensagem"
                className="flex-1 p-2 border rounded-md"
              />
              <button
                onClick={handleEnviarMensagem}
                className="bg-cyan-800 text-white rounded-md border-2 px-4 py-2"
              >
                Enviar
              </button>
            </div>
          </div>
        </>)}

      {/*  <Tabela rodadas={gameState.rodadas} /> */}

      {
        gameState.jogoFinalizado ? (
          <ResultadoFinal jogadores={jogadores} onClick={handleReiniciarClick} isAguardando={isAguardando}></ResultadoFinal>
        ) : null
      }
    </main >
  ) : (
    <div className="min-h-screen bg-cyan-700 flex items-center justify-center">
      <div className="text-white text-2xl animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        Carregando...
      </div>
    </div>)

}


