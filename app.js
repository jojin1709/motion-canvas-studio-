// ==========================================
// FLUXFRAME STUDIO PRO — MASTER PROCEDURAL ENGINE
// ==========================================

// DOM Elements
const canvas = document.getElementById('renderCanvas');
const ctx = canvas.getContext('2d');
const titleInput = document.getElementById('titleInput');
const subtitleInput = document.getElementById('subtitleInput');
const badgeInput = document.getElementById('badgeInput');
const fontSelect = document.getElementById('fontSelect');
const motionSelect = document.getElementById('motionSelect');
const styleSelect = document.getElementById('styleSelect');
const durationSelect = document.getElementById('durationSelect');
const aspectSelect = document.getElementById('aspectSelect');
const alignSelect = document.getElementById('alignSelect');
const progressBar = document.getElementById('progressBar');
const progressHandle = document.getElementById('progressHandle');
const timelineWrap = document.getElementById('timelineWrap');
const timeLabel = document.getElementById('timeLabel');
const renderStatus = document.getElementById('renderStatus');
const resolutionBadge = document.getElementById('resolutionBadge');
const playBtn = document.getElementById('playBtn');
const playBtnText = document.getElementById('playBtnText');
const playIconWrap = document.getElementById('playIconWrap');
const restartBtn = document.getElementById('restartBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const exportBtnText = document.getElementById('exportBtnText');
const customColorPicker = document.getElementById('customColorPicker');
const logoUpload = document.getElementById('logoUpload');
const logoFileName = document.getElementById('logoFileName');
const removeLogoBtn = document.getElementById('removeLogoBtn');
const logoPosSelect = document.getElementById('logoPosSelect');
const audioToggle = document.getElementById('audioToggle');
const audioSoundSelect = document.getElementById('audioSoundSelect');
const audioStatusText = document.getElementById('audioStatusText');
const customAudioUpload = document.getElementById('customAudioUpload');
const customAudioLabel = document.getElementById('customAudioLabel');
const customAudioOption = document.getElementById('customAudioOption');
const speedSlider = document.getElementById('speedSlider');
const speedValueLabel = document.getElementById('speedValueLabel');
const grainToggle = document.getElementById('grainToggle');
const grainToggleKnob = document.getElementById('grainToggleKnob');
const snapshotBtn = document.getElementById('snapshotBtn');
const shareLinkBtn = document.getElementById('shareLinkBtn');
const aiPromptInput = document.getElementById('aiPromptInput');
const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const aiBtnLabel = document.getElementById('aiBtnLabel');
const quickPresetSelect = document.getElementById('quickPresetSelect');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// New Studio Feature DOM Elements
const textGradientSelect = document.getElementById('textGradientSelect');
const textGlowSelect = document.getElementById('textGlowSelect');
const particleSelect = document.getElementById('particleSelect');
const ctaSelect = document.getElementById('ctaSelect');
const voiceToggle = document.getElementById('voiceToggle');
const voiceStatusText = document.getElementById('voiceStatusText');
const voiceGenderSelect = document.getElementById('voiceGenderSelect');
const exportFormatSelect = document.getElementById('exportFormatSelect');
const sceneTabsWrap = document.getElementById('sceneTabsWrap');
const addSceneBtn = document.getElementById('addSceneBtn');
const deleteSceneBtn = document.getElementById('deleteSceneBtn');

// Cloudflare AI Modal Elements
const aiConfigModalBtn = document.getElementById('aiConfigModalBtn');
const aiConfigModal = document.getElementById('aiConfigModal');
const aiModalCard = document.getElementById('aiModalCard');
const closeAiModalBtn = document.getElementById('closeAiModalBtn');
const saveAiConfigBtn = document.getElementById('saveAiConfigBtn');
const cfAccountIdInput = document.getElementById('cfAccountIdInput');
const cfApiTokenInput = document.getElementById('cfApiTokenInput');

// Multi-Scene Storyboard Sequence State
let scenes = [
  {
    badge: 'FEATURE LAUNCH',
    title: 'DESIGN THE FUTURE',
    subtitle: 'High-fidelity procedural motion graphics in real-time',
    style: 'silk',
    accent: '#6366f1',
    font: 'Plus Jakarta Sans',
    motion: 'fade-rise',
    gradient: 'solid',
    glow: 26,
    particle: 'none',
    cta: 'none',
    duration: 5
  }
];
let activeSceneIdx = 0;
let voiceEnabled = false;
let lastSpokenSceneIdx = -1;

// Global State
let accent = '#6366f1';
let playing = true;
let startTime = performance.now();
let currentTime = 0;
let duration = 5;
let speed = 1.0;
let enableFilmGrain = false;
let textAlign = 'center';
let textGradient = 'solid';
let textGlow = 26;
let particleType = 'none';
let ctaBadge = 'none';
let raf;
let isScrubbing = false;
let userLogo = null;
let customAudioElement = null;
let audioEnabled = true;
let audioCtx = null;

// Procedural Particle System Pool
let particles = [];

// Cloudflare Settings (Client LocalStorage Only — 0% server storage)
let cfAccountId = localStorage.getItem('ff_cf_account_id') || '';
let cfApiToken = localStorage.getItem('ff_cf_api_token') || '';
if (cfAccountIdInput) cfAccountIdInput.value = cfAccountId;
if (cfApiTokenInput) cfApiTokenInput.value = cfApiToken;

// ==========================================
// 8 ADVANCED GLSL PROCEDURAL SHADERS
// ==========================================
const glCanvas = document.createElement('canvas');
const gl = glCanvas.getContext('webgl', { alpha: false, antialias: true, preserveDrawingBuffer: true });

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const shaders = {
  // 1. Silk Flow: Luxury organic fluid gradient mesh
  silk: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      float time = t * 0.45;
      vec2 q = vec2(
        p.x + sin(time * 0.7 + p.y * 2.2) * 0.28,
        p.y + cos(time * 0.6 + p.x * 2.4) * 0.28
      );
      
      float wave1 = sin(q.x * 3.8 + q.y * 3.0 + time * 1.2);
      float wave2 = cos(q.y * 4.2 - q.x * 3.4 - time * 0.9);
      float blend = (wave1 + wave2) * 0.5;

      vec3 bg = vec3(0.04, 0.05, 0.1);
      vec3 highlight = accent + vec3(0.15, 0.2, 0.28);
      vec3 secondary = vec3(0.06, 0.14, 0.25) + accent * 0.4;

      vec3 col = mix(bg, secondary, smoothstep(-0.8, 0.4, blend));
      col = mix(col, highlight, smoothstep(0.1, 0.9, blend) * 0.75);

      float centerGlow = exp(-length(p) * 1.7);
      col += accent * centerGlow * 0.25;
      col *= 1.0 - length(uv - 0.5) * 0.5;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 2. Solar Flare: Blazing fiery orange-gold rays & plasma
  solar: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      vec2 sunPos = vec2(0.0, -0.05);
      float dist = length(p - sunPos);
      float angle = atan(p.y - sunPos.y, p.x - sunPos.x);

      float rays1 = sin(angle * 14.0 + t * 0.8) * 0.5 + 0.5;
      float rays2 = cos(angle * 22.0 - t * 1.1) * 0.5 + 0.5;
      float rays = (rays1 + rays2) * 0.5;

      float core = 0.09 / (dist + 0.14);
      vec3 gold = vec3(0.98, 0.62, 0.12);
      vec3 fire = vec3(0.95, 0.22, 0.08);

      vec3 col = vec3(0.04, 0.015, 0.03);
      col += mix(fire, gold, dist * 1.8) * core * (0.8 + rays * 0.35);
      col += accent * exp(-dist * 3.0) * 0.5;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 3. Cosmic Aurora: Emerald & cyan northern lights ribbons with stardust
  aurora: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      float v = 0.0;
      for (int i = 0; i < 7; i++) {
        float fi = float(i);
        vec2 q = p * (1.1 + fi * 0.16);
        q += vec2(sin(t * 0.3 + fi * 1.2), cos(t * 0.35 - fi * 0.9)) * 0.09;
        v += 0.0045 / (abs(sin(q.x * 7.5 + q.y * 4.5 + t * (0.45 + fi * 0.06))) * 15.0 + length(q) * 6.5);
      }

      vec3 emerald = vec3(0.06, 0.75, 0.45);
      vec3 cyan = vec3(0.02, 0.65, 0.85);

      vec3 col = vec3(0.012, 0.02, 0.04);
      col += mix(emerald, cyan, sin(t * 0.5 + p.x * 2.0) * 0.5 + 0.5) * (v * 3.2);
      col += accent * exp(-length(p) * 2.5) * 0.3;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 4. Cyber Wave: Vibrant synthwave 3D neon grid
  cyber: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      vec3 col = vec3(0.02, 0.015, 0.04);
      float horizon = 0.03;

      if (p.y < horizon) {
        float depth = 0.18 / (horizon - p.y);
        vec2 grid = vec2(p.x * depth * 0.75, depth + t * 1.8);
        vec2 g = abs(fract(grid - 0.5) - 0.5);
        float line = min(g.x, g.y) * 24.0;
        float mask = 1.0 - min(line, 1.0);
        float fog = exp(-depth * 0.09);

        vec3 neonPink = vec3(0.95, 0.15, 0.65);
        vec3 neonCyan = vec3(0.0, 0.85, 0.95);
        col += mix(neonPink, neonCyan, sin(grid.x * 0.4) * 0.5 + 0.5) * mask * fog * 1.1;
      } else {
        float glow = exp(-abs(p.y - horizon) * 12.0);
        col += vec3(0.95, 0.15, 0.65) * glow * 0.55;
        
        float sunDist = length(p - vec2(0.0, horizon + 0.08));
        float sun = 0.03 / (sunDist + 0.06);
        col += vec3(0.98, 0.45, 0.1) * sun * 0.8;
      }

      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 5. Liquid Chrome: Reflective metallic mercury ripples
  chrome: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      float dist = length(p);
      float ripple = sin(dist * 18.0 - t * 3.0) * 0.5 + 0.5;
      ripple += cos(p.x * 12.0 + p.y * 10.0 + t * 1.5) * 0.25;

      vec3 metal = vec3(0.2, 0.24, 0.32);
      vec3 shine = vec3(0.9, 0.95, 1.0);

      vec3 col = mix(metal, shine, pow(ripple, 3.0) * 0.85);
      col += accent * (0.04 / (dist + 0.15));
      col *= 1.0 - dist * 0.6;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 6. Obsidian: Darkroom cinematic bokeh spheres
  obsidian: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      vec3 base = vec3(0.035, 0.04, 0.065);
      vec2 light1 = vec2(sin(t * 0.45) * 0.35, cos(t * 0.35) * 0.22);
      vec2 light2 = vec2(cos(t * 0.38) * 0.42, sin(t * 0.5) * 0.26);
      
      float d1 = length(p - light1);
      float d2 = length(p - light2);

      float glow1 = exp(-d1 * 2.4);
      float glow2 = exp(-d2 * 2.8);

      vec3 col = base;
      col += accent * (glow1 * 0.5 + glow2 * 0.4);
      col += vec3(0.08, 0.12, 0.18) * exp(-length(p) * 1.6);
      col *= 1.0 - length(uv - 0.5) * 0.48;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 7. Prism Glass: Refractive iridescent dispersion caustics
  prism: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      float dist = length(p);
      vec3 bg = vec3(0.03, 0.035, 0.06);
      
      float sweep = sin(p.x * 3.0 + p.y * 3.5 + t * 0.6) * 0.5 + 0.5;
      float ring = exp(-abs(dist - (0.42 + sin(t * 0.35) * 0.12)) * 3.8);

      vec3 prismCol = vec3(
        sin(sweep * 3.14 + 0.0) * 0.5 + 0.5,
        sin(sweep * 3.14 + 1.2) * 0.5 + 0.5,
        sin(sweep * 3.14 + 2.4) * 0.5 + 0.5
      );

      vec3 col = bg + mix(accent, prismCol, 0.45) * (sweep * 0.4 + ring * 0.45);
      col += accent * exp(-dist * 2.2) * 0.3;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 8. Warp Speed: Hyperspace streaking tunnel
  warp: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      float dist = length(p);
      float angle = atan(p.y, p.x);

      float streaks = sin(angle * 28.0 + sin(dist * 8.0 - t * 4.0) * 3.0) * 0.5 + 0.5;
      float speedCore = 0.06 / (dist + 0.08);

      vec3 cyan = vec3(0.0, 0.85, 1.0);
      vec3 col = vec3(0.015, 0.02, 0.05);
      col += mix(accent, cyan, streaks) * (speedCore * 0.7 + streaks * 0.35);
      gl_FragColor = vec4(col, 1.0);
    }
  `
};

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
  }
  return shader;
}

const programs = {};
const vertShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);

for (const key in shaders) {
  const fragShader = compileShader(gl.FRAGMENT_SHADER, shaders[key]);
  const prog = gl.createProgram();
  gl.attachShader(prog, vertShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);
  programs[key] = {
    program: prog,
    tLoc: gl.getUniformLocation(prog, 't'),
    rLoc: gl.getUniformLocation(prog, 'r'),
    aLoc: gl.getUniformLocation(prog, 'accent')
  };
}

const quadBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

function hexToRgb(h) {
  return [
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255
  ];
}

// Cross-browser Rounded Rectangle Drawing Helper
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Toast notification helper
let toastTimeout;
function showToast(msg) {
  toastMessage.textContent = msg;
  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2500);
}

// ==========================================
// RESIZING & RESPONSIVE VIEWPORT
// ==========================================
function updateCanvasSize() {
  const aspect = aspectSelect.value;
  let w = 1920, h = 1080;
  let label = '1920 × 1080 (16:9)';

  if (aspect === '9:16') {
    w = 1080;
    h = 1920;
    label = '1080 × 1920 (9:16 Vertical)';
  } else if (aspect === '1:1') {
    w = 1080;
    h = 1080;
    label = '1080 × 1080 (1:1 Square)';
  }

  resolutionBadge.textContent = label;

  canvas.width = w;
  canvas.height = h;
  glCanvas.width = w;
  glCanvas.height = h;

  canvas.style.aspectRatio = aspect === '9:16' ? '9 / 16' : (aspect === '1:1' ? '1 / 1' : '16 / 9');
  canvas.style.width = 'auto';
  canvas.style.height = 'auto';

  gl.viewport(0, 0, w, h);
}

// ==========================================
// GENERATIVE & CUSTOM AUDIO ENGINE
// ==========================================
function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function createGenerativeAudioNode(destination) {
  if (!audioEnabled || !audioCtx) return null;

  const soundType = audioSoundSelect.value || 'ambient';
  
  if (soundType === 'custom' && customAudioElement) {
    try {
      const source = audioCtx.createMediaElementSource(customAudioElement);
      source.connect(destination || audioCtx.destination);
      customAudioElement.currentTime = currentTime % customAudioElement.duration;
      if (playing) customAudioElement.play();
      return { customSource: source };
    } catch (e) {
      console.warn('Custom audio source error:', e);
    }
  }

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.24, audioCtx.currentTime);
  masterGain.connect(destination || audioCtx.destination);

  let freqs = [65.41, 98.0, 146.83, 164.81, 246.94]; // Ambient C Maj9
  let cutoff = 340;

  if (soundType === 'solar') {
    freqs = [73.42, 110.0, 146.83, 220.0, 293.66]; // D Maj
    cutoff = 480;
  } else if (soundType === 'cosmic') {
    freqs = [55.0, 110.0, 164.81, 220.0]; // A Minor
    cutoff = 220;
  } else if (soundType === 'lofi') {
    freqs = [87.31, 130.81, 164.81, 196.0]; // F Maj7
    cutoff = 380;
  }

  const oscs = freqs.map((f, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = soundType === 'solar' ? (i % 2 === 0 ? 'sawtooth' : 'sine') : (soundType === 'lofi' && i === 0 ? 'triangle' : 'sine');
    osc.frequency.setValueAtTime(f, audioCtx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff + i * 70, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.06 / freqs.length, audioCtx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start();
    return { osc, gain, filter };
  });

  return { masterGain, oscs };
}

// ==========================================
// PROCEDURAL PARTICLE SYSTEM
// ==========================================
function initParticles(type, w, h) {
  particles = [];
  if (!type || type === 'none') return;
  const count = type === 'rain' ? 80 : (type === 'stars' ? 120 : 45);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: type === 'rain' ? -1.5 : (Math.random() - 0.5) * 1.5,
      vy: type === 'rain' ? 14 + Math.random() * 12 : (type === 'dust' ? -0.4 - Math.random() * 0.6 : (Math.random() - 0.5) * 2),
      size: type === 'rain' ? 15 + Math.random() * 20 : (type === 'dust' ? 2 + Math.random() * 4 : (type === 'confetti' ? 8 + Math.random() * 8 : 1.5 + Math.random() * 3)),
      alpha: Math.random() * 0.8 + 0.2,
      color: type === 'confetti' ? ['#f43f5e', '#38bdf8', '#fbbf24', '#a855f7', '#10b981'][Math.floor(Math.random() * 5)] : '#ffffff',
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.1
    });
  }
}

function updateAndDrawParticles(ctx, w, h) {
  if (particleType === 'none' || particles.length === 0) return;
  ctx.save();
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.angle += p.spin;

    if (particleType === 'rain') {
      if (p.y > h) { p.y = -20; p.x = Math.random() * w; }
      if (p.x < 0) { p.x = w; }
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 2, p.y + p.size);
      ctx.stroke();
    } else if (particleType === 'dust') {
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = p.alpha * 0.45;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 10;
      ctx.fill();
    } else if (particleType === 'sparks') {
      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
      }
      ctx.beginPath();
      ctx.fillStyle = '#f59e0b';
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
    } else if (particleType === 'stars') {
      p.x += (p.x - w/2) * 0.03;
      p.y += (p.y - h/2) * 0.03;
      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        p.x = w/2 + (Math.random() - 0.5) * 100;
        p.y = h/2 + (Math.random() - 0.5) * 100;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    } else if (particleType === 'confetti') {
      if (p.y > h) { p.y = -10; p.x = Math.random() * w; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * 0.8;
      ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
      ctx.restore();
    }
  }
  ctx.restore();
}

// ==========================================
// KINETIC TEXT GRADIENT GENERATOR
// ==========================================
function getTextFillStyle(ctx, gradientType, anchorX, centerY, size, accentCol) {
  if (gradientType === 'sunset') {
    const grad = ctx.createLinearGradient(anchorX - size * 2, centerY, anchorX + size * 2, centerY);
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(1, '#f43f5e');
    return grad;
  } else if (gradientType === 'cyber') {
    const grad = ctx.createLinearGradient(anchorX - size * 2, centerY, anchorX + size * 2, centerY);
    grad.addColorStop(0, '#ec4899');
    grad.addColorStop(0.5, '#c084fc');
    grad.addColorStop(1, '#38bdf8');
    return grad;
  } else if (gradientType === 'aqua') {
    const grad = ctx.createLinearGradient(anchorX - size * 2, centerY, anchorX + size * 2, centerY);
    grad.addColorStop(0, '#22d3ee');
    grad.addColorStop(1, '#3b82f6');
    return grad;
  } else if (gradientType === 'chrome') {
    const grad = ctx.createLinearGradient(anchorX, centerY - size/2, anchorX, centerY + size/2);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#94a3b8');
    grad.addColorStop(1, '#ffffff');
    return grad;
  } else if (gradientType === 'rainbow') {
    const grad = ctx.createLinearGradient(anchorX - size * 2, centerY, anchorX + size * 2, centerY);
    grad.addColorStop(0, '#ef4444');
    grad.addColorStop(0.25, '#f59e0b');
    grad.addColorStop(0.5, '#10b981');
    grad.addColorStop(0.75, '#06b6d4');
    grad.addColorStop(1, '#a855f7');
    return grad;
  }
  return accentCol;
}

// ==========================================
// ANIMATED CALL-TO-ACTION (CTA) BADGE
// ==========================================
function drawCTABadge(ctx, type, w, h, scale, progress, masterAlpha) {
  if (!type || type === 'none') return;
  const labels = {
    download: '📲 DOWNLOAD NOW',
    bio: '🔗 LINK IN BIO',
    shop: '🔥 SHOP NOW • 50% OFF',
    subscribe: '▶️ SUBSCRIBE & FOLLOW',
    register: '🚀 REGISTER FREE',
    swipe: '👆 SWIPE UP'
  };
  const text = labels[type] || type.toUpperCase();
  ctx.save();
  ctx.globalAlpha = masterAlpha * 0.95;
  
  const pulse = 1.0 + Math.sin(progress * Math.PI * 4) * 0.05;
  const ctaFont = `800 ${Math.max(13, 15 * scale * pulse)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.font = ctaFont;
  const textW = ctx.measureText(text).width;
  const pillW = textW + 36 * scale;
  const pillH = 34 * scale;
  const pillX = w / 2 - pillW / 2;
  const pillY = h * 0.81;

  ctx.fillStyle = '#090d1a';
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 17 * scale);
  ctx.fill();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.2 * scale;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 16 * scale;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 0;
  ctx.fillText(text, w / 2, pillY + pillH / 2 + 1);
  ctx.restore();
}

