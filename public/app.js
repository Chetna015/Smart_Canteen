(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const initialView = params.get('view') || 'student';
  const isEmbed = params.get('embed') === '1';

  const MY_ORDERS_STORAGE_KEY = 'ql_my_orders';

  function loadStoredOrders() {
    try {
      const raw = localStorage.getItem(MY_ORDERS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return {};
  }

  function saveStoredOrders(pinMap) {
    try {
      localStorage.setItem(MY_ORDERS_STORAGE_KEY, JSON.stringify(pinMap));
    } catch {
      // ignore storage errors
    }
  }

  const initialPinMap = loadStoredOrders();

  const appState = {
    view: ['student', 'vendor', 'board', 'demo', 'qr'].includes(initialView) ? initialView : 'student',
    laneFilter: 'all',
    categoryFilter: 'All',
    searchQuery: '',
    pickupMode: 'now', // 'now' | 'preorder'
    cart: {}, // itemId -> qty
    comboDiscount: 0,
    soundEnabled: true,
    snapshot: null,
    myOrderIds: Object.keys(initialPinMap),
    myOrderPins: initialPinMap,
    vendorPins: {},
    vendorSession: {
      checked: false,
      authenticated: false,
      vendor: null,
    },
    prevReadyIds: new Set(),
    initializedReadySet: false,
    renderKeys: {},
  };

  function showToast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.remove('hidden');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => el.classList.add('hidden'), 2800);
  }

  function playReadyChime() {
    if (!appState.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      [587.33, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.14;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {
      // ignore audio errors
    }
  }

  async function apiRequest(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(url, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        ...options,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.error || `Request failed (${res.status})`);
        err.status = res.status;
        throw err;
      }
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  function setView(viewName) {
    appState.view = viewName;
    document.querySelectorAll('.view-section').forEach((sec) => {
      sec.classList.toggle('hidden', sec.id !== `view-${viewName}`);
    });
    document.querySelectorAll('.nav-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    if (!isEmbed) {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('view', viewName);
      window.history.replaceState({}, '', nextUrl.toString());
    }
    if (viewName === 'vendor') {
      checkVendorSession();
    }
    renderAll();
  }

  function laneBadgeHtml(lane) {
    return lane === 'express'
      ? '<span class="lane-badge express">⚡ Counter A</span>'
      : '<span class="lane-badge fresh">🍳 Counter B</span>';
  }

  function renderStudentView() {
    const snap = appState.snapshot;
    if (!snap) return;

    const banner = document.getElementById('crowd-banner');
    banner.className = `crowd-ring ${snap.crowd.level}`;
    const shortCrowd = snap.crowd.level === 'red' ? 'Heavy Rush' : snap.crowd.level === 'yellow' ? 'Moderate Queue' : 'Low Crowd';
    document.getElementById('crowd-title').textContent = shortCrowd;
    document.getElementById('crowd-meta').textContent = `~${snap.crowd.estimatedWaitMins} min wait`;
    document.getElementById('crowd-count').textContent = String(snap.crowd.activeQueueCount);
    const expEl = document.getElementById('hero-express-wait');
    const frEl = document.getElementById('hero-fresh-wait');
    const srvEl = document.getElementById('hero-served-count');
    if (expEl) expEl.textContent = `${snap.crowd.expressWaitMins}m`;
    if (frEl) frEl.textContent = `${snap.crowd.freshWaitMins}m`;
    if (srvEl) srvEl.textContent = String(snap.crowd.totalDeliveredToday);

    const myOrders = snap.orders.filter((o) => appState.myOrderIds.includes(o.id) && o.status !== 'delivered');
    const tokensSection = document.getElementById('my-tokens-section');
    const tokensList = document.getElementById('my-tokens-list');
    if (myOrders.length === 0) {
      tokensSection.classList.add('hidden');
    } else {
      tokensSection.classList.remove('hidden');
      tokensList.innerHTML = myOrders.map((order) => {
        const isReady = order.status === 'ready';
        const isPrep = order.status === 'preparing';
        return `
          <div class="token-card ${isReady ? 'ready' : ''}">
            <div class="token-top">
              <div>
                <div class="token-num">${order.token}</div>
                <div class="small muted">${order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</div>
              </div>
              <div style="text-align:right">
                <div class="token-pin">PIN ${appState.myOrderPins[order.id] || order.pin || '----'}</div>
                <div style="margin-top:4px">${laneBadgeHtml(order.lane)}</div>
              </div>
            </div>
            <div class="token-progress">
              <div class="step-pill ${order.status === 'queued' ? 'active' : 'done'}">Queued</div>
              <div class="step-pill ${isPrep ? 'active' : isReady ? 'done' : ''}">Preparing</div>
              <div class="step-pill ${isReady ? 'active' : ''}">Ready</div>
            </div>
          </div>
        `;
      }).join('');
    }

    const combosWrap = document.getElementById('combos-wrap');
    const showCombos = appState.categoryFilter === 'All' || appState.categoryFilter === 'Combos';
    combosWrap.classList.toggle('hidden', !showCombos);
    const combosKey = JSON.stringify({ showCombos, stock: snap.menu.map((m) => [m.id, m.inStock]) });
    if (appState.renderKeys.combos !== combosKey) {
      appState.renderKeys.combos = combosKey;
      combosWrap.innerHTML = snap.combos.map((combo) => {
        const items = combo.itemIds.map((id) => snap.menu.find((m) => m.id === id)).filter(Boolean);
        const allInStock = items.every((m) => m.inStock);
        const rawPrice = items.reduce((s, m) => s + m.price, 0);
        const comboPrice = Math.max(1, rawPrice - combo.discount);
        return `
          <button class="combo-btn" data-combo-id="${combo.id}" ${allInStock ? '' : 'disabled'}>
            <div>
              <div class="combo-title">${combo.name}</div>
              <div class="combo-desc">${combo.desc}</div>
            </div>
            <div class="combo-price">₹${comboPrice}</div>
          </button>
        `;
      }).join('');
    }

    const menuGrid = document.getElementById('menu-grid');
    if (appState.categoryFilter === 'Combos') {
      menuGrid.classList.add('hidden');
    } else {
      menuGrid.classList.remove('hidden');
      const q = appState.searchQuery.trim().toLowerCase();
      const menuKey = JSON.stringify({
        lane: appState.laneFilter,
        cat: appState.categoryFilter,
        q,
        stock: snap.menu.map((m) => [m.id, m.inStock, m.price]),
      });

      // Only rebuild dish cards (and <img> tags) when filters or stock actually change
      if (appState.renderKeys.menu !== menuKey) {
        appState.renderKeys.menu = menuKey;
        const filteredMenu = snap.menu.filter((item) => {
          const laneOk = appState.laneFilter === 'all' || item.lane === appState.laneFilter;
          const catOk = appState.categoryFilter === 'All' || item.category === appState.categoryFilter;
          const searchOk = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || (item.desc || '').toLowerCase().includes(q);
          return laneOk && catOk && searchOk;
        });

        menuGrid.innerHTML = filteredMenu.length === 0
          ? '<p class="muted small">No matching items found.</p>'
          : filteredMenu.map((item) => {
            const pillText = item.lane === 'express' ? '⚡ Express' : '🍳 Fresh';
            const counterText = item.lane === 'express' ? 'Counter A' : 'Counter B';

            return `
              <article class="dish-card ${item.inStock ? '' : 'sold-out'}" data-dish-id="${item.id}">
                <div class="dish-media">
                  <img src="${item.image || `/images/${item.id}.jpg`}" alt="${item.name}" />
                  <span class="dish-pill-left">${pillText}</span>
                  <span class="dish-pill-right">🕒 ${item.prepMins}m • ${counterText}</span>
                </div>
                <div class="dish-body">
                  <div class="dish-head">
                    <div class="dish-name">${item.name}</div>
                    <div class="dish-price">₹${item.price}</div>
                  </div>
                  <p class="dish-desc">${item.desc || ''}</p>
                  <div class="dish-foot">
                    ${laneBadgeHtml(item.lane)}
                    <span class="dish-control" data-control-for="${item.id}"></span>
                  </div>
                </div>
              </article>
            `;
          }).join('');
      }

      // Update only button/stepper states without touching <img> elements
      menuGrid.querySelectorAll('[data-control-for]').forEach((slot) => {
        const id = slot.dataset.controlFor;
        const item = snap.menu.find((m) => m.id === id);
        if (!item) return;
        const qty = appState.cart[id] || 0;
        const nextHtml = !item.inStock
          ? '<span class="sold-badge">Sold Out</span>'
          : qty > 0
            ? `<div class="qty-stepper"><button data-qty-dec="${id}">−</button><span>${qty}</span><button data-qty-inc="${id}">+</button></div>`
            : `<button class="btn-add-cart" data-qty-inc="${id}">+ Add to Cart</button>`;
        if (slot.innerHTML !== nextHtml) {
          slot.innerHTML = nextHtml;
        }
      });
    }

    const slotSelect = document.getElementById('pickup-slot');
    if (slotSelect.options.length === 0) {
      const futureSlots = snap.pickupSlots.filter((s) => s !== 'Pickup Now');
      slotSelect.innerHTML = (futureSlots.length ? futureSlots : snap.pickupSlots)
        .map((s) => `<option value="${s}">${s}</option>`)
        .join('');
    }
    renderCart();
  }

  function renderCart() {
    const snap = appState.snapshot;
    if (!snap) return;

    const entries = Object.entries(appState.cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = snap.menu.find((m) => m.id === id);
        return item ? { item, qty } : null;
      })
      .filter(Boolean);

    const cartItemsEl = document.getElementById('cart-items');
    const laneBadgeEl = document.getElementById('cart-lane-badge');
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountRowEl = document.getElementById('cart-discount-row');
    const discountEl = document.getElementById('cart-discount');
    const totalEl = document.getElementById('cart-total');
    const placeBtn = document.getElementById('place-order-btn');
    const mobileBar = document.getElementById('mobile-cart-bar');
    const mobileSummary = document.getElementById('mobile-cart-summary');

    if (entries.length === 0) {
      appState.comboDiscount = 0;
      cartItemsEl.innerHTML = '<p class="muted small">Add items to start your order</p>';
      laneBadgeEl.className = 'lane-badge express';
      laneBadgeEl.textContent = '⚡ Counter A';
      subtotalEl.textContent = '₹0';
      discountRowEl.classList.add('hidden');
      totalEl.textContent = '₹0';
      placeBtn.disabled = true;
      if (mobileBar) mobileBar.classList.add('hidden');
      return;
    }

    const hasFresh = entries.some((e) => e.item.lane === 'fresh');
    laneBadgeEl.className = `lane-badge ${hasFresh ? 'fresh' : 'express'}`;
    laneBadgeEl.textContent = hasFresh ? '🍳 Counter B' : '⚡ Counter A';

    const subtotal = entries.reduce((sum, e) => sum + e.item.price * e.qty, 0);
    const total = Math.max(1, subtotal - appState.comboDiscount);

    cartItemsEl.innerHTML = entries.map(({ item, qty }) => `
      <div class="cart-item-card">
        <div class="cart-item-top">
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-sub">₹${item.price} × ${qty} = ₹${item.price * qty}</div>
          </div>
          <div class="qty-stepper">
            <button data-qty-dec="${item.id}">−</button>
            <span>${qty}</span>
            <button data-qty-inc="${item.id}">+</button>
          </div>
        </div>
      </div>
    `).join('');

    subtotalEl.textContent = `₹${subtotal}`;
    if (appState.comboDiscount > 0) {
      discountRowEl.classList.remove('hidden');
      discountEl.textContent = `−₹${appState.comboDiscount}`;
    } else {
      discountRowEl.classList.add('hidden');
    }
    totalEl.textContent = `₹${total}`;
    placeBtn.disabled = false;
    if (mobileBar && mobileSummary) {
      const totalCount = entries.reduce((sum, e) => sum + e.qty, 0);
      mobileSummary.textContent = `${totalCount} ${totalCount === 1 ? 'item' : 'items'} • ₹${total}`;
      mobileBar.classList.remove('hidden');
    }
  }

  async function checkVendorSession() {
    try {
      const data = await apiRequest('/api/vendor/session');
      appState.vendorSession = {
        checked: true,
        authenticated: Boolean(data.authenticated),
        vendor: data.vendor || null,
      };
    } catch {
      appState.vendorSession = { checked: true, authenticated: false, vendor: null };
    }
    if (appState.view === 'vendor') {
      renderVendorView();
    }
  }

  function handleVendorUnauthorized(err) {
    if (err && err.status === 401) {
      appState.vendorSession = { checked: true, authenticated: false, vendor: null };
      appState.renderKeys.vendorOrders = '';
      if (appState.view === 'vendor') {
        renderVendorView();
      }
      showToast('Vendor sign-in required.');
      return true;
    }
    return false;
  }

  function renderVendorView() {
    const authGate = document.getElementById('vendor-auth-gate');
    const dashboard = document.getElementById('vendor-dashboard');
    const isAuthed = Boolean(appState.vendorSession.authenticated);

    if (authGate) authGate.classList.toggle('hidden', isAuthed);
    if (dashboard) dashboard.classList.toggle('hidden', !isAuthed);
    if (!isAuthed) return;

    const badge = document.getElementById('vendor-identity-badge');
    if (badge && appState.vendorSession.vendor) {
      badge.textContent = appState.vendorSession.vendor.displayName || appState.vendorSession.vendor.username;
      badge.classList.toggle('demo-role', appState.vendorSession.vendor.role === 'demo');
    }

    const snap = appState.snapshot;
    if (!snap) return;

    const activeOrders = snap.orders.filter((o) => o.status !== 'delivered');
    document.getElementById('vendor-active-count').textContent = String(activeOrders.length);
    document.getElementById('served-today-badge').textContent = `${snap.crowd.totalDeliveredToday} Served`;

    const ordersList = document.getElementById('vendor-orders-list');
    const ordersKey = JSON.stringify(activeOrders.map((o) => [o.id, o.status]));
    if (appState.renderKeys.vendorOrders !== ordersKey) {
      appState.renderKeys.vendorOrders = ordersKey;

      if (activeOrders.length === 0) {
        ordersList.innerHTML = '<p class="muted small">No active orders</p>';
      } else {
        ordersList.innerHTML = activeOrders.map((order) => {
          let statusLabel = 'Queued';
          let actionHtml = `
            <button class="btn btn-primary vendor-action-btn" data-order-id="${order.id}" data-next-status="preparing">
              Accept
            </button>
          `;

          if (order.status === 'preparing') {
            statusLabel = 'Preparing';
            actionHtml = `
              <button class="btn btn-success vendor-action-btn" data-order-id="${order.id}" data-next-status="ready">
                Mark Ready
              </button>
            `;
          } else if (order.status === 'ready') {
            statusLabel = 'Ready — Verify PIN';
            const savedPin = appState.vendorPins[order.id] || '';
            actionHtml = `
              <div class="vendor-pin-box">
                <input
                  type="text"
                  inputmode="numeric"
                  maxlength="4"
                  class="vendor-pin-input"
                  placeholder="Enter 4-digit PIN"
                  value="${savedPin}"
                  data-pin-input="${order.id}"
                />
                <button class="btn btn-primary vendor-action-btn" data-verify-order="${order.id}">
                  Verify PIN &amp; Handover
                </button>
              </div>
            `;
          }

          return `
            <div class="vendor-order-card status-${order.status}">
              <div class="vendor-order-top">
                <span class="vendor-token">${order.token}</span>
                ${laneBadgeHtml(order.lane)}
              </div>
              <span class="vendor-status-pill">${statusLabel}</span>
              <div class="small muted">${order.customerName} • ${order.paymentMode} • ₹${order.total}</div>
              <div class="small">${order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</div>
              ${actionHtml}
            </div>
          `;
        }).join('');
      }
    }

    document.getElementById('vendor-stock-list').innerHTML = snap.menu.map((item) => `
      <div class="stock-row">
        <span>${item.icon} ${item.name}</span>
        <button class="btn btn-sm ${item.inStock ? 'btn-success' : 'btn-danger'}" data-toggle-stock="${item.id}">
          ${item.inStock ? 'In Stock' : 'Sold Out'}
        </button>
      </div>
    `).join('');

    const maxOrders = Math.max(...snap.peakStats.map((s) => s.orders), 1);
    document.getElementById('peak-chart').innerHTML = snap.peakStats.map((stat) => {
      const pct = Math.round((stat.orders / maxOrders) * 100);
      return `
        <div class="peak-bar-wrap">
          <span class="peak-lbl">${stat.orders}</span>
          <div class="peak-bar ${stat.orders >= 60 ? 'hot' : ''}" style="height:${Math.max(10, pct * 0.8)}%"></div>
          <span class="peak-lbl">${stat.label}</span>
        </div>
      `;
    }).join('');
  }

  function getBestShareUrl() {
    const snap = appState.snapshot;
    if (snap && snap.network && snap.network.lanUrls && snap.network.lanUrls.length > 0) {
      return snap.network.lanUrls[0].url;
    }
    return window.location.origin;
  }

  function renderBoardView() {
    const snap = appState.snapshot;
    if (!snap) return;

    document.getElementById('board-crowd-line').textContent = `Wait ~${snap.crowd.estimatedWaitMins} min`;
    const readyOrders = snap.orders.filter((o) => o.status === 'ready');
    const prepOrders = snap.orders.filter((o) => o.status === 'preparing' || o.status === 'queued');

    document.getElementById('board-ready-list').innerHTML = readyOrders.length === 0
      ? '<p class="small muted">None</p>'
      : readyOrders.map((o) => `
        <div class="board-token-tile">
          <div class="board-tile-num">${o.token}</div>
          <div class="board-tile-meta">${o.lane === 'express' ? 'Counter A' : 'Counter B'} • Ready</div>
        </div>
      `).join('');

    document.getElementById('board-prep-list').innerHTML = prepOrders.length === 0
      ? '<p class="small muted">None</p>'
      : prepOrders.map((o) => `
        <div class="board-token-tile">
          <div class="board-tile-num">${o.token}</div>
          <div class="board-tile-meta">${o.status === 'preparing' ? 'Preparing' : 'Queued'}</div>
        </div>
      `).join('');

    const qrSlot = document.getElementById('board-qr-slot');
    if (qrSlot && window.QuickLunchQR && !qrSlot.dataset.rendered) {
      qrSlot.innerHTML = window.QuickLunchQR.generateQrSvg(getBestShareUrl(), 52);
      qrSlot.dataset.rendered = '1';
    }
  }

  function renderQrView() {
    const snap = appState.snapshot;
    if (!snap || !window.QuickLunchQR) return;

    const select = document.getElementById('lan-url-select');
    const customInput = document.getElementById('custom-qr-url');

    if (select.options.length === 0) {
      const candidates = [
        ...(snap.network.lanUrls || []).map((u) => ({ label: u.url, url: u.url })),
        { label: window.location.origin, url: window.location.origin },
      ];
      select.innerHTML = candidates.map((c) => `<option value="${c.url}">${c.label}</option>`).join('');
    }

    const activeUrl = customInput.value.trim() || select.value || window.location.origin;
    document.getElementById('standee-url-text').textContent = activeUrl;
    try {
      document.getElementById('standee-qr-box').innerHTML = window.QuickLunchQR.generateQrSvg(activeUrl, 210);
    } catch (err) {
      document.getElementById('standee-qr-box').innerHTML = `<p class="muted small">${err.message}</p>`;
    }
  }

  function renderAll() {
    if (!appState.snapshot) return;
    if (appState.view === 'student') renderStudentView();
    if (appState.view === 'vendor') renderVendorView();
    if (appState.view === 'board') renderBoardView();
    if (appState.view === 'qr') renderQrView();
  }

  function handleSnapshot(snapshot) {
    const activeIds = new Set(snapshot.orders.map((o) => o.id));
    if (appState.myOrderIds.length > 0) {
      const remaining = [];
      let clearedAny = false;
      for (const id of appState.myOrderIds) {
        if (activeIds.has(id)) {
          remaining.push(id);
        } else {
          delete appState.myOrderPins[id];
          clearedAny = true;
        }
      }
      if (clearedAny) {
        appState.myOrderIds = remaining;
        saveStoredOrders(appState.myOrderPins);
        if (appState.view === 'student') {
          showToast('Order verified & handed over!');
        }
      }
    }

    const readyNow = new Set(snapshot.orders.filter((o) => o.status === 'ready').map((o) => o.id));
    if (appState.initializedReadySet) {
      for (const id of readyNow) {
        if (!appState.prevReadyIds.has(id)) {
          const order = snapshot.orders.find((o) => o.id === id);
          if (order && (appState.myOrderIds.includes(id) || appState.view === 'board')) {
            playReadyChime();
            if (appState.myOrderIds.includes(id)) {
              showToast(`${order.token} is Ready!`);
            }
          }
        }
      }
    }
    appState.prevReadyIds = readyNow;
    appState.initializedReadySet = true;
    appState.snapshot = snapshot;
    renderAll();
  }

  function connectLiveSync() {
    const indicator = document.getElementById('sync-indicator');
    let inFlight = false;
    let shownError = false;
    const poll = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const snap = await apiRequest('/api/state');
        indicator.textContent = snap.storage === 'supabase' ? 'Live DB' : 'Live';
        indicator.classList.remove('offline');
        shownError = false;
        handleSnapshot(snap);
      } catch (err) {
        indicator.textContent = 'Offline';
        indicator.classList.add('offline');
        if (!shownError) {
          shownError = true;
          showToast(err.message || 'Server unreachable');
        }
      } finally {
        inFlight = false;
      }
    };
    poll();
    setInterval(poll, 1000);
  }

  function bindEvents() {
    if (isEmbed) {
      document.getElementById('topbar').classList.add('hidden');
      document.body.classList.add('embed-mode');
    }

    document.querySelectorAll('.nav-tab').forEach((tab) => {
      tab.addEventListener('click', () => setView(tab.dataset.view));
    });

    document.getElementById('sound-toggle').addEventListener('click', (e) => {
      appState.soundEnabled = !appState.soundEnabled;
      e.target.textContent = appState.soundEnabled ? '🔔' : '🔕';
    });

    document.getElementById('menu-search').addEventListener('input', (e) => {
      appState.searchQuery = e.target.value;
      renderStudentView();
    });

    document.querySelectorAll('.filter-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        appState.laneFilter = pill.dataset.lane;
        document.querySelectorAll('.filter-pill').forEach((p) => p.classList.toggle('active', p === pill));
        renderStudentView();
      });
    });

    document.querySelectorAll('.cat-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        appState.categoryFilter = pill.dataset.cat;
        document.querySelectorAll('.cat-pill').forEach((p) => p.classList.toggle('active', p === pill));
        renderStudentView();
      });
    });

    document.querySelectorAll('.mode-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        appState.pickupMode = pill.dataset.mode;
        document.querySelectorAll('.mode-pill').forEach((p) => p.classList.toggle('active', p === pill));
        document.getElementById('pickup-slot').classList.toggle('hidden', appState.pickupMode === 'now');
      });
    });

    document.getElementById('view-student').addEventListener('click', (e) => {
      const incBtn = e.target.closest('[data-qty-inc]');
      if (incBtn) {
        const id = incBtn.dataset.qtyInc;
        appState.cart[id] = Math.min(10, (appState.cart[id] || 0) + 1);
        renderStudentView();
        return;
      }
      const decBtn = e.target.closest('[data-qty-dec]');
      if (decBtn) {
        const id = decBtn.dataset.qtyDec;
        appState.cart[id] = Math.max(0, (appState.cart[id] || 0) - 1);
        if (appState.cart[id] === 0) delete appState.cart[id];
        renderStudentView();
        return;
      }
      const comboBtn = e.target.closest('[data-combo-id]');
      if (comboBtn && appState.snapshot) {
        const combo = appState.snapshot.combos.find((c) => c.id === comboBtn.dataset.comboId);
        if (!combo) return;
        for (const itemId of combo.itemIds) {
          appState.cart[itemId] = (appState.cart[itemId] || 0) + 1;
        }
        appState.comboDiscount += combo.discount;
        showToast(`Added ${combo.name}`);
        renderStudentView();
      }
    });

    document.getElementById('clear-cart-btn').addEventListener('click', () => {
      appState.cart = {};
      appState.comboDiscount = 0;
      renderStudentView();
    });

    const mobileJump = document.getElementById('mobile-cart-jump');
    if (mobileJump) {
      mobileJump.addEventListener('click', () => {
        document.getElementById('cart-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    document.getElementById('place-order-btn').addEventListener('click', async () => {
      const items = Object.entries(appState.cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ id, qty }));
      if (items.length === 0) return;

      const placeBtn = document.getElementById('place-order-btn');
      placeBtn.disabled = true;
      placeBtn.textContent = 'Ordering...';
      try {
        const slot = appState.pickupMode === 'now'
          ? 'Pickup Now'
          : document.getElementById('pickup-slot').value;

        const result = await apiRequest('/api/orders', {
          method: 'POST',
          body: JSON.stringify({
            items,
            discount: appState.comboDiscount,
            customerName: document.getElementById('customer-name').value.trim() || 'Student',
            slot,
            paymentMode: document.getElementById('payment-mode').value,
          }),
        });
        if (!appState.myOrderIds.includes(result.order.id)) {
          appState.myOrderIds.unshift(result.order.id);
        }
        appState.myOrderPins[result.order.id] = result.order.pin;
        saveStoredOrders(appState.myOrderPins);
        appState.cart = {};
        appState.comboDiscount = 0;
        handleSnapshot(result.snapshot);
        showToast(`Token ${result.order.token} • PIN ${result.order.pin}`);
        document.getElementById('my-tokens-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
        showToast(err.message);
      } finally {
        placeBtn.textContent = 'Get Token →';
        renderCart();
      }
    });

    const loginForm = document.getElementById('vendor-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userEl = document.getElementById('vendor-login-user');
        const passEl = document.getElementById('vendor-login-pass');
        const errEl = document.getElementById('vendor-login-error');
        const btnEl = document.getElementById('vendor-login-btn');

        errEl.classList.add('hidden');
        btnEl.disabled = true;
        btnEl.textContent = 'Signing in...';
        try {
          const data = await apiRequest('/api/vendor/login', {
            method: 'POST',
            body: JSON.stringify({
              username: userEl.value.trim(),
              password: passEl.value,
            }),
          });
          appState.vendorSession = {
            checked: true,
            authenticated: Boolean(data.authenticated),
            vendor: data.vendor || null,
          };
          appState.renderKeys.vendorOrders = '';
          passEl.value = '';
          renderVendorView();
          showToast(`Signed in as ${data.vendor.displayName}`);
        } catch (err) {
          errEl.textContent = err.message || 'Invalid credentials.';
          errEl.classList.remove('hidden');
        } finally {
          btnEl.disabled = false;
          btnEl.textContent = 'Sign In to Counter';
        }
      });
    }

    const demoLoginBtn = document.getElementById('vendor-demo-login-btn');
    if (demoLoginBtn) {
      demoLoginBtn.addEventListener('click', async () => {
        const errEl = document.getElementById('vendor-login-error');
        if (errEl) errEl.classList.add('hidden');
        demoLoginBtn.disabled = true;
        demoLoginBtn.textContent = 'Opening Demo Vendor...';
        try {
          const data = await apiRequest('/api/vendor/demo-login', { method: 'POST' });
          appState.vendorSession = {
            checked: true,
            authenticated: Boolean(data.authenticated),
            vendor: data.vendor || null,
          };
          appState.renderKeys.vendorOrders = '';
          renderVendorView();
          showToast(`Signed in as ${data.vendor.displayName}`);
        } catch (err) {
          if (errEl) {
            errEl.textContent = err.message || 'Demo login failed.';
            errEl.classList.remove('hidden');
          }
        } finally {
          demoLoginBtn.disabled = false;
          demoLoginBtn.textContent = 'Sign in as Demo';
        }
      });
    }

    const logoutBtn = document.getElementById('vendor-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await apiRequest('/api/vendor/logout', { method: 'POST' });
        } catch {
          // ignore logout errors
        }
        appState.vendorSession = { checked: true, authenticated: false, vendor: null };
        appState.vendorPins = {};
        appState.renderKeys.vendorOrders = '';
        renderVendorView();
        showToast('Signed out of Vendor Counter');
      });
    }

    const submitPinVerify = async (orderId, triggerBtn) => {
      const inputEl = document.querySelector(`[data-pin-input="${CSS.escape(orderId)}"]`);
      const pin = (inputEl ? inputEl.value : appState.vendorPins[orderId] || '').trim();
      if (!/^\d{4}$/.test(pin)) {
        showToast('Enter a valid 4-digit PIN.');
        if (inputEl) inputEl.focus();
        return;
      }

      if (triggerBtn) triggerBtn.disabled = true;
      try {
        const data = await apiRequest(`/api/orders/${encodeURIComponent(orderId)}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'delivered', pin }),
        });
        delete appState.vendorPins[orderId];
        handleSnapshot(data.snapshot);
        showToast(`Verified & handed over ${data.token} — Order cleared!`);
      } catch (err) {
        if (!handleVendorUnauthorized(err)) {
          showToast(err.message);
          if (triggerBtn) triggerBtn.disabled = false;
          if (inputEl) inputEl.focus();
        }
      }
    };

    document.getElementById('view-vendor').addEventListener('input', (e) => {
      const pinInput = e.target.closest('[data-pin-input]');
      if (pinInput) {
        const clean = pinInput.value.replace(/\D/g, '').slice(0, 4);
        if (pinInput.value !== clean) pinInput.value = clean;
        appState.vendorPins[pinInput.dataset.pinInput] = clean;
      }
    });

    document.getElementById('view-vendor').addEventListener('keydown', (e) => {
      const pinInput = e.target.closest('[data-pin-input]');
      if (pinInput && e.key === 'Enter') {
        e.preventDefault();
        const orderId = pinInput.dataset.pinInput;
        const btn = document.querySelector(`[data-verify-order="${CSS.escape(orderId)}"]`);
        submitPinVerify(orderId, btn);
      }
    });

    document.getElementById('view-vendor').addEventListener('click', async (e) => {
      const verifyBtn = e.target.closest('[data-verify-order]');
      if (verifyBtn) {
        await submitPinVerify(verifyBtn.dataset.verifyOrder, verifyBtn);
        return;
      }

      const orderBtn = e.target.closest('[data-order-id]');
      if (orderBtn) {
        orderBtn.disabled = true;
        try {
          const data = await apiRequest(`/api/orders/${encodeURIComponent(orderBtn.dataset.orderId)}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: orderBtn.dataset.nextStatus }),
          });
          handleSnapshot(data.snapshot);
        } catch (err) {
          if (!handleVendorUnauthorized(err)) {
            showToast(err.message);
            orderBtn.disabled = false;
          }
        }
        return;
      }

      const stockBtn = e.target.closest('[data-toggle-stock]');
      if (stockBtn) {
        try {
          const data = await apiRequest(`/api/menu/${encodeURIComponent(stockBtn.dataset.toggleStock)}/toggle`, {
            method: 'PATCH',
          });
          handleSnapshot(data.snapshot);
        } catch (err) {
          if (!handleVendorUnauthorized(err)) {
            showToast(err.message);
          }
        }
      }
    });

    document.getElementById('walkin-express-btn').addEventListener('click', async () => {
      try {
        const data = await apiRequest('/api/walkin', { method: 'POST', body: JSON.stringify({ lane: 'express' }) });
        handleSnapshot(data.snapshot);
        showToast(`Walk-in ${data.order.token} • PIN ${data.order.pin}`);
      } catch (err) {
        if (!handleVendorUnauthorized(err)) showToast(err.message);
      }
    });

    document.getElementById('walkin-fresh-btn').addEventListener('click', async () => {
      try {
        const data = await apiRequest('/api/walkin', { method: 'POST', body: JSON.stringify({ lane: 'fresh' }) });
        handleSnapshot(data.snapshot);
        showToast(`Walk-in ${data.order.token} • PIN ${data.order.pin}`);
      } catch (err) {
        if (!handleVendorUnauthorized(err)) showToast(err.message);
      }
    });

    const triggerRush = async () => {
      try {
        const data = await apiRequest('/api/demo/rush', { method: 'POST' });
        handleSnapshot(data.snapshot);
        showToast('Rush simulated');
      } catch (err) {
        if (!handleVendorUnauthorized(err)) showToast(err.message);
      }
    };

    const triggerReset = async () => {
      try {
        const data = await apiRequest('/api/demo/reset', { method: 'POST' });
        appState.myOrderIds = [];
        appState.myOrderPins = {};
        appState.vendorPins = {};
        saveStoredOrders(appState.myOrderPins);
        handleSnapshot(data.snapshot);
        showToast('Reset done');
      } catch (err) {
        if (!handleVendorUnauthorized(err)) showToast(err.message);
      }
    };

    document.getElementById('simulate-rush-btn').addEventListener('click', triggerRush);
    document.getElementById('reset-demo-btn').addEventListener('click', triggerReset);
    document.getElementById('demo-rush-btn').addEventListener('click', triggerRush);
    document.getElementById('demo-reset-btn').addEventListener('click', triggerReset);

    document.getElementById('lan-url-select').addEventListener('change', renderQrView);
    document.getElementById('custom-qr-url').addEventListener('input', renderQrView);
    document.getElementById('print-qr-btn').addEventListener('click', () => window.print());

    const updateClock = () => {
      const el = document.getElementById('board-clock');
      if (el) el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    updateClock();
    setInterval(updateClock, 10000);
  }

  bindEvents();
  checkVendorSession();
  setView(appState.view);
  connectLiveSync();
})();
