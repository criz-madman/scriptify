const templates = require('./aeTemplates');
const ScriptUiBuilder = require('./scriptUiBuilder');

/**
 * Main ExtendScript & ScriptUI Generation Engine
 */
class ExtendScriptService {
  /**
   * Return available presets and templates
   */
  static getAvailablePresets() {
    return Object.values(templates).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      defaultOptions: t.defaultOptions
    }));
  }

  /**
   * Generate specialized Text Animation Rig script
   * @param {object} params
   * @param {number} [params.frequency]
   * @param {number} [params.decay]
   * @param {number} [params.delay]
   * @param {number} [params.amplitude]
   * @param {string} [params.separation] 'characters' | 'words' | 'lines'
   * @param {string} [params.animProperty] 'position' | 'scale' | 'rotation' | 'opacity'
   * @param {boolean} [params.includeNull]
   * @param {string} [params.textContent]
   * @param {string} [params.scriptName]
   * @param {string} [params.undoName]
   * @returns {{ scriptCode: string, rawExpression: string, fileName: string, lineCount: number }}
   */
  static generateTextAnimationScript(params = {}) {
    const freq = parseFloat(params.frequency !== undefined ? params.frequency : 3.0);
    const decay = parseFloat(params.decay !== undefined ? params.decay : 4.5);
    const delay = parseFloat(params.delay !== undefined ? params.delay : 0.08);
    const amp = parseFloat(params.amplitude !== undefined ? params.amplitude : 60);
    const separation = params.separation || 'characters'; // 'characters' | 'words' | 'lines'
    const animProperty = params.animProperty || 'position';
    const includeNull = !!params.includeNull;
    const textContent = (params.textContent || 'Text Animation').replace(/"/g, '\\"');
    const scriptName = params.scriptName || 'Text_Bounce_Animator';
    const undoName = params.undoName || 'Scriptify: Text Animation';
    const customExpression = (params.customExpression || '').trim();

    let basedOnValue = 1;
    let separationLabel = 'Characters';
    if (separation === 'words') {
      basedOnValue = 3;
      separationLabel = 'Words';
    } else if (separation === 'lines') {
      basedOnValue = 4;
      separationLabel = 'Lines';
    }

    const defaultBounceBody = `var myDelay = (textIndex - 1) * delay;
var t = time - inPoint - myDelay;

if (t < 0) {
    0;
} else {
    var bounce = Math.sin(t * freq * Math.PI * 2) / Math.exp(t * decay);
    bounce * 100;
}`;

    const exprBody = customExpression || defaultBounceBody;

    // Build raw expression string for pasting into AE
    let rawExpression = '';
    if (includeNull) {
      rawExpression = 
`// Scriptify Text Expression (Linked to Null Controller)
// Separation Mode: ${separationLabel} (textIndex)
var ctrl = thisComp.layer("Text_Animation_Controller");
var freq = ctrl.effect("Frequency (Hz)")("Slider");
var decay = ctrl.effect("Decay (Damping)")("Slider");
var delay = ctrl.effect("Stagger Delay (Sec)")("Slider");
var amp = ctrl.effect("Bounce Amplitude")("Slider");

${exprBody}`;
    } else {
      rawExpression = 
`// Scriptify Self-Contained Text Expression
// Separation Mode: ${separationLabel} (textIndex)
var freq = ${freq};
var decay = ${decay};
var delay = ${delay};
var amp = ${amp};

${exprBody}`;
    }

    let codeBody = `
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select or open an active composition first.", "Scriptify");
        return;
    }

    // 1. Create Text Layer
    var textLayer = comp.layers.addText("${textContent}");
    textLayer.name = "${textContent}";
    textLayer.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width / 2, comp.height / 2]);

    // 2. Add Text Animator
    var textProp = textLayer.property("ADBE Text Properties");
    var animators = textProp.property("ADBE Text Animators");
    var animator = animators.addProperty("ADBE Text Animator");
    animator.name = "Scriptify Bounce (${separationLabel})";

    // 3. Add Property to Animate
    var animProps = animator.property("ADBE Text Animator Properties");
`;

    if (animProperty === 'scale') {
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Scale 3D");\n    targetProp.setValue([${amp}, ${amp}, ${amp}]);\n`;
    } else if (animProperty === 'skew') {
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Skew");\n    targetProp.setValue(${amp});\n`;
    } else if (animProperty === 'rotation') {
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Rotation Z");\n    targetProp.setValue(${amp});\n`;
    } else if (animProperty === 'opacity') {
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Opacity");\n    targetProp.setValue(${amp < 100 ? amp : 0});\n`;
    } else if (animProperty === 'fillColor' || animProperty === 'fill_color') {
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Fill Color");\n    targetProp.setValue([0.98, 0.45, 0.08]);\n`;
    } else if (animProperty === 'strokeColor' || animProperty === 'stroke_color') {
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Stroke Color");\n    targetProp.setValue([1.0, 0.65, 0.15]);\n`;
    } else if (animProperty === 'strokeWidth' || animProperty === 'stroke_width') {
      const sw = amp > 0 ? (amp > 20 ? Math.round(amp / 10) : amp) : 4;
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Stroke Width");\n    targetProp.setValue(${sw});\n`;
    } else if (animProperty === 'tracking') {
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Track Amount");\n    targetProp.setValue(${amp || 50});\n`;
    } else if (animProperty === 'lineSpacing' || animProperty === 'line_spacing') {
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Line Spacing");\n    targetProp.setValue([0, ${amp || 35}]);\n`;
    } else if (animProperty === 'characterOffset' || animProperty === 'character_offset') {
      const co = amp > 0 ? (amp > 25 ? Math.round(amp / 5) : amp) : 5;
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Character Offset");\n    targetProp.setValue(${co});\n`;
    } else if (animProperty === 'blur') {
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Blur");\n    targetProp.setValue([${amp || 25}, ${amp || 25}]);\n`;
    } else {
      codeBody += `    var targetProp = animProps.addProperty("ADBE Text Position 3D");\n    targetProp.setValue([0, -${amp}, 0]);\n`;
    }

    codeBody += `
    // 4. Add Expression Selector for ${separationLabel}
    var selectors = animator.property("ADBE Text Selectors");
    var exprSelector = selectors.addProperty("ADBE Text Expr Selector");
    var advanced = exprSelector.property("ADBE Text Range Advanced");
    advanced.property("ADBE Text Range Based On").setValue(${basedOnValue}); // ${basedOnValue} = ${separationLabel}
`;

    if (includeNull) {
      codeBody += `
    // 5. Build Master Controller Null Object
    var nullCtrl = comp.layers.addNull(comp.duration);
    nullCtrl.name = "Text_Animation_Controller";
    nullCtrl.guideLayer = true;
    nullCtrl.label = 11; // Orange label
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
    amountProp.expression = ${JSON.stringify(rawExpression)};
`;
    } else {
      codeBody += `
    // 5. Attach Direct Expression (Self-Contained)
    var amountProp = exprSelector.property("ADBE Text Expression Amount");
    amountProp.expression = ${JSON.stringify(rawExpression)};
`;
    }

    const scriptObj = this._wrapScript(codeBody, scriptName, undoName);
    scriptObj.rawExpression = rawExpression;
    return scriptObj;
  }

  /**
   * Helper to wrap raw script logic into an ES3 execution block with undo group & error handling
   */
  static _wrapScript(rawCode, scriptName, undoName) {
    const safeBaseName = (scriptName || 'Scriptify_Script').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${safeBaseName}.jsx`;

    const sanitized = rawCode
      .replace(/\bconst\b/g, 'var')
      .replace(/\blet\b/g, 'var');

    const finalScript = `/**
 * Generated by Scriptify — After Effects ExtendScript Automation
 * Script: ${safeBaseName}
 * Compatibility: Adobe After Effects 2020 - 2026 (ES3 Engine)
 */

(function() {
    if (!app.project) {
        alert("Please open an After Effects project before running this tool.", "Scriptify");
        return;
    }

    app.beginUndoGroup("${undoName || 'Scriptify Automation'}");

    try {
${sanitized}
    } catch (err) {
        alert("Scriptify Execution Error: " + (err.toString ? err.toString() : err), "Scriptify Error");
    } finally {
        app.endUndoGroup();
    }
})();
`;

    return {
      scriptCode: finalScript,
      fileName,
      lineCount: finalScript.split('\n').length
    };
  }

  /**
   * Generate ExtendScript code based on input payload
   * @param {object} params
   * @param {string} params.scriptType 'preset' | 'scriptui' | 'text_animator' | 'custom'
   * @returns {{ scriptCode: string, fileName: string, lineCount: number }}
   */
  static generateScript(params = {}) {
    const {
      scriptType = 'preset',
      presetId = 'layer_stagger',
      scriptName = 'Scriptify_AE_Tool',
      undoName = 'Scriptify Action',
      options = {},
      uiConfig = {},
      customCode = ''
    } = params;

    if (scriptType === 'text_animator') {
      return this.generateTextAnimationScript({
        ...options,
        scriptName,
        undoName
      });
    }

    if (scriptType === 'scriptui') {
      const rawCode = ScriptUiBuilder.buildPanel({
        title: scriptName,
        orientation: uiConfig.orientation || 'column',
        elements: uiConfig.elements || []
      });
      const safeBaseName = (scriptName || 'Scriptify_Panel').replace(/[^a-zA-Z0-9_-]/g, '_');
      return {
        scriptCode: rawCode,
        fileName: `${safeBaseName}.jsx`,
        lineCount: rawCode.split('\n').length
      };
    }

    let rawCode = '';
    if (scriptType === 'preset' && templates[presetId]) {
      rawCode = templates[presetId].generate(options);
    } else if (scriptType === 'custom' && customCode) {
      rawCode = customCode
        .replace(/\bconst\b/g, 'var')
        .replace(/\blet\b/g, 'var');
    } else {
      rawCode = templates.layer_stagger.generate(options);
    }

    return this._wrapScript(rawCode, scriptName, undoName);
  }
}

module.exports = ExtendScriptService;
