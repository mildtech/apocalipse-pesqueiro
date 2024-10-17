
 "use client"

import { insertCoin, isHost, myPlayer, onPlayerJoin, PlayerState, RPC, useMultiplayerState, usePlayersList, usePlayersState } from 'playroomkit';
import { useCallback, useEffect, useRef, useState } from 'react';
import Jogador from './components/Jogador';

type Rodada = {
  numero: number;
  quantidadeLago: number;
  quantidadePescada: number;
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
const FOI_FISCALIZADO = 'FOI_FISCALIZADO';


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
    if (isHost()){
      const jogadasNaoRealizadas = jogadasPendentes.filter((jogada) => jogada.state == null);
      if (jogadasNaoRealizadas.length == 0){
        console.log('todas jogadas realizadas');
        const somaPeixesPescados = jogadasPendentes.reduce((acumulador, jogada) => acumulador + jogada.state.quantidadePescada, 0);
        
        const jogadoresFiscalizados = jogadasPendentes.reduce((acc: Record<string, number>, jogada) => {
          const jogadorAFiscalizar = jogada.state.jogadorAFiscalizar;
          acc[jogadorAFiscalizar] = (acc[jogadorAFiscalizar] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        
        console.log(jogadoresFiscalizados)
        const limitePeixesPossiveis = (somaPeixesPescados > gameState.quantidadePeixesLago) ? 
                                        Math.floor(gameState.quantidadePeixesLago / jogadores.length) : 
                                        gameState.quantidadePeixesLago;
        
        let somaPeixesPescadosRealizada = 0;
        jogadasPendentes.forEach((jogada) => {
          const peixesCesto = jogada.player.getState(PEIXES_CESTO);
          const peixesPescadosJogador = (jogada.state.quantidadePescada > limitePeixesPossiveis) ? limitePeixesPossiveis : jogada.state.quantidadePescada;
          if (peixesPescadosJogador > gameState.limiteSustentavel && jogadoresFiscalizados[jogada.player.id] > 0){
            console.log('Jogador ' + jogada.player.getProfile().name + ' foi fiscalizado');
            const multa = 0.1 * peixesPescadosJogador;
            const rateio = 0.9 * peixesPescadosJogador / jogadoresFiscalizados[jogada.player.id];
            jogada.player.setState(FOI_FISCALIZADO, true);

          }
          jogada.player.setState(PEIXES_CESTO, peixesCesto + peixesPescadosJogador, true);
          jogada.player.setState(JOGADA_PENDENTE, null, true);
          somaPeixesPescadosRealizada += peixesPescadosJogador; 
        });                              
  
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
    const totalPeixesLago = (jogadores.length * gameState.quantidadeInicialPeixesJogador) - totalPeixesPescados;
    gameState.quantidadePeixesLago = totalPeixesLago;
    
    return totalPeixesLago;
  },[gameState, jogadores]);

  return (  
    <main>
        
        <div id="cabecalho">
          Apolicapse Pesqueiro: 
        </div>
        <Jogador key={myPlayer()?.id} id={myPlayer()?.id} nome={myPlayer()?.getProfile().name} quantidadeTotalPescada={peixesCesto}/>
        <div id="configJogo">
          <div>
            Total de Peixes no lago: {getTotalPeixesLago()}
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


