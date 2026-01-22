import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/objetos.css'

const ITENS_ORIGINAIS = [
  { icon: '🏠', nome: 'Casa', audio: 'audio/comandos/aila-arraste-casa.mp3' },
  { icon: '⚽', nome: 'Bola', audio: 'audio/comandos/aila-arraste-bola.mp3' },
  { icon: '🛏️', nome: 'Cama', audio: 'audio/comandos/aila-arraste-cama.mp3' },
  { icon: '📘', nome: 'Livro', audio: 'audio/comandos/aila-arraste-livro.mp3' },
  { icon: '🍎', nome: 'Maçã', audio: 'audio/comandos/aila-arraste-maca.mp3' },
  { icon: '🧢', nome: 'Boné', audio: 'audio/comandos/aila-arraste-bone.mp3' },
  { icon: '👟', nome: 'Tênis', audio: 'audio/comandos/aila-arraste-tenis.mp3' },
  { icon: '👕', nome: 'Camisa', audio: 'audio/comandos/aila-arraste-camisa.mp3' },
  { icon: '✋', nome: 'Mão', audio: 'audio/comandos/aila-arraste-mao.mp3' },
  { icon: '🦶', nome: 'Pé', audio: 'audio/comandos/aila-arraste-pe.mp3' },
  { icon: '🌳', nome: 'Árvore', audio: 'audio/comandos/aila-arraste-arvore.mp3' },
  { icon: '🐶', nome: 'Cachorro', audio: 'audio/comandos/aila-arraste-cachorro.mp3' },
  { icon: '🐱', nome: 'Gato', audio: 'audio/comandos/aila-arraste-gato.mp3' },
  { icon: '🚗', nome: 'Carro', audio: 'audio/comandos/aila-arraste-carro.mp3' },
  { icon: '🪑', nome: 'Cadeira', audio: 'audio/comandos/aila-arraste-cadeira.mp3' },
  { icon: '🧸', nome: 'Brinquedo', audio: 'audio/comandos/aila-arraste-brinquedo.mp3' },
  { icon: '🍽️', nome: 'Prato', audio: 'audio/comandos/aila-arraste-prato.mp3' },
  { icon: '🚿', nome: 'Chuveiro', audio: 'audio/comandos/aila-arraste-chuveiro.mp3' },
  { icon: '📺', nome: 'Televisão', audio: 'audio/comandos/aila-arraste-televisao.mp3' },
  { icon: '⌚', nome: 'Relógio', audio: 'audio/comandos/aila-arraste-relogio.mp3' },
]

export default function Objetos() {
  const navigate = useNavigate()
  const vozRef = useRef(null)
  const musicRef = useRef(null)
  const errRef = useRef(null)
  const fimRef = useRef(null)
  const reinicioRef = useRef(null)

  const soundOn = localStorage.getItem('soundOn') !== 'false'
  const [itensDisponiveis, setItensDisponiveis] = useState([])
  const [objetivoAtual, setObjetivoAtual] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [alvoIcon, setAlvoIcon] = useState('')
  const [finalizado, setFinalizado] = useState(false)
  const [bloqueado, setBloqueado] = useState(true)

  const safePlay = useCallback((ref, src = null, onEnd = null) => {
    [vozRef, errRef, fimRef, reinicioRef].forEach(r => {
      if (r.current) {
        r.current.pause()
        r.current.currentTime = 0
      }
    })
    const audioEl = ref?.current
    if (!soundOn || !audioEl) {
      setBloqueado(false)
      onEnd?.()
      return
    }
    if (src) audioEl.src = src
    audioEl.play().then(() => {
      setBloqueado(true)
      audioEl.onended = () => {
        setBloqueado(false)
        onEnd?.()
      }
    }).catch(() => {
      setBloqueado(false)
      onEnd?.()
    })
  }, [soundOn])

  const sortearProximo = useCallback((listaAtual) => {
    if (listaAtual.length === 0) {
      setFinalizado(true)
      setMensagem('Parabéns! 🎉')
      safePlay(fimRef)
      return
    }
    const sorteado = listaAtual[Math.floor(Math.random() * listaAtual.length)]
    setObjetivoAtual(sorteado)
    setTimeout(() => safePlay(vozRef, sorteado.audio), 400)
  }, [safePlay])

  const iniciar = useCallback((reinicio = false) => {
    const listaEmbaralhada = [...ITENS_ORIGINAIS].sort(() => Math.random() - 0.5)
    setItensDisponiveis(listaEmbaralhada)
    setMensagem('')
    setAlvoIcon('')
    setFinalizado(false)

    if (musicRef.current && soundOn) {
      musicRef.current.volume = 0.1
      musicRef.current.play().catch(() => {})
    }

    if (reinicio) {
      safePlay(reinicioRef, null, () => sortearProximo(listaEmbaralhada))
    } else {
      safePlay(vozRef, 'audio/aila-intro.mp3', () => sortearProximo(listaEmbaralhada))
    }
  }, [safePlay, sortearProximo, soundOn])

  // CORREÇÃO DO ERRO DA IMAGEM: useEffect sem setState síncrono
  useEffect(() => {
    const timer = setTimeout(() => {
      iniciar()
    }, 100)
    
    return () => {
      clearTimeout(timer)
      const sons = [vozRef, musicRef, errRef, fimRef, reinicioRef]
      sons.forEach(ref => {
        if (ref.current) {
          ref.current.pause()
          ref.current.onended = null
        }
      })
    }
  }, [iniciar]) 

  const processarEscolha = (itemClicado) => {
    if (bloqueado || finalizado || !objetivoAtual) return

    const nomeNormalizado = itemClicado.nome.trim().toLowerCase()
    const objetivoNormalizado = objetivoAtual.nome.trim().toLowerCase()

    if (nomeNormalizado === objetivoNormalizado) {
      setBloqueado(true)
      setAlvoIcon(itemClicado.icon)
      setMensagem('Muito bem! ✨')

      safePlay(vozRef, 'audio/aila-muito-bem.mp3', () => {
        const novaLista = itensDisponiveis.filter(i => i.nome !== itemClicado.nome)
        setItensDisponiveis(novaLista)
        setAlvoIcon('')
        setMensagem('')
        sortearProximo(novaLista)
      })
    } else {
      setMensagem('Tente novamente! 🙂')
      safePlay(errRef)
    }
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

          <div className={`target-zone ${bloqueado ? 'locked' : ''}`}>
            <div className={`target-display ${alvoIcon ? 'pop-in' : ''}`}>
              {alvoIcon}
            </div>
          </div>

          <div className="grid-objetos">
            {itensDisponiveis.map(item => (
              <button
                key={item.nome}
                className="item-card-objetos"
                disabled={bloqueado}
                onClick={() => processarEscolha(item)}
              >
                {item.icon}
              </button>
            ))}
          </div>
          <div className="feedback-message">{mensagem}</div>
        </div>
      </main>

      <audio ref={vozRef} preload="auto" />
      <audio ref={musicRef} src="audio/musica-terapeutica.mp3" loop preload="auto" />
      <audio ref={errRef} src="audio/aila-tente-novamente.mp3" preload="auto" />
      <audio ref={fimRef} src="audio/aila-finalizacao.mp3" preload="auto" />
      <audio ref={reinicioRef} src="audio/aila-reinicio.mp3" preload="auto" />
    </div>
  )
}