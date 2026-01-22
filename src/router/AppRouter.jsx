import { Routes, Route, Navigate } from 'react-router-dom'
import Intro from '@/pages/Intro'
import Menu from '@/pages/Menu'
import Emocoes from '@/pages/Emocoes'
import Imitacao from '@/pages/Imitacao'
import Matematica from '@/pages/Matematica'
import Objetos from '@/pages/Objetos'

export default function AppRouter() {
  // Verifica se a sessão de intro está ativa nesta aba/sessão
  const isSessionActive = sessionStorage.getItem('introSession') === 'active'

  return (
    <Routes>
      {/* Se acessar a raiz e a sessão estiver ativa (refresh), vai pro Menu.
          Caso contrário (abriu agora), mostra a Intro. */}
      <Route 
        path="/" 
        element={isSessionActive ? <Navigate to="/menu" replace /> : <Intro />} 
      />
      
      <Route path="/menu" element={<Menu />} />
      <Route path="/emocoes" element={<Emocoes />} />
      <Route path="/imitacao" element={<Imitacao />} />
      <Route path="/matematica" element={<Matematica />} />
      <Route path="/objetos" element={<Objetos />} />
    </Routes>
  )
}