// ==========================================
// AI SPEECH SYNTHESIS VOICEOVER (TTS)
// ==========================================
function speakSceneVoiceover(text, gender) {
  if (!voiceEnabled || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (gender === 'female') {
        const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Google US English'));
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        const maleVoice = voices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('George'));
        if (maleVoice) utterance.voice = maleVoice;
      }
    }
    utterance.rate = 1.05;
    utterance.pitch = gender === 'female' ? 1.1 : 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis note:', e);
  }
}

// ==========================================
// 2D CANVAS COMPOSITOR & KINETIC TYPOGRAPHY
// ==========================================
function render(time) {
  const totalSeqDuration = scenes.reduce((acc, s) => acc + (s.duration || 5), 0);
  currentTime = Math.max(0, Math.min(time, totalSeqDuration));

  // Determine active scene from timeline position
  let currentScene = scenes[0];
  let localSceneTime = currentTime;
  let sceneOffset = 0;
  let sceneIndex = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scDuration = scenes[i].duration || 5;
    if (currentTime <= sceneOffset + scDuration || i === scenes.length - 1) {
      currentScene = scenes[i];
      localSceneTime = currentTime - sceneOffset;
      sceneIndex = i;
      break;
    }
    sceneOffset += scDuration;
  }

  // Trigger TTS voiceover when active scene starts
  if (playing && sceneIndex !== lastSpokenSceneIdx && localSceneTime < 0.3) {
    lastSpokenSceneIdx = sceneIndex;
    speakSceneVoiceover(`${currentScene.title}. ${currentScene.subtitle}`, voiceGenderSelect ? voiceGenderSelect.value : 'female');
  }

  const scDuration = currentScene.duration || 5;
  const progress = Math.max(0, Math.min(localSceneTime / scDuration, 1));
  const currentStyle = currentScene.style || styleSelect.value || 'silk';
  const currentAccent = currentScene.accent || accent;
  const currentFont = currentScene.font || fontSelect.value || 'Plus Jakarta Sans';
  const currentMotion = currentScene.motion || motionSelect.value || 'fade-rise';
  const currentGradient = currentScene.gradient || textGradient;
  const currentGlow = currentScene.glow !== undefined ? currentScene.glow : textGlow;
  const currentParticle = currentScene.particle || particleType;
  const currentCTA = currentScene.cta || ctaBadge;

  const progData = programs[currentStyle] || programs.silk;

  // 1. Render WebGL Shader with Speed
  gl.useProgram(progData.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  const posLoc = gl.getAttribLocation(progData.program, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  gl.uniform1f(progData.tLoc, currentTime * speed);
  gl.uniform2f(progData.rLoc, glCanvas.width, glCanvas.height);
  gl.uniform3fv(progData.aLoc, new Float32Array(hexToRgb(currentAccent)));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // 2. Composite onto Visible 2D Canvas
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(glCanvas, 0, 0, w, h);

  const scale = Math.min(w, h) / 1000;

  // 3. Film Grain Overlay (Optional)
  if (enableFilmGrain) {
    ctx.save();
    const grainSize = 128;
    const imgData = ctx.createImageData(grainSize, grainSize);
    const buf32 = new Uint32Array(imgData.data.buffer);
    for (let i = 0; i < buf32.length; i++) {
      if (Math.random() < 0.5) {
        buf32[i] = 0x08ffffff;
      }
    }
    const offCanvas = document.createElement('canvas');
    offCanvas.width = grainSize;
    offCanvas.height = grainSize;
    offCanvas.getContext('2d').putImageData(imgData, 0, 0);
    
    ctx.fillStyle = ctx.createPattern(offCanvas, 'repeat');
    ctx.globalAlpha = 0.28;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 4. Procedural Particle Overlay
  if (currentParticle !== 'none') {
    if (particles.length === 0 || particleType !== currentParticle) {
      particleType = currentParticle;
      initParticles(currentParticle, w, h);
    }
    updateAndDrawParticles(ctx, w, h);
  }

  // 5. Vignette Mask
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.72);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // 6. Kinetic Motion Easing
  let easeIn = 1 - Math.pow(1 - Math.min(progress / 0.12, 1), 3);
  let fadeOut = Math.min(1, Math.max(0, (progress - 0.90) / 0.10));
  let masterAlpha = easeIn * (1 - fadeOut);

  let animScale = 1.0;
  let animOffsetY = (1 - easeIn) * 35 * scale;

  if (!playing || isScrubbing) {
    masterAlpha = 1.0;
    animScale = 1.0;
    animOffsetY = 0;
  } else {
    masterAlpha = Math.max(0.15, masterAlpha);
    if (currentMotion === 'scale-pop') {
      animScale = 0.88 + easeIn * 0.12;
      animOffsetY = (1 - easeIn) * 15 * scale;
    } else if (currentMotion === 'kinetic-drift') {
      animScale = 1.0 + progress * 0.07;
      animOffsetY = (1 - easeIn) * 22 * scale;
    } else if (currentMotion === 'glitch-flash') {
      if (progress < 0.08) {
        masterAlpha *= (Math.sin(progress * 120.0) > 0 ? 1.0 : 0.3);
      }
    }
  }

  // 7. Draw Logo with Position Controls
  let contentOffsetY = 0;
  const logoPos = logoPosSelect ? logoPosSelect.value : 'above-title';
  
  if (userLogo && userLogo.complete) {
    ctx.save();
    ctx.globalAlpha = masterAlpha;
    const logoMaxDim = 90 * scale;
    let lw = userLogo.width;
    let lh = userLogo.height;
    const logoRatio = Math.min(logoMaxDim / lw, logoMaxDim / lh);
    lw *= logoRatio;
    lh *= logoRatio;

    let lx = w / 2 - lw / 2;
    let ly = h * 0.32 - lh / 2 + animOffsetY;

    if (logoPos === 'top-left') {
      lx = w * 0.08;
      ly = h * 0.08;
    } else if (logoPos === 'top-center') {
      lx = w / 2 - lw / 2;
      ly = h * 0.08;
    } else if (logoPos === 'bottom-right') {
      lx = w * 0.92 - lw;
      ly = h * 0.92 - lh;
    } else {
      contentOffsetY = lh * 0.42;
    }

    ctx.drawImage(userLogo, lx, ly, lw, lh);
    ctx.restore();
  }

  // Horizontal text alignment setup
  let anchorX = w / 2;
  ctx.textAlign = textAlign;
  if (textAlign === 'left') {
    anchorX = w * 0.12;
  } else if (textAlign === 'right') {
    anchorX = w * 0.88;
  }

  // 8. Draw Category Badge Pill
  const badgeText = (currentScene.badge || badgeInput.value || '').trim().toUpperCase();
  if (badgeText) {
    ctx.save();
    ctx.globalAlpha = masterAlpha * 0.94;
    ctx.font = `700 ${Math.max(12, 14 * scale)}px '${currentFont}', sans-serif`;
    const textWidth = ctx.measureText(badgeText).width;
    const pillW = textWidth + 30 * scale;
    const pillH = 28 * scale;
    
    let pillX = anchorX - pillW / 2;
    if (textAlign === 'left') pillX = anchorX;
    if (textAlign === 'right') pillX = anchorX - pillW;

    const pillY = h * 0.36 + contentOffsetY + animOffsetY;

    ctx.fillStyle = 'rgba(10, 14, 28, 0.82)';
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 14 * scale);
    ctx.fill();

    ctx.strokeStyle = currentAccent;
    ctx.lineWidth = 1.8 * scale;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(badgeText, pillX + pillW / 2, pillY + pillH / 2 + 1);
    ctx.restore();
    contentOffsetY += pillH * 0.85;
  }

  // 9. Kinetic Typography with Gradient Headlines & Custom Glow
  ctx.save();
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = masterAlpha;

  const rawTitle = (currentScene.title || titleInput.value || 'DESIGN THE FUTURE').toUpperCase().trim();
  const sub = currentScene.subtitle || subtitleInput.value || '';

  let mainSize = (currentStyle === 'editorial' ? 88 : 96) * scale;
  if (w < h) mainSize *= 0.75;

  const centerY = h * 0.52 + contentOffsetY + animOffsetY;

  ctx.font = `800 ${mainSize * animScale}px '${currentFont}', sans-serif`;
  ctx.shadowColor = currentAccent;
  ctx.shadowBlur = (currentGlow || 26) * scale;
  
  const headlineFill = getTextFillStyle(ctx, currentGradient, anchorX, centerY, mainSize, currentAccent);
  ctx.fillStyle = '#ffffff';

  const words = rawTitle.split(' ');
  if (words.length > 2) {
    const half = Math.ceil(words.length / 2);
    const line1 = words.slice(0, half).join(' ');
    const line2 = words.slice(half).join(' ');

    ctx.fillText(line1, anchorX, centerY - mainSize * 0.55);
    ctx.fillStyle = headlineFill;
    ctx.fillText(line2, anchorX, centerY + mainSize * 0.55);
  } else {
    ctx.fillStyle = headlineFill;
    ctx.fillText(rawTitle, anchorX, centerY);
  }

  // Subtitle
  ctx.shadowBlur = 0;
  ctx.globalAlpha = masterAlpha * 0.86;
  ctx.font = `500 ${Math.max(18, 25 * scale)}px 'Inter', sans-serif`;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(sub, anchorX, centerY + (words.length > 2 ? mainSize * 1.45 : mainSize * 1.15));

  // 10. Call-to-Action (CTA) Pill
  if (currentCTA && currentCTA !== 'none') {
    drawCTABadge(ctx, currentCTA, w, h, scale, progress, masterAlpha);
  }

  // 11. Studio Watermark
  ctx.globalAlpha = 0.45;
  ctx.textAlign = 'center';
  ctx.font = `700 ${Math.max(11, 13 * scale)}px '${currentFont}', sans-serif`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('FLUXFRAME STUDIO', w / 2, h * 0.94);
  ctx.restore();

  // 12. Timeline Progress Bar Sync
  const pct = (currentTime / totalSeqDuration) * 100;
  progressBar.style.width = `${pct}%`;
  if (progressHandle) progressHandle.style.left = `${pct}%`;

  const curSec = Math.floor(currentTime);
  const durSec = Math.floor(totalSeqDuration);
  timeLabel.textContent = `00:${String(curSec).padStart(2, '0')} / 00:${String(durSec).padStart(2, '0')}`;
}

