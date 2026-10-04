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

// Cloudflare AI Modal Elements
const aiConfigModalBtn = document.getElementById('aiConfigModalBtn');
const aiConfigModal = document.getElementById('aiConfigModal');
const aiModalCard = document.getElementById('aiModalCard');
const closeAiModalBtn = document.getElementById('closeAiModalBtn');
const saveAiConfigBtn = document.getElementById('saveAiConfigBtn');
const cfAccountIdInput = document.getElementById('cfAccountIdInput');
const cfApiTokenInput = document.getElementById('cfApiTokenInput');

// State
let accent = '#6366f1';
let playing = true;
let startTime = performance.now();
let currentTime = 0;
let duration = 5;
let speed = 1.0;
let enableFilmGrain = false;
let textAlign = 'center';
let raf;
let isScrubbing = false;
let userLogo = null;
let customAudioElement = null;
let audioEnabled = true;
let audioCtx = null;

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
// 2D CANVAS COMPOSITOR & KINETIC TYPOGRAPHY
// ==========================================
function render(time) {
  currentTime = Math.max(0, Math.min(time, duration));
  const progress = currentTime / duration;
  const currentStyle = styleSelect.value || 'silk';
  const progData = programs[currentStyle] || programs.silk;

  // 1. Render WebGL Shader with Speed
  gl.useProgram(progData.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  const posLoc = gl.getAttribLocation(progData.program, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  gl.uniform1f(progData.tLoc, currentTime * speed);
  gl.uniform2f(progData.rLoc, glCanvas.width, glCanvas.height);
  gl.uniform3fv(progData.aLoc, new Float32Array(hexToRgb(accent)));
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

  // 4. Vignette Mask
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.72);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // 5. Kinetic Motion Easing
  const motionMode = motionSelect.value || 'fade-rise';
  let easeIn = 1 - Math.pow(1 - Math.min(progress / 0.2, 1), 3);
  let fadeOut = Math.min(1, Math.max(0, (progress - 0.88) / 0.12));
  let masterAlpha = easeIn * (1 - fadeOut);

  let animScale = 1.0;
  let animOffsetY = (1 - easeIn) * 35 * scale;

  if (motionMode === 'scale-pop') {
    animScale = 0.84 + easeIn * 0.16;
    animOffsetY = (1 - easeIn) * 15 * scale;
  } else if (motionMode === 'kinetic-drift') {
    animScale = 1.0 + progress * 0.07;
    animOffsetY = (1 - easeIn) * 22 * scale;
  } else if (motionMode === 'glitch-flash') {
    if (progress < 0.08) {
      masterAlpha *= (Math.sin(progress * 120.0) > 0 ? 1.0 : 0.2);
    }
  }

  // 6. Draw Logo with Position Controls
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

  // 7. Draw Category Badge Pill
  const badgeText = (badgeInput.value || '').trim().toUpperCase();
  if (badgeText) {
    ctx.save();
    ctx.globalAlpha = masterAlpha * 0.94;
    ctx.font = `700 ${Math.max(12, 14 * scale)}px '${fontSelect.value}', sans-serif`;
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

    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.8 * scale;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(badgeText, pillX + pillW / 2, pillY + pillH / 2 + 1);
    ctx.restore();
    contentOffsetY += pillH * 0.85;
  }

  // 8. Kinetic Typography Rendering
  ctx.save();
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = masterAlpha;

  const rawTitle = (titleInput.value || 'DESIGN THE FUTURE').toUpperCase().trim();
  const sub = subtitleInput.value || '';
  const currentFont = fontSelect.value || 'Plus Jakarta Sans';

  let mainSize = (currentStyle === 'editorial' ? 88 : 96) * scale;
  if (w < h) mainSize *= 0.75;

  const centerY = h * 0.52 + contentOffsetY + animOffsetY;

  ctx.font = `800 ${mainSize * animScale}px '${currentFont}', sans-serif`;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 24 * scale;
  ctx.fillStyle = '#ffffff';

  const words = rawTitle.split(' ');
  if (words.length > 2) {
    const half = Math.ceil(words.length / 2);
    const line1 = words.slice(0, half).join(' ');
    const line2 = words.slice(half).join(' ');

    ctx.fillText(line1, anchorX, centerY - mainSize * 0.55);
    ctx.fillStyle = accent;
    ctx.fillText(line2, anchorX, centerY + mainSize * 0.55);
  } else {
    ctx.fillText(rawTitle, anchorX, centerY);
  }

  // Subtitle
  ctx.shadowBlur = 0;
  ctx.globalAlpha = masterAlpha * 0.86;
  ctx.font = `500 ${Math.max(18, 25 * scale)}px 'Inter', sans-serif`;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(sub, anchorX, centerY + (words.length > 2 ? mainSize * 1.45 : mainSize * 1.15));

  // Studio Watermark
  ctx.globalAlpha = 0.45;
  ctx.textAlign = 'center';
  ctx.font = `700 ${Math.max(11, 13 * scale)}px '${currentFont}', sans-serif`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('FLUXFRAME STUDIO', w / 2, h * 0.93);
  ctx.restore();

  // 9. Timeline Progress Bar Sync
  const pct = progress * 100;
  progressBar.style.width = `${pct}%`;
  if (progressHandle) progressHandle.style.left = `${pct}%`;

  const curSec = Math.floor(currentTime);
  const durSec = Math.floor(duration);
  timeLabel.textContent = `00:${String(curSec).padStart(2, '0')} / 00:${String(durSec).padStart(2, '0')}`;
}

// ==========================================
// PLAYBACK LOOP & CONTROLS
// ==========================================
function loop(now) {
  if (playing && !isScrubbing) {
    let elapsed = (now - startTime) / 1000;
    if (elapsed > duration) {
      startTime = now;
      elapsed = 0;
    }
    render(elapsed);
  }
  raf = requestAnimationFrame(loop);
}

function restart() {
  startTime = performance.now();
  playing = true;
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

  // If Cloudflare Account ID & Token are provided in LocalStorage, query Cloudflare Workers AI edge!
  if (cfAccountId && cfApiToken) {
    try {
      showToast('☁️ Calling Cloudflare Workers AI edge...');
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/meta/llama-3.3-70b-instruct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an AI motion designer. Return ONLY a JSON object with: { "badge": string, "title": string (max 4 words), "subtitle": string, "style": "silk"|"solar"|"aurora"|"cyber"|"chrome"|"obsidian"|"prism"|"warp", "accent": hex_color, "font": "Plus Jakarta Sans"|"Space Grotesk"|"Outfit"|"Syne"|"Cinzel"|"JetBrains Mono", "motion": "fade-rise"|"scale-pop"|"kinetic-drift"|"glitch-flash" }'
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

  // Instant Local AI Fallback (100% Client-Side & Private)
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
  if (parsed.accent) {
    accent = parsed.accent;
    customColorPicker.value = accent;
    document.documentElement.style.setProperty('--accent', accent);
  }

  document.querySelectorAll('.style-card').forEach(c => c.classList.toggle('active', c.dataset.style === styleSelect.value));
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.color === accent));
  
  showToast(`✨ Generated: "${parsed.title || prompt}"`);
  updateSettings();
}

function generateSceneFromPrompt(prompt) {
  const p = prompt.toLowerCase();

  let selectedStyle = 'silk';
  let selectedAccent = '#6366f1';
  let selectedFont = 'Plus Jakarta Sans';
  let selectedMotion = 'fade-rise';
  let badge = 'ANNOUNCEMENT';
  let title = 'BUILD THE FUTURE';
  let subtitle = 'The next generation platform is finally here';

  if (p.includes('cool') || p.includes('epic') || p.includes('hype') || p.includes('vibes') || p.includes('fire')) {
    selectedStyle = 'solar';
    selectedAccent = '#f59e0b';
    selectedFont = 'Outfit';
    selectedMotion = 'scale-pop';
    badge = 'HOT DROP';
    title = 'MAKE IT LEGENDARY';
    subtitle = 'Pure adrenaline and unmatched creative power';
  } else if (p.includes('cyber') || p.includes('synth') || p.includes('gaming') || p.includes('crypto') || p.includes('neon')) {
    selectedStyle = 'cyber';
    selectedAccent = '#ec4899';
    selectedFont = 'Space Grotesk';
    selectedMotion = 'glitch-flash';
    badge = 'SYNTHWAVE 2026';
    title = 'NEON PROTOCOL';
    subtitle = 'Decentralized high-speed gaming infrastructure';
  } else if (p.includes('solar') || p.includes('keynote') || p.includes('summit') || p.includes('event')) {
    selectedStyle = 'solar';
    selectedAccent = '#f59e0b';
    selectedFont = 'Outfit';
    selectedMotion = 'scale-pop';
    badge = 'GLOBAL KEYNOTE';
    title = 'IGNITE REVOLUTION';
    subtitle = 'Streaming worldwide live on all platforms';
  } else if (p.includes('aurora') || p.includes('space') || p.includes('nature') || p.includes('ai') || p.includes('cosmic')) {
    selectedStyle = 'aurora';
    selectedAccent = '#10b981';
    selectedFont = 'Plus Jakarta Sans';
    selectedMotion = 'kinetic-drift';
    badge = 'AUTONOMOUS AI';
    title = 'QUANTUM HORIZONS';
    subtitle = 'Self-evolving neural computing architecture';
  } else if (p.includes('luxury') || p.includes('fashion') || p.includes('perfume') || p.includes('editorial') || p.includes('beauty')) {
    selectedStyle = 'prism';
    selectedAccent = '#a855f7';
    selectedFont = 'Cinzel';
    selectedMotion = 'fade-rise';
    badge = 'EDITION NO. 1';
    title = 'ETERNAL BEAUTY';
    subtitle = 'Crafted with timeless precision and care';
  } else if (p.includes('warp') || p.includes('speed') || p.includes('fast') || p.includes('cloud') || p.includes('infra')) {
    selectedStyle = 'warp';
    selectedAccent = '#06b6d4';
    selectedFont = 'JetBrains Mono';
    selectedMotion = 'scale-pop';
    badge = 'ULTRA SPEED';
    title = 'HYPER PERFORMANCE';
    subtitle = 'Sub-millisecond global execution engine';
  } else if (p.includes('chrome') || p.includes('metal') || p.includes('car') || p.includes('hardware') || p.includes('apple')) {
    selectedStyle = 'chrome';
    selectedAccent = '#06b6d4';
    selectedFont = 'Syne';
    selectedMotion = 'scale-pop';
    badge = 'FLAGSHIP HARDWARE';
    title = 'PRECISION CRAFT';
    subtitle = 'Aerospace grade materials forged for durability';
  } else if (p.includes('dark') || p.includes('obsidian') || p.includes('podcast') || p.includes('audio')) {
    selectedStyle = 'obsidian';
    selectedAccent = '#6366f1';
    selectedFont = 'Space Grotesk';
    selectedMotion = 'fade-rise';
    badge = 'EPISODE 42';
    title = 'MIDNIGHT TALKS';
    subtitle = 'Deep conversations with the pioneers of tech';
  }

  applyParsedScene({
    badge,
    title,
    subtitle,
    style: selectedStyle,
    font: selectedFont,
    motion: selectedMotion,
    accent: selectedAccent
  }, prompt);
}

// AI Button & Enter key
aiGenerateBtn.addEventListener('click', () => generateSceneWithAI(aiPromptInput.value));
aiPromptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generateSceneWithAI(aiPromptInput.value);
});

