/* NestEgg main: hash router plus the wiring that makes every control work.
   All state lives in the store from data.js and persists in localStorage. */
(function (global) {
  'use strict';

  var D = global.NestEggData;
  var F = global.NestEggFormat;
  var V = global.NestEggViews;

  var state = D.loadState();
  var view = document.getElementById('view');
  var monthPicker = document.getElementById('monthPicker');
  var txnFilter = { category: '', q: '' };

  var MONTHS = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

  function fillMonthPicker() {
    monthPicker.innerHTML = MONTHS.map(function (m) {
      return '<option value="' + m + '"' + (m === state.month ? ' selected' : '') + '>' + F.monthLabel(m) + '</option>';
    }).join('');
  }

  function setActiveNav(route) {
    var links = document.querySelectorAll('.main-nav a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-route') === route) links[i].classList.add('active');
      else links[i].classList.remove('active');
    }
  }

  function render() {
    var hash = global.location.hash || '#/dashboard';
    var route = hash.replace(/^#\//, '').split('/')[0] || 'dashboard';
    setActiveNav(route);
    var html;
    if (route === 'transactions') html = V.renderTransactions(state, txnFilter);
    else if (route === 'budgets') html = V.renderBudgets(state);
    else if (route === 'goals') html = V.renderGoals(state);
    else if (route === 'reports') html = V.renderReports(state);
    else html = V.renderDashboard(state);
    view.innerHTML = html;
    wirePage(route);
    view.focus();
  }

  function wirePage(route) {
    if (route === 'transactions') wireTransactions();
    if (route === 'budgets') wireBudgets();
    if (route === 'goals') wireGoals();
  }

  function wireTransactions() {
    var form = document.getElementById('addTxnForm');
    if (form) form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var date = document.getElementById('f-date').value;
      var desc = document.getElementById('f-desc').value.trim();
      var category = document.getElementById('f-cat').value;
      var amount = parseFloat(document.getElementById('f-amount').value);
      if (!date || !desc || isNaN(amount) || amount === 0) return;
      state.transactions.unshift({
        id: D.nextId(state), date: date, desc: desc, category: category, amount: Math.round(amount * 100) / 100
      });
      D.saveState(state);
      render();
    });

    var apply = document.getElementById('applyFilter');
    if (apply) apply.addEventListener('click', function () {
      txnFilter.category = document.getElementById('filterCat').value;
      txnFilter.q = document.getElementById('filterQ').value.trim();
      render();
    });
    var clear = document.getElementById('clearFilter');
    if (clear) clear.addEventListener('click', function () {
      txnFilter = { category: '', q: '' };
      render();
    });
    var qInput = document.getElementById('filterQ');
    if (qInput) qInput.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); apply.click(); }
    });

    var buttons = view.querySelectorAll('[data-edit], [data-delete]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (ev) {
        var btn = ev.currentTarget;
        var id = btn.getAttribute('data-edit') || btn.getAttribute('data-delete');
        var idx = -1;
        for (var j = 0; j < state.transactions.length; j++) {
          if (state.transactions[j].id === id) { idx = j; break; }
        }
        if (idx === -1) return;
        if (btn.hasAttribute('data-delete')) {
          if (global.confirm('Delete this transaction?')) {
            state.transactions.splice(idx, 1);
            D.saveState(state);
            render();
          }
        } else {
          var t = state.transactions[idx];
          var desc = global.prompt('Description', t.desc);
          if (desc === null) return;
          var amount = global.prompt('Amount in dollars (negative for spending)', String(t.amount));
          if (amount === null || isNaN(parseFloat(amount))) return;
          t.desc = desc.trim() || t.desc;
          t.amount = Math.round(parseFloat(amount) * 100) / 100;
          D.saveState(state);
          render();
        }
      });
    }
  }

  function wireBudgets() {
    var buttons = view.querySelectorAll('[data-save-budget]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (ev) {
        var cat = ev.currentTarget.getAttribute('data-save-budget');
        var input = document.getElementById('budget-' + cat);
        var value = parseFloat(input.value);
        if (isNaN(value) || value < 0) return;
        state.budgets[cat] = Math.round(value);
        D.saveState(state);
        render();
      });
    }
  }

  function wireGoals() {
    var forms = view.querySelectorAll('[data-goal-form]');
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener('submit', function (ev) {
        ev.preventDefault();
        var id = ev.currentTarget.getAttribute('data-goal-form');
        var input = ev.currentTarget.querySelector('input[name="amount"]');
        var amount = parseFloat(input.value);
        if (isNaN(amount) || amount <= 0) return;
        for (var j = 0; j < state.goals.length; j++) {
          if (state.goals[j].id === id) {
            state.goals[j].saved = Math.round((state.goals[j].saved + amount) * 100) / 100;
            break;
          }
        }
        D.saveState(state);
        render();
      });
    }
    var addForm = document.getElementById('addGoalForm');
    if (addForm) addForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = document.getElementById('g-name').value.trim();
      var target = parseFloat(document.getElementById('g-target').value);
      var note = document.getElementById('g-note').value.trim();
      if (!name || isNaN(target) || target <= 0) return;
      state.goals.push({
        id: 'g-' + Date.now(), name: name, target: Math.round(target), saved: 0,
        note: note || 'A new family goal.'
      });
      D.saveState(state);
      render();
    });
  }

  monthPicker.addEventListener('change', function () {
    state.month = monthPicker.value;
    D.saveState(state);
    render();
  });

  global.addEventListener('hashchange', render);

  fillMonthPicker();
  render();
})(window);
