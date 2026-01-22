import { Routes, Route, Navigate } from 'react-router-dom'
import Intro from '@/pages/Intro'
import Menu from '@/pages/Menu'
import Emocoes from '@/pages/Emocoes'
import Imitacao from '@/pages/Imitacao'
import Matematica from '@/pages/Matematica'
import Objetos from '@/pages/Objetos'

export default function AppRouter() {
  // Verificamos se a sessão de intro está ativa nesta aba
  // Usamos sessionStorage para que o F5 não reinicie a intro,
  // mas fechar e abrir a aba sim.
  const isSessionActive = sessionStorage.getItem('introSession') === 'active'

  return (
    <Routes>
      {/* Se acessar a raiz "/" e a sessão estiver ativa (refresh), vai pro Menu.
          Se não houver sessão ativa (abriu agora), mostra a Intro.
      */}
      <Route 
        path="/" 
        element={isSessionActive ? <Navigate to="/menu" replace /> : <Intro />} 
      />
      
      {/* As rotas abaixo não possuem redirecionamento interno. 
          Se o usuário der F5 em /matematica, o navegador recarregará /matematica normalmente.
      */}
      <Route path="/menu" element={<Menu />} />
      <Route path="/emocoes" element={<Emocoes />} />
      <Route path="/imitacao" element={<Imitacao />} />
      <Route path="/matematica" element={<Matematica />} />
      <Route path="/objetos" element={<Objetos />} />
    </Routes>
  )
}