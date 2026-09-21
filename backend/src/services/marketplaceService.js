const { query, getClient } = require('../config/db');

const DEFAULT_PRODUCTS = [
  {
    title: 'QuickStagger Pro',
    category: 'script',
    creditPrice: 5,
    version: '2.1.0',
    author: 'Scriptify Motion Lab',
    description: 'High-speed layer sequencer with customizable cubic easing, reverse stacking, and in/out-point boundary detection.',
    instructions: `### Installation & Application Guide

#### 1. File Placement
Copy **QuickStaggerPro.jsx** to your After Effects Scripts directory:
- **Windows**: \`C:\\Program Files\\Adobe\\Adobe After Effects <Version>\\Support Files\\Scripts\\ScriptUI Panels\\\`
- **macOS**: \`/Applications/Adobe After Effects <Version>/Scripts/ScriptUI Panels/\`

#### 2. After Effects Setup
1. Launch or restart Adobe After Effects.
2. In the top application menu, go to **Window** and scroll down to select **QuickStaggerPro.jsx**.
3. Dock the floating panel anywhere into your AE workspace (e.g. next to the Essential Graphics or Effects panel).

#### 3. How to Apply
1. Select 2 or more layers in your composition timeline.
2. Choose your frame offset step (e.g. 3 frames) and easing profile.
3. Click **Stagger Selected Layers**.`,
    payloadCode: `// QuickStagger Pro ExtendScript
(function() {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select an active composition.");
        return;
    }
    app.beginUndoGroup("QuickStagger Pro");
    var selected = comp.selectedLayers;
    if (selected.length < 2) {
        alert("Please select at least 2 layers to stagger.");
        app.endUndoGroup();
        return;
    }
    var step = 5 * comp.frameDuration;
    for (var i = 0; i < selected.length; i++) {
        selected[i].startTime = selected[0].startTime + (i * step);
    }
    app.endUndoGroup();
    alert("QuickStagger Pro: Staggered " + selected.length + " layers successfully!");
})();`
  },
  {
    title: 'AutoBounce & Inertial Elastic Rig',
    category: 'script',
    creditPrice: 8,
    version: '1.4.0',
    author: 'Motion Physics Studio',
    description: 'Procedural overshoot bounce expression engine. Creates natural physical squash and stretch on position, scale, and rotation.',
    instructions: `### Installation & Application Guide

#### 1. File Placement
- Save **AutoBounceRig.jsx** into:
  - **Windows**: \`C:\\Program Files\\Adobe\\Adobe After Effects <Version>\\Support Files\\Scripts\\ScriptUI Panels\\\`
  - **macOS**: \`/Applications/Adobe After Effects <Version>/Scripts/ScriptUI Panels/\`

#### 2. How to Apply
1. Select any layer property that contains 2 or more keyframes (e.g., Scale coming from 0% to 100%).
2. Open **Window → AutoBounceRig.jsx**.
3. Choose your dynamic profile (**Soft Rubber**, **Snappy Mechanical**, or **Jelly Fluid**).
4. Click **Apply Inertial Overshoot**.
5. Script automatically injects real-time decaying sine-wave physics expressions with master amplitude and frequency sliders.`,
    payloadCode: `// AutoBounce & Inertial Elastic Rig
(function() {
    var comp = app.project.activeItem;
    if (!comp) return;
    app.beginUndoGroup("Apply AutoBounce");
    var layers = comp.selectedLayers;
    if (layers.length === 0) {
        alert("Select at least one animated layer.");
        app.endUndoGroup();
        return;
    }
    var expr = 'var amp = 0.08; var freq = 3.5; var decay = 4.0;\\n' +
               'var n = 0; if (numKeys > 0) { n = nearestKey(time).index; if (key(n).time > time) n--; }\\n' +
               'if (n == 0) { t = 0; } else { t = time - key(n).time; }\\n' +
               'if (n > 0 && t < 1) { var v = velocityAtTime(key(n).time - thisComp.frameDuration/10); value + v*(amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t)); } else { value; }';
    for (var i = 0; i < layers.length; i++) {
        var props = layers[i].selectedProperties;
        for (var p = 0; p < props.length; p++) {
            if (props[p].canSetExpression) {
                props[p].expression = expr;
            }
        }
    }
    app.endUndoGroup();
    alert("AutoBounce physics expression successfully applied!");
})();`
  },
  {
    title: 'MotionPalette Pro CEP Extension',
    category: 'plugin',
    creditPrice: 15,
    version: '3.0.2',
    author: 'Scriptify Plugins Group',
    description: 'Full-featured dockable CEP HTML5 extension. Includes 300+ curated color palettes with one-click vector fill and stroke application.',
    instructions: `### Installation & Application Guide (CEP Extension)

#### Step 1: Allow Unsigned Panels (PlayerDebugMode)
Adobe requires enabling Developer Mode to load custom unsigned CEP extensions:
- **Windows**:
  1. Press \`Win + R\`, type \`regedit\`, and press Enter.
  2. Navigate to: \`HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.11\` (repeat for **CSXS.12** and **CSXS.13** if present).
  3. Right-click the right pane → **New → String Value**.
  4. Name it: \`PlayerDebugMode\`.
  5. Double-click it and set its value to \`1\`.
- **macOS**:
  1. Open Terminal and execute:
     \`defaults write com.adobe.CSXS.11 PlayerDebugMode 1\`
     \`defaults write com.adobe.CSXS.12 PlayerDebugMode 1\`

#### Step 2: Unzip into CEP Extensions Directory
Place the extracted extension folder into the Adobe CEP extensions directory:
- **Windows**: \`C:\\Users\\<YourUsername>\\AppData\\Roaming\\Adobe\\CEP\\extensions\\MotionPalettePro\\\`
- **macOS**: \`~/Library/Application Support/Adobe/CEP/extensions/MotionPalettePro/\`
> **CRITICAL PATH STRUCTURE**: Ensure the path ends correctly without nesting:
> \`...\\extensions\\MotionPalettePro\\CSXS\\manifest.xml\` (One folder deep, **NO** nested folders like \`MotionPalettePro\\MotionPalettePro\\CSXS\`).

#### Step 3: Launch in After Effects
1. Restart Adobe After Effects completely.
2. Go to the top menu: **Window → Extensions → MotionPalette Pro**.
3. Dock the panel and pick color themes for instant application.`,
    payloadCode: `// MotionPalette Pro Extension Manifest & Loader
// Version 3.0.2
// Extract the attached ZIP into your CEP extensions directory as outlined in the installation guide.`
  },
  {
    title: 'Cinematic 3D Camera Rig & Dolly Zoom',
    category: 'script',
    creditPrice: 10,
    version: '1.2.0',
    author: 'CineMotion FX',
    description: 'Instant professional two-node 3D camera controller with auto-focus tracking plane, focal length calculator, and vertigo dolly zoom.',
    instructions: `### Installation & Application Guide

#### 1. File Placement
- Save **CinematicCameraRig.jsx** into:
  - **Windows**: \`C:\\Program Files\\Adobe\\Adobe After Effects <Version>\\Support Files\\Scripts\\ScriptUI Panels\\\`
  - **macOS**: \`/Applications/Adobe After Effects <Version>/Scripts/ScriptUI Panels/\`

#### 2. How to Apply
1. In After Effects, open **Window → CinematicCameraRig.jsx**.
2. Click **Build Two-Node Rig**.
3. The script automatically creates a 35mm / 50mm Camera linked to:
   - **Cam_Master_Position**: Controls global camera orbit.
   - **Cam_Focus_Target**: Controls point-of-interest and auto-calculates depth-of-field focus distance.
4. Toggle the **Vertigo Effect** checkbox to calculate synchronized zoom-out / dolly-in perspective shifts.`,
    payloadCode: `// Cinematic 3D Camera Rig
(function() {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Select an active composition first.");
        return;
    }
    app.beginUndoGroup("Build Cinematic Camera Rig");
    var cam = comp.layers.addCamera("Cinematic Master Cam", [comp.width/2, comp.height/2]);
    var targetNull = comp.layers.addNull(comp.duration);
    targetNull.name = "Cam_Focus_Target";
    targetNull.threeDLayer = true;
    targetNull.guideLayer = true;
    targetNull.position.setValue([comp.width/2, comp.height/2, 0]);

    var posNull = comp.layers.addNull(comp.duration);
    posNull.name = "Cam_Orbit_Controller";
    posNull.threeDLayer = true;
    posNull.guideLayer = true;
    posNull.position.setValue([comp.width/2, comp.height/2, -1500]);

    cam.parent = posNull;
    cam.pointOfInterest.expression = 'thisComp.layer("Cam_Focus_Target").transform.position;';
    app.endUndoGroup();
    alert("Cinematic 3D Camera Rig Created!");
})();`
  },
  {
    title: 'Modular Kinetic Title Cards 4K Pack',
    category: 'project_file',
    creditPrice: 20,
    version: '2.0.0',
    author: 'Scriptify Motion Lab',
    description: '20 clean, modern kinetic typography title card comps in 4K resolution with responsive duration markers and Essential Graphics controllers.',
    instructions: `### Installation & Application Guide

#### 1. Project Setup
1. Unzip the downloaded package and open **Modular_Titles_4K.aep** in Adobe After Effects 2020 or higher.
2. In the Project panel, expand the folder **01_Title_Cards**.
3. Choose from **Title_01** through **Title_20**.

#### 2. Customization via Essential Graphics
1. Go to **Window → Essential Graphics**.
2. Select your chosen title comp in the dropdown.
3. Edit typography, text strings, accent colors, and background opacity directly in the controller sliders.
4. No manual keyframe adjusting needed; animations dynamically adapt to your timing!`,
    payloadCode: `// Modular Kinetic Titles 4K - Template Structure
// Compatible with After Effects 2020 - 2026.
// Contains 20 Essential Graphics enabled modular comps.`
  },
  {
    title: 'Seamless Looping Particle Burst System',
    category: 'project_file',
    creditPrice: 12,
    version: '1.1.0',
    author: 'VFX Vector Labs',
    description: '100% native particle explosion and burst simulation rig. No 3rd-party plugins required (Trapcode Particular not needed).',
    instructions: `### Installation & Application Guide

#### 1. How to Use
1. Import **Seamless_Particle_Burst.aep** into your existing After Effects project.
2. Drag the **[RENDER_BURST_COMP]** composition into your main timeline.
3. Set the blend mode to **Screen** or **Add**.

#### 2. Parameter Control
1. Expand the master **Particle_Controller** layer.
2. Adjust the Slider Controls in the Effect Controls panel:
   - **Particle Count**: Control density (100 - 5000).
   - **Gravity & Resistance**: Set air drag and physics falloff.
   - **Color Spectrum**: Custom dual-gradient tint generator.`,
    payloadCode: `// Seamless Looping Particle Burst System
// Built with native CC Particle World & Shape Emitters.
// 100% resolution-independent vector physics.`
  }
];

