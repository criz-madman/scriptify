/**
 * Scriptify Authentication Module
 * Manages Passwordless Email OTP Login, JWT lifecycle, and Profile States
 */

const Auth = (() => {
  let currentUser = null;
  let pendingEmail = '';

  // Elements
  const modal = document.getElementById('auth-modal');
  const stepEmail = document.getElementById('auth-step-email');
  const stepOtp = document.getElementById('auth-step-otp');
  const emailInput = document.getElementById('auth-email-input');
  const otpInput = document.getElementById('auth-otp-input');
  const btnSendOtp = document.getElementById('btn-send-otp');
  const btnVerifyOtp = document.getElementById('btn-verify-otp');
  const btnCloseModal = document.getElementById('btn-close-auth-modal');
  const btnOpenLogin = document.getElementById('btn-open-login');
  const userProfileBadge = document.getElementById('user-profile-badge');
  const userEmailDisplay = document.getElementById('user-email-display');
  const devOtpNotice = document.getElementById('dev-otp-notice');
  const devOtpValue = document.getElementById('dev-otp-value');
  const authErrorText = document.getElementById('auth-error-text');

  // Open modal
  const openModal = (defaultEmail = '') => {
    if (modal) {
      modal.classList.remove('hidden');
      stepEmail.classList.remove('hidden');
      stepOtp.classList.add('hidden');
      authErrorText.textContent = '';
      devOtpNotice.classList.add('hidden');
      if (defaultEmail) emailInput.value = defaultEmail;
      emailInput.focus();
    }
  };

  // Close modal
  const closeModal = () => {
    if (modal) {
      modal.classList.add('hidden');
      authErrorText.textContent = '';
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      showError('Please enter a valid email address.');
      return;
    }

    try {
      btnSendOtp.disabled = true;
      btnSendOtp.textContent = 'Sending Code...';
      authErrorText.textContent = '';

      const data = await API.post('/api/auth/send-otp', { email });
      pendingEmail = email;

      // Check if development OTP is returned for instant local testing
      if (data.devOtp) {
        devOtpValue.textContent = data.devOtp;
        devOtpNotice.classList.remove('hidden');
        otpInput.value = data.devOtp; // Auto-fill for convenience
      }

      // Transition to OTP step
      stepEmail.classList.add('hidden');
      stepOtp.classList.remove('hidden');
      document.getElementById('otp-target-email').textContent = email;
      otpInput.focus();
    } catch (err) {
      showError(err.message || 'Failed to dispatch verification code.');
    } finally {
      btnSendOtp.disabled = false;
      btnSendOtp.textContent = 'Send Verification Code';
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const otp = otpInput.value.trim();
    if (!otp || otp.length < 6) {
      showError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      btnVerifyOtp.disabled = true;
      btnVerifyOtp.textContent = 'Verifying...';
      authErrorText.textContent = '';

      const data = await API.post('/api/auth/verify-otp', {
        email: pendingEmail,
        otp
      });

      // Save token
      API.setToken(data.token);
      currentUser = data.user;

      updateUserUI(data.user, data.walletBalance);
      closeModal();

      // Notify other modules of successful login
      window.dispatchEvent(new CustomEvent('scriptify:auth_success', {
        detail: { user: data.user, balance: data.walletBalance }
      }));
    } catch (err) {
      showError(err.message || 'Verification failed. Please try again.');
    } finally {
      btnVerifyOtp.disabled = false;
      btnVerifyOtp.textContent = 'Verify & Access Studio';
    }
  };

  const showError = (msg) => {
    if (authErrorText) authErrorText.textContent = msg;
  };

  const updateUserUI = (user, balance) => {
    if (user) {
      btnOpenLogin.classList.add('hidden');
      userProfileBadge.classList.remove('hidden');
      userEmailDisplay.textContent = user.email;
    } else {
      btnOpenLogin.classList.remove('hidden');
      userProfileBadge.classList.add('hidden');
      userEmailDisplay.textContent = '';
    }
  };

  const logout = () => {
    API.removeToken();
    currentUser = null;
    updateUserUI(null);
    window.dispatchEvent(new CustomEvent('scriptify:logout'));
    window.location.reload();
  };

  const checkSession = async () => {
    if (!API.isAuthenticated()) {
      updateUserUI(null);
      return;
    }

    try {
      const data = await API.get('/api/auth/me');
      currentUser = data.user;
      updateUserUI(data.user, data.walletBalance);
      window.dispatchEvent(new CustomEvent('scriptify:session_loaded', {
        detail: { user: data.user, balance: data.walletBalance }
      }));
    } catch (err) {
      // Expired or invalid token
      API.removeToken();
      updateUserUI(null);
    }
  };

  // Event Listeners
  const init = () => {
    if (btnOpenLogin) btnOpenLogin.addEventListener('click', () => openModal());
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnSendOtp) btnSendOtp.addEventListener('click', handleSendOtp);
    if (btnVerifyOtp) btnVerifyOtp.addEventListener('click', handleVerifyOtp);

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', logout);

    const btnBackToEmail = document.getElementById('btn-back-to-email');
    if (btnBackToEmail) {
      btnBackToEmail.addEventListener('click', () => {
        stepOtp.classList.add('hidden');
        stepEmail.classList.remove('hidden');
        authErrorText.textContent = '';
      });
    }

    // Catch global auth required event
    window.addEventListener('scriptify:auth_required', () => {
      openModal();
    });

    // Enter key shortcuts
    if (emailInput) {
      emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSendOtp();
      });
    }
    if (otpInput) {
      otpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleVerifyOtp();
      });
    }

    checkSession();
  };

  return {
    init,
    openModal,
    closeModal,
    getUser: () => currentUser,
    logout
  };
})();
