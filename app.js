// ==========================================
// FLUXFRAME STUDIO PRO — PROCEDURAL ENGINE
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
const progressBar = document.getElementById('progressBar');
const progressHandle = document.getElementById('progressHandle');
const timelineWrap = document.getElementById('timelineWrap');
const timeLabel = document.getElementById('timeLabel');
const renderStatus = document.getElementById('renderStatus');
const resolutionBadge = document.getElementById('resolutionBadge');
const playBtn = document.getElementById('playBtn');
const playBtnText = document.getElementById('playBtnText');
const playIcon = document.getElementById('playIcon');
const restartBtn = document.getElementById('restartBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const exportBtnText = document.getElementById('exportBtnText');
const customColorPicker = document.getElementById('customColorPicker');
const logoUpload = document.getElementById('logoUpload');
const logoFileName = document.getElementById('logoFileName');
const removeLogoBtn = document.getElementById('removeLogoBtn');
const audioToggle = document.getElementById('audioToggle');
const audioSoundSelect = document.getElementById('audioSoundSelect');
const audioStatusText = document.getElementById('audioStatusText');

// State
let accent = '#6366f1';
let playing = true;
let startTime = performance.now();
let currentTime = 0;
let duration = 5;
let raf;
let isScrubbing = false;
let userLogo = null;
let audioEnabled = true;
let audioCtx = null;

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

      float time = t * 0.35;
      vec2 q = vec2(
        p.x + sin(time * 0.6 + p.y * 2.0) * 0.25,
        p.y + cos(time * 0.5 + p.x * 2.2) * 0.25
      );
      
      float wave1 = sin(q.x * 3.5 + q.y * 2.8 + time);
      float wave2 = cos(q.y * 4.0 - q.x * 3.2 - time * 0.8);
      float blend = (wave1 + wave2) * 0.5;

      vec3 bg = vec3(0.04, 0.05, 0.09);
      vec3 highlight = accent + vec3(0.12, 0.15, 0.22);
      vec3 secondary = vec3(0.08, 0.12, 0.2) + accent * 0.3;

      vec3 col = mix(bg, secondary, smoothstep(-0.8, 0.4, blend));
      col = mix(col, highlight, smoothstep(0.1, 0.9, blend) * 0.7);

      float centerGlow = exp(-length(p) * 1.8);
      col += accent * centerGlow * 0.22;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 2. Obsidian: Deep studio darkroom with ambient bokeh spheres
  obsidian: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      vec3 base = vec3(0.035, 0.04, 0.06);
      vec2 light1 = vec2(sin(t * 0.4) * 0.35, cos(t * 0.3) * 0.2);
      vec2 light2 = vec2(cos(t * 0.35) * 0.4, sin(t * 0.45) * 0.25);
      
      float d1 = length(p - light1);
      float d2 = length(p - light2);

      float glow1 = exp(-d1 * 2.2);
      float glow2 = exp(-d2 * 2.8);

      vec3 col = base;
      col += accent * (glow1 * 0.45 + glow2 * 0.35);
      col += vec3(0.05, 0.08, 0.12) * exp(-length(p) * 1.5);
      col *= 1.0 - length(uv - 0.5) * 0.45;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 3. Prism Glass: Refractive iridescent dispersion caustics
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
      vec3 bg = vec3(0.03, 0.035, 0.055);
      
      float sweep = sin(p.x * 2.5 + p.y * 3.0 + t * 0.5) * 0.5 + 0.5;
      float ring = exp(-abs(dist - (0.4 + sin(t * 0.3) * 0.1)) * 3.5);

      vec3 prismCol = vec3(
        sin(sweep * 3.14 + 0.0) * 0.5 + 0.5,
        sin(sweep * 3.14 + 1.2) * 0.5 + 0.5,
        sin(sweep * 3.14 + 2.4) * 0.5 + 0.5
      );

      vec3 col = bg + mix(accent, prismCol, 0.35) * (sweep * 0.35 + ring * 0.4);
      col += accent * exp(-dist * 2.0) * 0.25;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 4. Editorial: Minimal architectural beam & studio gradient
  editorial: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      vec3 top = vec3(0.07, 0.08, 0.12);
      vec3 btm = vec3(0.02, 0.025, 0.04);
      
      vec3 col = mix(btm, top, uv.y + sin(uv.x * 2.0 + t * 0.2) * 0.1);
      float beam = exp(-abs(p.x * 0.7 + p.y * 1.0 + sin(t * 0.3) * 0.15) * 2.5);
      col += accent * beam * 0.3;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 5. Cosmic Aurora: Fluid northern lights plasma ribbons
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
      for (int i = 0; i < 6; i++) {
        float fi = float(i);
        vec2 q = p * (1.1 + fi * 0.18);
        q += vec2(sin(t * 0.25 + fi), cos(t * 0.3 - fi)) * 0.08;
        v += 0.004 / (abs(sin(q.x * 7.0 + q.y * 4.0 + t * (0.4 + fi * 0.05))) * 14.0 + length(q) * 6.0);
      }

      vec3 base = vec3(0.015, 0.02, 0.04);
      vec3 col = base + accent * (v * 2.8) + vec3(0.0, 0.25, 0.35) * (v * 1.2);
      col += vec3(0.02, 0.04, 0.09) * exp(-length(p) * 2.8);
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 6. Solar Glow: Warm cinematic horizon rays & atmospheric haze
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

      float rays = sin(angle * 12.0 + t * 0.6) * 0.5 + 0.5;
      float sunGlow = 0.08 / (dist + 0.12);
      
      vec3 warmAccent = mix(accent, vec3(0.98, 0.55, 0.15), 0.5);
      vec3 col = vec3(0.03, 0.02, 0.05);
      col += warmAccent * sunGlow * (0.8 + rays * 0.2);
      col += vec3(0.9, 0.4, 0.1) * exp(-dist * 3.5) * 0.6;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 7. Quantum Nebula: Multi-layered ethereal cosmic cloud
  nebula: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      float d = length(p);
      float cloud = sin(p.x * 4.0 + sin(p.y * 3.0 + t * 0.3) * 2.0) * cos(p.y * 4.0 + t * 0.4);
      cloud = smoothstep(-0.8, 0.8, cloud);

      vec3 col = vec3(0.02, 0.025, 0.05);
      col += accent * cloud * (0.35 / (d + 0.3));
      col += vec3(0.4, 0.1, 0.6) * (1.0 - cloud) * 0.15;
      col += vec3(0.8, 0.9, 1.0) * exp(-d * 4.0) * 0.18;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 8. Horizon Wave: Ultra-fine perspective synth lines
  cyber: `
    precision highp float;
    uniform float t;
    uniform vec2 r;
    uniform vec3 accent;

    void main() {
      vec2 uv = gl_FragCoord.xy / r;
      vec2 p = uv - 0.5;
      p.x *= r.x / r.y;

      vec3 col = vec3(0.02, 0.025, 0.05);
      float horizon = 0.02;

      if (p.y < horizon) {
        float depth = 0.16 / (horizon - p.y);
        vec2 grid = vec2(p.x * depth * 0.8, depth + t * 1.5);
        float line = min(abs(fract(grid.x) - 0.5), abs(fract(grid.y) - 0.5)) * 20.0;
        float mask = smoothstep(1.0, 0.0, line);
        float fog = exp(-depth * 0.12);
        col += accent * mask * fog * 0.65;
      } else {
        float glow = exp(-abs(p.y - horizon) * 14.0);
        col += accent * glow * 0.35;
      }
      gl_FragColor = vec4(col, 1.0);
    }
  `
};

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
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
// EXPANDED GENERATIVE AUDIO SOUNDSCAPES
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
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.24, audioCtx.currentTime);
  masterGain.connect(destination || audioCtx.destination);

  let freqs = [65.41, 98.0, 146.83, 164.81, 246.94]; // Ambient C Maj9
  let cutoff = 340;

  if (soundType === 'cosmic') {
    freqs = [55.0, 110.0, 164.81, 220.0]; // A Minor deep cosmic
    cutoff = 220;
  } else if (soundType === 'lofi') {
    freqs = [87.31, 130.81, 164.81, 196.0]; // F Maj7 warm
    cutoff = 400;
  }

  const oscs = freqs.map((f, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = soundType === 'lofi' && i === 0 ? 'triangle' : 'sine';
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

  // 1. Render WebGL Shader
  gl.useProgram(progData.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  const posLoc = gl.getAttribLocation(progData.program, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  gl.uniform1f(progData.tLoc, currentTime);
  gl.uniform2f(progData.rLoc, glCanvas.width, glCanvas.height);
  gl.uniform3fv(progData.aLoc, new Float32Array(hexToRgb(accent)));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // 2. Composite onto Visible 2D Canvas
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(glCanvas, 0, 0, w, h);

  const scale = Math.min(w, h) / 1000;

  // 3. Smooth Vignette Mask
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.72);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.52)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // 4. Kinetic Easing calculation
  const motionMode = motionSelect.value || 'fade-rise';
  let easeIn = 1 - Math.pow(1 - Math.min(progress / 0.2, 1), 3);
  let fadeOut = Math.min(1, Math.max(0, (progress - 0.88) / 0.12));
  let masterAlpha = easeIn * (1 - fadeOut);

  let animScale = 1.0;
  let animOffsetY = (1 - easeIn) * 35 * scale;

  if (motionMode === 'scale-pop') {
    animScale = 0.85 + easeIn * 0.15;
    animOffsetY = (1 - easeIn) * 15 * scale;
  } else if (motionMode === 'kinetic-drift') {
    animScale = 1.0 + progress * 0.06;
    animOffsetY = (1 - easeIn) * 25 * scale;
  }

  // 5. Draw Optional Logo
  let contentOffsetY = 0;
  if (userLogo && userLogo.complete) {
    ctx.save();
    ctx.globalAlpha = masterAlpha;
    const logoMaxDim = 95 * scale;
    let lw = userLogo.width;
    let lh = userLogo.height;
    const logoRatio = Math.min(logoMaxDim / lw, logoMaxDim / lh);
    lw *= logoRatio;
    lh *= logoRatio;

    const logoY = h * 0.32 - lh / 2 + animOffsetY;
    ctx.drawImage(userLogo, w / 2 - lw / 2, logoY, lw, lh);
    contentOffsetY = lh * 0.42;
    ctx.restore();
  }

  // 6. Draw Category Badge Pill (if provided)
  const badgeText = (badgeInput.value || '').trim().toUpperCase();
  if (badgeText) {
    ctx.save();
    ctx.globalAlpha = masterAlpha * 0.9;
    ctx.font = `700 ${Math.max(11, 13 * scale)}px '${fontSelect.value}', sans-serif`;
    const textWidth = ctx.measureText(badgeText).width;
    const pillW = textWidth + 28 * scale;
    const pillH = 26 * scale;
    const pillX = w / 2 - pillW / 2;
    const pillY = h * 0.38 + contentOffsetY + animOffsetY;

    // Glass pill background
    ctx.fillStyle = 'rgba(15, 20, 35, 0.7)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 13 * scale);
    ctx.fill();

    // Accent border
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // Text inside pill
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(badgeText, w / 2, pillY + pillH / 2);
    ctx.restore();
    contentOffsetY += pillH * 0.8;
  }

  // 7. Kinetic Typography Rendering
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = masterAlpha;

  const rawTitle = (titleInput.value || 'DESIGN THE FUTURE').toUpperCase().trim();
  const sub = subtitleInput.value || '';
  const currentFont = fontSelect.value || 'Plus Jakarta Sans';

  let mainSize = (currentStyle === 'editorial' ? 88 : 94) * scale;
  if (w < h) mainSize *= 0.75;

  const centerY = h * 0.52 + contentOffsetY + animOffsetY;

  // Title rendering with scale & glow
  ctx.font = `800 ${mainSize * animScale}px '${currentFont}', sans-serif`;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 24 * scale;
  ctx.fillStyle = '#ffffff';

  const words = rawTitle.split(' ');
  if (words.length > 2) {
    const half = Math.ceil(words.length / 2);
    const line1 = words.slice(0, half).join(' ');
    const line2 = words.slice(half).join(' ');

    ctx.fillText(line1, w / 2, centerY - mainSize * 0.55);
    ctx.fillStyle = accent;
    ctx.fillText(line2, w / 2, centerY + mainSize * 0.55);
  } else {
    ctx.fillText(rawTitle, w / 2, centerY);
  }

  // Subtitle
  ctx.shadowBlur = 0;
  ctx.globalAlpha = masterAlpha * 0.86;
  ctx.font = `500 ${Math.max(18, 25 * scale)}px 'Inter', sans-serif`;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(sub, w / 2, centerY + (words.length > 2 ? mainSize * 1.45 : mainSize * 1.15));

  // Studio Watermark
  ctx.globalAlpha = 0.45;
  ctx.font = `600 ${Math.max(11, 13 * scale)}px '${currentFont}', sans-serif`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('FLUXFRAME STUDIO', w / 2, h * 0.93);
  ctx.restore();

  // 8. Timeline Sync
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
    playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
  } else {
    playBtnText.textContent = 'Play';
    playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
  }
}

