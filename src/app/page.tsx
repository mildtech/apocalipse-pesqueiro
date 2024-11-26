
 "use client"

import { insertCoin, isHost, myPlayer, onPlayerJoin, PlayerProfile, PlayerState, RPC, useMultiplayerState, usePlayersList, usePlayersState } from 'playroomkit';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import Jogador from './components/Jogador';
import Tabela from './components/Tabela';
import { Rodada } from './types/Rodada';
import { Jogada } from './types/Jogada';
import { GameState } from './types/GameState';
import Cabecalho from './components/Cabecalho';
import ResultadosJogadas from './components/ResultadosJogadas';
import ResultadoFinal from './components/ResultadoFinal';
import Grafico from './components/Grafico';


type Jogador = {
  nome: string;
  quantidadeTotalPescada: number;
}



const initialState: GameState = {
  limiteSustentavel: 11,
  limitePossivelRodada: 20,
  limiteRodadas: 10,
  jogoFinalizado: false,
  taxaCrescimento: 1.02,
  custoFiscalizacao: 2,
  quantidadeInicialPeixesJogador: 100,
  quantidadePeixesLago: 0,
  quantidadeBanca: 0,
  conteudoChat: '',
  rodadas: []
}

export const PEIXES_CESTO = 'PEIXES_CESTO';
export const JOGADA_PENDENTE = 'JOGADA_PENDENTE';
export const MENSAGEM_PENDENTE = 'MENSAGEM_PENDENTE';
export const RESULTADO_JOGADA = 'RESULTADO_JOGADA';


