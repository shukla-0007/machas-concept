import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import NetworkScene from '../three/NetworkScene'
import { useInView, useSectionProgress } from '../lib/hooks'
import { gsap } from '../lib/scroll'
import { useStore } from '../store'
import { ARTISTS } from '../data'

export default function Hero() {
  const section = useRef()
  const wordmark = useRef()
  const intro = useRef()
  const caption = useRef()
  const inView = useInView(section)
  const ready = useStore((s) => s.ready)

  const progress = useSectionProgress(section, {
    onUpdate: (p) => {
      // DOM choreography tied to the fly-through
      const w = Math.min(p / 0.22, 1)
      gsap.set(wordmark.current, { opacity: 1 - w, scale: 1 + w * 0.35, filter: `blur(${w * 10}px)` })
      gsap.set(intro.current, { opacity: 1 - Math.min(p / 0.12, 1), y: -p * 120 })
      const c = p < 0.32 ? 0 : p < 0.45 ? (p - 0.32) / 0.13 : p < 0.72 ? 1 : Math.max(1 - (p - 0.72) / 0.12, 0)
      gsap.set(caption.current, { opacity: c, y: (1 - c) * 30 })
    },
  })

  useLayoutEffect(() => {
    gsap.set(wordmark.current.querySelectorAll('span'), { yPercent: 110 })
  }, [])

  useEffect(() => {
    if (!ready) return
    gsap.fromTo(
      wordmark.current.querySelectorAll('span'),
      { yPercent: 110 },
      { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.06, delay: 0.15 }
    )
    gsap.fromTo(
      intro.current.children,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08, delay: 0.6 }
    )
  }, [ready])

  return (
    <section ref={section} className="hero" id="top">
      <div className="hero__stage">
        <Canvas
          className="hero__canvas"
          flat
          dpr={[1, 1.75]}
          frameloop={inView ? 'always' : 'never'}
          camera={{ position: [0, 0, 7], fov: 50, near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <NetworkScene progress={progress} />
          </Suspense>
        </Canvas>

        <h1 ref={wordmark} className="hero__wordmark" aria-label="Machas">
          {'MACHAS'.split('').map((l, i) => (
            <i key={i}>
              <span>{l}</span>
            </i>
          ))}
        </h1>

        <div ref={intro} className="hero__intro">
          <p className="eyebrow">Creative consultancy &amp; artist representation</p>
          <p className="hero__lede">
            The expertise of an artist management agency, <em>with the mind of a brand specialist.</em>
          </p>
          <div className="hero__meta">
            <span>London — Est. 2011</span>
            <span>{ARTISTS.length} represented artists</span>
            <span className="hero__scroll">
              Scroll to enter the network <b />
            </span>
          </div>
        </div>

        <div ref={caption} className="hero__caption">
          <p className="eyebrow">The Machas Artist Network</p>
          <p className="display">
            Every frame is a <em>voice.</em>
            <br />
            Hover to meet them.
          </p>
        </div>
      </div>
    </section>
  )
}
