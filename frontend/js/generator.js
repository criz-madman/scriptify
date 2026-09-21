/**
 * Scriptify Generator & Code Studio
 * Powers the interactive AE ExtendScript generator, live syntax highlighter, and .jsx exporter
 */

const Generator = (() => {
  let activeTab = 'preset'; // 'preset' | 'scriptui' | 'custom'
  let currentPresetId = 'layer_stagger';
  let presetsData = [];
  let scriptUiElements = [
    { type: 'header', label: 'Motion Control Kit' },
    { type: 'button', label: 'Center Anchor & Snap', undoName: 'Center Anchor', actionCode: 'var comp = app.project.activeItem;\nif (comp && comp.selectedLayers.length > 0) {\n    app.executeCommand(app.findMenuCommandId("Center Anchor Point in Layer Content"));\n}' },
    { type: 'slider', label: 'Bounce Frequency', min: 1, max: 20, value: 4 },
    { type: 'dropdown', label: 'Interpolation', items: ['Linear', 'Easy Ease', 'Hold Keyframe'] },
    { type: 'checkbox', label: 'Auto-Enable Motion Blur', checked: true }
  ];

  let currentScriptCode = '';
  let currentFileName = 'Scriptify_Tool.jsx';

  // DOM Elements
  const codeOutput = document.getElementById('code-output');
  const codeFileName = document.getElementById('code-filename');
  const codeLineCount = document.getElementById('code-line-count');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnDownloadCode = document.getElementById('btn-download-code');
  const btnGenerate = document.getElementById('btn-generate');
  const tabPreset = document.getElementById('tab-preset');
  const tabScriptUi = document.getElementById('tab-scriptui');
  const tabCustom = document.getElementById('tab-custom');
  const panelPreset = document.getElementById('panel-preset');
  const panelScriptUi = document.getElementById('panel-scriptui');
  const panelCustom = document.getElementById('panel-custom');
  const presetSelector = document.getElementById('preset-selector');
  const presetOptionsContainer = document.getElementById('preset-options-container');
  const scriptNameInput = document.getElementById('script-name-input');
  const undoNameInput = document.getElementById('undo-name-input');
  const scriptuiElementsList = document.getElementById('scriptui-elements-list');
  const btnAddUiElement = document.getElementById('btn-add-ui-element');
  const modalHistory = document.getElementById('history-modal');
  const btnOpenHistory = document.getElementById('btn-open-history');
  const btnCloseHistory = document.getElementById('btn-close-history');
  const historyListContainer = document.getElementById('history-list-container');

  // Load available presets from backend
  const loadPresets = async () => {
    try {
      const data = await API.get('/api/scripts/presets');
      presetsData = data.presets || [];
      renderPresetSelector();
      renderPresetOptions();
    } catch (err) {
      console.warn('Could not load presets from server:', err);
    }
  };

  const renderPresetSelector = () => {
    if (!presetSelector) return;
    presetSelector.innerHTML = presetsData.map(p => `
      <option value="${p.id}" ${p.id === currentPresetId ? 'selected' : ''}>
        ${p.title} (${p.category})
      </option>
    `).join('');
  };

  const renderPresetOptions = () => {
    if (!presetOptionsContainer) return;
    const preset = presetsData.find(p => p.id === currentPresetId);
    if (!preset) return;

    let html = `<p class="text-xs text-zinc-400 mb-4">${preset.description}</p>`;

    switch (preset.id) {
      case 'layer_stagger':
        html += `
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-zinc-300 block mb-1">Frame Step (Frames)</label>
              <input type="number" id="opt-frame-step" value="5" min="1" max="120" class="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono">
            </div>
            <div class="flex items-center space-x-2 pt-1">
              <input type="checkbox" id="opt-reverse" class="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0">
              <label for="opt-reverse" class="text-xs text-zinc-300">Reverse Layer Order (Bottom to Top)</label>
            </div>
            <div class="flex items-center space-x-2">
              <input type="checkbox" id="opt-stagger-in" checked class="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0">
              <label for="opt-stagger-in" class="text-xs text-zinc-300">Stagger In-Points Only</label>
            </div>
          </div>
        `;
        break;

      case 'auto_null_parent':
        html += `
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-zinc-300 block mb-1">Null Controller Name</label>
              <input type="text" id="opt-null-name" value="Master_Controller_Null" class="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono">
            </div>
            <div class="flex items-center space-x-2 pt-1">
              <input type="checkbox" id="opt-3d" checked class="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0">
              <label for="opt-3d" class="text-xs text-zinc-300">Enable 3D Layer Switch</label>
            </div>
            <div class="flex items-center space-x-2">
              <input type="checkbox" id="opt-sliders" checked class="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0">
              <label for="opt-sliders" class="text-xs text-zinc-300">Add Master Slider & Checkbox Controls</label>
            </div>
          </div>
        `;
        break;

      case 'kinetic_typography':
        html += `
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-zinc-300 block mb-1">Tracking Amount</label>
              <input type="number" id="opt-tracking" value="20" min="0" max="200" class="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono">
            </div>
            <div>
              <label class="text-xs font-semibold text-zinc-300 block mb-1">Y-Axis Drift (Pixels)</label>
              <input type="number" id="opt-ydrift" value="45" min="-500" max="500" class="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono">
            </div>
            <div>
              <label class="text-xs font-semibold text-zinc-300 block mb-1">Ease In Duration (Seconds)</label>
              <input type="number" id="opt-duration" value="0.75" step="0.05" min="0.1" max="5.0" class="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono">
            </div>
          </div>
        `;
        break;

      case 'batch_render_setup':
        html += `
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-zinc-300 block mb-1">Render Template</label>
              <input type="text" id="opt-render-tpl" value="Best Settings" class="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono">
            </div>
            <div>
              <label class="text-xs font-semibold text-zinc-300 block mb-1">Output Module Template</label>
              <input type="text" id="opt-output-tpl" value="Apple ProRes 422" class="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono">
            </div>
            <div>
              <label class="text-xs font-semibold text-zinc-300 block mb-1">Export Directory</label>
              <input type="text" id="opt-output-dir" value="~/Desktop/AE_Renders" class="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono">
            </div>
          </div>
        `;
        break;

      case 'expression_controller_rig':
        html += `
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-zinc-300 block mb-1">Target Property</label>
              <select id="opt-expr-prop" class="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500">
                <option value="Position">Position</option>
                <option value="Scale">Scale</option>
                <option value="Rotation">Rotation</option>
                <option value="Opacity">Opacity</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs font-semibold text-zinc-300 block mb-1">Frequency (Hz)</label>
                <input type="number" id="opt-freq" value="3" min="0.1" step="0.5" class="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono">
              </div>
              <div>
                <label class="text-xs font-semibold text-zinc-300 block mb-1">Amplitude (Px)</label>
                <input type="number" id="opt-amp" value="25" min="1" class="w-full bg-black/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono">
              </div>
            </div>
          </div>
        `;
        break;

      default:
        break;
    }

    presetOptionsContainer.innerHTML = html;
  };

  const collectPresetOptions = () => {
    const opts = {};
    switch (currentPresetId) {
      case 'layer_stagger':
        opts.frameStep = document.getElementById('opt-frame-step')?.value || 5;
        opts.reverseOrder = document.getElementById('opt-reverse')?.checked || false;
        opts.staggerInPoints = document.getElementById('opt-stagger-in')?.checked || false;
        break;
      case 'auto_null_parent':
        opts.nullName = document.getElementById('opt-null-name')?.value || 'Master_Controller_Null';
        opts.is3D = document.getElementById('opt-3d')?.checked || false;
        opts.addSliderControls = document.getElementById('opt-sliders')?.checked || false;
        break;
      case 'kinetic_typography':
        opts.trackingAmount = document.getElementById('opt-tracking')?.value || 20;
        opts.yDrift = document.getElementById('opt-ydrift')?.value || 45;
        opts.easeDuration = document.getElementById('opt-duration')?.value || 0.75;
        break;
      case 'batch_render_setup':
        opts.renderTemplate = document.getElementById('opt-render-tpl')?.value || 'Best Settings';
        opts.outputTemplate = document.getElementById('opt-output-tpl')?.value || 'Apple ProRes 422';
        opts.outputFolder = document.getElementById('opt-output-dir')?.value || '~/Desktop/AE_Renders';
        break;
      case 'expression_controller_rig':
        opts.targetProperty = document.getElementById('opt-expr-prop')?.value || 'Position';
        opts.frequency = document.getElementById('opt-freq')?.value || 3;
        opts.amplitude = document.getElementById('opt-amp')?.value || 25;
        break;
    }
    return opts;
  };

  const renderScriptUiElements = () => {
    if (!scriptuiElementsList) return;
    scriptuiElementsList.innerHTML = scriptUiElements.map((el, i) => `
      <div class="flex items-center justify-between p-2.5 bg-black/50 border border-zinc-800/80 rounded-lg text-xs">
        <div class="flex items-center space-x-2">
          <span class="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
            ${el.type}
          </span>
          <span class="font-medium text-zinc-200">${el.label}</span>
        </div>
        <button data-remove-idx="${i}" class="text-zinc-500 hover:text-rose-400 transition-colors">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>
    `).join('');

    // Attach delete listeners
    scriptuiElementsList.querySelectorAll('[data-remove-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-remove-idx'), 10);
        scriptUiElements.splice(idx, 1);
        renderScriptUiElements();
      });
    });
  };

  const addUiElement = () => {
    const type = document.getElementById('new-ui-type')?.value || 'button';
    const label = document.getElementById('new-ui-label')?.value.trim() || `My ${type}`;

    const newElem = { type, label };
    if (type === 'slider') {
      newElem.min = 0;
      newElem.max = 100;
      newElem.value = 50;
    } else if (type === 'button') {
      newElem.undoName = label;
      newElem.actionCode = 'alert("Executing ' + label + '", "Scriptify");';
    } else if (type === 'dropdown') {
      newElem.items = ['Item A', 'Item B', 'Item C'];
    }

    scriptUiElements.push(newElem);
    renderScriptUiElements();
    document.getElementById('new-ui-label').value = '';
  };

  // Main Script Generation Trigger
  const handleGenerateScript = async () => {
    if (!API.isAuthenticated()) {
      Auth.openModal();
      return;
    }

    const scriptName = scriptNameInput?.value.trim() || 'Scriptify_AE_Tool';
    const undoName = undoNameInput?.value.trim() || 'Scriptify Action';

    const payload = {
      scriptType: activeTab,
      scriptName,
      undoName
    };

    if (activeTab === 'preset') {
      payload.presetId = currentPresetId;
      payload.options = collectPresetOptions();
    } else if (activeTab === 'scriptui') {
      payload.uiConfig = {
        orientation: document.getElementById('ui-orientation')?.value || 'column',
        elements: scriptUiElements
      };
    } else if (activeTab === 'custom') {
      payload.customCode = document.getElementById('custom-code-input')?.value || '// Custom ExtendScript';
    }

    try {
      btnGenerate.disabled = true;
      btnGenerate.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Generating & Deducting Credit...`;

      const result = await API.post('/api/scripts/generate', payload);

      currentScriptCode = result.scriptCode;
      currentFileName = result.fileName;

      // Update UI Code Canvas
      displayCode(result.scriptCode, result.fileName, result.lineCount);

      // Update Wallet live counter
      Wallet.updateBalanceUI(result.remainingBalance);

      // Flash success on generate button
      btnGenerate.innerHTML = `<i class="fa-solid fa-check mr-2 text-emerald-400"></i> Generated! (Deducted 1 Credit)`;
      setTimeout(() => {
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = `<i class="fa-solid fa-bolt mr-2"></i> Generate ExtendScript (.jsx) <span class="ml-1 text-[11px] opacity-75 font-normal">(-1 Credit)</span>`;
      }, 2000);
    } catch (err) {
      btnGenerate.disabled = false;
      btnGenerate.innerHTML = `<i class="fa-solid fa-bolt mr-2"></i> Generate ExtendScript (.jsx)`;

      if (err.status === 402) {
        // Insufficient balance, handled by event
        return;
      }
      alert('Generation error: ' + (err.message || 'Unknown error'));
    }
  };

  // Format and display code in code canvas with syntax coloring
  const displayCode = (code, fileName, lineCount) => {
    currentScriptCode = code;
    currentFileName = fileName || 'Scriptify_Tool.jsx';

    if (codeFileName) codeFileName.textContent = currentFileName;
    if (codeLineCount) codeLineCount.textContent = `${lineCount || code.split('\n').length} lines`;

    if (!codeOutput) return;

    // Fast syntax styler for clean presentation
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const highlighted = escaped
      .replace(/(\/\/[^\n]*)/g, '<span class="code-comment">$1</span>')
      .replace(/\b(var|function|return|if|else|for|while|try|catch|finally|new|instanceof|throw)\b/g, '<span class="code-keyword">$1</span>')
      .replace(/\b(app|CompItem|Folder|File|Window|Panel|TextLayer|KeyframeEase|ScriptUI)\b/g, '<span class="code-function">$1</span>')
      .replace(/("[^"\\]*(?:\\.[^"\\]*)*")/g, '<span class="code-string">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

    codeOutput.innerHTML = highlighted;
  };

  // One-Click Copy Facility
  const copyCodeToClipboard = () => {
    if (!currentScriptCode) return;
    navigator.clipboard.writeText(currentScriptCode).then(() => {
      const originalText = btnCopyCode.innerHTML;
      btnCopyCode.innerHTML = `<i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> Copied!`;
      setTimeout(() => {
        btnCopyCode.innerHTML = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  // Download .jsx file
  const downloadScriptFile = () => {
    if (!currentScriptCode) return;
    const blob = new Blob([currentScriptCode], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generation History Log Drawer
  const openHistoryModal = async () => {
    if (!API.isAuthenticated()) {
      Auth.openModal();
      return;
    }
    if (modalHistory) {
      modalHistory.classList.remove('hidden');
      await loadHistory();
    }
  };

  const closeHistoryModal = () => {
    if (modalHistory) modalHistory.classList.add('hidden');
  };

  const loadHistory = async () => {
    if (!historyListContainer) return;
    historyListContainer.innerHTML = `<div class="py-8 text-center text-zinc-500 text-xs">Loading generation history...</div>`;

    try {
      const data = await API.get('/api/scripts/history');
      if (!data.history || data.history.length === 0) {
        historyListContainer.innerHTML = `<div class="py-8 text-center text-zinc-500 text-xs">No scripts generated yet.</div>`;
        return;
      }

      historyListContainer.innerHTML = data.history.map(item => {
        const details = item.actionDetails || {};
        const dateStr = new Date(item.timestamp).toLocaleString();
        return `
          <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between hover:border-zinc-700 transition-colors">
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-xs text-zinc-200">${details.scriptName || 'AE Script'}</span>
                <span class="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                  ${details.scriptType || 'preset'}
                </span>
              </div>
              <div class="text-[11px] text-zinc-500 mt-1">
                Deducted: ${details.creditsDeducted || 1} credit &bull; ${dateStr}
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-zinc-400 font-mono">Bal: ${details.remainingBalance ?? '-'}</span>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      historyListContainer.innerHTML = `<div class="py-8 text-center text-rose-400 text-xs">Error loading history: ${err.message}</div>`;
    }
  };

  const switchTab = (tab) => {
    activeTab = tab;
    [tabPreset, tabScriptUi, tabCustom].forEach(t => t?.classList.remove('border-amber-500', 'text-amber-400', 'bg-amber-500/10'));
    [panelPreset, panelScriptUi, panelCustom].forEach(p => p?.classList.add('hidden'));

    if (tab === 'preset') {
      tabPreset?.classList.add('border-amber-500', 'text-amber-400', 'bg-amber-500/10');
      panelPreset?.classList.remove('hidden');
    } else if (tab === 'scriptui') {
      tabScriptUi?.classList.add('border-amber-500', 'text-amber-400', 'bg-amber-500/10');
      panelScriptUi?.classList.remove('hidden');
    } else if (tab === 'custom') {
      tabCustom?.classList.add('border-amber-500', 'text-amber-400', 'bg-amber-500/10');
      panelCustom?.classList.remove('hidden');
    }
  };

  const init = () => {
    // Tab switching
    if (tabPreset) tabPreset.addEventListener('click', () => switchTab('preset'));
    if (tabScriptUi) tabScriptUi.addEventListener('click', () => switchTab('scriptui'));
    if (tabCustom) tabCustom.addEventListener('click', () => switchTab('custom'));

    // Preset selection change
    if (presetSelector) {
      presetSelector.addEventListener('change', (e) => {
        currentPresetId = e.target.value;
        renderPresetOptions();
      });
    }

    // UI builder
    if (btnAddUiElement) btnAddUiElement.addEventListener('click', addUiElement);

    // Code action buttons
    if (btnGenerate) btnGenerate.addEventListener('click', handleGenerateScript);
    if (btnCopyCode) btnCopyCode.addEventListener('click', copyCodeToClipboard);
    if (btnDownloadCode) btnDownloadCode.addEventListener('click', downloadScriptFile);

    // History Modal
    if (btnOpenHistory) btnOpenHistory.addEventListener('click', openHistoryModal);
    if (btnCloseHistory) btnCloseHistory.addEventListener('click', closeHistoryModal);

    // Initial load
    loadPresets();
    renderScriptUiElements();

    // Set initial preview code
    const initialCode = `// Scriptify Ready! Click "Generate ExtendScript (.jsx)" to build your custom tool.
(function() {
    app.beginUndoGroup("Scriptify Sample");
    alert("Scriptify After Effects Engine Initialized!", "Scriptify");
    app.endUndoGroup();
})();`;
    displayCode(initialCode, 'Scriptify_Preview.jsx', 6);
  };

  return {
    init,
    displayCode
  };
})();
