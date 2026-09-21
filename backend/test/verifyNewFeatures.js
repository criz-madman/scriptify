async function verify() {
  const [favRes, iconRes, taHtml, pbJs] = await Promise.all([
    fetch('http://localhost:5000/favicon.ico'),
    fetch('http://localhost:5000/myimages/scriptfy%20icon.png'),
    fetch('http://localhost:5000/text-animator').then(r => r.text()),
    fetch('http://localhost:5000/js/panelBuilder.js').then(r => r.text())
  ]);

  console.log('--- Scriptify New Features Verification ---');
  console.log('1. Favicon /favicon.ico status:', favRes.status);
  console.log('2. Favicon /myimages/scriptfy icon.png status:', iconRes.status);
  console.log('3. Text Animator has Skew:', taHtml.includes('value="skew"'));
  console.log('4. Text Animator has Blur:', taHtml.includes('value="blur"'));
  console.log('5. Text Animator has Tracking:', taHtml.includes('value="tracking"'));
  console.log('6. Text Animator has Character Offset:', taHtml.includes('value="characterOffset"'));
  console.log('7. Text Animator has Stroke Width:', taHtml.includes('value="strokeWidth"'));
  console.log('8. Text Animator has Custom Studio button:', taHtml.includes('id="ta-mode-custom-btn"'));
  console.log('9. Text Animator has Custom Expr Textarea:', taHtml.includes('id="ta-custom-expr-input"'));
  console.log('10. Panel Builder Compact Mode is Icon-Only:', pbJs.includes("buttonSize === 'compact' ? '' : `<span class=\"truncate\">"));
}

verify().catch(console.error);
