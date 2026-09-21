async function testLandingPage() {
  const html = await fetch('http://localhost:5000/').then(r => r.text());
  console.log('--- Landing Page Glassmorphism Verification ---');
  console.log('1. Ambient glowing orbs present:', html.includes('animate-orb-1') && html.includes('animate-orb-2'));
  console.log('2. Pinterest-style glass pin cards:', html.includes('glass-pin-card'));
  console.log('3. Hover tilt left/right effects:', html.includes('hover-tilt-left') && html.includes('hover-tilt-right'));
  console.log('4. Gradient text accents:', html.includes('bg-gradient-to-r from-amber-200 via-orange-400 to-amber-500'));
  console.log('5. Navbar mount preserved:', html.includes('id="site-navbar"'));
  console.log('6. Favicon link preserved:', html.includes('scriptfy%20icon.png'));
  console.log('7. Panel Builder link preserved:', html.includes('href="/panel-builder.html"'));
  console.log('8. Text Animator link preserved:', html.includes('href="/text-animator.html"'));
  console.log('9. Marketplace link preserved:', html.includes('href="/presets.html"'));
  console.log('10. Wallet link preserved:', html.includes('href="/wallet.html"'));
}

testLandingPage().catch(console.error);
