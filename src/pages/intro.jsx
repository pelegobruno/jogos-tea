import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/intro.css'

/* ================= CONFIG ================= */
const TOTAL_TIME = 15

const phrases = [
  'SINCRONIZANDO ONDAS CEREBRAIS...',
  'CONECTANDO NEURÔNIOS...',
  'ADICIONANDO NITROGÊNIO NEURAL...',
  'ESTIMULANDO FOCO E ATENÇÃO...',
  'PROCESSO EM ESTABILIZAÇÃO...',
]

export default function Intro() {
  const navigate = useNavigate()
  const [started, setStarted] = useState(false)

  /* ===== REFS ===== */
  const pressRef = useRef(null)
  const startBoxRef = useRef(null)
  const jogosRef = useRef(null)
  const terapRef = useRef(null)
  const subtitleRef = useRef(null)
  const liquidRef = useRef(null)
  const bubbleLayerRef = useRef(null)
  const flaskRef = useRef(null)
  const flashRef = useRef(null)
  const canvasRef = useRef(null)

  /* ===== ÁUDIOS ===== */
  const audio = {
    uka: useRef(null),
    music: useRef(null),
    metal: useRef(null),
    boom: useRef(null),
  }

  const play = (ref) => {
    if (!ref.current) return
    ref.current.currentTime = 0
    ref.current.play().catch(() => {})
  }

  /* ================= START ================= */
  const startIntro = () => {
    if (started) return
    setStarted(true)

    startBoxRef.current.classList.add('start-flash-fast')
    play(audio.uka)

    setTimeout(() => {
      pressRef.current.style.display = 'none'
      startScene()
    }, 1500)
  }

  /* ================= CENA ================= */
  const startScene = () => {
    play(audio.music)
    dropTitleSequence()
    rotatePhrases()
    fillFlask()
    startBubbles()
    startStars()
  }

  /* ===== JOGOS TERAPÊUTICOS ===== */
  const dropTitleSequence = () => {
    jogosRef.current.classList.add('drop')
    play(audio.metal)

    setTimeout(() => {
      terapRef.current.classList.add('drop')
      play(audio.metal)
    }, 300)

    setTimeout(() => piqueNTimes(jogosRef.current, 3), 1000)
    setTimeout(() => piqueNTimes(terapRef.current, 3), 1600)

    setTimeout(() => {
      jogosRef.current.classList.add('title-idle')
      terapRef.current.classList.add('title-idle')
    }, 3200)
  }

  const piqueNTimes = (el, times) => {
    let count = 0
    const interval = setInterval(() => {
      el.classList.remove('pique')
      void el.offsetWidth
      el.classList.add('pique')
      play(audio.metal)
      count++
      if (count >= times) clearInterval(interval)
    }, 450)
  }

  /* ===== FRASES ===== */
  const rotatePhrases = () => {
    let i = 0
    setInterval(() => {
      i = (i + 1) % phrases.length
      subtitleRef.current.style.opacity = 0
      setTimeout(() => {
        subtitleRef.current.textContent = phrases[i]
        subtitleRef.current.style.opacity = 1
      }, 400)
    }, 4000)
  }

  /* ===== FRASCO ===== */
  const fillFlask = () => {
    let start = null

    const loop = (t) => {
      if (!start) start = t
      const elapsed = (t - start) / 1000

      liquidRef.current.style.height =
        Math.min((elapsed / TOTAL_TIME) * 100, 100) + '%'

      if (elapsed < TOTAL_TIME) {
        requestAnimationFrame(loop)
      } else {
        bigBang()
      }
    }

    requestAnimationFrame(loop)
  }

  /* ================= BIG BANG ================= */
  const bigBang = () => {
    audio.music.current.pause()
    play(audio.boom)

    flashRef.current.classList.add('boom-flash')
    flaskRef.current.classList.add('flask-explode')

    ;[jogosRef.current, terapRef.current, subtitleRef.current].forEach((el) => {
      el.classList.remove('title-idle', 'drop')
      el.style.setProperty('--fx', Math.random() * 1000 - 500)
      el.style.setProperty('--fy', Math.random() * -1000 - 200)
      el.style.setProperty('--r', Math.random() * 1080 - 540)
      el.classList.add('fly-away')
    })

    setTimeout(() => {
      navigate('/menu')
    }, 2500)
  }

  /* ================= AUX ================= */
  const startBubbles = () => {
    setInterval(() => {
      const b = document.createElement('div')
      b.className = 'bubble'
      b.style.left = Math.random() * 100 + '%'
      bubbleLayerRef.current.appendChild(b)
      setTimeout(() => b.remove(), 3000)
    }, 500)
  }

  const startStars = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      s: Math.random() * 0.6 + 0.2,
    }))

    resize()
    window.addEventListener('resize', resize)

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'white'
      stars.forEach((s) => {
        s.y += s.s
        if (s.y > canvas.height) s.y = 0
        ctx.fillRect(s.x, s.y, 2, 2)
      })
      requestAnimationFrame(loop)
    }

    loop()
  }

  /* ================= JSX ================= */
  return (
    <div className="intro-page">
      <div id="explosion-flash" ref={flashRef}></div>

      <div id="press-start" ref={pressRef} onClick={startIntro}>
        <div className="start-box" ref={startBoxRef}>
          ▶ PRESS START ◀
        </div>
      </div>

      <canvas id="stars-canvas" ref={canvasRef}></canvas>

      <main className="scene">
        <h1 className="title">
          <span ref={jogosRef}>JOGOS</span>
          <span ref={terapRef}>TERAPÊUTICOS</span>
        </h1>

        <div id="subtitle" ref={subtitleRef}>
          AGUARDANDO INICIALIZAÇÃO...
        </div>

        <div className="flask-wrapper">
          <div className="flask" ref={flaskRef}>
            <div className="liquid" ref={liquidRef}></div>
            <div className="bubble-layer" ref={bubbleLayerRef}></div>
          </div>
        </div>
      </main>

      {/* ÁUDIOS */}
      <audio ref={audio.uka} src="/audio/intro/aku_aku.mp3" preload="auto" />
      <audio
        ref={audio.music}
        src="/audio/intro/1-01. N. Sanity Beach.mp3"
        preload="auto"
      />
      <audio
        ref={audio.metal}
        src="https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3"
        preload="auto"
      />
      <audio ref={audio.boom} src="/audio/intro/bomba.mp3" preload="auto" />
    </div>
  )
}
