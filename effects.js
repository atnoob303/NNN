// ═══════════════════════════════════════════════════════════════
// effects.js — Hiệu ứng visual cho Roblox UI Builder
// Load sau definitions.js, trước app.js
// ═══════════════════════════════════════════════════════════════
// Bổ sung sau: thêm hiệu ứng vào đây, app.js gọi tự động.
// ═══════════════════════════════════════════════════════════════

// ── CONFIG ──────────────────────────────────────────────────────
var FX = {
  fadeIn:       true,   // Fade in khi thêm element
  selectPulse:  true,   // Pulse khi select element
  hoverGlow:    true,   // Glow khi hover element trên canvas
  tweenPreview: false,  // Preview TweenService (bật sau)
};

// ── CSS KEYFRAMES (inject 1 lần lúc load) ───────────────────────
(function injectFxStyles() {
  var s = document.createElement('style');
  s.id = 'fx-styles';
  s.textContent = `
    /* Fade in khi element được thêm vào canvas */
    @keyframes fx-fadein {
      from { opacity: 0; transform: scale(0.92) rotate(var(--rot, 0deg)); }
      to   { opacity: 1; transform: scale(1)    rotate(var(--rot, 0deg)); }
    }
    .fx-fadein {
      animation: fx-fadein 0.18s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    /* Pulse khi select */
    @keyframes fx-select-pulse {
      0%   { outline-width: 2px; }
      50%  { outline-width: 5px; }
      100% { outline-width: 2px; }
    }
    .fx-select-pulse {
      animation: fx-select-pulse 0.25s ease-out;
    }

    /* Hover glow */
    .element:not(.sel):hover {
      box-shadow: 0 0 0 1px rgba(124,106,247,0.4),
                  0 0 12px rgba(124,106,247,0.15) !important;
      transition: box-shadow 0.12s ease;
    }

    /* Delete shake */
    @keyframes fx-shake {
      0%,100% { transform: translateX(0) rotate(var(--rot,0deg)); }
      20%      { transform: translateX(-4px) rotate(var(--rot,0deg)); }
      40%      { transform: translateX(4px) rotate(var(--rot,0deg)); }
      60%      { transform: translateX(-3px) rotate(var(--rot,0deg)); }
      80%      { transform: translateX(3px) rotate(var(--rot,0deg)); }
    }
    .fx-shake {
      animation: fx-shake 0.3s ease;
    }

    /* Dup bounce */
    @keyframes fx-dup {
      0%   { opacity:0; transform: translate(10px, 10px) scale(0.9) rotate(var(--rot,0deg)); }
      70%  { transform: translate(0,0) scale(1.04) rotate(var(--rot,0deg)); }
      100% { opacity:1; transform: translate(0,0) scale(1) rotate(var(--rot,0deg)); }
    }
    .fx-dup {
      animation: fx-dup 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    /* Drag ghost */
    .fx-drag-ghost {
      opacity: 0.45 !important;
      outline: 2px dashed rgba(124,106,247,0.6) !important;
      transition: opacity 0.1s;
    }

    /* Parent highlight khi drop */
    @keyframes fx-parent-highlight {
      0%,100% { box-shadow: none; }
      50%      { box-shadow: inset 0 0 0 3px rgba(34,211,238,0.7); }
    }
    .fx-parent-highlight {
      animation: fx-parent-highlight 0.4s ease;
    }

    /* Tween preview overlay */
    .fx-tween-target {
      outline: 2px solid #fbbf24 !important;
      outline-offset: 3px;
    }
  `;
  document.head.appendChild(s);
})();

// ════════════════════════════════════════════════════════════════
// §FX-1  FADE IN — gọi sau khi renderEl() tạo DOM element
// ════════════════════════════════════════════════════════════════
/**
 * Gọi sau khi element được thêm vào canvas lần đầu.
 * @param {string} id - element id
 */
function fxFadeIn(id) {
  if (!FX.fadeIn) return;
  var d = document.getElementById(id);
  if (!d) return;
  d.classList.remove('fx-fadein');
  // Force reflow để restart animation
  void d.offsetWidth;
  d.classList.add('fx-fadein');
  d.addEventListener('animationend', function handler() {
    d.classList.remove('fx-fadein');
    d.removeEventListener('animationend', handler);
  });
}

// ════════════════════════════════════════════════════════════════
// §FX-2  SELECT PULSE — gọi khi element được select
// ════════════════════════════════════════════════════════════════
/**
 * @param {string} id - element id
 */
