import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

export const PAPER = new THREE.Color('#efebe4')

/**
 * One material for every artwork plane:
 *  - cover-fits the image to the plane
 *  - optional cylindrical bend (uBend = radius) for the roster ring
 *  - hover: colour returns, slight zoom + ripple
 *  - scroll velocity: flag-like bend + RGB split
 *  - depth fog towards the paper colour, near-camera fade
 */
const ArtMaterial = shaderMaterial(
  {
    uTex: null,
    uImgAspect: 1,
    uPlaneAspect: 1,
    uBend: 0,
    uHover: 0,
    uGray: 0.85,
    uDim: 0,
    uVel: 0,
    uTime: 0,
    uAlpha: 1,
    uPaper: PAPER,
    uFog: new THREE.Vector2(9, 26),
    uNear: new THREE.Vector2(0.4, 1.8),
  },
  /* glsl */ `
    uniform float uBend;
    uniform float uHover;
    uniform float uVel;
    uniform float uTime;
    varying vec2 vUv;
    varying float vDepth;
    void main() {
      vUv = uv;
      vec3 p = position;
      p.z += sin(p.x * 4.0 + uTime * 2.2) * 0.035 * uHover;
      p.z += sin(uv.y * 3.14159) * uVel * 0.25;
      p.y += sin(uv.x * 3.14159) * uVel * 0.12;
      if (uBend > 0.0) {
        float a = p.x / uBend;
        p.z += uBend - cos(a) * uBend;
        p.x = sin(a) * uBend;
      }
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vDepth = -mv.z;
      gl_Position = projectionMatrix * mv;
    }
  `,
  /* glsl */ `
    uniform sampler2D uTex;
    uniform float uImgAspect;
    uniform float uPlaneAspect;
    uniform float uHover;
    uniform float uGray;
    uniform float uDim;
    uniform float uVel;
    uniform float uAlpha;
    uniform vec3 uPaper;
    uniform vec2 uFog;
    uniform vec2 uNear;
    varying vec2 vUv;
    varying float vDepth;

    vec2 cover(vec2 uv) {
      float r = uPlaneAspect / uImgAspect;
      vec2 s = r > 1.0 ? vec2(1.0, 1.0 / r) : vec2(r, 1.0);
      return (uv - 0.5) * s + 0.5;
    }

    void main() {
      vec2 uv = cover(vUv);
      uv = (uv - 0.5) * (1.0 - 0.07 * uHover) + 0.5;
      float s = clamp(uVel, -1.0, 1.0) * 0.005;
      vec3 c = vec3(
        texture2D(uTex, uv + vec2(s, 0.0)).r,
        texture2D(uTex, uv).g,
        texture2D(uTex, uv - vec2(s, 0.0)).b
      );
      float g = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(c, vec3(g) * vec3(1.02, 1.0, 0.96), uGray * (1.0 - uHover));
      c = mix(c, uPaper, uDim);
      c = mix(c, uPaper, smoothstep(uFog.x, uFog.y, vDepth));
      float near = smoothstep(uNear.x, uNear.y, vDepth);
      gl_FragColor = vec4(c, uAlpha * near);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
)

extend({ ArtMaterial })

export function prepTexture(tex, gl) {
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.needsUpdate = true
  return tex
}

export const aspectOf = (tex) => (tex?.image ? tex.image.width / tex.image.height : 1)
