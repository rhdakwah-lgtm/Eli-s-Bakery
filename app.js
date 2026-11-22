// Eli's Brownies — Vanilla JavaScript Interactivity & SEO URL Sync

const BRAND = {
  name: "Eli's Brownies",
  price: 50000,
  whatsappInternational: '6285695632300',
};

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function syncCanonicalAndOgUrl() {
  const currentUrl = window.location.origin + window.location.pathname;

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', currentUrl);

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', currentUrl);
}

function initImageFallbacks() {
  const logoImg = document.getElementById('brand-logo-img');
  const logoFallback = document.getElementById('brand-logo-fallback');
  if (logoImg && logoFallback) {
    logoImg.addEventListener('error', () => {
      logoImg.hidden = true;
      logoFallback.hidden = false;
    });
  }

  const promoImg = document.getElementById('promo-img');
  const promoFallback = document.getElementById('promo-fallback');
  if (promoImg && promoFallback) {
    promoImg.addEventListener('error', () => {
      promoImg.hidden = true;
      promoFallback.hidden = false;
    });
  }
}

function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-navigation');
  const iconOpen = document.getElementById('icon-menu-open');
  const iconClose = document.getElementById('icon-menu-close');

  if (!toggleBtn || !mobileNav) return;

  const setOpen = (isOpen) => {
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    toggleBtn.setAttribute(
      'aria-label',
      isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'
    );
    mobileNav.hidden = !isOpen;
    if (iconOpen && iconClose) {
      iconOpen.hidden = isOpen;
      iconClose.hidden = !isOpen;
    }
  };

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    setOpen(!isExpanded);
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
}

function initProductTabs() {
  const tabButtons = Array.from(document.querySelectorAll('[role="tab"]'));
  const tabPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  if (tabButtons.length === 0 || tabPanels.length === 0) return;

  const activateTab = (targetButton) => {
    const targetPanelId = targetButton.getAttribute('aria-controls');

    tabButtons.forEach((btn) => {
      const isSelected = btn === targetButton;
      btn.setAttribute('aria-selected', String(isSelected));
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    tabPanels.forEach((panel) => {
      panel.hidden = panel.id !== targetPanelId;
    });
  };

  tabButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => activateTab(btn));
    btn.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const dir = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + dir + tabButtons.length) % tabButtons.length;
        const nextBtn = tabButtons[nextIndex];
        activateTab(nextBtn);
        nextBtn.focus();
      }
    });
  });
}

