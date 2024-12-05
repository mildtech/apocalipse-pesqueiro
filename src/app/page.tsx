'use client'
 
import dynamic from 'next/dynamic'
 
const GameRoom = dynamic(() => import('./components/GameRoom'), {
  ssr: false,
})

export default function Home() {
  return <GameRoom />
}