// ==========================================
// STORYBOARD & MULTI-SCENE MANAGEMENT
// ==========================================
function getTotalDuration() {
  return scenes.reduce((acc, s) => acc + (s.duration || 5), 0);
}

function renderSceneTabs() {
  if (!sceneTabsWrap) return;
  sceneTabsWrap.innerHTML = '';
  scenes.forEach((sc, idx) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    const isActive = idx === activeSceneIdx;
    tab.className = `px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
      isActive
        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 border border-brand-400/30'
        : 'bg-dark-900 text-slate-400 hover:text-white hover:bg-dark-800 border border-dark-700/60'
    }`;
    const truncatedTitle = sc.title ? (sc.title.length > 12 ? sc.title.slice(0, 10) + '..' : sc.title) : `Scene ${idx + 1}`;
    tab.innerHTML = `<span class="opacity-75 font-mono text-[10px]">#${idx + 1}</span> <span>${truncatedTitle}</span> <span class="text-[10px] opacity-75 font-mono">(${sc.duration || 5}s)</span>`;
    tab.addEventListener('click', () => {
      saveCurrentFormToScene();
      activeSceneIdx = idx;
      loadSceneToForm(idx);
      renderSceneTabs();
      let offset = 0;
      for (let i = 0; i < idx; i++) offset += (scenes[i].duration || 5);
      currentTime = offset;
      startTime = performance.now() - (currentTime * 1000);
      lastSpokenSceneIdx = -1;
      render(currentTime);
    });
    sceneTabsWrap.appendChild(tab);
  });
}

