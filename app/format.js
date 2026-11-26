/* NestEgg formatting helpers: money, dates and percents, one place. */
(function (global) {
  'use strict';

  var usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  var usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  function money(amount) {
    return usd.format(amount);
  }

  function money0(amount) {
    return usd0.format(amount);
  }

  function signedMoney(amount) {
    return (amount > 0 ? '+' : '') + usd.format(amount);
  }

  var MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function monthLabel(ym) {
    var parts = ym.split('-');
    return MONTH_NAMES[Number(parts[1]) - 1] + ' ' + parts[0];
  }

  function monthShort(ym) {
    var parts = ym.split('-');
    return MONTH_NAMES[Number(parts[1]) - 1].slice(0, 3) + ' ' + parts[0];
  }

  function dateLabel(iso) {
    var parts = iso.split('-');
    var month = MONTH_NAMES[Number(parts[1]) - 1].slice(0, 3);
    return month + ' ' + Number(parts[2]) + ', ' + parts[0];
  }

  function percent(value) {
    return Math.round(value * 100) + '%';
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  global.NestEggFormat = {
    money: money,
    money0: money0,
    signedMoney: signedMoney,
    monthLabel: monthLabel,
    monthShort: monthShort,
    dateLabel: dateLabel,
    percent: percent,
    escapeHtml: escapeHtml
  };
})(window);
