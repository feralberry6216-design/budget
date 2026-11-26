/* NestEgg charts: small hand-drawn inline SVG — donut, bars and line.
   No libraries, so the first load stays tiny. */
(function (global) {
  'use strict';

  function polar(cx, cy, r, angleDeg) {
    var a = (angleDeg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  function donut(slices, size) {
    size = size || 180;
    var cx = size / 2, cy = size / 2, r = size / 2 - 12, inner = r * 0.62;
    var total = slices.reduce(function (sum, s) { return sum + s.value; }, 0);
    if (total <= 0) {
      return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size +
        '" role="img" aria-label="No spending yet"><circle cx="' + cx + '" cy="' + cy +
        '" r="' + r + '" fill="none" stroke="#eee9df" stroke-width="22"/></svg>';
    }
    var angle = 0;
    var paths = slices.map(function (s) {
      var start = angle;
      angle += (s.value / total) * 360;
      var end = angle;
      var large = (end - start) > 180 ? 1 : 0;
      var p1 = polar(cx, cy, r, start);
      var p2 = polar(cx, cy, r, end);
      var mid = polar(cx, cy, r, (start + end) / 2);
      var gap = 2; /* small gap between slices */
      var a1 = polar(cx, cy, r, start + gap);
      var a2 = polar(cx, cy, r, end - gap);
      var d = 'M ' + a1[0].toFixed(1) + ' ' + a1[1].toFixed(1) +
        ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + a2[0].toFixed(1) + ' ' + a2[1].toFixed(1);
      return '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="22">' +
        '<title>' + s.label + ': ' + s.value.toFixed(0) + '</title></path>' +
        '<text x="' + mid[0].toFixed(1) + '" y="' + mid[1].toFixed(1) +
        '" font-size="0" aria-hidden="true"></text>';
    }).join('');
    var center = '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" font-size="22" font-weight="800" fill="#22302e">$' +
      Math.round(total).toLocaleString('en-US') + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 16) + '" text-anchor="middle" font-size="11" fill="#6f7d7a">spent this month</text>';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size +
      '" role="img" aria-label="Spending by category donut chart">' + paths + center + '</svg>';
  }

  function groupedBars(series, labels, width, height) {
    width = width || 640; height = height || 260;
    var padL = 52, padB = 28, padT = 12, padR = 8;
    var max = 0;
    series.forEach(function (s) { s.values.forEach(function (v) { if (v > max) max = v; }); });
    max = Math.ceil(max / 1000) * 1000 || 1000;
    var innerW = width - padL - padR, innerH = height - padT - padB;
    var groupW = innerW / labels.length;
    var barW = Math.min(26, (groupW - 24) / series.length);
    var y = function (v) { return padT + innerH - (v / max) * innerH; };
    var out = [];
    var gridLines = 4;
    for (var g = 0; g <= gridLines; g++) {
      var gy = padT + (innerH / gridLines) * g;
      var val = Math.round(max * (1 - g / gridLines));
      out.push('<line x1="' + padL + '" y1="' + gy + '" x2="' + (width - padR) + '" y2="' + gy +
        '" stroke="#e3ddd2" stroke-width="1"/>' +
        '<text x="' + (padL - 8) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="11" fill="#6f7d7a">$' +
        (val / 1000) + 'k</text>');
    }
    labels.forEach(function (label, i) {
      var gx = padL + i * groupW + groupW / 2;
      series.forEach(function (s, j) {
        var v = s.values[i];
        var bx = gx - (series.length * barW) / 2 + j * barW;
        out.push('<rect x="' + bx.toFixed(1) + '" y="' + y(v).toFixed(1) + '" width="' + (barW - 3) +
          '" height="' + (padT + innerH - y(v)).toFixed(1) + '" rx="3" fill="' + s.color + '">' +
          '<title>' + label + ' ' + s.name + ': $' + v.toLocaleString('en-US') + '</title></rect>');
      });
      out.push('<text x="' + gx.toFixed(1) + '" y="' + (height - 8) + '" text-anchor="middle" font-size="12" fill="#4b5b58">' + label + '</text>');
    });
    return '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height +
      '" role="img" aria-label="Monthly income versus spending bar chart">' + out.join('') + '</svg>';
  }

  function lineChart(points, labels, width, height) {
    width = width || 640; height = height || 220;
    var padL = 52, padB = 28, padT = 14, padR = 14;
    var max = Math.max.apply(null, points) * 1.1 || 100;
    var min = Math.min.apply(null, points) * 0.9;
    var innerW = width - padL - padR, innerH = height - padT - padB;
    var x = function (i) { return padL + (i / (points.length - 1)) * innerW; };
    var y = function (v) { return padT + innerH - ((v - min) / (max - min)) * innerH; };
    var d = points.map(function (v, i) {
      return (i === 0 ? 'M ' : ' L ') + x(i).toFixed(1) + ' ' + y(v).toFixed(1);
    }).join('');
    var dots = points.map(function (v, i) {
      return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="4" fill="#0f766e">' +
        '<title>' + labels[i] + ': $' + Math.round(v).toLocaleString('en-US') + '</title></circle>';
    }).join('');
    var grid = '';
    for (var g = 0; g <= 3; g++) {
      var gy = padT + (innerH / 3) * g;
      var val = Math.round(min + (max - min) * (1 - g / 3));
      grid += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (width - padR) + '" y2="' + gy +
        '" stroke="#e3ddd2" stroke-width="1"/>' +
        '<text x="' + (padL - 8) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="11" fill="#6f7d7a">$' +
        (val / 1000).toFixed(1) + 'k</text>';
    }
    var xlabels = labels.map(function (label, i) {
      return '<text x="' + x(i).toFixed(1) + '" y="' + (height - 8) + '" text-anchor="middle" font-size="12" fill="#4b5b58">' + label + '</text>';
    }).join('');
    return '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height +
      '" role="img" aria-label="Savings balance trend line chart">' + grid +
      '<path d="' + d + '" fill="none" stroke="#0f766e" stroke-width="2.5"/>' + dots + xlabels + '</svg>';
  }

  global.NestEggCharts = {
    donut: donut,
    groupedBars: groupedBars,
    lineChart: lineChart
  };
})(window);
