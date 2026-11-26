/* NestEgg views: one renderer per page. Every control on every page
   reads and writes the same store, so edits show up everywhere. */
(function (global) {
  'use strict';

  var F = global.NestEggFormat;
  var C = global.NestEggCharts;

  function categoryById(state, id) {
    for (var i = 0; i < state.categories.length; i++) {
      if (state.categories[i].id === id) return state.categories[i];
    }
    return { id: id, name: id, color: '#94a3b8' };
  }

  function monthTxns(state, month) {
    return state.transactions.filter(function (t) { return t.date.slice(0, 7) === month; });
  }

  function monthTotals(state, month) {
    var income = 0, spending = 0;
    monthTxns(state, month).forEach(function (t) {
      if (t.category === 'savings') return; /* transfers are neither income nor spending */
      if (t.amount > 0) income += t.amount; else spending += -t.amount;
    });
    return { income: income, spending: spending, saved: income - spending };
  }

  function spentByCategory(state, month) {
    var out = {};
    monthTxns(state, month).forEach(function (t) {
      if (t.amount >= 0 || t.category === 'savings') return;
      out[t.category] = (out[t.category] || 0) + -t.amount;
    });
    return out;
  }

  function catOptions(state, selected) {
    return state.categories.filter(function (c) { return c.id !== 'income'; }).map(function (c) {
      return '<option value="' + c.id + '"' + (c.id === selected ? ' selected' : '') + '>' + F.escapeHtml(c.name) + '</option>';
    }).join('');
  }

  function upcomingBills(state, month) {
    /* Bills whose day has not passed yet in the current month, by the
       latest transaction date as "today" (the family's records end Nov 25). */
    var latest = '2026-11-25';
    var todayDay = Number(latest.slice(8, 10));
    return state.bills
      .filter(function (b) { return b.day >= todayDay; })
      .sort(function (a, b) { return a.day - b.day; })
      .map(function (b) {
        var cat = categoryById(state, b.category);
        return '<tr><td><span class="cat-dot" style="background:' + cat.color + '"></span>' +
          F.escapeHtml(b.name) + '</td><td class="hide-narrow">' + F.escapeHtml(cat.name) +
          '</td><td>Nov ' + b.day + '</td><td class="num">' + F.money(b.amount) + '</td></tr>';
      }).join('');
  }

  function renderDashboard(state) {
    var month = state.month;
    var totals = monthTotals(state, month);
    var rate = totals.income > 0 ? totals.saved / totals.income : 0;
    var byCat = spentByCategory(state, month);
    var slices = state.categories
      .filter(function (c) { return byCat[c.id] && c.id !== 'savings'; })
      .map(function (c) { return { label: c.name, value: byCat[c.id], color: c.color }; })
      .sort(function (a, b) { return b.value - a.value; });
    var legend = slices.map(function (s) {
      return '<li><span><span class="cat-dot" style="background:' + s.color + '"></span>' +
        F.escapeHtml(s.label) + '</span><span class="lg-val">' + F.money(s.value) + '</span></li>';
    }).join('');
    var recent = monthTxns(state, month).slice(0, 5).map(function (t) {
      var cat = categoryById(state, t.category);
      return '<tr><td>' + F.dateLabel(t.date) + '</td><td><span class="cat-dot" style="background:' +
        cat.color + '"></span>' + F.escapeHtml(t.desc) + '</td><td class="num ' +
        (t.amount > 0 ? 'amount-in' : 'amount-out') + '">' + F.signedMoney(t.amount) + '</td></tr>';
    }).join('');
    var overBudget = state.categories.filter(function (c) {
      return state.budgets[c.id] && byCat[c.id] > state.budgets[c.id];
    }).map(function (c) { return c.name; });
    var notice = overBudget.length
      ? '<div class="notice" role="alert"><strong>Heads up:</strong> ' + overBudget.join(', ') +
        ' is over budget this month. See <a href="#/budgets">Budgets</a> for the details.</div>'
      : '<div class="notice"><strong>On track:</strong> every category is inside its November budget. Nice work, Riveras.</div>';
    var bills = upcomingBills(state, month);

    return '' +
      '<div class="page-head"><div><h1>' + F.monthLabel(month) + ' at a glance</h1>' +
      '<p>' + F.escapeHtml(state.household) + ' — ' + F.escapeHtml(state.members) +
      '. Income, spending, savings and what is due next, all in one place.</p></div>' +
      '<a class="btn" href="#/transactions">Add a transaction</a></div>' +
      notice +
      '<div class="grid grid-4" style="margin-bottom:16px">' +
      '<div class="card stat"><div class="label">Income</div><div class="value pos">' + F.money(totals.income) +
      '</div><div class="sub">Paychecks + freelance so far</div></div>' +
      '<div class="card stat"><div class="label">Spending</div><div class="value">' + F.money(totals.spending) +
      '</div><div class="sub">Across ' + slices.length + ' categories</div></div>' +
      '<div class="card stat"><div class="label">Saved</div><div class="value pos">' + F.money(totals.saved) +
      '</div><div class="sub">Income minus spending</div></div>' +
      '<div class="card stat"><div class="label">Savings rate</div><div class="value ' + (rate < 0.15 ? 'warn' : '') + '">' + F.percent(rate) +
      '</div><div class="sub">Goal: 20% of income</div></div>' +
      '</div>' +
      '<div class="grid grid-2">' +
      '<section class="card"><h2>Where the money went</h2>' +
      '<div class="donut-wrap">' + C.donut(slices, 190) + '<ul class="legend">' + legend + '</ul></div></section>' +
      '<section class="card"><h2>Upcoming bills</h2>' +
      '<table><thead><tr><th>Bill</th><th class="hide-narrow">Category</th><th>Due</th><th class="num">Amount</th></tr></thead>' +
      '<tbody>' + bills + '</tbody></table>' +
      '<p class="small muted" style="margin-top:10px">Mortgage, electric and internet are already paid this month.</p></section>' +
      '</div>' +
      '<section class="card" style="margin-top:16px"><h2>Recent transactions</h2>' +
      '<table><thead><tr><th>Date</th><th>What</th><th class="num">Amount</th></tr></thead>' +
      '<tbody>' + recent + '</tbody></table>' +
      '<p style="margin-top:12px"><a href="#/transactions">See all November transactions &rarr;</a></p></section>';
  }

  function renderTransactions(state, filter) {
    filter = filter || {};
    var month = state.month;
    var rows = monthTxns(state, month).slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    if (filter.category) rows = rows.filter(function (t) { return t.category === filter.category; });
    if (filter.q) {
      var q = filter.q.toLowerCase();
      rows = rows.filter(function (t) { return t.desc.toLowerCase().indexOf(q) !== -1; });
    }
    var balance = 0;
    var all = state.transactions.slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
    all.forEach(function (t) { balance += t.amount; });
    var body = rows.map(function (t) {
      var cat = categoryById(state, t.category);
      return '<tr><td>' + F.dateLabel(t.date) + '</td><td><span class="cat-dot" style="background:' +
        cat.color + '"></span>' + F.escapeHtml(t.desc) + '</td><td class="hide-narrow">' +
        F.escapeHtml(cat.name) + '</td><td class="num ' + (t.amount > 0 ? 'amount-in' : 'amount-out') + '">' +
        F.signedMoney(t.amount) + '</td><td class="num"><button class="btn ghost small" data-edit="' + t.id +
        '">Edit</button> <button class="btn danger small" data-delete="' + t.id + '">Delete</button></td></tr>';
    }).join('');
    if (!rows.length) body = '<tr><td colspan="5" class="muted">No transactions match this filter.</td></tr>';

    return '' +
      '<div class="page-head"><div><h1>Transactions</h1>' +
      '<p>Every dollar in and out for ' + F.monthLabel(month) + '. Running balance across all records: <strong>' +
      F.money(balance) + '</strong>.</p></div></div>' +
      '<section class="card" style="margin-bottom:16px"><h2>Add a transaction</h2>' +
      '<form id="addTxnForm"><div class="form-grid">' +
      '<div class="field"><label for="f-date">Date</label><input id="f-date" name="date" type="date" value="2026-11-26" required></div>' +
      '<div class="field"><label for="f-desc">Description</label><input id="f-desc" name="desc" type="text" placeholder="e.g. Weekly shop — Green Valley Market" required></div>' +
      '<div class="field"><label for="f-cat">Category</label><select id="f-cat" name="category">' + catOptions(state, 'groceries') + '</select></div>' +
      '<div class="field"><label for="f-amount">Amount ($) — negative for spending</label><input id="f-amount" name="amount" type="number" step="0.01" placeholder="-45.00" required></div>' +
      '<div class="full btn-row"><button class="btn" type="submit">Add transaction</button>' +
      '<span class="small muted">Income entries use a positive amount.</span></div>' +
      '</div></form></section>' +
      '<section class="card"><h2>November transactions</h2>' +
      '<div class="toolbar">' +
      '<div class="field"><label for="filterCat">Category</label><select id="filterCat"><option value="">All categories</option>' +
      state.categories.map(function (c) {
        return '<option value="' + c.id + '"' + (filter.category === c.id ? ' selected' : '') + '>' + F.escapeHtml(c.name) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="field"><label for="filterQ">Search</label><input id="filterQ" type="text" placeholder="Search descriptions" value="' +
      F.escapeHtml(filter.q || '') + '"></div>' +
      '<button class="btn ghost" id="applyFilter" type="button">Apply filters</button>' +
      '<button class="btn ghost" id="clearFilter" type="button">Clear</button>' +
      '</div>' +
      '<table><thead><tr><th>Date</th><th>What</th><th class="hide-narrow">Category</th><th class="num">Amount</th><th>Actions</th></tr></thead>' +
      '<tbody>' + body + '</tbody></table>' +
      '<p class="small muted" style="margin-top:10px">' + rows.length + ' transaction' + (rows.length === 1 ? '' : 's') +
      ' shown. Edits and deletions are saved in this browser.</p></section>';
  }

  global.NestEggViews = global.NestEggViews || {};
  global.NestEggViews.renderDashboard = renderDashboard;
  global.NestEggViews.renderTransactions = renderTransactions;
  global.NestEggViews.helpers = {
    categoryById: categoryById,
    monthTxns: monthTxns,
    monthTotals: monthTotals,
    spentByCategory: spentByCategory,
    catOptions: catOptions
  };
})(window);

/* Budgets, goals and reports — appended in the same module. */
(function (global) {
  'use strict';

  var F = global.NestEggFormat;
  var C = global.NestEggCharts;
  var H = global.NestEggViews.helpers;

  function renderBudgets(state) {
    var month = state.month;
    var byCat = H.spentByCategory(state, month);
    var totalBudget = 0, totalSpent = 0;
    var rows = state.categories.filter(function (c) { return state.budgets[c.id]; }).map(function (c) {
      var budget = state.budgets[c.id];
      var spent = byCat[c.id] || 0;
      totalBudget += budget;
      totalSpent += spent;
      var pct = budget > 0 ? spent / budget : 0;
      var cls = pct > 1 ? 'over' : (pct > 0.85 ? 'near' : '');
      var diff = budget - spent;
      var diffText = diff >= 0
        ? '<span class="left-text">' + F.money(diff) + ' left</span>'
        : '<span class="over-text">' + F.money(-diff) + ' over</span>';
      return '<div class="budget-row"><div class="budget-top"><span><span class="cat-dot" style="background:' +
        c.color + '"></span>' + F.escapeHtml(c.name) + '</span><span class="spent">' + F.money(spent) +
        ' of ' + F.money(budget) + '</span></div>' +
        '<div class="budget-meta"><span>' + F.percent(pct) + ' used</span><span>' + diffText + '</span></div>' +
        '<div class="bar ' + cls + '" role="img" aria-label="' + F.escapeHtml(c.name) + ' budget ' +
        F.percent(pct) + ' used"><span style="width:' + Math.min(100, pct * 100).toFixed(1) + '%"></span></div>' +
        '<div class="small" style="margin-top:8px"><label for="budget-' + c.id + '">Monthly budget $</label> ' +
        '<input id="budget-' + c.id + '" type="number" min="0" step="5" value="' + budget +
        '" style="width:110px" data-budget="' + c.id + '"> ' +
        '<button class="btn ghost small" data-save-budget="' + c.id + '">Save</button></div></div>';
    }).join('');
    var overallPct = totalBudget > 0 ? totalSpent / totalBudget : 0;

    return '' +
      '<div class="page-head"><div><h1>Budgets for ' + F.monthLabel(month) + '</h1>' +
      '<p>A plan for every category. Change any budget and it updates here and on the dashboard.</p></div></div>' +
      '<div class="grid grid-3" style="margin-bottom:16px">' +
      '<div class="card stat"><div class="label">Total budgeted</div><div class="value">' + F.money(totalBudget) + '</div></div>' +
      '<div class="card stat"><div class="label">Spent so far</div><div class="value">' + F.money(totalSpent) + '</div></div>' +
      '<div class="card stat"><div class="label">Budget used</div><div class="value ' + (overallPct > 1 ? 'neg' : '') + '">' + F.percent(overallPct) + '</div></div>' +
      '</div>' +
      '<section class="card"><h2>Category budgets</h2>' + rows +
      '<p class="small muted" style="margin-top:12px">Housing is the mortgage plus a small repair cushion. ' +
      'Groceries cover the weekly shop at Green Valley Market.</p></section>';
  }

  function renderGoals(state) {
    var cards = state.goals.map(function (g) {
      var pct = g.target > 0 ? g.saved / g.target : 0;
      var done = pct >= 1;
      var remaining = Math.max(0, g.target - g.saved);
      return '<article class="card goal-card"><div class="goal-top"><h2>' + F.escapeHtml(g.name) + '</h2>' +
        '<span class="pill' + (done ? ' done' : '') + '">' + (done ? 'Reached' : F.percent(pct) + ' there') + '</span></div>' +
        '<p class="goal-meta">' + F.escapeHtml(g.note) + '</p>' +
        '<div class="goal-top"><span class="goal-amt">' + F.money(g.saved) + '</span><span class="muted">of ' +
        F.money(g.target) + '</span></div>' +
        '<div class="bar' + (done ? '' : '') + '" role="img" aria-label="' + F.escapeHtml(g.name) + ' ' +
        F.percent(pct) + ' funded"><span style="width:' + Math.min(100, pct * 100).toFixed(1) + '%"></span></div>' +
        '<p class="small">' + (done ? 'Fully funded — well done.' : F.money(remaining) + ' still to save.') + '</p>' +
        '<form class="btn-row" data-goal-form="' + g.id + '">' +
        '<label class="small" for="contrib-' + g.id + '">Add $</label>' +
        '<input id="contrib-' + g.id + '" name="amount" type="number" min="1" step="5" value="50" style="width:100px" required>' +
        '<button class="btn small" type="submit">Add to goal</button></form></article>';
    }).join('');
    var totalSaved = state.goals.reduce(function (s, g) { return s + g.saved; }, 0);
    var totalTarget = state.goals.reduce(function (s, g) { return s + g.target; }, 0);

    return '' +
      '<div class="page-head"><div><h1>Savings goals</h1>' +
      '<p>' + F.money(totalSaved) + ' saved toward ' + F.money(totalTarget) +
      ' of family goals. Add a contribution and the bar moves right away.</p></div></div>' +
      '<div class="grid grid-3">' + cards + '</div>' +
      '<section class="card" style="margin-top:16px"><h2>Start a new goal</h2>' +
      '<form id="addGoalForm"><div class="form-grid">' +
      '<div class="field"><label for="g-name">Goal name</label><input id="g-name" name="name" type="text" placeholder="e.g. Christmas gifts" required></div>' +
      '<div class="field"><label for="g-target">Target amount ($)</label><input id="g-target" name="target" type="number" min="1" step="10" placeholder="500" required></div>' +
      '<div class="field full"><label for="g-note">What is it for?</label><input id="g-note" name="note" type="text" placeholder="A short note about this goal"></div>' +
      '<div class="full"><button class="btn" type="submit">Create goal</button></div>' +
      '</div></form></section>';
  }

  function renderReports(state) {
    var labels = state.monthly.map(function (m) { return m.label; });
    var income = state.monthly.map(function (m) { return m.income; });
    var spending = state.monthly.map(function (m) { return m.spending; });
    var saved = state.monthly.map(function (m) { return m.income - m.spending; });
    var bars = C.groupedBars([
      { name: 'Income', color: '#1a7f37', values: income },
      { name: 'Spending', color: '#0f766e', values: spending }
    ], labels, 640, 260);
    var line = C.lineChart(saved, labels, 640, 220);
    var byCat = H.spentByCategory(state, state.month);
    var catRows = state.categories
      .filter(function (c) { return byCat[c.id]; })
      .map(function (c) { return { name: c.name, color: c.color, amount: byCat[c.id] }; })
      .sort(function (a, b) { return b.amount - a.amount; })
      .map(function (r) {
        return '<tr><td><span class="cat-dot" style="background:' + r.color + '"></span>' +
          F.escapeHtml(r.name) + '</td><td class="num">' + F.money(r.amount) + '</td></tr>';
      }).join('');
    var best = state.monthly.reduce(function (a, m) { return (m.income - m.spending) > (a.income - a.spending) ? m : a; });
    var avgSaved = Math.round(saved.reduce(function (a, b) { return a + b; }, 0) / saved.length);

    return '' +
      '<div class="page-head"><div><h1>Reports</h1>' +
      '<p>Six months of the family’s money, June to November 2026. Best saving month: <strong>' +
      F.monthLabel(best.month) + '</strong> (' + F.money(best.income - best.spending) + ' saved).</p></div></div>' +
      '<div class="grid grid-2">' +
      '<section class="card"><h2>Income vs spending</h2><div class="chart-box">' + bars + '</div>' +
      '<p class="small muted"><span style="color:#1a7f37">&#9632;</span> Income &nbsp; <span style="color:#0f766e">&#9632;</span> Spending</p></section>' +
      '<section class="card"><h2>Monthly savings</h2><div class="chart-box">' + line + '</div>' +
      '<p class="small muted">Average saved per month: <strong>' + F.money(avgSaved) + '</strong> over the last six months.</p></section>' +
      '</div>' +
      '<div class="grid grid-2" style="margin-top:16px">' +
      '<section class="card"><h2>November spending by category</h2><table><thead><tr><th>Category</th><th class="num">Spent</th></tr></thead>' +
      '<tbody>' + catRows + '</tbody></table></section>' +
      '<section class="card"><h2>What the numbers say</h2>' +
      '<div class="callout"><strong>Groceries are steady.</strong> The weekly shop runs $150–$170 every week — the most predictable line in the budget.</div>' +
      '<p style="margin-top:12px">Housing is the biggest single cost at $1,650 a month, about a quarter of income. ' +
      'Dining out is small ($99.55 so far) because most meals are cooked at home.</p>' +
      '<p>The family saved ' + F.money(state.monthly[state.monthly.length - 1].income - state.monthly[state.monthly.length - 1].spending) +
      ' in November with five days still to go, on track for the 20% savings-rate goal.</p>' +
      '<p><a href="#/budgets">Adjust the budgets</a> or <a href="#/goals">add to a savings goal</a> from here.</p></section>' +
      '</div>';
  }

  global.NestEggViews.renderBudgets = renderBudgets;
  global.NestEggViews.renderGoals = renderGoals;
  global.NestEggViews.renderReports = renderReports;
})(window);