function initOrderConfigurator() {
  const quantityInput = document.getElementById('quantity-input');
  const decreaseBtn = document.getElementById('qty-decrease');
  const increaseBtn = document.getElementById('qty-increase');
  const presetBtns = Array.from(document.querySelectorAll('.preset-btn'));
  const purposeBtns = Array.from(document.querySelectorAll('.purpose-btn'));
  const giftNoteWrap = document.getElementById('gift-note-wrap');
  const customerNameInput = document.getElementById('customer-name');
  const deliveryAreaInput = document.getElementById('delivery-area');
  const giftNoteInput = document.getElementById('gift-note');

  const summaryQtyEl = document.getElementById('summary-quantity');
  const summaryTotalEl = document.getElementById('summary-total');
  const previewPreEl = document.getElementById('order-preview');
  const whatsappLinkEl = document.getElementById('whatsapp-order-link');
  const copyBtnEl = document.getElementById('copy-order-btn');
  const copyLabelEl = document.getElementById('copy-btn-label');
  const copyIconDefault = document.getElementById('copy-icon-default');
  const copyIconDone = document.getElementById('copy-icon-done');

  if (!quantityInput || !summaryQtyEl || !summaryTotalEl || !previewPreEl || !whatsappLinkEl) {
    return;
  }

  let state = {
    quantity: 2,
    purpose: 'hantaran',
    customerName: '',
    deliveryArea: '',
    giftNote: '',
  };

  let copyTimer = null;

  const buildMessage = () => {
    const totalPrice = state.quantity * BRAND.price;
    const lines = [
      `Halo ${BRAND.name}, saya ingin memesan:`,
      `- Produk: Brownies Cokelat Murni Almond`,
      `- Jumlah: ${state.quantity} Kotak (${formatRupiah(totalPrice)})`,
      `- Keperluan: ${
        state.purpose === 'hantaran'
          ? 'Hantaran / Bingkisan Elegan'
          : 'Konsumsi Pribadi / Keluarga'
      }`,
    ];

    if (state.customerName.trim()) {
      lines.push(`- Nama Pemesan: ${state.customerName.trim()}`);
    }
    if (state.deliveryArea.trim()) {
      lines.push(`- Alamat / Area Kirim: ${state.deliveryArea.trim()}`);
    }
    if (state.purpose === 'hantaran' && state.giftNote.trim()) {
      lines.push(`- Pesan Kartu Ucapan: "${state.giftNote.trim()}"`);
    }

    lines.push('Mohon informasi ketersediaan dan jadwal pengirimannya. Terima kasih.');
    return lines.join('\n');
  };

  const render = () => {
    const totalPrice = state.quantity * BRAND.price;
    const message = buildMessage();

    quantityInput.value = String(state.quantity);
    if (decreaseBtn) decreaseBtn.disabled = state.quantity <= 1;
    if (increaseBtn) increaseBtn.disabled = state.quantity >= 100;

    presetBtns.forEach((btn) => {
      const presetQty = Number.parseInt(btn.dataset.qty || '0', 10);
      btn.classList.toggle('is-active', presetQty === state.quantity);
    });

    purposeBtns.forEach((btn) => {
      const isSelected = btn.dataset.purpose === state.purpose;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-pressed', String(isSelected));
    });

    if (giftNoteWrap) {
      giftNoteWrap.hidden = state.purpose !== 'hantaran';
    }

    summaryQtyEl.textContent = `${state.quantity} Kotak`;
    summaryTotalEl.textContent = formatRupiah(totalPrice);
    previewPreEl.textContent = message;
    whatsappLinkEl.setAttribute(
      'href',
      `https://wa.me/${BRAND.whatsappInternational}?text=${encodeURIComponent(message)}`
    );
  };

  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', () => {
      state.quantity = Math.max(1, state.quantity - 1);
      render();
    });
  }

  if (increaseBtn) {
    increaseBtn.addEventListener('click', () => {
      state.quantity = Math.min(100, state.quantity + 1);
      render();
    });
  }

  quantityInput.addEventListener('input', () => {
    const parsed = Number.parseInt(quantityInput.value, 10);
    if (!Number.isNaN(parsed)) {
      state.quantity = Math.min(100, Math.max(1, parsed));
      render();
    }
  });

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const qty = Number.parseInt(btn.dataset.qty || '1', 10);
      state.quantity = Math.min(100, Math.max(1, qty));
      render();
    });
  });

  purposeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.purpose = btn.dataset.purpose === 'pribadi' ? 'pribadi' : 'hantaran';
      render();
    });
  });

  if (customerNameInput) {
    customerNameInput.addEventListener('input', (e) => {
      state.customerName = e.target.value;
      render();
    });
  }

  if (deliveryAreaInput) {
    deliveryAreaInput.addEventListener('input', (e) => {
      state.deliveryArea = e.target.value;
      render();
    });
  }

  if (giftNoteInput) {
    giftNoteInput.addEventListener('input', (e) => {
      state.giftNote = e.target.value;
      render();
    });
  }

  if (copyBtnEl && copyLabelEl) {
    copyBtnEl.addEventListener('click', async () => {
      const message = buildMessage();
      try {
        await navigator.clipboard.writeText(message);
        copyLabelEl.textContent = 'Format Pesanan Tersalin';
        if (copyIconDefault && copyIconDone) {
          copyIconDefault.hidden = true;
          copyIconDone.hidden = false;
        }
        if (copyTimer) window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(() => {
          copyLabelEl.textContent = 'Salin Format Pesanan';
          if (copyIconDefault && copyIconDone) {
            copyIconDefault.hidden = false;
            copyIconDone.hidden = true;
          }
        }, 2500);
      } catch {
        copyLabelEl.textContent = 'Salin Format Pesanan';
      }
    });
  }

  render();
}

function initFaqAccordion() {
  const triggers = Array.from(document.querySelectorAll('.faq-trigger'));

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('aria-controls');
      const targetPanel = targetId ? document.getElementById(targetId) : null;
      const isCurrentlyOpen = trigger.getAttribute('aria-expanded') === 'true';

      triggers.forEach((otherTrigger) => {
        const otherId = otherTrigger.getAttribute('aria-controls');
        const otherPanel = otherId ? document.getElementById(otherId) : null;
        otherTrigger.setAttribute('aria-expanded', 'false');
        if (otherPanel) otherPanel.hidden = true;
      });

      if (!isCurrentlyOpen && targetPanel) {
        trigger.setAttribute('aria-expanded', 'true');
        targetPanel.hidden = false;
      }
    });
  });
}

function initApp() {
  syncCanonicalAndOgUrl();
  initImageFallbacks();
  initMobileNavigation();
  initProductTabs();
  initOrderConfigurator();
  initFaqAccordion();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
