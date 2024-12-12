'use client'

import dynamic from 'next/dynamic'
 
const GameRoom = dynamic(() => import('./components/GameRoom'), {
  ssr: false, //server side rendering
})

export default function Home() {
  return <GameRoom />
}
