const assert = require('assert');
const ExtendScriptService = require('../src/services/generator/extendScriptService');
const ScriptUiBuilder = require('../src/services/generator/scriptUiBuilder');

console.log('Testing Scriptify Generator Engine...\n');

// Test 1: Get available presets
const presets = ExtendScriptService.getAvailablePresets();
assert(Array.isArray(presets), 'Presets should be an array');
assert(presets.length >= 5, 'Should have at least 5 presets');
console.log(`✓ Presets verified: ${presets.length} available presets`);

// Test 2: Generate Layer Stagger Preset
const stagger = ExtendScriptService.generateScript({
  scriptType: 'preset',
  presetId: 'layer_stagger',
  scriptName: 'Test_Stagger_Tool',
  undoName: 'Stagger Layers',
  options: { frameStep: 10, reverseOrder: true, staggerInPoints: true }
});

assert(stagger.scriptCode.includes('app.beginUndoGroup("Stagger Layers");'), 'Should contain undo group');
assert(stagger.scriptCode.includes('currentLayer.startTime'), 'Should contain stagger logic');
assert(stagger.fileName === 'Test_Stagger_Tool.jsx', 'Filename should be Test_Stagger_Tool.jsx');
console.log(`✓ Layer Stagger generated (${stagger.lineCount} lines, ${stagger.fileName})`);

// Test 3: Generate Auto-Null Rig Preset
const nullRig = ExtendScriptService.generateScript({
  scriptType: 'preset',
  presetId: 'auto_null_parent',
  scriptName: 'Null_Master_Rig',
  undoName: 'Build Null Rig',
  options: { nullName: 'Center_Controller', is3D: true, addSliderControls: true }
});

assert(nullRig.scriptCode.includes('comp.layers.addNull'), 'Should contain addNull logic');
assert(nullRig.scriptCode.includes('threeDLayer = true'), 'Should have 3D switch');
assert(nullRig.scriptCode.includes('ADBE Slider Control'), 'Should add slider control');
console.log(`✓ Auto-Null Rig generated (${nullRig.lineCount} lines, ${nullRig.fileName})`);

// Test 4: Generate ScriptUI Dockable Panel
const scriptUi = ExtendScriptService.generateScript({
  scriptType: 'scriptui',
  scriptName: 'My_Custom_Panel',
  undoName: 'Custom Action',
  uiConfig: {
    orientation: 'column',
    elements: [
      { type: 'header', label: 'Layer Tools' },
      { type: 'button', label: 'Duplicate & Shift', undoName: 'Dup Shift', actionCode: 'alert("Shifted");' },
      { type: 'slider', label: 'Offset Amount', min: 0, max: 50, value: 10 },
      { type: 'checkbox', label: 'Enable 3D', checked: true },
      { type: 'dropdown', label: 'Mode', items: ['Linear', 'Ease', 'Hold'] }
    ]
  }
});

assert(scriptUi.scriptCode.includes('(thisObj instanceof Panel)'), 'Should contain dockable Panel pattern');
assert(scriptUi.scriptCode.includes('.add("slider"'), 'Should contain slider control');
assert(scriptUi.scriptCode.includes('.add("dropdownlist"'), 'Should contain dropdown control');
console.log(`✓ ScriptUI Dockable Panel generated (${scriptUi.lineCount} lines)`);

// Test 5: Custom code ES3 sanitizer
const custom = ExtendScriptService.generateScript({
  scriptType: 'custom',
  scriptName: 'Custom_Sanitizer_Test',
  undoName: 'Custom Action',
  customCode: 'const myComp = app.project.activeItem;\nlet layer = myComp.layer(1);'
});

assert(!custom.scriptCode.includes('const myComp'), 'Should sanitize const to var for ES3 AE compatibility');
assert(!custom.scriptCode.includes('let layer'), 'Should sanitize let to var for ES3 AE compatibility');
console.log('✓ ES3 code sanitizer verified (const/let translated to var for AE)');

// Test 6: Text Animation Rig with Null Controller and Words Separation
const textRigNull = ExtendScriptService.generateScript({
  scriptType: 'text_animator',
  scriptName: 'Kinetic_Bounce_Rig',
  undoName: 'Scriptify: Text Animation',
  options: {
    frequency: 6,
    amplitude: 45,
    decay: 5.0,
    delay: 0.12,
    separation: 'words',
    animProperty: 'position',
    includeNull: true,
    textContent: 'Kinetic Motion'
  }
});