// Cloudflare AI Modal Controls
aiConfigModalBtn.addEventListener('click', () => {
  aiConfigModal.classList.remove('opacity-0', 'pointer-events-none');
  aiModalCard.classList.remove('scale-95');
  aiModalCard.classList.add('scale-100');
});

function closeAiModal() {
  aiConfigModal.classList.add('opacity-0', 'pointer-events-none');
  aiModalCard.classList.remove('scale-100');
  aiModalCard.classList.add('scale-95');
}

closeAiModalBtn.addEventListener('click', closeAiModal);
aiConfigModal.addEventListener('click', (e) => {
  if (e.target === aiConfigModal) closeAiModal();
});

saveAiConfigBtn.addEventListener('click', () => {
  cfAccountId = cfAccountIdInput.value.trim();
  cfApiToken = cfApiTokenInput.value.trim();
  localStorage.setItem('ff_cf_account_id', cfAccountId);
  localStorage.setItem('ff_cf_api_token', cfApiToken);
  closeAiModal();
  showToast(cfAccountId ? '☁️ Cloudflare Workers AI configured!' : '⚙️ Saved settings');
});

// ==========================================
// 4K SNAPSHOT FRAME DOWNLOAD (PNG)
// ==========================================
snapshotBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `fluxframe-poster-${styleSelect.value}-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
  showToast('📸 4K Poster Snapshot downloaded!');
});

// ==========================================
// SHAREABLE SCENE URL (HASH ENCODING)
// ==========================================
shareLinkBtn.addEventListener('click', () => {
  const state = {
    b: badgeInput.value,
    t: titleInput.value,
    s: subtitleInput.value,
    st: styleSelect.value,
    c: accent,
    f: fontSelect.value,
    m: motionSelect.value,
    a: aspectSelect.value,
    d: durationSelect.value
  };
  const hash = encodeURIComponent(JSON.stringify(state));
  const fullUrl = `${window.location.origin}${window.location.pathname}#scene=${hash}`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(fullUrl);
    showToast('🔗 Shareable scene URL copied to clipboard!');
  }
});

