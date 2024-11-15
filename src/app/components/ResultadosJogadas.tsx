import React from 'react'
import { GameState } from '../types/GameState';
import Jogador from './Jogador';
import { PlayerProfile, PlayerState } from 'playroomkit';
import { PEIXES_CESTO, RESULTADO_JOGADA } from '../page';

type ResultadosJogadasProps = {
    resultadoJogada: any;
};  
 //1 - nao roubou e fiscalizou e nao achou nada
            //2 - nao roubou e fiscalizou e achou algo
            //3 - nao roubou e nao foi fiscalizou - v
            //4 - roubou e foi fiscalizado -- v
            //5 - roubou e nao foi fiscalizado - v
            

const textoInicial = "Aqui serão exibidos os resultados das jogadas dos jogadores. Cada jogador terá um texto com o resultado da sua jogada, os fiscalizadores e o rateio. O texto será atualizado a cada rodada.";
export default function ResultadosJogadas(resultadosJogadasProps: ResultadosJogadasProps) {
        //const resultadoJogada = resultadosJogadasProps.jogador?.getState(RESULTADO_JOGADA);
        console.log(resultadosJogadasProps?.resultadoJogada)
//resultadoJogadaJogador.fiscalizadores = jogada.fiscalizadoPor;
          //  resultadoJogadaJogador.peixesPescadosJogador

        let mensagem = ""
        if(resultadosJogadasProps?.resultadoJogada?.roubou && resultadosJogadasProps?.resultadoJogada?.fiscalizadores?.length > 0) {
            mensagem = "Você pescou acima do limite e perdeu os peixes desta rodada!"
        } else {
            const totalPeixesAcumulados = resultadosJogadasProps?.resultadoJogada?.peixesPescadosJogador + resultadosJogadasProps?.resultadoJogada?.rateioGanhado;
            mensagem = "Você acumulou " + totalPeixesAcumulados + " peixes nessa rodada!"
        }
        
        if(resultadosJogadasProps?.resultadoJogada?.fiscalizadores?.length > 0) {
            mensagem += "\n\nVocê foi fiscalizado por: " + resultadosJogadasProps?.resultadoJogada?.fiscalizadores.map((fiscalizador: PlayerProfile) => { 
                return fiscalizador.name; 
            }).join(', ')
        }

        
        
        const conteudo = (resultadosJogadasProps?.resultadoJogada) ? mensagem : textoInicial
        return (
                <div>
                    <textarea  className='bg-cyan-700 rounded-md border-2' readOnly={true} cols={200} rows={5} value={conteudo}></textarea>
                    
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
