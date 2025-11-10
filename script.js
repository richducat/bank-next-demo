// Global JavaScript for Bank Next demo
document.addEventListener('DOMContentLoaded', () => {
  // Utility to safely query elements
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // Apply stored theme on load
  function applyTheme() {
    const primary = localStorage.getItem('themePrimary');
    const accent = localStorage.getItem('themeAccent');
    const logoText = localStorage.getItem('logoText');
    if (primary) {
      document.documentElement.style.setProperty('--color-primary', primary);
    }
    if (accent) {
      document.documentElement.style.setProperty('--color-accent', accent);
    }
    if (logoText && $('#logo')) {
      $('#logo').textContent = logoText;
    }
    // Also sync inputs on theme page if present
    if ($('#primary-color') && primary) {
      $('#primary-color').value = primary;
    }
    if ($('#accent-color') && accent) {
      $('#accent-color').value = accent;
    }
    if ($('#logo-text') && logoText) {
      $('#logo-text').value = logoText;
    }
  }
  applyTheme();

  // Timeline details toggles
  $$('.details-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const summary = link.closest('.summary');
      if (!summary) return;
      const details = summary.nextElementSibling;
      if (details) {
        details.classList.toggle('hidden');
      }
    });
  });

  // Balance calculation modal
  const calcLink = $('#how-calc-link');
  const calcModal = $('#calc-modal');
  if (calcLink && calcModal) {
    calcLink.addEventListener('click', (e) => {
      e.preventDefault();
      calcModal.classList.remove('hidden');
    });
    const closeBtn = calcModal.querySelector('.close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        calcModal.classList.add('hidden');
      });
    }
  }

  // Deposit ETA modal
  const depositInfoLink = $('#deposit-eta-info');
  const depositModal = $('#deposit-modal');
  if (depositInfoLink && depositModal) {
    depositInfoLink.addEventListener('click', (e) => {
      e.preventDefault();
      depositModal.classList.remove('hidden');
    });
    const closeDeposit = depositModal.querySelector('.close-modal');
    if (closeDeposit) {
      closeDeposit.addEventListener('click', () => {
        depositModal.classList.add('hidden');
      });
    }
  }

  // Card toggles update status text
  ['card1-toggle','card2-toggle'].forEach((id) => {
    const toggle = $('#' + id);
    if (toggle) {
      const statusId = id.replace('toggle','status');
      const statusSpan = $('#' + statusId);
      const updateStatus = () => {
        if (statusSpan) {
          statusSpan.textContent = toggle.checked ? 'Active' : 'Locked';
        }
      };
      updateStatus();
      toggle.addEventListener('change', updateStatus);
    }
  });

  // Theme page save button
  const saveBtn = $('#save-theme');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const primaryValue = $('#primary-color').value || '#17675c';
      const accentValue = $('#accent-color').value || '#0095be';
      const logoValue = ($('#logo-text').value || 'BANK').trim();
      localStorage.setItem('themePrimary', primaryValue);
      localStorage.setItem('themeAccent', accentValue);
      localStorage.setItem('logoText', logoValue);
      // Immediately apply theme
      applyTheme();
      alert('Theme saved!');
    });
  }
  // Theme page reset button
  const resetBtn = $('#reset-theme');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('themePrimary');
      localStorage.removeItem('themeAccent');
      localStorage.removeItem('logoText');
      // Reset to defaults
      document.documentElement.style.setProperty('--color-primary', '#17675c');
      document.documentElement.style.setProperty('--color-accent', '#0095be');
      if ($('#logo')) $('#logo').textContent = 'BANK';
      if ($('#primary-color')) $('#primary-color').value = '#17675c';
      if ($('#accent-color')) $('#accent-color').value = '#0095be';
      if ($('#logo-text')) $('#logo-text').value = 'BANK';
      alert('Theme reset to defaults.');
    });
  }

  // Provide a generic close handler for all modal close buttons.  
  // When a button with the class `close-modal` is clicked, its nearest parent
  // with the `.modal` class is hidden again. This avoids having to
  // explicitly bind each modal’s close button separately and ensures
  // reliability across pages.
  $$('.close-modal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalEl = btn.closest('.modal');
      if (modalEl) {
        modalEl.classList.add('hidden');
      }
    });
  });

  // --- More page modal triggers ---
  // Each button on the More page opens its respective modal. When clicked, the
  // corresponding modal is displayed by removing the `hidden` class.
  const modalMapping = {
    'start-chat': 'chat-modal',
    'view-statements': 'statements-modal',
    'find-location': 'location-modal',
    'view-options': 'security-modal',
    'view-comparison': 'comparison-modal'
    // Additional mappings inserted below for card manage buttons on the Cards page
    , 'manage-card1': 'card1-modal'
    , 'manage-card2': 'card2-modal'
  };
  Object.keys(modalMapping).forEach((btnId) => {
    const btnEl = document.getElementById(btnId);
    const modalId = modalMapping[btnId];
    const modalEl = document.getElementById(modalId);
    if (btnEl && modalEl) {
      btnEl.addEventListener('click', () => {
        modalEl.classList.remove('hidden');
      });
    }
  });
});