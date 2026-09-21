/**
 * Scriptify - AE ScriptUI Panel Builder Module
 * Manages 3 Sections:
 * 1. Action Library (Pick your actions)
 * 2. Customizer / Reorder List (Drag-and-drop & Arrow sorting)
 * 3. Live AE Panel Preview & .jsx Exporter (Compact / Regular / Wide)
 */

const PanelBuilder = (() => {
  // Initial default selection showcasing cross-category actions
  let selectedIds = ['act_null', 'act_anchor_center', 'act_center_comp', 'act_easy_ease', 'act_sequence'];
  let panelName = 'Quick_Actions_Panel';
  let buttonSize = 'regular'; // 'compact' | 'regular' | 'wide'
  let dragSrcIndex = null;

  // DOM Elements
  const libraryContainer = document.getElementById('pb-library-container');
  const reorderList = document.getElementById('pb-reorder-list');
  const selectedCountDisplay = document.getElementById('pb-selected-count');
  const panelNameInput = document.getElementById('pb-panel-name');
  const previewWindowTitle = document.getElementById('pb-preview-window-title');
  const previewContainer = document.getElementById('pb-preview-container');
  const previewActionToast = document.getElementById('pb-preview-toast');
  const btnDownloadJsx = document.getElementById('pb-btn-download');
  const btnCopyJsx = document.getElementById('pb-btn-copy');
  const btnViewCode = document.getElementById('pb-btn-view-code');
  const btnClearAll = document.getElementById('pb-btn-clear-all');
  const sizeBtns = {
    compact: document.getElementById('pb-size-compact'),
    regular: document.getElementById('pb-size-regular'),
    wide: document.getElementById('pb-size-wide')
  };

  // Helper: Find action object by ID
  const getActionById = (id) => PANEL_ACTIONS.find(a => a.id === id);

  // ============================================================================
  // SECTION 01: Pick Your Actions (Library)
  // ============================================================================
  const renderLibrary = (filterQuery = '') => {
    if (!libraryContainer) return;

    let html = '';
    const q = filterQuery.toLowerCase().trim();

    PANEL_CATEGORIES.forEach(cat => {
      const itemsInCat = PANEL_ACTIONS.filter(a => a.category === cat.id && (!q || a.label.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)));
      if (itemsInCat.length === 0) return;

      html += `
        <div class="mb-5 last:mb-0">
          <div class="flex items-center justify-between mb-2.5 pb-1 border-b border-zinc-800/80">
            <div class="flex items-center space-x-2">
              <i class="fa-solid ${cat.icon} text-xs text-${cat.color}-400"></i>
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-300">${cat.name}</span>
            </div>
            <span class="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              ${itemsInCat.length} actions
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            ${itemsInCat.map(action => {
              const isSelected = selectedIds.includes(action.id);
              return `
                <div 
                  data-action-id="${action.id}"
                  title="${action.desc}"
                  class="group cursor-pointer select-none p-2.5 rounded-xl border transition-all flex items-center justify-between text-left
                    ${isSelected 
                      ? 'bg-[#261506]/90 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.25)] text-white' 
                      : 'bg-[#120d07]/70 border-amber-500/15 hover:border-amber-500/40 hover:bg-[#1a1107] text-zinc-300 hover:text-white'}"
                >
                  <div class="flex items-center space-x-2.5 min-w-0 pr-1">
                    <div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0
                      ${isSelected ? 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-sm' : 'bg-zinc-850 text-zinc-400 group-hover:text-amber-300'}">
                      <i class="fa-solid ${action.icon}"></i>
                    </div>
                    <span class="text-xs font-medium truncate">${action.label}</span>
                  </div>
                  
                  <!-- Checkbox indicator -->
                  <div class="w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors
                    ${isSelected 
                      ? 'bg-orange-500 border-orange-400 text-white text-[9px]' 
                      : 'border-zinc-700 group-hover:border-amber-500/60 bg-zinc-950/40 text-transparent'}">
                    <i class="fa-solid fa-check"></i>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    libraryContainer.innerHTML = html;

    // Attach click event to toggle selection
    libraryContainer.querySelectorAll('[data-action-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-action-id');
        toggleAction(id);
      });
    });
  };

  const toggleAction = (id) => {
    const idx = selectedIds.indexOf(id);
    if (idx >= 0) {
      selectedIds.splice(idx, 1);
    } else {
      selectedIds.push(id);
    }
    updateAll();
  };

  // ============================================================================
  // SECTION 02: Set the Order (Customizer / Reorder List)
  // ============================================================================
  const renderReorderList = () => {
    if (!reorderList) return;

    if (selectedCountDisplay) {
      selectedCountDisplay.textContent = `${selectedIds.length} ${selectedIds.length === 1 ? 'action' : 'actions'} selected`;
    }

    if (selectedIds.length === 0) {
      reorderList.innerHTML = `
        <div class="py-12 px-4 text-center border-2 border-dashed border-zinc-800 rounded-xl">
          <div class="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500 mb-2.5">
            <i class="fa-solid fa-arrow-left"></i>
          </div>
          <p class="text-xs font-semibold text-zinc-400">No actions added yet</p>
          <p class="text-[11px] text-zinc-600 mt-1 max-w-xs mx-auto">Click any tool in Section 01 on the left to add it to your custom After Effects panel.</p>
        </div>
      `;
      return;
    }

    reorderList.innerHTML = selectedIds.map((id, index) => {
      const action = getActionById(id);
      if (!action) return '';

      const isFirst = index === 0;
      const isLast = index === selectedIds.length - 1;

      return `
        <div 
          class="pb-reorder-row group p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center justify-between space-x-2 transition-all select-none"
          draggable="true"
          data-index="${index}"
          data-id="${id}"
        >
          <!-- Drag Handle + Order Index -->
          <div class="flex items-center space-x-2 min-w-0">
            <span class="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 py-1 px-0.5">
              <i class="fa-solid fa-grip-vertical text-xs"></i>
            </span>
            <span class="text-[10px] font-mono text-zinc-500 w-4 text-center">${index + 1}</span>
            <div class="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs shrink-0">
              <i class="fa-solid ${action.icon}"></i>
            </div>
            <span class="text-xs font-semibold text-zinc-200 truncate">${action.label}</span>
          </div>

          <!-- Controls: Up, Down, Delete -->
          <div class="flex items-center space-x-1 shrink-0">
            <button 
              data-move-up="${index}" 
              title="Move Up"
              ${isFirst ? 'disabled class="opacity-25 cursor-not-allowed text-zinc-600 p-1.5"' : 'class="text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded p-1.5 transition-colors"'}
            >
              <i class="fa-solid fa-arrow-up text-xs"></i>
            </button>
            <button 
              data-move-down="${index}" 
              title="Move Down"
              ${isLast ? 'disabled class="opacity-25 cursor-not-allowed text-zinc-600 p-1.5"' : 'class="text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded p-1.5 transition-colors"'}
            >
              <i class="fa-solid fa-arrow-down text-xs"></i>
            </button>
            <button 
              data-remove="${id}" 
              title="Remove action"
              class="text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded p-1.5 transition-colors ml-1"
            >
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Event Listeners for Reordering Buttons
    reorderList.querySelectorAll('[data-move-up]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-move-up'), 10);
        moveItem(idx, idx - 1);
      });
    });

    reorderList.querySelectorAll('[data-move-down]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-move-down'), 10);
        moveItem(idx, idx + 1);
      });
    });

    reorderList.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-remove');
        toggleAction(id);
      });
    });

    // Attach HTML5 Drag-and-Drop Handlers
    attachDragAndDrop();
  };

  const moveItem = (fromIndex, toIndex) => {
    if (fromIndex < 0 || fromIndex >= selectedIds.length || toIndex < 0 || toIndex >= selectedIds.length) return;
    const item = selectedIds.splice(fromIndex, 1)[0];
    selectedIds.splice(toIndex, 0, item);
    updateAll();
  };

  const attachDragAndDrop = () => {
    const rows = reorderList.querySelectorAll('.pb-reorder-row');
    rows.forEach(row => {
      row.addEventListener('dragstart', (e) => {
        dragSrcIndex = parseInt(row.getAttribute('data-index'), 10);
        e.dataTransfer.effectAllowed = 'move';
        row.classList.add('opacity-40', 'border-amber-500');
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        row.classList.add('bg-zinc-800', 'border-amber-400');
      });

      row.addEventListener('dragleave', () => {
        row.classList.remove('bg-zinc-800', 'border-amber-400');
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('bg-zinc-800', 'border-amber-400');
        const targetIndex = parseInt(row.getAttribute('data-index'), 10);
        if (dragSrcIndex !== null && dragSrcIndex !== targetIndex) {
          moveItem(dragSrcIndex, targetIndex);
        }
      });

      row.addEventListener('dragend', () => {
        rows.forEach(r => r.classList.remove('opacity-40', 'border-amber-500', 'bg-zinc-800', 'border-amber-400'));
        dragSrcIndex = null;
      });
    });
  };

  // ============================================================================
  // SECTION 03: Name It and Download (Live Preview & Export)
  // ============================================================================
  const renderPreview = () => {
    if (previewWindowTitle) {
      previewWindowTitle.textContent = panelName || 'Quick_Actions_Panel';
    }

    if (!previewContainer) return;

    if (selectedIds.length === 0) {
      previewContainer.innerHTML = `
        <div class="h-48 flex flex-col items-center justify-center text-zinc-600 text-xs">
          <i class="fa-solid fa-layer-group text-2xl mb-2 opacity-40"></i>
          <span>Empty Panel Preview</span>
        </div>
      `;
      return;
    }

    // Determine grid layout based on buttonSize
    let gridClass = 'grid gap-2';
    let btnClass = 'flex items-center justify-center font-medium rounded transition-all active:scale-95 shadow-sm border ';

    if (buttonSize === 'compact') {
      gridClass += ' grid-cols-4 sm:grid-cols-5';
      btnClass += ' py-2.5 px-2 aspect-square bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700 text-amber-400 text-sm hover:border-amber-500/50';
    } else if (buttonSize === 'regular') {
      gridClass += ' grid-cols-2 sm:grid-cols-2';
      btnClass += ' py-2.5 px-3 space-x-2 text-xs bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700 text-zinc-100 font-semibold';
    } else if (buttonSize === 'wide') {
      gridClass += ' grid-cols-1';
      btnClass += ' py-3 px-4 space-x-2 text-xs bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700 text-zinc-100 font-bold';
    }

    previewContainer.innerHTML = `
      <div class="${gridClass}">
        ${selectedIds.map(id => {
          const action = getActionById(id);
          if (!action) return '';
          return `
            <button 
              type="button"
              data-preview-action="${action.label}"
              title="${action.label} — ${action.desc}"
              class="${btnClass}"
            >
              <i class="fa-solid ${action.icon} text-amber-400 ${buttonSize === 'compact' ? 'text-base' : 'text-xs'}"></i>
              ${buttonSize === 'compact' ? '' : `<span class="truncate">${action.label}</span>`}
            </button>
          `;
        }).join('')}
      </div>
    `;

    // Add interactive click demonstration on preview buttons
    previewContainer.querySelectorAll('[data-preview-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-preview-action');
        showToast(`[AE Action Simulated]: ${name}`);
      });
    });
  };

  const showToast = (msg) => {
    if (!previewActionToast) return;
    previewActionToast.textContent = msg;
    previewActionToast.className = 'absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 border border-orange-400 text-white text-[11px] font-mono shadow-[0_0_25px_rgba(249,115,22,0.45)] transition-opacity duration-200 z-20';
    previewActionToast.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      previewActionToast.classList.add('opacity-0', 'pointer-events-none');
    }, 2000);
  };

  const setButtonSize = (size) => {
    buttonSize = size;
    Object.keys(sizeBtns).forEach(key => {
      const b = sizeBtns[key];
      if (!b) return;
      if (key === size) {
        b.className = 'py-1.5 px-3 text-xs font-bold rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-500/30 border border-orange-400 transition-all';
      } else {
        b.className = 'py-1.5 px-3 text-xs font-semibold rounded-full bg-[#140e06] hover:bg-[#1f140a] text-zinc-400 hover:text-zinc-200 border border-amber-500/20 transition-all';
      }
    });
    renderPreview();
  };

  // ============================================================================
  // ExtendScript (.jsx) Generator Engine for Selected Actions
  // ============================================================================
  const generateScriptUiCode = () => {
    const safeTitle = (panelName || 'Scriptify_Panel').replace(/[^a-zA-Z0-9_-]/g, '_');
    const cols = buttonSize === 'wide' ? 1 : (buttonSize === 'compact' ? 4 : 2);

    let scriptLines = [];

    scriptLines.push(`// ==============================================================================`);
    scriptLines.push(`// Adobe After Effects ScriptUI Dockable Panel`);
    scriptLines.push(`// Panel Name: ${safeTitle}`);
    scriptLines.push(`// Generated by: Scriptify (https://scriptify.dev)`);
    scriptLines.push(`// Target: After Effects CC 2020 - 2026 (ES3 ExtendScript Engine)`);
    scriptLines.push(`// Actions Count: ${selectedIds.length}`);
    scriptLines.push(`// ==============================================================================\n`);

    scriptLines.push(`(function(thisObj) {`);
    scriptLines.push(`    function buildScriptifyPanel(thisObj) {`);
    scriptLines.push(`        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "${safeTitle}", undefined, { resizeable: true });`);
    scriptLines.push(`        win.orientation = "column";`);
    scriptLines.push(`        win.alignChildren = ["fill", "top"];`);
    scriptLines.push(`        win.spacing = 6;`);
    scriptLines.push(`        win.margins = 10;\n`);

    // Title / Header label inside ScriptUI
    scriptLines.push(`        // Header Bar`);
    scriptLines.push(`        var header = win.add("statictext", undefined, "${safeTitle.replace(/_/g, ' ')}");`);
    scriptLines.push(`        header.graphics.font = ScriptUI.newFont("Tahoma", "Bold", 12);`);
    scriptLines.push(`        header.alignment = ["center", "top"];\n`);

    // Button container layout
    scriptLines.push(`        // Actions Container Grid`);
    scriptLines.push(`        var btnGroup = win.add("group");`);
    scriptLines.push(`        btnGroup.orientation = "${cols === 1 ? 'column' : 'row'}";`);
    scriptLines.push(`        btnGroup.alignChildren = ["fill", "top"];`);
    scriptLines.push(`        btnGroup.spacing = 4;`);
    scriptLines.push(`        btnGroup.margins = 0;\n`);

    // Partition into columns if multi-column
    if (cols > 1) {
      for (let c = 0; c < cols; c++) {
        scriptLines.push(`        var col_${c} = btnGroup.add("group");`);
        scriptLines.push(`        col_${c}.orientation = "column";`);
        scriptLines.push(`        col_${c}.alignChildren = ["fill", "top"];`);
        scriptLines.push(`        col_${c}.spacing = 4;`);
      }
      scriptLines.push('');
    }

    // Add each selected action button
    selectedIds.forEach((id, idx) => {
      const action = getActionById(id);
      if (!action) return;

      const targetCol = cols > 1 ? `col_${idx % cols}` : `btnGroup`;
      const btnId = `btn_${idx}_${action.id}`;
      const btnHeight = buttonSize === 'compact' ? 24 : (buttonSize === 'wide' ? 32 : 28);

      scriptLines.push(`        // [${idx + 1}] Button: ${action.label}`);
      scriptLines.push(`        var ${btnId} = ${targetCol}.add("button", undefined, "${action.label}");`);
      scriptLines.push(`        ${btnId}.preferredSize.height = ${btnHeight};`);
      scriptLines.push(`        ${btnId}.helpTip = "${action.desc.replace(/"/g, '\\"')}";`);
      scriptLines.push(`        ${btnId}.onClick = function() {`);
      scriptLines.push(`            app.beginUndoGroup("Scriptify: ${action.label}");`);
      scriptLines.push(`            try {`);

      // Embed clean action ExtendScript logic
      const cleanCode = action.extendScript.trim().split('\n').map(l => `                ${l.trim()}`).join('\n');
      scriptLines.push(cleanCode);

      scriptLines.push(`            } catch(err) {`);
      scriptLines.push(`                alert("Action Error (${action.label}):\\n" + err.toString(), "Scriptify");`);
      scriptLines.push(`            } finally {`);
      scriptLines.push(`                app.endUndoGroup();`);
      scriptLines.push(`            }`);
      scriptLines.push(`        };\n`);
    });

    scriptLines.push(`        // Auto-layout`);
    scriptLines.push(`        win.layout.layout(true);`);
    scriptLines.push(`        win.layout.resize();`);
    scriptLines.push(`        win.onResizing = win.onResize = function() {`);
    scriptLines.push(`            this.layout.resize();`);
    scriptLines.push(`        };`);
    scriptLines.push(`        return win;`);
    scriptLines.push(`    }\n`);

    scriptLines.push(`    var myPanel = buildScriptifyPanel(thisObj);`);
    scriptLines.push(`    if (myPanel instanceof Window) {`);
    scriptLines.push(`        myPanel.center();`);
    scriptLines.push(`        myPanel.show();`);
    scriptLines.push(`    }`);
    scriptLines.push(`})(this);`);

    return scriptLines.join('\n');
  };

  // Download .jsx panel package
  const downloadPanel = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one action from the library first.');
      return;
    }

    const code = generateScriptUiCode();
    const fileName = `${(panelName || 'Scriptify_Panel').replace(/[^a-zA-Z0-9_-]/g, '_')}.jsx`;

    const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded: ${fileName}`);
  };

  // Copy code to clipboard
  const copyCode = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one action from the library first.');
      return;
    }
    const code = generateScriptUiCode();
    navigator.clipboard.writeText(code).then(() => {
      if (btnCopyJsx) {
        const originalHtml = btnCopyJsx.innerHTML;
        btnCopyJsx.innerHTML = `<i class="fa-solid fa-check text-emerald-400 mr-1"></i> Copied!`;
        setTimeout(() => { btnCopyJsx.innerHTML = originalHtml; }, 2000);
      }
      showToast('ExtendScript copied to clipboard!');
    });
  };

  // View Code in modal
  const viewCode = () => {
    const code = generateScriptUiCode();
    const modal = document.getElementById('pb-code-modal');
    const modalOutput = document.getElementById('pb-code-output');
    if (modal && modalOutput) {
      modalOutput.textContent = code;
      modal.classList.remove('hidden');
    }
  };

  const updateAll = () => {
    renderLibrary();
    renderReorderList();
    renderPreview();
  };

  // Initialization
  const init = () => {
    // Search filter
    const searchInput = document.getElementById('pb-library-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderLibrary(e.target.value);
      });
    }

    // Panel name live sync
    if (panelNameInput) {
      panelNameInput.addEventListener('input', (e) => {
        panelName = e.target.value.trim() || 'Quick_Actions_Panel';
        if (previewWindowTitle) previewWindowTitle.textContent = panelName;
      });
    }

    // Size buttons
    if (sizeBtns.compact) sizeBtns.compact.addEventListener('click', () => setButtonSize('compact'));
    if (sizeBtns.regular) sizeBtns.regular.addEventListener('click', () => setButtonSize('regular'));
    if (sizeBtns.wide) sizeBtns.wide.addEventListener('click', () => setButtonSize('wide'));

    // Clear all
    if (btnClearAll) {
      btnClearAll.addEventListener('click', () => {
        if (confirm('Clear all selected actions?')) {
          selectedIds = [];
          updateAll();
        }
      });
    }

    // Download & Copy
    if (btnDownloadJsx) btnDownloadJsx.addEventListener('click', downloadPanel);
    if (btnCopyJsx) btnCopyJsx.addEventListener('click', copyCode);
    if (btnViewCode) btnViewCode.addEventListener('click', viewCode);

    // Initial render
    updateAll();
  };

  return {
    init,
    generateScriptUiCode,
    getSelectedIds: () => [...selectedIds],
    getButtonSize: () => buttonSize
  };
})();
