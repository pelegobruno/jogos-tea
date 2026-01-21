import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/imitacao.css'

export default function Imitacao() {
  const navigate = useNavigate()

  /* ===== ÁUDIOS ===== */
  const introRef = useRef(null)
  const okRef = useRef(null)
  const errRef = useRef(null)
  const musicRef = useRef(null)
  const restartRef = useRef(null)

  const soundOn = localStorage.getItem('soundOn') !== 'false'

  /* ===== ESTADOS ===== */
  const [sequence, setSequence] = useState([])
  const userSeqRef = useRef([])
  const [level, setLevel] = useState(1)
  const [message, setMessage] = useState('Aguarde o comando')
  const [accepting, setAccepting] = useState(false)
  const [locked, setLocked] = useState(true)

  const buttons = ['red', 'blue', 'green', 'yellow']

  /* ===== FUNÇÕES DE SOM ===== */
  function playAudio(ref, volume = 1, onEnd = null) {
    if (!soundOn) {
      onEnd?.()
      return
    }
    const audio = ref?.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio.volume = volume
      audio.play().catch(() => {})
      audio.onended = () => onEnd?.()
    }
  }

  function stopAllSounds() {
    [introRef, okRef, errRef, musicRef, restartRef].forEach(ref => {
      if (ref.current) {
        ref.current.pause()
        ref.current.currentTime = 0
        ref.current.onended = null
      }
    })
  }

  /* ===== LÓGICA DO JOGO ===== */
  function startGame() {
    setLocked(true)
    setSequence([])
    userSeqRef.current = []
    setLevel(1)
    setMessage('Observe a sequência')
    setTimeout(nextLevel, 600)
  }

  function nextLevel() {
    setAccepting(false)
    userSeqRef.current = []
    setSequence((prev) => {
      const next = [...prev, Math.floor(Math.random() * 4)]
      setTimeout(() => playSequence(next), 600)
      return next
    })
  }

  function playSequence(seq) {
    let i = 0
    const interval = setInterval(() => {
      highlight(seq[i])
      i++
      if (i >= seq.length) {
        clearInterval(interval)
        setTimeout(() => {
          setLocked(false)
          setAccepting(true)
          setMessage('Agora é sua vez!')
        }, 400)
      }
    }, 900)
  }

  function highlight(index) {
    const btn = document.querySelector(`.btn.${buttons[index]}`)
    if (btn) {
      btn.classList.add('sequence-active')
      setTimeout(() => btn.classList.remove('sequence-active'), 500)
    }
  }

  function handleClick(index) {
    if (!accepting || locked) return

    const btn = document.querySelector(`.btn.${buttons[index]}`)
    btn?.classList.add('user-active')
    setTimeout(() => btn?.classList.remove('user-active'), 150)

    userSeqRef.current.push(index)
    const idx = userSeqRef.current.length - 1

    if (userSeqRef.current[idx] !== sequence[idx]) {
      setLocked(true)
      setMessage('Vamos tentar novamente 🙂')
      if (musicRef.current) musicRef.current.volume = 0.05
      playAudio(errRef, 1, () => {
        if (musicRef.current) musicRef.current.volume = 0.15
        startGame()
      })
      return
    }

    if (userSeqRef.current.length === sequence.length) {
      setLocked(true)
      setMessage('Muito bem!')
      if (musicRef.current) musicRef.current.volume = 0.05
      playAudio(okRef, 1, () => {
        if (musicRef.current) musicRef.current.volume = 0.15
        setLevel(l => l + 1)
        setTimeout(nextLevel, 600)
      })
    }
  }

  /* ===== NAVEGAÇÃO E REINÍCIO ===== */
  const handleBackToMenu = () => {
    stopAllSounds()
    // Garante o redirecionamento para o Menu.jsx
    navigate('/menu') 
  }

  const reiniciarJogo = () => {
    if (locked) return
    setLocked(true)
    if (musicRef.current) musicRef.current.volume = 0.05
    playAudio(restartRef, 1, () => {
      if (musicRef.current) musicRef.current.volume = 0.15
      startGame()
    })
  }

  /* ===== CICLO DE VIDA (Ajustado) ===== */
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = 0.05
      musicRef.current.play().catch(() => {})
    }

    playAudio(introRef, 1, () => {
      if (musicRef.current) musicRef.current.volume = 0.15
      startGame()
    })

    return () => stopAllSounds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="imitacao-page-wrapper">
      <header className="header">
        <button className="btn-menu" onClick={handleBackToMenu}>
          Menu
        </button>
        <h1 className="header-title">IMITAÇÃO</h1>
        <button className="btn-restart" onClick={reiniciarJogo} disabled={locked}>
          ♻
        </button>
      </header>

      <main className="page">
        <div className="imitacao-container">
          <h2 className="title-game">Imite a Sequência</h2>
          <p className="message-display">{message}</p>
          <div className="level-badge">Nível: {level}</div>

          <div className="game-grid">
            {buttons.map((cor, i) => (
              <button
                key={cor}
                className={`btn ${cor}`}
                onClick={() => handleClick(i)}
                aria-label={`Botão ${cor}`}
              />
            ))}
          </div>
        </div>
      </main>

      <audio ref={introRef} src="/audio/sequencia/aila-intro.mp3" />
      <audio ref={okRef} src="/audio/sequencia/aila-muito-bem.mp3" />
      <audio ref={errRef} src="/audio/sequencia/aila-tente-novamente.mp3" />
      <audio ref={restartRef} src="/audio/aila-reinicio.mp3" />
      <audio ref={musicRef} src="/audio/musica-terapeutica.mp3" loop />
    </div>
  )
}