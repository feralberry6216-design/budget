/* NestEgg data: the Rivera family's November 2026 budget.
   Seed records plus a tiny localStorage store, so every edit the
   family makes persists in this browser and shows on every page. */
(function (global) {
  'use strict';

  var STORE_KEY = 'nestegg-rivera-v1';

  var CATEGORIES = [
    { id: 'housing',      name: 'Housing',      color: '#0f766e' },
    { id: 'groceries',    name: 'Groceries',    color: '#2f7d32' },
    { id: 'utilities',    name: 'Utilities',    color: '#5b7fa6' },
    { id: 'transport',    name: 'Transport',    color: '#7a5af8' },
    { id: 'dining',       name: 'Dining out',   color: '#c2410c' },
    { id: 'kids',         name: 'Kids & school', color: '#db2777' },
    { id: 'health',       name: 'Health',       color: '#0891b2' },
    { id: 'fun',          name: 'Entertainment', color: '#b45309' },
    { id: 'clothing',     name: 'Clothing',     color: '#64748b' },
    { id: 'misc',         name: 'Miscellaneous', color: '#94a3b8' },
    { id: 'income',       name: 'Income',       color: '#1a7f37' },
    { id: 'savings',      name: 'Savings',      color: '#0b5a54' }
  ];

  /* Monthly budgets for November 2026, in dollars. */
  var BUDGETS = {
    housing: 1850, groceries: 720, utilities: 310, transport: 380,
    dining: 240, kids: 420, health: 260, fun: 150, clothing: 120, misc: 150
  };

  /* Savings goals: what the family is working toward. */
  var GOALS = [
    { id: 'g-emergency', name: 'Emergency fund', target: 12000, saved: 8450,
      note: 'Six months of essentials, kept in a high-yield savings account.' },
    { id: 'g-vacation', name: 'Summer road trip', target: 3500, saved: 1920,
      note: 'Two weeks driving the coast in July — gas, motels and ice cream.' },
    { id: 'g-car', name: 'Next car down payment', target: 6000, saved: 2300,
      note: 'Replace the 2014 sedan before its next big repair bill.' }
  ];

  /* Bills that repeat every month, so the dashboard can warn about them. */
  var BILLS = [
    { name: 'Mortgage — First Community Bank', amount: 1650, day: 1, category: 'housing' },
    { name: 'Electric — City Power', amount: 142, day: 12, category: 'utilities' },
    { name: 'Internet — Northline Fiber', amount: 79, day: 15, category: 'utilities' },
    { name: 'Water & sewer', amount: 64, day: 18, category: 'utilities' },
    { name: 'Car insurance — two cars', amount: 186, day: 20, category: 'transport' },
    { name: 'Phone plan — family of three', amount: 112, day: 22, category: 'utilities' },
    { name: 'Sofia’s piano lessons', amount: 160, day: 25, category: 'kids' }
  ];

  /* November 2026 transactions, newest first. Amounts in dollars;
     income is positive, spending is negative. */
  var TRANSACTIONS = [
    { id: 't01', date: '2026-11-25', desc: 'Daniel — salary, Nov 15–30', category: 'income', amount: 2700 },
    { id: 't02', date: '2026-11-24', desc: 'Weekly shop — Green Valley Market', category: 'groceries', amount: -168.40 },
    { id: 't03', date: '2026-11-23', desc: 'Gas — Shell, Route 9', category: 'transport', amount: -41.20 },
    { id: 't04', date: '2026-11-22', desc: 'Sofia’s school lunch account', category: 'kids', amount: -45.00 },
    { id: 't05', date: '2026-11-21', desc: 'Pizza night — Tony’s', category: 'dining', amount: -38.75 },
    { id: 't06', date: '2026-11-20', desc: 'Maya — freelance invoice #118', category: 'income', amount: 640.00 },
    { id: 't07', date: '2026-11-19', desc: 'Pharmacy — Sofia’s allergy meds', category: 'health', amount: -27.60 },
    { id: 't08', date: '2026-11-18', desc: 'Weekly shop — Green Valley Market', category: 'groceries', amount: -154.90 },
    { id: 't09', date: '2026-11-17', desc: 'Movie night — two tickets + popcorn', category: 'fun', amount: -34.00 },
    { id: 't10', date: '2026-11-16', desc: 'Bus pass — Daniel, December', category: 'transport', amount: -58.00 },
    { id: 't11', date: '2026-11-15', desc: 'Internet — Northline Fiber', category: 'utilities', amount: -79.00 },
    { id: 't12', date: '2026-11-14', desc: 'Winter coat — Sofia', category: 'clothing', amount: -89.99 },
    { id: 't13', date: '2026-11-13', desc: 'Takeout — Siam Garden', category: 'dining', amount: -42.30 },
    { id: 't14', date: '2026-11-12', desc: 'Electric — City Power', category: 'utilities', amount: -142.00 },
    { id: 't15', date: '2026-11-11', desc: 'Weekly shop — Green Valley Market', category: 'groceries', amount: -171.25 },
    { id: 't16', date: '2026-11-10', desc: 'Daniel — salary, Nov 1–14', category: 'income', amount: 2700.00 },
    { id: 't17', date: '2026-11-09', desc: 'Dentist checkup — Maya', category: 'health', amount: -95.00 },
    { id: 't18', date: '2026-11-08', desc: 'Gas — Shell, Route 9', category: 'transport', amount: -38.60 },
    { id: 't19', date: '2026-11-07', desc: 'Sofia’s piano lessons — November', category: 'kids', amount: -160.00 },
    { id: 't20', date: '2026-11-06', desc: 'Maya — freelance invoice #117', category: 'income', amount: 585.00 },
    { id: 't21', date: '2026-11-05', desc: 'Weekly shop — Green Valley Market', category: 'groceries', amount: -149.80 },
    { id: 't22', date: '2026-11-04', desc: 'Streaming — family plan', category: 'fun', amount: -15.99 },
    { id: 't23', date: '2026-11-03', desc: 'School field trip — Sofia', category: 'kids', amount: -28.00 },
    { id: 't24', date: '2026-11-02', desc: 'Coffee & pastries — Sunday bakery', category: 'dining', amount: -18.50 },
    { id: 't25', date: '2026-11-01', desc: 'Mortgage — First Community Bank', category: 'housing', amount: -1650.00 },
    { id: 't26', date: '2026-11-01', desc: 'Transfer to emergency fund', category: 'savings', amount: -900.00 },
    { id: 't27', date: '2026-10-28', desc: 'Weekly shop — Green Valley Market', category: 'groceries', amount: -162.10 },
    { id: 't28', date: '2026-10-25', desc: 'Daniel — salary, Oct 15–31', category: 'income', amount: 2700.00 },
    { id: 't29', date: '2026-10-22', desc: 'Maya — freelance invoice #116', category: 'income', amount: 720.00 },
    { id: 't30', date: '2026-10-15', desc: 'Electric — City Power', category: 'utilities', amount: -131.00 }
  ];

  /* Monthly totals for the trend chart (May–October, actuals). */
  var MONTHLY = [
    { month: '2026-06', label: 'Jun', income: 7180, spending: 4920 },
    { month: '2026-07', label: 'Jul', income: 7390, spending: 5310 },
    { month: '2026-08', label: 'Aug', income: 7265, spending: 5180 },
    { month: '2026-09', label: 'Sep', income: 7510, spending: 5040 },
    { month: '2026-10', label: 'Oct', income: 7445, spending: 4875 },
    { month: '2026-11', label: 'Nov', income: 6625, spending: 3529 }
  ];

  function seedState() {
    /* Deep-copy the seed records so edits never mutate the originals
       and a reset always restores the exact starting data. */
    var seed = {
      version: 1,
      household: 'The Rivera Family',
      members: 'Maya & Daniel Rivera, and Sofia (9)',
      month: '2026-11',
      categories: CATEGORIES,
      budgets: BUDGETS,
      goals: GOALS,
      bills: BILLS,
      transactions: TRANSACTIONS,
      monthly: MONTHLY
    };
    return JSON.parse(JSON.stringify(seed));
  }

  function loadState() {
    try {
      var raw = global.localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1 && Array.isArray(parsed.transactions)) return parsed;
      }
    } catch (e) { /* corrupted storage: fall back to the seed */ }
    return seedState();
  }

  function saveState(state) {
    try { global.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }

  function resetState() {
    var fresh = seedState();
    saveState(fresh);
    return fresh;
  }

  function nextId(state) {
    var n = state.transactions.length + 1;
    var id = 't' + String(n).padStart(2, '0');
    while (state.transactions.some(function (t) { return t.id === id; })) {
      n += 1;
      id = 't' + String(n).padStart(2, '0');
    }
    return id;
  }

  global.NestEggData = {
    STORE_KEY: STORE_KEY,
    loadState: loadState,
    saveState: saveState,
    resetState: resetState,
    nextId: nextId,
    seedState: seedState
  };
})(window);