/**
 * Ensures marketplace tables exist and default seed catalog is populated
 */
const seedDefaultProducts = async () => {
  try {
    // Check if MarketplaceProducts table has any rows
    const res = await query('SELECT COUNT(*) as count FROM "MarketplaceProducts"');
    const count = parseInt(res.rows[0].count, 10);

    if (count === 0) {
      console.log('[Marketplace] Catalog empty. Seeding default digital products...');
      for (const prod of DEFAULT_PRODUCTS) {
        await query(
          `INSERT INTO "MarketplaceProducts" 
            ("title", "description", "category", "creditPrice", "instructions", "payloadCode", "version", "author")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            prod.title,
            prod.description,
            prod.category,
            prod.creditPrice,
            prod.instructions,
            prod.payloadCode,
            prod.version,
            prod.author
          ]
        );
      }
      console.log(`[Marketplace] Successfully seeded ${DEFAULT_PRODUCTS.length} digital products.`);
    }
  } catch (err) {
    console.warn('[Marketplace] Seed check warning:', err.message);
  }
};

/**
 * Get all marketplace products with optional filtering and purchase status
 */
const getProducts = async ({ category, search, userId } = {}) => {
  await seedDefaultProducts();

  let sql = `
    SELECT 
      p."productId",
      p."title",
      p."description",
      p."category",
      p."creditPrice",
      p."version",
      p."author",
      p."createdAt",
      p."instructions",
      CASE WHEN pur."purchaseId" IS NOT NULL THEN TRUE ELSE FALSE END as "isPurchased"
    FROM "MarketplaceProducts" p
    LEFT JOIN "MarketplacePurchases" pur 
      ON p."productId" = pur."productId" AND pur."userId" = $1
    WHERE 1=1
  `;
  const params = [userId || null];

  if (category && category !== 'all') {
    params.push(category);
    sql += ` AND p."category" = $${params.length}`;
  }

  if (search && search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    sql += ` AND (LOWER(p."title") LIKE $${params.length} OR LOWER(p."description") LIKE $${params.length})`;
  }

  sql += ` ORDER BY p."createdAt" DESC`;

  const result = await query(sql, params);
  return result.rows;
};

/**
 * Get single product by ID
 */
const getProductById = async (productId, userId = null) => {
  const sql = `
    SELECT 
      p.*,
      CASE WHEN pur."purchaseId" IS NOT NULL THEN TRUE ELSE FALSE END as "isPurchased"
    FROM "MarketplaceProducts" p
    LEFT JOIN "MarketplacePurchases" pur 
      ON p."productId" = pur."productId" AND pur."userId" = $2
    WHERE p."productId" = $1
  `;
  const res = await query(sql, [productId, userId]);
  return res.rows[0] || null;
};

/**
 * Atomically purchase a product using credit wallet deduction
 * Guarantees strict 3NF consistency and ACID rollback on error
 */
const purchaseProduct = async (userId, productId) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Fetch product
    const prodRes = await client.query(
      'SELECT * FROM "MarketplaceProducts" WHERE "productId" = $1',
      [productId]
    );

    if (prodRes.rows.length === 0) {
      throw { statusCode: 404, message: 'Marketplace product not found.' };
    }

    const product = prodRes.rows[0];
    const cost = product.creditPrice;

    // 2. Check if already purchased
    const existingPur = await client.query(
      'SELECT * FROM "MarketplacePurchases" WHERE "userId" = $1 AND "productId" = $2',
      [userId, productId]
    );

    if (existingPur.rows.length > 0) {
      // User already owns this product
      await client.query('COMMIT');
      return {
        alreadyOwned: true,
        product,
        remainingBalance: null
      };
    }

    // 3. Lock user wallet with row-level lock (FOR UPDATE)
    const walletRes = await client.query(
      'SELECT "walletId", "balancePoints" FROM "CreditWallet" WHERE "userId" = $1 FOR UPDATE',
      [userId]
    );

    if (walletRes.rows.length === 0) {
      throw { statusCode: 404, message: 'Credit wallet not found for user.' };
    }

    const currentBalance = walletRes.rows[0].balancePoints;

    // 4. Verify sufficient balance
    if (currentBalance < cost) {
      throw {
        statusCode: 402,
        message: `Insufficient credits. Required: ${cost}, Available: ${currentBalance}. Please top up your wallet.`
      };
    }

    const newBalance = currentBalance - cost;

    // 5. Deduct credits
    await client.query(
      'UPDATE "CreditWallet" SET "balancePoints" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "userId" = $2',
      [newBalance, userId]
    );

    // 6. Record purchase in MarketplacePurchases (Table D6)
    await client.query(
      `INSERT INTO "MarketplacePurchases" ("userId", "productId", "creditsSpent")
       VALUES ($1, $2, $3)`,
      [userId, productId, cost]
    );

    // 7. Record transaction audit in HistoryLog (Table D3)
    const logPayload = {
      action: 'marketplace_purchase',
      productId: product.productId,
      productTitle: product.title,
      category: product.category,
      creditsDeducted: cost,
      previousBalance: currentBalance,
      remainingBalance: newBalance,
      timestamp: new Date().toISOString()
    };

    await client.query(
      `INSERT INTO "HistoryLog" ("userId", "actionDetails") 
       VALUES ($1, $2)`,
      [userId, JSON.stringify(logPayload)]
    );

    await client.query('COMMIT');

    return {
      alreadyOwned: false,
      product,
      creditsDeducted: cost,
      remainingBalance: newBalance
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Admin: Add a new marketplace product
 */
const createProduct = async ({ title, description, category, creditPrice, instructions, payloadCode, version, author }) => {
  if (!title || !description || !category || creditPrice === undefined || !instructions) {
    throw { statusCode: 400, message: 'Title, description, category, creditPrice, and instructions are required.' };
  }

  const validCategories = ['script', 'plugin', 'project_file'];
  if (!validCategories.includes(category)) {
    throw { statusCode: 400, message: `Category must be one of: ${validCategories.join(', ')}` };
  }

  const price = parseInt(creditPrice, 10);
  if (isNaN(price) || price < 0) {
    throw { statusCode: 400, message: 'creditPrice must be a non-negative integer.' };
  }

  const res = await query(
    `INSERT INTO "MarketplaceProducts" 
      ("title", "description", "category", "creditPrice", "instructions", "payloadCode", "version", "author")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      title.trim(),
      description.trim(),
      category,
      price,
      instructions.trim(),
      payloadCode ? payloadCode.trim() : null,
      version ? version.trim() : '1.0.0',
      author ? author.trim() : 'Scriptify Creator'
    ]
  );

  return res.rows[0];
};

/**
 * Get all purchases for a user
 */
const getUserPurchases = async (userId) => {
  const sql = `
    SELECT 
      pur."purchaseId",
      pur."creditsSpent",
      pur."purchasedAt",
      p."productId",
      p."title",
      p."description",
      p."category",
      p."version",
      p."instructions",
      p."payloadCode"
    FROM "MarketplacePurchases" pur
    JOIN "MarketplaceProducts" p ON pur."productId" = p."productId"
    WHERE pur."userId" = $1
    ORDER BY pur."purchasedAt" DESC
  `;
  const res = await query(sql, [userId]);
  return res.rows;
};

module.exports = {
  seedDefaultProducts,
  getProducts,
  getProductById,
  purchaseProduct,
  createProduct,
  getUserPurchases
};
