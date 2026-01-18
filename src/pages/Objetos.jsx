import { useNavigate } from 'react-router-dom'
import '@/styles/objetos.css'

export default function Objetos() {
  const navigate = useNavigate()

  return (
    <>
      <header className="header">
        <button className="btn-menu" onClick={() => navigate('/')}>
          Menu
        </button>

        <h1 className="header-title">Objetos</h1>

        <button
          className="btn-restart"
          onClick={() => window.location.reload()}
        >
          ♻
        </button>
      </header>

      <main className="page">
        <div className="game-area">
          {/* JOGO DE OBJETOS AQUI */}
        </div>
      </main>
    </>
  )
}