// Load state from Hash on start
function loadSceneFromHash() {
  if (window.location.hash && window.location.hash.includes('scene=')) {
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
speedSlider.addEventListener('input', (e) => {
  speed = parseFloat(e.target.value);
  speedValueLabel.textContent = `${speed.toFixed(1)}x`;
  render(currentTime);
});

// Film Grain Toggle
grainToggle.addEventListener('click', () => {
  enableFilmGrain = !enableFilmGrain;
  grainToggle.classList.toggle('bg-brand-500', enableFilmGrain);
  grainToggle.classList.toggle('bg-dark-700', !enableFilmGrain);
  grainToggleKnob.classList.toggle('translate-x-5', enableFilmGrain);
  render(currentTime);
});

// Live input re-renders
titleInput.addEventListener('input', () => render(currentTime));
subtitleInput.addEventListener('input', () => render(currentTime));
badgeInput.addEventListener('input', () => render(currentTime));
fontSelect.addEventListener('change', () => render(currentTime));
motionSelect.addEventListener('change', () => restart());
if (logoPosSelect) logoPosSelect.addEventListener('change', () => render(currentTime));

// Color Chips
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    accent = chip.dataset.color;
    customColorPicker.value = accent;
    document.documentElement.style.setProperty('--accent', accent);
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip));
    restart();
  });
});