assert(textRigNull.scriptCode.includes('comp.layers.addText("Kinetic Motion")'), 'Should add text layer with given text');
assert(textRigNull.scriptCode.includes('nullCtrl.name = "Text_Animation_Controller"'), 'Should create master null controller');
assert(textRigNull.scriptCode.includes('fxFreq.property("ADBE Slider Control-0001").setValue(6)'), 'Should set frequency slider');
assert(textRigNull.scriptCode.includes('fxAmp.property("ADBE Slider Control-0001").setValue(45)'), 'Should set amplitude slider');
assert(textRigNull.scriptCode.includes('ADBE Text Expr Selector'), 'Should create Text Expression Selector');
assert(textRigNull.scriptCode.includes('.setValue(3);'), 'Should set Range Based On to Words (3)');
assert(textRigNull.rawExpression.includes('Text_Animation_Controller'), 'Raw expression should link to Null controller');
assert(textRigNull.rawExpression.includes('textIndex'), 'Raw expression should include textIndex');
console.log(`✓ Text Animation Rig with Null Controller & Words Separation generated (${textRigNull.lineCount} lines)`);

// Test 7: Text Animation Rig without Null (Direct expression with Characters separation)
const textRigDirect = ExtendScriptService.generateScript({
  scriptType: 'text_animator',
  scriptName: 'Direct_Bounce',
  options: {
    frequency: 3,
    amplitude: 20,
    decay: 4.0,
    delay: 0.05,
    separation: 'characters',
    animProperty: 'scale',
    includeNull: false,
    textContent: 'Direct Bounce'
  }
});

assert(textRigDirect.scriptCode.includes('Math.sin(t * freq * Math.PI * 2) / Math.exp(t * decay)'), 'Should apply direct bounce expression');
assert(textRigDirect.scriptCode.includes('.setValue(1);'), 'Should set Range Based On to Characters (1)');
assert(!textRigDirect.scriptCode.includes('nullCtrl'), 'Should not generate null object if disabled');
assert(textRigDirect.rawExpression.includes('var freq = 3;'), 'Raw expression should contain direct parameter constants');
assert(textRigDirect.rawExpression.includes('textIndex'), 'Raw expression should include textIndex');
console.log(`✓ Direct Text Animation Rig with Characters Separation generated (${textRigDirect.lineCount} lines)`);

// Test 8: Expanded Text Animator Properties (Skew, Blur, Tracking, Character Offset)
const skewRig = ExtendScriptService.generateScript({
  scriptType: 'text_animator',
  scriptName: 'Skew_Rig',
  options: {
    animProperty: 'skew',
    amplitude: 35,
    includeNull: true
  }
});
assert(skewRig.scriptCode.includes('ADBE Text Skew'), 'Should create ADBE Text Skew property');
assert(skewRig.scriptCode.includes('.setValue(35);'), 'Should set skew value to 35');

const blurRig = ExtendScriptService.generateScript({
  scriptType: 'text_animator',
  scriptName: 'Blur_Rig',
  options: {
    animProperty: 'blur',
    amplitude: 25,
    includeNull: false
  }
});
assert(blurRig.scriptCode.includes('ADBE Text Blur'), 'Should create ADBE Text Blur property');
assert(blurRig.scriptCode.includes('.setValue([25, 25]);'), 'Should set blur 2D vector value');

const trackRig = ExtendScriptService.generateScript({
  scriptType: 'text_animator',
  scriptName: 'Track_Rig',
  options: {
    animProperty: 'tracking',
    amplitude: 50
  }
});
assert(trackRig.scriptCode.includes('ADBE Text Track Amount'), 'Should create ADBE Text Track Amount property');

const charOffsetRig = ExtendScriptService.generateScript({
  scriptType: 'text_animator',
  scriptName: 'Offset_Rig',
  options: {
    animProperty: 'characterOffset',
    amplitude: 10
  }
});
assert(charOffsetRig.scriptCode.includes('ADBE Text Character Offset'), 'Should create ADBE Text Character Offset property');
console.log('✓ Expanded Text Animation Properties verified (Skew, Blur, Tracking, Character Offset)');

// Test 9: Custom Expression & Parameter Tuner
const customSnippet = 'var myDelay = (textIndex - 1) * delay; var t = time - inPoint - myDelay; if (t < 0) 0; else Math.cos(t * freq * 3.14) * 80;';
const customExprRig = ExtendScriptService.generateScript({
  scriptType: 'text_animator',
  scriptName: 'Custom_Expression_Rig',
  options: {
    frequency: 4.5,
    decay: 6.0,
    amplitude: 75,
    customExpression: customSnippet,
    includeNull: true
  }
});

assert(customExprRig.scriptCode.includes(customSnippet), 'Should embed custom expression snippet into script');
assert(customExprRig.rawExpression.includes(customSnippet), 'Raw expression should contain custom snippet');
assert(customExprRig.scriptCode.includes('Frequency (Hz)'), 'Should wire Frequency slider for custom tuner');
console.log('✓ Custom Expression & Parameter Tuner verified');

console.log('\nAll 9 Generator Engine tests passed successfully! 🎉');
