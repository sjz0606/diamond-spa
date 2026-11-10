/* Diamond SPA — WebGL motion on real footage: hero water ripples over video, steam-dissolve scroll scenes */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const DS = window.DS || {};

/* Plays the plain <video> only while visible (fallback path) */
function heroVideoOnly() {
  const v = document.getElementById('heroVideo');
  if (DS.reduce) return; // poster only
  new IntersectionObserver(([en]) => { en.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold: .1 }).observe(v);
}

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const NOISE = `
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=.5; } return v; }
vec2 cover(vec2 uv, vec2 res, vec2 img){ float rs=res.x/res.y, ri=img.x/img.y;
  vec2 s = rs>ri ? vec2(1., ri/rs) : vec2(rs/ri, 1.); return (uv-.5)*s+.5; }
`;

function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}

/* ---------------- HERO: rippling water surface over the real massage video ---------------- */
function initHero() {
  const canvas = document.getElementById('heroGL');
  const video = document.getElementById('heroVideo');
  const box = document.getElementById('heroArch');
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const cam = new THREE.Camera();
  const vtex = new THREE.VideoTexture(video); vtex.colorSpace = THREE.SRGBColorSpace;
  const poster = new THREE.TextureLoader().load(video.poster); poster.colorSpace = THREE.SRGBColorSpace;
  const MAXR = 10;
  const uni = {
    uTex: { value: poster }, uRes: { value: new THREE.Vector2(1, 1) }, uImg: { value: new THREE.Vector2(720, 1280) },
    uTime: { value: 0 }, uRip: { value: Array.from({ length: MAXR }, () => new THREE.Vector4(0, 0, -99, 0)) },
    uPtr: { value: new THREE.Vector2(.5, .5) }, uIn: { value: 0 }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni, vertexShader: VERT,
    fragmentShader: `precision highp float; varying vec2 vUv;
      uniform sampler2D uTex; uniform vec2 uRes, uImg, uPtr; uniform float uTime, uIn; uniform vec4 uRip[${MAXR}];
      ${NOISE}
      void main(){
        vec2 uv = vUv; float asp = uRes.x/uRes.y;
        vec2 disp = vec2(0.); float crest = 0.;
        for(int i=0;i<${MAXR};i++){
          vec4 r = uRip[i]; float age = uTime - r.z; if(age<0. || age>4.) continue;
          vec2 d = uv - r.xy; d.x *= asp; float dist = length(d);
          float front = age*.42;
          float w = sin((dist-front)*46.) * exp(-abs(dist-front)*9.) * exp(-age*1.1) * r.w;
          disp += normalize(d+1e-4) * w * .018; crest += w;
        }
        // slow surface swell + parallax toward pointer
        float sw = fbm(uv*3. + vec2(uTime*.05, -uTime*.03));
        disp += (vec2(sw, fbm(uv*3.2 - uTime*.04)) - .5) * .012;
        disp += (uPtr - .5) * .018 * vec2(1.,-1.) * (1. - uv.y*.4);
        vec2 tuv = cover(uv + disp, uRes, uImg);
        tuv = (tuv - .5) * .84 + .5 + vec2(0., .08); // overscan, keeps the baked-in watermark out of frame
        vec3 col = texture2D(uTex, tuv).rgb;
        // caustic light dancing on top
        vec2 cp = uv*vec2(asp,1.)*5.;
        float c = fbm(cp + vec2(uTime*.18, uTime*.11)); c = pow(1. - abs(c - fbm(cp*1.3 - uTime*.14)), 18.);
        col += vec3(.50,.83,.86) * c * .07 * (.4 + .6*uv.y);
        col += vec3(.75,.95,1.) * clamp(crest,0.,1.) * .10;
        // pool-night grade: lift shadows to teal, keep skin warm
        float l = dot(col, vec3(.299,.587,.114));
        col = mix(col, col*vec3(.86,1.,1.04) + vec3(0.,.02,.035), (1.-l)*.55);
        float vg = smoothstep(1.15, .35, length((uv-.5)*vec2(1.,1.25)));
        col *= mix(.55, 1., vg);
        col = mix(vec3(.043,.165,.2), col, uIn);
        gl_FragColor = vec4(col, 1.);
      }`
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  let ri = 0;
  const addRipple = (x, y, s) => { uni.uRip.value[ri % MAXR].set(x, y, uni.uTime.value, s); ri++; };
  let lastMove = 0;
  const pos = e => { const b = canvas.getBoundingClientRect(); return [(e.clientX - b.left) / b.width, 1 - (e.clientY - b.top) / b.height]; };
  canvas.addEventListener('pointerdown', e => { const [x, y] = pos(e); addRipple(x, y, 1.); });
  canvas.addEventListener('pointermove', e => {
    const [x, y] = pos(e); uni.uPtr.value.set(x, y);
    const now = performance.now(); if (e.pointerType === 'mouse' && now - lastMove > 140) { lastMove = now; addRipple(x, y, .35); }
  });
  canvas.addEventListener('pointerleave', () => uni.uPtr.value.set(.5, .5));

  function resize() {
    const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); uni.uRes.value.set(w, h);
  }
  new ResizeObserver(resize).observe(box); resize();

  video.addEventListener('playing', () => { uni.uTex.value = vtex; uni.uImg.value.set(video.videoWidth || 720, video.videoHeight || 1280); }, { once: true });

  let visible = false, raf = 0; const clock = new THREE.Clock();
  let auto = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, clock.getDelta()); uni.uTime.value += dt;
    uni.uIn.value = Math.min(1, uni.uIn.value + dt * .9);
    // occasional "drop" so the surface reads as water even without input
    auto -= dt; if (auto <= 0) { auto = 3.2 + Math.random() * 2.4; addRipple(.25 + Math.random() * .5, .3 + Math.random() * .45, .55); }
    renderer.render(scene, cam);
  }
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) { video.play().catch(() => {}); if (!raf) { clock.getDelta(); frame(); } }
    else { video.pause(); cancelAnimationFrame(raf); raf = 0; }
  }, { threshold: .02 }).observe(box);
  addRipple(.5, .55, 1.);
  document.documentElement.classList.add('gl-on');
}

