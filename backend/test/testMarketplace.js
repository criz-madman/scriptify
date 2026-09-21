const assert = require('assert');
const { query } = require('../src/config/db');
const marketplaceService = require('../src/services/marketplaceService');
const walletService = require('../src/services/walletService');

async function runMarketplaceTests() {
  console.log('Testing Digital Marketplace Service & Atomic Purchases...\n');

  try {
    // 1. Test Seed / Get Products
    const products = await marketplaceService.getProducts();
    assert(Array.isArray(products), 'Products must be an array');
    assert(products.length >= 6, `Should have at least 6 products, found ${products.length}`);
    console.log(`✓ Default catalog verified (${products.length} products available)`);

    // Verify categories
    const categories = [...new Set(products.map(p => p.category))];
    assert(categories.includes('script'), 'Must include script category');
    assert(categories.includes('plugin'), 'Must include plugin category');
    assert(categories.includes('project_file'), 'Must include project_file category');
    console.log(`✓ Categories verified: ${categories.join(', ')}`);

    // 2. Admin Create Product
    const newProd = await marketplaceService.createProduct({
      title: 'Test Keyframe Harmonizer',
      description: 'Aligns keyframes across multiple layers automatically.',
      category: 'script',
      creditPrice: 6,
      version: '1.0.0',
      author: 'QA Tester',
      instructions: '1. Place into Scripts/ScriptUI Panels.\n2. Open Window -> Harmonizer.',
      payloadCode: '// Keyframe Harmonizer ExtendScript\nalert("Harmonizer Ready");'
    });
    assert(newProd.productId, 'New product must have a productId');
    assert.strictEqual(newProd.creditPrice, 6);
    console.log(`✓ Admin product created: "${newProd.title}" (ID: ${newProd.productId})`);

    // 3. Setup test user & wallet
    const testEmail = `market_user_${Date.now()}@scriptify.dev`;
    const userRes = await query(
      'INSERT INTO "Users" ("email") VALUES ($1) RETURNING "userId"',
      [testEmail]
    );
    const userId = userRes.rows[0].userId;

    // Create wallet with 50 credits
    await query(
      'INSERT INTO "CreditWallet" ("userId", "balancePoints") VALUES ($1, $2)',
      [userId, 50]
    );
    console.log(`✓ Test user initialized with 50 credits (${testEmail})`);

    // 4. Test Purchase Product
    const purchaseRes = await marketplaceService.purchaseProduct(userId, newProd.productId);
    assert.strictEqual(purchaseRes.alreadyOwned, false);
    assert.strictEqual(purchaseRes.creditsDeducted, 6);
    assert.strictEqual(purchaseRes.remainingBalance, 44);
    console.log(`✓ Purchased product: 6 credits deducted. New balance: ${purchaseRes.remainingBalance}`);

    // Verify wallet in DB
    const balRes = await walletService.getBalance(userId);
    assert.strictEqual(balRes.balancePoints, 44);
    console.log(`✓ Wallet DB verified: balancePoints = 44`);

    // Verify purchases table
    const purchases = await marketplaceService.getUserPurchases(userId);
    assert.strictEqual(purchases.length, 1);
    assert.strictEqual(purchases[0].productId, newProd.productId);
    console.log(`✓ MarketplacePurchases verified: 1 product owned`);

    // 5. Duplicate purchase check (already owned)
    const secondPurchase = await marketplaceService.purchaseProduct(userId, newProd.productId);
    assert.strictEqual(secondPurchase.alreadyOwned, true);
    console.log(`✓ Duplicate purchase handled: alreadyOwned = true (no double charge)`);

    // 6. Insufficient balance test
    // Drain wallet to 2 credits
    await query('UPDATE "CreditWallet" SET "balancePoints" = 2 WHERE "userId" = $1', [userId]);
    const expensiveProd = products.find(p => p.creditPrice > 2);

    let threw = false;
    try {
      await marketplaceService.purchaseProduct(userId, expensiveProd.productId);
    } catch (err) {
      threw = true;
      assert.strictEqual(err.statusCode, 402, 'Must throw 402 Payment Required');
    }
    assert(threw, 'Should throw insufficient balance error');
    console.log(`✓ Insufficient balance properly rejected with HTTP 402`);

    // Clean up test user
    await query('DELETE FROM "Users" WHERE "userId" = $1', [userId]);

    console.log('\nAll Digital Marketplace tests passed successfully! 🎉\n');
    process.exit(0);
  } catch (err) {
    console.error('Marketplace test failed:', err);
    process.exit(1);
  }
}

runMarketplaceTests();
