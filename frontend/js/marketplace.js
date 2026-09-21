/**
 * Scriptify Digital Marketplace Client
 * Handles catalog browsing, category filtering, search, atomic credit purchases,
 * installation guide inspection, and admin product management.
 */

const Marketplace = (() => {
  let allProducts = [];
  let currentCategory = 'all';
  let searchQuery = '';
  let activeProductForPurchase = null;
  let activeProductForGuide = null;

  // DOM Elements
  const productsGrid = document.getElementById('market-products-grid');
  const searchInput = document.getElementById('market-search-input');
  const categoryTabs = document.querySelectorAll('[data-cat-tab]');
  const activeBalanceDisplay = document.getElementById('market-wallet-balance');
  const emptyState = document.getElementById('market-empty-state');

  // Modals
  const guideModal = document.getElementById('market-guide-modal');
  const purchaseModal = document.getElementById('market-purchase-modal');
  const adminModal = document.getElementById('market-admin-modal');

  // Load products from API
  const loadProducts = async () => {
    try {
      if (productsGrid) {
        productsGrid.innerHTML = `
          <div class="col-span-full py-16 text-center text-zinc-400">
            <i class="fa-solid fa-spinner fa-spin text-amber-400 text-2xl mb-3"></i>
            <p class="text-xs">Loading marketplace catalog...</p>
          </div>
        `;
      }

      const res = await API.get('/api/marketplace/products');
      allProducts = res.products || [];
      renderProducts();
      updateWalletBalance();
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
      if (productsGrid) {
        productsGrid.innerHTML = `
          <div class="col-span-full py-16 text-center text-rose-400">
            <i class="fa-solid fa-triangle-exclamation text-2xl mb-3"></i>
            <p class="text-xs">Error loading catalog: ${err.message}</p>
          </div>
        `;
      }
    }
  };

  // Sync user balance display
  const updateWalletBalance = async () => {
    if (!API.isAuthenticated()) {
      if (activeBalanceDisplay) activeBalanceDisplay.textContent = '0';
      return;
    }
    try {
      const data = await API.get('/api/wallet/balance');
      if (activeBalanceDisplay) {
        activeBalanceDisplay.textContent = data.wallet.balancePoints ?? '0';
      }
      Navbar.syncSession();
    } catch (e) {
      console.warn('Could not update wallet balance:', e);
    }
  };

  // Category Icon & Badge Helper
  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'script':
        return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1"><i class="fa-solid fa-code text-[9px]"></i><span>ExtendScript (.jsx)</span></span>`;
      case 'plugin':
        return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center space-x-1"><i class="fa-solid fa-puzzle-piece text-[9px]"></i><span>CEP Extension</span></span>`;
      case 'project_file':
        return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 flex items-center space-x-1"><i class="fa-solid fa-folder-open text-[9px]"></i><span>AE Project (.aep)</span></span>`;
      default:
        return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">${cat}</span>`;
    }
  };

  // Render product cards
  const renderProducts = () => {
    if (!productsGrid) return;

    let filtered = allProducts;

    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        (p.author && p.author.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    productsGrid.innerHTML = filtered.map(product => {
      const isOwned = product.isPurchased;
      return `
        <div class="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between border border-zinc-800/80 hover:border-amber-500/40 transition-all shadow-xl group">
          <div>
            <!-- Top Badges & Version -->
            <div class="flex items-center justify-between gap-2 mb-3">
              ${getCategoryBadge(product.category)}
              <span class="text-[10px] font-mono text-zinc-400 bg-black/60 px-2 py-0.5 rounded border border-zinc-800">
                v${product.version || '1.0.0'}
              </span>
            </div>

            <!-- Title & Author -->
            <h3 class="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
              ${product.title}
            </h3>
            <span class="text-[11px] text-zinc-400 font-medium block mt-0.5">
              by ${product.author || 'Scriptify Official'}
            </span>

            <!-- Description -->
            <p class="text-xs text-zinc-300 mt-3 leading-relaxed line-clamp-3">
              ${product.description}
            </p>
          </div>

          <!-- Card Footer & Pricing -->
          <div class="mt-6 pt-4 border-t border-amber-500/15 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Price</span>
              <div class="flex items-center space-x-1.5">
                <i class="fa-solid fa-bolt text-amber-400 text-xs"></i>
                <span class="text-lg font-black text-white font-mono">${product.creditPrice}</span>
                <span class="text-xs text-zinc-400 font-mono">Credits</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button 
                data-open-guide="${product.productId}"
                class="btn-amber-outline py-2.5 px-3 text-xs font-semibold flex items-center justify-center space-x-1.5"
              >
                <i class="fa-solid fa-book-open text-amber-400"></i>
                <span>Setup Guide</span>
              </button>

              ${isOwned ? `
                <button 
                  data-download-prod="${product.productId}"
                  class="px-3 py-2.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center space-x-1.5 hover:bg-emerald-500/30 transition-all shadow-sm"
                >
                  <i class="fa-solid fa-check"></i>
                  <span>Owned &bull; Download</span>
                </button>
              ` : `
                <button 
                  data-purchase-prod="${product.productId}"
                  class="btn-amber-pill py-2.5 px-3 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-orange-500/20"
                >
                  <i class="fa-solid fa-cart-shopping"></i>
                  <span>Buy Product</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners
    productsGrid.querySelectorAll('[data-open-guide]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open-guide');
        const prod = allProducts.find(p => p.productId === id);
        if (prod) openGuideModal(prod);
      });
    });

    productsGrid.querySelectorAll('[data-purchase-prod]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-purchase-prod');
        const prod = allProducts.find(p => p.productId === id);
        if (prod) openPurchaseModal(prod);
      });
    });

    productsGrid.querySelectorAll('[data-download-prod]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-download-prod');
        const prod = allProducts.find(p => p.productId === id);
        if (prod) downloadProductPayload(prod);
      });
    });
  };

  // Open Guide Modal
  const openGuideModal = (product) => {
    activeProductForGuide = product;
    if (!guideModal) return;

    document.getElementById('guide-modal-title').textContent = product.title;
    document.getElementById('guide-modal-cat').innerHTML = getCategoryBadge(product.category);
    document.getElementById('guide-modal-version').textContent = `v${product.version || '1.0.0'}`;

    // Render formatted markdown instructions
    const rawInst = product.instructions || 'No special instructions provided.';
    const formattedHtml = rawInst
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-amber-300 mt-4 mb-2 pb-1 border-b border-zinc-800">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="text-xs font-bold text-zinc-100 mt-3 mb-1">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-[#0e0a05] text-amber-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-amber-500/20">$1</code>')
      .replace(/^\> (.*$)/gim, '<blockquote class="p-3 my-2 rounded-xl bg-orange-950/40 border border-orange-500/30 text-xs text-zinc-300">$1</blockquote>')
      .replace(/\n\n/g, '<br/>');

    document.getElementById('guide-modal-content').innerHTML = formattedHtml;

    // Show or hide download button inside guide
    const dlBtn = document.getElementById('guide-modal-download-btn');
    if (dlBtn) {
      if (product.isPurchased) {
        dlBtn.classList.remove('hidden');
        dlBtn.onclick = () => downloadProductPayload(product);
      } else {
        dlBtn.classList.add('hidden');
      }
    }

    guideModal.classList.remove('hidden');
  };

  const closeGuideModal = () => {
    if (guideModal) guideModal.classList.add('hidden');
  };

  // Open Purchase Modal
  const openPurchaseModal = async (product) => {
    if (!API.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }

    activeProductForPurchase = product;
    if (!purchaseModal) return;

    document.getElementById('purchase-modal-title').textContent = product.title;
    document.getElementById('purchase-modal-price').textContent = product.creditPrice;
    
    // Fetch fresh balance
    try {
      const balRes = await API.get('/api/wallet/balance');
      const curBal = balRes.wallet.balancePoints ?? 0;
      document.getElementById('purchase-modal-cur-balance').textContent = curBal;
      
      const newBal = curBal - product.creditPrice;
      const newBalEl = document.getElementById('purchase-modal-new-balance');
      newBalEl.textContent = newBal >= 0 ? newBal : 'Insufficient';
      newBalEl.className = newBal >= 0 ? 'text-emerald-400 font-mono font-bold' : 'text-rose-400 font-mono font-bold';

      const confirmBtn = document.getElementById('purchase-modal-confirm-btn');
      if (newBal < 0) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `Insufficient Balance &bull; Top Up First`;
        confirmBtn.className = 'w-full py-3 rounded-full bg-zinc-800 text-zinc-500 font-bold text-xs cursor-not-allowed';
      } else {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<i class="fa-solid fa-bolt mr-1.5"></i>Confirm & Deduct ${product.creditPrice} Credits`;
        confirmBtn.className = 'btn-amber-pill w-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center';
      }
    } catch (e) {
      console.warn(e);
    }

    purchaseModal.classList.remove('hidden');
  };

  const closePurchaseModal = () => {
    if (purchaseModal) purchaseModal.classList.add('hidden');
    activeProductForPurchase = null;
  };

  // Confirm Purchase Execution
  const executePurchase = async () => {
    if (!activeProductForPurchase) return;

    const confirmBtn = document.getElementById('purchase-modal-confirm-btn');
    const originalText = confirmBtn.innerHTML;

    try {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>Processing Atomic Deduction...`;

      const res = await API.post('/api/marketplace/purchase', {
        productId: activeProductForPurchase.productId
      });

      // Update state
      activeProductForPurchase.isPurchased = true;
      if (res.remainingBalance !== null && res.remainingBalance !== undefined) {
        Navbar.syncSession();
        if (activeBalanceDisplay) activeBalanceDisplay.textContent = res.remainingBalance;
      }

      // Close purchase modal and show guide modal with unlocked download
      closePurchaseModal();
      openGuideModal(activeProductForPurchase);

      // Refresh catalog
      await loadProducts();
    } catch (err) {
      alert('Purchase failed: ' + (err.message || 'Unknown error'));
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = originalText;
    }
  };

  // Download product payload
  const downloadProductPayload = (product) => {
    const code = product.payloadCode || `// ${product.title} - Scriptify Official`;
    const ext = product.category === 'script' ? '.jsx' : product.category === 'plugin' ? '.txt' : '.txt';
    const filename = `${product.title.replace(/[^a-zA-Z0-9_-]/g, '_')}${ext}`;

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Admin Modal
  const openAdminModal = () => {
    if (adminModal) adminModal.classList.remove('hidden');
  };

  const closeAdminModal = () => {
    if (adminModal) adminModal.classList.add('hidden');
  };

  const handleAdminAddProduct = async (e) => {
    e.preventDefault();
    const title = document.getElementById('admin-prod-title').value.trim();
    const category = document.getElementById('admin-prod-category').value;
    const creditPrice = parseInt(document.getElementById('admin-prod-price').value, 10);
    const version = document.getElementById('admin-prod-version').value.trim() || '1.0.0';
    const author = document.getElementById('admin-prod-author').value.trim() || 'Scriptify Creator';
    const description = document.getElementById('admin-prod-desc').value.trim();
    const instructions = document.getElementById('admin-prod-instructions').value.trim();
    const payloadCode = document.getElementById('admin-prod-payload').value.trim();

    const submitBtn = document.getElementById('admin-prod-submit-btn');
    const originalText = submitBtn.innerHTML;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>Publishing Product...`;

      await API.post('/api/marketplace/products', {
        title,
        category,
        creditPrice,
        version,
        author,
        description,
        instructions,
        payloadCode
      });

      alert(`✓ Product "${title}" published to marketplace successfully!`);
      closeAdminModal();
      document.getElementById('admin-add-product-form').reset();
      await loadProducts();
    } catch (err) {
      alert('Failed to publish product: ' + (err.message || 'Unknown error'));
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  };

  // Initialize
  const init = () => {
    // Search input handler
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderProducts();
      });
    }

    // Category Tabs
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => {
          t.className = 'px-4 py-2 rounded-full text-xs font-semibold text-zinc-400 hover:text-white transition-all';
        });
        tab.className = 'px-4 py-2 rounded-full text-xs font-bold transition-all bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-500/20';
        currentCategory = tab.getAttribute('data-cat-tab');
        renderProducts();
      });
    });

    // Purchase confirmation
    const confirmBtn = document.getElementById('purchase-modal-confirm-btn');
    if (confirmBtn) confirmBtn.addEventListener('click', executePurchase);

    // Admin product form
    const adminForm = document.getElementById('admin-add-product-form');
    if (adminForm) adminForm.addEventListener('submit', handleAdminAddProduct);

    loadProducts();
  };

  return {
    init,
    openAdminModal,
    closeAdminModal,
    closeGuideModal,
    closePurchaseModal
  };
})();