function fxSelectPulse(id) {
  if (!FX.selectPulse) return;
  var d = document.getElementById(id);
  if (!d) return;
  d.classList.remove('fx-select-pulse');
  void d.offsetWidth;
  d.classList.add('fx-select-pulse');
  d.addEventListener('animationend', function handler() {
    d.classList.remove('fx-select-pulse');
    d.removeEventListener('animationend', handler);
  });
}

// ════════════════════════════════════════════════════════════════
// §FX-3  SHAKE BEFORE DELETE
// ════════════════════════════════════════════════════════════════
/**
 * Gọi TRƯỚC khi xóa element, trả về Promise resolve sau animation.
 * @param {string} id
 * @returns {Promise}
 */
function fxShake(id) {
  return new Promise(function(resolve) {
    var d = document.getElementById(id);
    if (!d) { resolve(); return; }
    d.classList.add('fx-shake');
    d.addEventListener('animationend', function handler() {
      d.classList.remove('fx-shake');
      d.removeEventListener('animationend', handler);
      resolve();
    });
  });
}

// ════════════════════════════════════════════════════════════════
// §FX-4  DUP BOUNCE
// ════════════════════════════════════════════════════════════════
function fxDup(id) {
  var d = document.getElementById(id);
  if (!d) return;
  d.classList.remove('fx-dup');
  void d.offsetWidth;
  d.classList.add('fx-dup');
  d.addEventListener('animationend', function handler() {
    d.classList.remove('fx-dup');
    d.removeEventListener('animationend', handler);
  });
}

// ════════════════════════════════════════════════════════════════
// §FX-5  PARENT HIGHLIGHT
// ════════════════════════════════════════════════════════════════
function fxParentHighlight(id) {
  var d = document.getElementById(id);
  if (!d) return;
  d.classList.remove('fx-parent-highlight');
  void d.offsetWidth;
  d.classList.add('fx-parent-highlight');
  d.addEventListener('animationend', function handler() {
    d.classList.remove('fx-parent-highlight');
    d.removeEventListener('animationend', handler);
  });
}

// ════════════════════════════════════════════════════════════════
// §FX-6  DRAG GHOST (set/clear class khi drag)
// ════════════════════════════════════════════════════════════════
function fxDragStart(id) {
  var d = document.getElementById(id);
  if (d) d.classList.add('fx-drag-ghost');
}
function fxDragEnd(id) {
  var d = document.getElementById(id);
  if (d) d.classList.remove('fx-drag-ghost');
}

// ════════════════════════════════════════════════════════════════
// §FX-7  TWEEN PREVIEW (placeholder — bổ sung sau)
// ════════════════════════════════════════════════════════════════
/**
 * Preview TweenService animation cho element trên canvas.
 * @param {string} id - element id
 * @param {object} tweenInfo - { time, easingStyle, easingDirection, repeatCount, reverses, delayTime }
 * @param {object} goals    - { x, y, w, h, opacity, rotation } (pixel values)
 */
function fxTweenPreview(id, tweenInfo, goals) {
  if (!FX.tweenPreview) {
    toast('⚠ Tween Preview chưa bật. Bật FX.tweenPreview = true trong effects.js');
    return;
  }
  // TODO: implement CSS transition dựa theo tweenInfo
  // Easings map: Roblox EasingStyle → CSS timing-function
  var easingMap = {
    Linear:   'linear',
    Quad:     'cubic-bezier(0.45,0,0.55,1)',
    Cubic:    'cubic-bezier(0.65,0,0.35,1)',
    Quart:    'cubic-bezier(0.76,0,0.24,1)',
    Quint:    'cubic-bezier(0.83,0,0.17,1)',
    Sine:     'cubic-bezier(0.37,0,0.63,1)',
    Expo:     'cubic-bezier(0.96,0,0.04,1)',
    Circ:     'cubic-bezier(0.85,0,0.15,1)',
    Bounce:   'cubic-bezier(0.34,1.56,0.64,1)', // approx
    Elastic:  'cubic-bezier(0.34,1.56,0.64,1)',
    Back:     'cubic-bezier(0.34,1.56,0.64,1)',
  };
  toast('⏳ Tween Preview — coming soon!');
}

// ════════════════════════════════════════════════════════════════
// §FX-8  TOGGLE SETTINGS
// ════════════════════════════════════════════════════════════════
function fxToggle(key) {
  if (FX.hasOwnProperty(key)) {
    FX[key] = !FX[key];
    toast('FX.' + key + ' = ' + FX[key]);
  }
}
