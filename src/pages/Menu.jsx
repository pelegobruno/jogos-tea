import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/menu.css'

export default function Menu() {
  const navigate = useNavigate()

  const musicRef = useRef(null)
  const clickRef = useRef(null)

  const [soundOn, setSoundOn] = useState(
    localStorage.getItem('soundOn') !== 'false'
  )

  /* ===== AUTOPLAY CONTROLADO ===== */
  useEffect(() => {
    const music = musicRef.current
    if (!music) return

    music.volume = 0.5

    if (!soundOn) {
      music.pause()
      return
    }

    music.play().catch(() => {
      const liberar = () => {
        music.play().catch(() => {})
      }
      document.addEventListener('touchstart', liberar, { once: true })
    })
  }, [soundOn])

  /* ===== ABRIR JOGO ===== */
  const openGame = (rota) => {
    if (soundOn && clickRef.current) {
      clickRef.current.currentTime = 0
      clickRef.current.play()
    }

    setTimeout(() => {
      navigate(rota)
    }, 300)
  }

  /* ===== TOGGLE SOM ===== */
  const toggleSound = () => {
    const novo = !soundOn
    setSoundOn(novo)
    localStorage.setItem('soundOn', novo)
  }

  /* ===== JOGOS DO MENU ===== */
  const jogos = [
    {
      rota: '/objetos',
      icon: '🎯',
      titulo: 'OBJETOS',
      desc: 'Pareamento • Atenção Visual',
    },
    {
      rota: '/matematica',
      icon: '🔢',
      titulo: 'NÚMEROS',
      desc: 'Sequência • Quantidade',
    },
    {
      rota: '/imitacao',
      icon: '🖐️',
      titulo: 'IMITAÇÃO',
      desc: 'Movimento • Atenção',
    },
    {
      rota: '/emocoes',
      icon: '😊',
      titulo: 'EMOÇÕES',
      desc: 'Reconhecer • Expressar',
    },
  ]

  return (
    <>
      {/* ===== HEADER GLOBAL ===== */}
      <header className="header">
        <span />

        <h1 className="header-title">🧠 Jogos Terapêuticos TEA</h1>

        <button className="btn-menu" onClick={toggleSound}>
          {soundOn ? '🔊 Som: ON' : '🔇 Som: OFF'}
        </button>
      </header>

      {/* ===== CONTEÚDO ===== */}
      <main className="page menu-page">
        <div className="menu-text">
          <span>MENU DE ATIVIDADES</span>
        </div>

        <div className="menu-grid">
          {jogos.map((jogo) => (
            <div
              key={jogo.titulo}
              className="card"
              onClick={() => openGame(jogo.rota)}
            >
              <div className="icon">{jogo.icon}</div>
              <h3>{jogo.titulo}</h3>
              <span>{jogo.desc}</span>
            </div>
          ))}
        </div>
      </main>

      {/* ===== ÁUDIOS ===== */}
      <audio ref={musicRef} src="/audio/menu-music.mp3" loop />
      <audio ref={clickRef} src="/audio/click-soft.mp3" />
    </>
  )
}
