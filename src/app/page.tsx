
 "use client"

import { insertCoin, isHost, myPlayer, onPlayerJoin, PlayerState, RPC, useMultiplayerState, usePlayersList, usePlayersState } from 'playroomkit';
import { useCallback, useEffect, useRef, useState } from 'react';
import Jogador from './components/Jogador';

type Rodada = {
  numero: number;
  quantidadeLago: number;
  quantidadePescada: number;
}

type Jogada = {
  idJogador: string;
  //intencao da jogada
  quantidadePescada: number;
  jogadorAFiscalizar: string | null;
  //resultado da jogada
  quantidadeAcumulada: number;
  fiscalizadoPor: PlayerState[];
  roubou: boolean;
  multa: number;
  rateio: number;
  
}

type Jogador = {
  nome: string;
  quantidadeTotalPescada: number;
}

type GameState = {
  limiteSustentavel: number; 
  limitePossivelRodada: number;
  taxaCrescimento: number;
  custoFiscalizacao: number;
  quantidadeInicialPeixesJogador: number;
  quantidadePeixesLago: number;
  quantidadeBanca: number;
  rodadas: Rodada[];
}

const initialState: GameState = {
  limiteSustentavel: 11,
  limitePossivelRodada: 20,
  taxaCrescimento: 1.02,
  custoFiscalizacao: 2,
  quantidadeInicialPeixesJogador: 100,
  quantidadePeixesLago: 0,
  quantidadeBanca: 0,
  rodadas: []
}

const PEIXES_CESTO = 'PEIXES_CESTO';
const JOGADA_PENDENTE = 'JOGADA_PENDENTE';
const RESULTADO_JOGADA = 'RESULTADO_JOGADA';


