import { Suspense, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import RingScene, { RING_COUNT } from '../three/RingScene'
import { useInView, useSectionProgress } from '../lib/hooks'
import { lenis } from '../lib/scroll'
import { ARTISTS, DISCIPLINES } from '../data'
import { store, useStore } from '../store'

export default function Roster() {
  const section = useRef()
  const inView = useInView(section)
  const progress = useSectionProgress(section)
  const drag = useRef({ offset: 0, velocity: 0, down: false, x: 0, moved: 0 })
  const [active, setActive] = useState(0)
  const filter = useStore((s) => s.filter)
  const a = ARTISTS[active]

  // Scroll the page so the ring brings artist i to the front
  const goTo = (i) => {
    const el = section.current
    const top = el.offsetTop
    const span = el.offsetHeight - window.innerHeight
    drag.current.offset = 0
    drag.current.velocity = 0
    lenis.scrollTo(top + (i / (RING_COUNT - 1)) * span, { duration: 1.6 })
  }

  const pickFilter = (d) => {
    store.set({ filter: d })
    if (d === 'All') return
    const first = ARTISTS.findIndex((x) => x.tags.includes(d))
    if (first >= 0) goTo(first)
  }

  const onDown = (e) => {
    drag.current.down = true
    drag.current.x = e.clientX
    drag.current.moved = 0
  }
  const onMove = (e) => {
    if (!drag.current.down) return
    const dx = e.clientX - drag.current.x
    drag.current.x = e.clientX
    drag.current.moved += Math.abs(dx)
    drag.current.velocity = -dx * 0.0016
  }
  const onUp = () => (drag.current.down = false)

  return (
    <section ref={section} className="roster" id="talent">
      <div className="roster__stage">
        <div
          className="roster__canvas"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          <Canvas flat dpr={[1, 1.75]} frameloop={inView ? 'always' : 'never'} camera={{ position: [0, 0, 1.2], fov: 44, near: 0.1, far: 40 }}>
            <Suspense fallback={null}>
              <RingScene progress={progress} drag={drag} filter={filter} onActive={setActive} />
            </Suspense>
          </Canvas>
        </div>

        <header className="roster__head">
          <div>
            <p className="eyebrow">Talent — the roster</p>
            <h2 className="display">
              Carefully selected. <em>Proactively</em> championed.
            </h2>
          </div>
          <nav className="chips" aria-label="Filter by discipline">
            {DISCIPLINES.map((d) => (
              <button key={d} className={d === filter ? 'chip is-on' : 'chip'} onClick={() => pickFilter(d)}>
                {d}
              </button>
            ))}
          </nav>
        </header>

        <footer className="roster__foot">
          <div className="roster__count">
            <b>{String(active + 1).padStart(2, '0')}</b> / {String(RING_COUNT).padStart(2, '0')}
          </div>
          <div className="roster__name" key={a.slug}>
            <h3>{a.name}</h3>
            <p>
              {a.tags.join(' · ')}
              {a.base ? <span> — {a.base}</span> : null}
            </p>
          </div>
          <button className="btn" onClick={() => store.set({ selected: a.slug })}>
            View profile <span aria-hidden>→</span>
          </button>
        </footer>
        <p className="roster__hint">Scroll or drag to explore</p>
      </div>

      {/* Accessible / no-WebGL index */}
      <ul className="sr-only">
        {ARTISTS.map((x) => (
          <li key={x.slug}>
            <button onClick={() => store.set({ selected: x.slug })}>{x.name}</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
