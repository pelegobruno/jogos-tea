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
  const [locked, setLocked] = useState(true) // 🔒 CONTROLE GLOBAL

  const buttons = ['red', 'blue', 'green', 'yellow']

  /* ===== ÁUDIO SEGURO ===== */
  function playAudio(ref, volume = 1, onEnd = null) {
    if (!soundOn) {
      onEnd?.()
      return
    }

    const audio = ref?.current
    if (!(audio instanceof HTMLAudioElement)) {
      onEnd?.()
      return
    }

    audio.pause()
    audio.currentTime = 0
    audio.volume = volume
    audio.onended = null

    audio.play().catch(() => {})
    audio.onended = () => onEnd?.()
  }

  /* ===== MÚSICA ===== */
  function startMusic() {
    playAudio(musicRef, 0.15)
  }

  function lowerMusic() {
    if (musicRef.current) musicRef.current.volume = 0.05
  }

  function restoreMusic() {
    if (musicRef.current) musicRef.current.volume = 0.15
  }

  /* ===== JOGO ===== */
  function startGame() {
    setLocked(true)
    setSequence([])
    userSeqRef.current = []
    setLevel(1)
    setMessage('Observe a sequência')
    setAccepting(false)

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
          setMessage('Agora é sua vez')
        }, 300)
      }
    }, 900)
  }

  function highlight(index) {
    const btn = document.querySelector(`.btn.${buttons[index]}`)
    if (!btn) return

    btn.classList.add('sequence-active')
    setTimeout(() => btn.classList.remove('sequence-active'), 500)
  }

  function handleClick(index) {
    if (!accepting || locked) return

    const btn = document.querySelector(`.btn.${buttons[index]}`)
    btn?.classList.add('user-active')
    setTimeout(() => btn?.classList.remove('user-active'), 250)

    userSeqRef.current.push(index)
    const idx = userSeqRef.current.length - 1

    if (userSeqRef.current[idx] !== sequence[idx]) {
      handleError()
      return
    }

    if (userSeqRef.current.length === sequence.length) {
      handleSuccess()
    }
  }

  function handleError() {
    setLocked(true)
    setAccepting(false)
    setMessage('Vamos tentar novamente 🙂')

    lowerMusic()
    playAudio(errRef, 1, () => {
      restoreMusic()
      startGame()
    })
  }

  function handleSuccess() {
    setLocked(true)
    setAccepting(false)
    setMessage('Muito bem!')

    lowerMusic()
    playAudio(okRef, 1, () => {
      restoreMusic()
      setLevel((l) => l + 1)
      setTimeout(nextLevel, 600)
    })
  }

  /* ===== REINICIAR (♻) ===== */
  function reiniciarJogo() {
    if (locked) return

    setLocked(true)
    setAccepting(false)
    lowerMusic()

    playAudio(restartRef, 1, () => {
      restoreMusic()
      startGame()
    })
  }

  /* ===== INÍCIO ===== */
  useEffect(() => {
    startMusic()
    lowerMusic()

    playAudio(introRef, 1, () => {
      restoreMusic()
      startGame()
    })

    return () => {
      ;[introRef, okRef, errRef, musicRef, restartRef].forEach((ref) => {
        if (ref.current instanceof HTMLAudioElement) {
          ref.current.pause()
          ref.current.currentTime = 0
          ref.current.onended = null
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <header className="header">
        <button
          className="btn-menu"
          onClick={() => !locked && navigate('/')}
        >
          Menu
        </button>

        <h1 className="header-title">IMITAÇÃO</h1>

        <button className="btn-restart" onClick={reiniciarJogo}>
          ♻
        </button>
      </header>

      <main className="page">
        <div className="imitacao-container">
          <h2>Imite a Sequência</h2>
          <p>{message}</p>

          <div className="level">Nível: {level}</div>

          <div className="grid">
            {buttons.map((cor, i) => (
              <div
                key={cor}
                className={`btn ${cor}`}
                onClick={() => handleClick(i)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* ===== ÁUDIOS ===== */}
      <audio ref={introRef} src="/audio/sequencia/aila-intro.mp3" />
      <audio ref={okRef} src="/audio/sequencia/aila-muito-bem.mp3" />
      <audio ref={errRef} src="/audio/sequencia/aila-tente-novamente.mp3" />
      <audio ref={restartRef} src="/audio/aila-reinicio.mp3" />
      <audio ref={musicRef} src="/audio/musica-terapeutica.mp3" loop />
    </>
  )
}