export default function Home() {
  
  const quantidadePescadaRef = useRef<HTMLInputElement>(null);
  const [jogadorAFiscalizar, setJogadorAFiscalizar] = useState<string | null>(null);

  const [gameState, setGameState] = useMultiplayerState('gameState', initialState);
  const [peixesCesto, setPeixesCesto] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const jogadores = usePlayersList(true);
  const jogadasPendentes = usePlayersState(JOGADA_PENDENTE); 

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
      console.log(`Player ${caller.getProfile().name} pescou ${data.quantidadePescada} peixes!`);
      caller.setState(JOGADA_PENDENTE, data, true);
    });

  },[]);

  useEffect(() => {
    //processamento das jogadas pendentes quando todas jogadas foram realizadas
    if (isHost()){
      const jogadasNaoRealizadas = jogadasPendentes.filter((jogada) => jogada.state == null);
      if (jogadasNaoRealizadas.length == 0){
        console.log('todas jogadas realizadas');
        const rodadaAtual : Jogada[] = [];

        const somaPeixesPescados = jogadasPendentes.reduce((acumulador, jogada) => acumulador + jogada.state.quantidadePescada, 0);
        
        const jogadoresFiscalizados = jogadasPendentes.reduce((acc: Record<string, PlayerState[]>, jogada) => {
          const jogadorAFiscalizar = jogada.state.jogadorAFiscalizar;
         
          acc[jogadorAFiscalizar] = acc[jogadorAFiscalizar] || [];
          acc[jogadorAFiscalizar].push(jogada.player);
          
          return acc;
        }, {} as Record<string, PlayerState[]>);
       
        console.log(jogadoresFiscalizados)
        const limitePeixesPossiveis = (somaPeixesPescados > gameState.quantidadePeixesLago) ? 
                                        Math.floor(gameState.quantidadePeixesLago / jogadores.length) : 
                                        gameState.quantidadePeixesLago;
        
        let somaPeixesPescadosRealizada = 0;
        jogadasPendentes.forEach((jogadaPendente) => {
          
          const jogada: Jogada = {
            idJogador: jogadaPendente.player.id,
            quantidadePescada: jogadaPendente.state.quantidadePescada,
            jogadorAFiscalizar: jogadaPendente.state.jogadorAFiscalizar,
            quantidadeAcumulada: 0,
            fiscalizadoPor: [],
            roubou: false,
            multa: 0,
            rateio: 0
          }

          //recuper peixes no cesto do jogador
          const peixesCesto = jogadaPendente.player.getState(PEIXES_CESTO);

          //verifica se jogador pesca mais que o limite possivel ou quantidade existente no lago
          let peixesPescadosJogador = (jogadaPendente.state.quantidadePescada > limitePeixesPossiveis) ? limitePeixesPossiveis : jogadaPendente.state.quantidadePescada;

          //verifica se jogador fiscalizou alguem e desconta o custo da fiscalizacao
          peixesPescadosJogador -= jogadaPendente.state.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0;

          //verifica se jogador roubou e está sendo fiscalizado
          jogada.roubou = peixesPescadosJogador > gameState.limiteSustentavel;
          jogada.fiscalizadoPor = jogadoresFiscalizados[jogadaPendente.player.id];
          
          if (jogada.roubou && jogada.fiscalizadoPor?.length > 0){
            console.log('Jogador ' + jogadaPendente.player.getProfile().name + ' foi fiscalizado');
            jogada.multa = 0.1 * peixesPescadosJogador;
            jogada.rateio = 0.9 * peixesPescadosJogador / jogadoresFiscalizados[jogadaPendente.player.id].length;

            let resultadoJogadaJogador = jogadaPendente.player.getState(RESULTADO_JOGADA) || {};
            
            resultadoJogadaJogador.mensagem = 'Você foi fiscalizado por: ' + jogadoresFiscalizados[jogadaPendente.player.id].toString() + ' e perdeu os peixes dessa rodada!';
            resultadoJogadaJogador.fiscalizadores = jogadoresFiscalizados[jogadaPendente.player.id];

            jogadaPendente.player.setState(RESULTADO_JOGADA, resultadoJogadaJogador, true);

            //rateia peixes entre os jogadores que fiscalizaram
            jogadoresFiscalizados[jogadaPendente.player.id].forEach((fiscalizador) => {
              fiscalizador.setState(PEIXES_CESTO, fiscalizador.getState(PEIXES_CESTO) + jogada.rateio, true);
              //Verifica se fiscalizador ja possui um resultado de jogada
              let resultadoJogadaFiscalizador = fiscalizador.getState(RESULTADO_JOGADA) || {};
              resultadoJogadaFiscalizador.rateio = jogada.rateio;
              fiscalizador.setState(RESULTADO_JOGADA, resultadoJogadaFiscalizador, true);
            });

            //incrementa a banca com a multa
            gameState.quantidadeBanca += jogada.multa;
          } else { 
            
            //caso nao tenha sido fiscalizado atribui peixes ao jogador
            jogada.quantidadeAcumulada = peixesCesto + peixesPescadosJogador;
            jogadaPendente.player.setState(PEIXES_CESTO, jogada.quantidadeAcumulada , true);
            
            let resultadoJogadaJogador = jogadaPendente.player.getState(RESULTADO_JOGADA) || {};
            
            resultadoJogadaJogador.mensagem = 'Você acumulou ' + peixesPescadosJogador + ' peixes nessa rodada!';
            resultadoJogadaJogador.fiscalizadores = jogadoresFiscalizados[jogadaPendente.player.id];

            jogadaPendente.player.setState(RESULTADO_JOGADA, resultadoJogadaJogador, true);

            //1 - nao roubou e fiscalizou e nao achou nada
            //2 - nao roubou e fiscalizou e achou algo
            //3 - nao roubou e nao foi fiscalizou - v
            //4 - roubou e foi fiscalizado -- v
            //5 - roubou e nao foi fiscalizado - v
            
            //incrementa a banca com o custo da fiscalizacao
            gameState.quantidadeBanca += jogadaPendente.state.jogadorAFiscalizar ? gameState.custoFiscalizacao : 0;
          }
          jogadaPendente.player.setState(JOGADA_PENDENTE, null, true);
          somaPeixesPescadosRealizada += peixesPescadosJogador; 
          //inclui a jogada na rodada atual
          rodadaAtual.push(jogada);
        }); 
        
        //atualiza o game state com a rodada atual
        gameState.rodadas.push(rodadaAtual);
        setGameState(gameState, true);
  
      }
    }

  },[jogadasPendentes, jogadores, gameState]);
  
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
    const totalPescadoRodada = peixesCesto + quantidadePescada;
    
    //setPeixesCesto(totalPescadoRodada);
    //myPlayer()?.setState(PEIXES_CESTO, totalPescadoRodada, true);

    // Trigger the RPC on the host only
    RPC.call('jogadaRealizada', {quantidadePescada: quantidadePescada, jogadorAFiscalizar: jogadorAFiscalizar}, RPC.Mode.HOST);
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


  return (  
    <main>
        
        <div id="cabecalho">
          Apolicapse Pesqueiro: 
        </div>
        <Jogador key={myPlayer()?.id} id={myPlayer()?.id} nome={myPlayer()?.getProfile().name} quantidadeTotalPescada={myPlayer()?.getState(PEIXES_CESTO)}/>
        <div id="configJogo">
          <div>
            Total de Peixes no lago: {getTotalPeixesLago()}
          </div>
          <div>
            Quantidade da banca: {gameState.quantidadeBanca}
          </div>
          <div>
            Limite Sustentável: {gameState.limiteSustentavel}
          </div>
          <div>
            Limite máximo Possível: {gameState.limitePossivelRodada}
          </div>
          <div>
            Custo fiscalização: {gameState.custoFiscalizacao}
          </div>
        </div>
        <label htmlFor="quantidadePescada">Quantidade de peixes pescados: </label>
        <input type="number" ref={quantidadePescadaRef} id="quantidadePescada" name="quantidadePescada" min="0" max="100" />
        
        <div id="demaisJogadores">
          {jogadores.map(jogador => {
            return <Jogador key={jogador.id} id={jogador.id} nome={jogador.getProfile().name} selected={jogador.id===jogadorAFiscalizar} onClick={handleJogadorClick}/>
          })}   
        </div>
        {error ? <div className='absolute inset-0 bg-red-500' onClick={()=>setError(null)}>{error}</div> : null}
        
        <button onClick={handlePescar} > Pescar </button>
    </main>
  );
}


