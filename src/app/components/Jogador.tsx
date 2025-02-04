import Image from 'next/image';
import React, { useState, useEffect } from 'react'



type JogadorProps = {
    id: string;
    nome: string;
    photo: string;
    quantidadeTotalPescada?: number;
    selected?: boolean;
    message?: string;
    onClick?: (id: string) => void;
}
export default function Jogador(jogadorProps: JogadorProps) {
    const [messageVisible, setMessageVisible] = useState(false);

    const handleJogadorClick = () => {
        if (jogadorProps.onClick) {
            jogadorProps.onClick(jogadorProps.id);
        }
    }

    useEffect(() => {
        const handleMessageChange = () => {
            setMessageVisible(true);
            setTimeout(() => {
                setMessageVisible(false);
            }, 5000);
        }
        if (jogadorProps.message) {
            handleMessageChange();
        }
    }, [jogadorProps, jogadorProps.message]);

    const selected: string = jogadorProps.selected ? 'bg-lime-400' : 'bg-lime-200'
    return (<>
        <div className={selected + " flex flex-col items-center p-2 rounded-md shadow-md w-32 cursor-pointer transition-all hover:scale-105"}
            onClick={handleJogadorClick}>
            <div className="relative">
                {messageVisible && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-black p-2 rounded-md shadow-md">
                        <p className="text-sm">{jogadorProps.message}</p>
                    </div>
                )}
                <div className="w-12 h-12 rounded-full bg-lime-300 mb-2 overflow-hidden">
                    <Image
                        src={jogadorProps.photo}
                        width={25} height={25}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
            <div className="text-center">
                <h1 className="text-md font-bold text-gray-800 mb-2">{jogadorProps.nome}</h1>
            </div>

        </div>
        {/*
            jogadorProps.quantidadeTotalPescada != null && (
                <div className="flex items-center gap-2">
                    <span className="text-black-600"> 🐟 Peixes no Cesto:</span>
                    <span className="font-medium">{jogadorProps.quantidadeTotalPescada?.toFixed(1)}</span>
                </div>
            )
        */}</>
    )
}
