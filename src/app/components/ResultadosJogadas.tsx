import React from 'react'
import { GameState } from '../types/GameState';
import Jogador from './Jogador';
import { PlayerProfile, PlayerState } from 'playroomkit';
import { PEIXES_CESTO, RESULTADO_JOGADA } from '../page';

type ResultadosJogadasProps = {
    gameState: GameState;
    jogador: PlayerState;
    resultadoJogada: any;
};  

const textoInicial = "Aqui serão exibidos os resultados das jogadas dos jogadores. Cada jogador terá um texto com o resultado da sua jogada, os fiscalizadores e o rateio. O texto será atualizado a cada rodada.";
export default function ResultadosJogadas(resultadosJogadasProps: ResultadosJogadasProps) {
        //const resultadoJogada = resultadosJogadasProps.jogador?.getState(RESULTADO_JOGADA);
        console.log(resultadosJogadasProps?.resultadoJogada)
        const conteudo = resultadosJogadasProps?.resultadoJogada?.mensagem ? 
                            resultadosJogadasProps?.resultadoJogada?.mensagem
                        :   textoInicial
        return (
                <div>
                    <textarea readOnly={true} cols={200} rows={5} value={conteudo}></textarea>
                </div>
        )
        
    
}
/* 
{resultadoJogada.mensagem}
                {resultadoJogada.fiscalizadores ? 
                    <p>Fiscalizadores:  
                        {resultadoJogada.fiscalizadores.map((fiscalizador: PlayerProfile) => { 
                        return fiscalizador.name; 
                        }).join(', ')}
                    </p> 
                    : 
                    textoInicial
                }
                {resultadoJogada.rateio ? Rateio: {resultadoJogada.rateio}</p> : null} */
