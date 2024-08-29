
 "use client"

import { use, useCallback, useEffect, useRef, useState } from 'react';
import Jogador from './components/Jogador';
import Tabela from './components/Tabela';
import { insertCoin, RPC, myPlayer, onPlayerJoin, useMultiplayerState, usePlayersList, PlayerState } from 'playroomkit';
import { get } from 'http';

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

const PEIXES_CESTO = 'peixesCesto';


export default function Home() {
  
  const quantidadePescadaRef = useRef<HTMLInputElement>(null);
  const [jogadorAFiscalizar, setJogadorAFiscalizar] = useState<string | null>(null);

  const [gameState, setGameState] = useMultiplayerState('gameState', initialState);
  const [peixesCesto, setPeixesCesto] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const jogadores = usePlayersList(true);

  useEffect(() => {
    async function setGame() {
        await insertCoin({matchmaking: true});  

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
  
  function handleJogadorClick(nome: string) {
    console.log('jogadorAFiscalizar !== nome ' + jogadorAFiscalizar !== nome);
    console.log('jogadorAFiscalizar ' + jogadorAFiscalizar);
    console.log('nome ' + nome);
    

    if (jogadorAFiscalizar !== nome) {
     setJogadorAFiscalizar(nome);
     console.log('Jogador a ser fiscalizado: ' + nome);
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

  RPC.register('jogadaRealizada', async (data: any, caller: PlayerState) => {
    console.log(`Player ${caller.getProfile().name} pescou ${data.quantidadePescada} peixes!`);
    //players[data.victimId].setState("dead", true);
  });
  

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
        <Jogador key={myPlayer()?.id} nome={myPlayer()?.getProfile().name} quantidadeTotalPescada={peixesCesto} onClick={handleJogadorClick}/>
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
            return <Jogador key={jogador.id} nome={jogador.getProfile().name} selected={jogador.getProfile().name===jogadorAFiscalizar} onClick={handleJogadorClick}/>
          })}   
        </div>
        {error ? <div className='absolute inset-0 bg-red-500' onClick={()=>setError(null)}>{error}</div> : null}
        
        <button onClick={handlePescar} > Pescar </button>
    </main>
  );
}


