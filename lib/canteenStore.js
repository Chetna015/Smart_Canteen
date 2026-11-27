const os = require('os');
const { getConfig, supabaseRequest } = require('./supabaseClient');

const META_ID = 'default';

const DEFAULT_MENU = [
  { id: 'samosa', name: 'Crispy Samosa (2 pcs)', desc: 'Golden spiced potato samosas served hot with mint & tamarind chutney.', price: 25, lane: 'express', prepMins: 1, category: 'Snacks', icon: '🥟', image: '/images/samosa.jpg', inStock: true, sortOrder: 1 },
  { id: 'chai', name: 'Masala Chai', desc: 'Hot ginger-cardamom tea brewed fresh in classic kulhad style.', price: 15, lane: 'express', prepMins: 1, category: 'Beverages', icon: '☕', image: '/images/chai.jpg', inStock: true, sortOrder: 2 },
  { id: 'patties', name: 'Aloo Patties', desc: 'Flaky baked puff pastry stuffed with warm spiced aloo masala.', price: 25, lane: 'express', prepMins: 1, category: 'Snacks', icon: '🥐', image: '/images/patties.jpg', inStock: true, sortOrder: 3 },
  { id: 'cold-coffee', name: 'Cold Coffee', desc: 'Chilled creamy café-style iced coffee topped with chocolate drizzle.', price: 45, lane: 'express', prepMins: 2, category: 'Beverages', icon: '🧋', image: '/images/cold-coffee.jpg', inStock: true, sortOrder: 4 },
  { id: 'nimbu-pani', name: 'Fresh Nimbu Soda', desc: 'Chilled sparkling lime cooler with fresh mint leaves & rock salt.', price: 20, lane: 'express', prepMins: 1, category: 'Beverages', icon: '🍋', image: '/images/nimbu-pani.jpg', inStock: true, sortOrder: 5 },
  { id: 'maggi', name: 'Masala Veg Maggi', desc: 'Steaming street-style noodles tossed with green peas & veggies.', price: 45, lane: 'fresh', prepMins: 6, category: 'Fresh Cooked', icon: '🍜', image: '/images/maggi.jpg', inStock: true, sortOrder: 6 },
  { id: 'sandwich', name: 'Paneer Grill Sandwich', desc: 'Crisp toasted sandwich loaded with spiced paneer, cheese & herbs.', price: 60, lane: 'fresh', prepMins: 7, category: 'Fresh Cooked', icon: '🥪', image: '/images/sandwich.jpg', inStock: true, sortOrder: 7 },
  { id: 'dosa', name: 'Crispy Masala Dosa', desc: 'Golden fermented crepe with spiced potato mash, sambar & chutneys.', price: 70, lane: 'fresh', prepMins: 8, category: 'Fresh Cooked', icon: '🥞', image: '/images/dosa.jpg', inStock: true, sortOrder: 8 },
  { id: 'chole-bhature', name: 'Chole Bhature', desc: 'Fluffy golden bhature paired with rich Amritsari chole & pickled onions.', price: 75, lane: 'fresh', prepMins: 8, category: 'Fresh Cooked', icon: '🍛', image: '/images/chole-bhature.jpg', inStock: true, sortOrder: 9 },
];

const MENU_EXTRAS = Object.fromEntries(DEFAULT_MENU.map((m) => [m.id, { desc: m.desc, image: m.image }]));

const QUICK_COMBOS = [
  { id: 'combo-morning', name: 'Morning Rush Combo', desc: 'Samosa + Masala Chai', itemIds: ['samosa', 'chai'], discount: 5, lane: 'express' },
  { id: 'combo-break', name: '10-Min Break Combo', desc: 'Veg Maggi + Nimbu Soda', itemIds: ['maggi', 'nimbu-pani'], discount: 5, lane: 'fresh' },
  { id: 'combo-study', name: 'Evening Fuel Combo', desc: 'Aloo Patties + Cold Coffee', itemIds: ['patties', 'cold-coffee'], discount: 10, lane: 'express' },
];

const PICKUP_SLOTS = ['Pickup Now', '11:10 AM Break', '1:00 PM Lunch', '3:15 PM Break'];

