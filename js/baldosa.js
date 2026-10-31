/* Barcelona Incognita · la baldosa «flor de Barcelona» hecha mosaico (Pau, 31/10/2026)
   El panot de cuatro círculos y centro de las aceras de Barcelona, con las medidas sacadas de una foto de la baldosa real,
   pintado con las mismas piezas que el mapa (BC.mapa.pieza): fondo crema, surcos rojos, discos de oro y canto de cobalto.
   Es la medalla de la entrada y el icono de la web (los PNG del icono salen de herramientas/icono-panot.js, que dibuja lo mismo).
   BC.baldosa(canvas, lado) la pinta en un canvas de «lado» px de CSS. */
(function () {
  'use strict';
  var BC = window.BC, M = BC.mapa, L = 512;   // se dibuja en 512 unidades y se escala al canvas
  var B = 0.06, OFF = 0.194, RP = 0.116, RPS = 0.188, RC = 0.127, RCS = 0.178;   // en fracciones del lado (ver herramientas/icono-panot.js)
  function dibujar(c, lado, PAL, JUNTA, sem, relieve) {
    var d = Math.min(window.devicePixelRatio || 1, 2), x = c.getContext('2d');
    c.width = c.height = Math.round(lado * d); x.setTransform(c.width / L, 0, 0, c.width / L, 0, 0);
    var J = L * 0.0055, H = L * 0.0045, s = sem, m = L / 2;
    var P = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (d) { return [m + d[0] * OFF * L, m + d[1] * OFF * L]; });
    function col(pal) { s++; return M.tono(pal[Math.floor(M.h(s, sem, 3) * pal.length)], 0.94 + M.h(sem, s, 4) * 0.12); }
    function dentroQ(px, py) {   // ¿dentro del trébol (surcos incluidos)?
      if (Math.hypot(px - m, py - m) < RCS * L) return true;
      for (var i = 0; i < 4; i++) if (Math.hypot(px - P[i][0], py - P[i][1]) < RPS * L) return true;
      return false;
    }
    // una corona de teselas entre r0 y r1 (en px), las que pasen el filtro (por su centro)
    function corona(cx, cy, r0, r1, pal, largo, filtro, fase) {
      var rm = (r0 + r1) / 2, n = Math.max(6, Math.round(2 * Math.PI * rm / largo)), f = fase || 0;
      for (var i = 0; i < n; i++) {
        var a0 = f + i / n * 6.2832, a1 = f + (i + 1) / n * 6.2832, am = (a0 + a1) / 2, mx = cx + Math.cos(am) * rm, my = cy + Math.sin(am) * rm;
        if (filtro && !filtro(mx, my)) continue;
        M.pieza(x, [[cx + Math.cos(a0) * r1, cy + Math.sin(a0) * r1], [cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1], [cx + Math.cos(a1) * r0, cy + Math.sin(a1) * r0], [cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0]], col(pal), J, H);
      }
    }
    // un disco relleno de coronas concéntricas (opus vermiculatum) y una pieza en el centro
    function disco(cx, cy, r, pal, borde, largo, filtro) {
      var ancho = largo * 0.95, rr = r;
      corona(cx, cy, rr - ancho, rr, borde, largo, filtro, 0.2); rr -= ancho;
      var k = 0;
      while (rr > ancho * 0.9) { corona(cx, cy, rr - ancho, rr, pal, largo, filtro, k * 0.37); rr -= ancho; k++; }
      if (!filtro || filtro(cx, cy)) { var q = []; for (var i = 0; i < 9; i++) { var a = i / 9 * 6.2832; q.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } M.pieza(x, q, col(pal), J, H); }
    }
    var R = L * 0.12;
    x.save(); x.beginPath(); if (x.roundRect) x.roundRect(0, 0, L, L, R); else x.rect(0, 0, L, L); x.clip();
    x.fillStyle = JUNTA; x.fillRect(0, 0, L, L);
    // 1 · el fondo liso de la baldosa: hileras, y alrededor del trébol una fila que lo sigue
    var ts = L / 20;
    for (var j = -1; j < 22; j++) for (var i = -1; i < 22; i++) {
      var e = function (a, b) { return [(a + (M.h(a, b, s) - 0.5) * 0.3 + (b % 2) * 0.5) * ts, (b + (M.h(b, a, s + 1) - 0.5) * 0.3) * ts]; };
      var q = [e(i, j), e(i + 1, j), e(i + 1, j + 1), e(i, j + 1)], cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2;
      if (Math.hypot(cx - m, cy - m) < RCS * L + ts * 0.6) continue;
      var lejos = true; for (var k = 0; k < 4; k++) if (Math.hypot(cx - P[k][0], cy - P[k][1]) < RPS * L + ts * 1.6) lejos = false;
      if (!lejos) continue;
      M.pieza(x, q, col(PAL.fondo), J, H);
    }
    var halo = function (px, py) { return !dentroQ(px, py); };
    for (k = 0; k < 4; k++) { corona(P[k][0], P[k][1], RPS * L, RPS * L + ts * 0.85, PAL.fondo, ts * 0.85, halo, 0.1); corona(P[k][0], P[k][1], RPS * L + ts * 0.85, RPS * L + ts * 1.7, PAL.fondo, ts * 0.95, halo, 0.5); }
    // 2 · los surcos: dos filas por pétalo y una corona alrededor del centro (que pisa los pétalos, como en la baldosa)
    for (k = 0; k < 4; k++) { corona(P[k][0], P[k][1], RP * L, (RP + RPS) / 2 * L, PAL.surco, L * 0.034, null, k); corona(P[k][0], P[k][1], (RP + RPS) / 2 * L, RPS * L, PAL.surco, L * 0.036, null, k + 0.5); }
    // 3 · los discos de los pétalos (recortados por el surco del centro)
    var fueraCentro = function (px, py) { return Math.hypot(px - m, py - m) > RCS * L; };
    for (k = 0; k < 4; k++) disco(P[k][0], P[k][1], RP * L, PAL.petalo, PAL.petaloBorde, L * 0.036, fueraCentro);
    // 4 · el surco del centro, encima: corta los pétalos limpio, como en la baldosa; y el disco central
    x.save(); x.fillStyle = JUNTA; x.beginPath(); x.arc(m, m, RCS * L + 1, 0, 6.2832); x.fill(); x.restore();
    corona(m, m, RC * L, (RC + RCS) / 2 * L, PAL.surco, L * 0.032, null, 0.3); corona(m, m, (RC + RCS) / 2 * L, RCS * L, PAL.surco, L * 0.034, null, 0.1);
    disco(m, m, RC * L, PAL.centro, PAL.centroBorde, L * 0.036);
    // 4 · el relieve: el surco hundido lleva una sombra por dentro (la luz llega de arriba a la izquierda)
    if (relieve) {
      x.save(); x.globalCompositeOperation = 'multiply';
      var g = x.createRadialGradient(m - L * 0.1, m - L * 0.1, L * 0.1, m, m, L * 0.7); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,110,95,0.25)');
      x.fillStyle = g; x.fillRect(0, 0, L, L); x.restore();
    }
    // 5 · el canto de la baldosa: una fila de teselas alrededor, algo más oscura
    var bw = L * B * 0.6, lado = L / 16;
    for (i = 0; i < 16; i++) {
      var a = i * lado, b = a + lado;
      [[[a, 0], [b, 0], [b, bw], [a, bw]], [[L - bw, a], [L, a], [L, b], [L - bw, b]], [[a, L - bw], [b, L - bw], [b, L], [a, L]], [[0, a], [bw, a], [bw, b], [0, b]]].forEach(function (qq) { M.pieza(x, qq, col(PAL.canto), J, H); });
    }
    x.restore();
  }
  var A = { fondo: ['#efe6d2', '#e8dcc3', '#f4ecdb', '#e5d8be'], surco: ['#c43b2b', '#d8452f', '#b8322c', '#c9502e'], surcoFuera: ['#c9693e', '#d8452f', '#e8663a'],
    petalo: ['#f2b33d', '#f4c24e', '#e9a92e', '#f6cf6a'], petaloBorde: ['#e9a92e', '#f2b33d'], centro: ['#f2b33d', '#f4c24e', '#e9a92e', '#f6cf6a'], centroBorde: ['#e9a92e', '#f2b33d'],
    canto: ['#2f5fae', '#3b7dc4', '#2a4f9a'] };
  BC.baldosa = function (c, lado) { dibujar(c, lado, A, '#bfae8c', 71, false); };
})();
