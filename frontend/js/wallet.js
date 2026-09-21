/**
 * Scriptify Credit Wallet & Transactions Module
 * Handles live balance tracking, top-up modal, and financial audit logs
 */

const Wallet = (() => {
  let currentBalance = 0;

  // DOM Elements
  const balanceDisplay = document.getElementById('wallet-balance-count');
  const modalTopup = document.getElementById('topup-modal');
  const modalTransactions = document.getElementById('transactions-modal');
  const btnOpenTopup = document.getElementById('btn-open-topup');
  const btnCloseTopup = document.getElementById('btn-close-topup');
  const btnOpenTransactions = document.getElementById('btn-open-transactions');
  const btnCloseTransactions = document.getElementById('btn-close-transactions');
  const transactionsTableBody = document.getElementById('transactions-table-body');
  const topupStatusMsg = document.getElementById('topup-status-msg');

  const updateBalanceUI = (newBalance) => {
    currentBalance = parseInt(newBalance, 10) || 0;
    if (balanceDisplay) {
      balanceDisplay.textContent = currentBalance;
      // Trigger flash animation
      balanceDisplay.parentElement.classList.add('scale-105', 'border-amber-400');
      setTimeout(() => {
        balanceDisplay.parentElement.classList.remove('scale-105', 'border-amber-400');
      }, 300);
    }
  };

  const fetchBalance = async () => {
    if (!API.isAuthenticated()) return;
    try {
      const data = await API.get('/api/wallet/balance');
      updateBalanceUI(data.wallet.balancePoints);
    } catch (err) {
      console.warn('Could not fetch wallet balance:', err.message);
    }
  };

  const openTopupModal = () => {
    if (!API.isAuthenticated()) {
      Auth.openModal();
      return;
    }
    if (modalTopup) {
      modalTopup.classList.remove('hidden');
      if (topupStatusMsg) topupStatusMsg.textContent = '';
    }
  };

  const closeTopupModal = () => {
    if (modalTopup) modalTopup.classList.add('hidden');
  };

  const executeTopup = async (amountPaid, creditPoints, paymentMethod = 'stripe_checkout') => {
    try {
      if (topupStatusMsg) {
        topupStatusMsg.textContent = 'Processing transaction...';
        topupStatusMsg.className = 'text-xs text-amber-400 mt-2';
      }

      const res = await API.post('/api/wallet/topup', {
        amountPaid,
        creditPoints,
        paymentMethod
      });

      updateBalanceUI(res.newBalance);

      if (topupStatusMsg) {
        topupStatusMsg.textContent = `Success! Added ${creditPoints} credits. (Tx: ${res.transactionId.substring(0, 8)}...)`;
        topupStatusMsg.className = 'text-xs text-emerald-400 mt-2';
      }

      setTimeout(() => {
        closeTopupModal();
      }, 1500);
    } catch (err) {
      if (topupStatusMsg) {
        topupStatusMsg.textContent = err.message || 'Payment processing failed.';
        topupStatusMsg.className = 'text-xs text-rose-400 mt-2';
      }
    }
  };

  const openTransactionsModal = async () => {
    if (!API.isAuthenticated()) {
      Auth.openModal();
      return;
    }
    if (modalTransactions) {
      modalTransactions.classList.remove('hidden');
      await loadTransactions();
    }
  };

  const closeTransactionsModal = () => {
    if (modalTransactions) modalTransactions.classList.add('hidden');
  };

  const loadTransactions = async () => {
    if (!transactionsTableBody) return;
    transactionsTableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-zinc-500">Loading transactions...</td></tr>`;

    try {
      const data = await API.get('/api/wallet/transactions');
      if (!data.transactions || data.transactions.length === 0) {
        transactionsTableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-zinc-500">No transactions recorded yet.</td></tr>`;
        return;
      }

      transactionsTableBody.innerHTML = data.transactions.map(tx => {
        const dateStr = new Date(tx.timestamp).toLocaleString();
        const shortId = tx.transactionId.substring(0, 8);
        return `
          <tr class="border-b border-zinc-800 hover:bg-zinc-800/40 text-xs text-zinc-300">
            <td class="py-3 px-3 font-mono text-zinc-400">${shortId}</td>
            <td class="py-3 px-3 font-semibold text-emerald-400">$${parseFloat(tx.amountPaid).toFixed(2)}</td>
            <td class="py-3 px-3 capitalize">${tx.paymentMethod.replace('_', ' ')}</td>
            <td class="py-3 px-3">
              <span class="px-2 py-0.5 text-[10px] rounded font-medium ${tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400'}">
                ${tx.status}
              </span>
            </td>
            <td class="py-3 px-3 text-zinc-500">${dateStr}</td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      transactionsTableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-rose-400">Error loading transactions: ${err.message}</td></tr>`;
    }
  };

  const init = () => {
    if (btnOpenTopup) btnOpenTopup.addEventListener('click', openTopupModal);
    if (btnCloseTopup) btnCloseTopup.addEventListener('click', closeTopupModal);
    if (btnOpenTransactions) btnOpenTransactions.addEventListener('click', openTransactionsModal);
    if (btnCloseTransactions) btnCloseTransactions.addEventListener('click', closeTransactionsModal);

    // Setup top-up card click handlers
    document.querySelectorAll('[data-topup-credits]').forEach(card => {
      card.addEventListener('click', () => {
        const credits = parseInt(card.getAttribute('data-topup-credits'), 10);
        const amount = parseFloat(card.getAttribute('data-topup-amount'));
        const method = card.getAttribute('data-topup-method') || 'mock_card';
        executeTopup(amount, credits, method);
      });
    });

    // Listen to session events
    window.addEventListener('scriptify:auth_success', (e) => {
      if (e.detail && e.detail.balance !== undefined) {
        updateBalanceUI(e.detail.balance);
      }
    });

    window.addEventListener('scriptify:session_loaded', (e) => {
      if (e.detail && e.detail.balance !== undefined) {
        updateBalanceUI(e.detail.balance);
      }
    });

    window.addEventListener('scriptify:insufficient_credits', () => {
      openTopupModal();
    });

    fetchBalance();
  };

  return {
    init,
    fetchBalance,
    updateBalanceUI,
    openTopupModal,
    getBalance: () => currentBalance
  };
})();
