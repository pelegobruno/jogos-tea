import { useNavigate } from 'react-router-dom'
import '@/styles/imitacao.css'

export default function Imitacao() {
  const navigate = useNavigate()

  return (
    <>
      <header className="header">
        <button className="btn-menu" onClick={() => navigate('/')}>
          Menu
        </button>

        <h1 className="header-title">Imitação</h1>

        <button
          className="btn-restart"
          onClick={() => window.location.reload()}
        >
          ♻
        </button>
      </header>

      <main className="page">
        <div className="game-area">
          {/* JOGO DE IMITAÇÃO AQUI */}
        </div>
      </main>
    </>
  )
}
