import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/matematica.css'

const FRUTAS = [
  /* FRUTAS */
  '🍎', // maçã
  '🍌', // banana
  '🍇', // uva
  '🍓', // morango
  '🍉', // melancia
  '🍍', // abacaxi
  '🍊', // laranja
  '🍐', // pera
  '🍑', // pêssego
  '🍒', // cereja
  '🥝', // kiwi
  '🍋', // limão

  /* VERDURAS / LEGUMES */
  '🥕', // cenoura
  '🍅', // tomate
  '🥔', // batata
  '🌽', // milho
  '🥒', // pepino
  '🥬', // folhas verdes
  '🧄', // alho
  '🧅', // cebola
  '🥦', // brócolis
  '🍆', // berinjela
]

const CONTAS = [
  /* ===== ADIÇÃO ===== */
  { a: 1, b: 2, op: '+' },
  { a: 2, b: 3, op: '+' },
  { a: 3, b: 4, op: '+' },
  { a: 4, b: 2, op: '+' },
  { a: 5, b: 3, op: '+' },
  { a: 6, b: 4, op: '+' },
  { a: 7, b: 2, op: '+' },
  { a: 8, b: 1, op: '+' },
  { a: 5, b: 5, op: '+' },

  /* ===== SUBTRAÇÃO (SEM NEGATIVO) ===== */
  { a: 5, b: 2, op: '-' },
  { a: 6, b: 3, op: '-' },
  { a: 7, b: 4, op: '-' },
  { a: 8, b: 2, op: '-' },
  { a: 9, b: 5, op: '-' },
  { a: 10, b: 4, op: '-' },
  { a: 12, b: 6, op: '-' },

  /* ===== MULTIPLICAÇÃO ===== */
  { a: 2, b: 2, op: '*' },
  { a: 2, b: 3, op: '*' },
  { a: 3, b: 3, op: '*' },
  { a: 3, b: 4, op: '*' },
  { a: 4, b: 2, op: '*' },
  { a: 5, b: 2, op: '*' },
  { a: 6, b: 2, op: '*' },
  { a: 4, b: 3, op: '*' },

  /* ===== DIVISÃO (EXATA) ===== */
  { a: 4, b: 2, op: '/' },
  { a: 6, b: 2, op: '/' },
  { a: 6, b: 3, op: '/' },
  { a: 8, b: 2, op: '/' },
  { a: 9, b: 3, op: '/' },
  { a: 10, b: 2, op: '/' },
  { a: 12, b: 3, op: '/' },
  { a: 12, b: 4, op: '/' },
]

/* ===== GERAR OPÇÕES ===== */
function gerarOpcoes(correta) {
  const set = new Set([correta])

  while (set.size < 4) {
    const n = correta + Math.floor(Math.random() * 7) - 3
    if (n >= 0) set.add(n)
  }

  return Array.from(set).sort(() => Math.random() - 0.5)
}

export default function Matematica() {
  const navigate = useNavigate()

  /* ===== ÁUDIOS ===== */
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

  /* ===== ÁUDIO SEGURO ===== */
  function play(ref, volume = 1, onEnd) {
    if (!soundOn) {
      onEnd?.()
      return
    }

    const audio = ref.current
    if (!(audio instanceof HTMLAudioElement)) return

    audio.pause()
    audio.currentTime = 0
    audio.volume = volume
    audio.play().catch(() => {})
    audio.onended = () => onEnd?.()
  }

  /* ===== QUESTÃO ===== */
  function carregarQuestao(i) {
    const { a, b, op } = CONTAS[i]
    const fruta = FRUTAS[i % FRUTAS.length]

    let r = 0
    let texto = ''

    if (op === '+') {
      r = a + b
      texto = `${fruta.repeat(a)} + ${fruta.repeat(b)} = ?`
    } else if (op === '-') {
      r = a - b
      texto = `${fruta.repeat(a)} − ${fruta.repeat(b)} = ?`
    } else if (op === '*') {
      r = a * b
      texto = `${a} grupos de ${fruta.repeat(b)} = ?`
    } else if (op === '/') {
      r = a / b
      texto = `${fruta.repeat(a)} ÷ ${b} = ?`
    }

    setResposta(r)
    setEquacao(texto)
    setOpcoes(gerarOpcoes(r))
    setSlot('?')
    setMensagem('')
  }

  /* ===== VERIFICAR ===== */
  function verificar(valor) {
    if (bloqueado || finalizado) return
    setBloqueado(true)

    if (valor === resposta) {
      setSlot(valor)
      play(okRef)
    } else {
      setMensagem('Vamos tentar outra 🙂')
      play(errRef)
    }

    setTimeout(() => {
      const prox = indice + 1
      if (prox < CONTAS.length) {
        setIndice(prox)
        carregarQuestao(prox)
        setBloqueado(false)
      } else {
        finalizar()
      }
    }, 700)
  }

  function finalizar() {
    setFinalizado(true)
    setEquacao('Fim do jogo 🎉')
    setOpcoes([])
    setMensagem('Parabéns! Você concluiu!')
    play(fimRef)
  }

  function reiniciar() {
    if (bloqueado) return
    setBloqueado(true)

    play(reinicioRef, 1, () => {
      setIndice(0)
      setFinalizado(false)
      carregarQuestao(0)
      setBloqueado(false)
    })
  }

  /* ===== INÍCIO COM INTRO DA AILA ===== */
  useEffect(() => {
    setBloqueado(true)

    if (soundOn && bgRef.current) {
      bgRef.current.volume = 0.15
      bgRef.current.play().catch(() => {})
    }

    if (soundOn && introRef.current) {
      bgRef.current.volume = 0.05
      play(introRef, 1, () => {
        bgRef.current.volume = 0.15
        carregarQuestao(0)
        setBloqueado(false)
      })
    } else {
      carregarQuestao(0)
      setBloqueado(false)
    }

    return () => {
      ;[introRef, bgRef, okRef, errRef, fimRef, reinicioRef].forEach((r) => {
        if (r.current instanceof HTMLAudioElement) {
          r.current.pause()
          r.current.currentTime = 0
          r.current.onended = null
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <header className="header">
        <button className="btn-menu" onClick={() => !bloqueado && navigate('/')}>
          Menu
        </button>

        <h1 className="header-title">MATEMÁTICA</h1>

        <button className="btn-restart" onClick={reiniciar}>
          ♻
        </button>
      </header>

      <main className="page">
        <div className="matematica-container">
          <div className="equation">{equacao}</div>

          <div className={`slot ${slot !== '?' ? 'ok' : ''}`}>
            {slot}
          </div>

          <div className="answers">
            {opcoes.map((n) => (
              <div
                key={n}
                className="item"
                draggable={!bloqueado}
                onDragEnd={() => verificar(n)}
              >
                {n}
              </div>
            ))}
          </div>

          <div className="message">{mensagem}</div>
        </div>
      </main>

      {/* ===== ÁUDIOS ===== */}
      <audio ref={introRef} src="/audio/aila-intro-matematica.mp3" />
      <audio ref={bgRef} src="/audio/musica-terapeutica.mp3" loop />
      <audio ref={okRef} src="/audio/aila-muito-bem.mp3" />
      <audio ref={errRef} src="/audio/aila-tente-novamente.mp3" />
      <audio ref={fimRef} src="/audio/aila-finalizacao.mp3" />
      <audio ref={reinicioRef} src="/audio/aila-reinicio.mp3" />
    </>
  )
}