const PEAK_HOURLY_STATS = [
  { label: '9 AM', orders: 18 },
  { label: '10 AM', orders: 26 },
  { label: '11 AM', orders: 64 },
  { label: '12 PM', orders: 42 },
  { label: '1 PM', orders: 95 },
  { label: '2 PM', orders: 38 },
  { label: '3 PM', orders: 58 },
  { label: '4 PM', orders: 29 },
];

function createSeedOrders(now = Date.now()) {
  return [
    {
      id: 'ord-seed-1',
      token: '#E-101',
      pin: '4821',
      lane: 'express',
      source: 'qr',
      customerName: 'Aarav (CSE-1)',
      slot: 'Pickup Now',
      paymentMode: 'UPI / Instant',
      items: [
        { id: 'samosa', name: 'Crispy Samosa (2 pcs)', qty: 1, price: 25, lane: 'express' },
        { id: 'chai', name: 'Masala Chai', qty: 1, price: 15, lane: 'express' },
      ],
      total: 40,
      status: 'ready',
      createdAt: now - 4 * 60000,
      updatedAt: now - 30000,
    },
    {
      id: 'ord-seed-2',
      token: '#F-201',
      pin: '7394',
      lane: 'fresh',
      source: 'qr',
      customerName: 'Priya (CSE-2)',
      slot: 'Pickup Now',
      paymentMode: 'UPI / Instant',
      items: [{ id: 'maggi', name: 'Masala Veg Maggi', qty: 1, price: 45, lane: 'fresh' }],
      total: 45,
      status: 'preparing',
      createdAt: now - 3 * 60000,
      updatedAt: now - 60000,
    },
    {
      id: 'ord-seed-3',
      token: '#E-102',
      pin: '1950',
      lane: 'express',
      source: 'walkin',
      customerName: 'Walk-in Cash',
      slot: 'Pickup Now',
      paymentMode: 'Cash at Counter',
      items: [{ id: 'patties', name: 'Aloo Patties', qty: 2, price: 25, lane: 'express' }],
      total: 50,
      status: 'queued',
      createdAt: now - 90000,
      updatedAt: now - 90000,
    },
    {
      id: 'ord-seed-4',
      token: '#F-202',
      pin: '6108',
      lane: 'fresh',
      source: 'qr',
      customerName: 'Rohan (ECE-1)',
      slot: 'Pickup Now',
      paymentMode: 'UPI / Instant',
      items: [{ id: 'sandwich', name: 'Paneer Grill Sandwich', qty: 1, price: 60, lane: 'fresh' }],
      total: 60,
      status: 'queued',
      createdAt: now - 45000,
      updatedAt: now - 45000,
    },
  ];
}

// In-memory fallback used only when SUPABASE_URL / SUPABASE_SECRET_KEY are unset
function createMemoryState() {
  return {
    menu: DEFAULT_MENU.map((m) => ({ ...m })),
    counters: { express: 103, fresh: 202 },
    totalDeliveredToday: 42,
    orders: createSeedOrders(),
  };
}

let memoryState = createMemoryState();

function getLanUrls(port = Number(process.env.PORT) || 3000) {
  const interfaces = os.networkInterfaces();
  const urls = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        urls.push({ interface: name, ip: iface.address, url: `http://${iface.address}:${port}` });
      }
    }
  }
  return urls;
}

function computeCrowdMetrics(orders, totalDeliveredToday) {
  const activeOrders = orders.filter((o) => o.status === 'queued' || o.status === 'preparing');
  const expressActive = activeOrders.filter((o) => o.lane === 'express').length;
  const freshActive = activeOrders.filter((o) => o.lane === 'fresh').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  const expressWaitMins = Math.max(1, expressActive + (expressActive > 0 ? 1 : 0));
  const freshWaitMins = Math.max(2, freshActive * 3 + (freshActive > 0 ? 2 : 0));
  const overallWaitMins = Math.round(expressActive * 1.2 + freshActive * 2.5);

  let level = 'green';
  let label = 'Low Crowd — Walk Right In';
  if (overallWaitMins >= 13 || activeOrders.length >= 9) {
    level = 'red';
    label = 'Heavy Rush — Pre-Order Recommended';
  } else if (overallWaitMins >= 6 || activeOrders.length >= 5) {
    level = 'yellow';
    label = 'Moderate Queue — Pre-Order Saves Time';
  }

  return {
    level,
    label,
    activeQueueCount: activeOrders.length,
    expressActive,
    freshActive,
    readyCount,
    expressWaitMins,
    freshWaitMins,
    estimatedWaitMins: Math.max(2, overallWaitMins),
    totalDeliveredToday,
  };
}

