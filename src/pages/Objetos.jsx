import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/objetos.css'

/* ===== ITENS (CAMINHOS RELATIVOS CORRIGIDOS) ===== */
const ITENS_ORIGINAIS = [
  { icon: '🏠', nome: 'Casa', audio: './audio/comandos/aila-arraste-casa.mp3' },
  { icon: '⚽', nome: 'Bola', audio: './audio/comandos/aila-arraste-bola.mp3' },
  { icon: '🛏️', nome: 'Cama', audio: './audio/comandos/aila-arraste-cama.mp3' },
  { icon: '📘', nome: 'Livro', audio: './audio/comandos/aila-arraste-livro.mp3' },
  { icon: '🍎', nome: 'Maçã', audio: './audio/comandos/aila-arraste-maca.mp3' },
  { icon: '🧢', nome: 'Boné', audio: './audio/comandos/aila-arraste-bone.mp3' },
  { icon: '👟', nome: 'Tênis', audio: './audio/comandos/aila-arraste-tenis.mp3' },
  { icon: '👕', nome: 'Camisa', audio: './audio/comandos/aila-arraste-camisa.mp3' },
  { icon: '✋', nome: 'Mão', audio: './audio/comandos/aila-arraste-mao.mp3' },
  { icon: '🦶', nome: 'Pé', audio: './audio/comandos/aila-arraste-pe.mp3' },
  { icon: '🌳', nome: 'Árvore', audio: './audio/comandos/aila-arraste-arvore.mp3' },
  { icon: '🐶', nome: 'Cachorro', audio: './audio/comandos/aila-arraste-cachorro.mp3' },
  { icon: '🐱', nome: 'Gato', audio: './audio/comandos/aila-arraste-gato.mp3' },
  { icon: '🚗', nome: 'Carro', audio: './audio/comandos/aila-arraste-carro.mp3' },
  { icon: '🪑', nome: 'Cadeira', audio: './audio/comandos/aila-arraste-cadeira.mp3' },
  { icon: '🧸', nome: 'Brinquedo', audio: './audio/comandos/aila-arraste-brinquedo.mp3' },
  { icon: '🍽️', nome: 'Prato', audio: './audio/comandos/aila-arraste-prato.mp3' },
  { icon: '🚿', nome: 'Chuveiro', audio: './audio/comandos/aila-arraste-chuveiro.mp3' },
  { icon: '📺', nome: 'Televisão', audio: './audio/comandos/aila-arraste-televisao.mp3' },
  { icon: '⌚', nome: 'Relógio', audio: './audio/comandos/aila-arraste-relogio.mp3' },
]

