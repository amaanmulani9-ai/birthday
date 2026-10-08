/**
 * ============================================================================
 * PROGRESSIVE STEP-BY-STEP BIRTHDAY FLOW
 * Next / Previous Stage Navigation, Interactive 3D Elements & Story Reader
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Exact classic original poem from repository ---
  const DEFAULT_STORY_MESSAGES = [
    "Today is...",
    "as beautiful as other days",
    "but you realize",
    "another year has gone",
    "in a blink of the eyes",
    "however...",
    "Do you know..?",
    "today is just special",
    "so special to you",
    "that's why",
    "Let's make it...",
    "the best celebration ever",
    "and let me share...",
    "a piece of happiness to you",
    "I made all this...",
    "as a birthday present to you",
    "thanks for being there",
    "thanks for the friendship we made",
    "thanks for everything",
    "I wish you all the best",
    "May your life be at ease",
    "May all your wishes come true",
    "Remember",
    "your ambitions",
    "you live as a free bird...",
    "flying in the blue sky",
    "Now things are different...",
    "real story of your life",
    "is just about to begin",
    "indeed..",
    "but...",
    "don't worry",
    "because...",
    "God has your back",
    "and",
    "this year will be better",
    "and I hope",
    "you'll find...",
    "happiness along the way",
    "keep your spirit up",
    "enjoy every single moment...",
    "that you experience today",
    "fill it with your most beautiful smile",
    "and make it the best memory..",
    "lastly...",
    "I'd like to wish you one more time",
    "a very happy birthday {NAME}! ✨💖🎉"
  ];

  const PRESET_MEMORIES = [
    { id: 1, src: 'bd1.jpg', title: 'Candlelight Cake', defaultCaption: 'Best moments with you ❤️' },
    { id: 2, src: 'bd2.jpg', title: 'Sparkler Night', defaultCaption: 'Glowing with joy & laughter ✨' },
    { id: 3, src: 'bd3.jpg', title: 'Party Confetti', defaultCaption: 'Celebrate every single second 🥂' },
    { id: 4, src: 'bd4.jpg', title: 'Celebration Feast', defaultCaption: 'Wishing you all the happiness 🎂' },
    { id: 5, src: 'bd5.jpg', title: 'Cherished Memories', defaultCaption: 'Forever grateful for you 🌟' }
  ];

  // --- State ---
  const state = {
    name: 'Amaan',
    birthDate: '',
    customMessage: '',
    useCustomMessage: false,
    backgroundTheme: 'potter', // 'potter' (Hogwarts 3D Default) or 'festive' (3D Balloons)
    photos: [
      { id: 1, src: 'bd1.jpg', caption: 'Best moments with you ❤️' },
      { id: 2, src: 'bd2.jpg', caption: 'Glowing with joy & laughter ✨' },
      { id: 3, src: 'bd3.jpg', caption: 'Celebrate every single second 🥂' },
      { id: 4, src: 'bd4.jpg', caption: 'Wishing you all the happiness 🎂' }
    ],
    activePhotoIndex: 0,
    photoCaption: 'Best moments with you ❤️',
    currentStage: 1, // 1: Name, 2: Balloons, 3: Cake, 4: Gift, 5: Story
    storyIndex: 0,
    isPlayingMusic: false,
    isCandleBlown: false,
    mousePos: { x: 0, y: 0 },
    is24hExpired: false,
    expirationTime: null,
    isPreviewMode: false
  };

  // --- Web Audio Synthesizer ---
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.4, gain = 0.25) {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function playSpellSound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98, 1760.00];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playTone(freq, 'sine', 0.45, 0.2);
          playTone(freq * 1.5, 'triangle', 0.2, 0.08);
        }, idx * 65);
      });
    } catch (e) {}
  }

  function playOwlHootSound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      // Soft fluty owl hoot (Hedwig call)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(370, t);
      osc1.frequency.linearRampToValueAtTime(440, t + 0.12);
      osc1.frequency.exponentialRampToValueAtTime(350, t + 0.42);

      osc2.frequency.setValueAtTime(740, t);
      osc2.frequency.exponentialRampToValueAtTime(700, t + 0.42);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.46);
      osc2.stop(t + 0.46);

      setTimeout(() => {
        try {
          const t2 = ctx.currentTime;
          const oscB = ctx.createOscillator();
          const gainB = ctx.createGain();
          oscB.type = 'sine';
          oscB.frequency.setValueAtTime(390, t2);
          oscB.frequency.exponentialRampToValueAtTime(330, t2 + 0.35);
          gainB.gain.setValueAtTime(0.18, t2);
          gainB.gain.exponentialRampToValueAtTime(0.001, t2 + 0.35);
          oscB.connect(gainB);
          gainB.connect(ctx.destination);
          oscB.start(t2);
          oscB.stop(t2 + 0.36);
        } catch(e) {}
      }, 160);
    } catch (e) {}
  }

  let isHedwigTransitioning = false;
  function triggerHedwigNextTransition(targetStage) {
    if (isHedwigTransitioning) return;
    
    // If not in Potter theme, transition directly
    if (state.backgroundTheme !== 'potter') {
      goToStage(targetStage);
      return;
    }

    isHedwigTransitioning = true;
    const overlay = document.getElementById('hedwig-transition-overlay');
    playOwlHootSound();

    if (overlay) {
      overlay.classList.add('hedwig-active');
    }

    // At peak flight swoop (approx 480ms), switch stage smoothly
    setTimeout(() => {
      goToStage(targetStage);
      launchConfetti(45);
    }, 480);

    // End transition
    setTimeout(() => {
      if (overlay) overlay.classList.remove('hedwig-active');
      isHedwigTransitioning = false;
    }, 1250);
  }

  function playPopSound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 1. Sharp white-noise rupture crack (latex explosion transient)
      const bufferSize = Math.floor(ctx.sampleRate * 0.045);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.007));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(3600, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(350, t + 0.045);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.85, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.045);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);

      // 2. Punchy air pressure release wave (sub-bass drop)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.12);
      oscGain.gain.setValueAtTime(0.65, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);

      // 3. High rubber slap ring
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'sawtooth';
      snapOsc.frequency.setValueAtTime(820, t);
      snapOsc.frequency.exponentialRampToValueAtTime(90, t + 0.06);
      snapGain.gain.setValueAtTime(0.3, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(t);
      snapOsc.stop(t + 0.07);
    } catch (e) {}
  }

  function playCameraShutterSound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      playTone(850, 'triangle', 0.08, 0.2);
      setTimeout(() => playTone(1200, 'sine', 0.1, 0.22), 80);
    } catch (e) {}
  }

  function playCheerFanfare() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 'triangle', 0.25, 0.3), idx * 130);
    });
  }

  // --- URL Parser & Milestones ---
  function getAstrologyInfo(day, month) {
    const signs = [
      { sign: 'Capricorn ♑', quote: 'Ambitious, wise & dependable' },
      { sign: 'Aquarius ♒', quote: 'Visionary, free-spirited & brilliant' },
      { sign: 'Pisces ♓', quote: 'Intuitive, artistic & compassionate' },
      { sign: 'Aries ♈', quote: 'Bold, radiant & inspiring leader' },
      { sign: 'Taurus ♉', quote: 'Loyal, grounded & true-hearted' },
      { sign: 'Gemini ♊', quote: 'Charming, vibrant & wonderfully witty' },
      { sign: 'Cancer ♋', quote: 'Deeply caring, loving & golden' },
      { sign: 'Leo ♌', quote: 'Radiant, magnetic & full of life' },
      { sign: 'Virgo ♍', quote: 'Thoughtful, graceful & shining' },
      { sign: 'Libra ♎', quote: 'Charming, harmonious & elegant' },
      { sign: 'Scorpio ♏', quote: 'Passionate, magnetic & profound' },
      { sign: 'Sagittarius ♐', quote: 'Adventurous, generous & joyful' }
    ];
    const cutoff = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];
    const index = (day <= cutoff[month - 1]) ? (month - 1) : (month % 12);
    return signs[index];
  }

  function parseParameters() {
    const params = new URLSearchParams(window.location.search);
    const n = params.get('name');
    const d = params.get('date');
    const m = params.get('msg');
    const p = params.get('p');
    const cap = params.get('cap');
    const exp = params.get('exp');
    const preview = params.get('preview');

    if (n) state.name = n.trim();
    if (d) state.birthDate = d.trim();
    if (m && m.trim().length > 0) {
      state.customMessage = m.trim();
      state.useCustomMessage = true;
    }
    if (cap) {
      state.photoCaption = cap.trim();
      state.photos.forEach(photo => photo.caption = state.photoCaption);
    }

    // Parse photos from URL preset ids if provided (e.g. p=1,2,3,4)
    if (p) {
      const ids = p.split(',').map(s => parseInt(s.trim(), 10)).filter(id => !isNaN(id));
      if (ids.length >= 2) {
        state.photos = ids.map(id => {
          const match = PRESET_MEMORIES.find(pm => pm.id === id);
          return match ? { id: match.id, src: match.src, caption: state.photoCaption || match.defaultCaption } : null;
        }).filter(Boolean);
      }
    }

    // 24-Hour Expiration Check
    if (exp) {
      const expTime = parseInt(exp, 10);
      if (!isNaN(expTime)) {
        state.expirationTime = expTime;
        const now = Date.now();
        if (now > expTime) {
          state.is24hExpired = true;
        } else {
          const hoursLeft = Math.max(1, Math.round((expTime - now) / (1000 * 60 * 60)));
          setTimeout(() => {
            showToast(`⏳ Special 24-Hour Birthday Link • Active for ~${hoursLeft}h!`);
          }, 900);
        }
      }
    }

    if (preview === '1') {
      state.isPreviewMode = true;
    }

    // Background Theme Parameter (Defaults to 'potter')
    const th = params.get('theme');
    if (th === 'festive') {
      state.backgroundTheme = 'festive';
    } else {
      state.backgroundTheme = 'potter';
    }
  }

  // --- Harry Potter Enchanted World Canvas Engine ---
  let potterCtx = null;
  let isPotterInitialized = false;
  let potterCandles = [];
  let broomRiders = [];
  let goldenSnitch = null;
  let flyingLetters = [];
  let wandSparks = [];
  let potterStars = [];

  function switchBackgroundTheme(newTheme, showToastNotice = false) {
    state.backgroundTheme = (newTheme === 'festive') ? 'festive' : 'potter';
    const isPotter = (state.backgroundTheme === 'potter');

    document.body.classList.toggle('theme-potter', isPotter);
    document.body.classList.toggle('theme-festive', !isPotter);

    const toggleIcon = document.getElementById('theme-toggle-icon');
    const toggleLabel = document.getElementById('theme-toggle-label');
    if (toggleIcon) toggleIcon.textContent = isPotter ? '⚡' : '🎈';
    if (toggleLabel) toggleLabel.textContent = isPotter ? 'Hogwarts 3D' : 'Festive 3D';

    const cardPotter = document.getElementById('theme-card-potter');
    const cardFestive = document.getElementById('theme-card-festive');
    if (cardPotter) {
      cardPotter.classList.toggle('active', isPotter);
      const rP = cardPotter.querySelector('input[type="radio"]');
      if (rP) rP.checked = isPotter;
    }
    if (cardFestive) {
      cardFestive.classList.toggle('active', !isPotter);
      const rF = cardFestive.querySelector('input[type="radio"]');
      if (rF) rF.checked = !isPotter;
    }

    document.querySelectorAll('.btn-owl-badge').forEach(b => {
      b.style.display = isPotter ? 'inline-block' : 'none';
    });

    if (isPotter) {
      playSpellSound();
      if (!isPotterInitialized) {
        initPotterCosmos();
      }
      if (showToastNotice) {
        showToast('⚡ Hogwarts 3D Theme Activated: Floating Candles, Snitch & Broomstick Riders!');
      }
    } else {
      playTone(523.25, 'triangle', 0.25, 0.2);
      setTimeout(() => playTone(659.25, 'sine', 0.25, 0.2), 100);
      launchConfetti(45);
      if (showToastNotice) {
        showToast('🎈 Festive 3D Balloons & Confetti Theme Activated!');
      }
    }
  }

  function initPotterCosmos() {
    const pCanvas = document.getElementById('potter-canvas');
    if (!pCanvas) return;
    potterCtx = pCanvas.getContext('2d');
    if (!potterCtx) return;

    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;

    // 1. 26 Great Hall Floating Candles with 3D Depth
    potterCandles = [];
    for (let i = 0; i < 26; i++) {
      potterCandles.push({
        x: (Math.random() - 0.5) * window.innerWidth * 1.3,
        baseY: -window.innerHeight * 0.45 + Math.random() * (window.innerHeight * 0.75),
        z: 160 + Math.random() * 420,
        height: 38 + Math.random() * 32,
        width: 10 + Math.random() * 4,
        swaySpeed: 0.012 + Math.random() * 0.016,
        swayAmp: 12 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
        flameFlicker: Math.random() * Math.PI * 2,
        flameSpeed: 0.08 + Math.random() * 0.06
      });
    }

    // 2. 4 Characters Riding on Broomsticks across different sides
    broomRiders = [
      {
        id: 1,
        name: 'Gryffindor Seeker',
        robeColor: '#991b1b',
        trimColor: '#fbbf24',
        x: -240,
        y: window.innerHeight * 0.22,
        vx: 2.6,
        vy: -0.22,
        scale: 0.95,
        trail: [],
        cloakWave: 0
      },
      {
        id: 2,
        name: 'Ravenclaw Witch',
        robeColor: '#1e3a8a',
        trimColor: '#93c5fd',
        x: window.innerWidth + 240,
        y: window.innerHeight * 0.36,
        vx: -2.1,
        vy: 0.18,
        scale: 0.85,
        trail: [],
        cloakWave: 1.5
      },
      {
        id: 3,
        name: 'Slytherin Chaser',
        robeColor: '#065f46',
        trimColor: '#6ee7b7',
        x: -200,
        y: window.innerHeight * 0.56,
        vx: 2.3,
        vy: 0.28,
        scale: 0.9,
        trail: [],
        cloakWave: 3.1
      },
      {
        id: 4,
        name: 'Hufflepuff Keeper',
        robeColor: '#b45309',
        trimColor: '#fde047',
        x: window.innerWidth + 200,
        y: window.innerHeight * 0.14,
        vx: -1.7,
        vy: -0.15,
        scale: 0.78,
        trail: [],
        cloakWave: 4.5
      }
    ];

    // 3. The Golden Snitch
    goldenSnitch = {
      x: window.innerWidth * 0.45,
      y: window.innerHeight * 0.28,
      targetX: window.innerWidth * 0.5,
      targetY: window.innerHeight * 0.25,
      radius: 9,
      wingFlap: 0,
      sparkTrail: [],
      changeTimer: 0
    };

    // 4. Flying Hogwarts Acceptance Letters
    flyingLetters = [];
    for (let l = 0; l < 10; l++) {
      flyingLetters.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.85,
        z: 220 + Math.random() * 380,
        vx: 0.6 + Math.random() * 0.7,
        vy: (Math.random() - 0.5) * 0.4,
        rot: (Math.random() - 0.5) * 0.3,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        swayPhase: Math.random() * Math.PI * 2
      });
    }

    // 5. Enchanted Night Stars
    potterStars = [];
    for (let s = 0; s < 75; s++) {
      potterStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.75,
        r: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2
      });
    }

    isPotterInitialized = true;
  }

  let potterTick = 0;
  function renderPotterCosmos() {
    const pCanvas = document.getElementById('potter-canvas');
    if (!pCanvas || !potterCtx) return;

    if (state.backgroundTheme !== 'potter') {
      requestAnimationFrame(renderPotterCosmos);
      return;
    }

    potterTick += 0.016;
    potterCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    const cx = pCanvas.width / 2;
    const cy = pCanvas.height / 2;

    // A. Twinkling Stars
    potterStars.forEach(st => {
      const a = st.alpha * (0.6 + 0.4 * Math.sin(potterTick * 2 * Math.PI * st.twinkleSpeed + st.phase));
      potterCtx.save();
      potterCtx.globalAlpha = Math.max(0, Math.min(1, a));
      potterCtx.fillStyle = '#fef9c3';
      potterCtx.beginPath();
      potterCtx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      potterCtx.fill();
      potterCtx.restore();
    });

    // B. Great Hall Floating Candles
    potterCandles.forEach(c => {
      const swayY = Math.sin(potterTick * 2 * Math.PI * c.swaySpeed + c.phase) * c.swayAmp;
      const k = 380 / c.z;
      const px = cx + (c.x + state.mousePos.x * 0.08) * k;
      const py = cy + (c.baseY + swayY + state.mousePos.y * 0.08) * k;
      const cw = c.width * k;
      const ch = c.height * k;

      if (px > -50 && px < pCanvas.width + 50 && py > -80 && py < pCanvas.height + 80) {
        potterCtx.save();
        potterCtx.globalAlpha = Math.min(0.92, 450 / c.z);

        // Candle Body
        const waxGrad = potterCtx.createLinearGradient(px - cw / 2, py, px + cw / 2, py);
        waxGrad.addColorStop(0, '#fef9c3');
        waxGrad.addColorStop(0.35, '#ffffff');
        waxGrad.addColorStop(0.75, '#fef08a');
        waxGrad.addColorStop(1, '#ca8a04');

        potterCtx.fillStyle = waxGrad;
        potterCtx.beginPath();
        if (potterCtx.roundRect) {
          potterCtx.roundRect(px - cw / 2, py, cw, ch, [2, 2, 4, 4]);
        } else {
          potterCtx.rect(px - cw / 2, py, cw, ch);
        }
        potterCtx.fill();

        // Wax Drips
        potterCtx.fillStyle = '#ffffff';
        potterCtx.beginPath();
        potterCtx.arc(px - cw * 0.2, py + ch * 0.25, cw * 0.18, 0, Math.PI * 2);
        potterCtx.arc(px + cw * 0.25, py + ch * 0.4, cw * 0.16, 0, Math.PI * 2);
        potterCtx.fill();

        // Wick
        potterCtx.strokeStyle = '#1e1e1e';
        potterCtx.lineWidth = Math.max(1, 1.5 * k);
        potterCtx.beginPath();
        potterCtx.moveTo(px, py);
        potterCtx.lineTo(px, py - 6 * k);
        potterCtx.stroke();

        // Flickering Candle Flame with Drop Glow
        c.flameFlicker += c.flameSpeed;
        const flameNoise = Math.sin(c.flameFlicker) * 0.15;
        const flW = (cw * 0.75) * (1 + flameNoise);
        const flH = (cw * 1.6) * (1 - flameNoise * 0.5);
        const flY = py - 7 * k;

        // Ambient Flame Glow
        const glowRad = flW * 4.5;
        const ambientGlow = potterCtx.createRadialGradient(px, flY - flH / 2, 0, px, flY - flH / 2, glowRad);
        ambientGlow.addColorStop(0, 'rgba(255, 209, 102, 0.45)');
        ambientGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
        ambientGlow.addColorStop(1, 'transparent');
        potterCtx.fillStyle = ambientGlow;
        potterCtx.beginPath();
        potterCtx.arc(px, flY - flH / 2, glowRad, 0, Math.PI * 2);
        potterCtx.fill();

        // Core Flame Tear
        const flameGrad = potterCtx.createRadialGradient(
          px, flY - flH * 0.2, flW * 0.1,
          px, flY - flH * 0.4, flH
        );
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.25, '#fef08a');
        flameGrad.addColorStop(0.65, '#f59e0b');
        flameGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');

        potterCtx.fillStyle = flameGrad;
        potterCtx.beginPath();
        potterCtx.moveTo(px, flY - flH);
        potterCtx.bezierCurveTo(px + flW * 0.9, flY - flH * 0.6, px + flW * 0.9, flY, px, flY);
        potterCtx.bezierCurveTo(px - flW * 0.9, flY, px - flW * 0.9, flY - flH * 0.6, px, flY - flH);
        potterCtx.fill();

        potterCtx.restore();
      }
    });

    // C. Flying Hogwarts Letters
    flyingLetters.forEach(lt => {
      lt.x += lt.vx;
      lt.y += lt.vy + Math.sin(potterTick * 2 + lt.swayPhase) * 0.4;
      lt.rot += lt.rotSpeed;

      if (lt.x > pCanvas.width + 120) {
        lt.x = -120;
        lt.y = Math.random() * pCanvas.height * 0.85;
      }

      const k = 380 / lt.z;
      const lw = 28 * k;
      const lh = 18 * k;

      potterCtx.save();
      potterCtx.translate(lt.x, lt.y);
      potterCtx.rotate(lt.rot);
      potterCtx.globalAlpha = Math.min(0.85, 420 / lt.z);

      potterCtx.fillStyle = '#fef3c7';
      potterCtx.strokeStyle = 'rgba(202, 138, 4, 0.6)';
      potterCtx.lineWidth = 1;
      potterCtx.fillRect(-lw / 2, -lh / 2, lw, lh);
      potterCtx.strokeRect(-lw / 2, -lh / 2, lw, lh);

      potterCtx.beginPath();
      potterCtx.moveTo(-lw / 2, -lh / 2);
      potterCtx.lineTo(0, 0);
      potterCtx.lineTo(lw / 2, -lh / 2);
      potterCtx.stroke();

      potterCtx.fillStyle = '#991b1b';
      potterCtx.beginPath();
      potterCtx.arc(0, 0, 3.5 * k, 0, Math.PI * 2);
      potterCtx.fill();

      potterCtx.restore();
    });

    // D. 4 Characters Riding on Broomsticks across different sides
    broomRiders.forEach(r => {
      r.x += r.vx;
      r.y += r.vy;
      r.cloakWave += 0.18;

      if (r.vx > 0 && r.x > pCanvas.width + 220) {
        r.x = -220;
        r.y = 80 + Math.random() * (pCanvas.height * 0.65);
      } else if (r.vx < 0 && r.x < -220) {
        r.x = pCanvas.width + 220;
        r.y = 80 + Math.random() * (pCanvas.height * 0.65);
      }

      // Spark trail
      const tailX = (r.vx > 0) ? (r.x - 42 * r.scale) : (r.x + 42 * r.scale);
      const tailY = r.y + 6 * r.scale;
      r.trail.push({
        x: tailX + (Math.random() - 0.5) * 6,
        y: tailY + (Math.random() - 0.5) * 6,
        vx: -r.vx * 0.15 + (Math.random() - 0.5) * 0.6,
        vy: -0.3 + (Math.random() - 0.5) * 0.8,
        color: (Math.random() > 0.4) ? '#ffd166' : r.trimColor,
        alpha: 1,
        size: Math.random() * 3 + 1.5
      });

      r.trail.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.024;
      });
      r.trail = r.trail.filter(p => p.alpha > 0);

      r.trail.forEach(p => {
        potterCtx.save();
        potterCtx.globalAlpha = p.alpha;
        potterCtx.fillStyle = p.color;
        potterCtx.shadowColor = p.color;
        potterCtx.shadowBlur = 6;
        potterCtx.beginPath();
        potterCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.restore();
      });

      // Draw Broomstick Rider
      potterCtx.save();
      potterCtx.translate(r.x, r.y);
      const isFacingRight = (r.vx > 0);
      potterCtx.scale(isFacingRight ? r.scale : -r.scale, r.scale);

      const pitchAngle = Math.atan2(r.vy, Math.abs(r.vx));
      potterCtx.rotate(pitchAngle);

      // Broom Handle
      const woodGrad = potterCtx.createLinearGradient(-45, 0, 45, 0);
      woodGrad.addColorStop(0, '#78350f');
      woodGrad.addColorStop(0.5, '#b45309');
      woodGrad.addColorStop(1, '#d97706');
      potterCtx.strokeStyle = woodGrad;
      potterCtx.lineWidth = 4.5;
      potterCtx.lineCap = 'round';
      potterCtx.beginPath();
      potterCtx.moveTo(-45, 4);
      potterCtx.lineTo(42, -4);
      potterCtx.stroke();

      potterCtx.fillStyle = '#ffd166';
      potterCtx.beginPath();
      potterCtx.arc(42, -4, 3, 0, Math.PI * 2);
      potterCtx.fill();

      // Bristles Tail
      potterCtx.fillStyle = '#92400e';
      potterCtx.beginPath();
      potterCtx.moveTo(-35, 3);
      potterCtx.lineTo(-65, -8);
      potterCtx.bezierCurveTo(-75, 4, -75, 12, -65, 16);
      potterCtx.lineTo(-35, 5);
      potterCtx.closePath();
      potterCtx.fill();

      // Gold Twine Binding
      potterCtx.strokeStyle = '#fde047';
      potterCtx.lineWidth = 2.5;
      potterCtx.beginPath();
      potterCtx.moveTo(-38, 0);
      potterCtx.lineTo(-38, 7);
      potterCtx.stroke();

      // Billowing Cloak
      const flap1 = Math.sin(r.cloakWave) * 7;
      const flap2 = Math.cos(r.cloakWave * 1.3) * 6;
      potterCtx.fillStyle = r.robeColor;
      potterCtx.beginPath();
      potterCtx.moveTo(-5, -12);
      potterCtx.quadraticCurveTo(-25, -16 + flap1, -52, -10 + flap2);
      potterCtx.lineTo(-44, 2 + flap1);
      potterCtx.quadraticCurveTo(-25, -2, -10, 0);
      potterCtx.closePath();
      potterCtx.fill();

      potterCtx.strokeStyle = r.trimColor;
      potterCtx.lineWidth = 1.5;
      potterCtx.stroke();

      // Torso & Arms
      potterCtx.fillStyle = '#1e293b';
      potterCtx.beginPath();
      potterCtx.ellipse(-5, -6, 10, 6, -0.3, 0, Math.PI * 2);
      potterCtx.fill();

      // Hands
      potterCtx.fillStyle = '#fde68a';
      potterCtx.beginPath();
      potterCtx.arc(10, -3, 3, 0, Math.PI * 2);
      potterCtx.fill();

      // Head
      potterCtx.fillStyle = '#fed7aa';
      potterCtx.beginPath();
      potterCtx.arc(5, -16, 6, 0, Math.PI * 2);
      potterCtx.fill();

      // Hair / Hood
      potterCtx.fillStyle = '#0f172a';
      potterCtx.beginPath();
      potterCtx.arc(4, -18, 6.5, Math.PI, Math.PI * 2);
      potterCtx.fill();

      // Scarf tails
      potterCtx.strokeStyle = r.trimColor;
      potterCtx.lineWidth = 2.5;
      potterCtx.beginPath();
      potterCtx.moveTo(0, -13);
      potterCtx.quadraticCurveTo(-15, -15 + flap2, -28, -12 + flap1);
      potterCtx.stroke();

      potterCtx.restore();
    });

    // E. Golden Snitch
    if (goldenSnitch) {
      goldenSnitch.wingFlap += 0.85;
      goldenSnitch.changeTimer++;

      if (goldenSnitch.changeTimer > 90) {
        goldenSnitch.changeTimer = 0;
        goldenSnitch.targetX = 100 + Math.random() * (pCanvas.width - 200);
        goldenSnitch.targetY = 60 + Math.random() * (pCanvas.height * 0.45);
      }

      goldenSnitch.x += (goldenSnitch.targetX - goldenSnitch.x) * 0.045;
      goldenSnitch.y += (goldenSnitch.targetY - goldenSnitch.y) * 0.045;

      goldenSnitch.sparkTrail.push({
        x: goldenSnitch.x,
        y: goldenSnitch.y,
        alpha: 1,
        size: Math.random() * 2.5 + 1.2
      });
      goldenSnitch.sparkTrail.forEach(p => { p.alpha -= 0.04; });
      goldenSnitch.sparkTrail = goldenSnitch.sparkTrail.filter(p => p.alpha > 0);

      goldenSnitch.sparkTrail.forEach(p => {
        potterCtx.save();
        potterCtx.globalAlpha = p.alpha;
        potterCtx.fillStyle = '#ffd166';
        potterCtx.shadowColor = '#ffd166';
        potterCtx.shadowBlur = 8;
        potterCtx.beginPath();
        potterCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        potterCtx.fill();
        potterCtx.restore();
      });

      const sx = goldenSnitch.x;
      const sy = goldenSnitch.y;
      const wingAngle = Math.sin(goldenSnitch.wingFlap) * 0.85;

      potterCtx.save();
      potterCtx.translate(sx, sy);

      // Left Wing
      potterCtx.save();
      potterCtx.rotate(wingAngle - 0.4);
      potterCtx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      potterCtx.shadowColor = '#fef08a';
      potterCtx.shadowBlur = 10;
      potterCtx.beginPath();
      potterCtx.moveTo(0, 0);
      potterCtx.bezierCurveTo(-15, -14, -28, -6, -34, -18);
      potterCtx.bezierCurveTo(-26, -2, -14, -1, 0, 0);
      potterCtx.fill();
      potterCtx.restore();

      // Right Wing
      potterCtx.save();
      potterCtx.rotate(-wingAngle + 0.4);
      potterCtx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      potterCtx.shadowColor = '#fef08a';
      potterCtx.shadowBlur = 10;
      potterCtx.beginPath();
      potterCtx.moveTo(0, 0);
      potterCtx.bezierCurveTo(15, -14, 28, -6, 34, -18);
      potterCtx.bezierCurveTo(26, -2, 14, -1, 0, 0);
      potterCtx.fill();
      potterCtx.restore();

      // Sphere
      const snitchGrad = potterCtx.createRadialGradient(-3, -3, 1, 0, 0, goldenSnitch.radius);
      snitchGrad.addColorStop(0, '#ffffff');
      snitchGrad.addColorStop(0.35, '#fde047');
      snitchGrad.addColorStop(0.75, '#eab308');
      snitchGrad.addColorStop(1, '#a16207');

      potterCtx.fillStyle = snitchGrad;
      potterCtx.shadowColor = '#facc15';
      potterCtx.shadowBlur = 14;
      potterCtx.beginPath();
      potterCtx.arc(0, 0, goldenSnitch.radius, 0, Math.PI * 2);
      potterCtx.fill();

      potterCtx.restore();
    }

    // F. Wand Sparks
    wandSparks.forEach(sp => {
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha -= 0.035;
    });
    wandSparks = wandSparks.filter(sp => sp.alpha > 0);

    wandSparks.forEach(sp => {
      potterCtx.save();
      potterCtx.globalAlpha = sp.alpha;
      potterCtx.fillStyle = sp.color;
      potterCtx.shadowColor = sp.color;
      potterCtx.shadowBlur = 10;
      potterCtx.beginPath();
      potterCtx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      potterCtx.fill();
      potterCtx.restore();
    });

    requestAnimationFrame(renderPotterCosmos);
  }

  // --- 3D Birthday Theme Background Scene (Three.js WebGL + Smooth 2D Fallback) ---
  const cosmosCanvas = document.getElementById('cosmos-canvas');
  let cosmosCtx = null;

  let threeScene = null;
  let threeCamera = null;
  let threeRenderer = null;
  let balloons3D = [];
  let giftBoxes3D = [];
  let confettiFlakes3D = [];
  let stars3D = null;
  let lightRose = null;
  let lightCyan = null;
  let lightGold = null;
  let isThreeInitialized = false;

  function initThreeCosmos() {
    if (!cosmosCanvas || typeof THREE === 'undefined') return false;
    try {
      threeScene = new THREE.Scene();
      threeCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);
      threeCamera.position.z = 450;

      threeRenderer = new THREE.WebGLRenderer({
        canvas: cosmosCanvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      threeRenderer.setSize(window.innerWidth, window.innerHeight);
      threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // 1. Atmospheric Festive Lighting
      const ambientLight = new THREE.AmbientLight(0x2d174d, 1.4);
      threeScene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xfff5e1, 1.35);
      dirLight.position.set(160, 320, 220);
      threeScene.add(dirLight);

      lightRose = new THREE.PointLight(0xff3385, 3.2, 750);
      lightCyan = new THREE.PointLight(0x06d6a0, 2.6, 700);
      lightGold = new THREE.PointLight(0xffd166, 3.8, 800);
      threeScene.add(lightRose, lightCyan, lightGold);

      // 2. 3D Realistic Birthday Balloons
      const balloonColors = [
        0xffd166, // Champagne Gold
        0xff3385, // Vibrant Rose
        0x8338ec, // Royal Amethyst
        0x06d6a0, // Mint Turquoise
        0xfb5607, // Sunburst Orange
        0x3a86ff, // Sapphire Blue
        0xff70a6, // Blush Pink
        0xffffff  // Diamond White
      ];

      balloons3D = [];
      const balloonBodyGeo = new THREE.SphereGeometry(1, 28, 24);
      const balloonKnotGeo = new THREE.ConeGeometry(3.5, 6, 14);

      for (let i = 0; i < 22; i++) {
        const group = new THREE.Group();
        const col = balloonColors[i % balloonColors.length];
        const mat = new THREE.MeshPhongMaterial({
          color: col,
          specular: 0xffffff,
          shininess: 95,
          transparent: true,
          opacity: 0.88
        });

        // Main balloon body (realistic oval shape)
        const radius = 18 + Math.random() * 9;
        const meshBody = new THREE.Mesh(balloonBodyGeo, mat);
        meshBody.scale.set(radius, radius * 1.28, radius);
        group.add(meshBody);

        // Knot at bottom
        const knotMat = new THREE.MeshPhongMaterial({ color: col, shininess: 60 });
        const meshKnot = new THREE.Mesh(balloonKnotGeo, knotMat);
        meshKnot.rotation.x = Math.PI;
        meshKnot.position.y = -radius * 1.25;
        group.add(meshKnot);

        // Swaying silk string
        const stringPoints = [];
        const segs = 8;
        const stringLen = 70 + Math.random() * 25;
        for (let s = 0; s <= segs; s++) {
          const t = s / segs;
          stringPoints.push(new THREE.Vector3(
            Math.sin(s * 1.2) * 4,
            -radius * 1.25 - (t * stringLen),
            Math.cos(s * 1.2) * 3
          ));
        }
        const stringGeo = new THREE.BufferGeometry().setFromPoints(stringPoints);
        const stringMat = new THREE.LineBasicMaterial({
          color: 0xffeccc,
          transparent: true,
          opacity: 0.55
        });
        const line = new THREE.Line(stringGeo, stringMat);
        group.add(line);

        // Multi-Directional Placement across 3D space (coming from left, right, or bottom)
        const dirType = (i % 3 === 0) ? 'left' : ((i % 3 === 1) ? 'right' : 'bottom');
        let startX, startY, vx, vy;
        if (dirType === 'left') {
          startX = -window.innerWidth * 0.65 - Math.random() * 200;
          startY = -250 + Math.random() * 550;
          vx = 0.55 + Math.random() * 0.85;
          vy = 0.35 + Math.random() * 0.55;
        } else if (dirType === 'right') {
          startX = window.innerWidth * 0.65 + Math.random() * 200;
          startY = -250 + Math.random() * 550;
          vx = -(0.55 + Math.random() * 0.85);
          vy = 0.35 + Math.random() * 0.55;
        } else {
          startX = (Math.random() - 0.5) * (window.innerWidth * 0.9);
          startY = -420 + Math.random() * 400;
          vx = (Math.random() - 0.5) * 0.3;
          vy = 0.5 + Math.random() * 0.6;
        }

        const startZ = -380 + Math.random() * 450;
        group.position.set(startX, startY, startZ);

        balloons3D.push({
          group,
          radius,
          dirType,
          vx,
          vy,
          swayFreq: 0.015 + Math.random() * 0.02,
          swayAmp: 16 + Math.random() * 26,
          phase: Math.random() * Math.PI * 2,
          rotSpeedX: (Math.random() - 0.5) * 0.008,
          rotSpeedZ: (Math.random() - 0.5) * 0.008
        });

        threeScene.add(group);
      }

      // 3. 3D Floating Miniature Gift Boxes in Depth
      giftBoxes3D = [];
      const boxGeo = new THREE.BoxGeometry(22, 22, 22);
      const ribbonBand1Geo = new THREE.BoxGeometry(22.6, 22.6, 4.5);
      const ribbonBand2Geo = new THREE.BoxGeometry(4.5, 22.6, 22.6);
      const ribbonMat = new THREE.MeshPhongMaterial({
        color: 0xffd166,
        specular: 0xffffff,
        shininess: 100
      });

      for (let g = 0; g < 9; g++) {
        const giftGrp = new THREE.Group();
        const boxCol = balloonColors[(g * 2 + 1) % balloonColors.length];
        const boxMat = new THREE.MeshPhongMaterial({
          color: boxCol,
          specular: 0xffffff,
          shininess: 75
        });

        const mainCube = new THREE.Mesh(boxGeo, boxMat);
        const band1 = new THREE.Mesh(ribbonBand1Geo, ribbonMat);
        const band2 = new THREE.Mesh(ribbonBand2Geo, ribbonMat);
        giftGrp.add(mainCube, band1, band2);

        const gx = (Math.random() - 0.5) * (window.innerWidth * 0.85);
        const gy = (Math.random() - 0.5) * 600;
        const gz = -420 + Math.random() * 320;
        giftGrp.position.set(gx, gy, gz);

        giftBoxes3D.push({
          group: giftGrp,
          rotX: (Math.random() - 0.5) * 0.015,
          rotY: (Math.random() - 0.5) * 0.02,
          rotZ: (Math.random() - 0.5) * 0.01,
          baseY: gy,
          phase: Math.random() * Math.PI * 2
        });

        threeScene.add(giftGrp);
      }

      // 4. 3D Tumbling Birthday Confetti & Holographic Flakes
      confettiFlakes3D = [];
      const flakeGeo = new THREE.PlaneGeometry(8, 14);
      const flakeColors = [0xffd166, 0xff3385, 0x06d6a0, 0x8338ec, 0xfb5607, 0x3a86ff, 0xffffff];

      for (let c = 0; c < 110; c++) {
        const fMat = new THREE.MeshPhongMaterial({
          color: flakeColors[c % flakeColors.length],
          side: THREE.DoubleSide,
          specular: 0xffffff,
          shininess: 95,
          transparent: true,
          opacity: 0.85
        });
        const flake = new THREE.Mesh(flakeGeo, fMat);
        flake.position.set(
          (Math.random() - 0.5) * (window.innerWidth * 1.1),
          (Math.random() - 0.5) * 800,
          -350 + Math.random() * 450
        );

        confettiFlakes3D.push({
          mesh: flake,
          vy: 0.45 + Math.random() * 0.85,
          vx: (Math.random() - 0.5) * 0.35,
          vrx: (Math.random() - 0.5) * 0.045,
          vry: (Math.random() - 0.5) * 0.05,
          vrz: (Math.random() - 0.5) * 0.04
        });

        threeScene.add(flake);
      }

      // 5. 3D Sparkling Starfield
      const starGeo = new THREE.BufferGeometry();
      const starCount = 300;
      const starPositions = new Float32Array(starCount * 3);
      for (let s = 0; s < starCount * 3; s += 3) {
        starPositions[s] = (Math.random() - 0.5) * 1600;
        starPositions[s + 1] = (Math.random() - 0.5) * 1100;
        starPositions[s + 2] = -500 + Math.random() * 700;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xfff6cf,
        size: 3.2,
        transparent: true,
        opacity: 0.8
      });
      stars3D = new THREE.Points(starGeo, starMat);
      threeScene.add(stars3D);

      isThreeInitialized = true;
      return true;
    } catch (err) {
      console.warn('Three.js initialization failed, falling back to 2D Canvas:', err);
      isThreeInitialized = false;
      return false;
    }
  }

  let threeClock = 0;
  function renderThreeCosmos() {
    if (!isThreeInitialized || !threeRenderer) return;

    // Strictly render festive 3D elements ONLY when festive theme is active!
    if (state.backgroundTheme !== 'festive') {
      requestAnimationFrame(renderThreeCosmos);
      return;
    }

    threeClock += 0.016;

    // 1. Camera 3D Parallax towards mouse
    const targetCamX = state.mousePos.x * 0.22;
    const targetCamY = -state.mousePos.y * 0.22;
    threeCamera.position.x += (targetCamX - threeCamera.position.x) * 0.045;
    threeCamera.position.y += (targetCamY - threeCamera.position.y) * 0.045;
    threeCamera.lookAt(0, 0, 0);

    // 2. Dynamic Point Lights Orbit
    if (lightRose) {
      lightRose.position.x = Math.sin(threeClock * 0.8) * 240;
      lightRose.position.y = Math.cos(threeClock * 0.6) * 180;
    }
    if (lightCyan) {
      lightCyan.position.x = Math.cos(threeClock * 0.7) * 220;
      lightCyan.position.y = Math.sin(threeClock * 0.9) * 190;
    }
    if (lightGold) {
      lightGold.position.x = state.mousePos.x * 0.35;
      lightGold.position.y = -state.mousePos.y * 0.35 + 40;
    }

    // 3. Balloons Float & Harmonic Sway Across Multiple Directions
    balloons3D.forEach(b => {
      b.group.position.y += b.vy;
      b.group.position.x += b.vx;
      b.group.position.x += Math.sin(threeClock * 2 * Math.PI * b.swayFreq + b.phase) * 0.45;
      b.group.rotation.x += b.rotSpeedX;
      b.group.rotation.z += b.rotSpeedZ;

      // Wrap around screen edges depending on trajectory
      const maxW = window.innerWidth * 0.7;
      if (b.group.position.y > 450 || b.group.position.x > maxW + 120 || b.group.position.x < -maxW - 120) {
        if (b.dirType === 'left') {
          b.group.position.x = -maxW - 80;
          b.group.position.y = -350 + Math.random() * 500;
        } else if (b.dirType === 'right') {
          b.group.position.x = maxW + 80;
          b.group.position.y = -350 + Math.random() * 500;
        } else {
          b.group.position.y = -450;
          b.group.position.x = (Math.random() - 0.5) * (window.innerWidth * 0.9);
        }
      }
    });

    // 4. Gift Boxes Tumbling
    giftBoxes3D.forEach(g => {
      g.group.rotation.x += g.rotX;
      g.group.rotation.y += g.rotY;
      g.group.rotation.z += g.rotZ;
      g.group.position.y = g.baseY + Math.sin(threeClock * 1.5 + g.phase) * 18;
    });

    // 5. Confetti Tumbling & Falling
    confettiFlakes3D.forEach(f => {
      f.mesh.position.y -= f.vy;
      f.mesh.position.x += f.vx;
      f.mesh.rotation.x += f.vrx;
      f.mesh.rotation.y += f.vry;
      f.mesh.rotation.z += f.vrz;

      if (f.mesh.position.y < -420) {
        f.mesh.position.y = 420;
        f.mesh.position.x = (Math.random() - 0.5) * (window.innerWidth * 1.1);
      }
    });

    // 6. Stars Shimmer
    if (stars3D) {
      stars3D.rotation.y = threeClock * 0.015;
    }

    threeRenderer.render(threeScene, threeCamera);
    requestAnimationFrame(renderThreeCosmos);
  }

  // --- Fallback 2D Cosmos System (True 3D Perspective Birthday Scene) ---
  let particles3D = [];
  let balloonsFallback = [];
  let confettiFallback = [];
  let giftsFallback = [];

  function initCosmos() {
    if (!cosmosCanvas || isThreeInitialized) return;
    if (!cosmosCtx) cosmosCtx = cosmosCanvas.getContext('2d');
    if (!cosmosCtx) return;
    cosmosCanvas.width = window.innerWidth;
    cosmosCanvas.height = window.innerHeight;

    particles3D = [];
    balloonsFallback = [];
    confettiFallback = [];
    giftsFallback = [];

    const colors = ['#ffd166', '#ff3385', '#06d6a0', '#8338ec', '#ff70a6', '#ffffff', '#fb5607', '#3a86ff'];

    // 1. 3D Perspective Floating Balloons entering from multiple directions (left, right, bottom)
    for (let b = 0; b < 18; b++) {
      const mode = (b % 3 === 0) ? 'left' : ((b % 3 === 1) ? 'right' : 'bottom');
      let sx, sy, svx, svy;
      if (mode === 'left') {
        sx = -window.innerWidth * 0.8 - Math.random() * 200;
        sy = (Math.random() - 0.5) * window.innerHeight * 1.4;
        svx = 0.75 + Math.random() * 0.85;
        svy = 0.35 + Math.random() * 0.45;
      } else if (mode === 'right') {
        sx = window.innerWidth * 0.8 + Math.random() * 200;
        sy = (Math.random() - 0.5) * window.innerHeight * 1.4;
        svx = -(0.75 + Math.random() * 0.85);
        svy = 0.35 + Math.random() * 0.45;
      } else {
        sx = (Math.random() - 0.5) * window.innerWidth * 1.4;
        sy = window.innerHeight * 0.7 + Math.random() * 300;
        svx = (Math.random() - 0.5) * 0.25;
        svy = 0.55 + Math.random() * 0.65;
      }

      balloonsFallback.push({
        mode,
        x: sx,
        y: sy,
        z: 220 + Math.random() * 450,
        radius: 20 + Math.random() * 12,
        color: colors[b % colors.length],
        vx: svx,
        vy: svy,
        swaySpeed: 0.015 + Math.random() * 0.02,
        swayAmp: 18 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 2. 3D Perspective Tumbling Confetti Ribbons
    for (let c = 0; c < 45; c++) {
      confettiFallback.push({
        x: (Math.random() - 0.5) * window.innerWidth * 1.4,
        y: (Math.random() - 0.5) * window.innerHeight * 1.6,
        z: 200 + Math.random() * 500,
        w: 12 + Math.random() * 8,
        h: 6 + Math.random() * 6,
        color: colors[c % colors.length],
        vy: 0.6 + Math.random() * 0.8,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.06,
        vRotY: (Math.random() - 0.5) * 0.08
      });
    }

    // 3. 3D Rotating Mini Gift Boxes
    for (let g = 0; g < 6; g++) {
      giftsFallback.push({
        x: (Math.random() - 0.5) * window.innerWidth * 1.2,
        y: (Math.random() - 0.5) * window.innerHeight * 1.4,
        z: 320 + Math.random() * 400,
        size: 18 + Math.random() * 8,
        color: colors[(g * 2 + 1) % colors.length],
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
        floatY: 0.2 + Math.random() * 0.2
      });
    }

    // 4. Sparkling Stars & Hearts
    const types = ['star', 'sparkle', 'heart'];
    for (let i = 0; i < 110; i++) {
      particles3D.push({
        x: (Math.random() - 0.5) * cosmosCanvas.width * 2.2,
        y: (Math.random() - 0.5) * cosmosCanvas.height * 2.2,
        z: Math.random() * cosmosCanvas.width,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: types[Math.floor(Math.random() * types.length)],
        size: Math.random() * 2.5 + 1.2,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 2
      });
    }
  }

  function drawHeartParticle(c, x, y, size, color, alpha) {
    c.save();
    c.translate(x, y);
    c.scale(size * 0.15, size * 0.15);
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-5, -5, -10, 0, 0, 10);
    c.bezierCurveTo(10, 0, 5, -5, 0, 0);
    c.fill();
    c.restore();
  }

  function drawSparkleParticle(c, x, y, size, color, alpha, rot) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.beginPath();
    for (let i = 0; i < 4; i++) {
      c.lineTo(Math.cos((i * 90 * Math.PI) / 180) * size * 2.5, Math.sin((i * 90 * Math.PI) / 180) * size * 2.5);
      c.lineTo(Math.cos(((i * 90 + 45) * Math.PI) / 180) * size * 0.6, Math.sin(((i * 90 + 45) * Math.PI) / 180) * size * 0.6);
    }
    c.closePath();
    c.fill();
    c.restore();
  }

  let cosmosTick = 0;
  function renderCosmos() {
    if (!cosmosCanvas || !cosmosCtx || isThreeInitialized) return;

    // Strictly render festive 2D elements ONLY when festive theme is active!
    if (state.backgroundTheme !== 'festive') {
      requestAnimationFrame(renderCosmos);
      return;
    }

    cosmosCtx.clearRect(0, 0, cosmosCanvas.width, cosmosCanvas.height);
    cosmosTick += 0.016;

    const cx = cosmosCanvas.width / 2;
    const cy = cosmosCanvas.height / 2;

    // --- 1. Draw 3D Balloons with Multi-Directional Trajectories ---
    balloonsFallback.forEach(b => {
      b.y -= b.vy;
      b.x += b.vx;
      const swayX = Math.sin(cosmosTick * 2 * Math.PI * b.swaySpeed + b.phase) * b.swayAmp;

      // Wrap around when exiting visible bounds
      const halfW = window.innerWidth * 0.85;
      if (b.y < -cosmosCanvas.height - 80 || b.x > halfW + 160 || b.x < -halfW - 160) {
        if (b.mode === 'left') {
          b.x = -halfW - 120;
          b.y = (Math.random() - 0.2) * cosmosCanvas.height;
        } else if (b.mode === 'right') {
          b.x = halfW + 120;
          b.y = (Math.random() - 0.2) * cosmosCanvas.height;
        } else {
          b.y = cosmosCanvas.height + 120;
          b.x = (Math.random() - 0.5) * window.innerWidth * 1.4;
        }
      }

      const k = 380 / b.z;
      const bx = cx + (b.x + swayX + state.mousePos.x * 0.12) * k;
      const by = cy + (b.y + state.mousePos.y * 0.12) * k;
      const br = b.radius * k;

      if (bx > -100 && bx < cosmosCanvas.width + 100 && by > -150 && by < cosmosCanvas.height + 150) {
        cosmosCtx.save();
        cosmosCtx.globalAlpha = Math.min(0.85, 420 / b.z);

        // Dangling silky string
        cosmosCtx.strokeStyle = 'rgba(255, 236, 204, 0.45)';
        cosmosCtx.lineWidth = Math.max(1, 1.5 * k);
        cosmosCtx.beginPath();
        cosmosCtx.moveTo(bx, by + br * 1.25);
        cosmosCtx.bezierCurveTo(
          bx + Math.sin(cosmosTick * 3 + b.phase) * 12 * k,
          by + br * 2.2,
          bx - Math.sin(cosmosTick * 3 + b.phase) * 8 * k,
          by + br * 3.5,
          bx + 2,
          by + br * 4.6
        );
        cosmosCtx.stroke();

        // 3D Metallic Balloon Sphere
        const grad = cosmosCtx.createRadialGradient(
          bx - br * 0.35, by - br * 0.35, br * 0.1,
          bx, by, br * 1.15
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, b.color);
        grad.addColorStop(1, '#110822');

        cosmosCtx.fillStyle = grad;
        cosmosCtx.beginPath();
        cosmosCtx.save();
        cosmosCtx.translate(bx, by);
        cosmosCtx.scale(1, 1.25);
        cosmosCtx.arc(0, 0, br, 0, Math.PI * 2);
        cosmosCtx.restore();
        cosmosCtx.fill();

        // Tied knot
        cosmosCtx.fillStyle = b.color;
        cosmosCtx.beginPath();
        cosmosCtx.moveTo(bx - br * 0.18, by + br * 1.24);
        cosmosCtx.lineTo(bx + br * 0.18, by + br * 1.24);
        cosmosCtx.lineTo(bx, by + br * 1.38);
        cosmosCtx.closePath();
        cosmosCtx.fill();

        cosmosCtx.restore();
      }
    });

    // --- 2. Draw 3D Tumbling Confetti ---
    confettiFallback.forEach(cf => {
      cf.y += cf.vy;
      cf.rotX += cf.vRotX;
      cf.rotY += cf.vRotY;
      if (cf.y > cosmosCanvas.height) {
        cf.y = -cosmosCanvas.height;
        cf.x = (Math.random() - 0.5) * window.innerWidth * 1.4;
      }

      const k = 380 / cf.z;
      const px = cx + (cf.x + state.mousePos.x * 0.08) * k;
      const py = cy + (cf.y + state.mousePos.y * 0.08) * k;

      if (px > 0 && px < cosmosCanvas.width && py > 0 && py < cosmosCanvas.height) {
        cosmosCtx.save();
        cosmosCtx.translate(px, py);
        cosmosCtx.scale(Math.cos(cf.rotX), Math.sin(cf.rotY));
        cosmosCtx.fillStyle = cf.color;
        cosmosCtx.globalAlpha = Math.min(0.8, 380 / cf.z);
        cosmosCtx.fillRect(-cf.w * k * 0.5, -cf.h * k * 0.5, cf.w * k, cf.h * k);
        cosmosCtx.restore();
      }
    });

    // --- 3. Draw 3D Mini Gift Boxes ---
    giftsFallback.forEach(g => {
      g.y += g.floatY;
      g.rot += g.vRot;
      if (g.y > cosmosCanvas.height) {
        g.y = -cosmosCanvas.height;
        g.x = (Math.random() - 0.5) * window.innerWidth * 1.2;
      }

      const k = 380 / g.z;
      const gx = cx + (g.x + state.mousePos.x * 0.06) * k;
      const gy = cy + (g.y + state.mousePos.y * 0.06) * k;
      const sz = g.size * k;

      if (gx > 0 && gx < cosmosCanvas.width && gy > 0 && gy < cosmosCanvas.height) {
        cosmosCtx.save();
        cosmosCtx.translate(gx, gy);
        cosmosCtx.rotate(g.rot);
        cosmosCtx.globalAlpha = Math.min(0.7, 360 / g.z);

        // Cube body
        cosmosCtx.fillStyle = g.color;
        cosmosCtx.fillRect(-sz / 2, -sz / 2, sz, sz);

        // Gold Ribbon cross
        cosmosCtx.fillStyle = '#ffd166';
        cosmosCtx.fillRect(-sz * 0.12, -sz / 2, sz * 0.24, sz);
        cosmosCtx.fillRect(-sz / 2, -sz * 0.12, sz, sz * 0.24);

        // Bow top
        cosmosCtx.beginPath();
        cosmosCtx.arc(0, -sz * 0.55, sz * 0.18, 0, Math.PI * 2);
        cosmosCtx.fill();

        cosmosCtx.restore();
      }
    });

    // --- 4. Draw Stars & Sparkles ---
    particles3D.forEach(p => {
      p.z -= 0.65;
      p.rot += p.vRot;
      if (p.z <= 0) {
        p.z = cosmosCanvas.width;
        p.x = (Math.random() - 0.5) * cosmosCanvas.width * 2.2;
        p.y = (Math.random() - 0.5) * cosmosCanvas.height * 2.2;
      }
      const k = 280 / p.z;
      const px = p.x * k + cx + (state.mousePos.x * 0.04);
      const py = p.y * k + cy + (state.mousePos.y * 0.04);

      if (px >= 0 && px <= cosmosCanvas.width && py >= 0 && py <= cosmosCanvas.height) {
        const alpha = Math.min(1, (1 - p.z / cosmosCanvas.width) * 1.3);
        if (p.type === 'heart') {
          drawHeartParticle(cosmosCtx, px, py, p.size * k * 0.5, p.color, alpha);
        } else if (p.type === 'sparkle') {
          drawSparkleParticle(cosmosCtx, px, py, p.size * k * 0.4, p.color, alpha, p.rot);
        } else {
          cosmosCtx.beginPath();
          cosmosCtx.arc(px, py, p.size * k * 0.5, 0, Math.PI * 2);
          cosmosCtx.fillStyle = p.color;
          cosmosCtx.globalAlpha = Math.max(0, alpha);
          cosmosCtx.fill();
        }
      }
    });

    requestAnimationFrame(renderCosmos);
  }

  window.addEventListener('mousemove', (e) => {
    state.mousePos.x = e.clientX - window.innerWidth / 2;
    state.mousePos.y = e.clientY - window.innerHeight / 2;

    if (state.backgroundTheme === 'potter' && wandSparks.length < 40) {
      const colors = ['#ffd166', '#fde047', '#38bdf8', '#c084fc', '#ffffff'];
      for (let i = 0; i < 2; i++) {
        wandSparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2.8,
          vy: (Math.random() - 0.5) * 2.8 - 0.6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          size: Math.random() * 2.5 + 1.2
        });
      }
    }
  });

  // Touch move support for wand sparks on mobile
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      state.mousePos.x = t.clientX - window.innerWidth / 2;
      state.mousePos.y = t.clientY - window.innerHeight / 2;

      if (state.backgroundTheme === 'potter' && wandSparks.length < 30) {
        wandSparks.push({
          x: t.clientX,
          y: t.clientY,
          vx: (Math.random() - 0.5) * 2.4,
          vy: (Math.random() - 0.5) * 2.4 - 0.8,
          color: '#ffd166',
          alpha: 1,
          size: Math.random() * 3 + 1.5
        });
      }
    }
  }, { passive: true });

  // --- Confetti Cannon System ---
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiItems = [];
  let confettiActive = false;

  function resizeCanvases() {
    const pCanvas = document.getElementById('potter-canvas');
    if (pCanvas) {
      pCanvas.width = window.innerWidth;
      pCanvas.height = window.innerHeight;
    }
    if (confettiCanvas) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
    if (isThreeInitialized && threeRenderer && threeCamera) {
      threeCamera.aspect = window.innerWidth / window.innerHeight;
      threeCamera.updateProjectionMatrix();
      threeRenderer.setSize(window.innerWidth, window.innerHeight);
    } else {
      initCosmos();
    }
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  class ConfettiPiece {
    constructor(startX, startY) {
      this.x = startX !== undefined ? startX : Math.random() * confettiCanvas.width;
      this.y = startY !== undefined ? startY : -15;
      this.w = Math.random() * 10 + 6;
      this.h = Math.random() * 6 + 4;
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = startY !== undefined ? -(Math.random() * 8 + 4) : (Math.random() * 4 + 2);
      this.gravity = 0.22;
      this.rotation = Math.random() * 360;
      this.vRot = (Math.random() - 0.5) * 12;
      const palette = ['#ffd166', '#ff3385', '#8338ec', '#06d6a0', '#3a86ff', '#fb5607', '#ffffff'];
      this.color = palette[Math.floor(Math.random() * palette.length)];
      this.opacity = 1;
      this.decay = Math.random() * 0.006 + 0.003;
    }
    update() {
      this.x += this.vx;
      this.vy += this.gravity;
      this.y += this.vy;
      this.rotation += this.vRot;
      this.opacity -= this.decay;
    }
    draw() {
      if (!confettiCtx) return;
      confettiCtx.save();
      confettiCtx.translate(this.x, this.y);
      confettiCtx.rotate((this.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(0, this.opacity);
      confettiCtx.fillStyle = this.color;
      confettiCtx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      confettiCtx.restore();
    }
  }

  function launchConfetti(count = 120, x, y) {
    if (!confettiCanvas) return;
    for (let i = 0; i < count; i++) {
      confettiItems.push(new ConfettiPiece(x, y));
    }
    if (!confettiActive) {
      confettiActive = true;
      requestAnimationFrame(loopConfetti);
    }
  }

  function loopConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiItems = confettiItems.filter(p => p.opacity > 0 && p.y < confettiCanvas.height + 60);
    confettiItems.forEach(p => { p.update(); p.draw(); });
    if (confettiItems.length > 0) {
      requestAnimationFrame(loopConfetti);
    } else {
      confettiActive = false;
    }
  }

  // --- Realistic Balloon Rupture Explosion Physics ---
  function burstFoilBalloon(balloon, clientX, clientY) {
    if (balloon.classList.contains('balloon-popped')) return;

    playPopSound();

    const rect = balloon.getBoundingClientRect();
    const cx = clientX !== undefined ? clientX : (rect.left + rect.width / 2);
    const cy = clientY !== undefined ? clientY : (rect.top + rect.height / 2);

    // 1. Shockwave blast ring
    const ring = document.createElement('div');
    ring.className = 'balloon-shockwave';
    ring.style.left = `${cx}px`;
    ring.style.top = `${cy}px`;
    ring.style.width = `${rect.width}px`;
    ring.style.height = `${rect.height}px`;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 520);

    // 2. 14 torn rubber fragments radiating outwards with velocity & gravity
    const bg = window.getComputedStyle(balloon).background;
    const numShards = 14;
    for (let i = 0; i < numShards; i++) {
      const shard = document.createElement('div');
      shard.className = 'rubber-shard';
      const angle = (i / numShards) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const dist = 75 + Math.random() * 95;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist + (35 + Math.random() * 45); // gravity drop
      const rot = (Math.random() - 0.5) * 480;
      const w = 12 + Math.random() * 16;
      const h = 8 + Math.random() * 12;

      shard.style.setProperty('--tx', `${tx}px`);
      shard.style.setProperty('--ty', `${ty}px`);
      shard.style.setProperty('--rot', `${rot}deg`);
      shard.style.left = `${cx - w / 2}px`;
      shard.style.top = `${cy - h / 2}px`;
      shard.style.width = `${w}px`;
      shard.style.height = `${h}px`;
      if (bg) shard.style.background = bg;
      shard.style.borderRadius = `${30 + Math.random() * 50}% ${20 + Math.random() * 60}% ${40 + Math.random() * 40}% ${20 + Math.random() * 60}%`;
      shard.style.boxShadow = `0 3px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.7)`;

      document.body.appendChild(shard);
      setTimeout(() => shard.remove(), 700);
    }

    // 3. Erupting confetti & sparkles directly from puncture point
    launchConfetti(45, cx, cy);

    // 4. Hide balloon instantly
    balloon.classList.add('balloon-popped');
    balloon.classList.remove('balloon-inflating');

    // 5. Re-inflate after 3.2 seconds with smooth puff
    setTimeout(() => {
      balloon.classList.remove('balloon-popped');
      balloon.classList.add('balloon-inflating');
      playTone(440, 'sine', 0.1, 0.1);
      setTimeout(() => {
        balloon.classList.remove('balloon-inflating');
      }, 820);
    }, 3200);
  }

  // --- Dynamic Balloons Builder ---
  function buildBalloons() {
    const rack = document.getElementById('balloons-constellation');
    if (!rack) return;
    rack.innerHTML = '';

    const letters = (state.name.trim().toUpperCase() || 'HBD').split('');
    letters.forEach((char, idx) => {
      if (char === ' ') {
        const space = document.createElement('div');
        space.style.width = '24px';
        rack.appendChild(space);
        return;
      }

      const balloon = document.createElement('div');
      balloon.className = `foil-balloon balloon-foil-${idx % 7}`;
      balloon.style.animationDelay = `${(idx * 0.2).toFixed(2)}s`;
      balloon.textContent = char;
      balloon.title = `📍 Needle Pin ready! Click to pop "${char}"!`;

      const tail = document.createElement('div');
      tail.className = 'balloon-tail';
      balloon.appendChild(tail);

      const string = document.createElement('div');
      string.className = 'silk-string';
      balloon.appendChild(string);

      balloon.addEventListener('click', (e) => {
        burstFoilBalloon(balloon, e.clientX, e.clientY);
      });

      rack.appendChild(balloon);
    });
  }

  // --- Update Text & Milestones ---
  function updatePresentationText() {
    const nameHero = document.getElementById('monumental-name');
    const milestoneStrip = document.getElementById('milestone-strip');

    if (nameHero) {
      nameHero.textContent = state.name;
    }

    if (milestoneStrip) {
      milestoneStrip.innerHTML = '';

      if (state.birthDate) {
        const birth = new Date(state.birthDate);
        if (!isNaN(birth.getTime())) {
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

          if (age > 0) {
            const agePill = document.createElement('div');
            agePill.className = 'milestone-pill gold';
            agePill.innerHTML = `🎂 Celebrating ${age} Beautiful Years`;
            milestoneStrip.appendChild(agePill);
          }

          const zodiac = getAstrologyInfo(birth.getDate(), birth.getMonth() + 1);
          if (zodiac) {
            const zodiacPill = document.createElement('div');
            zodiacPill.className = 'milestone-pill';
            zodiacPill.innerHTML = `⭐ ${zodiac.sign} • ${zodiac.quote}`;
            milestoneStrip.appendChild(zodiacPill);
          }
        }
      }

      const warmPill = document.createElement('div');
      warmPill.className = 'milestone-pill';
      warmPill.innerHTML = `✨ Today is all about celebrating you!`;
      milestoneStrip.appendChild(warmPill);
    }
  }

  // --- Story Lines Provider ---
  function getActiveStory() {
    if (state.useCustomMessage && state.customMessage.trim().length > 0) {
      const customLines = state.customMessage
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);
      if (customLines.length > 0) return customLines;
    }
    // Default: The beloved classic poem from the repository!
    return DEFAULT_STORY_MESSAGES.map(line => line.replace('{NAME}', state.name));
  }

  function showStoryLine(index) {
    const lines = getActiveStory();
    if (index >= lines.length) index = 0;
    if (index < 0) index = lines.length - 1;
    state.storyIndex = index;

    const proseBox = document.getElementById('story-kinetic-prose');
    const counterEl = document.getElementById('story-line-counter');

    if (proseBox) {
      proseBox.style.opacity = '0';
      proseBox.style.transform = 'translateY(8px)';
      setTimeout(() => {
        proseBox.innerHTML = lines[index];
        proseBox.style.opacity = '1';
        proseBox.style.transform = 'translateY(0)';
      }, 200);
    }

    if (counterEl) {
      counterEl.textContent = `Message ${index + 1} of ${lines.length}`;
    }

    if (index === lines.length - 1) {
      launchConfetti(80);
      playCheerFanfare();
    }
  }

  // --- Story Cinema Auto-Advancing Messages ---
  let storyAutoTimer = null;
  let isStoryAutoPlaying = true;

  function startStoryAutoAdvance() {
    stopStoryAutoAdvance();
    isStoryAutoPlaying = true;
    updateAutoPlayButtonState();
    storyAutoTimer = setInterval(() => {
      const lines = getActiveStory();
      if (state.storyIndex >= lines.length - 1) {
        stopStoryAutoAdvance();
        launchConfetti(160);
        playCheerFanfare();
        showToast(`🎉 Happy Birthday, ${state.name}! The celebration continues! 💖`);
        return;
      }
      showStoryLine(state.storyIndex + 1);
    }, 3200);
  }

  function stopStoryAutoAdvance() {
    if (storyAutoTimer) {
      clearInterval(storyAutoTimer);
      storyAutoTimer = null;
    }
    isStoryAutoPlaying = false;
    updateAutoPlayButtonState();
  }

  function toggleStoryAutoAdvance() {
    if (isStoryAutoPlaying) {
      stopStoryAutoAdvance();
      showToast('⏸️ Story auto-play paused');
    } else {
      startStoryAutoAdvance();
      showToast('▶️ Resuming story auto-play');
    }
  }

  function updateAutoPlayButtonState() {
    const btn = document.getElementById('btn-story-autoplay');
    if (!btn) return;
    if (isStoryAutoPlaying) {
      btn.innerHTML = '⏸️ Auto-Playing';
      btn.classList.add('btn-gold');
      btn.classList.remove('btn-glass');
    } else {
      btn.innerHTML = '▶️ Resume Auto-Play';
      btn.classList.add('btn-glass');
      btn.classList.remove('btn-gold');
    }
  }

  // --- Stage Transition Controller ---
  function goToStage(stageNum) {
    if (stageNum < 1) stageNum = 1;
    if (stageNum > 5) stageNum = 5;
    state.currentStage = stageNum;

    // Toggle active scene
    document.querySelectorAll('.stage-scene').forEach(sc => sc.classList.remove('scene-active'));
    const targetScene = document.getElementById(`stage-scene-${stageNum}`);
    if (targetScene) targetScene.classList.add('scene-active');

    // Update Top Breadcrumb Stepper
    document.querySelectorAll('.step-indicator').forEach(ind => {
      const step = parseInt(ind.getAttribute('data-step'), 10);
      ind.classList.remove('active', 'completed');
      if (step === stageNum) ind.classList.add('active');
      else if (step < stageNum) ind.classList.add('completed');
    });

    // Specific Stage Actions
    if (stageNum === 1) {
      const lightsContainer = document.getElementById('lights-system-container');
      if (lightsContainer) lightsContainer.classList.add('lights-glow-on');
      resetAllGifts();
      stopStoryAutoAdvance();
    } else if (stageNum === 2) {
      buildBalloons();
      launchConfetti(40);
      stopStoryAutoAdvance();
    } else if (stageNum === 3) {
      playTone(659.25, 'triangle', 0.4);
      stopStoryAutoAdvance();
    } else if (stageNum === 4) {
      playTone(783.99, 'sine', 0.4);
      stopStoryAutoAdvance();
    } else if (stageNum === 5) {
      showStoryLine(state.storyIndex);
      startStoryAutoAdvance();
    }

    // Smooth scroll into stage
    const stageView = document.getElementById('stage-viewport');
    if (stageView) stageView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // --- Toast Notification ---
  function showToast(msg) {
    const toast = document.getElementById('cosmic-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('toast-active');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('toast-active');
    }, 3200);
  }

  // --- Real-Time Microphone Blow Detection ---
  let micStream = null;
  let micAnalyser = null;
  let isListeningMic = false;
  let blowFrameCount = 0;

  async function startMicBlowDetection() {
    if (state.isCandleBlown) return;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Microphone not supported on this browser/device');
        return;
      }
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx = getAudioCtx();
      if (!ctx) return;
      const source = ctx.createMediaStreamSource(micStream);
      micAnalyser = ctx.createAnalyser();
      micAnalyser.fftSize = 256;
      source.connect(micAnalyser);
      isListeningMic = true;

      const micPill = document.getElementById('mic-status-pill');
      if (micPill) {
        micPill.classList.add('listening');
        micPill.innerHTML = `<span>🎤 Listening... Blow gently into your mic!</span> <span class="mic-level-meter"><span class="mic-level-fill" id="mic-level-fill"></span></span>`;
      }
      showToast('🎤 Mic active! Blow into your microphone to blow out the flame!');
      pollMicLevels();
    } catch (err) {
      console.warn('Microphone permission or error:', err);
      showToast('Microphone not enabled. You can still click or tap to blow the candle!');
    }
  }

  function pollMicLevels() {
    if (!isListeningMic || state.isCandleBlown || !micAnalyser) return;
    const data = new Uint8Array(micAnalyser.frequencyBinCount);
    micAnalyser.getByteFrequencyData(data);

    // Low frequencies (50-250Hz) represent turbulent breath wind noise
    let lowEnergy = 0;
    const sampleBins = 14;
    for (let i = 0; i < sampleBins; i++) {
      lowEnergy += data[i];
    }
    const avgLow = lowEnergy / sampleBins;

    // Update fill meter
    const fillEl = document.getElementById('mic-level-fill');
    if (fillEl) {
      const pct = Math.min(100, Math.round((avgLow / 90) * 100));
      fillEl.style.width = pct + '%';
    }

    if (avgLow > 55) {
      blowFrameCount++;
      if (blowFrameCount >= 3) {
        blowCandle();
        stopMicBlowDetection();
        return;
      }
    } else {
      blowFrameCount = Math.max(0, blowFrameCount - 1);
    }

    requestAnimationFrame(pollMicLevels);
  }

  function stopMicBlowDetection() {
    isListeningMic = false;
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }
    const micPill = document.getElementById('mic-status-pill');
    if (micPill) {
      micPill.classList.remove('listening');
      micPill.innerHTML = `<span>✨ Candle blown! Wishes on their way!</span>`;
    }
  }

  // --- Candle Blow Action ---
  function blowCandle() {
    const flame = document.getElementById('candle-flame-real');
    const smoke = document.getElementById('realistic-smoke');
    if (flame) flame.classList.add('flame-extinguished');
    if (smoke) {
      smoke.classList.add('rising-smoke');
      setTimeout(() => smoke.classList.remove('rising-smoke'), 2200);
    }
    state.isCandleBlown = true;
    stopMicBlowDetection();
    playTone(300, 'sine', 0.3);
    setTimeout(playCheerFanfare, 200);
    launchConfetti(180);
    showToast(`🌟 Flame blown! May your dreams come true, ${state.name}!`);
  }

  // --- Gift Box Open Actions (3 Distinct 3D Surprise Boxes) ---
  function openSingleGift(boxNum) {
    const box = document.getElementById(`gift-box-${boxNum}`);
    const card = document.getElementById(`gift-pop-card-${boxNum}`);
    if (box) box.classList.add('box-unwrapped');
    if (card) card.classList.add('revealed');

    if (boxNum === 1) {
      playTone(523.25, 'triangle', 0.35, 0.3);
      setTimeout(() => playTone(659.25, 'sine', 0.3, 0.25), 120);
      launchConfetti(45);
      showToast('✨ Blessing Box opened! Boundless happiness to you!');
    } else if (boxNum === 2) {
      playCheerFanfare();
      launchConfetti(65);
      showToast('📸 Memory Polaroid revealed! Remembering our cherished moments ❤️');
    } else if (boxNum === 3) {
      playTone(783.99, 'triangle', 0.35, 0.3);
      setTimeout(() => playTone(1046.50, 'sine', 0.4, 0.3), 150);
      launchConfetti(55);
      showToast('🌟 Secret Wish unlocked! May your golden future shine bright!');
    }
  }

  function openAllGifts() {
    [1, 2, 3].forEach((num, idx) => {
      setTimeout(() => {
        openSingleGift(num);
      }, idx * 280);
    });
    setTimeout(() => {
      launchConfetti(120);
      showToast('🎁 All surprise gifts unwrapped! Wishing you the best year ahead!');
    }, 950);
  }

  function resetAllGifts() {
    [1, 2, 3].forEach(num => {
      const box = document.getElementById(`gift-box-${num}`);
      const card = document.getElementById(`gift-pop-card-${num}`);
      if (box) box.classList.remove('box-unwrapped');
      if (card) card.classList.remove('revealed');
    });
  }

  function openGiftBox() {
    openAllGifts();
  }

  // --- 3D Stacked Polaroid Deck (3 to 5 Photos) ---
  let isFlickingCard = false;

  function renderPolaroidDeck() {
    const deck = document.getElementById('polaroid-deck');
    const hint = document.getElementById('polaroid-stack-hint');
    if (!deck) return;
    deck.innerHTML = '';

    const total = state.photos.length;
    state.photos.forEach((photo, idx) => {
      const card = document.createElement('div');
      card.className = `polaroid-card stack-pos-${idx}`;
      card.dataset.index = idx;

      const imgBox = document.createElement('div');
      imgBox.className = 'polaroid-img-box';
      const img = document.createElement('img');
      img.className = 'polaroid-photo';
      img.src = photo.src;
      img.alt = `Birthday Memory ${idx + 1}`;
      img.loading = 'lazy';
      imgBox.appendChild(img);

      const cap = document.createElement('div');
      cap.className = 'polaroid-caption';
      cap.textContent = photo.caption || state.photoCaption;

      card.appendChild(imgBox);
      card.appendChild(cap);
      deck.appendChild(card);
    });

    if (hint) {
      hint.textContent = `📸 Photo ${state.activePhotoIndex + 1} of ${total} • Click to flip!`;
    }
  }

  function flipNextPolaroid() {
    if (isFlickingCard || state.photos.length <= 1) return;
    const deck = document.getElementById('polaroid-deck');
    if (!deck) return;
    const topCard = deck.querySelector('.stack-pos-0');
    if (!topCard) return;

    isFlickingCard = true;
    playCameraShutterSound();
    launchConfetti(25);

    topCard.classList.add('card-flicking');

    setTimeout(() => {
      // Rotate photos array: move top card to end of deck
      const firstPhoto = state.photos.shift();
      state.photos.push(firstPhoto);
      state.activePhotoIndex = (state.activePhotoIndex + 1) % state.photos.length;

      renderPolaroidDeck();
      isFlickingCard = false;
    }, 450);
  }

  // --- Setup Modal & 24-Hour Link Generator ---
  function setupModal() {
    const modal = document.getElementById('glass-creator-modal');
    const openBtn = document.getElementById('btn-header-personalize');
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('btn-modal-cancel');
    const previewBtn = document.getElementById('btn-modal-preview');
    const copyBtn = document.getElementById('btn-modal-copy-link');
    const waBtn = document.getElementById('btn-modal-whatsapp');

    const nameIn = document.getElementById('modal-input-name');
    const dateIn = document.getElementById('modal-input-date');
    const msgIn = document.getElementById('modal-input-msg');
    const captionIn = document.getElementById('modal-input-caption');
    const thumbsRow = document.getElementById('preset-thumbs-row');
    const photoUpload = document.getElementById('modal-photo-upload');
    const resetPhotosBtn = document.getElementById('btn-reset-preset-photos');

    function renderPresetThumbs() {
      if (!thumbsRow) return;
      thumbsRow.innerHTML = '';
      PRESET_MEMORIES.forEach(preset => {
        const isSelected = state.photos.some(p => p.id === preset.id);
        const chip = document.createElement('div');
        chip.className = `preset-thumb-chip ${isSelected ? 'selected' : ''}`;
        chip.title = `${preset.title} (Click to toggle)`;

        const img = document.createElement('img');
        img.src = preset.src;
        img.alt = preset.title;
        chip.appendChild(img);

        if (isSelected) {
          const check = document.createElement('div');
          check.className = 'chip-check';
          check.textContent = '✓';
          chip.appendChild(check);
        }

        chip.addEventListener('click', () => {
          const currentlySelected = state.photos.some(p => p.id === preset.id);
          if (currentlySelected) {
            if (state.photos.length <= 3) {
              showToast('⚠️ Please keep at least 3 photos in your 3D stack!');
              return;
            }
            state.photos = state.photos.filter(p => p.id !== preset.id);
          } else {
            if (state.photos.length >= 5) {
              showToast('⚠️ Maximum 5 photos allowed in the 3D stack!');
              return;
            }
            state.photos.push({
              id: preset.id,
              src: preset.src,
              caption: (captionIn ? captionIn.value.trim() : state.photoCaption) || preset.defaultCaption
            });
          }
          state.activePhotoIndex = 0;
          renderPresetThumbs();
          renderPolaroidDeck();
        });

        thumbsRow.appendChild(chip);
      });
    }

    if (photoUpload) {
      photoUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        if (files.length === 0) return;
        const customPhotos = [];
        let loaded = 0;
        files.forEach((file, idx) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            customPhotos.push({
              id: 100 + idx,
              src: ev.target.result,
              caption: captionIn ? captionIn.value.trim() : state.photoCaption
            });
            loaded++;
            if (loaded === files.length) {
              state.photos = customPhotos;
              state.activePhotoIndex = 0;
              renderPresetThumbs();
              renderPolaroidDeck();
              showToast(`📸 Loaded ${customPhotos.length} custom memory photos!`);
            }
          };
          reader.readAsDataURL(file);
        });
      });
    }

    if (resetPhotosBtn) {
      resetPhotosBtn.addEventListener('click', () => {
        state.photos = [
          { id: 1, src: 'bd1.jpg', caption: state.photoCaption },
          { id: 2, src: 'bd2.jpg', caption: state.photoCaption },
          { id: 3, src: 'bd3.jpg', caption: state.photoCaption },
          { id: 4, src: 'bd4.jpg', caption: state.photoCaption }
        ];
        state.activePhotoIndex = 0;
        renderPresetThumbs();
        renderPolaroidDeck();
        showToast('↺ Reset to 4 default celebration memories!');
      });
    }

    function populateModal() {
      if (nameIn) nameIn.value = state.name;
      if (dateIn) dateIn.value = state.birthDate;
      if (msgIn) msgIn.value = state.customMessage;
      if (captionIn) captionIn.value = state.photoCaption;
      renderPresetThumbs();

      // Sync active theme state in modal
      const isPotter = (state.backgroundTheme === 'potter');
      const cardP = document.getElementById('theme-card-potter');
      const cardF = document.getElementById('theme-card-festive');
      if (cardP) {
        cardP.classList.toggle('active', isPotter);
        const rP = cardP.querySelector('input[type="radio"]');
        if (rP) rP.checked = isPotter;
      }
      if (cardF) {
        cardF.classList.toggle('active', !isPotter);
        const rF = cardF.querySelector('input[type="radio"]');
        if (rF) rF.checked = !isPotter;
      }
    }

    // Modal theme card click listeners
    const modalThemeCardPotter = document.getElementById('theme-card-potter');
    const modalThemeCardFestive = document.getElementById('theme-card-festive');
    if (modalThemeCardPotter) {
      modalThemeCardPotter.addEventListener('click', () => {
        switchBackgroundTheme('potter', false);
      });
    }
    if (modalThemeCardFestive) {
      modalThemeCardFestive.addEventListener('click', () => {
        switchBackgroundTheme('festive', false);
      });
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        populateModal();
        if (modal) modal.classList.add('overlay-open');
      });
    }

    function hideModal() {
      if (modal) modal.classList.remove('overlay-open');
    }

    if (closeBtn) closeBtn.addEventListener('click', hideModal);
    if (cancelBtn) cancelBtn.addEventListener('click', hideModal);

    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        state.name = nameIn.value.trim() || 'Amaan';
        state.birthDate = dateIn.value;
        state.customMessage = msgIn.value.trim();
        state.useCustomMessage = state.customMessage.length > 0;
        if (captionIn) {
          state.photoCaption = captionIn.value.trim() || 'Best moments with you ❤️';
          state.photos.forEach(p => p.caption = state.photoCaption);
        }

        const selectedRadio = document.querySelector('input[name="modal-bg-theme"]:checked');
        if (selectedRadio) {
          switchBackgroundTheme(selectedRadio.value, false);
        }

        updatePresentationText();
        buildBalloons();
        renderPolaroidDeck();
        showStoryLine(0);
        hideModal();
        goToStage(1);
        showToast(`✨ Updated celebration for ${state.name}!`);
      });
    }

    function build24hShareURL() {
      const url = new URL(window.location.origin + window.location.pathname);
      const curName = nameIn ? (nameIn.value.trim() || state.name) : state.name;
      url.searchParams.set('name', curName);

      const curDate = dateIn ? dateIn.value : state.birthDate;
      if (curDate) url.searchParams.set('date', curDate);

      const curMsg = msgIn ? msgIn.value.trim() : state.customMessage;
      if (curMsg) url.searchParams.set('msg', curMsg);

      // Preserve photos if using preset IDs
      const presetIds = state.photos.map(p => p.id).filter(id => id && id <= 5);
      if (presetIds.length >= 2) {
        url.searchParams.set('p', presetIds.join(','));
      }

      const curCap = captionIn ? captionIn.value.trim() : state.photoCaption;
      if (curCap && curCap !== 'Best moments with you ❤️') {
        url.searchParams.set('cap', curCap);
      }

      // STRICT 24-HOUR EXPIRATION TIMESTAMP (Epoch millis: current time + 24 hours)
      const expTime = Date.now() + 24 * 60 * 60 * 1000;
      url.searchParams.set('exp', expTime.toString());

      // Auto-preview mode flag for recipient
      url.searchParams.set('preview', '1');

      // Theme preference persistence
      url.searchParams.set('theme', state.backgroundTheme || 'potter');

      return url.toString();
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const link = build24hShareURL();
        navigator.clipboard.writeText(link).then(() => {
          showToast('⏳ 24-Hour Birthday Link copied! Valid for 24h only.');
        }).catch(() => {
          prompt('Copy your 24-hour celebration link:', link);
        });
      });
    }

    if (waBtn) {
      waBtn.addEventListener('click', () => {
        const link = build24hShareURL();
        const curName = nameIn ? (nameIn.value.trim() || state.name) : state.name;
        const text = encodeURIComponent(`🎉 A magical Happy Birthday celebration created for ${curName}! ✨ Open your surprise (active for 24 hours only): ${link}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
      });
    }

    // Header Quick Share (also generates fresh 24h link)
    const headerShare = document.getElementById('btn-header-share');
    if (headerShare) {
      headerShare.addEventListener('click', () => {
        const link = build24hShareURL();
        navigator.clipboard.writeText(link).then(() => {
          showToast('⏳ 24-Hour Birthday Link copied to clipboard!');
        }).catch(() => {
          prompt('Copy this 24-hour link:', link);
        });
      });
    }
  }

  // --- DOM Ready Initializer ---
  document.addEventListener('DOMContentLoaded', () => {
    parseParameters();

    // 1. Initialize Harry Potter World Canvas Engine
    initPotterCosmos();
    renderPotterCosmos();

    // 2. Initialize Festive 3D Birthday WebGL Scene (with automatic 2D fallback)
    if (!initThreeCosmos()) {
      initCosmos();
      renderCosmos();
    } else {
      renderThreeCosmos();
    }

    // 3. Strictly activate chosen theme (potter by default)
    switchBackgroundTheme(state.backgroundTheme || 'potter', false);
    window.scrollTo(0, 0);

    updatePresentationText();
    buildBalloons();
    renderPolaroidDeck();
    setupModal();
    resetAllGifts(); // Ensure all boxes start completely closed

    // Header 3D Background Theme Switcher
    const headerThemeToggle = document.getElementById('btn-theme-toggle');
    if (headerThemeToggle) {
      headerThemeToggle.addEventListener('click', () => {
        getAudioCtx();
        const nextTheme = (state.backgroundTheme === 'potter') ? 'festive' : 'potter';
        switchBackgroundTheme(nextTheme, true);
      });
    }

    // Check 24-Hour Expiration
    if (state.is24hExpired) {
      const expiredOverlay = document.getElementById('expired-link-overlay');
      if (expiredOverlay) expiredOverlay.classList.add('overlay-open');
    }

    const unlockReplayBtn = document.getElementById('btn-unlock-replay');
    const createFreshBtn = document.getElementById('btn-create-fresh');
    if (unlockReplayBtn) {
      unlockReplayBtn.addEventListener('click', () => {
        const expiredOverlay = document.getElementById('expired-link-overlay');
        if (expiredOverlay) expiredOverlay.classList.remove('overlay-open');
        showToast('✨ Replay unlocked! Enjoy the celebration!');
      });
    }
    if (createFreshBtn) {
      createFreshBtn.addEventListener('click', () => {
        const expiredOverlay = document.getElementById('expired-link-overlay');
        if (expiredOverlay) expiredOverlay.classList.remove('overlay-open');
        const modal = document.getElementById('glass-creator-modal');
        if (modal) modal.classList.add('overlay-open');
      });
    }

    // Polaroid Stack Click Flip
    const polaroidContainer = document.getElementById('polaroid-stack-container');
    if (polaroidContainer) {
      polaroidContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        flipNextPolaroid();
      });
    }

    // Breadcrumb Steppers Click
    document.querySelectorAll('.step-indicator').forEach(ind => {
      ind.addEventListener('click', () => {
        getAudioCtx();
        const step = parseInt(ind.getAttribute('data-step'), 10);
        goToStage(step);
      });
    });

    // Navigation Buttons between Stages (Hedwig Owl flies across screen to change stage!)
    document.querySelectorAll('[data-next-stage]').forEach(btn => {
      btn.addEventListener('click', () => {
        getAudioCtx();
        const target = parseInt(btn.getAttribute('data-next-stage'), 10);
        if (state.backgroundTheme === 'potter') {
          triggerHedwigNextTransition(target);
        } else {
          goToStage(target);
        }
      });
    });

    document.querySelectorAll('[data-prev-stage]').forEach(btn => {
      btn.addEventListener('click', () => {
        getAudioCtx();
        const target = parseInt(btn.getAttribute('data-prev-stage'), 10);
        goToStage(target);
      });
    });

    // Candle Actions
    const candleBlowBtn = document.getElementById('btn-blow-candle');
    const candleAssembly = document.getElementById('candle-assembly');
    const micPill = document.getElementById('mic-status-pill');
    const micBtn = document.getElementById('btn-enable-mic');
    if (candleBlowBtn) candleBlowBtn.addEventListener('click', blowCandle);
    if (candleAssembly) candleAssembly.addEventListener('click', blowCandle);
    if (micPill) micPill.addEventListener('click', startMicBlowDetection);
    if (micBtn) micBtn.addEventListener('click', startMicBlowDetection);

    // Gift Actions (3 Distinct 3D Boxes + Open All)
    const box1 = document.getElementById('gift-box-1');
    const box2 = document.getElementById('gift-box-2');
    const box3 = document.getElementById('gift-box-3');
    const openAllGiftsBtn = document.getElementById('btn-open-all-gifts');

    const item1 = document.getElementById('gift-item-1');
    const item2 = document.getElementById('gift-item-2');
    const item3 = document.getElementById('gift-item-3');
    if (item1) item1.addEventListener('click', (e) => { if (!e.target.closest('.gift-pop-card')) openSingleGift(1); });
    if (item2) item2.addEventListener('click', (e) => { if (!e.target.closest('.gift-pop-card')) openSingleGift(2); });
    if (item3) item3.addEventListener('click', (e) => { if (!e.target.closest('.gift-pop-card')) openSingleGift(3); });

    if (box1) box1.addEventListener('click', (e) => { e.stopPropagation(); openSingleGift(1); });
    if (box2) box2.addEventListener('click', (e) => { e.stopPropagation(); openSingleGift(2); });
    if (box3) box3.addEventListener('click', (e) => { e.stopPropagation(); openSingleGift(3); });
    if (openAllGiftsBtn) openAllGiftsBtn.addEventListener('click', openAllGifts);

    const resetAllGiftsBtn = document.getElementById('btn-reset-all-gifts');
    if (resetAllGiftsBtn) {
      resetAllGiftsBtn.addEventListener('click', () => {
        resetAllGifts();
        showToast('↺ All boxes closed! Click any gift box to open its surprise.');
      });
    }

    // Also clicking anywhere on the gift item cards or polaroid triggers sparkles
    const card1 = document.getElementById('gift-pop-card-1');
    const card3 = document.getElementById('gift-pop-card-3');
    if (card1) card1.addEventListener('click', () => { launchConfetti(35); playTone(523.25, 'triangle', 0.2); });
    if (card3) card3.addEventListener('click', () => { launchConfetti(35); playTone(783.99, 'triangle', 0.2); });

    // Legacy fallback
    const legacyGiftBox = document.getElementById('gift-3d-box');
    const legacyGiftOpenBtn = document.getElementById('btn-open-gift');
    if (legacyGiftBox) legacyGiftBox.addEventListener('click', openAllGifts);
    if (legacyGiftOpenBtn) legacyGiftOpenBtn.addEventListener('click', openAllGifts);

    // Story Auto-Play toggle button
    const autoPlayBtn = document.getElementById('btn-story-autoplay');
    if (autoPlayBtn) {
      autoPlayBtn.addEventListener('click', () => {
        getAudioCtx();
        toggleStoryAutoAdvance();
      });
    }

    // Story Navigation (Previous Line / Next Line)
    const storyNext = document.getElementById('story-nav-next');
    const storyPrev = document.getElementById('story-nav-prev');
    if (storyNext) {
      storyNext.addEventListener('click', () => {
        getAudioCtx();
        playTone(600, 'sine', 0.15, 0.15);
        showStoryLine(state.storyIndex + 1);
        if (isStoryAutoPlaying) startStoryAutoAdvance();
      });
    }
    if (storyPrev) {
      storyPrev.addEventListener('click', () => {
        getAudioCtx();
        playTone(500, 'sine', 0.15, 0.15);
        showStoryLine(state.storyIndex - 1);
        if (isStoryAutoPlaying) startStoryAutoAdvance();
      });
    }

    // Story Message Choice Toggle: Default vs Custom
    const btnChoiceDefault = document.getElementById('toggle-poem-default');
    const btnChoiceCustom = document.getElementById('toggle-poem-custom');
    if (btnChoiceDefault) {
      btnChoiceDefault.addEventListener('click', () => {
        state.useCustomMessage = false;
        btnChoiceDefault.classList.add('active');
        if (btnChoiceCustom) btnChoiceCustom.classList.remove('active');
        showStoryLine(0);
        if (isStoryAutoPlaying) startStoryAutoAdvance();
        showToast('✨ Reading the classic heartfelt poem dedicated to ' + state.name);
      });
    }
    if (btnChoiceCustom) {
      btnChoiceCustom.addEventListener('click', () => {
        state.useCustomMessage = true;
        btnChoiceCustom.classList.add('active');
        if (btnChoiceDefault) btnChoiceDefault.classList.remove('active');
        if (!state.customMessage) {
          const customPrompt = prompt('Enter your custom message (or press OK to customize via Personalize):', 'You are the most wonderful person in the world!');
          if (customPrompt) state.customMessage = customPrompt;
        }
        showStoryLine(0);
        if (isStoryAutoPlaying) startStoryAutoAdvance();
        showToast('✍️ Showing custom message');
      });
    }

    // Header Music Toggle
    const musicBtn = document.getElementById('btn-header-music');
    const audio = document.getElementById('birthday-song');
    const meter = document.getElementById('audio-visualizer-box');
    if (musicBtn && audio) {
      musicBtn.addEventListener('click', () => {
        getAudioCtx();
        if (audio.paused) {
          audio.play().then(() => {
            state.isPlayingMusic = true;
            musicBtn.innerHTML = '🔊 Music Playing';
            if (meter) meter.classList.remove('meter-paused');
          });
        } else {
          audio.pause();
          state.isPlayingMusic = false;
          musicBtn.innerHTML = '🔈 Play Music';
          if (meter) meter.classList.add('meter-paused');
        }
      });
    }

    // Start on Stage 1
    goToStage(1);
  });
})();