function loadSceneToForm(idx) {
  const sc = scenes[idx];
  if (!sc) return;
  if (badgeInput) badgeInput.value = sc.badge || '';
  if (titleInput) titleInput.value = sc.title || '';
  if (subtitleInput) subtitleInput.value = sc.subtitle || '';
  if (styleSelect) styleSelect.value = sc.style || 'silk';
  if (fontSelect) fontSelect.value = sc.font || 'Plus Jakarta Sans';
  if (motionSelect) motionSelect.value = sc.motion || 'fade-rise';
  if (durationSelect) durationSelect.value = sc.duration || 5;
  if (textGradientSelect) textGradientSelect.value = sc.gradient || 'solid';
  if (textGlowSelect) textGlowSelect.value = sc.glow !== undefined ? String(sc.glow) : '26';
  if (particleSelect) particleSelect.value = sc.particle || 'none';
  if (ctaSelect) ctaSelect.value = sc.cta || 'none';
  
  if (sc.accent) {
    accent = sc.accent;
    if (customColorPicker) customColorPicker.value = accent;
    document.documentElement.style.setProperty('--accent', accent);
  }

  // Update UI visual buttons/cards
  document.querySelectorAll('.style-card').forEach(c => c.classList.toggle('active', c.dataset.style === (sc.style || 'silk')));
  document.querySelectorAll('#durationControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.duration === String(sc.duration || 5)));
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.color === accent));
  
  if (sc.particle && sc.particle !== 'none') {
    initParticles(sc.particle, canvas.width, canvas.height);
  }
}

function saveCurrentFormToScene() {
  if (!scenes[activeSceneIdx]) return;
  scenes[activeSceneIdx] = {
    badge: badgeInput ? badgeInput.value : '',
    title: titleInput ? titleInput.value : '',
    subtitle: subtitleInput ? subtitleInput.value : '',
    style: styleSelect ? styleSelect.value : 'silk',
    accent: accent,
    font: fontSelect ? fontSelect.value : 'Plus Jakarta Sans',
    motion: motionSelect ? motionSelect.value : 'fade-rise',
    gradient: textGradientSelect ? textGradientSelect.value : 'solid',
    glow: textGlowSelect ? Number(textGlowSelect.value) : 26,
    particle: particleSelect ? particleSelect.value : 'none',
    cta: ctaSelect ? ctaSelect.value : 'none',
    duration: durationSelect ? Number(durationSelect.value) : 5
  };
}

// Storyboard Add / Delete Scene
if (addSceneBtn) {
  addSceneBtn.addEventListener('click', () => {
    saveCurrentFormToScene();
    const newIdx = scenes.length + 1;
    const stylesList = ['silk', 'solar', 'aurora', 'cyber', 'chrome', 'obsidian', 'prism', 'warp'];
    const nextStyle = stylesList[scenes.length % stylesList.length];
    const accentsList = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#a855f7'];
    const nextAccent = accentsList[scenes.length % accentsList.length];

    scenes.push({
      badge: `SCENE 0${newIdx}`,
      title: `CHAPTER ${newIdx}`,
      subtitle: 'Next scene in the automated video sequence',
      style: nextStyle,
      accent: nextAccent,
      font: 'Plus Jakarta Sans',
      motion: 'fade-rise',
      gradient: 'solid',
      glow: 26,
      particle: 'none',
      cta: 'none',
      duration: 5
    });

    activeSceneIdx = scenes.length - 1;
    loadSceneToForm(activeSceneIdx);
    renderSceneTabs();
    showToast(`🎬 Added Scene ${newIdx}`);
    restart();
  });
}

if (deleteSceneBtn) {
  deleteSceneBtn.addEventListener('click', () => {
    if (scenes.length <= 1) {
      showToast('⚠️ Storyboard requires at least 1 scene');
      return;
    }
    scenes.splice(activeSceneIdx, 1);
    if (activeSceneIdx >= scenes.length) {
      activeSceneIdx = scenes.length - 1;
    }
    loadSceneToForm(activeSceneIdx);
    renderSceneTabs();
    showToast('🗑️ Deleted scene');
    restart();
  });
}

// ==========================================
// PLAYBACK LOOP & CONTROLS
// ==========================================
function loop(now) {
  if (playing && !isScrubbing) {
    const totalDur = getTotalDuration();
    let elapsed = (now - startTime) / 1000;
    if (elapsed > totalDur) {
      startTime = now;
      elapsed = 0;
      lastSpokenSceneIdx = -1;
    }
    render(elapsed);
  }
  raf = requestAnimationFrame(loop);
}

function restart() {
  startTime = performance.now();
  playing = true;
  lastSpokenSceneIdx = -1;
  updatePlayButtonUI(true);
  render(0);
}

function updatePlayButtonUI(isPlaying) {
  if (isPlaying) {
    playBtnText.textContent = 'Pause';
    playIconWrap.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
  } else {
    playBtnText.textContent = 'Play';
    playIconWrap.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
  }
}

function updateSettings() {
  duration = Number(durationSelect.value);
  saveCurrentFormToScene();
  renderSceneTabs();
  updateCanvasSize();
  restart();
}