function formatSnapshot(menu, orders, totalDeliveredToday, backendMode) {
  const visibleOrders = orders
    .filter((o) => o.status !== 'delivered')
    .map(({ pin, ...rest }) => ({
      ...rest,
      pinRequired: rest.status === 'ready',
    }));

  return {
    menu,
    combos: QUICK_COMBOS,
    pickupSlots: PICKUP_SLOTS,
    peakStats: PEAK_HOURLY_STATS,
    orders: visibleOrders,
    crowd: computeCrowdMetrics(visibleOrders, totalDeliveredToday),
    network: {
      port: Number(process.env.PORT) || 3000,
      lanUrls: process.env.VERCEL ? [] : getLanUrls(),
    },
    storage: backendMode,
    serverTime: Date.now(),
  };
}

function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function toDbMenu(item) {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    lane: item.lane,
    prep_mins: item.prepMins,
    category: item.category,
    icon: item.icon,
    in_stock: item.inStock,
    sort_order: item.sortOrder,
  };
}

function fromDbMenu(row) {
  const extra = MENU_EXTRAS[row.id] || {};
  return {
    id: row.id,
    name: row.name,
    desc: extra.desc || '',
    image: extra.image || '',
    price: row.price,
    lane: row.lane,
    prepMins: row.prep_mins,
    category: row.category,
    icon: row.icon,
    inStock: row.in_stock,
    sortOrder: row.sort_order,
  };
}

