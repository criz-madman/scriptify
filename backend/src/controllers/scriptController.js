const ExtendScriptService = require('../services/generator/extendScriptService');
const walletService = require('../services/walletService');
const env = require('../config/env');

/**
 * Controller handling ExtendScript and ScriptUI Generation
 */

// 1. Get available AE preset templates
const getPresets = (req, res) => {
  const presets = ExtendScriptService.getAvailablePresets();
  res.status(200).json({
    success: true,
    count: presets.length,
    presets
  });
};

// 2. Generate custom ExtendScript / ScriptUI and atomically deduct 1 credit
const generateScript = async (req, res, next) => {
  try {
    const {
      scriptType = 'preset',
      presetId = 'layer_stagger',
      scriptName = 'Scriptify_AE_Tool',
      undoName = 'Scriptify Action',
      options = {},
      uiConfig = {},
      customCode = ''
    } = req.body;

    const cost = env.costPerScript; // Standard: 1 credit per generation

    // Prepare metadata payload for HistoryLog (Table D3)
    const actionDetails = {
      action: 'GENERATE_EXTENDSCRIPT',
      scriptType,
      presetId: scriptType === 'preset' ? presetId : null,
      scriptName,
      undoName,
      options,
      uiConfig: scriptType === 'scriptui' ? uiConfig : null
    };

    // ATOMIC CREDIT DEDUCTION with Row-Level Lock in PostgreSQL
    const deductionResult = await walletService.deductCreditsForScript(
      req.user.userId,
      cost,
      actionDetails
    );

    // Generate production-grade ExtendScript code
    const generated = ExtendScriptService.generateScript({
      scriptType,
      presetId,
      scriptName,
      undoName,
      options,
      uiConfig,
      customCode
    });

    res.status(200).json({
      success: true,
      message: `Script generated successfully. Deducted ${cost} credit.`,
      fileName: generated.fileName,
      scriptCode: generated.scriptCode,
      rawExpression: generated.rawExpression || null,
      lineCount: generated.lineCount,
      remainingBalance: deductionResult.remainingBalance,
      historyId: deductionResult.historyId,
      timestamp: deductionResult.timestamp
    });
  } catch (err) {
    next(err);
  }
};

// 3. Get user's generation history log (Table D3)
const getHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const history = await walletService.getHistoryLogs(req.user.userId, limit);

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPresets,
  generateScript,
  getHistory
};