// ==========================================
// CLOUDFLARE WORKERS AI & LOCAL GENERATOR
// ==========================================
async function generateSceneWithAI(prompt) {
  if (!prompt || !prompt.trim()) return;
  aiBtnLabel.textContent = 'Thinking... ⏳';
  aiGenerateBtn.disabled = true;

  // 1. Try Cloudflare Pages /api/ai Edge Function first
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (res.ok) {
      const data = await res.json();
      const rawText = data.response || (typeof data === 'string' ? data : JSON.stringify(data));
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        applyParsedScene(parsed, prompt);
        aiBtnLabel.textContent = 'Generate ✨';
        aiGenerateBtn.disabled = false;
        return;
      }
    }
  } catch (err) {
    console.warn('Pages function note:', err);
  }

  // 2. If Cloudflare Account ID & Token are provided in LocalStorage, query Cloudflare Workers AI edge!
  if (cfAccountId && cfApiToken) {
    try {
      showToast('☁️ Calling Cloudflare Workers AI edge...');
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-3.2-3b-instruct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an AI motion designer. Return ONLY a JSON object with: { "badge": string, "title": string (max 4 words), "subtitle": string, "style": "silk"|"solar"|"aurora"|"cyber"|"chrome"|"obsidian"|"prism"|"warp", "accent": hex_color, "font": "Plus Jakarta Sans"|"Space Grotesk"|"Outfit"|"Syne"|"Cinzel"|"JetBrains Mono", "motion": "fade-rise"|"scale-pop"|"kinetic-drift"|"glitch-flash", "gradient": "solid"|"sunset"|"cyber"|"aqua"|"chrome"|"rainbow", "particle": "none"|"rain"|"dust"|"sparks"|"stars"|"confetti", "cta": "none"|"download"|"bio"|"shop"|"subscribe"|"register"|"swipe" }'
            },
            {
              role: 'user',
              content: `Create scene for: ${prompt}`
            }
          ]
        })
      });

      const data = await response.json();
      if (data.result && data.result.response) {
        const text = data.result.response;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          applyParsedScene(parsed, prompt);
          aiBtnLabel.textContent = 'Generate ✨';
          aiGenerateBtn.disabled = false;
          return;
        }
      }
    } catch (err) {
      console.warn('Cloudflare Workers AI edge note:', err);
    }
  }

  // 3. Instant Local AI Fallback (100% Client-Side & Private)
  generateSceneFromPrompt(prompt);
  aiBtnLabel.textContent = 'Generate ✨';
  aiGenerateBtn.disabled = false;
}

function applyParsedScene(parsed, prompt) {
  if (parsed.badge) badgeInput.value = parsed.badge.toUpperCase();
  if (parsed.title) titleInput.value = parsed.title.toUpperCase();
  if (parsed.subtitle) subtitleInput.value = parsed.subtitle;
  if (parsed.style && shaders[parsed.style]) styleSelect.value = parsed.style;
  if (parsed.font) fontSelect.value = parsed.font;
  if (parsed.motion) motionSelect.value = parsed.motion;
  if (parsed.gradient && textGradientSelect) textGradientSelect.value = parsed.gradient;
  if (parsed.particle && particleSelect) particleSelect.value = parsed.particle;
  if (parsed.cta && ctaSelect) ctaSelect.value = parsed.cta;
  if (parsed.accent) {
    accent = parsed.accent;
    customColorPicker.value = accent;
    document.documentElement.style.setProperty('--accent', accent);
  }

  document.querySelectorAll('.style-card').forEach(c => c.classList.toggle('active', c.dataset.style === styleSelect.value));
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.color === accent));
  
  if (parsed.particle && parsed.particle !== 'none') {
    initParticles(parsed.particle, canvas.width, canvas.height);
  }

  saveCurrentFormToScene();
  renderSceneTabs();
  showToast(`✨ Generated: "${parsed.title || prompt}"`);
  updateSettings();
}

function generateSceneFromPrompt(prompt) {
  const p = prompt.toLowerCase();
  const hasWord = (word) => new RegExp('\\b' + word + '\\b', 'i').test(prompt);

  let selectedStyle = 'silk';
  let selectedAccent = '#6366f1';
  let selectedFont = 'Plus Jakarta Sans';
  let selectedMotion = 'fade-rise';
  let selectedGradient = 'solid';
  let selectedParticle = 'none';
  let selectedCTA = 'none';
  let badge = 'ANNOUNCEMENT';
  let title = 'BUILD THE FUTURE';
  let subtitle = 'High-fidelity procedural motion graphics in real-time';

  // 1. Rain / Storm / Weather / Mood / Lofi
  if (hasWord('rain') || hasWord('rainy') || hasWord('storm') || hasWord('stormy') || hasWord('thunder') || hasWord('cloud') || hasWord('clouds') || hasWord('weather') || hasWord('drizzle') || hasWord('lofi') || hasWord('chill') || hasWord('relax')) {
    selectedStyle = 'obsidian';
    selectedAccent = '#38bdf8';
    selectedFont = 'Plus Jakarta Sans';
    selectedMotion = 'fade-rise';
    selectedGradient = 'aqua';
    selectedParticle = 'rain';
    badge = 'RAINY AESTHETIC';
    title = 'MIDNIGHT RAIN';
    subtitle = 'Calming raindrops, atmospheric ambience and cinematic lo-fi waves';
  } 
  // 2. Water / Ocean / Aquatic / Fluid
  else if (hasWord('water') || hasWord('fluid') || hasWord('liquid') || hasWord('ocean') || hasWord('sea') || hasWord('aqua') || hasWord('wave') || hasWord('waves') || hasWord('flow') || hasWord('river')) {
    selectedStyle = 'silk';
    selectedAccent = '#06b6d4';
    selectedFont = 'Outfit';
    selectedMotion = 'kinetic-drift';
    selectedGradient = 'aqua';
    selectedParticle = 'dust';
    badge = 'AQUATIC MOTION';
    title = 'LIQUID WAVES';
    subtitle = 'Smooth procedural fluid simulation and crystalline ripples';
  } 
  // 3. Dance / Music / Festival / DJ
  else if (hasWord('dance') || hasWord('dancing') || hasWord('party') || hasWord('festival') || hasWord('music') || hasWord('club') || hasWord('dj') || hasWord('beats') || hasWord('bass')) {
    selectedStyle = 'cyber';
    selectedAccent = '#ec4899';
    selectedFont = 'Syne';
    selectedMotion = 'glitch-flash';
    selectedGradient = 'cyber';
    selectedParticle = 'confetti';
    selectedCTA = 'shop';
    badge = 'LIVE FESTIVAL';
    title = 'KINETIC BEATS';
    subtitle = 'Electrifying soundstage and rhythmic visual pulses';
  } 
  // 4. Hype / Fire / Epic / Energy
  else if (hasWord('cool') || hasWord('epic') || hasWord('hype') || hasWord('vibes') || hasWord('fire') || hasWord('energy') || hasWord('flame') || hasWord('blaze')) {
    selectedStyle = 'solar';
    selectedAccent = '#f59e0b';
    selectedFont = 'Outfit';
    selectedMotion = 'scale-pop';
    selectedGradient = 'sunset';
    selectedParticle = 'sparks';
    badge = 'HOT DROP';
    title = 'MAKE IT LEGENDARY';
    subtitle = 'Pure adrenaline and unmatched creative power';
  } 
  // 5. Cyberpunk / Synthwave / Gaming / Crypto
  else if (hasWord('cyber') || hasWord('cyberpunk') || hasWord('synth') || hasWord('synthwave') || hasWord('gaming') || hasWord('game') || hasWord('crypto') || hasWord('neon') || hasWord('arcade')) {
    selectedStyle = 'cyber';
    selectedAccent = '#ec4899';
    selectedFont = 'Space Grotesk';
    selectedMotion = 'glitch-flash';
    selectedGradient = 'cyber';
    selectedParticle = 'sparks';
    selectedCTA = 'download';
    badge = 'SYNTHWAVE 2026';
    title = 'NEON PROTOCOL';
    subtitle = 'Decentralized high-speed gaming infrastructure';
  } 
  // 6. Solar / Keynote / Summit / Launch
  else if (hasWord('solar') || hasWord('sun') || hasWord('keynote') || hasWord('summit') || hasWord('event') || hasWord('conference') || hasWord('launch')) {
    selectedStyle = 'solar';
    selectedAccent = '#f59e0b';
    selectedFont = 'Outfit';
    selectedMotion = 'scale-pop';
    selectedGradient = 'sunset';
    selectedParticle = 'sparks';
    selectedCTA = 'register';
    badge = 'GLOBAL KEYNOTE';
    title = 'IGNITE REVOLUTION';
    subtitle = 'Streaming worldwide live on all platforms';
  } 
  // 7. Aurora / Space / Quantum / AI
  else if (hasWord('aurora') || hasWord('space') || hasWord('galaxy') || hasWord('cosmos') || hasWord('cosmic') || hasWord('ai') || hasWord('quantum') || hasWord('neural')) {
    selectedStyle = 'aurora';
    selectedAccent = '#10b981';
    selectedFont = 'Plus Jakarta Sans';
    selectedMotion = 'kinetic-drift';
    selectedGradient = 'rainbow';
    selectedParticle = 'stars';
    badge = 'QUANTUM CORE';
    title = 'COSMIC HORIZONS';
    subtitle = 'Autonomous neural computing and galactic deep space';
  } 
  // 8. Luxury / Fashion / Editorial / Beauty
  else if (hasWord('luxury') || hasWord('fashion') || hasWord('perfume') || hasWord('editorial') || hasWord('beauty') || hasWord('gold') || hasWord('jewel') || hasWord('model')) {
    selectedStyle = 'prism';
    selectedAccent = '#a855f7';
    selectedFont = 'Cinzel';
    selectedMotion = 'fade-rise';
    selectedGradient = 'chrome';
    selectedParticle = 'dust';
    selectedCTA = 'bio';
    badge = 'EDITION NO. 1';
    title = 'ETERNAL BEAUTY';
    subtitle = 'Crafted with timeless precision and luxury aesthetics';
  } 
  // 9. Warp / Speed / Fast / Infrastructure
  else if (hasWord('warp') || hasWord('speed') || hasWord('fast') || hasWord('turbo') || hasWord('cloud') || hasWord('infra') || hasWord('network') || hasWord('server')) {
    selectedStyle = 'warp';
    selectedAccent = '#06b6d4';
    selectedFont = 'JetBrains Mono';
    selectedMotion = 'scale-pop';
    selectedGradient = 'chrome';
    selectedParticle = 'stars';
    selectedCTA = 'download';
    badge = 'ULTRA SPEED';
    title = 'HYPER PERFORMANCE';
    subtitle = 'Sub-millisecond global execution and high-throughput network';
  } 
  // 10. Chrome / Metal / Hardware / Industrial
  else if (hasWord('chrome') || hasWord('metal') || hasWord('metallic') || hasWord('car') || hasWord('hardware') || hasWord('engine') || hasWord('titanium')) {
    selectedStyle = 'chrome';
    selectedAccent = '#06b6d4';
    selectedFont = 'Syne';
    selectedMotion = 'scale-pop';
    selectedGradient = 'chrome';
    selectedParticle = 'sparks';
    badge = 'FLAGSHIP HARDWARE';
    title = 'PRECISION CRAFT';
    subtitle = 'Aerospace grade materials forged for durability';
  } 
  // 11. Obsidian / Dark / Podcast / Audio / Night
  else if (hasWord('dark') || hasWord('obsidian') || hasWord('black') || hasWord('podcast') || hasWord('audio') || hasWord('sound') || hasWord('voice')) {
    selectedStyle = 'obsidian';
    selectedAccent = '#6366f1';
    selectedFont = 'Space Grotesk';
    selectedMotion = 'fade-rise';
    selectedGradient = 'solid';
    selectedCTA = 'subscribe';
    badge = 'EPISODE 42';
    title = 'MIDNIGHT TALKS';
    subtitle = 'Deep conversations with the pioneers of modern technology';
  } 
  else {
    const cleanWords = prompt.replace(/[^\w\s]/gi, '').trim().split(/\s+/).filter(w => !['make', 'it', 'a', 'the', 'and', 'for', 'in', 'on', 'with', 'to', 'style', 'video'].includes(w.toLowerCase()));
    if (cleanWords.length > 0) {
      title = cleanWords.slice(0, 4).join(' ').toUpperCase();
      badge = (cleanWords[0] || 'CUSTOM').toUpperCase() + ' EDITION';
      subtitle = `High-impact dynamic scene crafted for ${prompt}`;
    }
  }

  applyParsedScene({
    badge,
    title,
    subtitle,
    style: selectedStyle,
    font: selectedFont,
    motion: selectedMotion,
    accent: selectedAccent,
    gradient: selectedGradient,
    particle: selectedParticle,
    cta: selectedCTA
  }, prompt);
}

