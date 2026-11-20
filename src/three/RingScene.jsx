import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { ARTISTS } from '../data'
import { store } from '../store'
import { scrollState, lenis } from '../lib/scroll'
import { prepTexture, aspectOf, PAPER } from './ArtMaterial'

const N = ARTISTS.length
const CARD_W = 1.5
const CARD_H = 2.0
const GAP = 0.32
const R = (N * (CARD_W + GAP)) / (Math.PI * 2)
const STEP = (Math.PI * 2) / N

/**
 * A panoramic ring of artists that surrounds the camera.
 * Rotation = page scroll (pinned section) + drag offset with inertia.
 * Reports the front-most artist through onActive.
 */
export default function RingScene({ progress, drag, filter, onActive }) {
  const { gl, camera, size } = useThree()
  const textures = useTexture(ARTISTS.map((a) => a.cover))
  useMemo(() => textures.forEach((t) => prepTexture(t, gl)), [textures, gl])
  useEffect(() => store.set((s) => ({ scenesReady: s.scenesReady + 1 })), [])

  const group = useRef()
  const meshes = useRef([])
  const hovered = useRef(-1)
  const rot = useRef(0)
  const lastActive = useRef(-1)

  useEffect(() => {
    camera.fov = size.width < 700 ? 62 : 44
    camera.updateProjectionMatrix()
  }, [size.width, camera])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    // inertia on drag
    drag.current.offset += drag.current.velocity
    drag.current.velocity *= 0.92
    const raw = progress.current * (N - 1) * STEP + drag.current.offset
    // once scrolling and dragging settle, glide to the nearest artist so one is always centred
    const idle = !lenis.isScrolling && Math.abs(drag.current.velocity) < 0.0015 && !drag.current.down
    const target = idle ? Math.round(raw / STEP) * STEP : raw
    const prev = rot.current
    rot.current = THREE.MathUtils.damp(rot.current, target, 5, dt)
    group.current.rotation.y = rot.current
    const spin = (rot.current - prev) / Math.max(dt, 1e-3)
    const vel = THREE.MathUtils.clamp(spin * 0.07, -0.45, 0.45)

    // gentle camera breathing + pointer parallax
    camera.position.x = THREE.MathUtils.damp(camera.position.x, state.pointer.x * 0.25, 3, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, state.pointer.y * 0.18, 3, dt)
    camera.lookAt(0, 0, -R)

    const active = ((Math.round(rot.current / STEP) % N) + N) % N
    if (active !== lastActive.current) {
      lastActive.current = active
      onActive(active)
    }

    meshes.current.forEach((m, i) => {
      if (!m) return
      const u = m.material.uniforms
      const a = ARTISTS[i]
      const match = filter === 'All' || a.tags.includes(filter)
      // angular distance from the front of the ring
      let d = i * STEP - rot.current
      d = Math.atan2(Math.sin(d), Math.cos(d))
      const front = 1 - Math.min(Math.abs(d) / (STEP * 2.2), 1)
      u.uTime.value = t
      u.uVel.value = THREE.MathUtils.damp(u.uVel.value, vel, 6, dt)
      u.uHover.value = THREE.MathUtils.damp(u.uHover.value, hovered.current === i ? 1 : front * 0.85, 6, dt)
      u.uDim.value = THREE.MathUtils.damp(u.uDim.value, match ? 0 : 0.82, 5, dt)
      m.position.y = -0.18 + Math.sin(t * 0.5 + i) * 0.04
    })
  })

  return (
    <group ref={group}>
      {ARTISTS.map((a, i) => {
        const angle = i * STEP
        const x = Math.sin(angle) * R
        const z = -Math.cos(angle) * R
        return (
          <mesh
            key={a.slug}
            ref={(m) => {
              meshes.current[i] = m
              if (m) m.lookAt(0, 0, 0)
            }}
            position={[x, -0.18, z]}
            onPointerOver={(e) => {
              e.stopPropagation()
              hovered.current = i
              store.set({ cursor: a.name })
            }}
            onPointerOut={() => {
              if (hovered.current === i) hovered.current = -1
              store.set({ cursor: null })
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (drag.current.moved > 6) return
              store.set({ selected: a.slug, cursor: null })
            }}
          >
            <planeGeometry args={[CARD_W, CARD_H, 32, 8]} />
            <artMaterial
              uTex={textures[i]}
              uImgAspect={aspectOf(textures[i])}
              uPlaneAspect={CARD_W / CARD_H}
              uBend={R}
              uGray={0.9}
              uPaper={PAPER}
              uFog={[R + 1.5, R * 2.2]}
              uNear={[0, 0.01]}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export { N as RING_COUNT, STEP as RING_STEP }
