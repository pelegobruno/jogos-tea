import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/menu.css'

export default function Menu() {
  const navigate = useNavigate()

  /* ===== REFS ===== */
  const musicRef = useRef(null)
  const clickRef = useRef(null)

  /* ===== STATE ===== */
  const [soundOn, setSoundOn] = useState(
    localStorage.getItem('soundOn') !== 'false'
  )

  /* ===== CONTROLE DE ÁUDIO ===== */
  useEffect(() => {
    const music = musicRef.current
    if (!music) return

    music.volume = 0.3

    if (soundOn) {
      const playPromise = music.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const enableAudio = () => {
            if (!musicRef.current) return
            musicRef.current.play().catch(() => {})
            document.removeEventListener('click', enableAudio)
          }
          document.addEventListener('click', enableAudio)
        })
      }
    } else {
      music.pause()
    }

    return () => {
      music.pause()
    }
  }, [soundOn])

  /* ===== NAVEGAÇÃO ===== */
  const openGame = (rota) => {
    if (soundOn && clickRef.current) {
      clickRef.current.currentTime = 0
      clickRef.current.play().catch(() => {})
    }

    setTimeout(() => {
      navigate(rota)
    }, 200)
  }

  /* ===== SOM ON / OFF ===== */
  const toggleSound = () => {
    setSoundOn((prev) => {
      const novo = !prev
      localStorage.setItem('soundOn', novo)
      return novo
    })
  }

  /* ===== JOGOS ===== */
  const jogos = [
    {
      rota: '/objetos',
      icon: '🎯',
      titulo: 'OBJETOS',
      desc: 'Pareamento e Atenção',
      cor: '#FFEBEE',
    },
    {
      rota: '/matematica',
      icon: '🔢',
      titulo: 'MATEMÁTICA',
      desc: 'Contar e Somar',
      cor: '#E3F2FD',
    },
    {
      rota: '/imitacao',
      icon: '🖐️',
      titulo: 'IMITAÇÃO',
      desc: 'Siga a Sequência',
      cor: '#E8F5E9',
    },
    {
      rota: '/emocoes',
      icon: '😊',
      titulo: 'EMOÇÕES',
      desc: 'Expressões e Afeto',
      cor: '#FFF3E0',
    },
  ]

  /* ===== JSX ===== */
  return (
    <div className="menu-wrapper">
      <header className="header-menu">
        <h1 className="header-title">🧠 Jogos TEA</h1>

        <button
          className={`btn-sound ${!soundOn ? 'off' : ''}`}
          onClick={toggleSound}
          aria-label="Ativar ou desativar som"
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
      </header>

      <main className="menu-container">
        <div className="menu-intro">
          <h2>Olá! Vamos brincar?</h2>
          <p>Escolha uma atividade abaixo</p>
        </div>

        <div className="menu-grid">
          {jogos.map((jogo) => (
            <button
              key={jogo.titulo}
              className="menu-card"
              onClick={() => openGame(jogo.rota)}
              style={{ '--card-color': jogo.cor }}
            >
              <div className="card-icon">{jogo.icon}</div>

              <div className="card-info">
                <h3>{jogo.titulo}</h3>
                <span>{jogo.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* ===== ÁUDIOS (CAMINHOS RELATIVOS CORRIGIDOS) ===== */}
      <audio
        ref={musicRef}
        src="./audio/menu-music.mp3"
        loop
        preload="auto"
      />
      <audio
        ref={clickRef}
        src="./audio/click-soft.mp3"
        preload="auto"
      />
    </div>
  )
}