// AI Button & Enter key
if (aiGenerateBtn) {
  aiGenerateBtn.addEventListener('click', () => generateSceneWithAI(aiPromptInput.value));
}
if (aiPromptInput) {
  aiPromptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateSceneWithAI(aiPromptInput.value);
  });
}

// Cloudflare AI Modal Controls
if (aiConfigModalBtn) {
  aiConfigModalBtn.addEventListener('click', () => {
    aiConfigModal.classList.remove('opacity-0', 'pointer-events-none');
    aiModalCard.classList.remove('scale-95');
    aiModalCard.classList.add('scale-100');
  });
}

function closeAiModal() {
  if (aiConfigModal) {
    aiConfigModal.classList.add('opacity-0', 'pointer-events-none');
    aiModalCard.classList.remove('scale-100');
    aiModalCard.classList.add('scale-95');
  }
}

if (closeAiModalBtn) closeAiModalBtn.addEventListener('click', closeAiModal);
if (aiConfigModal) {
  aiConfigModal.addEventListener('click', (e) => {
    if (e.target === aiConfigModal) closeAiModal();
  });
}

if (saveAiConfigBtn) {
  saveAiConfigBtn.addEventListener('click', () => {
    cfAccountId = cfAccountIdInput.value.trim();
    cfApiToken = cfApiTokenInput.value.trim();
    localStorage.setItem('ff_cf_account_id', cfAccountId);
    localStorage.setItem('ff_cf_api_token', cfApiToken);
    closeAiModal();
    showToast(cfAccountId ? '☁️ Cloudflare Workers AI configured!' : '⚙️ Saved settings');
  });
}

// ==========================================
// 4K SNAPSHOT FRAME DOWNLOAD (PNG)
// ==========================================
if (snapshotBtn) {
  snapshotBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `fluxframe-poster-${styleSelect.value}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    showToast('📸 4K Poster Snapshot downloaded!');
  });
}

// ==========================================
// SHAREABLE SCENE URL (HASH ENCODING)
// ==========================================
if (shareLinkBtn) {
  shareLinkBtn.addEventListener('click', () => {
    saveCurrentFormToScene();
    const state = {
      scenes: scenes,
      aspect: aspectSelect.value
    };
    const hash = encodeURIComponent(JSON.stringify(state));
    const fullUrl = `${window.location.origin}${window.location.pathname}#storyboard=${hash}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      showToast('🔗 Shareable storyboard link copied!');
    }
  });
}

// Load state from Hash on start
function loadSceneFromHash() {
  if (window.location.hash && window.location.hash.includes('storyboard=')) {
    try {
      const raw = window.location.hash.split('storyboard=')[1];
      const state = JSON.parse(decodeURIComponent(raw));
      if (state.scenes && Array.isArray(state.scenes)) {
        scenes = state.scenes;
        activeSceneIdx = 0;
        if (state.aspect) {
          aspectSelect.value = state.aspect;
          document.querySelectorAll('#aspectControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === state.aspect));
        }
        loadSceneToForm(0);
        renderSceneTabs();
        showToast('⚡ Loaded shared storyboard sequence!');
        return;
      }
    } catch (e) {
      console.warn('Could not parse storyboard hash:', e);
    }
  } else if (window.location.hash && window.location.hash.includes('scene=')) {
    try {
      const raw = window.location.hash.split('scene=')[1];
      const state = JSON.parse(decodeURIComponent(raw));
      if (state.b) badgeInput.value = state.b;
      if (state.t) titleInput.value = state.t;
      if (state.s) subtitleInput.value = state.s;
      if (state.st) styleSelect.value = state.st;
      if (state.c) {
        accent = state.c;
        customColorPicker.value = accent;
        document.documentElement.style.setProperty('--accent', accent);
      }
      if (state.f) fontSelect.value = state.f;
      if (state.m) motionSelect.value = state.m;
      if (state.a) aspectSelect.value = state.a;
      if (state.d) durationSelect.value = state.d;

      document.querySelectorAll('.style-card').forEach(c => c.classList.toggle('active', c.dataset.style === state.st));
      document.querySelectorAll('.seg-btn').forEach(b => {
        if (b.dataset.aspect === state.a || b.dataset.duration === state.d) b.classList.add('active');
      });
      saveCurrentFormToScene();
      renderSceneTabs();
      showToast('⚡ Loaded shared scene!');
    } catch (e) {
      console.warn('Could not parse shared scene hash:', e);
    }
  }
}

// ==========================================
// EVENT LISTENERS & PRESETS
// ==========================================
window.addEventListener('resize', () => {
  updateCanvasSize();
  render(currentTime);
});

// Style Preset Grid
const styleCards = document.querySelectorAll('.style-card');
styleCards.forEach(card => {
  card.addEventListener('click', () => {
    const style = card.dataset.style;
    styleSelect.value = style;
    styleCards.forEach(c => c.classList.toggle('active', c === card));
    
    if (style === 'solar') accent = '#f59e0b';
    else if (style === 'aurora') accent = '#10b981';
    else if (style === 'cyber') accent = '#ec4899';
    else if (style === 'chrome') accent = '#06b6d4';
    else if (style === 'obsidian') accent = '#6366f1';
    else if (style === 'prism') accent = '#a855f7';
    else if (style === 'warp') accent = '#06b6d4';
    else if (style === 'silk') accent = '#6366f1';

    customColorPicker.value = accent;
    document.documentElement.style.setProperty('--accent', accent);
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.color === accent));
    saveCurrentFormToScene();
    renderSceneTabs();
    restart();
  });
});

// Segmented Aspect Control
const aspectButtons = document.querySelectorAll('#aspectControl .seg-btn');
aspectButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.aspect;
    aspectSelect.value = val;
    aspectButtons.forEach(b => b.classList.toggle('active', b === btn));
    updateSettings();
  });
});

// Segmented Duration Control
const durationButtons = document.querySelectorAll('#durationControl .seg-btn');
durationButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.duration;
    durationSelect.value = val;
    durationButtons.forEach(b => b.classList.toggle('active', b === btn));
    updateSettings();
  });
});

// Segmented Text Alignment
const alignButtons = document.querySelectorAll('#alignControl .seg-btn');
alignButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    textAlign = btn.dataset.align;
    alignSelect.value = textAlign;
    alignButtons.forEach(b => b.classList.toggle('active', b === btn));
    render(currentTime);
  });
});

// Speed Slider
if (speedSlider) {
  speedSlider.addEventListener('input', (e) => {
    speed = parseFloat(e.target.value);
    speedValueLabel.textContent = `${speed.toFixed(1)}x`;
    render(currentTime);
  });
}

