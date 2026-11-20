import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { ARTISTS } from '../data'
import { store } from '../store'
import { scrollState } from '../lib/scroll'
import { prepTexture, aspectOf, PAPER } from './ArtMaterial'

// Deterministic pseudo-random so the layout never jumps between reloads
const rand = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const START_Z = 7
const END_Z = -12.5

/** A tunnel of artworks — "the Machas Artist Network" — that the camera flies through on scroll. */
export default function NetworkScene({ progress }) {
  const { gl, camera, size } = useThree()
  const textures = useTexture(ARTISTS.map((a) => a.cover))
  useMemo(() => textures.forEach((t) => prepTexture(t, gl)), [textures, gl])
  useEffect(() => store.set((s) => ({ scenesReady: s.scenesReady + 1 })), [])

  const mobile = size.width < 700
  const layout = useMemo(
    () =>
      ARTISTS.map((a, i) => {
        const angle = i * 2.399963 + 0.6 // golden angle spiral
        const r = 2.3 + rand(i) * 1.3
        const h = 1.05 + rand(i + 50) * 0.55
        return {
          pos: new THREE.Vector3(
            Math.cos(angle) * r * (mobile ? 0.75 : 1.45),
            Math.sin(angle) * r * (mobile ? 1.15 : 0.78),
            2.2 - i * 1.35
          ),
          h,
          tilt: (rand(i + 9) - 0.5) * 0.25,
          phase: rand(i + 3) * Math.PI * 2,
        }
      }),
    [mobile]
  )

  // Network threads between neighbouring artists
  const lines = useMemo(() => {
    const pts = []
    layout.forEach((l, i) => {
      ;[1, 2, 3].forEach((k) => {
        const j = i + k
        if (j < layout.length && (k < 3 || i % 2 === 0)) pts.push(l.pos, layout[j].pos)
      })
    })
    const g = new THREE.BufferGeometry().setFromPoints(pts)
    return g
  }, [layout])

  const dust = useMemo(() => {
    const n = 420
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (rand(i + 1000) - 0.5) * 14
      arr[i * 3 + 1] = (rand(i + 2000) - 0.5) * 9
      arr[i * 3 + 2] = 6 - rand(i + 3000) * 30
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [])

  const meshes = useRef([])
  const hovered = useRef(-1)
  const pointer = useRef({ x: 0, y: 0 })
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const p = progress.current
    const vel = THREE.MathUtils.clamp(scrollState.velocity / 40, -1, 1)

    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, state.pointer.x, 3, dt)
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, state.pointer.y, 3, dt)

    const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
    const z = THREE.MathUtils.lerp(START_Z, END_Z, ease)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 6, dt)
    camera.position.x = pointer.current.x * 0.7
    camera.position.y = pointer.current.y * 0.45
    look.set(pointer.current.x * 0.25, pointer.current.y * 0.15, camera.position.z - 6)
    camera.lookAt(look)
    camera.rotation.z = Math.sin(t * 0.15) * 0.015 + ease * 0.2

    meshes.current.forEach((m, i) => {
      if (!m) return
      const l = layout[i]
      m.position.y = l.pos.y + Math.sin(t * 0.6 + l.phase) * 0.08
      m.rotation.z = l.tilt + Math.sin(t * 0.4 + l.phase) * 0.02
      // Face the camera gently as it passes so planes never go edge-on
      m.rotation.y = THREE.MathUtils.damp(m.rotation.y, -l.pos.x * 0.06, 4, dt)
      const u = m.material.uniforms
      u.uTime.value = t
      u.uVel.value = THREE.MathUtils.damp(u.uVel.value, vel, 5, dt)
      u.uHover.value = THREE.MathUtils.damp(u.uHover.value, hovered.current === i ? 1 : 0, 6, dt)
      const target = hovered.current === i ? 1.08 : 1
      m.scale.setScalar(THREE.MathUtils.damp(m.scale.x, target, 6, dt))
    })
  })

  const over = (i) => (e) => {
    e.stopPropagation()
    hovered.current = i
    store.set({ cursor: `${ARTISTS[i].name}` })
  }
  const out = (i) => () => {
    if (hovered.current === i) hovered.current = -1
    store.set({ cursor: null })
  }

  return (
    <>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#1a1a1a" transparent opacity={0.16} />
      </lineSegments>
      <points geometry={dust}>
        <pointsMaterial color="#1a1a1a" size={0.018} sizeAttenuation transparent opacity={0.45} />
      </points>
      {layout.map((l, i) => {
        const aspect = aspectOf(textures[i])
        const w = l.h * Math.min(aspect, 1.6)
        return (
          <mesh
            key={ARTISTS[i].slug}
            ref={(m) => (meshes.current[i] = m)}
            position={l.pos}
            onPointerOver={over(i)}
            onPointerOut={out(i)}
            onClick={(e) => {
              e.stopPropagation()
              store.set({ selected: ARTISTS[i].slug, cursor: null })
            }}
          >
            <planeGeometry args={[w, l.h, 24, 24]} />
            <artMaterial
              uTex={textures[i]}
              uImgAspect={aspect}
              uPlaneAspect={w / l.h}
              uPaper={PAPER}
              transparent
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </>
  )
}
