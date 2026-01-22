import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/emocoes.css'

/* ===== EMOÇÕES (CAMINHOS CORRIGIDOS) ===== */
const EMOCOES = [
  { nome: 'ALEGRIA', src: './img/Alegria.png', cor: '#FFD54F' },
  { nome: 'TRISTEZA', src: './img/Tristeza.png', cor: '#90CAF9' },
  { nome: 'RAIVA', src: './img/Raiva.png', cor: '#EF5350' },
  { nome: 'MEDO', src: './img/Medo.png', cor: '#B39DDB' },
  { nome: 'NOJINHO', src: './img/Nojinho.png', cor: '#A5D6A7' },
  { nome: 'ANSIEDADE', src: './img/Ansiedade.png', cor: '#FFCC80' },
  { nome: 'VERGONHA', src: './img/Vergonha.png', cor: '#CE93D8' },
  { nome: 'NOSTALGIA', src: './img/Nostalgia.png', cor: '#B0BEC5' },
  { nome: 'INVEJA', src: './img/Inveja.png', cor: '#81C784' },
]

function gerarOpcoes(certa) {
  const set = new Set([certa])
  while (set.size < 6) {
    const aleatoria = EMOCOES[Math.floor(Math.random() * EMOCOES.length)]?.nome
    if (aleatoria) set.add(aleatoria)
  }
  return Array.from(set).sort(() => Math.random() - 0.5)
}

export default function Emocoes() {
  const navigate = useNavigate()

  /* ===== REFS DE ÁUDIO ===== */
  const introRef = useRef(null)
  const musicRef = useRef(null)
  const okRef = useRef(null)
  const errRef = useRef(null)
  const fimRef = useRef(null)
  const reinicioRef = useRef(null)
  const timerRef = useRef(null)

  const soundOn = localStorage.getItem('soundOn') !== 'false'

  /* ===== ESTADOS ===== */
  const [correta, setCorreta] = useState(null)
  const [opcoes, setOpcoes] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [tempo, setTempo] = useState(60)
  const [pontos, setPontos] = useState(0)
  const [finalizado, setFinalizado] = useState(false)
  const [bloqueado, setBloqueado] = useState(true)
  const [escolhaFeita, setEscolhaFeita] = useState(null)

  /* ===== FUNÇÕES DE SOM ===== */
  const playAudio = useCallback(
    (ref, volume = 1, onEnd = null) => {
      if (!soundOn || !ref.current) {
        onEnd?.()
        return
      }
      const audio = ref.current
      audio.pause()
      audio.currentTime = 0
      audio.volume = volume
      audio.play().catch(() => {})
      audio.onended = () => {
        audio.onended = null
        onEnd?.()
      }
    },
    [soundOn]
  )

  const stopAllSounds = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    ;[introRef, musicRef, okRef, errRef, fimRef, reinicioRef].forEach(ref => {
      if (ref.current) {
        ref.current.pause()
        ref.current.onended = null
      }
    })
  }, [])

  /* ===== LÓGICA DO JOGO ===== */
  const novaRodada = useCallback((forcarNova = false) => {
    setEscolhaFeita(null)
    setCorreta(prev => {
      let sorteada = prev
      while (
        !sorteada ||
        (sorteada.nome === prev?.nome && !forcarNova)
      ) {
        sorteada = EMOCOES[Math.floor(Math.random() * EMOCOES.length)]
      }
      setOpcoes(gerarOpcoes(sorteada.nome))
      return sorteada
    })
    setMensagem('')
  }, [])

  const iniciarTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTempo(p => {
        if (p <= 1) {
          setFinalizado(true)
          setBloqueado(true)
          playAudio(fimRef)
          return 0
        }
        return p - 1
      })
    }, 1000)
  }, [playAudio])

  function verificar(nome) {
    if (bloqueado || finalizado) return
    setBloqueado(true)
    setEscolhaFeita(nome)

    if (nome === correta.nome) {
      setPontos(p => p + 1)
      setMensagem('Muito bem! 🌟')
      playAudio(okRef, 1, () => {
        setBloqueado(false)
        novaRodada()
      })
    } else {
      setMensagem('Tente de novo 🙂')
      playAudio(errRef, 1, () => {
        setBloqueado(false)
        setEscolhaFeita(null)
        setMensagem('')
      })
    }
  }

  const reiniciarJogo = () => {
    stopAllSounds()
    setBloqueado(true)
    setFinalizado(false)
    setTempo(60)
    setPontos(0)
    setMensagem('Reiniciando...')
    playAudio(reinicioRef, 1, () => {
      if (musicRef.current) musicRef.current.play().catch(() => {})
      setBloqueado(false)
      novaRodada(true)
      iniciarTimer()
    })
  }

  /* ===== CICLO DE VIDA ===== */
  useEffect(() => {
    const tStart = setTimeout(() => {
      playAudio(introRef, 1, () => {
        if (musicRef.current) {
          musicRef.current.volume = 0.2
          musicRef.current.play().catch(() => {})
        }
        setBloqueado(false)
        novaRodada(true)
        iniciarTimer()
      })
    }, 500)

    return () => {
      clearTimeout(tStart)
      stopAllSounds()
    }
  }, [iniciarTimer, novaRodada, playAudio, stopAllSounds])

  return (
    <div className="emocoes-page-wrapper">
      <header className="header">
        <button className="btn-menu" onClick={() => navigate('/menu')}>Menu</button>
        <h1 className="header-title">EMOÇÕES</h1>
        <button className="btn-restart" onClick={reiniciarJogo}>♻</button>
      </header>

      <main className="page">
        <div className="emocao-container">
          <div className="status-bar">
            <span>⏱ {tempo}s</span>
            <span>⭐ {pontos}</span>
          </div>

          <div className="emotion-view" style={{ backgroundColor: correta?.cor || '#fff' }}>
            {correta && <img src={correta.src} alt={correta.nome} />}
          </div>

          <div className="grid">
            {opcoes.map(nome => (
              <button
                key={nome}
                className={`option ${escolhaFeita === nome ? (nome === correta?.nome ? 'correct' : 'wrong') : ''}`}
                disabled={bloqueado}
                onClick={() => verificar(nome)}
              >
                {nome}
              </button>
            ))}
          </div>

          <div className="message">{mensagem}</div>
        </div>
      </main>

      {/* ===== ÁUDIOS (CAMINHOS RELATIVOS CORRIGIDOS) ===== */}
      <audio ref={introRef} src="./audio/aila-intro-emocoes.mp3" />
      <audio ref={musicRef} src="./audio/musica-terapeutica.mp3" loop />
      <audio ref={okRef} src="./audio/aila-muito-bem.mp3" />
      <audio ref={errRef} src="./audio/aila-tente-novamente.mp3" />
      <audio ref={fimRef} src="./audio/aila-finalizacao.mp3" />
      <audio ref={reinicioRef} src="./audio/aila-reinicio.mp3" />
    </div>
  )
}