function toDbOrder(order) {
  return {
    id: order.id,
    token: order.token,
    pin: order.pin,
    lane: order.lane,
    source: order.source,
    customer_name: order.customerName,
    slot: order.slot,
    payment_mode: order.paymentMode,
    items: order.items,
    total: order.total,
    status: order.status,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

function fromDbOrder(row) {
  return {
    id: row.id,
    token: row.token,
    pin: row.pin,
    lane: row.lane,
    source: row.source,
    customerName: row.customer_name,
    slot: row.slot,
    paymentMode: row.payment_mode,
    items: Array.isArray(row.items) ? row.items : [],
    total: row.total,
    status: row.status,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

async function ensureSupabaseSeeded() {
  const [metaRows, menuRows] = await Promise.all([
    supabaseRequest(`canteen_meta?id=eq.${META_ID}&select=*`),
    supabaseRequest('menu_items?select=id&limit=1'),
  ]);

  if (!metaRows || metaRows.length === 0) {
    await supabaseRequest('canteen_meta', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: { id: META_ID, express_counter: 103, fresh_counter: 202, total_delivered_today: 42 },
    });
  }

  if (!menuRows || menuRows.length === 0) {
    await supabaseRequest('menu_items', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: DEFAULT_MENU.map(toDbMenu),
    });
    const existingOrders = await supabaseRequest('orders?select=id&limit=1');
    if (!existingOrders || existingOrders.length === 0) {
      await supabaseRequest('orders', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: createSeedOrders().map(toDbOrder),
      });
    }
  }
}

async function loadSupabaseState() {
  await ensureSupabaseSeeded();
  const [metaRows, menuRows, orderRows] = await Promise.all([
    supabaseRequest(`canteen_meta?id=eq.${META_ID}&select=*`),
    supabaseRequest('menu_items?select=*&order=sort_order.asc'),
    supabaseRequest('orders?select=*&order=created_at.desc&limit=50'),
  ]);

  const meta = metaRows[0] || { express_counter: 103, fresh_counter: 202, total_delivered_today: 42 };
  return {
    meta,
    menu: menuRows.map(fromDbMenu),
    orders: orderRows.map(fromDbOrder),
  };
}

async function bumpCounterSupabase(meta, lane) {
  const col = lane === 'express' ? 'express_counter' : 'fresh_counter';
  const nextVal = Number(meta[col]) + 1;
  await supabaseRequest(`canteen_meta?id=eq.${META_ID}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: { [col]: nextVal, updated_at: new Date().toISOString() },
  });
  meta[col] = nextVal;
  return `#${lane === 'express' ? 'E' : 'F'}-${nextVal}`;
}

function makeAppError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function isSupabaseSetupError(err) {
  return err && (
    err.code === 'PGRST205'
    || err.code === '42P01'
    || err.code === '42501'
    || String(err.message || '').includes('schema cache')
  );
}

let warnedSetup = false;
function shouldUseSupabase() {
  return getConfig().enabled;
}

function handleMissingTableFallback(err) {
  if (!isSupabaseSetupError(err)) throw err;
  if (!warnedSetup) {
    warnedSetup = true;
    console.warn('[QuickLunch] Supabase setup pending (run supabase/schema.sql including GRANT lines in Supabase SQL Editor). Using in-memory fallback meanwhile.');
  }
}

async function getPublicSnapshot() {
  if (shouldUseSupabase()) {
    try {
      const { meta, menu, orders } = await loadSupabaseState();
      return formatSnapshot(menu, orders, meta.total_delivered_today, 'supabase');
    } catch (err) {
      handleMissingTableFallback(err);
    }
  }
  return formatSnapshot(memoryState.menu, memoryState.orders, memoryState.totalDeliveredToday, 'memory');
}

async function createOrder(body) {
  const reqItems = Array.isArray(body.items) ? body.items : [];
  if (reqItems.length === 0) {
    throw makeAppError(400, 'Please select at least one menu item.');
  }

  let useDb = shouldUseSupabase();
  let dbState = null;
  if (useDb) {
    try {
      dbState = await loadSupabaseState();
    } catch (err) {
      handleMissingTableFallback(err);
      useDb = false;
    }
  }
  const menu = useDb ? dbState.menu : memoryState.menu;

  const resolvedItems = [];
  let hasFresh = false;
  let total = 0;

  for (const entry of reqItems) {
    const menuItem = menu.find((m) => m.id === entry.id);
    const qty = Math.max(1, Math.min(10, Number(entry.qty) || 1));
    if (!menuItem) continue;
    if (!menuItem.inStock) {
      throw makeAppError(409, `${menuItem.name} just went out of stock.`);
    }
    if (menuItem.lane === 'fresh') hasFresh = true;
    total += menuItem.price * qty;
    resolvedItems.push({
      id: menuItem.id,
      name: menuItem.name,
      qty,
      price: menuItem.price,
      lane: menuItem.lane,
    });
  }

  if (resolvedItems.length === 0) {
    throw makeAppError(400, 'No valid items found in order.');
  }

  const discount = Math.max(0, Number(body.discount) || 0);
  const finalTotal = Math.max(1, total - discount);
  const lane = hasFresh ? 'fresh' : 'express';
  const now = Date.now();

  let token;
  if (useDb) {
    token = await bumpCounterSupabase(dbState.meta, lane);
  } else {
    memoryState.counters[lane] += 1;
    token = `#${lane === 'express' ? 'E' : 'F'}-${memoryState.counters[lane]}`;
  }

  const order = {
    id: `ord-${now}-${Math.random().toString(36).slice(2, 6)}`,
    token,
    pin: generatePin(),
    lane,
    source: 'qr',
    customerName: String(body.customerName || 'Student').trim().slice(0, 32) || 'Student',
    slot: PICKUP_SLOTS.includes(body.slot) ? body.slot : 'Pickup Now',
    paymentMode: body.paymentMode === 'Cash at Counter' ? 'Cash at Counter' : 'UPI / Instant',
    items: resolvedItems,
    total: finalTotal,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
  };

  if (useDb) {
    await supabaseRequest('orders', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: toDbOrder(order),
    });
  } else {
    memoryState.orders.unshift(order);
  }

  return { order, snapshot: await getPublicSnapshot() };
}

async function createWalkin(body) {
  const lane = body.lane === 'fresh' ? 'fresh' : 'express';
  const now = Date.now();
  let useDb = shouldUseSupabase();
  let dbState = null;
  if (useDb) {
    try {
      dbState = await loadSupabaseState();
    } catch (err) {
      handleMissingTableFallback(err);
      useDb = false;
    }
  }

  let token;
  if (useDb) {
    token = await bumpCounterSupabase(dbState.meta, lane);
  } else {
    memoryState.counters[lane] += 1;
    token = `#${lane === 'express' ? 'E' : 'F'}-${memoryState.counters[lane]}`;
  }

  const defaultItem = lane === 'express'
    ? { id: 'samosa', name: 'Walk-in Express Order', qty: 1, price: 25, lane: 'express' }
    : { id: 'maggi', name: 'Walk-in Fresh Order', qty: 1, price: 45, lane: 'fresh' };

  const order = {
    id: `ord-${now}-${Math.random().toString(36).slice(2, 6)}`,
    token,
    pin: generatePin(),
    lane,
    source: 'walkin',
    customerName: 'Walk-in Cash',
    slot: 'Pickup Now',
    paymentMode: 'Cash at Counter',
    items: [defaultItem],
    total: defaultItem.price,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
  };

  if (useDb) {
    await supabaseRequest('orders', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: toDbOrder(order),
    });
  } else {
    memoryState.orders.unshift(order);
  }

  return { order, snapshot: await getPublicSnapshot() };
}

