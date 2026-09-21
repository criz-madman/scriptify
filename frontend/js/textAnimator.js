/**
 * Scriptify - Text Animation Generator Module
 * Real-time After Effects Text Animator Physics Simulation & ExtendScript Exporter
 * Supports 12 AE Properties, Separation Selector (Characters, Words, Lines),
 * and Custom Expression Studio with Interactive Parameter Tuner.
 */

const TextAnimator = (() => {
  // State Variables
  let freq = 3.0;
  let decay = 4.5;
  let delay = 0.08;
  let amp = 60;
  let separation = 'characters'; // 'characters' | 'words' | 'lines'
  let animProperty = 'position'; // 12 AE properties
  let expressionMode = 'preset'; // 'preset' | 'custom'
  let includeNull = true;
  let textContent = 'Scriptify Kinetic Motion';
  let isRunning = true;
  let startTime = performance.now();

  // Preset template expressions
  const TEMPLATES = {
    bounce: `var myDelay = (textIndex - 1) * delay;
var t = time - inPoint - myDelay;
if (t < 0) { 0; } else { (Math.sin(t * freq * Math.PI * 2) / Math.exp(t * decay)) * 100; }`,
    elastic: `var myDelay = (textIndex - 1) * delay;
var t = time - inPoint - myDelay;
if (t < 0) { 0; } else { (Math.sin(t * freq * 3.5) * Math.exp(-t * decay * 0.9)) * 100; }`,
    cascade: `var myDelay = (textIndex - 1) * delay;
var t = time - inPoint - myDelay;
if (t < 0) { 0; } else { Math.sin((t * freq * 4.0) + (textIndex * 0.4)) * 100; }`,
    jitter: `seedRandom(textIndex, false);
var j = (random() - 0.5) * 2;
var t = time - inPoint;
if (t < 0) { 0; } else { (j * Math.exp(-t * decay)) * 100; }`
  };

  // DOM Elements
  const textInput = document.getElementById('ta-text-input');
  const sepButtons = document.querySelectorAll('.ta-sep-btn');
  const propSelect = document.getElementById('ta-prop-select');
  const modePresetBtn = document.getElementById('ta-mode-preset-btn');
  const modeCustomBtn = document.getElementById('ta-mode-custom-btn');
  const customExprContainer = document.getElementById('ta-custom-expr-container');
  const customExprInput = document.getElementById('ta-custom-expr-input');
  const templateButtons = document.querySelectorAll('.ta-template-btn');
  const sliderFreq = document.getElementById('ta-freq-slider');
  const valFreq = document.getElementById('ta-freq-val');
  const sliderDecay = document.getElementById('ta-decay-slider');
  const valDecay = document.getElementById('ta-decay-val');
  const sliderDelay = document.getElementById('ta-delay-slider');
  const valDelay = document.getElementById('ta-delay-val');
  const sliderAmp = document.getElementById('ta-amp-slider');
  const valAmp = document.getElementById('ta-amp-val');
  const checkNull = document.getElementById('ta-null-check');
  const animatedElement = document.getElementById('ta-preview-target');
  const modeBadge = document.getElementById('ta-mode-badge');
  const statusSubtext = document.getElementById('ta-status-subtext');
  const btnDownloadJsx = document.getElementById('ta-btn-download');
  const btnCopyExpr = document.getElementById('ta-btn-copy-expr');
  const btnCopyJsx = document.getElementById('ta-btn-copy');
  const btnCopyExprBox = document.getElementById('ta-btn-copy-expr-box');
  const exprCodeOutput = document.getElementById('ta-expr-code-output');

  // Matrix characters for Character Offset scramble simulation
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@!%&*';

  // Generate Raw After Effects ES3 Expression based on current settings
  const getRawExpression = () => {
    const separationLabel = separation.charAt(0).toUpperCase() + separation.slice(1);
    const exprBody = (expressionMode === 'custom' && customExprInput && customExprInput.value.trim()) 
      ? customExprInput.value.trim() 
      : `var myDelay = (textIndex - 1) * delay;
var t = time - inPoint - myDelay;

if (t < 0) {
    0;
} else {
    var bounce = Math.sin(t * freq * Math.PI * 2) / Math.exp(t * decay);
    bounce * 100;
}`;

    if (includeNull) {
      return `// Scriptify Text Expression (Linked to Null Controller)
// Separation Mode: ${separationLabel} (textIndex)
var ctrl = thisComp.layer("Text_Animation_Controller");
var freq = ctrl.effect("Frequency (Hz)")("Slider");
var decay = ctrl.effect("Decay (Damping)")("Slider");
var delay = ctrl.effect("Stagger Delay (Sec)")("Slider");
var amp = ctrl.effect("Bounce Amplitude")("Slider");

${exprBody}`;
    } else {
      return `// Scriptify Self-Contained Text Expression
// Separation Mode: ${separationLabel} (textIndex)
var freq = ${freq};
var decay = ${decay};
var delay = ${delay};
var amp = ${amp};

${exprBody}`;
    }
  };

  // Re-render the live expression code block
  const renderExpressionCode = () => {
    if (exprCodeOutput) {
      exprCodeOutput.textContent = getRawExpression();
    }
  };

  // Switch between Preset Physics mode and Custom Expression Studio
  const setExpressionMode = (mode) => {
    expressionMode = mode;
    if (mode === 'custom') {
      if (modeCustomBtn) {
        modeCustomBtn.className = 'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm';
      }
      if (modePresetBtn) {
        modePresetBtn.className = 'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all text-zinc-400 hover:text-white';
      }
      if (customExprContainer) {
        customExprContainer.classList.remove('hidden');
      }
    } else {
      if (modePresetBtn) {
        modePresetBtn.className = 'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm';
      }
      if (modeCustomBtn) {
        modeCustomBtn.className = 'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all text-zinc-400 hover:text-white';
      }
      if (customExprContainer) {
        customExprContainer.classList.add('hidden');
      }
    }
    updateParameters();
  };

  // Rebuild preview DOM nodes based on current separation mode
  const rebuildPreviewUnits = () => {
    if (!animatedElement) return;
    animatedElement.innerHTML = '';

    const cleanText = textContent.trim() || 'Scriptify Kinetic Motion';

    if (separation === 'characters') {
      const words = cleanText.split(/\s+/);
      let globalIdx = 0;

      words.forEach((w) => {
        const wordContainer = document.createElement('span');
        wordContainer.className = 'inline-block whitespace-nowrap mx-1.5';

        for (let i = 0; i < w.length; i++) {
          const charSpan = document.createElement('span');
          charSpan.className = 'ta-anim-unit inline-block will-change-transform';
          charSpan.dataset.index = globalIdx++;
          charSpan.dataset.originalChar = w[i];
          charSpan.textContent = w[i];
          wordContainer.appendChild(charSpan);
        }

        animatedElement.appendChild(wordContainer);
      });
    } else if (separation === 'words') {
      const words = cleanText.split(/\s+/);
      words.forEach((w, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'ta-anim-unit inline-block will-change-transform mx-2';
        wordSpan.dataset.index = wIdx;
        wordSpan.dataset.originalChar = w;
        wordSpan.textContent = w;
        animatedElement.appendChild(wordSpan);
      });
    } else if (separation === 'lines') {
      let lines = cleanText.split(/\r?\n/);
      if (lines.length === 1 && cleanText.length > 20) {
        const mid = Math.floor(cleanText.length / 2);
        const spaceIdx = cleanText.indexOf(' ', mid);
        if (spaceIdx !== -1) {
          lines = [cleanText.slice(0, spaceIdx), cleanText.slice(spaceIdx + 1)];
        }
      }

      lines.forEach((l, lIdx) => {
        const lineSpan = document.createElement('div');
        lineSpan.className = 'ta-anim-unit block w-full will-change-transform my-1 leading-snug';
        lineSpan.dataset.index = lIdx;
        lineSpan.dataset.originalChar = l;
        lineSpan.textContent = l;
        animatedElement.appendChild(lineSpan);
      });
    }
  };

  // Real-time Physics Simulation Loop (Supports all 12 AE Properties)
  const animate = (currentTime) => {
    if (isRunning && animatedElement) {
      const elapsed = (currentTime - startTime) / 1000;
      const units = animatedElement.querySelectorAll('.ta-anim-unit');
      const unitCount = units.length || 1;

      // Cycle duration allows full stagger wave + settle + rest pause
      const cycleDuration = Math.max(3.0, (unitCount * delay) + 2.2);
      const cycleTime = elapsed % cycleDuration;

      units.forEach((unit) => {
        const idx = parseInt(unit.dataset.index || '0', 10);
        const originalChar = unit.dataset.originalChar || unit.textContent;
        const myDelay = idx * delay;
        const t = cycleTime - myDelay;

        let bounce = 0;
        if (t >= 0) {
          // Calculate physics response based on tuned parameters
          bounce = Math.sin(t * freq * Math.PI * 2) / Math.exp(t * decay);
        }

        // Apply visual transformation based on selected Target Property (12 properties)
        if (t < 0) {
          // Pre-trigger rest / wait state
          if (animProperty === 'position') {
            unit.style.transform = `translate3d(0, ${amp}px, 0)`;
            unit.style.opacity = '0.35';
            unit.style.filter = 'none';
          } else if (animProperty === 'scale') {
            unit.style.transform = `scale(0.2)`;
            unit.style.opacity = '0.2';
            unit.style.filter = 'none';
          } else if (animProperty === 'skew') {
            unit.style.transform = `skewX(${amp}deg)`;
            unit.style.opacity = '0.4';
            unit.style.filter = 'none';
          } else if (animProperty === 'rotation') {
            unit.style.transform = `rotate(${amp}deg)`;
            unit.style.opacity = '0.35';
            unit.style.filter = 'none';
          } else if (animProperty === 'opacity') {
            unit.style.transform = 'none';
            unit.style.opacity = '0';
            unit.style.filter = 'none';
          } else if (animProperty === 'fillColor') {
            unit.style.transform = 'none';
            unit.style.color = '#f97316';
            unit.style.opacity = '0.5';
            unit.style.filter = 'none';
          } else if (animProperty === 'strokeColor') {
            unit.style.transform = 'none';
            unit.style.webkitTextStroke = '1.5px #f59e0b';
            unit.style.opacity = '0.7';
            unit.style.filter = 'none';
          } else if (animProperty === 'strokeWidth') {
            unit.style.transform = 'none';
            unit.style.webkitTextStroke = '3px #f97316';
            unit.style.opacity = '0.8';
            unit.style.filter = 'none';
          } else if (animProperty === 'tracking') {
            unit.style.transform = 'none';
            unit.style.letterSpacing = `${(amp / 6).toFixed(1)}px`;
            unit.style.opacity = '0.6';
            unit.style.filter = 'none';
          } else if (animProperty === 'lineSpacing') {
            unit.style.transform = `translate3d(0, ${amp * 0.5}px, 0)`;
            unit.style.opacity = '0.5';
            unit.style.filter = 'none';
          } else if (animProperty === 'characterOffset') {
            unit.style.transform = 'none';
            unit.style.opacity = '0.5';
            unit.style.color = '#fbbf24';
            unit.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] || '#';
            unit.style.filter = 'none';
          } else if (animProperty === 'blur') {
            unit.style.transform = 'none';
            unit.style.filter = `blur(${(amp / 6).toFixed(1)}px)`;
            unit.style.opacity = '0.4';
          }
        } else {
          // Active physics state settling to rest position (bounce -> 0)
          if (animProperty === 'position') {
            const yOffset = bounce * amp;
            unit.style.transform = `translate3d(0, ${-yOffset.toFixed(2)}px, 0)`;
            unit.style.opacity = '1';
            unit.style.filter = 'none';
            unit.style.color = '#ffffff';
            unit.style.webkitTextStroke = 'none';
            unit.style.letterSpacing = 'normal';
          } else if (animProperty === 'scale') {
            const scaleVal = 1 + (bounce * (amp / 80));
            unit.style.transform = `scale(${Math.max(0.1, scaleVal).toFixed(3)})`;
            unit.style.opacity = '1';
            unit.style.filter = 'none';
            unit.style.color = '#ffffff';
            unit.style.webkitTextStroke = 'none';
            unit.style.letterSpacing = 'normal';
          } else if (animProperty === 'skew') {
            const skewVal = -bounce * amp;
            unit.style.transform = `skewX(${skewVal.toFixed(2)}deg)`;
            unit.style.opacity = '1';
            unit.style.filter = 'none';
            unit.style.color = '#ffffff';
            unit.style.webkitTextStroke = 'none';
            unit.style.letterSpacing = 'normal';
          } else if (animProperty === 'rotation') {
            const rotVal = bounce * amp;
            unit.style.transform = `rotate(${rotVal.toFixed(2)}deg)`;
            unit.style.opacity = '1';
            unit.style.filter = 'none';
            unit.style.color = '#ffffff';
            unit.style.webkitTextStroke = 'none';
            unit.style.letterSpacing = 'normal';
          } else if (animProperty === 'opacity') {
            const opVal = Math.min(1, Math.max(0, 1 - Math.max(0, -bounce)));
            unit.style.transform = 'none';
            unit.style.opacity = opVal.toFixed(3);
            unit.style.filter = 'none';
            unit.style.color = '#ffffff';
            unit.style.webkitTextStroke = 'none';
            unit.style.letterSpacing = 'normal';
          } else if (animProperty === 'fillColor') {
            unit.style.transform = 'none';
            unit.style.opacity = '1';
            unit.style.filter = 'none';
            unit.style.webkitTextStroke = 'none';
            unit.style.letterSpacing = 'normal';
            // Pulsing amber tint shift settling to crisp white
            if (Math.abs(bounce) > 0.05) {
              unit.style.color = '#f97316';
            } else {
              unit.style.color = '#ffffff';
            }
          } else if (animProperty === 'strokeColor') {
            unit.style.transform = 'none';
            unit.style.opacity = '1';
            unit.style.filter = 'none';
            unit.style.letterSpacing = 'normal';
            if (Math.abs(bounce) > 0.05) {
              unit.style.webkitTextStroke = '1px #f59e0b';
              unit.style.color = '#181008';
            } else {
              unit.style.webkitTextStroke = 'none';
              unit.style.color = '#ffffff';
            }
          } else if (animProperty === 'strokeWidth') {
            unit.style.transform = 'none';
            unit.style.opacity = '1';
            unit.style.filter = 'none';
            unit.style.letterSpacing = 'normal';
            const sw = Math.max(0, Math.abs(bounce) * (amp / 15));
            if (sw > 0.5) {
              unit.style.webkitTextStroke = `${sw.toFixed(1)}px #ea580c`;
            } else {
              unit.style.webkitTextStroke = 'none';
            }
            unit.style.color = '#ffffff';
          } else if (animProperty === 'tracking') {
            unit.style.transform = 'none';
            unit.style.opacity = '1';
            unit.style.filter = 'none';
            unit.style.color = '#ffffff';
            unit.style.webkitTextStroke = 'none';
            const letterSpace = bounce * (amp / 10);
            unit.style.letterSpacing = `${letterSpace.toFixed(1)}px`;
          } else if (animProperty === 'lineSpacing') {
            unit.style.opacity = '1';
            unit.style.filter = 'none';
            unit.style.color = '#ffffff';
            unit.style.webkitTextStroke = 'none';
            unit.style.letterSpacing = 'normal';
            const lineOffset = -bounce * (amp * 0.4);
            unit.style.transform = `translate3d(0, ${lineOffset.toFixed(2)}px, 0)`;
          } else if (animProperty === 'characterOffset') {
            unit.style.transform = 'none';
            unit.style.filter = 'none';
            unit.style.webkitTextStroke = 'none';
            unit.style.letterSpacing = 'normal';
            // Matrix scramble resolution
            if (Math.abs(bounce) > 0.08) {
              unit.style.color = '#fbbf24';
              unit.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] || '#';
            } else {
              unit.style.color = '#ffffff';
              unit.textContent = originalChar;
            }
          } else if (animProperty === 'blur') {
            unit.style.transform = 'none';
            unit.style.opacity = '1';
            unit.style.color = '#ffffff';
            unit.style.webkitTextStroke = 'none';
            unit.style.letterSpacing = 'normal';
            const blurVal = Math.max(0, Math.abs(bounce) * (amp / 8));
            unit.style.filter = `blur(${blurVal.toFixed(1)}px)`;
          }
        }
      });
    }

    requestAnimationFrame(animate);
  };

  // Update parameters and labels from UI controls
  const updateParameters = () => {
    if (sliderFreq) freq = parseFloat(sliderFreq.value) || 3.0;
    if (sliderDecay) decay = parseFloat(sliderDecay.value) || 4.5;
    if (sliderDelay) delay = parseFloat(sliderDelay.value) || 0.08;
    if (sliderAmp) amp = parseFloat(sliderAmp.value) || 60;
    if (checkNull) includeNull = checkNull.checked;
    if (textInput) textContent = textInput.value || 'Scriptify Kinetic Motion';
    if (propSelect) animProperty = propSelect.value;

    if (valFreq) valFreq.textContent = `${freq.toFixed(1)} Hz`;
    if (valDecay) valDecay.textContent = `${decay.toFixed(1)}`;
    if (valDelay) valDelay.textContent = `${delay.toFixed(2)} s`;
    
    if (valAmp) {
      let unit = 'px';
      if (animProperty === 'rotation' || animProperty === 'skew') unit = '°';
      else if (animProperty === 'scale' || animProperty === 'opacity') unit = '%';
      else if (animProperty === 'tracking') unit = 'pts';
      else if (animProperty === 'characterOffset') unit = 'chars';
      else if (animProperty === 'fillColor' || animProperty === 'strokeColor') unit = 'tint';
      valAmp.textContent = `${amp} ${unit}`;
    }

    if (modeBadge) {
      const label = separation.charAt(0).toUpperCase() + separation.slice(1);
      const propLabel = animProperty.charAt(0).toUpperCase() + animProperty.slice(1);
      modeBadge.textContent = `${label} &bull; ${propLabel}`;
    }

    if (statusSubtext) {
      const sepLabel = separation.charAt(0).toUpperCase() + separation.slice(1);
      if (expressionMode === 'custom') {
        statusSubtext.innerHTML = `Custom Expression Active &bull; Live Parameter Tuner: <code class="font-mono text-amber-400 bg-[#160e05] px-2 py-0.5 rounded border border-amber-500/30">freq=${freq.toFixed(1)}, decay=${decay.toFixed(1)}, delay=${delay.toFixed(2)}</code>`;
      } else {
        statusSubtext.innerHTML = `Simulating <code class="font-mono text-amber-400 bg-[#160e05] px-2 py-0.5 rounded border border-amber-500/30">sin(t*${freq.toFixed(1)})/exp(t*${decay.toFixed(1)})</code> cascading by <strong>${sepLabel}</strong>`;
      }
    }

    renderExpressionCode();
  };

  // Switch Separation Mode (Characters, Words, Lines)
  const setSeparation = (mode) => {
    separation = mode;

    sepButtons.forEach(btn => {
      const btnMode = btn.dataset.sep;
      if (btnMode === mode) {
        btn.className = 'ta-sep-btn py-2 text-xs font-bold rounded-xl transition-all bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm flex items-center justify-center space-x-1';
      } else {
        btn.className = 'ta-sep-btn py-2 text-xs font-semibold rounded-xl text-zinc-400 hover:text-white transition-all flex items-center justify-center space-x-1';
      }
    });

    updateParameters();
    rebuildPreviewUnits();
  };

  // Compile and generate production-ready ExtendScript payload
  const getScriptPayload = () => {
    const customSnippet = (expressionMode === 'custom' && customExprInput) 
      ? customExprInput.value.trim() 
      : '';

    return {
      scriptType: 'text_animator',
      scriptName: `${textContent.replace(/[^a-zA-Z0-9_-]/g, '_')}_Rig`,
      undoName: 'Scriptify: Text Animation',
      options: {
        frequency: freq,
        decay: decay,
        delay: delay,
        amplitude: amp,
        separation: separation,
        animProperty: animProperty,
        expressionMode: expressionMode,
        customExpression: customSnippet,
        includeNull: includeNull,
        textContent: textContent
      }
    };
  };

  // Download .jsx script file
  const downloadScript = async () => {
    if (!API.isAuthenticated()) {
      alert('Please sign in to generate and download your custom After Effects script.');
      window.location.href = '/login';
      return;
    }

    try {
      if (btnDownloadJsx) {
        btnDownloadJsx.disabled = true;
        btnDownloadJsx.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Generating & Deducting 1 Credit...`;
      }

      const payload = getScriptPayload();
      const res = await API.post('/api/scripts/generate', payload);

      // Trigger .jsx file download
      const blob = new Blob([res.scriptCode], { type: 'text/javascript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = res.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update navbar wallet balance
      Navbar.syncSession();

      if (btnDownloadJsx) {
        btnDownloadJsx.innerHTML = `<i class="fa-solid fa-check text-emerald-400 mr-2"></i> Downloaded! (-1 Credit)`;
        setTimeout(() => {
          btnDownloadJsx.disabled = false;
          btnDownloadJsx.innerHTML = `<i class="fa-solid fa-download mr-2"></i> Download .jsx Script`;
        }, 2200);
      }
    } catch (err) {
      if (btnDownloadJsx) {
        btnDownloadJsx.disabled = false;
        btnDownloadJsx.innerHTML = `<i class="fa-solid fa-download mr-2"></i> Download .jsx Script`;
      }

      if (err.status === 402) {
        if (confirm('Insufficient credits to generate this tool. Would you like to top up your wallet?')) {
          window.location.href = '/wallet';
        }
        return;
      }
      alert('Generation error: ' + (err.message || 'Unknown error'));
    }
  };

  // Copy raw expression to clipboard
  const copyRawExpression = (buttonEl) => {
    const expr = getRawExpression();
    navigator.clipboard.writeText(expr).then(() => {
      if (buttonEl) {
        const origHtml = buttonEl.innerHTML;
        buttonEl.innerHTML = `<i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Copied!`;
        setTimeout(() => {
          buttonEl.innerHTML = origHtml;
        }, 2000);
      }
    });
  };

  // Copy full .jsx script to clipboard
  const copyScriptCode = async () => {
    const separationLabel = separation.charAt(0).toUpperCase() + separation.slice(1);
    const basedOnValue = separation === 'lines' ? 4 : separation === 'words' ? 3 : 1;
    const safeText = textContent.replace(/"/g, '\\"');
    const rawExpr = getRawExpression();

    let fullScript = `// Scriptify - Adobe After Effects Text Animator
// Separation Mode: ${separationLabel} | Expression Selector Amount Formula
(function() {
    if (!app.project) {
        alert("Please open an After Effects project.", "Scriptify");
        return;
    }
    app.beginUndoGroup("Scriptify: Text Animation");
    try {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select or open an active composition.", "Scriptify");
            return;
        }

        // 1. Create Text Layer
        var textLayer = comp.layers.addText("${safeText}");
        textLayer.name = "${safeText}";
        textLayer.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width / 2, comp.height / 2]);

        // 2. Add Text Animator
        var textProp = textLayer.property("ADBE Text Properties");
        var animators = textProp.property("ADBE Text Animators");
        var animator = animators.addProperty("ADBE Text Animator");
        animator.name = "Scriptify ${animProperty.toUpperCase()} (${separationLabel})";

        // 3. Add Target Property
        var animProps = animator.property("ADBE Text Animator Properties");
`;

    if (animProperty === 'scale') {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Scale 3D");\n        targetProp.setValue([${amp}, ${amp}, ${amp}]);\n`;
    } else if (animProperty === 'skew') {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Skew");\n        targetProp.setValue(${amp});\n`;
    } else if (animProperty === 'rotation') {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Rotation Z");\n        targetProp.setValue(${amp});\n`;
    } else if (animProperty === 'opacity') {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Opacity");\n        targetProp.setValue(${amp < 100 ? amp : 0});\n`;
    } else if (animProperty === 'fillColor') {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Fill Color");\n        targetProp.setValue([0.98, 0.45, 0.08]);\n`;
    } else if (animProperty === 'strokeColor') {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Stroke Color");\n        targetProp.setValue([1.0, 0.65, 0.15]);\n`;
    } else if (animProperty === 'strokeWidth') {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Stroke Width");\n        targetProp.setValue(${amp > 0 ? (amp > 20 ? Math.round(amp/10) : amp) : 4});\n`;
    } else if (animProperty === 'tracking') {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Track Amount");\n        targetProp.setValue(${amp || 50});\n`;
    } else if (animProperty === 'lineSpacing') {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Line Spacing");\n        targetProp.setValue([0, ${amp || 35}]);\n`;
    } else if (animProperty === 'characterOffset') {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Character Offset");\n        targetProp.setValue(${amp > 0 ? (amp > 25 ? Math.round(amp/5) : amp) : 5});\n`;
    } else if (animProperty === 'blur') {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Blur");\n        targetProp.setValue([${amp || 25}, ${amp || 25}]);\n`;
    } else {
      fullScript += `        var targetProp = animProps.addProperty("ADBE Text Position 3D");\n        targetProp.setValue([0, -${amp}, 0]);\n`;
    }

    fullScript += `
        // 4. Add Expression Selector for ${separationLabel}
        var selectors = animator.property("ADBE Text Selectors");
        var exprSelector = selectors.addProperty("ADBE Text Expr Selector");
        var advanced = exprSelector.property("ADBE Text Range Advanced");
        advanced.property("ADBE Text Range Based On").setValue(${basedOnValue}); // ${basedOnValue} = ${separationLabel}
`;

    if (includeNull) {
      fullScript += `
        // 5. Build Master Controller Null Object
        var nullCtrl = comp.layers.addNull(comp.duration);
        nullCtrl.name = "Text_Animation_Controller";
        nullCtrl.guideLayer = true;
        nullCtrl.label = 11;
        nullCtrl.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width / 2, comp.height / 2]);

        var fxFreq = nullCtrl.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        fxFreq.name = "Frequency (Hz)";
        fxFreq.property("ADBE Slider Control-0001").setValue(${freq});

        var fxDecay = nullCtrl.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        fxDecay.name = "Decay (Damping)";
        fxDecay.property("ADBE Slider Control-0001").setValue(${decay});

        var fxDelay = nullCtrl.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        fxDelay.name = "Stagger Delay (Sec)";
        fxDelay.property("ADBE Slider Control-0001").setValue(${delay});

        var fxAmp = nullCtrl.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        fxAmp.name = "Bounce Amplitude";
        fxAmp.property("ADBE Slider Control-0001").setValue(${amp});

        // 6. Attach Expression linking to Null Controller
        var amountProp = exprSelector.property("ADBE Text Expression Amount");
        amountProp.expression = ${JSON.stringify(rawExpr)};
`;
    } else {
      fullScript += `
        // 5. Attach Direct Expression (Self-Contained)
        var amountProp = exprSelector.property("ADBE Text Expression Amount");
        amountProp.expression = ${JSON.stringify(rawExpr)};
`;
    }

    fullScript += `
    } catch(err) {
        alert("Execution Error: " + err.toString(), "Scriptify");
    } finally {
        app.endUndoGroup();
    }
})();`;

    navigator.clipboard.writeText(fullScript).then(() => {
      if (btnCopyJsx) {
        const orig = btnCopyJsx.innerHTML;
        btnCopyJsx.innerHTML = `<i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Copied .jsx!`;
        setTimeout(() => { btnCopyJsx.innerHTML = orig; }, 2000);
      }
    });
  };

  let initialized = false;
  const init = () => {
    if (initialized) return;
    initialized = true;

    // Input Event Listeners
    if (sliderFreq) sliderFreq.addEventListener('input', updateParameters);
    if (sliderDecay) sliderDecay.addEventListener('input', updateParameters);
    if (sliderDelay) sliderDelay.addEventListener('input', updateParameters);
    if (sliderAmp) sliderAmp.addEventListener('input', updateParameters);
    if (checkNull) checkNull.addEventListener('change', updateParameters);
    if (propSelect) propSelect.addEventListener('change', () => {
      updateParameters();
      rebuildPreviewUnits();
    });
    
    if (textInput) {
      textInput.addEventListener('input', () => {
        updateParameters();
        rebuildPreviewUnits();
      });
    }

    // Separation Mode Toggle Buttons
    sepButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.sep;
        if (mode) setSeparation(mode);
      });
    });

    // Expression Engine Mode Buttons (Preset vs Custom)
    if (modePresetBtn) {
      modePresetBtn.addEventListener('click', () => setExpressionMode('preset'));
    }
    if (modeCustomBtn) {
      modeCustomBtn.addEventListener('click', () => setExpressionMode('custom'));
    }

    // Custom Expression Textarea & Quick Templates
    if (customExprInput) {
      customExprInput.addEventListener('input', () => {
        updateParameters();
      });
    }

    templateButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tplKey = btn.dataset.template;
        if (TEMPLATES[tplKey] && customExprInput) {
          customExprInput.value = TEMPLATES[tplKey];
          updateParameters();
        }
      });
    });

    // Action Buttons
    if (btnDownloadJsx) btnDownloadJsx.addEventListener('click', downloadScript);
    if (btnCopyJsx) btnCopyJsx.addEventListener('click', copyScriptCode);
    if (btnCopyExpr) btnCopyExpr.addEventListener('click', () => copyRawExpression(btnCopyExpr));
    if (btnCopyExprBox) btnCopyExprBox.addEventListener('click', () => copyRawExpression(btnCopyExprBox));

    // Initialize state, expression code & preview DOM
    updateParameters();
    rebuildPreviewUnits();
    requestAnimationFrame(animate);
  };

  return {
    init,
    updateParameters,
    setSeparation,
    setExpressionMode,
    getRawExpression
  };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  TextAnimator.init();
});