// Film Grain Toggle
if (grainToggle) {
  grainToggle.addEventListener('click', () => {
    enableFilmGrain = !enableFilmGrain;
    grainToggle.classList.toggle('bg-brand-500', enableFilmGrain);
    grainToggle.classList.toggle('bg-dark-700', !enableFilmGrain);
    grainToggleKnob.classList.toggle('translate-x-5', enableFilmGrain);
    render(currentTime);
  });
}

// Live input re-renders
if (titleInput) {
  titleInput.addEventListener('input', () => {
    saveCurrentFormToScene();
    renderSceneTabs();
    render(currentTime);
  });
}
if (subtitleInput) {
  subtitleInput.addEventListener('input', () => {
    saveCurrentFormToScene();
    render(currentTime);
  });
}
if (badgeInput) {
  badgeInput.addEventListener('input', () => {
    saveCurrentFormToScene();
    render(currentTime);
  });
}
if (fontSelect) {
  fontSelect.addEventListener('change', () => {
    saveCurrentFormToScene();
    render(currentTime);
  });
}
if (motionSelect) {
  motionSelect.addEventListener('change', () => {
    saveCurrentFormToScene();
    restart();
  });
}
if (logoPosSelect) logoPosSelect.addEventListener('change', () => render(currentTime));

// Gradient & Glow listeners
if (textGradientSelect) {
  textGradientSelect.addEventListener('change', () => {
    textGradient = textGradientSelect.value;
    saveCurrentFormToScene();
    render(currentTime);
  });
}
if (textGlowSelect) {
  textGlowSelect.addEventListener('change', () => {
    textGlow = Number(textGlowSelect.value);
    saveCurrentFormToScene();
    render(currentTime);
  });
}

// Particle & CTA listeners
if (particleSelect) {
  particleSelect.addEventListener('change', () => {
    particleType = particleSelect.value;
    initParticles(particleType, canvas.width, canvas.height);
    saveCurrentFormToScene();
    render(currentTime);
  });
}
if (ctaSelect) {
  ctaSelect.addEventListener('change', () => {
    ctaBadge = ctaSelect.value;
    saveCurrentFormToScene();
    render(currentTime);
  });
}

// Voiceover Narrator Toggle & Voice Selection
if (voiceToggle) {
  voiceToggle.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    voiceToggle.classList.toggle('bg-brand-600', voiceEnabled);
    voiceToggle.classList.toggle('text-white', voiceEnabled);
    voiceToggle.classList.toggle('bg-dark-800', !voiceEnabled);
    voiceToggle.classList.toggle('text-slate-400', !voiceEnabled);
    if (voiceStatusText) voiceStatusText.textContent = voiceEnabled ? 'ON' : 'OFF';
    if (voiceEnabled) {
      speakSceneVoiceover('AI voiceover active', voiceGenderSelect ? voiceGenderSelect.value : 'female');
      showToast('🎙️ AI Voiceover Narrator ON');
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      showToast('🔇 AI Voiceover OFF');
    }
  });
}
if (voiceGenderSelect) {
  voiceGenderSelect.addEventListener('change', () => {
    if (voiceEnabled) {
      speakSceneVoiceover('Voice preview selected', voiceGenderSelect.value);
    }
  });
}

// Color Chips
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    accent = chip.dataset.color;
    customColorPicker.value = accent;
    document.documentElement.style.setProperty('--accent', accent);
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip));
    saveCurrentFormToScene();
    renderSceneTabs();
    restart();
  });
});

// Custom Color Picker
if (customColorPicker) {
  customColorPicker.addEventListener('input', (e) => {
    accent = e.target.value;
    document.documentElement.style.setProperty('--accent', accent);
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    saveCurrentFormToScene();
    render(currentTime);
  });
}

