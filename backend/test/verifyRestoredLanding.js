async function verifyRestoredLanding() {
  const html = await fetch('http://localhost:5000/').then(r => r.text());
  console.log('--- Restored Landing Page Verification ---');
  console.log('1. Contains "My Wallet":', html.includes('My Wallet'));
  console.log('2. Does NOT contain "Normalized 3NF Credit Wallet" heading:', !html.includes('<h4 class="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">Normalized 3NF Credit Wallet</h4>'));
  console.log('3. Frame window dots present:', html.includes('bg-red-500/80') && html.includes('bg-yellow-500/80') && html.includes('bg-green-500/80'));
  console.log('4. Panel builder frame icons present:', html.includes('fa-square-plus') && html.includes('fa-crosshairs') && html.includes('fa-bullseye'));
  console.log('5. Clean 4-studio grid present:', html.includes('Four Specialized Motion Studios') && html.includes('grid-cols-1 md:grid-cols-2 gap-7'));
  console.log('6. All navigation links intact:', html.includes('/panel-builder.html') && html.includes('/text-animator.html') && html.includes('/presets.html') && html.includes('/wallet.html'));
}

verifyRestoredLanding().catch(console.error);
