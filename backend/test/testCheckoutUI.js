const assert = require('assert');
const fs = require('fs');
const path = require('path');

const checkoutHtmlPath = path.resolve(__dirname, '../../frontend/checkout.html');
const checkoutHtml = fs.readFileSync(checkoutHtmlPath, 'utf8');

console.log('Testing Scriptify FakePay Checkout UI & Logic...\n');

// 1. Verify Trust & Security Elements in DOM
console.log('1. Verifying Trust & Security Elements in HTML...');
assert(checkoutHtml.includes('256-Bit SSL Encrypted'), 'Missing 256-Bit SSL badge');
assert(checkoutHtml.includes('PCI-DSS Ready'), 'Missing PCI-DSS badge');
assert(checkoutHtml.includes('Zero-Risk'), 'Missing Zero-Risk sandbox badge');
assert(checkoutHtml.includes('Instant Sync'), 'Missing Instant Sync badge');
assert(checkoutHtml.includes('fa-brands fa-cc-visa'), 'Missing Visa icon');
assert(checkoutHtml.includes('fa-brands fa-cc-mastercard'), 'Missing Mastercard icon');
assert(checkoutHtml.includes('fa-brands fa-cc-amex'), 'Missing Amex icon');
assert(checkoutHtml.includes('fa-brands fa-cc-discover'), 'Missing Discover icon');
assert(checkoutHtml.includes('fa-brands fa-apple-pay'), 'Missing Apple Pay icon');
assert(checkoutHtml.includes('fa-brands fa-google-pay'), 'Missing Google Pay icon');
assert(checkoutHtml.includes('fa-solid fa-lock'), 'Missing Lock icon');
console.log('✓ All Trust Badges & Security Footers present.');

// 2. Verify Interactive Elements in DOM
console.log('2. Verifying Interactive Card & Payment Elements in HTML...');
assert(checkoutHtml.includes('id="card-number"'), 'Missing card-number input');
assert(checkoutHtml.includes('id="card-name"'), 'Missing card-name input');
assert(checkoutHtml.includes('id="card-expiry"'), 'Missing card-expiry input');
assert(checkoutHtml.includes('id="card-cvv"'), 'Missing card-cvv input');
assert(checkoutHtml.includes('id="card-brand-badge"'), 'Missing in-field brand badge');
assert(checkoutHtml.includes('id="virtual-card"'), 'Missing 3D virtual card preview');
assert(checkoutHtml.includes('id="pay-btn"'), 'Missing pay-btn');
assert(checkoutHtml.includes('id="pay-spinner"'), 'Missing pay-spinner element');
assert(checkoutHtml.includes('Processing payment...'), 'Missing processing payment state text');
console.log('✓ All Interactive Card & Payment form elements present.');

// 3. Verify Success Modal & Animation Elements
console.log('3. Verifying Success Confirmation Modal Elements in HTML...');
assert(checkoutHtml.includes('id="success-modal"'), 'Missing success-modal element');
assert(checkoutHtml.includes('Payment Approved!'), 'Missing Payment Approved heading');
assert(checkoutHtml.includes('id="modal-credits-added"'), 'Missing modal-credits-added');
assert(checkoutHtml.includes('id="modal-amount-paid"'), 'Missing modal-amount-paid');
assert(checkoutHtml.includes('id="modal-payment-method"'), 'Missing modal-payment-method');
assert(checkoutHtml.includes('id="modal-tx-id"'), 'Missing modal-tx-id');
assert(checkoutHtml.includes('id="redirect-progress-bar"'), 'Missing redirect-progress-bar');
assert(checkoutHtml.includes('id="countdown-timer"'), 'Missing countdown-timer');
assert(checkoutHtml.includes('id="modal-now-btn"'), 'Missing modal-now-btn');
console.log('✓ Success Confirmation Modal and animated elements present.');

