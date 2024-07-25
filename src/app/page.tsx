
 "use client"

import { use, useEffect, useState } from 'react';
import Jogador from './components/Jogador';
import Tabela from './components/Tabela';
import { insertCoin, onPlayerJoin, usePlayersList } from 'playroomkit';

export default function Home() {
  const [count, setCount] = useState(0);
  
  const [jogador, setJogador] = useState({
    nome: 'Rodrigo', 
    idade: 10
  });

  const jogadores = usePlayersList();

  useEffect(() => {
    async function setGame() {
        await insertCoin();  

        onPlayerJoin(playerState => {
          // PlayerState is this player's multiplayer state along with it's profile.
          // Probably add a player sprite to the game here.
          console.log(playerState.getProfile().name + ' joined the game'); 
          playerState.onQuit(() => {
            // Handle player quitting. Maybe remove player sprite?
            console.log(playerState.getProfile().name + ' left the game'); 
          });
        });
    }
    
    setGame();

  },[]);


  function handleIncrementaClick() {
    //setCount(10);
    
    setCount(countAtual => 
      countAtual + 1
    );

    setCount(countAtual => 
      countAtual + 1
    );

    setJogador({nome: 'Pedro', idade: 20});
    trocaNomeJogador('João');
  }

  
  function trocaNomeJogador(novoNome: string) {
    
    setJogador(jogadorAtual => {
      return {...jogadorAtual, nome: novoNome}
    });
  }

  /*function soma(num1:number, num2: number) { 
    return num1 + num2;
  }

  const calculoTrimestral = 0
  const calculoProximoMes = 1
  const valor3 = 50;

  const restultado = soma(calculoTrimestral, calculoProximoMes);*/

  

  return (  
    <main>
        
        Apolicapse Pesqueiro: 
        <br/>
        contador: {count} --- nome: {jogador.nome} ---- idade: {jogador.idade}
        <br/>
        <button onClick={handleIncrementaClick}> incrementa </button>
        <br>
        </br>
        {jogadores.map(jogador => {
          return <Jogador key={jogador.id} nome={jogador.getProfile().name} idade={0}/>
        })}   
    </main>
  );
}


