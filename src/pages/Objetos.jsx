import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/objetos.css'

const ITENS = [
  { icon:"🏠", nome:"Casa", audio:"audio/comandos/aila-arraste-casa.mp3" },
  { icon:"⚽", nome:"Bola", audio:"audio/comandos/aila-arraste-bola.mp3" },
  { icon:"🛏️", nome:"Cama", audio:"audio/comandos/aila-arraste-cama.mp3" },
  { icon:"📘", nome:"Livro", audio:"audio/comandos/aila-arraste-livro.mp3" },
  { icon:"🍎", nome:"Maçã", audio:"audio/comandos/aila-arraste-maca.mp3" },
  { icon:"🧢", nome:"Boné", audio:"audio/comandos/aila-arraste-bone.mp3" },
  { icon:"👟", nome:"Tênis", audio:"audio/comandos/aila-arraste-tenis.mp3" },
  { icon:"👕", nome:"Camisa", audio:"audio/comandos/aila-arraste-camisa.mp3" },
  { icon:"✋", nome:"Mão", audio:"audio/comandos/aila-arraste-mao.mp3" },
  { icon:"🦶", nome:"Pé", audio:"audio/comandos/aila-arraste-pe.mp3" },
  { icon:"🌳", nome:"Árvore", audio:"audio/comandos/aila-arraste-arvore.mp3" },
  { icon:"🐶", nome:"Cachorro", audio:"audio/comandos/aila-arraste-cachorro.mp3" },
  { icon:"🐱", nome:"Gato", audio:"audio/comandos/aila-arraste-gato.mp3" },
  { icon:"🚗", nome:"Carro", audio:"audio/comandos/aila-arraste-carro.mp3" },
  { icon:"🪑", nome:"Cadeira", audio:"audio/comandos/aila-arraste-cadeira.mp3" },
  { icon:"🧸", nome:"Brinquedo", audio:"audio/comandos/aila-arraste-brinquedo.mp3" },
  { icon:"🍽️", nome:"Prato", audio:"audio/comandos/aila-arraste-prato.mp3" },
  { icon:"🚿", nome:"Chuveiro", audio:"audio/comandos/aila-arraste-chuveiro.mp3" },
  { icon:"📺", nome:"Televisão", audio:"audio/comandos/aila-arraste-televisao.mp3" },
  { icon:"⌚", nome:"Relógio", audio:"audio/comandos/aila-arraste-relogio.mp3" }
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function Objetos() {
  const navigate = useNavigate()

  /* ===== REFS DE ÁUDIO ===== */
  const vozRef = useRef(null)
  const musicRef = useRef(null)
  const errRef = useRef(null)
  const fimRef = useRef(null)
  const reinicioRef = useRef(null)

  const soundOn = localStorage.getItem('soundOn') !== 'false'

  const [itens, setItens] = useState([])
  const [ordem, setOrdem] = useState([])
  const [indice, setIndice] = useState(0)
  const [mensagem, setMensagem] = useState('')
  const [alvo, setAlvo] = useState('Arraste aqui')
  const [finalizado, setFinalizado] = useState(false)

  /* ===== PLAY SEGURO COM VOLUME ===== */
  function safePlay(ref, src = null, onEnd = null) {
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
    audio.onended = null

    if (src) audio.src = src

    // 🔊 CONTROLE DE VOLUME
    if (ref === musicRef) {
      audio.volume = 0.25 // 🎵 música de fundo
    } else {
      audio.volume = 1    // 🗣️ voz e efeitos
    }

    audio.currentTime = 0
    audio.play().catch(() => {})
    audio.onended = () => onEnd?.()
  }

  function safeStop(ref) {
    const audio = ref?.current
    if (audio instanceof HTMLAudioElement) {
      audio.pause()
      audio.currentTime = 0
      audio.onended = null
    }
  }

  function falar(src, cb) {
    safePlay(vozRef, src, cb)
  }

  /* ===== INICIAR / REINICIAR ===== */
  function iniciar(reinicio = false) {
    const itensMix = shuffle(ITENS)
    const ordemMix = shuffle(ITENS)

    setItens(itensMix)
    setOrdem(ordemMix)
    setIndice(0)
    setMensagem('')
    setAlvo('Arraste aqui')
    setFinalizado(false)

    // 🎵 música de fundo
    safePlay(musicRef)

    if (reinicio) {
      safePlay(reinicioRef, null, () => {
        falar(ordemMix[0].audio)
      })
    } else {
      falar('/audio/aila-intro.mp3', () => {
        falar(ordemMix[0].audio)
      })
    }
  }

  /* ===== MOUNT / UNMOUNT ===== */
  useEffect(() => {
    iniciar()

    return () => {
      ;[vozRef, musicRef, errRef, fimRef, reinicioRef].forEach(safeStop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ===== LÓGICA DO JOGO ===== */
  function verificarDrop(item) {
    if (finalizado) return

    const esperado = ordem[indice]
    if (!esperado) return

    if (item.nome === esperado.nome) {
      setAlvo(item.icon)

      falar('/audio/aila-muito-bem.mp3', () => {
        setItens((prev) => prev.filter((i) => i.nome !== item.nome))
        setAlvo('Arraste aqui')

        if (indice + 1 >= ordem.length) {
          finalizar()
        } else {
          const prox = indice + 1
          setIndice(prox)
          falar(ordem[prox].audio)
        }
      })
    } else {
      setMensagem('Tente novamente 🙂')
      safePlay(errRef)
      falar('/audio/aila-tente-novamente.mp3')
    }
  }

  function finalizar() {
    setFinalizado(true)
    setMensagem('Parabéns! 🎉')
    safePlay(fimRef)
  }

  return (
    <>
      <header className="header">
        <button className="btn-menu" onClick={() => navigate('/')}>
          Menu
        </button>

        <h1 className="header-title">OBJETOS</h1>

        <button className="btn-restart" onClick={() => iniciar(true)}>
          ♻
        </button>
      </header>

      <main className="page">
        <div className="objetos-container">
          <div className="command">
            {finalizado
              ? 'Jogo finalizado 🎉'
              : `Arraste ${ordem[indice]?.nome || ''}`}
          </div>

          <div className="target">{alvo}</div>

          <div className="grid">
            {itens.map((item) => (
              <div
                key={item.nome}
                className="item"
                draggable={!finalizado}
                onDragEnd={() => verificarDrop(item)}
              >
                {item.icon}
              </div>
            ))}
          </div>

          <div className="message">{mensagem}</div>
        </div>
      </main>

      {/* ===== ÁUDIOS ===== */}
      <audio ref={vozRef} />
      <audio ref={musicRef} src="/audio/musica-terapeutica.mp3" loop />
      <audio ref={errRef} src="/audio/aila-tente-novamente.mp3" />
      <audio ref={fimRef} src="/audio/aila-finalizacao.mp3" />
      <audio ref={reinicioRef} src="/audio/aila-reinicio.mp3" />
    </>
  )
}