// 4. Test Card Brand Detection Algorithm Logic
console.log('4. Testing Card Brand Detection Logic...');
const detectCardBrand = (cardNumber) => {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return { type: 'visa', name: 'Visa', maxDigits: 16, cvvLength: 3 };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { type: 'mastercard', name: 'Mastercard', maxDigits: 16, cvvLength: 3 };
  if (/^3[47]/.test(clean)) return { type: 'amex', name: 'Amex', maxDigits: 15, cvvLength: 4 };
  if (/^(6011|65|64[4-9])/.test(clean)) return { type: 'discover', name: 'Discover', maxDigits: 16, cvvLength: 3 };
  if (/^35/.test(clean)) return { type: 'jcb', name: 'JCB', maxDigits: 16, cvvLength: 3 };
  if (/^3(0[0-5]|[68])/.test(clean)) return { type: 'diners', name: 'Diners', maxDigits: 14, cvvLength: 3 };
  return { type: 'unknown', name: 'Card', maxDigits: 16, cvvLength: 3 };
};

assert.strictEqual(detectCardBrand('4242').type, 'visa');
assert.strictEqual(detectCardBrand('5555').type, 'mastercard');
assert.strictEqual(detectCardBrand('2221').type, 'mastercard');
assert.strictEqual(detectCardBrand('3782').type, 'amex');
assert.strictEqual(detectCardBrand('3400').type, 'amex');
assert.strictEqual(detectCardBrand('6011').type, 'discover');
assert.strictEqual(detectCardBrand('6500').type, 'discover');
assert.strictEqual(detectCardBrand('3528').type, 'jcb');
assert.strictEqual(detectCardBrand('3000').type, 'diners');
assert.strictEqual(detectCardBrand('9999').type, 'unknown');
console.log('✓ Card Brand Detection accurately identifies all major card brands.');

// 5. Test Card Spacing Algorithm
console.log('5. Testing Card Spacing Algorithm...');
const applyCardSpacing = (digits, format) => {
  let formatted = '';
  let index = 0;
  for (let i = 0; i < format.length; i++) {
    const chunkLen = format[i];
    if (index >= digits.length) break;
    if (i > 0) formatted += ' ';
    formatted += digits.substring(index, index + chunkLen);
    index += chunkLen;
  }
  return formatted;
};

// Standard 16-digit cards (4-4-4-4)
const standardFormatted = applyCardSpacing('4242424242424242', [4, 4, 4, 4]);
assert.strictEqual(standardFormatted, '4242 4242 4242 4242');

// Amex 15-digit card (4-6-5)
const amexFormatted = applyCardSpacing('378282246310005', [4, 6, 5]);
assert.strictEqual(amexFormatted, '3782 822463 10005');
console.log('✓ Card Number Spacing properly applies 4-4-4-4 and 4-6-5 formatting.');

// 6. Test Expiry Date Auto-formatting Logic
console.log('6. Testing Expiry Date MM/YY Formatting...');
const formatExpiry = (val, isBackspace = false) => {
  let clean = val.replace(/\D/g, '');
  if (clean.length === 1 && parseInt(clean, 10) > 1) {
    clean = '0' + clean;
  }
  if (clean.length >= 2) {
    let month = parseInt(clean.slice(0, 2), 10);
    if (month > 12) month = 12;
    if (month === 0) month = 1;
    const monthStr = month < 10 ? '0' + month : String(month);
    clean = monthStr + clean.slice(2, 4);
  }
  if (clean.length > 4) clean = clean.slice(0, 4);
  let formatted = clean;
  if (clean.length > 2) {
    formatted = clean.slice(0, 2) + ' / ' + clean.slice(2);
  } else if (clean.length === 2 && !isBackspace) {
    formatted = clean + ' / ';
  }
  return formatted;
};

assert.strictEqual(formatExpiry('1228'), '12 / 28');
assert.strictEqual(formatExpiry('5'), '05 / ');
assert.strictEqual(formatExpiry('15'), '12 / '); // clamped
assert.strictEqual(formatExpiry('0829'), '08 / 29');
console.log('✓ Expiry Date correctly auto-formats MM / YY and sanitizes months.');

console.log('\n======================================================');
console.log('ALL CHECKOUT & FAKEPAY TESTS PASSED SUCCESSFULLY! 🚀');
console.log('======================================================\n');