function updateSettings() {
  duration = Number(durationSelect.value);
  updateCanvasSize();
  restart();
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

// Live input re-renders
titleInput.addEventListener('input', () => render(currentTime));
subtitleInput.addEventListener('input', () => render(currentTime));
badgeInput.addEventListener('input', () => render(currentTime));
fontSelect.addEventListener('change', () => render(currentTime));
motionSelect.addEventListener('change', () => restart());

// Color Chips
const chips = document.querySelectorAll('.chip');
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    accent = chip.dataset.color;
    customColorPicker.value = accent;
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent-glow', `${accent}40`);
    chips.forEach(c => c.classList.toggle('active', c === chip));
    restart();
  });
});

// Custom Color Picker
customColorPicker.addEventListener('input', (e) => {
  accent = e.target.value;
  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--accent-glow', `${accent}40`);
  chips.forEach(c => c.classList.remove('active'));
  render(currentTime);
});

// Quick Presets
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = btn.dataset.preset;
    if (p === 'product') {
      badgeInput.value = 'VERSION 2.0';
      titleInput.value = 'SUPERCHARGE WORKFLOW';
      subtitleInput.value = 'Built for high performance teams & creators';
      styleSelect.value = 'silk';
      accent = '#6366f1';
    } else if (p === 'event') {
      badgeInput.value = 'LIVE KEYNOTE';
      titleInput.value = 'GLOBAL SUMMIT 2026';
      subtitleInput.value = 'Streamed worldwide on October 24th';
      styleSelect.value = 'solar';
      accent = '#f59e0b';
    } else if (p === 'podcast') {
      badgeInput.value = 'EPISODE 42';
      titleInput.value = 'FUTURE OF AI';
      subtitleInput.value = 'Conversations with leaders shaping the industry';
      styleSelect.value = 'obsidian';
      accent = '#06b6d4';
    } else if (p === 'reels') {
      badgeInput.value = 'TRENDING NOW';
      titleInput.value = 'CREATE MOTION';
      subtitleInput.value = 'Instant client-side procedural video generator';
      styleSelect.value = 'prism';
      aspectSelect.value = '9:16';
      accent = '#f43f5e';
    }

    customColorPicker.value = accent;
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent-glow', `${accent}40`);

    styleCards.forEach(c => c.classList.toggle('active', c.dataset.style === styleSelect.value));
    aspectButtons.forEach(b => b.classList.toggle('active', b.dataset.aspect === aspectSelect.value));
    chips.forEach(c => c.classList.toggle('active', c.dataset.color === accent));
    updateSettings();
  });
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
  accent = '#6366f1';
  customColorPicker.value = accent;
  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--accent-glow', 'rgba(99, 102, 241, 0.25)');

  styleCards.forEach(c => c.classList.toggle('active', c.dataset.style === 'silk'));
  aspectButtons.forEach(b => b.classList.toggle('active', b.dataset.aspect === '16:9'));
  durationButtons.forEach(b => b.classList.toggle('active', b.dataset.duration === '5'));
  chips.forEach(c => c.classList.toggle('active', c.dataset.color === accent));

  userLogo = null;
  logoUpload.value = '';
  logoFileName.textContent = 'Upload PNG or SVG logo';
  removeLogoBtn.style.display = 'none';
  updateSettings();
});

// Logo Upload
logoUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  logoFileName.textContent = file.name.length > 20 ? file.name.slice(0, 17) + '...' : file.name;
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
  logoFileName.textContent = 'Upload PNG or SVG logo';
  removeLogoBtn.style.display = 'none';
  render(currentTime);
});

// Audio Toggle
audioToggle.addEventListener('click', () => {
  initAudio();
  audioEnabled = !audioEnabled;
  audioToggle.classList.toggle('active', audioEnabled);
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
  renderStatus.textContent = 'Exporting video...';

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
    renderStatus.textContent = `Encoding frame: ${percent}%`;

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

  renderStatus.textContent = 'Export complete!';
  exportBtn.disabled = false;
  exportBtnText.textContent = 'Export Video';
  restart();
});

// ==========================================
// INITIALIZATION
// ==========================================
updateCanvasSize();
render(0);
loop(performance.now());
