// ==========================================
// FLUXFRAME STUDIO — MOTION VIDEO GENERATOR
// ==========================================

// DOM Elements
const canvas = document.getElementById('renderCanvas');
const ctx = canvas.getContext('2d');
const titleInput = document.getElementById('titleInput');
const subtitleInput = document.getElementById('subtitleInput');
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
// OFFSCREEN WEBGL MULTI-SHADER PIPELINE
// ==========================================
const glCanvas = document.createElement('canvas');
const gl = glCanvas.getContext('webgl', { alpha: false, antialias: true, preserveDrawingBuffer: true });

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Elegant, Studio-Grade Procedural Shaders
const shaders = {
  // 1. Silk Flow: Smooth, Apple/Stripe-style luxury fluid gradient mesh
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
      
      // Multi-octave organic silk waves
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

      // Soft center studio lighting
      float centerGlow = exp(-length(p) * 1.8);
      col += accent * centerGlow * 0.22;

      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 2. Obsidian Studio: Deep, cinematic darkroom with soft ambient bokeh
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
      
      // Moving ambient light spheres (bokeh)
      vec2 light1 = vec2(sin(t * 0.4) * 0.35, cos(t * 0.3) * 0.2);
      vec2 light2 = vec2(cos(t * 0.35) * 0.4, sin(t * 0.45) * 0.25);
      
      float d1 = length(p - light1);
      float d2 = length(p - light2);

      float glow1 = exp(-d1 * 2.2);
      float glow2 = exp(-d2 * 2.8);

      vec3 col = base;
      col += accent * (glow1 * 0.45 + glow2 * 0.35);
      col += vec3(0.05, 0.08, 0.12) * exp(-length(p) * 1.5);

      // Subtle atmospheric vignette
      col *= 1.0 - length(uv - 0.5) * 0.45;
      gl_FragColor = vec4(col, 1.0);
    }
  `,

  // 3. Prism Glass: Refractive, iridescent soft optical dispersion
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
      float angle = atan(p.y, p.x);

      vec3 bg = vec3(0.03, 0.035, 0.055);
      
      // Prism caustic sweep
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

  // 4. Editorial: Minimalist architectural gradient & clean studio light
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

      // Elegant soft diagonal beam
      float beam = exp(-abs(p.x * 0.7 + p.y * 1.0 + sin(t * 0.3) * 0.15) * 2.5);
      col += accent * beam * 0.3;

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
// GENERATIVE AMBIENT AUDIO
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

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
  masterGain.connect(destination || audioCtx.destination);

  // Modern cinematic ambient chord (C Maj9: C2, G2, D3, E3, B3)
  const freqs = [65.41, 98.0, 146.83, 164.81, 246.94];
  const oscs = freqs.map((f, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, audioCtx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320 + i * 80, audioCtx.currentTime);

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
// 2D CANVAS COMPOSITOR
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

  // 3. Smooth Vignette & Atmosphere
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.72);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // 4. Smooth Cinematic Easing
  const easeIn = 1 - Math.pow(1 - Math.min(progress / 0.2, 1), 3);
  const fadeOut = Math.min(1, Math.max(0, (progress - 0.88) / 0.12));
  const masterAlpha = easeIn * (1 - fadeOut);

  // 5. Draw Optional Logo
  let contentOffsetY = 0;
  if (userLogo && userLogo.complete) {
    ctx.save();
    ctx.globalAlpha = masterAlpha;
    const logoMaxDim = 100 * scale;
    let lw = userLogo.width;
    let lh = userLogo.height;
    const logoRatio = Math.min(logoMaxDim / lw, logoMaxDim / lh);
    lw *= logoRatio;
    lh *= logoRatio;

    const logoY = h * 0.34 - lh / 2 + (1 - easeIn) * 25 * scale;
    ctx.drawImage(userLogo, w / 2 - lw / 2, logoY, lw, lh);
    contentOffsetY = lh * 0.4;
    ctx.restore();
  }

  // 6. Modern Studio Typography
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = masterAlpha;

  const rawTitle = (titleInput.value || 'DESIGN THE FUTURE').toUpperCase().trim();
  const sub = subtitleInput.value || '';

  let mainSize = 92 * scale;
  if (w < h) mainSize *= 0.76;

  const centerY = h * 0.5 + contentOffsetY + (1 - easeIn) * 35 * scale;

  // Title with crisp soft glow
  ctx.font = `800 ${mainSize}px 'Plus Jakarta Sans', -apple-system, sans-serif`;
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
  ctx.globalAlpha = masterAlpha * 0.85;
  ctx.font = `500 ${Math.max(18, 25 * scale)}px 'Inter', -apple-system, sans-serif`;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(sub, w / 2, centerY + (words.length > 2 ? mainSize * 1.45 : mainSize * 1.15));

  // Studio Watermark / Footer
  ctx.globalAlpha = 0.45;
  ctx.font = `600 ${Math.max(11, 13 * scale)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('FLUXFRAME STUDIO', w / 2, h * 0.93);
  ctx.restore();

  // 7. Timeline Scrubber Sync
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
// EVENT LISTENERS & SEGMENTED CONTROLS
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

// Text input re-renders
titleInput.addEventListener('input', () => render(currentTime));
subtitleInput.addEventListener('input', () => render(currentTime));

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
  titleInput.value = 'DESIGN THE FUTURE';
  subtitleInput.value = 'High-fidelity motion graphics rendered in real-time';
  styleSelect.value = 'silk';
  durationSelect.value = '5';
  aspectSelect.value = '16:9';
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
  audioToggle.querySelector('.switch-badge').textContent = audioEnabled ? 'ON' : 'OFF';
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
    videoBitsPerSecond: 12000000 // 12 Mbps clean high-res
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
