import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { gsap, lenis } from '../lib/scroll'
import { store, useStore } from '../store'

export function Loader() {
  const { progress: texProgress } = useProgress()
  const scenes = useStore((s) => s.scenesReady)
  const complete = scenes >= 2
  const progress = complete ? 100 : Math.min(99, Math.max(texProgress, scenes * 50))
  const [shown, setShown] = useState(0)
  const root = useRef()
  const done = useRef(false)
  const counter = useRef({ v: 0 })

  useEffect(() => {
    if (done.current) return
    lenis.stop()
    const tw = gsap.to(counter.current, {
      v: progress,
      duration: complete ? 0.5 : 0.9,
      ease: 'power2.out',
      onUpdate: () => setShown(Math.round(counter.current.v)),
    })
    return () => tw.kill()
  }, [progress, complete])

  useEffect(() => {
    if (done.current || !complete || shown < 100) return
    done.current = true
    gsap
      .timeline({ delay: 0.5 })
      .to(root.current.querySelector('.loader__inner'), { yPercent: -30, opacity: 0, duration: 0.8, ease: 'power3.in' })
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.3')
      .add(() => {
        store.set({ ready: true })
        lenis.start()
      }, '-=0.6')
      .set(root.current, { display: 'none' })
  }, [complete, shown])

  // safety net: never trap the visitor behind the loader
  useEffect(() => {
    const t = setTimeout(() => {
      if (!done.current) {
        done.current = true
        store.set({ ready: true })
        lenis.start()
        gsap.to(root.current, { autoAlpha: 0, duration: 0.6 })
      }
    }, 15000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div ref={root} className="loader" style={{ clipPath: 'inset(0 0 0% 0)' }}>
      <div className="loader__inner">
        <p className="eyebrow">Machas Artist Network</p>
        <div className="loader__count">{String(shown).padStart(3, '0')}</div>
        <div className="loader__bar">
          <i style={{ transform: `scaleX(${shown / 100})` }} />
        </div>
        <p className="loader__sample">
          A sample concept by <em>Ayush Shukla</em>
        </p>
      </div>
    </div>
  )
}

export function Cursor() {
  const dot = useRef()
  const ring = useRef()
  const label = useStore((s) => s.cursor)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const xd = gsap.quickTo(dot.current, 'x', { duration: 0.12 })
    const yd = gsap.quickTo(dot.current, 'y', { duration: 0.12 })
    const xr = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3' })
    const yr = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3' })
    const move = (e) => {
      xd(e.clientX)
      yd(e.clientY)
      xr(e.clientX)
      yr(e.clientY)
    }
    const over = (e) => {
      const hot = e.target.closest('a, button')
      ring.current.classList.toggle('is-link', !!hot)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', over)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
    }
  }, [])

  return (
    <div className="cursor" aria-hidden>
      <div ref={dot} className="cursor__dot" />
      <div ref={ring} className={label ? 'cursor__ring is-label' : 'cursor__ring'}>
        <span>{label ? <>View <em>{label}</em></> : null}</span>
      </div>
    </div>
  )
}

export function Nav() {
  const ref = useRef()
  useEffect(() => {
    let last = 0
    const off = lenis.on('scroll', ({ scroll }) => {
      const down = scroll > last && scroll > 200
      ref.current.classList.toggle('is-hidden', down && !store.get().selected)
      ref.current.classList.toggle('is-solid', scroll > 80)
      last = scroll
    })
    return off
  }, [])
  const go = (id) => (e) => {
    e.preventDefault()
    lenis.scrollTo(id, { duration: 1.6 })
  }
  return (
    <header ref={ref} className="nav">
      <a href="#top" className="nav__logo" onClick={go('#top')}>
        MACHAS
      </a>
      <nav className="nav__links">
        <a href="#talent" onClick={go('#talent')}>Talent</a>
        <a href="#services" onClick={go('#services')}>Consultancy</a>
        <a href="#work" onClick={go('#work')}>Work</a>
        <a href="#clients" onClick={go('#clients')}>Clients</a>
      </nav>
      <a href="#contact" className="btn btn--sm" onClick={go('#contact')}>
        Start a brief
      </a>
    </header>
  )
}
