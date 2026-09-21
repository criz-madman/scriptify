const assert = require('assert');
const path = require('path');
const { PANEL_CATEGORIES, PANEL_ACTIONS } = require('../../frontend/js/panelBuilderData');

console.log('Testing Scriptify 3-Section Panel Builder Data & Actions...\n');

// Test 1: Verify Categories
assert.strictEqual(PANEL_CATEGORIES.length, 4, 'Must have exactly 4 categories');
const categoryIds = PANEL_CATEGORIES.map(c => c.id);
assert(categoryIds.includes('layer_creation'), 'Must include Layer/Creation category');
assert(categoryIds.includes('transform_anchor'), 'Must include Transform & Anchor category');
assert(categoryIds.includes('align_distribute'), 'Must include Align & Distribute category');
assert(categoryIds.includes('timing_keyframes'), 'Must include Timing & Keyframes category');
console.log('✓ 4 Categories verified: Layer/Creation, Transform & Anchor, Align & Distribute, Timing & Keyframes');

// Test 2: Verify All 28 Required Items Exist
const requiredItems = [
  'Null', 'Add Solid', 'Add Text', 'Add Shape', 'Adjustment', 'Add Camera', 'Parent to Null', 'Precompose',
  'Anchor Center', 'Anchor ↖', 'Anchor ↘', 'Center in Comp', 'Fit to Comp', 'Reset Transform',
  'Guide Layer', 'Motion Blur',
  'Align Left', 'Align H Center', 'Align Right', 'Align Top', 'Align V Center', 'Align Bottom', 'Distribute H', 'Distribute V',
  'Trim In', 'Trim Out', 'Move to CTI', 'Fit Comp', 'Easy Ease', 'Sequence'
];

const availableLabels = PANEL_ACTIONS.map(a => a.label);

requiredItems.forEach(item => {
  assert(availableLabels.includes(item), `Missing required action: "${item}"`);
});
console.log(`✓ All ${requiredItems.length} requested actions verified in library`);

// Test 3: Verify ExtendScript Implementation for Every Action
PANEL_ACTIONS.forEach(action => {
  assert(action.extendScript && action.extendScript.trim().length > 10, `Action "${action.label}" must have non-empty ExtendScript code`);
  assert(action.extendScript.includes('app.project') || action.extendScript.includes('CompItem'), `Action "${action.label}" must use valid AE DOM API`);
});
console.log(`✓ All ${PANEL_ACTIONS.length} actions have valid ExtendScript code implementations`);

console.log('\nAll Panel Builder tests passed successfully! 🎉');
