import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/emocoes.css'

const EMOCOES = [
  { nome: 'ALEGRIA', src: '/img/Alegria.png', cor: '#FFD54F' },
  { nome: 'TRISTEZA', src: '/img/Tristeza.png', cor: '#90CAF9' },
  { nome: 'RAIVA', src: '/img/Raiva.png', cor: '#EF5350' },
  { nome: 'MEDO', src: '/img/Medo.png', cor: '#B39DDB' },
  { nome: 'NOJINHO', src: '/img/Nojinho.png', cor: '#A5D6A7' },
  { nome: 'ANSIEDADE', src: '/img/Ansiedade.png', cor: '#FFCC80' },
  { nome: 'VERGONHA', src: '/img/Vergonha.png', cor: '#CE93D8' },
  { nome: 'NOSTALGIA', src: '/img/Nostalgia.png', cor: '#B0BEC5' },
  { nome: 'INVEJA', src: '/img/Inveja.png', cor: '#81C784' },
]

function gerarOpcoes(certa) {
  const set = new Set([certa])
  while (set.size < 6) {
    const aleatoria =
      EMOCOES[Math.floor(Math.random() * EMOCOES.length)]?.nome
    if (aleatoria) set.add(aleatoria)
  }
  return Array.from(set).sort(() => Math.random() - 0.5)
}

export default function Emocoes() {
  const navigate = useNavigate()

  const introRef = useRef(null)
  const musicRef = useRef(null)
  const okRef = useRef(null)
  const errRef = useRef(null)
  const fimRef = useRef(null)
  const reinicioRef = useRef(null)
  const timerRef = useRef(null)

  const soundOn = localStorage.getItem('soundOn') !== 'false'

  const [correta, setCorreta] = useState(null)
  const [opcoes, setOpcoes] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [tempo, setTempo] = useState(60)
  const [pontos, setPontos] = useState(0)
  const [finalizado, setFinalizado] = useState(false)

  const [bloqueado, setBloqueado] = useState(true) // 🔒 CONTROLE GLOBAL

  /* ===== TIMER ===== */
  function iniciarTimer() {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTempo((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          finalizarJogo()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function finalizarJogo() {
    setFinalizado(true)
    setBloqueado(true)
    setMensagem('Jogo finalizado')

    if (soundOn && fimRef.current) {
      fimRef.current.currentTime = 0
      fimRef.current.play().catch(() => {})
      fimRef.current.onended = () => {
        fimRef.current.onended = null
        setBloqueado(false)
      }
    } else {
      setBloqueado(false)
    }
  }

  function novaRodada(forcarNova = false) {
    if (finalizado) return

    let sorteada = correta
    while (!sorteada || (!forcarNova && sorteada === correta)) {
      sorteada = EMOCOES[Math.floor(Math.random() * EMOCOES.length)]
    }

    setMensagem('')
    setCorreta(sorteada)
    setOpcoes(gerarOpcoes(sorteada.nome))
  }

  function verificar(escolha) {
    if (bloqueado || !correta || finalizado) return

    setBloqueado(true)

    if (escolha === correta.nome) {
      setPontos((p) => p + 1)
      setMensagem('Muito bem 🙂')

      if (soundOn && okRef.current) {
        okRef.current.play().catch(() => {})
        okRef.current.onended = () => {
          okRef.current.onended = null
          setBloqueado(false)
          novaRodada()
        }
      } else {
        setBloqueado(false)
        novaRodada()
      }
    } else {
      setMensagem('Vamos tentar novamente 🙂')

      if (soundOn && errRef.current) {
        errRef.current.currentTime = 0
        errRef.current.play().catch(() => {})
        errRef.current.onended = () => {
          errRef.current.onended = null
          setBloqueado(false)
          novaRodada(true)
        }
      } else {
        setBloqueado(false)
        novaRodada(true)
      }
    }
  }

  function reiniciarJogo() {
    if (bloqueado) return

    setBloqueado(true)
    clearInterval(timerRef.current)

    setTempo(60)
    setPontos(0)
    setFinalizado(false)
    setMensagem('')

    if (soundOn && reinicioRef.current) {
      reinicioRef.current.currentTime = 0
      reinicioRef.current.play().catch(() => {})
      reinicioRef.current.onended = () => {
        reinicioRef.current.onended = null
        setBloqueado(false)
        iniciarTimer()
        novaRodada(true)
      }
    } else {
      setBloqueado(false)
      iniciarTimer()
      novaRodada(true)
    }
  }

  /* ===== INÍCIO ===== */
  useEffect(() => {
    setBloqueado(true)

    if (soundOn && introRef.current) {
      introRef.current.play().catch(() => {})
      introRef.current.onended = () => {
        introRef.current.onended = null

        if (musicRef.current) {
          musicRef.current.volume = 0.3
          musicRef.current.play().catch(() => {})
        }

        setBloqueado(false)
        iniciarTimer()
        novaRodada(true)
      }
    } else {
      if (musicRef.current) musicRef.current.play().catch(() => {})
      setBloqueado(false)
      iniciarTimer()
      novaRodada(true)
    }

    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <header className="header">
        <button className="btn-menu" onClick={() => !bloqueado && navigate('/')}>
          Menu
        </button>

        <h1 className="header-title">EMOÇÕES</h1>

        <button className="btn-restart" onClick={reiniciarJogo}>
          ♻
        </button>
      </header>

      <main className="page">
        <div className="emocao-container">
          <div className="status-bar">
            <span>⏱ {tempo}s</span>
            <span>⭐ {pontos}</span>
          </div>

          <div
            className="emotion-view"
            style={{ backgroundColor: correta?.cor }}
          >
            {correta && <img src={correta.src} alt={correta.nome} />}
          </div>

          <div className="grid">
            {opcoes.map((nome) => (
              <div
                key={nome}
                className={`option ${bloqueado ? 'disabled' : ''}`}
                onClick={() => verificar(nome)}
              >
                {nome}
              </div>
            ))}
          </div>

          <div className="message">{mensagem}</div>
        </div>
      </main>

      {/* ÁUDIOS */}
      <audio ref={introRef} src="/audio/aila-intro-emocoes.mp3" />
      <audio ref={musicRef} src="/audio/musica-terapeutica.mp3" loop />
      <audio ref={okRef} src="/audio/aila-muito-bem.mp3" />
      <audio ref={errRef} src="/audio/aila-tente-novamente.mp3" />
      <audio ref={fimRef} src="/audio/aila-finalizacao.mp3" />
      <audio ref={reinicioRef} src="/audio/aila-reinicio.mp3" />
    </>
  )
}
