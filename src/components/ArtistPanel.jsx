import { useEffect, useRef, useState } from 'react'
import { bySlug, ARTISTS, CONTACT } from '../data'
import { gsap, lenis } from '../lib/scroll'
import { store, useStore } from '../store'

export default function ArtistPanel() {
  const slug = useStore((s) => s.selected)
  const [shown, setShown] = useState(null)
  const root = useRef()

  useEffect(() => {
    if (slug) {
      setShown(slug)
      lenis.stop()
    } else if (shown) {
      gsap.to(root.current, {
        clipPath: 'inset(0 0 0 100%)',
        duration: 0.8,
        ease: 'expo.inOut',
        onComplete: () => {
          setShown(null)
          lenis.start()
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  useEffect(() => {
    if (!shown || !slug) return
    root.current.scrollTop = 0
    const tl = gsap.timeline()
    tl.fromTo(root.current, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1, ease: 'expo.inOut' })
    tl.fromTo(root.current.querySelectorAll('[data-in]'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.9, ease: 'power3.out' }, '-=0.45')
    return () => tl.kill()
  }, [shown, slug])

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && store.set({ selected: null })
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  if (!shown) return null
  const a = bySlug[shown]
  const idx = ARTISTS.indexOf(a)
  const next = ARTISTS[(idx + 1) % ARTISTS.length]

  return (
    <aside ref={root} className="panel" role="dialog" aria-modal="true" aria-label={a.name} data-lenis-prevent>
      <button className="panel__close" onClick={() => store.set({ selected: null })} aria-label="Close profile">
        Close <span>✕</span>
      </button>

      <div className="panel__grid">
        <div className="panel__info">
          <p className="eyebrow" data-in>
            Machas Artist — {String(idx + 1).padStart(2, '0')}
          </p>
          <h2 className="panel__name" data-in>
            {a.name}
          </h2>
          {a.memoriam && (
            <p className="panel__memoriam" data-in>
              In loving memory
            </p>
          )}
          <dl className="panel__facts" data-in>
            <div>
              <dt>Disciplines</dt>
              <dd>{a.tags.join(', ')}</dd>
            </div>
            {a.base && (
              <div>
                <dt>Based in</dt>
                <dd>{a.base}</dd>
              </div>
            )}
            {a.collabs.length > 0 && (
              <div>
                <dt>Selected collaborations</dt>
                <dd>{a.collabs.join(', ')}</dd>
              </div>
            )}
          </dl>
          <p className="panel__bio" data-in>
            {a.bio}
          </p>
          <div className="panel__cta" data-in>
            {!a.memoriam && (
              <a className="btn" href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Commission enquiry — ${a.name}`)}`}>
                Commission {a.name.split(' ')[0]} <span aria-hidden>→</span>
              </a>
            )}
            <button className="link" onClick={() => store.set({ selected: next.slug })}>
              Next: {next.name}
            </button>
          </div>
        </div>

        <div className="panel__works">
          {a.works.map((src, i) => (
            <figure key={src} data-in className={i === 0 ? 'is-wide' : ''}>
              <img src={src} alt={`${a.name} — selected work ${i + 1}`} loading="lazy" />
              <figcaption className="wm">Sample · Ayush Shukla</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </aside>
  )
}