/* ---------------- STEAM: scroll-driven scenes with steam dissolve + heat haze + depth push ---------------- */
function initSteam() {
  const canvas = document.getElementById('steamGL');
  const sec = document.getElementById('steam');
  const srcs = ['media/p/DdwD6uwsmZI.jpg', 'media/p/DaLL5vPsbMr.jpg', 'media/vp/DYuS-m4MJ5i_1.jpg', 'media/p/DXmTYY6jBxz.jpg'];
  // focal point per photo (where the subject sits), used for cover-crop on wide screens
  const focus = [[.5, .45], [.42, .5], [.5, .58], [.5, .62]];
  const tints = [[1.0, .78, .55], [1.0, .74, .5], [.92, .96, 1.0], [.55, .86, .92]];
  let renderer = null, scene, cam, uni, texs = [], raf = 0, visible = false, started = false;

  function start() {
    if (started) return; started = true;
    renderer = makeRenderer(canvas);
    scene = new THREE.Scene(); cam = new THREE.Camera();
    const L = new THREE.TextureLoader();
    texs = srcs.map(s => { const t = L.load(s, () => { t.userData.ok = true; }); t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; return t; });
    uni = {
      uA: { value: texs[0] }, uB: { value: texs[1] }, uMix: { value: 0 }, uLocal: { value: 0 },
      uFA: { value: new THREE.Vector2(...focus[0]) }, uFB: { value: new THREE.Vector2(...focus[1]) },
      uTA: { value: new THREE.Vector3(...tints[0]) }, uTB: { value: new THREE.Vector3(...tints[1]) },
      uRes: { value: new THREE.Vector2(1, 1) }, uImg: { value: new THREE.Vector2(720, 1280) },
      uTime: { value: 0 }, uPtr: { value: new THREE.Vector2(0, 0) }, uHeat: { value: 1 }
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: uni, vertexShader: VERT,
      fragmentShader: `precision highp float; varying vec2 vUv;
        uniform sampler2D uA, uB; uniform vec2 uRes, uImg, uFA, uFB, uPtr; uniform vec3 uTA, uTB;
        uniform float uMix, uLocal, uTime, uHeat;
        ${NOISE}
        vec2 coverF(vec2 uv, vec2 f, float zoom){
          float rs=uRes.x/uRes.y, ri=uImg.x/uImg.y;
          vec2 s = rs>ri ? vec2(1., ri/rs) : vec2(rs/ri, 1.);
          vec2 c = mix(vec2(.5), f, rs>ri ? vec2(0.,1.) : vec2(1.,0.)); // shift crop toward subject on the cropped axis
          c = clamp(c, s*.5/zoom, 1.-s*.5/zoom);
          return (uv-.5)*s/zoom + c;
        }
        // pseudo-depth from luminance: brighter (lamps, steam) floats forward
        vec3 sampleDepth(sampler2D t, vec2 uv, vec2 f, float zoom, vec2 par){
          vec2 base = coverF(uv, f, zoom);
          float d = dot(texture2D(t, base).rgb, vec3(.33));
          return texture2D(t, base + par*(d-.5)*.03).rgb;
        }
        // landscape screens: the vertical photo lives in an arch-shaped frame (hammam arch motif),
        // the rest of the screen is the same photo, blurred and dimmed like steam on glass
        vec3 scene(sampler2D t, vec2 uv, vec2 f, float zoom, vec2 par){
          float rs=uRes.x/uRes.y, ri=uImg.x/uImg.y;
          vec3 full = sampleDepth(t, vec2(uv.x*.88+.06, uv.y*.88+.12), f, zoom, par); // crop baked-in watermark
          float fh=.84; float fw=fh*ri/rs; vec2 c=vec2(.67,.47);
          vec2 q=(uv-c)/vec2(fw,fh)+.5;
          vec2 pp=(q-.5)*vec2(fw*rs, fh); float hw=fw*rs*.5; float cy=fh*.5-hw;
          float e=.0025;
          float inArch = pp.y<cy ? 1. : smoothstep(hw, hw-e, length(pp-vec2(0.,cy)));
          float inside = smoothstep(-hw, -hw+e, pp.x)*smoothstep(hw, hw-e, pp.x)*smoothstep(-fh*.5, -fh*.5+e, pp.y)*inArch;
          vec2 qz=(q-.5)/zoom+.5 + par*vec2(.006,.004);
          float d = dot(texture2D(t, qz).rgb, vec3(.33));
          vec3 fg = texture2D(t, qz + par*(d-.5)*.02).rgb;
          vec2 bc = coverF(uv, f, 1.25); vec3 bg=vec3(0.);
          for(int i=0;i<12;i++){ float a=float(i)*2.39996; float r=.012+.0045*float(i); bg+=texture2D(t, bc+vec2(cos(a),sin(a))*r).rgb; }
          bg = bg/12.*.34;
          return rs < .9 ? full : mix(bg, fg, inside);
        }
        void main(){
          vec2 uv = vUv;
          float t = uTime;
          // heat haze: rising wobble, stronger near the bottom & during transitions
          float haze = (fbm(vec2(uv.x*6., uv.y*3. - t*.6)) - .5);
          float tr = sin(uMix*3.14159);
          vec2 hz = vec2(haze*.012, haze*.006) * (uHeat*(1.-uv.y)*.8 + tr*1.4);
          vec2 par = uPtr + vec2(0., (uLocal-.5)*.6);
          float zA = 1.02 + uLocal*.06;      // slow dolly-in on the current scene
          float zB = 1.1 - uMix*.08;
          vec3 a = scene(uA, uv+hz, uFA, zA, par) * mix(vec3(1.), uTA, .14);
          vec3 b = scene(uB, uv+hz, uFB, zB, par) * mix(vec3(1.), uTB, .14);
          // steam dissolve: B condenses out of rising vapour
          float n = fbm(uv*vec2(2.4,1.6) + vec2(0., -t*.12)) * .75 + (1.-uv.y)*.35;
          float m = smoothstep(n-.12, n+.12, uMix*1.3 - .1);
          vec3 col = mix(a, b, m);
          // vapour layer
          float vap = fbm(uv*vec2(3.,2.) + vec2(t*.03, -t*.18));
          float fog = (tr*.55 + .12) * smoothstep(.35,.9,vap) * (1.-uv.y*.55);
          col = mix(col, vec3(.86,.9,.9), fog*.6);
          // grade + vignette (keeps text legible bottom-left)
          float vg = smoothstep(1.2,.3,length((uv-vec2(.55,.55))*vec2(1.,1.2)));
          col *= mix(.45, 1., vg);
          col *= mix(.6, 1., smoothstep(0.,.45, uv.y + (uv.x-.0)*.25));
          gl_FragColor = vec4(col, 1.);
        }`
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const pin = canvas.parentElement;
    const resize = () => { const w = pin.clientWidth, h = pin.clientHeight; renderer.setSize(w, h, false); uni.uRes.value.set(w, h); };
    new ResizeObserver(resize).observe(pin); resize();
    addEventListener('pointermove', e => { if (!visible) return; uni.uPtr.value.set((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * -2); }, { passive: true });
    loop();
  }
  let curIdx = -1, smooth = 0; const clock = new THREE.Clock();
  function loop() {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(.05, clock.getDelta()); uni.uTime.value += dt;
    smooth += ((DS.steamP || 0) - smooth) * Math.min(1, dt * 6);
    const p = Math.min(2.9999, Math.max(0, smooth));
    const i = Math.floor(p); let f = p - i;
    // hold each scene, transition in the middle third of the step
    const mixv = Math.min(1, Math.max(0, (f - .45) / .4));
    if (i !== curIdx) {
      curIdx = i;
      uni.uA.value = texs[i]; uni.uB.value = texs[Math.min(3, i + 1)];
      uni.uFA.value.set(...focus[i]); uni.uFB.value.set(...focus[Math.min(3, i + 1)]);
      uni.uTA.value.set(...tints[i]); uni.uTB.value.set(...tints[Math.min(3, i + 1)]);
      uni.uHeat.value = i === 3 ? .3 : 1;
    }
    uni.uMix.value = mixv; uni.uLocal.value = f;
    const img = uni.uA.value.image; if (img && img.width) uni.uImg.value.set(img.width, img.height);
    renderer.render(scene, cam);
  }
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) { start(); if (!raf) { clock.getDelta(); loop(); } }
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '200px 0px' }).observe(sec);
}

if (DS.useGL) { try { initHero(); } catch (e) { console.warn(e); } try { initSteam(); } catch (e) { console.warn(e); document.documentElement.classList.add('no-gl'); } }
else heroVideoOnly();