export default function Objetos() {
  const navigate = useNavigate()

  /* ===== REFS ===== */
  const vozRef = useRef(null)
  const musicRef = useRef(null)
  const errRef = useRef(null)
  const fimRef = useRef(null)
  const reinicioRef = useRef(null)

  const soundOn = localStorage.getItem('soundOn') !== 'false'

  /* ===== ESTADOS ===== */
  const [itensDisponiveis, setItensDisponiveis] = useState([])
  const [objetivoAtual, setObjetivoAtual] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [alvoIcon, setAlvoIcon] = useState('Arraste aqui')
  const [finalizado, setFinalizado] = useState(false)
  const [bloqueado, setBloqueado] = useState(true)

  /* ===== ÁUDIO SEGURO ===== */
  const safePlay = useCallback(
    (ref, src = null, onEnd = null) => {
      // Para outros sons em execução
      ;[vozRef, errRef, fimRef, reinicioRef].forEach(r => {
        if (r.current) {
          r.current.pause()
          r.current.currentTime = 0
        }
      })

      const audio = ref?.current
      if (!soundOn || !audio) {
        setBloqueado(false)
        onEnd?.()
        return
      }

      if (src) audio.src = src

      audio.play()
        .then(() => {
          setBloqueado(true)
          audio.onended = () => {
            audio.onended = null
            setBloqueado(false)
            onEnd?.()
          }
        })
        .catch((err) => {
          console.warn("Autoplay bloqueado ou erro no áudio:", err)
          setBloqueado(false)
          onEnd?.()
        })
    },
    [soundOn]
  )

  const sortearProximo = useCallback(
    (listaAtual) => {
      if (listaAtual.length === 0) {
        setFinalizado(true)
        setMensagem('Parabéns! 🎉')
        safePlay(fimRef)
        return
      }

      const sorteado = listaAtual[Math.floor(Math.random() * listaAtual.length)]
      setObjetivoAtual(sorteado)
      safePlay(vozRef, sorteado.audio)
    },
    [safePlay]
  )

  const iniciar = useCallback(
    (reinicio = false) => {
      const listaEmbaralhada = [...ITENS_ORIGINAIS].sort(() => Math.random() - 0.5)

      setItensDisponiveis(listaEmbaralhada)
      setMensagem('')
      setAlvoIcon('Arraste aqui')
      setFinalizado(false)

      // Música de fundo
      if (musicRef.current && soundOn) {
        musicRef.current.volume = 0.15
        musicRef.current.play().catch(() => {})
      }

      if (reinicio) {
        safePlay(reinicioRef, null, () => sortearProximo(listaEmbaralhada))
      } else {
        // Pequeno delay para garantir carregamento dos refs
        setTimeout(() => {
          safePlay(vozRef, './audio/aila-intro.mp3', () => sortearProximo(listaEmbaralhada))
        }, 100)
      }
    },
    [safePlay, sortearProximo, soundOn]
  )

  useEffect(() => {
    iniciar()
    return () => {
      ;[vozRef, musicRef, errRef, fimRef, reinicioRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause()
          ref.current.onended = null
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Removido 'iniciar' das dependências para evitar loops

  const processarEscolha = (nome) => {
    if (bloqueado || finalizado) return

    if (nome === objetivoAtual?.nome) {
      setBloqueado(true)
      setAlvoIcon(objetivoAtual.icon)
      setMensagem('Muito bem! ✨')

      safePlay(vozRef, './audio/aila-muito-bem.mp3', () => {
        const novaLista = itensDisponiveis.filter(i => i.nome !== nome)
        setItensDisponiveis(novaLista)
        setAlvoIcon('Arraste aqui')
        setMensagem('')
        sortearProximo(novaLista)
      })
    } else {
      setMensagem('Tente novamente! 🙂')
      safePlay(errRef)
    }
  }

  const handleDragStart = (e, item) => {
    if (bloqueado || finalizado) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData('nome', item.nome)
  }

  return (
    <div className="objetos-page-wrapper">
      <header className="header">
        <button className="btn-menu" onClick={() => navigate('/menu')}>MENU</button>
        <h1 className="header-title">BUSCA OBJETOS</h1>
        <button className="btn-restart" disabled={bloqueado} onClick={() => iniciar(true)}>♻</button>
      </header>

      <main className="page">
        <div className="objetos-container">
          <div className="command">
            {finalizado ? 'Fim de Jogo!' : `Aila diz: Ache o(a) ${objetivoAtual?.nome || '...'}`}
          </div>

          <div
            className={`target-zone ${bloqueado ? 'locked' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              processarEscolha(e.dataTransfer.getData('nome'))
            }}
          >
            <div className="target-display" style={{ fontSize: alvoIcon === 'Arraste aqui' ? '1.2rem' : '4rem' }}>
              {alvoIcon}
            </div>
          </div>

          <div className="grid-objetos">
            {itensDisponiveis.map(item => (
              <div
                key={item.nome}
                className={`item-card-objetos ${bloqueado ? 'disabled' : ''}`}
                draggable={!bloqueado && !finalizado}
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => processarEscolha(item.nome)}
                style={{ opacity: bloqueado ? 0.6 : 1, cursor: bloqueado ? 'not-allowed' : 'grab' }}
              >
                {item.icon}
              </div>
            ))}
          </div>

          <div className="feedback-message">{mensagem}</div>
        </div>
      </main>

      {/* ===== ÁUDIOS ===== */}
      <audio ref={vozRef} preload="auto" />
      <audio ref={musicRef} src="./audio/musica-terapeutica.mp3" loop preload="auto" />
      <audio ref={errRef} src="./audio/aila-tente-novamente.mp3" preload="auto" />
      <audio ref={fimRef} src="./audio/aila-finalizacao.mp3" preload="auto" />
      <audio ref={reinicioRef} src="./audio/aila-reinicio.mp3" preload="auto" />
    </div>
  )
}