const VALID_STATUS_TRANSITIONS = {
  queued: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

function validateOrderTransition(current, nextStatus, pin) {
  if (VALID_STATUS_TRANSITIONS[current.status] !== nextStatus) {
    throw makeAppError(400, `Cannot change order from "${current.status}" to "${nextStatus}".`);
  }
  if (nextStatus === 'delivered') {
    const cleanPin = String(pin || '').trim();
    if (!cleanPin) {
      throw makeAppError(400, 'Please enter the 4-digit pickup PIN.');
    }
    if (cleanPin !== String(current.pin)) {
      throw makeAppError(403, 'Incorrect PIN. Please verify with the student.');
    }
  }
}

async function updateOrderStatus(orderId, status, pin) {
  const allowed = ['preparing', 'ready', 'delivered'];
  if (!allowed.includes(status)) {
    throw makeAppError(400, 'Invalid status value.');
  }

  let useDb = shouldUseSupabase();
  if (useDb) {
    try {
      const rows = await supabaseRequest(`orders?id=eq.${encodeURIComponent(orderId)}&select=*`);
      if (!rows || rows.length === 0) {
        throw makeAppError(404, 'Order not found.');
      }
      const current = fromDbOrder(rows[0]);
      validateOrderTransition(current, status, pin);

      if (status === 'delivered') {
        const metaRows = await supabaseRequest(`canteen_meta?id=eq.${META_ID}&select=total_delivered_today`);
        const nextDelivered = ((metaRows[0] && metaRows[0].total_delivered_today) || 0) + 1;
        await supabaseRequest(`canteen_meta?id=eq.${META_ID}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: { total_delivered_today: nextDelivered, updated_at: new Date().toISOString() },
        });
        await supabaseRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, {
          method: 'DELETE',
          headers: { Prefer: 'return=minimal' },
        });
        return {
          clearedOrderId: orderId,
          token: current.token,
          status: 'delivered',
          snapshot: await getPublicSnapshot(),
        };
      }

      const updatedAt = Date.now();
      await supabaseRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: { status, updated_at: updatedAt },
      });

      const { pin: _hiddenPin, ...safeOrder } = current;
      return { order: { ...safeOrder, status, updatedAt }, snapshot: await getPublicSnapshot() };
    } catch (err) {
      handleMissingTableFallback(err);
      useDb = false;
    }
  }

  const order = memoryState.orders.find((o) => o.id === orderId);
  if (!order) {
    throw makeAppError(404, 'Order not found.');
  }
  validateOrderTransition(order, status, pin);

  if (status === 'delivered') {
    const token = order.token;
    memoryState.totalDeliveredToday += 1;
    memoryState.orders = memoryState.orders.filter((o) => o.id !== orderId);
    return {
      clearedOrderId: orderId,
      token,
      status: 'delivered',
      snapshot: await getPublicSnapshot(),
    };
  }

  order.status = status;
  order.updatedAt = Date.now();
  const { pin: _hiddenPin, ...safeOrder } = order;
  return { order: safeOrder, snapshot: await getPublicSnapshot() };
}

async function toggleMenuStock(itemId) {
  let useDb = shouldUseSupabase();
  if (useDb) {
    try {
      const rows = await supabaseRequest(`menu_items?id=eq.${encodeURIComponent(itemId)}&select=*`);
      if (!rows || rows.length === 0) {
        throw makeAppError(404, 'Menu item not found.');
      }
      const item = fromDbMenu(rows[0]);
      const nextStock = !item.inStock;
      await supabaseRequest(`menu_items?id=eq.${encodeURIComponent(itemId)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: { in_stock: nextStock },
      });
      return { item: { ...item, inStock: nextStock }, snapshot: await getPublicSnapshot() };
    } catch (err) {
      handleMissingTableFallback(err);
      useDb = false;
    }
  }

  const item = memoryState.menu.find((m) => m.id === itemId);
  if (!item) {
    throw makeAppError(404, 'Menu item not found.');
  }
  item.inStock = !item.inStock;
  return { item, snapshot: await getPublicSnapshot() };
}

async function simulateRush() {
  const sampleNames = ['Ananya (CSE-A)', 'Vikram (IT-2)', 'Neha (CSE-B)', 'Kabir (AI-1)', 'Sneha (CSE-A)', 'Arjun (ME-1)'];
  const now = Date.now();
  let useDb = shouldUseSupabase();
  let dbState = null;
  if (useDb) {
    try {
      dbState = await loadSupabaseState();
    } catch (err) {
      handleMissingTableFallback(err);
      useDb = false;
    }
  }
  const menu = useDb ? dbState.menu : memoryState.menu;

  const newOrders = [];
  for (let i = 0; i < 6; i += 1) {
    const isFresh = i % 2 === 1;
    const lane = isFresh ? 'fresh' : 'express';
    const item = isFresh ? menu.find((m) => m.id === 'maggi') : menu.find((m) => m.id === 'samosa');

    let token;
    if (useDb) {
      token = await bumpCounterSupabase(dbState.meta, lane);
    } else {
      memoryState.counters[lane] += 1;
      token = `#${lane === 'express' ? 'E' : 'F'}-${memoryState.counters[lane]}`;
    }

    newOrders.push({
      id: `ord-rush-${now}-${i}`,
      token,
      pin: generatePin(),
      lane,
      source: i === 2 ? 'walkin' : 'qr',
      customerName: i === 2 ? 'Walk-in Cash' : sampleNames[i % sampleNames.length],
      slot: 'Pickup Now',
      paymentMode: i === 2 ? 'Cash at Counter' : 'UPI / Instant',
      items: [{ id: item.id, name: item.name, qty: 1, price: item.price, lane }],
      total: item.price,
      status: i < 2 ? 'preparing' : 'queued',
      createdAt: now - i * 15000,
      updatedAt: now - i * 15000,
    });
  }

  if (useDb) {
    await supabaseRequest('orders', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: newOrders.map(toDbOrder),
    });
  } else {
    memoryState.orders.unshift(...newOrders);
  }

  return { snapshot: await getPublicSnapshot() };
}

async function resetDemo() {
  let useDb = shouldUseSupabase();
  if (useDb) {
    try {
      await supabaseRequest('orders?id=neq.__keep_none__', {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      });
      await supabaseRequest('menu_items?id=neq.__keep_none__', {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      });
      await supabaseRequest('canteen_meta', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: { id: META_ID, express_counter: 103, fresh_counter: 202, total_delivered_today: 42, updated_at: new Date().toISOString() },
      });
      await supabaseRequest('menu_items', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: DEFAULT_MENU.map(toDbMenu),
      });
      await supabaseRequest('orders', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: createSeedOrders().map(toDbOrder),
      });
      return { snapshot: await getPublicSnapshot() };
    } catch (err) {
      handleMissingTableFallback(err);
      useDb = false;
    }
  }

  memoryState = createMemoryState();
  return { snapshot: await getPublicSnapshot() };
}

module.exports = {
  getLanUrls,
  getPublicSnapshot,
  createOrder,
  createWalkin,
  updateOrderStatus,
  toggleMenuStock,
  simulateRush,
  resetDemo,
};