// Custom Color Picker
customColorPicker.addEventListener('input', (e) => {
  accent = e.target.value;
  document.documentElement.style.setProperty('--accent', accent);
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  render(currentTime);
});

// Quick Presets Trigger
quickPresetSelect.addEventListener('change', (e) => {
  const p = e.target.value;
  if (p === 'launch') generateSceneFromPrompt('Product launch modern feature drop');
  else if (p === 'solar') generateSceneFromPrompt('Solar flare fiery keynote summit');
  else if (p === 'cyber') generateSceneFromPrompt('Cyberpunk synthwave gaming tournament');
  else if (p === 'aurora') generateSceneFromPrompt('Cosmic aurora northern intelligence');
  else if (p === 'reels') {
    generateSceneFromPrompt('Viral story reel trend');
    aspectSelect.value = '9:16';
    aspectButtons.forEach(b => b.classList.toggle('active', b.dataset.aspect === '9:16'));
    updateSettings();
  } else if (p === 'podcast') {
    generateSceneFromPrompt('Podcast audio episode discussion');
  }
  quickPresetSelect.selectedIndex = 0;
});

// Play / Pause Toggle
playBtn.addEventListener('click', () => {
  initAudio();
  playing = !playing;
  if (playing) {
    startTime = performance.now() - (currentTime * 1000);
  }
  updatePlayButtonUI(playing);
});

// Restart Button
restartBtn.addEventListener('click', restart);