// Quick Presets Trigger (Templates Library)
if (quickPresetSelect) {
  quickPresetSelect.addEventListener('change', (e) => {
    const p = e.target.value;
    if (!p) return;

    if (p === 'reels') {
      aspectSelect.value = '9:16';
      document.querySelectorAll('#aspectControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === '9:16'));
      badgeInput.value = 'TRENDING REEL';
      titleInput.value = 'STOP SCROLLING';
      subtitleInput.value = 'Here is the #1 secret to dynamic content creation';
      styleSelect.value = 'cyber';
      accent = '#ec4899';
      textGradientSelect.value = 'cyber';
      textGlowSelect.value = '48';
      particleSelect.value = 'dust';
      ctaSelect.value = 'swipe';
      motionSelect.value = 'scale-pop';
      fontSelect.value = 'Outfit';
      durationSelect.value = '5';
    } else if (p === 'youtube') {
      aspectSelect.value = '16:9';
      document.querySelectorAll('#aspectControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === '16:9'));
      badgeInput.value = 'OFFICIAL INTRO';
      titleInput.value = 'WELCOME BACK';
      subtitleInput.value = 'Subscribe and turn on notifications for weekly masterclasses';
      styleSelect.value = 'solar';
      accent = '#f59e0b';
      textGradientSelect.value = 'sunset';
      textGlowSelect.value = '26';
      particleSelect.value = 'sparks';
      ctaSelect.value = 'subscribe';
      motionSelect.value = 'scale-pop';
      fontSelect.value = 'Space Grotesk';
      durationSelect.value = '5';
    } else if (p === 'spotify') {
      aspectSelect.value = '9:16';
      document.querySelectorAll('#aspectControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === '9:16'));
      badgeInput.value = 'NOW STREAMING';
      titleInput.value = 'MIDNIGHT SYNTH';
      subtitleInput.value = 'Available worldwide on Spotify and Apple Music';
      styleSelect.value = 'obsidian';
      accent = '#06b6d4';
      textGradientSelect.value = 'aqua';
      textGlowSelect.value = '26';
      particleSelect.value = 'rain';
      ctaSelect.value = 'bio';
      motionSelect.value = 'fade-rise';
      fontSelect.value = 'Plus Jakarta Sans';
      durationSelect.value = '8';
    } else if (p === 'launch') {
      aspectSelect.value = '16:9';
      document.querySelectorAll('#aspectControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === '16:9'));
      badgeInput.value = 'FEATURE RELEASE';
      titleInput.value = 'VERSION 3.0 LIVE';
      subtitleInput.value = 'Engineered for maximum velocity and effortless workflow';
      styleSelect.value = 'silk';
      accent = '#6366f1';
      textGradientSelect.value = 'chrome';
      textGlowSelect.value = '26';
      particleSelect.value = 'dust';
      ctaSelect.value = 'download';
      motionSelect.value = 'fade-rise';
      fontSelect.value = 'Plus Jakarta Sans';
      durationSelect.value = '5';
    } else if (p === 'rain') {
      aspectSelect.value = '16:9';
      document.querySelectorAll('#aspectControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === '16:9'));
      badgeInput.value = 'LO-FI CHILL';
      titleInput.value = 'MIDNIGHT RAIN';
      subtitleInput.value = 'Deep ambient frequencies to study, relax and focus';
      styleSelect.value = 'obsidian';
      accent = '#38bdf8';
      textGradientSelect.value = 'aqua';
      textGlowSelect.value = '12';
      particleSelect.value = 'rain';
      ctaSelect.value = 'none';
      motionSelect.value = 'fade-rise';
      fontSelect.value = 'Plus Jakarta Sans';
      durationSelect.value = '8';
    } else if (p === 'solar') {
      aspectSelect.value = '16:9';
      document.querySelectorAll('#aspectControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === '16:9'));
      badgeInput.value = 'GLOBAL SUMMIT';
      titleInput.value = 'IGNITE THE FUTURE';
      subtitleInput.value = 'Live streaming worldwide to 100,000+ developers';
      styleSelect.value = 'solar';
      accent = '#f59e0b';
      textGradientSelect.value = 'sunset';
      textGlowSelect.value = '48';
      particleSelect.value = 'sparks';
      ctaSelect.value = 'register';
      motionSelect.value = 'scale-pop';
      fontSelect.value = 'Outfit';
      durationSelect.value = '5';
    } else if (p === 'cyber') {
      aspectSelect.value = '16:9';
      document.querySelectorAll('#aspectControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === '16:9'));
      badgeInput.value = 'LIMITED DROP';
      titleInput.value = 'NEON CYBERPUNK';
      subtitleInput.value = 'Special edition hardware available while supplies last';
      styleSelect.value = 'cyber';
      accent = '#ec4899';
      textGradientSelect.value = 'cyber';
      textGlowSelect.value = '48';
      particleSelect.value = 'sparks';
      ctaSelect.value = 'shop';
      motionSelect.value = 'glitch-flash';
      fontSelect.value = 'Space Grotesk';
      durationSelect.value = '5';
    } else if (p === 'luxury') {
      aspectSelect.value = '1:1';
      document.querySelectorAll('#aspectControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === '1:1'));
      badgeInput.value = 'MAISON COUTURE';
      titleInput.value = 'TIMELESS LUXURY';
      subtitleInput.value = 'Exquisite craftsmanship meets contemporary aesthetics';
      styleSelect.value = 'prism';
      accent = '#a855f7';
      textGradientSelect.value = 'chrome';
      textGlowSelect.value = '26';
      particleSelect.value = 'dust';
      ctaSelect.value = 'bio';
      motionSelect.value = 'fade-rise';
      fontSelect.value = 'Cinzel';
      durationSelect.value = '5';
    } else if (p === 'podcast') {
      aspectSelect.value = '1:1';
      document.querySelectorAll('#aspectControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === '1:1'));
      badgeInput.value = 'EPISODE 104';
      titleInput.value = 'UNFILTERED MINDS';
      subtitleInput.value = 'Listen now on all major podcast directories';
      styleSelect.value = 'obsidian';
      accent = '#6366f1';
      textGradientSelect.value = 'solid';
      textGlowSelect.value = '26';
      particleSelect.value = 'none';
      ctaSelect.value = 'subscribe';
      motionSelect.value = 'fade-rise';
      fontSelect.value = 'Space Grotesk';
      durationSelect.value = '5';
    }

    customColorPicker.value = accent;
    document.documentElement.style.setProperty('--accent', accent);
    document.querySelectorAll('.style-card').forEach(c => c.classList.toggle('active', c.dataset.style === styleSelect.value));
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.color === accent));
    document.querySelectorAll('#durationControl .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.duration === durationSelect.value));

    initParticles(particleSelect.value, canvas.width, canvas.height);
    saveCurrentFormToScene();
    renderSceneTabs();
    showToast(`⚡ Loaded "${p.toUpperCase()}" template!`);
    updateSettings();
    quickPresetSelect.selectedIndex = 0;
  });
}

// Play / Pause Toggle
if (playBtn) {
  playBtn.addEventListener('click', () => {
    initAudio();
    playing = !playing;
    if (playing) {
      startTime = performance.now() - (currentTime * 1000);
    }
    updatePlayButtonUI(playing);
  });
}

// Restart Button
if (restartBtn) restartBtn.addEventListener('click', restart);

// Reset Button
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    scenes = [
      {
        badge: 'FEATURE LAUNCH',
        title: 'DESIGN THE FUTURE',
        subtitle: 'High-fidelity procedural motion graphics in real-time',
        style: 'silk',
        accent: '#6366f1',
        font: 'Plus Jakarta Sans',
        motion: 'fade-rise',
        gradient: 'solid',
        glow: 26,
        particle: 'none',
        cta: 'none',
        duration: 5
      }
    ];
    activeSceneIdx = 0;
    loadSceneToForm(0);
    renderSceneTabs();

    speedSlider.value = 1.0;
    speed = 1.0;
    speedValueLabel.textContent = '1.0x';
    enableFilmGrain = false;
    grainToggle.classList.remove('bg-brand-500');
    grainToggle.classList.add('bg-dark-700');
    grainToggleKnob.classList.remove('translate-x-5');

    userLogo = null;
    logoUpload.value = '';
    logoFileName.textContent = 'Upload PNG / SVG Logo';
    removeLogoBtn.style.display = 'none';
    showToast('Reset to default scene');
    updateSettings();
  });
}

// Logo Upload
if (logoUpload) {
  logoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    logoFileName.textContent = file.name.length > 18 ? file.name.slice(0, 15) + '...' : file.name;
    removeLogoBtn.style.display = 'grid';

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        userLogo = img;
        render(currentTime);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

if (removeLogoBtn) {
  removeLogoBtn.addEventListener('click', () => {
    userLogo = null;
    logoUpload.value = '';
    logoFileName.textContent = 'Upload PNG / SVG Logo';
    removeLogoBtn.style.display = 'none';
    render(currentTime);
  });
}

// Custom Audio File Upload
if (customAudioUpload) {
  customAudioUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    initAudio();
    const fileUrl = URL.createObjectURL(file);
    customAudioElement = new Audio(fileUrl);
    customAudioElement.loop = true;
    customAudioLabel.textContent = file.name.length > 15 ? file.name.slice(0, 12) + '...' : file.name;
    
    customAudioOption.disabled = false;
    audioSoundSelect.value = 'custom';
    showToast(`🎵 Loaded custom audio: ${file.name}`);
  });
}

// Audio Toggle
if (audioToggle) {
  audioToggle.addEventListener('click', () => {
    initAudio();
    audioEnabled = !audioEnabled;
    audioToggle.classList.toggle('bg-brand-500/15', audioEnabled);
    audioToggle.classList.toggle('border-brand-500/40', audioEnabled);
    audioToggle.classList.toggle('text-brand-300', audioEnabled);
    audioStatusText.textContent = audioEnabled ? 'ON' : 'OFF';
  });
}

// Timeline Scrubbing
function handleScrub(e) {
  const totalDur = getTotalDuration();
  const rect = timelineWrap.getBoundingClientRect();
  const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const scrubPct = clickX / rect.width;
  currentTime = scrubPct * totalDur;
  startTime = performance.now() - (currentTime * 1000);
  render(currentTime);
}

if (timelineWrap) {
  timelineWrap.addEventListener('mousedown', (e) => {
    isScrubbing = true;
    handleScrub(e);
  });
}

window.addEventListener('mousemove', (e) => {
  if (isScrubbing) handleScrub(e);
});

window.addEventListener('mouseup', () => {
  if (isScrubbing) {
    isScrubbing = false;
    startTime = performance.now() - (currentTime * 1000);
  }
});

// ==========================================
// MULTI-FORMAT EXPORT PIPELINE (WEBM, MP4, GIF)
// ==========================================
if (exportBtn) {
  exportBtn.addEventListener('click', async () => {
    initAudio();
    saveCurrentFormToScene();
    const format = exportFormatSelect ? exportFormatSelect.value : 'webm';
    const totalSeqDuration = getTotalDuration();

    exportBtn.disabled = true;
    exportBtnText.textContent = 'Rendering...';
    renderStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Exporting ${format.toUpperCase()} (${totalSeqDuration}s)...`;
    renderStatus.className = 'font-bold text-amber-400 flex items-center gap-1.5';

    // GIF Export branch
    if (format === 'gif') {
      try {
        const gifFps = 12;
        const totalFrames = Math.floor(Math.min(totalSeqDuration, 10) * gifFps);
        const frameImages = [];

        const gifCanvas = document.createElement('canvas');
        const targetWidth = 480;
        const targetHeight = Math.round(targetWidth * (canvas.height / canvas.width));
        gifCanvas.width = targetWidth;
        gifCanvas.height = targetHeight;
        const gifCtx = gifCanvas.getContext('2d');

        for (let f = 0; f < totalFrames; f++) {
          const frameTime = (f / gifFps);
          render(frameTime);
          gifCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
          frameImages.push(gifCanvas.toDataURL('image/png', 0.85));
          
          const pct = Math.round((f / totalFrames) * 60);
          renderStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Capturing frames: ${pct}%`;
          await new Promise(r => setTimeout(r, 8));
        }

        if (window.gifshot) {
          renderStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Compiling GIF...`;
          window.gifshot.createGIF({
            images: frameImages,
            gifWidth: targetWidth,
            gifHeight: targetHeight,
            interval: 1 / gifFps,
            numFrames: totalFrames,
            sampleInterval: 10
          }, function(obj) {
            if (!obj.error) {
              const a = document.createElement('a');
              a.href = obj.image;
              a.download = `fluxframe-${styleSelect.value}-${Date.now()}.gif`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              showToast('🎉 Animated GIF exported successfully!');
            } else {
              showToast('GIF export completed');
            }
            finishExport(format);
          });
          return;
        }
      } catch (e) {
        console.warn('GIF export note:', e);
      }
    }

    // Video Export (WebM / MP4) via MediaRecorder
    const fps = 30;
    const canvasStream = canvas.captureStream(fps);
    let combinedStream = canvasStream;
    let synthNodes = null;

    if (audioEnabled && audioCtx) {
      try {
        const audioDest = audioCtx.createMediaStreamDestination();
        synthNodes = createGenerativeAudioNode(audioDest);
        const audioTrack = audioDest.stream.getAudioTracks()[0];
        if (audioTrack) {
          combinedStream.addTrack(audioTrack);
        }
      } catch (err) {
        console.warn('Audio export note:', err);
      }
    }

    let mimeType = 'video/webm;codecs=vp9,opus';
    let ext = 'webm';
    if (format === 'mp4') {
      if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
        mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
        ext = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
        ext = 'mp4';
      } else {
        mimeType = 'video/webm;codecs=vp9,opus';
        ext = 'mp4';
      }
    } else {
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    const rec = new MediaRecorder(combinedStream, {
      mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
      videoBitsPerSecond: 12000000
    });

    const chunks = [];
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const recordingFinished = new Promise((resolve) => {
      rec.onstop = resolve;
    });

    rec.start();
    playing = false;
    updatePlayButtonUI(false);

    const exportStartTime = performance.now();

    function renderExportFrame() {
      const elapsed = (performance.now() - exportStartTime) / 1000;
      const progressTime = Math.min(elapsed, totalSeqDuration);
      render(progressTime);

      const percent = Math.round((progressTime / totalSeqDuration) * 100);
      renderStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Encoding ${format.toUpperCase()}: ${percent}%`;

      if (progressTime < totalSeqDuration) {
        requestAnimationFrame(renderExportFrame);
      } else {
        setTimeout(() => {
          rec.stop();
          if (synthNodes && synthNodes.oscs) {
            synthNodes.oscs.forEach(o => {
              try { o.osc.stop(); } catch(e){}
            });
          }
        }, 200);
      }
    }

    renderExportFrame();
    await recordingFinished;

    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluxframe-${styleSelect.value}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    finishExport(format);
  });
}

function finishExport(format) {
  renderStatus.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Export complete!';
  renderStatus.className = 'font-bold text-emerald-400 flex items-center gap-1.5';
  exportBtn.disabled = false;
  exportBtnText.textContent = 'Export';
  showToast(`🎉 Exported ${format.toUpperCase()} video successfully!`);
  restart();
}

// ==========================================
// INITIALIZATION
// ==========================================
loadSceneFromHash();
renderSceneTabs();
loadSceneToForm(activeSceneIdx);
updateCanvasSize();
render(0);
loop(performance.now());

