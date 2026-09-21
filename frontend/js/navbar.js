/**
 * Scriptify Universal Navigation Bar
 * Features Custom Logo, Amber/Orange Glow aesthetic, and responsive links
 */

const Navbar = (() => {
  const mount = (activePage = 'home') => {
    const target = document.getElementById('site-navbar');
    if (!target) return;

    const navItems = [
      { id: 'home', label: 'Home', href: '/', icon: 'fa-house' },
      { id: 'dashboard', label: 'Tools Hub', href: '/dashboard.html', icon: 'fa-gauge-high' },
      { id: 'panel-builder', label: 'UI Panel Builder', href: '/panel-builder.html', icon: 'fa-shapes' },
      { id: 'text-animator', label: 'Text Animator', href: '/text-animator.html', icon: 'fa-font' },
      { id: 'presets', label: 'Marketplace', href: '/presets.html', icon: 'fa-store' },
      { id: 'wallet', label: 'Credits & Wallet', href: '/wallet.html', icon: 'fa-wallet' }
    ];

    target.innerHTML = `
      <header class="border-b border-amber-500/20 bg-[#0c0803]/85 backdrop-blur-2xl sticky top-0 z-50 px-5 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
        <div class="max-w-[1600px] mx-auto flex items-center justify-between">
          
          <!-- Brand Logo (Clean, No Stroke, No Amber Glow, No Duplicate Text) -->
          <div class="flex items-center space-x-6">
            <a href="/" class="flex items-center group py-0.5" title="Scriptify">
              <img 
                src="/images/logo.png" 
                alt="Scriptify" 
                class="h-8 sm:h-9 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
              >
            </a>

            <!-- Navigation Links -->
            <nav class="hidden lg:flex items-center space-x-1 bg-[#140e06]/80 p-1.5 rounded-full border border-amber-500/20 shadow-inner">
              ${navItems.map(item => {
                const isActive = item.id === activePage;
                return `
                  <a 
                    href="${item.href}" 
                    class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5
                      ${isActive 
                        ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-md shadow-orange-500/30 border border-orange-400/40' 
                        : 'text-zinc-400 hover:text-amber-200 hover:bg-orange-500/10'}"
                  >
                    <i class="fa-solid ${item.icon} text-xs"></i>
                    <span>${item.label}</span>
                  </a>
                `;
              }).join('')}
            </nav>
          </div>

          <!-- Right: Live Credit Wallet Badge & Auth State -->
          <div class="flex items-center space-x-3">
            
            <!-- Credit Wallet Widget -->
            <a href="/wallet.html" title="Manage Credits" class="flex items-center bg-[#140e06]/90 border border-amber-500/30 hover:border-orange-500/60 rounded-full p-1 transition-all group shadow-sm">
              <div class="px-3 py-1 flex items-center space-x-2">
                <i class="fa-solid fa-bolt text-amber-400 text-xs animate-pulse-subtle"></i>
                <span class="text-xs font-bold text-zinc-100 group-hover:text-amber-200 font-mono" id="nav-wallet-balance">--</span>
                <span class="text-[10px] text-zinc-400 uppercase font-mono hidden sm:inline">Credits</span>
              </div>
              <span class="px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 group-hover:from-orange-500 group-hover:to-amber-500 text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/30 flex items-center space-x-1">
                <i class="fa-solid fa-plus text-[10px]"></i>
                <span class="hidden sm:inline">Top Up</span>
              </span>
            </a>

            <!-- Unauthenticated Sign In Button -->
            <a href="/login.html" id="nav-btn-login" class="btn-amber-outline px-4 py-1.5 text-zinc-200 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm">
              <i class="fa-regular fa-user text-amber-400"></i>
              <span>Sign In</span>
            </a>

            <!-- Authenticated User Profile Dropdown -->
            <div id="nav-user-badge" class="hidden flex items-center space-x-2 bg-[#140e06]/90 border border-amber-500/30 rounded-full py-1 px-3">
              <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                <i class="fa-solid fa-user"></i>
              </div>
              <span id="nav-user-email" class="text-xs text-zinc-300 font-medium max-w-[130px] truncate"></span>
              <button id="nav-btn-logout" title="Sign Out" class="text-zinc-500 hover:text-rose-400 text-xs ml-1 transition-colors">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>

          </div>
        </div>
      </header>
    `;

    // Hook session state
    syncSession();
  };

  const syncSession = async () => {
    const btnLogin = document.getElementById('nav-btn-login');
    const userBadge = document.getElementById('nav-user-badge');
    const userEmail = document.getElementById('nav-user-email');
    const btnLogout = document.getElementById('nav-btn-logout');
    const balanceDisplay = document.getElementById('nav-wallet-balance');

    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        if (window.FirebaseBridge && typeof window.FirebaseBridge.logoutFirebase === 'function') {
          try { await window.FirebaseBridge.logoutFirebase(); } catch (e) {}
        }
        API.removeToken();
        window.location.href = '/';
      });
    }

    if (!API.isAuthenticated()) {
      if (btnLogin) btnLogin.classList.remove('hidden');
      if (userBadge) userBadge.classList.add('hidden');
      if (balanceDisplay) balanceDisplay.textContent = '0';
      return;
    }

    try {
      const data = await API.get('/api/auth/me');
      if (btnLogin) btnLogin.classList.add('hidden');
      if (userBadge) userBadge.classList.remove('hidden');
      if (userEmail) userEmail.textContent = data.user.email;
      if (balanceDisplay) balanceDisplay.textContent = data.walletBalance ?? '0';
    } catch (err) {
      API.removeToken();
      if (btnLogin) btnLogin.classList.remove('hidden');
      if (userBadge) userBadge.classList.add('hidden');
      if (balanceDisplay) balanceDisplay.textContent = '0';
    }
  };

  return {
    mount,
    syncSession
  };
})();
