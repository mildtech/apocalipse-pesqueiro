
 "use client"

import { use, useEffect, useRef, useState } from 'react';
import Jogador from './components/Jogador';
import Tabela from './components/Tabela';
import { insertCoin, onPlayerJoin, useMultiplayerState, usePlayersList } from 'playroomkit';

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
  taxaCrescimento: number;
  custoFiscalizacao: number;
  quantidadeInicialPeixesJogador: number;
  quantidadePeixesLago: number;
  rodadas: Rodada[];
}

const initialState: GameState = {
  limiteSustentavel: 11,
  taxaCrescimento: 1.02,
  custoFiscalizacao: 2,
  quantidadeInicialPeixesJogador: 100,
  quantidadePeixesLago: 0,
  rodadas: []
}


export default function Home() {
  
  const quantidadePescada = useRef<HTMLInputElement>(null);

  const [gameState, setGameState] = useMultiplayerState('gameState', initialState);

  const jogadores = usePlayersList();

  useEffect(() => {
    async function setGame() {
        await insertCoin({matchmaking: true});  

        onPlayerJoin(playerState => {
          // PlayerState is this player's multiplayer state along with it's profile.
          // Probably add a player sprite to the game here.
          console.log(playerState.getProfile().name + ' joined the game'); 
          playerState.setState("totalPeixesPescados", 0);
          console.log('novaQuantgameState.quantidadePeixesLago: ', gameState.quantidadePeixesLago);
          const novaQuantidadePeixes = gameState.quantidadePeixesLago + gameState.quantidadeInicialPeixesJogador;
          console.log('novaQuantidadePeixes: ', novaQuantidadePeixes);
          
          gameState.quantidadePeixesLago = novaQuantidadePeixes;
          setGameState(gameState, true);

          playerState.onQuit(() => {
            // Handle player quitting. Maybe remove player sprite?
            console.log(playerState.getProfile().name + ' left the game'); 
          });
        });
    }
    
    setGame();

  },[]);
  
  function handleJogadorClick(nome: string) {
    console.log('Jogador a ser fiscalizado: ' + nome);
  }

  function handlePescar() {
    console.log('Pescar - quantidadePescada: ', quantidadePescada.current?.value);
  }

  return (  
    <main>
        
        <div id="cabecalho">
          Apolicapse Pesqueiro: 
        </div>
        <div id="configJogo">
          <div>
            Total de Peixes no lago: {gameState.quantidadePeixesLago}
          </div>
          <div>
            Limite Sustentável: {gameState.limiteSustentavel}
          </div>
          <div>
            Custo fiscalização: {gameState.custoFiscalizacao}
          </div>
        </div>
        <label htmlFor="quantidadePescada">Quantidade de peixes pescados: </label>
        <input type="number" ref={quantidadePescada} id="quantidadePescada" name="quantidadePescada" min="0" max="100" />
        
        <div id="demaisJogadores">
          {jogadores.map(jogador => {
            return <Jogador key={jogador.id} nome={jogador.getProfile().name} onClick={handleJogadorClick}/>
          })}   
        </div>

        <button onClick={handlePescar} > Pescar </button>
    </main>
  );
}


