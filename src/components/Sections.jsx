import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'
import { ARTISTS, CASES, CLIENTS, CLIENT_COUNT, CONTACT, SERVICES, bySlug } from '../data'
import { store } from '../store'

/* ——— Manifesto: words ink in as you scroll ——— */
export function Statement() {
  const ref = useRef()
  const text =
    'We give shape to your vision. Blurring the boundaries between creativity, communication and activation, Machas pairs the world’s most distinctive artists with brands ready to say something new.'
  useEffect(() => {
    const words = ref.current.querySelectorAll('.w')
    const tw = gsap.fromTo(
      words,
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top 75%', end: 'bottom 45%', scrub: true },
      }
    )
    return () => tw.scrollTrigger?.kill()
  }, [])
  return (
    <section className="statement" id="about">
      <p className="eyebrow">About Machas</p>
      <p ref={ref} className="statement__text">
        {text.split(' ').map((w, i) => (
          <span key={i} className={i < 5 ? 'w is-em' : 'w'}>
            {w}{' '}
          </span>
        ))}
      </p>
      <div className="stats">
        <Stat n={2011} label="Founded in London" plain />
        <Stat n={ARTISTS.length} label="Represented artists" />
        <Stat n={CLIENT_COUNT} suffix="+" label="Brands served" />
        <Stat n={3} label="Services, one agency" />
      </div>
    </section>
  )
}

function Stat({ n, label, suffix = '', plain }) {
  const ref = useRef()
  useEffect(() => {
    const o = { v: plain ? n - 40 : 0 }
    const tw = gsap.to(o, {
      v: n,
      duration: 1.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%' },
      onUpdate: () => (ref.current.textContent = Math.round(o.v) + suffix),
    })
    return () => tw.scrollTrigger?.kill()
  }, [n, suffix, plain])
  return (
    <div className="stat">
      <b ref={ref}>0</b>
      <span>{label}</span>
    </div>
  )
}

/* ——— Services ——— */
export function Services() {
  const ref = useRef()
  useReveal(ref)
  return (
    <section ref={ref} className="services" id="services">
      <div className="section-head">
        <p className="eyebrow">Consultancy</p>
        <h2 className="display">
          One studio. <em>Every</em> creative discipline.
        </h2>
      </div>
      <div className="services__grid">
        {SERVICES.map((s) => (
          <article key={s.n} className="service" data-reveal>
            <span className="service__n">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <span className="service__line" />
          </article>
        ))}
      </div>
    </section>
  )
}

/* ——— Selected work: hover list with a floating image ——— */
export function Cases() {
  const ref = useRef()
  const float = useRef()
  const [hover, setHover] = useState(-1)
  useReveal(ref)

  useEffect(() => {
    const xTo = gsap.quickTo(float.current, 'x', { duration: 0.7, ease: 'power3' })
    const yTo = gsap.quickTo(float.current, 'y', { duration: 0.7, ease: 'power3' })
    const move = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useEffect(() => {
    gsap.to(float.current, { autoAlpha: hover >= 0 ? 1 : 0, scale: hover >= 0 ? 1 : 0.85, duration: 0.5, ease: 'power3.out' })
  }, [hover])

  return (
    <section ref={ref} className="cases" id="work">
      <div className="section-head">
        <p className="eyebrow">Selected work</p>
        <h2 className="display">
          Where artists meet <em>brands.</em>
        </h2>
      </div>
      <ul className="cases__list" onPointerLeave={() => setHover(-1)}>
        {CASES.map((c, i) => {
          const a = bySlug[c.artist]
          return (
            <li key={c.brand} data-reveal className={hover === i ? 'is-on' : hover >= 0 ? 'is-off' : ''}>
              <button onPointerEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => store.set({ selected: a.slug })}>
                <span className="cases__i">{String(i + 1).padStart(2, '0')}</span>
                <span className="cases__brand">{c.brand}</span>
                <span className="cases__title">
                  {c.title} <em>— {a.name}</em>
                </span>
                <span className="cases__type">{c.type}</span>
                <span className="cases__arrow" aria-hidden>
                  ↗
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <div ref={float} className="cases__float" aria-hidden>
        {CASES.map((c, i) => (
          <img key={i} src={bySlug[c.artist].works[c.img]} alt="" className={hover === i ? 'is-on' : ''} />
        ))}
        <span className="wm">Sample · Ayush Shukla</span>
      </div>
    </section>
  )
}

/* ——— Clients marquee ——— */
export function Clients() {
  const half = Math.ceil(CLIENTS.length / 2)
  const rows = [CLIENTS.slice(0, half), CLIENTS.slice(half)]
  return (
    <section className="clients" id="clients">
      <div className="section-head">
        <p className="eyebrow">Clients</p>
        <h2 className="display">
          Trusted by <em>{CLIENT_COUNT}+</em> brands worldwide.
        </h2>
      </div>
      {rows.map((r, k) => (
        <div key={k} className={k ? 'marquee marquee--rev' : 'marquee'}>
          <div className="marquee__track">
            {[...r, ...r].map((c, i) => (
              <span key={i}>
                {c}
                <i>✦</i>
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

/* ——— Contact / footer ——— */
export function Contact() {
  const ref = useRef()
  useEffect(() => {
    const tw = gsap.fromTo(
      ref.current.querySelectorAll('.contact__big span'),
      { yPercent: 105 },
      {
        yPercent: 0,
        stagger: 0.08,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 70%' },
      }
    )
    return () => tw.scrollTrigger?.kill()
  }, [])
  return (
    <footer ref={ref} className="contact" id="contact">
      <p className="eyebrow">Start a brief</p>
      <a className="contact__big" href={`mailto:${CONTACT.email}`}>
        <i><span>Give shape</span></i>
        <i><span>to your <em>vision.</em></span></i>
      </a>
      <div className="contact__cols">
        <div>
          <p className="eyebrow">Write</p>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </div>
        <div>
          <p className="eyebrow">Call</p>
          <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, '')}`}>{CONTACT.phone}</a>
        </div>
        <div>
          <p className="eyebrow">Visit</p>
          <span>{CONTACT.city}</span>
        </div>
        <div>
          <p className="eyebrow">Follow</p>
          <a href={CONTACT.instagram} target="_blank" rel="noreferrer">Instagram</a>{' '}
          <a href="https://vimeo.com/machas" target="_blank" rel="noreferrer">Vimeo</a>{' '}
          <a href="https://www.linkedin.com/company/machas/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
      <div className="contact__stripes" aria-hidden />
      <div className="contact__legal">
        <span>© {new Date().getFullYear()} Machas Ltd</span>
        <span className="contact__sample">
          Sample redesign concept by <em>Ayush Shukla</em> — not an official Machas website
        </span>
        <span>Part of a worldwide creative network</span>
      </div>
    </footer>
  )
}

/* fade-up for [data-reveal] children */
function useReveal(ref) {
  useEffect(() => {
    const els = ref.current.querySelectorAll('[data-reveal]')
    const st = ScrollTrigger.batch(els, {
      start: 'top 88%',
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, stagger: 0.08, duration: 1, ease: 'power3.out' }),
    })
    gsap.set(els, { opacity: 0, y: 40 })
    return () => st.forEach((s) => s.kill())
  }, [ref])
}
