/**
 * Pre-configured, battle-tested Adobe After Effects ExtendScript templates
 * Conforms strictly to ES3 JavaScript standard required by After Effects ExtendScript engine.
 */

const templates = {
  // 1. Layer Stagger / Sequencer with Ease
  layer_stagger: {
    id: 'layer_stagger',
    title: 'Layer Time Stagger & Sequencer',
    description: 'Sequences selected layers by a specified frame step with optional reverse ordering.',
    category: 'Automation',
    defaultOptions: {
      frameStep: 5,
      reverseOrder: false,
      staggerInPoints: true
    },
    generate: (opts) => {
      const step = parseInt(opts.frameStep || 5, 10);
      const reverse = !!opts.reverseOrder;
      const staggerIn = !!opts.staggerInPoints;

      return `
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select or open an active composition first.", "Scriptify");
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length < 2) {
        alert("Please select at least 2 layers in the timeline to stagger.", "Scriptify");
        return;
    }

    var frameDuration = comp.frameDuration;
    var stepSeconds = ${step} * frameDuration;
    var layersCount = selectedLayers.length;

    for (var i = 0; i < layersCount; i++) {
        var layerIndex = ${reverse} ? (layersCount - 1 - i) : i;
        var currentLayer = selectedLayers[layerIndex];
        var offsetTime = i * stepSeconds;

        if (${staggerIn}) {
            currentLayer.startTime = currentLayer.startTime + offsetTime;
        } else {
            // Shift entire layer duration
            var duration = currentLayer.outPoint - currentLayer.inPoint;
            currentLayer.inPoint = currentLayer.inPoint + offsetTime;
            currentLayer.outPoint = currentLayer.inPoint + duration;
        }
    }
`;
    }
  },

  // 2. Auto-Null Parent Rigging
  auto_null_parent: {
    id: 'auto_null_parent',
    title: 'Auto-Null Parent Controller Rig',
    description: 'Generates a centered Null controller, enables 3D if needed, and parents selected layers.',
    category: 'Rigging',
    defaultOptions: {
      nullName: 'Master_Controller_Null',
      is3D: true,
      addSliderControls: true
    },
    generate: (opts) => {
      const nullName = opts.nullName || 'Master_Controller_Null';
      const is3D = !!opts.is3D;
      const addSliders = !!opts.addSliderControls;

      return `
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select an active composition first.", "Scriptify");
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("Please select one or more layers to parent to the Null.", "Scriptify");
        return;
    }

    // Create the master null controller
    var nullLayer = comp.layers.addNull(comp.duration);
    nullLayer.name = "${nullName}";
    nullLayer.startTime = 0;
    nullLayer.threeDLayer = ${is3D};
    nullLayer.guideLayer = true;
    nullLayer.label = 11; // Orange label

    // Center Null in composition
    var centerX = comp.width / 2;
    var centerY = comp.height / 2;
    if (${is3D}) {
        nullLayer.property("ADBE Transform Group").property("ADBE Position").setValue([centerX, centerY, 0]);
    } else {
        nullLayer.property("ADBE Transform Group").property("ADBE Position").setValue([centerX, centerY]);
    }

    ${addSliders ? `
    // Add Master Expression Slider and Checkbox controls
    var sliderEffect = nullLayer.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    sliderEffect.name = "Master Scale Factor";
    sliderEffect.property("ADBE Slider Control-0001").setValue(100);

    var toggleEffect = nullLayer.property("ADBE Effect Parade").addProperty("ADBE Checkbox Control");
    toggleEffect.name = "Visibility Override";
    toggleEffect.property("ADBE Checkbox Control-0001").setValue(1);
    ` : ''}

    // Parent all selected layers to the new Null controller
    for (var i = 0; i < selectedLayers.length; i++) {
        var lyr = selectedLayers[i];
        if (lyr !== nullLayer) {
            lyr.parent = nullLayer;
        }
    }
`;
    }
  },

  // 3. Kinetic Typography & Split Animator
  kinetic_typography: {
    id: 'kinetic_typography',
    title: 'Kinetic Typography Motion Rig',
    description: 'Adds an advanced Text Animator with Tracking, Smooth Position Drift, and Opacity Fade.',
    category: 'Motion Design',
    defaultOptions: {
      trackingAmount: 15,
      yDrift: 40,
      easeDuration: 0.75
    },
    generate: (opts) => {
      const tracking = parseInt(opts.trackingAmount || 15, 10);
      const yDrift = parseInt(opts.yDrift || 40, 10);
      const duration = parseFloat(opts.easeDuration || 0.75);

      return `
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please open an active composition.", "Scriptify");
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("Please select a Text Layer to apply kinetic typography.", "Scriptify");
        return;
    }

    var currentTime = comp.time;
    var targetEndTime = currentTime + ${duration};

    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        if (!(layer instanceof TextLayer)) continue;

        var textProp = layer.property("ADBE Text Properties");
        var animators = textProp.property("ADBE Text Animators");
        
        // Add new Animator
        var animator = animators.addProperty("ADBE Text Animator");
        animator.name = "Scriptify Kinetic In";

        // Add Tracking and Position properties
        var propTracking = animator.property("ADBE Text Animator Properties").addProperty("ADBE Text Track Type");
        propTracking.setValue(${tracking});

        var propPosition = animator.property("ADBE Text Animator Properties").addProperty("ADBE Text Position 3D");
        propPosition.setValue([0, ${yDrift}, 0]);

        var propOpacity = animator.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity");
        propOpacity.setValue(0);

        // Configure Range Selector
        var selector = animator.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        var startProp = selector.property("ADBE Text Percent Start");
        
        // Keyframe the entrance
        startProp.setValueAtTime(currentTime, 0);
        startProp.setValueAtTime(targetEndTime, 100);

        // Smooth ease
        var easeIn = new KeyframeEase(0, 75);
        var easeOut = new KeyframeEase(0, 75);
        startProp.setTemporalEaseAtKey(1, [easeIn], [easeOut]);
        startProp.setTemporalEaseAtKey(2, [easeIn], [easeOut]);
    }
`;
    }
  },

  // 4. Batch Render Queue Item Setup
  batch_render_setup: {
    id: 'batch_render_setup',
    title: 'Batch Render Queue & Output Exporter',
    description: 'Automatically scans project compositions and adds them to Render Queue with designated templates.',
    category: 'Workflow',
    defaultOptions: {
      renderTemplate: 'Best Settings',
      outputTemplate: 'ProRes 422',
      outputFolder: '~/Desktop/AE_Renders'
    },
    generate: (opts) => {
      const renderTpl = opts.renderTemplate || 'Best Settings';
      const outputTpl = opts.outputTemplate || 'Lossless';
      const outputDir = (opts.outputFolder || '~/Desktop/AE_Renders').replace(/\\/g, '/');

      return `
    var proj = app.project;
    if (!proj || proj.numItems === 0) {
        alert("Project is empty or not saved.", "Scriptify");
        return;
    }

    var renderQueue = proj.renderQueue;
    var outFolder = new Folder("${outputDir}");
    if (!outFolder.exists) {
        outFolder.create();
    }

    var addedCount = 0;
    for (var i = 1; i <= proj.numItems; i++) {
        var item = proj.item(i);
        if (item instanceof CompItem) {
            var rqItem = renderQueue.items.add(item);
            
            try {
                rqItem.applyTemplate("${renderTpl}");
            } catch(e) {
                // Keep default if template not registered
            }

            var om = rqItem.outputModule(1);
            try {
                om.applyTemplate("${outputTpl}");
            } catch(e) {
                // Keep default
            }

            var safeCompName = item.name.replace(/[/\\\\?%*:|"<>]/g, '_');
            om.file = new File(outFolder.fsName + "/" + safeCompName + "_[####].mov");
            addedCount++;
        }
    }

    alert("Successfully added " + addedCount + " composition(s) to the Render Queue!\\nOutput Folder: " + outFolder.fsName, "Scriptify");
`;
    }
  },

  // 5. Expression Slider Controller Rig
  expression_controller_rig: {
    id: 'expression_controller_rig',
    title: 'Expression Controller & Wiggle Invalidator',
    description: 'Adds an intuitive Frequency/Amplitude Wiggle Rig to selected layer properties.',
    category: 'Expressions',
    defaultOptions: {
      frequency: 3,
      amplitude: 25,
      targetProperty: 'Position'
    },
    generate: (opts) => {
      const freq = opts.frequency || 3;
      const amp = opts.amplitude || 25;
      const propName = opts.targetProperty || 'Position';

      return `
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please open an active composition.", "Scriptify");
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("Please select one or more layers.", "Scriptify");
        return;
    }

    for (var i = 0; i < selectedLayers.length; i++) {
        var lyr = selectedLayers[i];
        
        // Add Frequency Slider
        var sFreq = lyr.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sFreq.name = "Wiggle Frequency (Hz)";
        sFreq.property("ADBE Slider Control-0001").setValue(${freq});

        // Add Amplitude Slider
        var sAmp = lyr.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        sAmp.name = "Wiggle Amplitude (Px)";
        sAmp.property("ADBE Slider Control-0001").setValue(${amp});

        // Apply dynamic expression to target property
        var targetProp = lyr.property("ADBE Transform Group").property("ADBE ${propName}");
        if (targetProp && targetProp.canSetExpression) {
            targetProp.expression = 
                'var freq = effect("Wiggle Frequency (Hz)")("Slider");\\n' +
                'var amp = effect("Wiggle Amplitude (Px)")("Slider");\\n' +
                'wiggle(freq, amp);';
        }
    }
`;
    }
  }
};

module.exports = templates;
