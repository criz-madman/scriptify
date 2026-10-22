/**
 * Scriptify - Universal Info / Legal / Contact Modal System
 * Handles Contact, Copyright, Privacy Policy, and Terms of Service.
 * Official Contact: christanjames07@gmail.com
 */

const InfoModal = (() => {
  const CONTACT_EMAIL = 'christanjames07@gmail.com';
  const VALID_TABS = ['contact', 'copyright', 'privacy', 'terms'];

  const switchTab = (tabName) => {
    if (!VALID_TABS.includes(tabName)) {
      if (tabName === 'privacy-policy') tabName = 'privacy';
      else if (tabName === 'terms-of-service') tabName = 'terms';
      else tabName = 'contact';
    }

    // Update Tab Buttons
    VALID_TABS.forEach(tab => {
      const btn = document.getElementById(`tab-btn-${tab}`);
      const content = document.getElementById(`info-tab-${tab}`);
      
      if (btn) {
        if (tab === tabName) {
          btn.className = 'info-tab-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 border border-orange-400/30';
        } else {
          btn.className = 'info-tab-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all text-zinc-400 hover:text-zinc-200 hover:bg-amber-500/10 border border-transparent';
        }
      }

      if (content) {
        if (tab === tabName) {
          content.classList.remove('hidden');
          content.classList.add('block');
        } else {
          content.classList.add('hidden');
          content.classList.remove('block');
        }
      }
    });

    // Reset scroll on content container
    const container = document.getElementById('info-modal-scroll');
    if (container) {
      container.scrollTop = 0;
    }

    // Update URL hash without causing a page jump
    if (history.replaceState) {
      history.replaceState(null, null, `#${tabName}`);
    }
  };

  const open = (tabName = 'contact') => {
    const modal = document.getElementById('info-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    switchTab(tabName);
  };

  const close = () => {
    const modal = document.getElementById('info-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');

    // Remove tab hash if present
    const currentHash = window.location.hash.toLowerCase().replace('#', '');
    if (VALID_TABS.includes(currentHash) || currentHash === 'privacy-policy' || currentHash === 'terms-of-service') {
      if (history.replaceState) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
      }
    }
  };

  const copyEmail = (btn) => {
    const originalHtml = btn ? btn.innerHTML : '';
    navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> <span class="text-emerald-300">Copied to Clipboard!</span>';
        btn.classList.add('border-emerald-500/50', 'bg-emerald-950/40');
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.classList.remove('border-emerald-500/50', 'bg-emerald-950/40');
        }, 2500);
      }
    }).catch(() => {
      // Fallback
      const tempInput = document.createElement('input');
      tempInput.value = CONTACT_EMAIL;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> <span class="text-emerald-300">Copied!</span>';
        setTimeout(() => { btn.innerHTML = originalHtml; }, 2500);
      }
    });
  };

  const handleMessageSubmit = (e) => {
    if (e) e.preventDefault();
    const nameEl = document.getElementById('contact-name-input');
    const emailEl = document.getElementById('contact-email-input');
    const subjectEl = document.getElementById('contact-subject-input');
    const messageEl = document.getElementById('contact-body-input');
    const statusEl = document.getElementById('contact-form-status');

    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const subject = subjectEl ? subjectEl.value.trim() : 'Scriptify Inquiry';
    const message = messageEl ? messageEl.value.trim() : '';

    if (!message) {
      if (statusEl) {
        statusEl.innerHTML = '<span class="text-rose-400 text-xs"><i class="fa-solid fa-circle-exclamation mr-1"></i>Please write a message before sending.</span>';
      }
      return;
    }

    const fullBody = `From: ${name || 'User'} (${email || 'No email provided'})\n\nMessage:\n${message}\n\nSent via Scriptify Studio Web Portal`;
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[Scriptify] ' + subject)}&body=${encodeURIComponent(fullBody)}`;

    // Try opening user's mail client
    window.location.href = mailtoUrl;

    if (statusEl) {
      statusEl.innerHTML = `
        <div class="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs space-y-1">
          <p class="font-bold flex items-center"><i class="fa-solid fa-circle-check mr-1.5 text-emerald-400"></i> Opened in your email client!</p>
          <p class="text-[11px] text-zinc-300">If your mail app didn't open automatically, you can email directly to <strong class="text-amber-300 font-mono select-all">${CONTACT_EMAIL}</strong></p>
        </div>
      `;
    }
  };

  const init = () => {
    // Backdrop click close
    const modal = document.getElementById('info-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          close();
        }
      });
    }

    // Escape key close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modalEl = document.getElementById('info-modal');
        if (modalEl && !modalEl.classList.contains('hidden')) {
          close();
        }
      }
    });

    // Check URL hash on load
    const checkHash = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (VALID_TABS.includes(hash) || hash === 'privacy-policy' || hash === 'terms-of-service') {
        open(hash);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
  };

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    open,
    close,
    switchTab,
    copyEmail,
    handleMessageSubmit,
    CONTACT_EMAIL
  };
})();

// Global shortcuts for inline HTML event handlers
window.openInfoModal = (tab) => InfoModal.open(tab);
window.closeInfoModal = () => InfoModal.close();
window.switchInfoTab = (tab) => InfoModal.switchTab(tab);
window.copyContactEmail = (btn) => InfoModal.copyEmail(btn);
window.handleContactSubmit = (e) => InfoModal.handleMessageSubmit(e);
