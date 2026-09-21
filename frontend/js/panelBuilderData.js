/**
 * Scriptify Panel Builder Action Library
 * Complete dictionary of 28+ After Effects automated actions across 4 categories
 * Each item contains genuine, battle-tested ECMAScript 3 (ES3) ExtendScript code.
 */

const PANEL_CATEGORIES = [
  { id: 'layer_creation', name: 'Layer / Creation', icon: 'fa-layer-group', color: 'orange' },
  { id: 'transform_anchor', name: 'Transform & Anchor', icon: 'fa-arrows-to-dot', color: 'amber' },
  { id: 'align_distribute', name: 'Align & Distribute', icon: 'fa-align-center', color: 'yellow' },
  { id: 'timing_keyframes', name: 'Timing & Keyframes', icon: 'fa-timeline', color: 'orange' }
];

const PANEL_ACTIONS = [
  // ============================================================================
  // Category 1: Layer / Creation (10 items)
  // ============================================================================
  {
    id: 'act_null',
    label: 'Null',
    category: 'layer_creation',
    icon: 'fa-square-plus',
    desc: 'Creates a centered 3D Guide Null controller in the active comp.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem) {
        var n = comp.layers.addNull(comp.duration);
        n.name = "Null Controller";
        n.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width/2, comp.height/2]);
        n.threeDLayer = true;
        n.guideLayer = true;
        n.label = 11;
      } else { alert("Open an active composition.", "Scriptify"); }
    `
  },
  {
    id: 'act_solid',
    label: 'Add Solid',
    category: 'layer_creation',
    icon: 'fa-square',
    desc: 'Creates a dark solid matching composition dimensions and frame rate.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem) {
        comp.layers.addSolid([0.15, 0.15, 0.18], "Dark Solid", comp.width, comp.height, comp.pixelAspect, comp.duration);
      } else { alert("Open an active composition.", "Scriptify"); }
    `
  },
  {
    id: 'act_text',
    label: 'Add Text',
    category: 'layer_creation',
    icon: 'fa-font',
    desc: 'Creates a new centered Text Layer ready for kinetic styling.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem) {
        var txt = comp.layers.addText("Scriptify Text");
        txt.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width/2, comp.height/2]);
      } else { alert("Open an active composition.", "Scriptify"); }
    `
  },
  {
    id: 'act_shape',
    label: 'Add Shape',
    category: 'layer_creation',
    icon: 'fa-shapes',
    desc: 'Creates an empty Shape Layer with zero transform offset.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem) {
        var shp = comp.layers.addShape();
        shp.name = "Shape Layer";
      } else { alert("Open an active composition.", "Scriptify"); }
    `
  },
  {
    id: 'act_adjustment',
    label: 'Adjustment',
    category: 'layer_creation',
    icon: 'fa-wand-magic-sparkles',
    desc: 'Creates a full-comp Adjustment Layer for color grading and effects.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem) {
        var adj = comp.layers.addSolid([1, 1, 1], "Adjustment Layer", comp.width, comp.height, comp.pixelAspect, comp.duration);
        adj.adjustmentLayer = true;
        adj.label = 5;
      } else { alert("Open an active composition.", "Scriptify"); }
    `
  },
  {
    id: 'act_camera',
    label: 'Add Camera',
    category: 'layer_creation',
    icon: 'fa-video',
    desc: 'Creates a 35mm 2-Node Camera centered in 3D composition space.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem) {
        comp.layers.addCamera("35mm Camera", [comp.width/2, comp.height/2]);
      } else { alert("Open an active composition.", "Scriptify"); }
    `
  },
  {
    id: 'act_parent_null',
    label: 'Parent to Null',
    category: 'layer_creation',
    icon: 'fa-sitemap',
    desc: 'Creates a master Null controller and parents all selected layers to it.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        var pNull = comp.layers.addNull(comp.duration);
        pNull.name = "Parent_Controller";
        pNull.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width/2, comp.height/2]);
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var sel = comp.selectedLayers[i];
          if (sel !== pNull) { sel.parent = pNull; }
        }
      } else { alert("Select at least one layer to parent.", "Scriptify"); }
    `
  },
  {
    id: 'act_precompose',
    label: 'Precompose',
    category: 'layer_creation',
    icon: 'fa-boxes-stacked',
    desc: 'Precomposes selected timeline layers moving all attributes.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        var indices = [];
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          indices.push(comp.selectedLayers[i].index);
        }
        comp.layers.precompose(indices, "Pre-comp " + comp.numLayers, true);
      } else { alert("Select layers to precompose.", "Scriptify"); }
    `
  },
  {
    id: 'act_guide_layer',
    label: 'Guide Layer',
    category: 'layer_creation',
    icon: 'fa-ruler-combined',
    desc: 'Toggles the Guide Layer status on selected layers.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          l.guideLayer = !l.guideLayer;
        }
      } else { alert("Select layers to toggle guide status.", "Scriptify"); }
    `
  },
  {
    id: 'act_motion_blur',
    label: 'Motion Blur',
    category: 'layer_creation',
    icon: 'fa-wind',
    desc: 'Enables Motion Blur switch on selected layers and composition.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        comp.motionBlur = true;
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          comp.selectedLayers[i].motionBlur = true;
        }
      } else { alert("Select layers to enable motion blur.", "Scriptify"); }
    `
  },

  // ============================================================================
  // Category 2: Transform & Anchor (6 items)
  // ============================================================================
  {
    id: 'act_anchor_center',
    label: 'Anchor Center',
    category: 'transform_anchor',
    icon: 'fa-bullseye',
    desc: 'Snaps anchor point to visual bounding center without moving layer.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          if (l.sourceRectAtTime) {
            var r = l.sourceRectAtTime(comp.time, false);
            var center = [r.left + r.width/2, r.top + r.height/2];
            var xDiff = (center[0] - l.anchorPoint.value[0]) * (l.scale.value[0] / 100);
            var yDiff = (center[1] - l.anchorPoint.value[1]) * (l.scale.value[1] / 100);
            l.anchorPoint.setValue(center);
            l.position.setValue([l.position.value[0] + xDiff, l.position.value[1] + yDiff]);
          }
        }
      } else { alert("Select layers to center anchor point.", "Scriptify"); }
    `
  },
  {
    id: 'act_anchor_tl',
    label: 'Anchor ↖',
    category: 'transform_anchor',
    icon: 'fa-arrow-up-left',
    desc: 'Snaps anchor point to Top-Left corner without moving layer.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          if (l.sourceRectAtTime) {
            var r = l.sourceRectAtTime(comp.time, false);
            var target = [r.left, r.top];
            var xDiff = (target[0] - l.anchorPoint.value[0]) * (l.scale.value[0] / 100);
            var yDiff = (target[1] - l.anchorPoint.value[1]) * (l.scale.value[1] / 100);
            l.anchorPoint.setValue(target);
            l.position.setValue([l.position.value[0] + xDiff, l.position.value[1] + yDiff]);
          }
        }
      } else { alert("Select layers.", "Scriptify"); }
    `
  },
  {
    id: 'act_anchor_br',
    label: 'Anchor ↘',
    category: 'transform_anchor',
    icon: 'fa-arrow-down-right',
    desc: 'Snaps anchor point to Bottom-Right corner without moving layer.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          if (l.sourceRectAtTime) {
            var r = l.sourceRectAtTime(comp.time, false);
            var target = [r.left + r.width, r.top + r.height];
            var xDiff = (target[0] - l.anchorPoint.value[0]) * (l.scale.value[0] / 100);
            var yDiff = (target[1] - l.anchorPoint.value[1]) * (l.scale.value[1] / 100);
            l.anchorPoint.setValue(target);
            l.position.setValue([l.position.value[0] + xDiff, l.position.value[1] + yDiff]);
          }
        }
      } else { alert("Select layers.", "Scriptify"); }
    `
  },
  {
    id: 'act_center_comp',
    label: 'Center in Comp',
    category: 'transform_anchor',
    icon: 'fa-crosshairs',
    desc: 'Repositions selected layers to exact center of active composition.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          if (l.threeDLayer) {
            l.position.setValue([comp.width/2, comp.height/2, l.position.value[2]]);
          } else {
            l.position.setValue([comp.width/2, comp.height/2]);
          }
        }
      } else { alert("Select layers to center.", "Scriptify"); }
    `
  },
  {
    id: 'act_fit_comp',
    label: 'Fit to Comp',
    category: 'transform_anchor',
    icon: 'fa-expand',
    desc: 'Scales selected layer dimensions to fit composition width and height.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          var w = (l.source) ? l.source.width : comp.width;
          var h = (l.source) ? l.source.height : comp.height;
          var scaleX = (comp.width / w) * 100;
          var scaleY = (comp.height / h) * 100;
          l.scale.setValue([scaleX, scaleY]);
        }
      } else { alert("Select layers to fit.", "Scriptify"); }
    `
  },
  {
    id: 'act_reset_transform',
    label: 'Reset Transform',
    category: 'transform_anchor',
    icon: 'fa-rotate-left',
    desc: 'Resets Position, Scale (100%), Rotation (0°), and Opacity (100%).',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          l.position.setValue([comp.width/2, comp.height/2]);
          l.scale.setValue([100, 100]);
          l.rotation.setValue(0);
          l.opacity.setValue(100);
        }
      } else { alert("Select layers to reset.", "Scriptify"); }
    `
  },

  // ============================================================================
  // Category 3: Align & Distribute (8 items)
  // ============================================================================
  {
    id: 'act_align_left',
    label: 'Align Left',
    category: 'align_distribute',
    icon: 'fa-align-left',
    desc: 'Aligns left edges of all selected layers.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 1) {
        var minX = 999999;
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var px = comp.selectedLayers[i].position.value[0];
          if (px < minX) minX = px;
        }
        for (var j = 0; j < comp.selectedLayers.length; j++) {
          var l = comp.selectedLayers[j];
          l.position.setValue([minX, l.position.value[1]]);
        }
      } else { alert("Select at least 2 layers to align.", "Scriptify"); }
    `
  },
  {
    id: 'act_align_h_center',
    label: 'Align H Center',
    category: 'align_distribute',
    icon: 'fa-arrows-left-right-to-line',
    desc: 'Aligns horizontal centers of all selected layers.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          l.position.setValue([comp.width / 2, l.position.value[1]]);
        }
      } else { alert("Select layers.", "Scriptify"); }
    `
  },
  {
    id: 'act_align_right',
    label: 'Align Right',
    category: 'align_distribute',
    icon: 'fa-align-right',
    desc: 'Aligns right edges of all selected layers.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 1) {
        var maxX = -999999;
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var px = comp.selectedLayers[i].position.value[0];
          if (px > maxX) maxX = px;
        }
        for (var j = 0; j < comp.selectedLayers.length; j++) {
          var l = comp.selectedLayers[j];
          l.position.setValue([maxX, l.position.value[1]]);
        }
      } else { alert("Select at least 2 layers.", "Scriptify"); }
    `
  },
  {
    id: 'act_align_top',
    label: 'Align Top',
    category: 'align_distribute',
    icon: 'fa-arrow-up',
    desc: 'Aligns top edges of all selected layers.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 1) {
        var minY = 999999;
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var py = comp.selectedLayers[i].position.value[1];
          if (py < minY) minY = py;
        }
        for (var j = 0; j < comp.selectedLayers.length; j++) {
          var l = comp.selectedLayers[j];
          l.position.setValue([l.position.value[0], minY]);
        }
      } else { alert("Select at least 2 layers.", "Scriptify"); }
    `
  },
  {
    id: 'act_align_v_center',
    label: 'Align V Center',
    category: 'align_distribute',
    icon: 'fa-arrows-up-down',
    desc: 'Aligns vertical centers of all selected layers.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          l.position.setValue([l.position.value[0], comp.height / 2]);
        }
      } else { alert("Select layers.", "Scriptify"); }
    `
  },
  {
    id: 'act_align_bottom',
    label: 'Align Bottom',
    category: 'align_distribute',
    icon: 'fa-arrow-down',
    desc: 'Aligns bottom edges of all selected layers.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 1) {
        var maxY = -999999;
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var py = comp.selectedLayers[i].position.value[1];
          if (py > maxY) maxY = py;
        }
        for (var j = 0; j < comp.selectedLayers.length; j++) {
          var l = comp.selectedLayers[j];
          l.position.setValue([l.position.value[0], maxY]);
        }
      } else { alert("Select at least 2 layers.", "Scriptify"); }
    `
  },
  {
    id: 'act_distribute_h',
    label: 'Distribute H',
    category: 'align_distribute',
    icon: 'fa-grip-lines-vertical',
    desc: 'Distributes selected layers with equal horizontal spacing.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 2) {
        var sel = [];
        for (var i = 0; i < comp.selectedLayers.length; i++) sel.push(comp.selectedLayers[i]);
        sel.sort(function(a, b) { return a.position.value[0] - b.position.value[0]; });
        var firstX = sel[0].position.value[0];
        var lastX = sel[sel.length - 1].position.value[0];
        var step = (lastX - firstX) / (sel.length - 1);
        for (var k = 1; k < sel.length - 1; k++) {
          sel[k].position.setValue([firstX + (k * step), sel[k].position.value[1]]);
        }
      } else { alert("Select at least 3 layers to distribute.", "Scriptify"); }
    `
  },
  {
    id: 'act_distribute_v',
    label: 'Distribute V',
    category: 'align_distribute',
    icon: 'fa-grip-lines',
    desc: 'Distributes selected layers with equal vertical spacing.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 2) {
        var sel = [];
        for (var i = 0; i < comp.selectedLayers.length; i++) sel.push(comp.selectedLayers[i]);
        sel.sort(function(a, b) { return a.position.value[1] - b.position.value[1]; });
        var firstY = sel[0].position.value[1];
        var lastY = sel[sel.length - 1].position.value[1];
        var step = (lastY - firstY) / (sel.length - 1);
        for (var k = 1; k < sel.length - 1; k++) {
          sel[k].position.setValue([sel[k].position.value[0], firstY + (k * step)]);
        }
      } else { alert("Select at least 3 layers to distribute.", "Scriptify"); }
    `
  },

  // ============================================================================
  // Category 4: Timing & Keyframes (6 items)
  // ============================================================================
  {
    id: 'act_trim_in',
    label: 'Trim In',
    category: 'timing_keyframes',
    icon: 'fa-scissors',
    desc: 'Trims selected layer inPoint to Current Time Indicator (CTI).',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          comp.selectedLayers[i].inPoint = comp.time;
        }
      } else { alert("Select layers to trim.", "Scriptify"); }
    `
  },
  {
    id: 'act_trim_out',
    label: 'Trim Out',
    category: 'timing_keyframes',
    icon: 'fa-scissors fa-flip-horizontal',
    desc: 'Trims selected layer outPoint to Current Time Indicator (CTI).',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          comp.selectedLayers[i].outPoint = comp.time;
        }
      } else { alert("Select layers to trim.", "Scriptify"); }
    `
  },
  {
    id: 'act_move_cti',
    label: 'Move to CTI',
    category: 'timing_keyframes',
    icon: 'fa-play',
    desc: 'Shifts selected layers so their start time aligns with the CTI.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          var diff = comp.time - l.inPoint;
          l.startTime = l.startTime + diff;
        }
      } else { alert("Select layers to move.", "Scriptify"); }
    `
  },
  {
    id: 'act_fit_comp_time',
    label: 'Fit Comp',
    category: 'timing_keyframes',
    icon: 'fa-arrows-split-up-and-left',
    desc: 'Extends layer duration to span from composition start to end.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          l.inPoint = 0;
          l.outPoint = comp.duration;
        }
      } else { alert("Select layers.", "Scriptify"); }
    `
  },
  {
    id: 'act_easy_ease',
    label: 'Easy Ease',
    category: 'timing_keyframes',
    icon: 'fa-bezier-curve',
    desc: 'Applies 33.3% smooth cubic easing to all selected property keyframes.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedProperties.length > 0) {
        var easeIn = new KeyframeEase(0, 33.333);
        var easeOut = new KeyframeEase(0, 33.333);
        for (var i = 0; i < comp.selectedProperties.length; i++) {
          var prop = comp.selectedProperties[i];
          if (prop.selectedKeys && prop.selectedKeys.length > 0) {
            for (var k = 0; k < prop.selectedKeys.length; k++) {
              var keyIdx = prop.selectedKeys[k];
              prop.setTemporalEaseAtKey(keyIdx, [easeIn], [easeOut]);
            }
          }
        }
      } else { alert("Select keyframes in the timeline to ease.", "Scriptify"); }
    `
  },
  {
    id: 'act_sequence',
    label: 'Sequence',
    category: 'timing_keyframes',
    icon: 'fa-bars-staggered',
    desc: 'Staggers selected timeline layers sequentially with a 2-frame step.',
    extendScript: `
      var comp = app.project.activeItem;
      if (comp instanceof CompItem && comp.selectedLayers.length > 1) {
        var stepSec = 2 * comp.frameDuration;
        for (var i = 0; i < comp.selectedLayers.length; i++) {
          var l = comp.selectedLayers[i];
          l.startTime = l.startTime + (i * stepSec);
        }
      } else { alert("Select at least 2 layers to sequence.", "Scriptify"); }
    `
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PANEL_CATEGORIES, PANEL_ACTIONS };
}