// Reset Button
clearBtn.addEventListener('click', () => {
  badgeInput.value = 'FEATURE LAUNCH';
  titleInput.value = 'DESIGN THE FUTURE';
  subtitleInput.value = 'High-fidelity procedural motion graphics in real-time';
  styleSelect.value = 'silk';
  durationSelect.value = '5';
  aspectSelect.value = '16:9';
  fontSelect.value = 'Plus Jakarta Sans';
  motionSelect.value = 'fade-rise';
  speedSlider.value = 1.0;
  speed = 1.0;
  speedValueLabel.textContent = '1.0x';
  enableFilmGrain = false;
  grainToggle.classList.remove('bg-brand-500');
  grainToggle.classList.add('bg-dark-700');
  grainToggleKnob.classList.remove('translate-x-5');
  accent = '#6366f1';
  customColorPicker.value = accent;
  document.documentElement.style.setProperty('--accent', accent);

  styleCards.forEach(c => c.classList.toggle('active', c.dataset.style === 'silk'));
  aspectButtons.forEach(b => b.classList.toggle('active', b.dataset.aspect === '16:9'));
  durationButtons.forEach(b => b.classList.toggle('active', b.dataset.duration === '5'));
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.color === accent));

  userLogo = null;
  logoUpload.value = '';
  logoFileName.textContent = 'Upload PNG / SVG Logo';
  removeLogoBtn.style.display = 'none';
  showToast('Reset to default scene');
  updateSettings();
});

// Logo Upload
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

removeLogoBtn.addEventListener('click', () => {
  userLogo = null;
  logoUpload.value = '';
  logoFileName.textContent = 'Upload PNG / SVG Logo';
  removeLogoBtn.style.display = 'none';
  render(currentTime);
});

// Custom Audio File Upload
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

// Audio Toggle
audioToggle.addEventListener('click', () => {
  initAudio();
  audioEnabled = !audioEnabled;
  audioToggle.classList.toggle('bg-brand-500/15', audioEnabled);
  audioToggle.classList.toggle('border-brand-500/40', audioEnabled);
  audioToggle.classList.toggle('text-brand-300', audioEnabled);
  audioStatusText.textContent = audioEnabled ? 'ON' : 'OFF';
});

// Timeline Scrubbing
function handleScrub(e) {
  const rect = timelineWrap.getBoundingClientRect();
  const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const scrubPct = clickX / rect.width;
  currentTime = scrubPct * duration;
  startTime = performance.now() - (currentTime * 1000);
  render(currentTime);
}

timelineWrap.addEventListener('mousedown', (e) => {
  isScrubbing = true;
  handleScrub(e);
});

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
// EXPORT PIPELINE
// ==========================================
exportBtn.addEventListener('click', async () => {
  initAudio();
  exportBtn.disabled = true;
  exportBtnText.textContent = 'Rendering...';
  renderStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Exporting video...';
  renderStatus.className = 'font-bold text-amber-400 flex items-center gap-1.5';

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
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8,opus';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const rec = new MediaRecorder(combinedStream, {
    mimeType,
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
    const progressTime = Math.min(elapsed, duration);
    render(progressTime);

    const percent = Math.round((progressTime / duration) * 100);
    renderStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Encoding frame: ${percent}%`;

    if (progressTime < duration) {
      requestAnimationFrame(renderExportFrame);
    } else {
      setTimeout(() => {
        rec.stop();
        if (synthNodes && synthNodes.oscs) {
          synthNodes.oscs.forEach(o => {
            try { o.osc.stop(); } catch(e){}
          });
        }
      }, 150);
    }
  }

  renderExportFrame();

  await recordingFinished;

  const blob = new Blob(chunks, { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fluxframe-${styleSelect.value}-${Date.now()}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  renderStatus.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Export complete!';
  renderStatus.className = 'font-bold text-emerald-400 flex items-center gap-1.5';
  exportBtn.disabled = false;
  exportBtnText.textContent = 'Export Video';
  showToast('🎉 WebM video exported successfully!');
  restart();
});

// ==========================================
// INITIALIZATION
// ==========================================
loadSceneFromHash();
updateCanvasSize();
render(0);
loop(performance.now());