export default function Home() {
  
  const quantidadePescadaRef = useRef<HTMLInputElement>(null);
  const mensagemRef = useRef<HTMLInputElement>(null);
  const [jogadorAFiscalizar, setJogadorAFiscalizar] = useState<string | null>(null);

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
        await insertCoin({matchmaking: true, skipLobby: true});  

        onPlayerJoin((playerState:PlayerState) => {
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

  },[]);

  useEffect(() => {
    RPC.register('jogadaRealizada', async (data: any, caller: PlayerState) => {
      caller?.setState(JOGADA_PENDENTE, data, true);
    });

    RPC.register('mensagemEnviada', async (mensagem: any, caller: PlayerState) => {
      console.log('mensagemEnviada: ' + mensagem);
      caller?.setState(MENSAGEM_PENDENTE, mensagem, true);
    });

  },[]);
  

  useEffect(() => {
    //processamento das jogadas pendentes quando todas jogadas foram realizadas
    if (isHost()){
      console.log('eu sou o host'); 
      const jogadasNaoRealizadas = jogadasPendentes.filter((jogada) => jogada.state == null);
      const novoGameState = {...gameState};
      if (jogadasNaoRealizadas.length == 0){
        console.log('todas jogadas realizadas');
        const rodadaAtual: Rodada = {
          numero: gameState.rodadas.length + 1,
          quantidadeLagoInicial: gameState.quantidadePeixesLago,
          jogadas: []
        }

        //calcula a quantidade total de peixes pescados por todos os jogadores
        const somaPeixesPescados = jogadasPendentes.reduce((acumulador, jogada) => acumulador + jogada.state.quantidadePescada, 0);
        
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
        const limitePeixesPossiveis = (somaPeixesPescados > gameState.quantidadePeixesLago) ? 
                                        Math.floor(gameState.quantidadePeixesLago / jogadores.length) : 
                                        gameState.quantidadePeixesLago;
        
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
          let peixesPescadosJogador = (jogadaPendente.state.quantidadePescada > limitePeixesPossiveis) ? limitePeixesPossiveis : jogadaPendente.state.quantidadePescada;

          //verifica se jogador fiscalizou alguem e desconta o custo da fiscalizacao
          peixesPescadosJogador -= jogadaPendente.state.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0;

          //verifica se jogador roubou e está sendo fiscalizado
          jogada.roubou = peixesPescadosJogador > gameState.limiteSustentavel;
          jogada.fiscalizadoPor = jogadoresFiscalizados[jogadaPendente.player.id]?.map((fiscalizador: PlayerState) => { 
            return fiscalizador.getProfile(); 
          })
          
          if (jogada.roubou && jogada.fiscalizadoPor?.length > 0){
            console.log('Jogador ' + jogadaPendente.player.getProfile().name + ' foi fiscalizado');
            jogada.multa = 0.1 * peixesPescadosJogador;
            jogada.rateioPerdido = 0.9 * peixesPescadosJogador / jogadoresFiscalizados[jogadaPendente.player.id].length;

            let resultadoJogadaJogador = jogadaPendente.player.getState(RESULTADO_JOGADA) || {};
            
            //resultadoJogadaJogador.mensagem = 'Você foi fiscalizado e perdeu os peixes dessa rodada!';
            resultadoJogadaJogador.fiscalizadores = jogada.fiscalizadoPor;
            resultadoJogadaJogador.roubou = true;
            
            jogadaPendente.player.setState(RESULTADO_JOGADA, resultadoJogadaJogador, true);

            //rateia peixes entre os jogadores que fiscalizaram
            jogadoresFiscalizados[jogadaPendente.player.id].forEach((fiscalizador) => {
              fiscalizador.setState(PEIXES_CESTO, fiscalizador.getState(PEIXES_CESTO) + jogada.rateioGanhado, true);
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
            jogadaPendente.player.setState(PEIXES_CESTO, jogada.quantidadeAcumulada , true);
            
            let resultadoJogadaJogador = jogadaPendente.player.getState(RESULTADO_JOGADA) || {};
            
            //resultadoJogadaJogador.mensagem = 'Você acumulou ' + peixesPescadosJogador + ' peixes nessa rodada!';
            resultadoJogadaJogador.fiscalizadores = jogada.fiscalizadoPor;
            resultadoJogadaJogador.peixesPescadosJogador  = peixesPescadosJogador;

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
        rodadaAtual.quantidadeLagoFinal = gameState.quantidadePeixesLago - somaPeixesNosCestos - somaBancaNaRodada;
        rodadaAtual.saldoBanca = somaBancaNaRodada;

        novoGameState.quantidadePeixesLago = rodadaAtual.quantidadeLagoFinal;
        //atualiza o game state com a rodada atual
        novoGameState.rodadas.push(rodadaAtual);
        novoGameState.jogoFinalizado = (gameState.rodadas.length == gameState.limiteRodadas) || gameState.quantidadePeixesLago == 0;
      }

      //processamento das mensagens pendentes
      console.log('mensagensPendentes:', mensagensPendentes.length);                      
      mensagensPendentes.forEach((mensagemPendente) => {
        novoGameState.conteudoChat += `${mensagemPendente.player.getProfile().name}: ${mensagemPendente.mensagem} \n`;
        mensagemPendente.player.setState(MENSAGEM_PENDENTE, null, true);
      });
      
      setGameState(novoGameState, true);
    }

  },[gameState, jogadasPendentes, jogadores, mensagensPendentes]);
  
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
    //const totalPescadoRodada = peixesCesto + quantidadePescada;
    
    //setPeixesCesto(totalPescadoRodada);
    //myPlayer()?.setState(PEIXES_CESTO, totalPescadoRodada, true);

    // Trigger the RPC on the host only
    RPC.call('jogadaRealizada', {quantidadePescada: quantidadePescada, jogadorAFiscalizar: jogadorAFiscalizar}, RPC.Mode.HOST);
  }

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


  const getTotalPeixesLago = useCallback(() => {
    let totalPeixesPescados = 0;
    
    jogadores.forEach(jogador => {
      const peixesCesto = jogador.getState(PEIXES_CESTO);
      totalPeixesPescados += peixesCesto;
    });
    const totalPeixesLago = (jogadores.length * gameState.quantidadeInicialPeixesJogador) - totalPeixesPescados - gameState.quantidadeBanca;
    gameState.quantidadePeixesLago = totalPeixesLago;
    return totalPeixesLago;
  },[gameState, jogadores]);

  const handleResultadoClick = () => {
    //reset peixes do lago de acordo com quantidade de jogadores
    if (isHost()){
      const gameStateInicial = initialState;
      gameStateInicial.quantidadePeixesLago = jogadores.length * gameStateInicial.quantidadeInicialPeixesJogador;
      setGameState(gameStateInicial, true);
    }
  }

  return (  
    <main className='bg-cyan-700'>
        
        <div id="cabecalho">
          Apolicapse Pesqueiro: {getTotalPeixesLago()}
        </div>
        
        <Cabecalho gameState={gameState} jogador={myPlayer()}></Cabecalho> 
        <ResultadosJogadas resultadoJogada={myPlayer()?.getState(RESULTADO_JOGADA)}></ResultadosJogadas>
        
        <div>
          <h2>Gráfico do Lago</h2>
          <Grafico rodadas={gameState.rodadas} />
        </div>

        <label htmlFor="quantidadePescada">Quantidade de peixes pescados: </label>
        <input type="number" ref={quantidadePescadaRef} id="quantidadePescada" name="quantidadePescada" min="0" max="100" />
        
        <div id="demaisJogadores">
          {jogadores.map(jogador => {
            return <Jogador key={jogador.id} id={jogador.id} nome={jogador.getProfile().name} selected={jogador.id===jogadorAFiscalizar} onClick={handleJogadorClick}/>
          })}   
        </div>
        {error ? <div className='absolute inset-0 bg-red-500' onClick={()=>setError(null)}>{error}</div> : null}
        
        <button onClick={handlePescar} className='bg-cyan-700 rounded-md border-2'> Jogar </button>
        <Tabela rodadas={gameState.rodadas}></Tabela>

        {/* Conteudo total  do Chat */}
        <textarea readOnly value={gameState.conteudoChat} className='bg-cyan-700 rounded-md border-2' cols={200} rows={5}></textarea>
        
        {/* Nova mensagem  do Chat */}
        <label htmlFor="mensagem">Mensagem: </label>
        <input type="text" ref={mensagemRef} id="mensagem" name="mensagem" />
        
        
        <button onClick={handleEnviarMensagem} className='bg-cyan-700 rounded-md border-2'> Enviar </button>

        {gameState.jogoFinalizado ? 
          <ResultadoFinal jogadores={jogadores} onClick={handleResultadoClick}></ResultadoFinal>
        : null}
    </main>
  );
}


