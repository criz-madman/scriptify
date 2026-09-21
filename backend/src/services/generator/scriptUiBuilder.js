/**
 * ScriptUI Dockable Panel & Dialog Code Generator
 * Converts JSON visual component layouts into clean, Adobe CC compatible ScriptUI ExtendScript.
 */

class ScriptUiBuilder {
  /**
   * Build a complete, production-grade ScriptUI Dockable Panel script
   * @param {object} config Panel configuration and components
   * @returns {string} ExtendScript code
   */
  static buildPanel(config = {}) {
    const title = config.title || 'Scriptify AE Tools';
    const orientation = config.orientation || 'column';
    const elements = Array.isArray(config.elements) ? config.elements : [];

    let scriptLines = [];

    scriptLines.push(`// ==============================================================================`);
    scriptLines.push(`// Scriptify - Adobe After Effects ScriptUI Dockable Panel`);
    scriptLines.push(`// Title: ${title}`);
    scriptLines.push(`// Generated: ${new Date().toISOString()}`);
    scriptLines.push(`// ==============================================================================\n`);

    scriptLines.push(`(function(thisObj) {`);
    scriptLines.push(`    function buildScriptifyUI(thisObj) {`);
    scriptLines.push(`        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "${title}", undefined, { resizeable: true });`);
    scriptLines.push(`        win.orientation = "${orientation}";`);
    scriptLines.push(`        win.alignChildren = ["fill", "top"];`);
    scriptLines.push(`        win.spacing = 8;`);
    scriptLines.push(`        win.margins = 12;\n`);

    // Generate each component
    elements.forEach((elem, idx) => {
      const id = `ctrl_${idx}`;
      const elemType = elem.type || 'button';
      const label = elem.label || `Control ${idx + 1}`;

      switch (elemType) {
        case 'header':
          scriptLines.push(`        // Section Header`);
          scriptLines.push(`        var ${id}_header = win.add("statictext", undefined, "${label}");`);
          scriptLines.push(`        ${id}_header.graphics.font = ScriptUI.newFont("Tahoma", "Bold", 12);`);
          break;

        case 'button':
          const undoName = elem.undoName || label;
          const actionBody = elem.actionCode || `alert("Executing action: ${label}", "${title}");`;
          scriptLines.push(`        // Button: ${label}`);
          scriptLines.push(`        var ${id} = win.add("button", undefined, "${label}");`);
          scriptLines.push(`        ${id}.onClick = function() {`);
          scriptLines.push(`            app.beginUndoGroup("${undoName}");`);
          scriptLines.push(`            try {`);
          actionBody.split('\n').forEach(line => {
            scriptLines.push(`                ${line}`);
          });
          scriptLines.push(`            } catch(err) {`);
          scriptLines.push(`                alert("Script Error: " + err.toString(), "Scriptify");`);
          scriptLines.push(`            } finally {`);
          scriptLines.push(`                app.endUndoGroup();`);
          scriptLines.push(`            }`);
          scriptLines.push(`        };`);
          break;

        case 'slider':
          const min = elem.min !== undefined ? elem.min : 0;
          const max = elem.max !== undefined ? elem.max : 100;
          const val = elem.value !== undefined ? elem.value : 50;
          scriptLines.push(`        // Slider with Value Label`);
          scriptLines.push(`        var ${id}_grp = win.add("group");`);
          scriptLines.push(`        ${id}_grp.orientation = "row";`);
          scriptLines.push(`        ${id}_grp.alignChildren = ["left", "center"];`);
          scriptLines.push(`        var ${id}_lbl = ${id}_grp.add("statictext", undefined, "${label}:");`);
          scriptLines.push(`        var ${id} = ${id}_grp.add("slider", undefined, ${val}, ${min}, ${max});`);
          scriptLines.push(`        ${id}.preferredSize.width = 120;`);
          scriptLines.push(`        var ${id}_val = ${id}_grp.add("statictext", undefined, "${val}");`);
          scriptLines.push(`        ${id}_val.preferredSize.width = 35;`);
          scriptLines.push(`        ${id}.onChanging = function() {`);
          scriptLines.push(`            ${id}_val.text = Math.round(this.value);`);
          scriptLines.push(`        };`);
          break;

        case 'dropdown':
          const items = Array.isArray(elem.items) ? elem.items : ['Option 1', 'Option 2', 'Option 3'];
          const itemsArrStr = JSON.stringify(items);
          scriptLines.push(`        // Dropdown Selector`);
          scriptLines.push(`        var ${id}_grp = win.add("group");`);
          scriptLines.push(`        ${id}_grp.orientation = "row";`);
          scriptLines.push(`        ${id}_grp.add("statictext", undefined, "${label}:");`);
          scriptLines.push(`        var ${id} = ${id}_grp.add("dropdownlist", undefined, ${itemsArrStr});`);
          scriptLines.push(`        ${id}.selection = 0;`);
          break;

        case 'checkbox':
          const isChecked = elem.checked !== undefined ? !!elem.checked : false;
          scriptLines.push(`        // Checkbox: ${label}`);
          scriptLines.push(`        var ${id} = win.add("checkbox", undefined, "${label}");`);
          scriptLines.push(`        ${id}.value = ${isChecked};`);
          break;

        case 'edittext':
          const defaultText = elem.defaultText || '';
          scriptLines.push(`        // Text Input Field`);
          scriptLines.push(`        var ${id}_grp = win.add("group");`);
          scriptLines.push(`        ${id}_grp.orientation = "row";`);
          scriptLines.push(`        ${id}_grp.add("statictext", undefined, "${label}:");`);
          scriptLines.push(`        var ${id} = ${id}_grp.add("edittext", undefined, "${defaultText}");`);
          scriptLines.push(`        ${id}.preferredSize.width = 140;`);
          break;

        default:
          break;
      }
      scriptLines.push('');
    });

    scriptLines.push(`        // Auto-layout & Resize`);
    scriptLines.push(`        win.layout.layout(true);`);
    scriptLines.push(`        win.layout.resize();`);
    scriptLines.push(`        win.onResizing = win.onResize = function() {`);
    scriptLines.push(`            this.layout.resize();`);
    scriptLines.push(`        };`);
    scriptLines.push(`        return win;`);
    scriptLines.push(`    }`);
    scriptLines.push(`    `);
    scriptLines.push(`    var myScriptPanel = buildScriptifyUI(thisObj);`);
    scriptLines.push(`    if (myScriptPanel instanceof Window) {`);
    scriptLines.push(`        myScriptPanel.center();`);
    scriptLines.push(`        myScriptPanel.show();`);
    scriptLines.push(`    }`);
    scriptLines.push(`})(this);`);

    return scriptLines.join('\n');
  }
}

module.exports = ScriptUiBuilder;
