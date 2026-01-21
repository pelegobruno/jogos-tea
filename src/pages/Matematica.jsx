import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/matematica.css'

/* ===== DADOS DO JOGO ===== */
const FRUTAS = [
  '🍎', '🍌', '🍇', '🍓', '🍉', '🍍', '🍊', '🍐', '🍑', '🍒', ' kiwi', '🍋',
  '🥕', '🍅', '🥔', '🌽', '🥒', '🥬', ' garlic', ' onion', '🥦', '🍆'
]

const CONTAS = [
  { a: 1, b: 2, op: '+' },
  { a: 2, b: 3, op: '+' },
  { a: 3, b: 4, op: '+' },
  { a: 5, b: 2, op: '-' },
  { a: 8, b: 3, op: '-' },
  { a: 2, b: 2, op: '*' },
  { a: 3, b: 3, op: '*' },
  { a: 6, b: 2, op: '/' },
  { a: 9, b: 3, op: '/' }
]

function gerarOpcoes(correta) {
  const set = new Set([correta])
  while (set.size < 4) {
    const n = correta + Math.floor(Math.random() * 7) - 3
    if (n >= 0 && n !== correta) set.add(n)
  }
  return Array.from(set).sort(() => Math.random() - 0.5)
}

export default function Matematica() {
  const navigate = useNavigate()
  
  /* ===== REFERÊNCIAS DE ÁUDIO ===== */
  const introRef = useRef(null)
  const bgRef = useRef(null)
  const okRef = useRef(null)
  const errRef = useRef(null)
  const fimRef = useRef(null)
  const reinicioRef = useRef(null)

  const soundOn = localStorage.getItem('soundOn') !== 'false'

  /* ===== ESTADOS ===== */
  const [indice, setIndice] = useState(0)
  const [equacao, setEquacao] = useState('')
  const [resposta, setResposta] = useState(0)
  const [opcoes, setOpcoes] = useState([])
  const [slot, setSlot] = useState('?')
  const [mensagem, setMensagem] = useState('')
  const [finalizado, setFinalizado] = useState(false)
  const [bloqueado, setBloqueado] = useState(true)

  /* ===== FUNÇÕES DE SOM ===== */
  const play = useCallback((ref, volume = 1, onEnd) => {
    if (!soundOn || !ref.current) { 
      onEnd?.(); 
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
  }, [soundOn])

  const stopAllSounds = useCallback(() => {
    [introRef, bgRef, okRef, errRef, fimRef, reinicioRef].forEach(ref => {
      if (ref.current) {
        ref.current.pause()
        ref.current.currentTime = 0
        ref.current.onended = null
      }
    })
  }, [])

  /* ===== LÓGICA DO JOGO ===== */
  const carregarQuestao = useCallback((i) => {
    if (!CONTAS[i]) return
    const { a, b, op } = CONTAS[i]
    const fruta = FRUTAS[i % FRUTAS.length]
    let r = 0, texto = ''

    if (op === '+') { r = a + b; texto = `${fruta.repeat(a)} + ${fruta.repeat(b)} = ?` }
    else if (op === '-') { r = a - b; texto = `${fruta.repeat(a)} − ${fruta.repeat(b)} = ?` }
    else if (op === '*') { r = a * b; texto = `${a} grupos de ${fruta.repeat(b)} = ?` }
    else if (op === '/') { r = a / b; texto = `${fruta.repeat(a)} ÷ ${b} = ?` }

    setResposta(r)
    setEquacao(texto)
    setOpcoes(gerarOpcoes(r))
    setSlot('?')
    setMensagem('')
  }, [])

  function verificar(valor) {
    if (bloqueado || finalizado) return
    setBloqueado(true)
    setSlot(valor)

    if (valor === resposta) {
      play(okRef)
      setMensagem('Muito bem! 🌟')
      setTimeout(() => {
        const prox = indice + 1
        if (prox < CONTAS.length) {
          setIndice(prox)
          carregarQuestao(prox)
          setBloqueado(false)
        } else {
          setFinalizado(true)
          setEquacao('Fim do jogo 🎉')
          play(fimRef)
        }
      }, 1200)
    } else {
      setMensagem('Tente de novo 🙂')
      play(errRef)
      setTimeout(() => {
        setSlot('?')
        setBloqueado(false)
      }, 1000)
    }
  }

  /* ===== REINÍCIO ===== */
  const reiniciarJogo = () => {
    stopAllSounds()
    setBloqueado(true)
    setFinalizado(false)
    setIndice(0)
    setSlot('?')
    setMensagem('Reiniciando...')

    // Toca música de fundo suave
    if (bgRef.current) {
      bgRef.current.volume = 0.05
      bgRef.current.play().catch(() => {})
    }

    play(reinicioRef, 1, () => {
      if (bgRef.current) bgRef.current.volume = 0.15
      carregarQuestao(0)
      setBloqueado(false)
    })
  }

  /* ===== EFEITO INICIAL ===== */
  useEffect(() => {
    if (soundOn && bgRef.current) {
      bgRef.current.volume = 0.1
      bgRef.current.play().catch(() => {})
    }

    play(introRef, 1, () => {
      carregarQuestao(0)
      setBloqueado(false)
    })

    return () => stopAllSounds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregarQuestao, play, soundOn])

  const progresso = ((indice + 1) / CONTAS.length) * 100

  return (
    <div className="matematica-page">
      <header className="header">
        <button className="btn-menu" onClick={() => navigate('/menu')}>Menu</button>
        <h1 className="header-title">NÚMEROS</h1>
        <button className="btn-restart" onClick={reiniciarJogo}>♻</button>
      </header>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progresso}%` }}></div>
      </div>

      <main className="page">
        <div className="matematica-container">
          <div className="equation-card">{equacao}</div>

          <div className={`slot-box ${slot === '?' ? 'waiting' : slot === resposta ? 'correct' : 'wrong'}`}>
            {slot}
          </div>

          <div className="answers-grid">
            {opcoes.map((n) => (
              <button
                key={n}
                className="answer-item"
                disabled={bloqueado || finalizado}
                onClick={() => verificar(n)}
              >
                {n}
              </button>
            ))}
          </div>

          {mensagem && <div className="feedback-message">{mensagem}</div>}
        </div>
      </main>

      <audio ref={introRef} src="/audio/aila-intro-matematica.mp3" />
      <audio ref={bgRef} src="/audio/musica-terapeutica.mp3" loop />
      <audio ref={okRef} src="/audio/aila-muito-bem.mp3" />
      <audio ref={errRef} src="/audio/aila-tente-novamente.mp3" />
      <audio ref={fimRef} src="/audio/aila-finalizacao.mp3" />
      <audio ref={reinicioRef} src="/audio/aila-reinicio.mp3" />
    </div>
  )
}