import { Routes, Route, Navigate } from 'react-router-dom'
import Intro from '@/pages/Intro'
import Menu from '@/pages/Menu'
import Emocoes from '@/pages/Emocoes'
import Imitacao from '@/pages/Imitacao'
import Matematica from '@/pages/Matematica'
import Objetos from '@/pages/Objetos'

export default function AppRouter() {
  // Verifica se a intro já foi finalizada anteriormente
  const hasFinishedIntro = localStorage.getItem('introFinished') === 'true'

  return (
    <Routes>
      {/* Se o usuário entrar na raiz "/" e já tiver terminado a intro, 
          ele é jogado direto para o "/menu". Caso contrário, vê a Intro.
      */}
      <Route 
        path="/" 
        element={hasFinishedIntro ? <Navigate to="/menu" replace /> : <Intro />} 
      />
      
      <Route path="/menu" element={<Menu />} />
      <Route path="/emocoes" element={<Emocoes />} />
      <Route path="/imitacao" element={<Imitacao />} />
      <Route path="/matematica" element={<Matematica />} />
      <Route path="/objetos" element={<Objetos />} />
    </Routes>
  )
}