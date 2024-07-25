
 "use client"

import { useState } from 'react';
import Jogador from './components/Jogador';
import Tabela from './components/Tabela';

export default function Home() {
  const [count, setCount] = useState(0);
  
  const [jogador, setJogador] = useState({
    nome: 'Rodrigo', 
    idade: 10
  });

  const [jogadores, setJogadores] = useState([{
    id: 1,
    nome: 'Rodrigo', 
    idade: 40
  },
  {
    id: 2,
    nome: 'João', 
    idade: 20
  },
  {
    id: 3,
    nome: 'Pedro', 
    idade: 30
  },
  {
    id: 4,
    nome: 'Marcelo', 
    idade: 35
  }]);


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
          return <Jogador key={jogador.id} nome={jogador.nome} idade={jogador.idade}/>
        })}   
    </main>
  );
}


