/**
 * Scriptify Universal Navigation Bar
 * Features Custom Logo, Amber/Orange Glow aesthetic, and responsive links
 */

const Navbar = (() => {
  const mount = (activePage = 'home') => {
    const target = document.getElementById('site-navbar');
    if (!target) return;

    const navItems = [
      { id: 'explore', label: 'Explore', href: '/explore', icon: 'fa-compass' },
      { id: 'panel-builder', label: 'UI Panel Builder', href: '/panel-builder', icon: 'fa-shapes' },
      { id: 'text-animator', label: 'Text Animator', href: '/text-animator', icon: 'fa-font' },
      { id: 'presets', label: 'Marketplace', href: '/presets', icon: 'fa-store' },
      { id: 'wallet', label: 'Credits & Wallet', href: '/wallet', icon: 'fa-wallet' }
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
            <a href="/wallet" title="Manage Credits" class="flex items-center bg-[#140e06]/90 border border-amber-500/30 hover:border-orange-500/60 rounded-full p-1 transition-all group shadow-sm">
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
            <a href="/login" id="nav-btn-login" class="btn-amber-outline px-4 py-1.5 text-zinc-200 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm">
              <i class="fa-regular fa-user text-amber-400"></i>
              <span>Sign In</span>
            </a>

            <!-- Authenticated User Profile Link (Icon Only) -->
            <a href="/profile" id="nav-user-badge" title="View Profile" class="hidden w-9 h-9 rounded-full bg-[#140e06]/90 border border-amber-500/35 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center group shadow-sm cursor-pointer overflow-hidden p-0.5">
              <div class="w-full h-full rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-inner overflow-hidden" id="nav-avatar-container">
                <i class="fa-solid fa-user text-[11px]" id="nav-default-icon"></i>
                <img id="nav-user-avatar" src="" alt="Avatar" class="w-full h-full object-cover hidden">
              </div>
            </a>

          </div>
        </div>
      </header>
    `;

    // Hook session state
    syncSession();

    // Hook into Firebase to get avatar
    const checkFirebaseAvatar = () => {
      if (window.FirebaseBridge && typeof window.FirebaseBridge.onAuthStateChanged === 'function') {
        window.FirebaseBridge.onAuthStateChanged((user) => {
          if (user && user.photoURL) {
            localStorage.setItem('scriptify_user_avatar', user.photoURL);
            const avatarImg = document.getElementById('nav-user-avatar');
            const defaultIcon = document.getElementById('nav-default-icon');
            if (avatarImg) {
              avatarImg.src = user.photoURL;
              avatarImg.classList.remove('hidden');
              if (defaultIcon) defaultIcon.classList.add('hidden');
            }
          }
        });
      }
    };

    if (window.FirebaseBridge) {
      checkFirebaseAvatar();
    } else {
      window.addEventListener('firebase:ready', checkFirebaseAvatar, { once: true });
    }

    // Global function to update navbar avatar immediately on profile page
    window.updateNavbarAvatar = (url) => {
      const avatarImg = document.getElementById('nav-user-avatar');
      const defaultIcon = document.getElementById('nav-default-icon');
      if (avatarImg && url) {
        avatarImg.src = url;
        avatarImg.classList.remove('hidden');
        if (defaultIcon) defaultIcon.classList.add('hidden');
      }
      if (url) localStorage.setItem('scriptify_user_avatar', url);
    };
  };

  const syncSession = async () => {
    const btnLogin = document.getElementById('nav-btn-login');
    const userBadge = document.getElementById('nav-user-badge');
    const balanceDisplay = document.getElementById('nav-wallet-balance');

    if (!API.isAuthenticated()) {
      if (btnLogin) btnLogin.classList.remove('hidden');
      if (userBadge) userBadge.classList.add('hidden');
      if (balanceDisplay) balanceDisplay.textContent = '0';
      return;
    }

    try {
      const data = await API.get('/api/auth/me');
      if (btnLogin) btnLogin.classList.add('hidden');
      if (userBadge) {
        userBadge.classList.remove('hidden');
        const userEmail = data.user && data.user.email ? data.user.email : '';
        if (userEmail) {
          userBadge.title = `Profile (${userEmail})`;
        }

        const avatarImg = document.getElementById('nav-user-avatar');
        const defaultIcon = document.getElementById('nav-default-icon');
        const cachedAvatar = localStorage.getItem('scriptify_user_avatar');

        if (avatarImg) {
          if (cachedAvatar) {
            avatarImg.src = cachedAvatar;
            avatarImg.classList.remove('hidden');
            if (defaultIcon) defaultIcon.classList.add('hidden');
          } else if (userEmail) {
            const initial = userEmail.charAt(0).toUpperCase();
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=f59e0b&color=070503&bold=true&size=128`;
            avatarImg.classList.remove('hidden');
            if (defaultIcon) defaultIcon.classList.add('hidden');
          }
        }
      }
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
