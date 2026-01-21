import { Routes, Route } from 'react-router-dom'

import Intro from '@/pages/Intro'
import Menu from '@/pages/Menu'
import Emocoes from '@/pages/Emocoes'
import Imitacao from '@/pages/Imitacao'
import Matematica from '@/pages/Matematica'
import Objetos from '@/pages/Objetos'

export default function AppRouter() {
  return (
    <Routes>
      {/* INTRO */}
      <Route path="/" element={<Intro />} />

      {/* MENU */}
      <Route path="/menu" element={<Menu />} />

      {/* JOGOS */}
      <Route path="/emocoes" element={<Emocoes />} />
      <Route path="/imitacao" element={<Imitacao />} />
      <Route path="/matematica" element={<Matematica />} />
      <Route path="/objetos" element={<Objetos />} />
    </Routes>
  )
}
