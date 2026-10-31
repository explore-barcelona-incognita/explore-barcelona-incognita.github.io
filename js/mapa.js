/* Barcelona Incognita · el mapa de mosaico (el mundo)
   La ciudad real de OpenStreetMap (datos/barcelona.js), girada 45° para que el mar quede abajo y el Eixample, recto.
   Todo se pinta por teselas de 256 px de pantalla a cada nivel de zoom (BC.mapa.pintarTesela); el motor decide cuáles,
   cuándo y las guarda. Cada tesela va en tres pasadas: el mar (piezas grandes de cobalto), la tierra (teselas casi
   cuadradas del color de su suelo) y, encima, las calles reales como tiras de piezas blancas. De cerca aparecen los
   patios y los chaflanes del Eixample; los monumentos son ilustraciones de teselas en su sitio real.
   El plano girado: X, Y en metros (X = (x − y)·√½, Y = (x + y)·√½), con x al este e y al sur desde la plaza de Catalunya. */
(function () {
  'use strict';
  var BC = window.BC, D = window.BC_DATOS, C45 = Math.SQRT1_2;
  var DPR = 1;   // lo fija el motor con BC.mapa.ponerDpr

  /* ---------- coordenadas: el mundo en metros (y hacia el sur) y el plano girado (X, Y) en el que se pinta ---------- */
  function girar(x, y) { return [(x - y) * C45, (x + y) * C45]; }
  function desgirar(X, Y) { return [(X + Y) * C45, (Y - X) * C45]; }

  /* ---------- el uso del suelo: el PNG de clases convertido a un índice por píxel ---------- */
  var CLS = null, MASCARA = null, RW = D.w, RH = D.h, RES = D.res;
  var N = {}; D.clases.forEach(function (n, i) { N[n] = i; });
  var PAL_PNG = [[240, 230, 210], [40, 110, 190], [110, 170, 80], [50, 110, 60], [236, 210, 154], [40, 130, 160], [160, 165, 170], [150, 140, 130], [130, 150, 110], [190, 120, 70]];
  function cargarClases(listo) {
    var im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas'); c.width = RW; c.height = RH;
      var x = c.getContext('2d'); x.drawImage(im, 0, 0);
      var px = x.getImageData(0, 0, RW, RH).data, cache = {};
      CLS = new Uint8Array(RW * RH);
      for (var i = 0, n = RW * RH; i < n; i++) {
        var r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2], k = (r << 16) | (g << 8) | b, v = cache[k];
        if (v === undefined) { var bd = 1e9; for (var j = 0; j < PAL_PNG.length; j++) { var p = PAL_PNG[j], d = (p[0] - r) * (p[0] - r) + (p[1] - g) * (p[1] - g) + (p[2] - b) * (p[2] - b); if (d < bd) { bd = d; v = j; } } cache[k] = v; }
        CLS[i] = v;
      }
      // la máscara del mar (opaco = mar): recorta las piezas por la forma real de la costa
      var md = x.createImageData(RW, RH);
      for (i = 0; i < RW * RH; i++) if (CLS[i] === N.mar) { md.data[i * 4 + 3] = 255; }
      x.putImageData(md, 0, 0); MASCARA = c;
      listo();
    };
    im.src = D.png;
  }
  function claseEn(X, Y) {
    var w = desgirar(X, Y), ix = Math.floor((w[0] - D.x0) / RES), iy = Math.floor((w[1] - D.y0) / RES);
    if (ix < 0 || iy < 0 || ix >= RW || iy >= RH) return w[0] + w[1] > 2500 ? N.mar : N.bosc;   // fuera del recorte: mar al sureste, sierra al noroeste
    return CLS[iy * RW + ix];
  }

  /* ---------- las calles: giradas, con su caja y en cubos de 400 m para encontrarlas rápido ---------- */
  var ESTILO = {   // ancho real (m), ancho mínimo en pantalla (px), orden de pintado, colores
    vianants: { w: 7, min: 1.8, o: 0, col: ['#f6efdf', '#efe6d2', '#fbf6ec'] },
    carrer: { w: 11, min: 2.4, o: 1, col: ['#f7f2e6', '#efe8d8', '#fbf8f0', '#e9e1cd'] },
    enllac: { w: 11, min: 2.4, o: 1, col: ['#f7f2e6', '#efe8d8', '#fbf8f0'] },
    mitjana: { w: 17, min: 3.4, o: 2, col: ['#f8efd8', '#f3e6c6', '#fbf5e6', '#efdfba'] },
    gran: { w: 24, min: 4.6, o: 3, col: ['#f6e3b4', '#f2d89a', '#f8ebc8', '#ecd08c'] },
    via: { w: 28, min: 5.4, o: 4, col: ['#f2d58f', '#eecb7a', '#f6e2ad'] },
    costa: { w: 6, min: 2.6, o: -1, col: ['#efe6d3', '#e4d8c0', '#f6efe1', '#dccfb5'] }   // el borde de piedra de la costa y los muelles
  };
  var CALLES = [], CUBO = 400, CUBOS = {};
  D.calles.forEach(function (c, n) {
    var tipo = c[0], x = c[2], y = c[3], pts = [girar(x, y)];
    for (var i = 4; i < c.length; i += 2) { x += c[i]; y += c[i + 1]; pts.push(girar(x, y)); }
    var cj = [1e9, 1e9, -1e9, -1e9]; pts.forEach(function (p) { cj[0] = Math.min(cj[0], p[0]); cj[1] = Math.min(cj[1], p[1]); cj[2] = Math.max(cj[2], p[0]); cj[3] = Math.max(cj[3], p[1]); });
    var ca = { e: ESTILO[tipo], n: c[1], p: pts, c: cj, id: n };
    CALLES.push(ca);
    for (var bx = Math.floor(cj[0] / CUBO); bx <= Math.floor(cj[2] / CUBO); bx++) for (var by = Math.floor(cj[1] / CUBO); by <= Math.floor(cj[3] / CUBO); by++) (CUBOS[bx + ',' + by] = CUBOS[bx + ',' + by] || []).push(ca);
  });
  D.costa.forEach(function (c, n) {
    var x = c[0], y = c[1], pts = [girar(x, y)];
    for (var i = 2; i < c.length; i += 2) { x += c[i]; y += c[i + 1]; pts.push(girar(x, y)); }
    var cj = [1e9, 1e9, -1e9, -1e9]; pts.forEach(function (p) { cj[0] = Math.min(cj[0], p[0]); cj[1] = Math.min(cj[1], p[1]); cj[2] = Math.max(cj[2], p[0]); cj[3] = Math.max(cj[3], p[1]); });
    var ca = { e: ESTILO.costa, n: '', p: pts, c: cj, id: 100000 + n };
    for (var bx = Math.floor(cj[0] / CUBO); bx <= Math.floor(cj[2] / CUBO); bx++) for (var by = Math.floor(cj[1] / CUBO); by <= Math.floor(cj[3] / CUBO); by++) (CUBOS[bx + ',' + by] = CUBOS[bx + ',' + by] || []).push(ca);
  });
  function callesEn(x0, y0, x1, y1) {
    var vistas = {}, out = [];
    for (var bx = Math.floor(x0 / CUBO); bx <= Math.floor(x1 / CUBO); bx++) for (var by = Math.floor(y0 / CUBO); by <= Math.floor(y1 / CUBO); by++) {
      var l = CUBOS[bx + ',' + by]; if (!l) continue;
      for (var i = 0; i < l.length; i++) { var c = l[i]; if (vistas[c.id]) continue; vistas[c.id] = 1; if (c.c[2] < x0 || c.c[0] > x1 || c.c[3] < y0 || c.c[1] > y1) continue; out.push(c); }
    }
    return out.sort(function (a, b) { return a.e.o - b.e.o; });
  }

  /* ---------- los colores del esmalte (mediodía) ---------- */
  var PAL = [];
  PAL[N.ciutat] = { b: ['#e8892f', '#f0a33a', '#f4b942', '#e46f2c', '#d4552a', '#c8452a', '#f2c55a', '#e99a45', '#d97b3a', '#b9472b', '#eda24f', '#dc6a33'],
    x: [['#2f5fae', 0.018], ['#3b7dc4', 0.01], ['#5f9a43', 0.02], ['#f1e2c0', 0.03], ['#7a3b2a', 0.012]] };
  PAL[N.parc] = { b: ['#4f8f3c', '#6aa84a', '#3f7a35', '#8dbb5a', '#5a9a50', '#76a845', '#2f6b3a'], x: [['#2f6fb0', 0.04], ['#3a8a8a', 0.05], ['#c9b45a', 0.03]] };
  PAL[N.bosc] = { b: ['#2f6b3a', '#3c7a40', '#25583a', '#4f8a4a', '#6a9a4a', '#3d6e3a'], x: [['#2b5f78', 0.08], ['#3a7aa0', 0.06], ['#2b4f9a', 0.05], ['#8aa84a', 0.05]] };
  PAL[N.platja] = { b: ['#ecd29a', '#e2c283', '#f2dfb2', '#d9b673', '#efd7a5'], x: [['#f6ead0', 0.08]] };
  PAL[N.aigua] = { b: ['#2a6fb8', '#3a86c8', '#2b5fa8', '#4aa0d0'], x: [] };
  PAL[N.port] = { b: ['#ece2cc', '#ddd1b8', '#e6dac2', '#cfc4ad', '#f2eadb'], x: [['#c9693b', 0.012], ['#3f6e9e', 0.012]] };
  PAL[N.tren] = { b: ['#bfae97', '#a99a86', '#c9bba4'], x: [] };
  PAL[N.cementiri] = { b: ['#8ea27a', '#a3b38c', '#7c9068', '#d9cfba'], x: [] };
  PAL[N.pista] = { b: ['#6aa84a', '#5a9a40', '#c2643a'], x: [] };
  var MAR = { cerca: ['#4fb9de', '#3fa6d6', '#62c6e2', '#2f8fcf', '#7fd0e6'], medio: ['#2f7fc8', '#3a8ed2', '#2a6fbe', '#4aa0d8', '#2b63b0'], lejos: ['#1f4fa8', '#2a5fb8', '#1b3f8f', '#3270c4', '#23489e', '#2f5aa8'] };
  function elegir(p, r, r2) { for (var i = 0; i < p.x.length; i++) { if (r2 < p.x[i][1]) return p.x[i][0]; r2 -= p.x[i][1]; } return p.b[Math.floor(r * p.b.length) % p.b.length]; }
  function tono(hex, k) {
    var r = parseInt(hex.slice(1, 3), 16) * k, g = parseInt(hex.slice(3, 5), 16) * k, b = parseInt(hex.slice(5, 7), 16) * k;
    return 'rgb(' + Math.min(255, r | 0) + ',' + Math.min(255, g | 0) + ',' + Math.min(255, b | 0) + ')';
  }

  /* ---------- azar con semilla y ruido suave ---------- */
  function h(a, b, c) { var n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return n - Math.floor(n); }
  function ruido(x, y) {   // ruido de valor suave, 0 … 1
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    var a = h(ix, iy, 5), b = h(ix + 1, iy, 5), c = h(ix, iy + 1, 5), d = h(ix + 1, iy + 1, 5);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }

  /* ---------- una pieza: cuadrilátero encogido media junta, esquinas suaves, esmalte y canto ---------- */
  var JUNTA = '#e6dcc7';
  function pieza(x, q, col, jw, hl) {
    var n = q.length, cx = 0, cy = 0, i;
    for (i = 0; i < n; i++) { cx += q[i][0]; cy += q[i][1]; } cx /= n; cy /= n;
    var e = [];
    for (i = 0; i < n; i++) { var vx = q[i][0] - cx, vy = q[i][1] - cy, d = Math.hypot(vx, vy) || 1, f = Math.max(0.2, 1 - jw / d); e.push([cx + vx * f, cy + vy * f]); }
    // esquinas suaves: se corta cada esquina con una curva
    x.beginPath();
    for (i = 0; i < n; i++) {
      var a = e[(i + n - 1) % n], b = e[i], c = e[(i + 1) % n], k = 0.22;
      var p1 = [b[0] + (a[0] - b[0]) * k, b[1] + (a[1] - b[1]) * k], p2 = [b[0] + (c[0] - b[0]) * k, b[1] + (c[1] - b[1]) * k];
      if (i === 0) x.moveTo(p1[0], p1[1]); else x.lineTo(p1[0], p1[1]);
      x.quadraticCurveTo(b[0], b[1], p2[0], p2[1]);
    }
    x.closePath(); x.fillStyle = col; x.fill();
    // el canto: luz arriba a la izquierda, sombra abajo a la derecha
    var o = 0; for (i = 0; i < n; i++) { var u = e[i], v = e[(i + 1) % n]; o += u[0] * v[1] - v[0] * u[1]; } o = o > 0 ? 1 : -1;
    var mejor = -9, peor = 9, ib = 0, ip = 0;
    for (i = 0; i < n; i++) { var u1 = e[i], u2 = e[(i + 1) % n], ex = u2[0] - u1[0], ey = u2[1] - u1[1], l = Math.hypot(ex, ey) || 1, dot = (o * ey * -0.7071 - o * ex * -0.7071) / l; if (dot > mejor) { mejor = dot; ib = i; } if (dot < peor) { peor = dot; ip = i; } }
    x.lineWidth = hl; x.lineCap = 'round';
    x.strokeStyle = 'rgba(255,255,255,0.42)'; x.beginPath(); x.moveTo(e[ib][0], e[ib][1]); x.lineTo(e[(ib + 1) % n][0], e[(ib + 1) % n][1]); x.stroke();
    x.strokeStyle = 'rgba(60,30,10,0.2)'; x.beginPath(); x.moveTo(e[ip][0], e[ip][1]); x.lineTo(e[(ip + 1) % n][0], e[(ip + 1) % n][1]); x.stroke();
  }

  /* ---------- los patios de manzana del Eixample (aparecen al acercarse) ----------
     La cuadrícula de Cerdà medida en las calles reales (herramientas/osm/cuadricula.py): 44,7°, paso 133,3 m
     (manzana de 113,3 + calle de 20) y los ejes de las calles en u ≡ 13,49 y v ≡ −34,17. Cada manzana lleva su
     patio en el centro: jardín con árboles o tejados bajos, con las teselas alineadas con la manzana. */
  var CERDA = { th: -44.7 * Math.PI / 180, ou: 13.49, ov: -34.17, paso: 133.3, calle: 10 };
  CERDA.ux = Math.cos(CERDA.th); CERDA.uy = Math.sin(CERDA.th); CERDA.vx = -CERDA.uy; CERDA.vy = CERDA.ux;
  function cerdaMundo(u, v) { return [u * CERDA.ux + v * CERDA.vx, u * CERDA.uy + v * CERDA.vy]; }
  var EIX = (function () {   // el Eixample (y la cuadrícula de Sant Martí), aproximado, en metros
    var l = [41.3745,2.1500, 41.3795,2.1405, 41.3885,2.1322, 41.3921,2.1440, 41.3963,2.1594, 41.4000,2.1660, 41.4060,2.1690, 41.4110,2.1740, 41.4170,2.1850, 41.4235,2.1980, 41.4225,2.2140, 41.4110,2.2230, 41.4070,2.2185, 41.4000,2.2120, 41.3940,2.2065, 41.3880,2.2010, 41.3895,2.1930, 41.3920,2.1840, 41.3895,2.1805, 41.3880,2.1725, 41.3862,2.1700, 41.3850,2.1648, 41.3812,2.1605, 41.3760,2.1600, 41.3750,2.1520], r = [];
    for (var i = 0; i < l.length; i += 2) r.push([(l[i + 1] - 2.17) * 83480, -(l[i] - 41.387) * 111130]);
    return r;
  })();
  function enPoli(p, x, y) { var r = false; for (var i = 0, j = p.length - 1; i < p.length; j = i++) { var a = p[i], b = p[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) r = !r; } return r; }
  var PATIO = { jardi: ['#5f9e45', '#6aa84a', '#4f8f3c', '#7fb455', '#3f7a35'], terrat: ['#ecdcbc', '#e2cfa6', '#f2e6cc', '#d9c59c', '#e8d4b0'], cami: ['#efe2c2', '#e6d6b2'] };
  function pintarPatios(x, X0, Y0, w, s, jw, hl) {
    var c = [[X0, Y0], [X0 + w, Y0], [X0, Y0 + w], [X0 + w, Y0 + w]].map(function (q) { var m = desgirar(q[0], q[1]); return [m[0] * CERDA.ux + m[1] * CERDA.uy, m[0] * CERDA.vx + m[1] * CERDA.vy]; });
    var u0 = Math.min.apply(null, c.map(function (q) { return q[0]; })), u1 = Math.max.apply(null, c.map(function (q) { return q[0]; }));
    var v0 = Math.min.apply(null, c.map(function (q) { return q[1]; })), v1 = Math.max.apply(null, c.map(function (q) { return q[1]; }));
    var P = CERDA.paso;
    for (var iu = Math.floor((u0 - CERDA.ou) / P) - 1; iu <= Math.ceil((u1 - CERDA.ou) / P); iu++) for (var iv = Math.floor((v0 - CERDA.ov) / P) - 1; iv <= Math.ceil((v1 - CERDA.ov) / P); iv++) {
      var bu0 = CERDA.ou + iu * P + CERDA.calle, bu1 = CERDA.ou + (iu + 1) * P - CERDA.calle, bv0 = CERDA.ov + iv * P + CERDA.calle, bv1 = CERDA.ov + (iv + 1) * P - CERDA.calle;
      var cm = cerdaMundo((bu0 + bu1) / 2, (bv0 + bv1) / 2);
      if (!enPoli(EIX, cm[0], cm[1])) continue;
      var cg = girar(cm[0], cm[1]); if (claseEn(cg[0], cg[1]) !== N.ciutat) continue;
      var cerca = false; MONUMENTOS.forEach(function (m) { if (Math.hypot(m.X - cg[0], m.Y - 40 - cg[1]) < 110) cerca = true; }); if (cerca) continue;
      if (h(iu, iv, 61) < 0.12) continue;   // alguna manzana con el interior cubierto
      // el patio: la manzana menos el fondo de los edificios (22–30 m), a veces más largo que ancho
      var D = 22 + h(iu, iv, 62) * 8, Du = D + (h(iu, iv, 63) < 0.3 ? 10 : 0), Dv = D + (h(iu, iv, 64) < 0.3 ? 10 : 0);
      var pu0 = bu0 + Du, pu1 = bu1 - Du, pv0 = bv0 + Dv, pv1 = bv1 - Dv;
      var jardi = h(iu, iv, 65) < 0.62, pal = jardi ? PATIO.jardi : PATIO.terrat;
      var esq = [[pu0, pv0], [pu1, pv0], [pu1, pv1], [pu0, pv1]].map(function (q) { var m = cerdaMundo(q[0], q[1]); return girar(m[0], m[1]); });
      var cam = new Path2D(); esq.forEach(function (q, k) { k ? cam.lineTo(q[0], q[1]) : cam.moveTo(q[0], q[1]); }); cam.closePath();
      // la sombra de los edificios sobre el patio (luz de arriba a la izquierda) y el cemento
      x.fillStyle = JUNTA; x.fill(cam);
      x.save(); x.clip(cam);
      var ts = Math.max(4, 10 / s), nu = Math.max(1, Math.round((pu1 - pu0) / ts)), nv = Math.max(1, Math.round((pv1 - pv0) / ts)), tu = (pu1 - pu0) / nu, tv = (pv1 - pv0) / nv;
      for (var a = 0; a < nu; a++) for (var b = 0; b < nv; b++) {
        var q = [[a, b], [a + 1, b], [a + 1, b + 1], [a, b + 1]].map(function (e) { var jx = (e[0] > 0 && e[0] < nu ? (h(iu * 31 + e[0], iv * 17 + e[1], 66) - 0.5) * 0.35 : 0), jy = (e[1] > 0 && e[1] < nv ? (h(iu * 13 + e[0], iv * 7 + e[1], 67) - 0.5) * 0.35 : 0);
          var m = cerdaMundo(pu0 + (e[0] + jx) * tu, pv0 + (e[1] + jy) * tv); return girar(m[0], m[1]); });
        var col = pal[Math.floor(h(iu * 7 + a, iv * 5 + b, 68) * pal.length)];
        if (jardi && (a === 0 || b === 0 || a === nu - 1 || b === nv - 1) && h(a, b, iu + iv) < 0.5) col = PATIO.cami[(a + b) % 2];   // el caminito del borde
        pieza(x, q, tono(col, 0.93 + h(a + iu, b + iv, 69) * 0.14), jw, hl);
      }
      // la sombra que dejan los edificios en el borde de arriba a la izquierda del patio
      x.globalCompositeOperation = 'multiply'; x.strokeStyle = 'rgba(90,60,30,0.35)'; x.lineWidth = 7 / s * Math.min(1, s);
      x.beginPath(); x.moveTo(esq[3][0], esq[3][1]); x.lineTo(esq[0][0], esq[0][1]); x.lineTo(esq[1][0], esq[1][1]); x.stroke();
      x.globalCompositeOperation = 'source-over';
      // los árboles de los jardines, de cerca
      if (jardi && s >= 1.2) {
        var n = 3 + Math.floor(h(iu, iv, 70) * 4);
        for (var k = 0; k < n; k++) {
          var m2 = cerdaMundo(pu0 + (0.18 + h(iu, iv + k, 71) * 0.64) * (pu1 - pu0), pv0 + (0.18 + h(iu + k, iv, 72) * 0.64) * (pv1 - pv0)), g2 = girar(m2[0], m2[1]), r = 4.5 + h(k, iu, iv) * 2.5;
          x.save(); x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgba(80,60,30,0.3)'; x.beginPath(); x.ellipse(g2[0] + r * 0.5, g2[1] + r * 0.6, r, r * 0.8, 0, 0, 6.2832); x.fill(); x.restore();
          for (var wd = 0; wd < 5; wd++) {
            var a0 = wd / 5 * 6.2832 + k, a1 = (wd + 1) / 5 * 6.2832 + k, pts = [g2];
            for (var t = 0; t <= 3; t++) { var an = a0 + (a1 - a0) * t / 3; pts.push([g2[0] + Math.cos(an) * r, g2[1] + Math.sin(an) * r]); }
            pieza(x, pts, tono(['#2f6b3a', '#3c7a40', '#4f8a4a', '#25583a', '#5a9a50'][(wd + k) % 5], 0.95 + h(wd, k, 73) * 0.1), jw * 0.8, hl);
          }
        }
      }
      x.restore();
      x.strokeStyle = 'rgba(70,45,25,0.3)'; x.lineWidth = jw * 1.2; x.stroke(cam);
    }
  }

  // los chaflanes: cada esquina de manzana cortada a 45° (unos 14 m de lado), del color de la acera, después de las calles
  function pintarXamfrans(x, X0, Y0, w, s, jw, hl) {
    var c = [[X0, Y0], [X0 + w, Y0], [X0, Y0 + w], [X0 + w, Y0 + w]].map(function (q) { var m = desgirar(q[0], q[1]); return [m[0] * CERDA.ux + m[1] * CERDA.uy, m[0] * CERDA.vx + m[1] * CERDA.vy]; });
    var u0 = Math.min.apply(null, c.map(function (q) { return q[0]; })), u1 = Math.max.apply(null, c.map(function (q) { return q[0]; }));
    var v0 = Math.min.apply(null, c.map(function (q) { return q[1]; })), v1 = Math.max.apply(null, c.map(function (q) { return q[1]; }));
    var P = CERDA.paso, L = 14 + CERDA.calle - ESTILO.carrer.w / 2, cols = ESTILO.carrer.col;
    for (var iu = Math.floor((u0 - CERDA.ou) / P) - 1; iu <= Math.ceil((u1 - CERDA.ou) / P); iu++) for (var iv = Math.floor((v0 - CERDA.ov) / P) - 1; iv <= Math.ceil((v1 - CERDA.ov) / P); iv++) {
      var U = CERDA.ou + iu * P, V = CERDA.ov + iv * P, cm = cerdaMundo(U, V);   // el cruce
      if (!enPoli(EIX, cm[0], cm[1])) continue;
      var cg = girar(cm[0], cm[1]), ok = 0;
      for (var k = 0; k < 4; k++) { var su = k & 1 ? 1 : -1, sv = k & 2 ? 1 : -1, mq = cerdaMundo(U + su * 30, V + sv * 30), gq = girar(mq[0], mq[1]); if (claseEn(gq[0], gq[1]) === N.ciutat) ok++; }
      if (ok < 3) continue;
      for (k = 0; k < 4; k++) {
        var su2 = k & 1 ? 1 : -1, sv2 = k & 2 ? 1 : -1, e = ESTILO.carrer.w / 2;   // desde el borde de la calle dibujada
        var tri = [[U + su2 * e, V + sv2 * e], [U + su2 * (e + L), V + sv2 * e], [U + su2 * e, V + sv2 * (e + L)]].map(function (q) { var m = cerdaMundo(q[0], q[1]); return girar(m[0], m[1]); });
        var cam = new Path2D(); tri.forEach(function (q, i) { i ? cam.lineTo(q[0], q[1]) : cam.moveTo(q[0], q[1]); }); cam.closePath();
        x.fillStyle = '#d9cdb4'; x.fill(cam);
        var mid = [(tri[1][0] + tri[2][0]) / 2, (tri[1][1] + tri[2][1]) / 2];
        var ci = (((iu + iv + k) % cols.length) + cols.length) % cols.length;   // índices negativos al oeste del origen
        pieza(x, [tri[0], tri[1], mid], tono(cols[ci], 0.97), jw, hl);
        pieza(x, [tri[0], mid, tri[2]], tono(cols[(ci + 1) % cols.length], 0.99), jw, hl);
      }
    }
  }

  /* ---------- los monumentos: ilustraciones de alzado hechas de teselas, en su sitio real ----------
     Cada monumento es una función que dibuja en metros, con el origen en su base (x a la derecha, y hacia arriba),
     derecho en pantalla como en un mapa pintado. El lápiz `d` tiene:
       d.forma(puntos, paleta, op)   polígono relleno de teselas (recortadas por su borde)
       d.rect / d.elipse             atajos de forma
       d.linea(puntos, ancho, color) trazo pintado (cornisas, cruces, marcas del campo)
       d.huso / d.arco               perfiles de torre y de arco
     op: vol (sombra de izquierda a derecha), ts (tamaño de tesela relativo), ruido (huecos oscuros de piedra tallada),
         modo 'rayas' (bandas en x) o 'radial' (sectores alrededor del centro), banda (paleta según la altura). */
  var PM = {
    piedra: ['#c9a46a', '#b8925e', '#d6b47c', '#a67f4f', '#ddbb85'], piedraC: ['#e2cfa4', '#d8c194', '#ecdcb6', '#cdb383'], piedraO: ['#8f6a42', '#a07a4c', '#7c5a38', '#b08a58'],
    hueco: ['#4a3222', '#5a3d26', '#3d281b'], gris: ['#a89a86', '#bfae97', '#8f8272', '#c9bba4', '#9d8f7c'], grisO: ['#6f6456', '#7d7162', '#5f564a'],
    apostol: ['#c43b2b', '#f2b33d', '#f4efe3', '#e07a3a', '#d8452f'], evang: ['#f4efe3', '#e8c46a', '#d9cba8', '#fbf6ea'], oro: ['#f2b33d', '#f4d27a', '#e9b64a', '#fbf1d0'],
    vitral: ['#2f5fae', '#c43b2b', '#f2b33d', '#3a8a5a', '#6a3f9a', '#3b7dc4'], ciprés: ['#2f6b3a', '#3c7a40', '#4f8a4a', '#25583a'],
    calc: ['#ead9b2', '#ddc79a', '#f0e3c4', '#d4bc8e'], cupula: ['#8a9aa8', '#a3b1bd', '#6f8494', '#b8c4cc'], ladrillo: ['#b8562f', '#a8472a', '#c9693e', '#9a4028', '#bf5f36'],
    vidrio: ['#9fc3df', '#7fb0d6', '#b8d4ea', '#5f95c4', '#cfe2f0'], agua: ['#3a86c8', '#4aa0d8', '#2f75bd', '#62b6e2'],
    grada: ['#1f3f8f', '#2f5fae', '#a8322c', '#c43b2b'], hormigon: ['#c9c2b4', '#b8b0a2', '#d6d0c4', '#a9a294'], cesped: ['#4f9a3c', '#5fae48'],
    verde: ['#4f8f3c', '#6aa84a', '#3f7a35'], bronce: ['#4f5a4a', '#3f4a3c', '#5f6a55'], hierro: ['#5f6a6a', '#4f5a5a', '#6f7a78'],
    glor: [[0, ['#b8322c', '#c43b2b', '#a8282a']], [22, ['#d8452f', '#e8663a', '#c43b2b']], [46, ['#f08a4b', '#f2b33d', '#e8663a']], [70, ['#4a8ed0', '#3b7dc4', '#f2b33d']], [96, ['#2f5fae', '#3b7dc4', '#2a4f9a']], [124, ['#5fa3da', '#9fc3df', '#3b7dc4']]],
    wvid: [[0, ['#2f5fae', '#3b7dc4', '#2a4f9a']], [40, ['#4a8ed0', '#5f95c4', '#3b7dc4']], [80, ['#7fb0d6', '#9fc3df', '#5f95c4']], [110, ['#b8d4ea', '#cfe2f0', '#9fc3df']]]
  };

  // perfiles
  function huso(x, w, alto, punta) {   // torre de la Sagrada: fuste recto que se estrecha en parábola hasta la punta
    var izq = [], der = [], n = 16;
    for (var i = 0; i <= n; i++) {
      var t = i / n, y = t * alto, hw = w / 2 * (t < 0.55 ? 1 - 0.2 * t / 0.55 : 0.8 * Math.pow(1 - (t - 0.55) / 0.45, 0.75) + (punta || 0.06));
      izq.push([x - hw, y]); der.unshift([x + hw, y]);
    }
    return izq.concat(der);
  }
  function arco(x0, x1, y0, ya, tipo) {   // hueco con arco de medio punto ('medio') u ojival ('ojival')
    var pts = [[x0, y0], [x1, y0], [x1, ya]], w = x1 - x0, cx = (x0 + x1) / 2, i, a;
    if (tipo === 'ojival') {
      for (i = 0; i <= 8; i++) { a = i / 8 * Math.PI / 3; pts.push([x0 + w * Math.cos(a), ya + w * Math.sin(a)]); }
      for (i = 8; i >= 0; i--) { a = Math.PI - i / 8 * Math.PI / 3; pts.push([x1 + w * Math.cos(a), ya + w * Math.sin(a)]); }
    } else for (i = 0; i <= 12; i++) { a = i / 12 * Math.PI; pts.push([cx + w / 2 * Math.cos(a), ya + w / 2 * Math.sin(a)]); }
    pts.push([x0, ya]);
    return pts;
  }
  function elipsePts(cx, cy, rx, ry, a0, a1, n) { var p = []; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }

  /* las nueve ilustraciones */
  function torreSagrada(d, x, w, alto, cap, op) {
    d.forma(huso(x, w, alto * 0.84), PM[op && op.piedra || 'piedra'], { vol: 0.22, ruido: 0.05 });
    for (var y = alto * 0.16; y < alto * 0.62; y += 5.5) d.linea([[x - w * 0.14, y], [x + w * 0.1, y + 2.2]], 1.4, 'rgba(70,45,25,0.8)');   // las celosías en espiral
    d.elipse(x, alto * 0.87, w * 0.3, alto * 0.075, PM[cap], { vol: 0.18, ts: 0.55 });
    [-1, 1].forEach(function (sg) { d.elipse(x + sg * w * 0.3, alto * 0.84, w * 0.09, w * 0.09, PM.evang, { ts: 0.4 }); });
    d.elipse(x, alto * 0.965, w * 0.11, w * 0.11, ['#fbf6ea', '#f4efe3'], { ts: 0.4 });
    d.linea([[x, alto * 0.975], [x, alto * 1.02]], 1.2, '#f4d27a');
  }
  var DIBUJOS = {
    sagrada: function (d) {
      // la nave detrás, con vitrales
      d.rect(-118, 0, 118, 92, PM.piedraC, { vol: 0.1 });
      for (var i = -4; i <= 4; i++) if (Math.abs(i) > 1) d.forma(arco(i * 25 - 4, i * 25 + 4, 22, 66, 'ojival'), PM.vitral, { ts: 0.4 });
      // las torres de detrás: evangelistas, María y Jesucristo
      torreSagrada(d, -40, 30, 262, 'evang', { piedra: 'piedraC' }); torreSagrada(d, 40, 30, 262, 'evang', { piedra: 'piedraC' });
      torreSagrada(d, 0, 46, 330, 'oro', { piedra: 'piedraC' });
      d.linea([[0, 322], [0, 356]], 4.5, '#fbf6ea'); d.linea([[-11, 344], [11, 344]], 4.5, '#fbf6ea'); d.linea([[0, 330], [0, 352]], 1.6, '#f2b33d');
      // la fachada del Nacimiento: cuerpo de piedra oscura tallada con el gablete central
      d.forma([[-108, 0], [108, 0], [108, 104], [40, 112], [26, 150], [0, 168], [-26, 150], [-40, 112], [-108, 104]], PM.piedraO, { vol: 0.12, ruido: 0.12 });
      // las cuatro torres de los apóstoles
      torreSagrada(d, -88, 24, 196, 'apostol', { piedra: 'piedraO' }); torreSagrada(d, -62, 26, 222, 'apostol', { piedra: 'piedraO' });
      torreSagrada(d, 62, 26, 222, 'apostol', { piedra: 'piedraO' }); torreSagrada(d, 88, 24, 196, 'apostol', { piedra: 'piedraO' });
      // los tres portales (Esperanza, Caridad, Fe), con sus arquivoltas
      [[-46, -30, 40], [-24, 24, 70], [30, 46, 40]].forEach(function (p) {
        var cx = (p[0] + p[1]) / 2, w = p[1] - p[0];
        d.forma(arco(p[0] - 5, p[1] + 5, 0, p[2] * 0.62, 'ojival'), PM.piedra, { ruido: 0.15, ts: 0.6 });
        d.forma(arco(p[0] - 1.5, p[1] + 1.5, 0, p[2] * 0.6, 'ojival'), PM.piedraC, { ts: 0.5 });
        d.forma(arco(p[0] + 2, p[1] - 2, 0, p[2] * 0.56, 'ojival'), PM.hueco, { ts: 0.6 });
        d.linea([[cx, 0], [cx, p[2] * 0.5]], 1.2, 'rgba(201,164,106,0.7)');
      });
      // el ciprés con las palomas blancas, sobre el portal central
      d.forma([[-13, 96], [13, 96], [8, 130], [3, 152], [0, 162], [-3, 152], [-8, 130]], PM['ciprés'], { vol: 0.15, ts: 0.5 });
      [[-6, 112], [5, 122], [-3, 136], [4, 146], [7, 104]].forEach(function (p) { d.elipse(p[0], p[1], 2.2, 1.6, ['#fbf8f0', '#ffffff'], { ts: 0.3 }); });
      d.elipse(0, 86, 9, 6, PM.oro, { ts: 0.4 });   // la estrella de la Natividad
      d.rect(-122, -9, 122, 0, PM.piedraC, { ts: 0.7 });   // las escaleras
      d.linea([[-122, -4.5], [122, -4.5]], 1, 'rgba(120,90,50,0.5)');
    },
    glories: function (d) {
      var perfil = [[-30, 0], [30, 0]];
      for (var i = 0; i <= 14; i++) { var t = i / 14, a = t * Math.PI / 2; perfil.push([30 * Math.cos(a), 96 + 60 * Math.sin(a)]); }
      for (i = 14; i >= 0; i--) { var a2 = i / 14 * Math.PI / 2; perfil.push([-30 * Math.cos(a2), 96 + 60 * Math.sin(a2)]); }
      d.forma(perfil, null, { banda: PM.glor, vol: 0.28, ts: 0.6 });
      for (var y = 4; y < 150; y += 3.2) d.linea([[-30, y], [30, y]], 0.6, 'rgba(255,255,255,0.28)', perfil);   // las lamas de vidrio
      for (var x = -24; x <= 24; x += 8) d.linea([[x, 0], [x, 150]], 0.6, 'rgba(20,30,60,0.22)', perfil);
      d.elipse(0, 150, 14, 7, PM.vidrio, { ts: 0.4 });   // la cúpula
      d.rect(-30, 0, 30, 6, PM.grisO, { ts: 0.5 }); d.rect(-8, 0, 8, 5, PM.hueco, { ts: 0.4 });
    },
    campnou: function (d) {
      // el muro de fuera (la mitad de delante del óvalo, con su altura) y los nervios
      var frente = elipsePts(0, 64, 136, 80, Math.PI, 2 * Math.PI, 40), muro = frente.concat(frente.slice().reverse().map(function (p) { return [p[0], p[1] - 20]; }));
      d.forma(muro, PM.hormigon, { vol: 0.25, ts: 0.6 });
      for (var i = 0; i <= 40; i += 2) { var p = frente[i]; d.linea([[p[0], p[1]], [p[0], p[1] - 20]], 1.2, 'rgba(80,70,60,0.45)'); }
      // las gradas, del anillo de fuera hacia el campo
      d.elipse(0, 64, 136, 80, PM.hormigon, { ts: 0.6 });
      d.elipse(0, 64, 128, 75, PM.grada, { modo: 'radial', ts: 0.55 });
      d.elipse(0, 64, 112, 64, ['#a8322c', '#c43b2b', '#b8322c'], { ts: 0.5 });
      d.elipse(0, 64, 98, 55, ['#1f3f8f', '#2f5fae', '#2a4f9a'], { ts: 0.5 });
      d.elipse(0, 64, 86, 47, PM.hormigon, { ts: 0.5 });
      // el campo con su césped a rayas y las líneas
      var campo = [[-66, 38], [66, 38], [60, 90], [-60, 90]];
      d.forma(campo, PM.cesped, { modo: 'rayas', ts: 0.5 });
      d.linea(campo.concat([campo[0]]), 1.2, '#f7f2e6'); d.linea([[0, 38], [0, 90]], 1.2, '#f7f2e6');
      d.linea(elipsePts(0, 64, 9, 7, 0, 6.2832, 24), 1.2, '#f7f2e6');
      [[-1, -66, -60], [1, 66, 60]].forEach(function (g) { d.linea([[g[1], 52], [g[1] - g[0] * 16, 53], [g[2] - g[0] * 15, 76], [g[2], 76]], 1.1, '#f7f2e6'); d.linea([[g[1], 60], [g[1] + g[0] * 3, 60], [g[2] + g[0] * 3, 68], [g[2], 68]], 1.6, '#ffffff'); });
      d.texto('MÉS QUE UN CLUB', 0, 22, 8.5, '#f2b33d');
    },
    catedral: function (d) {
      // el cimborrio de detrás, con su aguja y sus crochets
      d.rect(-13, 60, 13, 118, PM.gris, { vol: 0.2, ruido: 0.06 });
      d.forma([[-13, 118], [13, 118], [0, 190]], PM.gris, { vol: 0.25, ts: 0.6 });
      for (var y = 124; y < 184; y += 8) { var hw = 13 * (1 - (y - 118) / 72); d.forma([[-hw - 3, y], [-hw, y - 2], [-hw + 1, y + 4]], PM.gris, { ts: 0.4 }); d.forma([[hw + 3, y], [hw, y - 2], [hw - 1, y + 4]], PM.gris, { ts: 0.4 }); }
      d.elipse(0, 192, 2.2, 2.2, PM.oro, { ts: 0.3 });
      // las dos torres laterales con sus pináculos
      [-40, 40].forEach(function (x) {
        d.rect(x - 9, 0, x + 9, 112, PM.gris, { vol: 0.22, ruido: 0.06 });
        d.forma(arco(x - 3, x + 3, 70, 92, 'ojival'), PM.grisO, { ts: 0.4 });
        [-6, 0, 6].forEach(function (o) { d.forma([[x + o - 3, 112], [x + o + 3, 112], [x + o, 112 + (o ? 14 : 22)]], PM.gris, { ts: 0.4 }); });
      });
      // el cuerpo, la fila de pináculos, el gablete y el rosetón
      d.rect(-50, 0, 50, 70, PM.gris, { vol: 0.12, ruido: 0.08 });
      for (var x = -46; x <= 46; x += 9.2) d.forma([[x - 2.5, 70], [x + 2.5, 70], [x, 82]], PM.gris, { ts: 0.4 });
      d.forma([[-26, 58], [26, 58], [0, 108]], PM.gris, { vol: 0.1, ts: 0.6 });
      d.elipse(0, 76, 11, 11, PM.grisO, { ts: 0.4 });
      d.elipse(0, 76, 9, 9, PM.vitral, { modo: 'radial', ts: 0.3 });
      d.elipse(0, 76, 2.5, 2.5, PM.oro, { ts: 0.3 });
      // el portal con sus arquivoltas y las ventanas laterales
      d.forma(arco(-18, 18, 0, 26, 'ojival'), PM.gris, { ts: 0.5 }); d.forma(arco(-13, 13, 0, 25, 'ojival'), PM.grisO, { ts: 0.5 }); d.forma(arco(-8, 8, 0, 24, 'ojival'), PM.hueco, { ts: 0.5 });
      [-30, 30].forEach(function (x) { d.forma(arco(x - 4, x + 4, 20, 46, 'ojival'), PM.vitral, { ts: 0.35 }); });
      d.rect(-56, -6, 56, 0, PM.gris, { ts: 0.6 });
    },
    mnac: function (d) {
      // la Font Màgica delante, con sus surtidores
      d.elipse(0, -24, 64, 9, PM.piedraC, { ts: 0.6 }); d.elipse(0, -24, 58, 7, PM.agua, { ts: 0.5 });
      for (var j = -48; j <= 48; j += 8) d.linea([[j, -24], [j * 0.9, -24 + 14 + (j % 16 ? 0 : 8)]], 1.6, 'rgba(240,250,255,0.85)');
      d.forma([[-80, -14], [80, -14], [64, 0], [-64, 0]], PM.calc, { ts: 0.6 });   // las escalinatas
      for (var e = -12; e < 0; e += 2.4) d.linea([[-80 + (e + 14) * 1.15, e], [80 - (e + 14) * 1.15, e]], 0.7, 'rgba(150,120,80,0.5)');
      // las torres de detrás (como la Giralda), con su cupulín
      [-72, 72, -44, 44].forEach(function (x, k) {
        var alto = k < 2 ? 104 : 122;
        d.rect(x - 6, 30, x + 6, alto, PM.calc, { vol: 0.2, ts: 0.5 });
        for (var y = 50; y < alto - 10; y += 14) d.forma(arco(x - 2, x + 2, y, y + 5, 'medio'), PM.hueco, { ts: 0.3 });
        d.elipse(x, alto + 4, 6.5, 6, PM.cupula, { vol: 0.2, ts: 0.4 }); d.linea([[x, alto + 9], [x, alto + 16]], 1.2, '#f2b33d');
      });
      // la cúpula sobre su tambor, con nervios y linterna
      d.rect(-30, 60, 30, 80, PM.calc, { vol: 0.15, ts: 0.5 });
      for (var x = -26; x <= 26; x += 6.5) d.forma(arco(x - 1.8, x + 1.8, 64, 72, 'medio'), PM.hueco, { ts: 0.3 });
      var cup = elipsePts(0, 80, 33, 44, 0, Math.PI, 24); d.forma(cup, PM.cupula, { vol: 0.3, ts: 0.5 });
      for (var a = 0.3; a < 3; a += 0.42) d.linea([[33 * Math.cos(a) * 0.98, 80 + 44 * Math.sin(a) * 0.98], [0, 124]], 0.9, 'rgba(230,236,240,0.55)', cup);
      d.rect(-5, 122, 5, 134, PM.calc, { ts: 0.3 }); d.elipse(0, 136, 5, 4, PM.cupula, { ts: 0.3 }); d.linea([[0, 139], [0, 148]], 1.2, '#f2b33d');
      // las alas, con arcos y balaustrada, y el pórtico central de columnas
      [-1, 1].forEach(function (sg) {
        var x0 = sg < 0 ? -136 : 62, x1 = sg < 0 ? -62 : 136;
        d.rect(x0, 0, x1, 50, PM.calc, { vol: 0.08, ts: 0.6 });
        for (var xa = x0 + 6; xa < x1 - 4; xa += 9.5) { d.forma(arco(xa, xa + 5, 8, 22, 'medio'), PM.hueco, { ts: 0.3 }); d.forma(arco(xa + 0.5, xa + 4.5, 30, 38, 'medio'), PM.hueco, { ts: 0.3 }); }
        for (var xb = x0 + 2; xb < x1; xb += 3.2) d.linea([[xb, 50], [xb, 54]], 1, '#f6efe1');
        d.linea([[x0, 50], [x1, 50]], 1.6, '#f6efe1'); d.linea([[x0, 54], [x1, 54]], 1.2, '#f6efe1');
      });
      d.rect(-62, 0, 62, 62, PM.calc, { vol: 0.08, ts: 0.6 });
      d.rect(-34, 8, 34, 44, PM.hueco, { ts: 0.5 });
      for (var c = -30; c <= 30; c += 10) d.rect(c - 2.2, 8, c + 2.2, 44, ['#f6efe1', '#efe2c2'], { ts: 0.3 });
      d.forma([[-38, 44], [38, 44], [0, 58]], PM.calc, { ts: 0.4 }); d.linea([[-38, 44], [38, 44]], 1.6, '#f6efe1');
      d.linea([[-62, 62], [62, 62]], 2, '#f6efe1');
    },
    tibidabo: function (d) {
      // la noria roja del parque de atracciones
      var nx = 88, ny = 36, nr = 26;
      d.linea([[nx - 16, -2], [nx, ny], [nx + 16, -2]], 2.2, '#7a3b2a');
      d.linea(elipsePts(nx, ny, nr, nr, 0, 6.2832, 40), 2.2, '#c43b2b');
      for (var k = 0; k < 8; k++) { var a = k / 8 * 6.2832; d.linea([[nx, ny], [nx + Math.cos(a) * nr, ny + Math.sin(a) * nr]], 0.8, '#d8452f'); d.elipse(nx + Math.cos(a) * nr, ny + Math.sin(a) * nr - 3, 3, 3, [['#f2b33d', '#2f5fae', '#4f9a3c', '#c43b2b'][k % 4]], { ts: 0.3 }); }
      // la cripta románica de abajo
      d.rect(-50, 0, 50, 34, PM.piedraO, { vol: 0.12, ruido: 0.08 });
      for (var x = -42; x <= 42; x += 12) d.forma(arco(x - 3.5, x + 3.5, 4, 18, 'medio'), PM.hueco, { ts: 0.35 });
      d.forma([[-56, -6], [56, -6], [50, 0], [-50, 0]], PM.piedraC, { ts: 0.5 });
      // la iglesia neogótica, las torrecillas y la torre con el Sagrado Corazón
      d.rect(-34, 34, 34, 80, PM.gris, { vol: 0.15, ruido: 0.06 });
      [-24, -8, 8, 24].forEach(function (x) { d.forma(arco(x - 3, x + 3, 42, 62, 'ojival'), PM.vitral, { ts: 0.3 }); });
      [-32, 32].forEach(function (x) { d.rect(x - 5, 34, x + 5, 104, PM.gris, { vol: 0.2 }); d.forma([[x - 5, 104], [x + 5, 104], [x, 122]], PM.gris, { ts: 0.4 }); });
      d.rect(-12, 80, 12, 132, PM.gris, { vol: 0.2, ruido: 0.05 });
      d.forma(arco(-5, 5, 92, 116, 'ojival'), PM.hueco, { ts: 0.35 });
      d.forma([[-14, 132], [14, 132], [10, 140], [-10, 140]], PM.gris, { ts: 0.4 });
      // la estatua de Cristo, dorada y con los brazos abiertos
      d.forma([[-2.6, 140], [2.6, 140], [2, 158], [-2, 158]], PM.oro, { ts: 0.25 });
      d.forma([[-10, 152], [10, 152], [10, 155], [-10, 155]], PM.oro, { ts: 0.25 });
      d.elipse(0, 160, 2.4, 2.6, PM.oro, { ts: 0.2 });
    },
    arc: function (d) {
      d.rect(-36, -4, 36, 0, PM.piedraC, { ts: 0.5 });
      d.rect(-34, 0, 34, 56, PM.ladrillo, { vol: 0.12, ts: 0.4 });
      for (var y = 3; y < 56; y += 3) d.linea([[-34, y], [34, y]], 0.5, 'rgba(240,220,190,0.35)');   // las hiladas de ladrillo
      [-34, -20, 20, 34].forEach(function (x) { d.rect(x - 2.5, 0, x + 2.5, 56, PM.ladrillo, { vol: 0.3, ts: 0.3 }); });
      d.forma(arco(-16, 16, 0, 30, 'medio'), PM.piedraC, { ts: 0.4 });
      d.forma(arco(-13, 13, 0, 30, 'medio'), PM.hueco, { ts: 0.5 });
      [-27, 27].forEach(function (x) { d.forma(arco(x - 3.5, x + 3.5, 10, 26, 'medio'), PM.hueco, { ts: 0.3 }); d.elipse(x, 40, 3.2, 3.2, PM.oro, { ts: 0.25 }); });
      d.rect(-34, 44, 34, 52, PM.piedraC, { ts: 0.3 });   // el friso
      for (var x = -30; x <= 30; x += 4) d.elipse(x, 48, 1.2, 2.2, PM.piedra, { ts: 0.2 });
      d.rect(-28, 56, 28, 66, PM.ladrillo, { vol: 0.12, ts: 0.35 }); d.linea([[-36, 56], [36, 56]], 1.4, '#efe2c2');
      [-30, 30, -12, 12].forEach(function (x, k) { var a = k < 2 ? 66 : 70; d.rect(x - 3, 56, x + 3, a, PM.ladrillo, { ts: 0.3 }); d.elipse(x, a + 3, 4, 3.2, PM.oro, { vol: 0.2, ts: 0.25 }); d.linea([[x, a + 6], [x, a + 10]], 0.9, '#f2b33d'); });
    },
    colom: function (d) {
      d.forma([[-22, 0], [22, 0], [18, 6], [-18, 6]], PM.piedraC, { ts: 0.4 });
      d.rect(-13, 6, 13, 30, PM.piedraC, { vol: 0.18, ts: 0.35 });
      [[-12, 12], [-4, 12], [4, 12]].forEach(function (p) { d.rect(p[0], p[1], p[0] + 7, p[1] + 10, PM.bronce, { ts: 0.25 }); });
      [-1, 1].forEach(function (sg) { d.elipse(sg * 17, 9, 5, 3.5, PM.bronce, { ts: 0.25 }); });   // los leones
      d.forma([[-4.6, 30], [4.6, 30], [3.4, 70], [-3.4, 70]], PM.hierro, { vol: 0.3, ts: 0.3 });
      for (var y = 36; y < 70; y += 8) d.linea([[-4.4 + (y - 30) * 0.03, y], [4.4 - (y - 30) * 0.03, y]], 1, '#c9a46a');
      d.rect(-6, 70, 6, 74, PM.oro, { ts: 0.25 });
      d.elipse(0, 78, 5, 5, PM.oro, { vol: 0.3, ts: 0.25 });
      d.forma([[-2, 83], [2, 83], [1.6, 96], [-1.6, 96]], PM.bronce, { ts: 0.2 }); d.elipse(0, 98, 1.6, 1.8, PM.bronce, { ts: 0.2 });
      d.linea([[1.5, 93], [9, 97]], 1.4, '#3f4a3c');   // señalando el mar
    },
    canaletes: function (d) {
      // la Font de Canaletes: hierro colado, cuatro caños sobre pilas con el escudo de Barcelona y la farola de cuatro brazos
      var F = ['#2f3a36', '#3a4642', '#28322f', '#46524c'], O = PM.oro;
      d.forma([[-30, -4], [30, -4], [26, 4], [-26, 4]], PM.piedraC, { ts: 0.4 });   // el escalón de piedra
      d.rect(-22, 4, 22, 9, PM.gris, { ts: 0.35 });
      // las pilas redondas de los lados y la de delante, con agua
      [[-20, 18, 9], [20, 18, 9]].forEach(function (p) { d.elipse(p[0], p[1], p[2], 5, F, { vol: 0.25, ts: 0.3 }); d.elipse(p[0], p[1] + 2, p[2] - 2, 2.2, PM.agua, { ts: 0.25 }); });
      d.forma([[-12, 9], [12, 9], [14, 22], [-14, 22]], F, { vol: 0.25, ts: 0.3 });
      d.elipse(0, 22, 14, 4.5, F, { ts: 0.3 }); d.elipse(0, 23, 11.5, 2.6, PM.agua, { ts: 0.25 });
      // el escudo de Barcelona en la pila: cruz de San Jorge y las barras
      function escudo(cx, cy, e) {
        d.forma([[cx - e, cy + e], [cx + e, cy + e], [cx + e, cy - e * 0.2], [cx, cy - e * 1.2], [cx - e, cy - e * 0.2]], ['#f4efe3'], { ts: 0.15 });
        d.rect(cx - e, cy, cx, cy + e, ['#f4efe3'], { ts: 0.15 }); d.linea([[cx - e * 0.5, cy], [cx - e * 0.5, cy + e]], 0.5, '#c43b2b'); d.linea([[cx - e, cy + e * 0.5], [cx, cy + e * 0.5]], 0.5, '#c43b2b');
        d.forma([[cx, cy - e * 1.1], [cx + e, cy - e * 0.2], [cx + e, cy + e], [cx, cy + e]], ['#f2b33d'], { ts: 0.15 });
        for (var k = 1; k < 4; k++) d.linea([[cx + e * k / 4, cy - e * 0.3], [cx + e * k / 4, cy + e]], 0.35, '#c43b2b');
        d.linea([[cx - e, cy + e], [cx + e, cy + e], [cx + e, cy - e * 0.2], [cx, cy - e * 1.2], [cx - e, cy - e * 0.2], [cx - e, cy + e]], 0.35, '#f2b33d');
      }
      escudo(0, 13.5, 3.2);
      // la columna de hierro con sus anillos dorados y los cuatro caños
      d.forma([[-4.5, 22], [4.5, 22], [3.4, 44], [-3.4, 44]], F, { vol: 0.35, ts: 0.25 });
      d.elipse(0, 30, 6.5, 3.4, F, { vol: 0.3, ts: 0.25 });
      [[-1, -9], [1, 9], [-0.4, -4], [0.4, 4]].forEach(function (c) { d.linea([[c[0] * 4, 30], [c[1], 27], [c[1] * 1.1, 24.5]], 0.9, '#d9a03a'); });
      [[-12, 31], [12, 31]].forEach(function (c) { d.linea([[c[0] * 0.4, 30], [c[0], 27], [c[0] * 1.35, 21]], 0.9, '#d9a03a'); });
      d.linea([[-4.2, 26], [4.2, 26]], 1, '#f2b33d'); d.linea([[-3.6, 38], [3.6, 38]], 1, '#f2b33d');
      d.forma([[-2.6, 44], [2.6, 44], [1.9, 86], [-1.9, 86]], F, { vol: 0.35, ts: 0.22 });   // el fuste
      [52, 64, 76].forEach(function (y) { d.linea([[-2.5, y], [2.5, y]], 0.9, '#f2b33d'); });
      d.elipse(0, 87, 3.4, 1.6, O, { ts: 0.2 });
      // la farola de cuatro brazos con sus faroles y la corona
      [-1, 1].forEach(function (sg) {
        d.linea([[0, 87], [sg * 6, 92], [sg * 12, 92], [sg * 14, 89]], 1.2, '#2f3a36');
        d.linea([[sg * 3, 88.5], [sg * 7, 90.5]], 0.6, '#f2b33d');
        d.forma([[sg * 14 - 2.6, 89], [sg * 14 + 2.6, 89], [sg * 14 + 3.3, 96], [sg * 14 - 3.3, 96]], ['#fbe6a8', '#f4d27a', '#fff3cf'], { ts: 0.15 });
        d.forma([[sg * 14 - 3.8, 96], [sg * 14 + 3.8, 96], [sg * 14, 99.5]], F, { ts: 0.15 });
      });
      d.linea([[0, 87], [-4, 94], [-7, 95.5]], 1, '#2f3a36'); d.linea([[0, 87], [4, 94], [7, 95.5]], 1, '#2f3a36');
      [-7, 7].forEach(function (x) { d.forma([[x - 2.2, 95.5], [x + 2.2, 95.5], [x + 2.8, 101], [x - 2.8, 101]], ['#fbe6a8', '#f4d27a'], { ts: 0.15 }); });
      d.forma([[-2, 87], [2, 87], [1.4, 100], [-1.4, 100]], F, { ts: 0.15 });
      d.elipse(0, 102, 2.4, 2.4, O, { vol: 0.3, ts: 0.15 }); d.linea([[0, 104], [0, 108]], 0.8, '#f2b33d');
    },
    batllo: function (d) {
      // la Casa Batlló: fachada de trencadís azul y verde, balcones de máscara, huesos abajo y el lomo del dragón arriba
      var T = ['#7fb7c9', '#9ccbb0', '#5fa3a6', '#c9e0d4', '#e8d6a8', '#d98f5a', '#4f8fb0', '#b9d6c4'];
      d.forma([[-26, 0], [26, 0], [26, 80], [14, 86], [0, 84], [-14, 88], [-26, 82]], T, { vol: 0.15, ts: 0.3 });
      d.rect(-26, 0, 26, 22, ['#e6d6b2', '#d8c59c', '#efe2c2'], { vol: 0.12, ts: 0.35 });
      [-15, 0, 15].forEach(function (x) { d.forma([[x - 6, 3], [x + 6, 3], [x + 6.5, 13], [x + 3, 18], [x - 3, 18], [x - 6.5, 13]], PM.hueco, { ts: 0.3 }); d.linea([[x - 7.5, 3], [x - 7.2, 18]], 1.4, '#f6efe1'); d.linea([[x + 7.5, 3], [x + 7.2, 18]], 1.4, '#f6efe1'); });
      [32, 46, 60].forEach(function (y, f) {
        [-15, 0, 15].forEach(function (x) {
          d.forma(elipsePts(x, y + 1, 5.5, 5, 0, 6.2832, 16), PM.hueco, { ts: 0.25 });
          d.forma([[x - 6, y - 3], [x + 6, y - 3], [x + 5, y + 2], [x + 2, y + 3.5], [x - 2, y + 3.5], [x - 5, y + 2]], ['#f4efe3', '#e9e2cf'], { ts: 0.2 });   // la máscara del balcón
          d.elipse(x - 2.2, y, 1, 0.8, PM.hueco, { ts: 0.15 }); d.elipse(x + 2.2, y, 1, 0.8, PM.hueco, { ts: 0.15 });
        });
      });
      // el lomo del dragón: escamas de colores
      d.forma([[-26, 80], [-20, 92], [-8, 100], [6, 101], [16, 96], [18, 86], [14, 86], [0, 84], [-14, 88], [-26, 82]], ['#2f8f7a', '#3aa08a', '#c9693e', '#e8a23a', '#7a3fa0', '#2f5fae', '#5fae7a'], { vol: 0.2, ts: 0.25 });
      for (var k = 0; k < 6; k++) d.linea([[-22 + k * 7, 86 + k * 1.5], [-18 + k * 7, 94 + k * 1.2]], 0.6, 'rgba(255,255,255,0.45)');
      // la torrecilla con el bulbo y la cruz de cuatro brazos
      d.rect(19, 82, 25, 102, ['#e6d6b2', '#d8c59c'], { vol: 0.2, ts: 0.25 });
      d.elipse(22, 106, 4.2, 4.6, PM.oro, { vol: 0.3, ts: 0.2 });
      d.linea([[22, 110], [22, 118]], 1.4, '#c43b2b'); d.linea([[18.5, 114], [25.5, 114]], 1.4, '#2f5fae');
    },
    pedrera: function (d) {
      // la Pedrera: la piedra ondulada, los balcones de hierro como algas y los guerreros de la azotea
      var top = [];
      for (var i = 0; i <= 24; i++) { var x = -50 + i * 100 / 24; top.push([x, 70 + 4 * Math.sin(x / 9) + 2 * Math.sin(x / 4)]); }
      d.forma([[-50, 0], [50, 0]].concat(top.slice().reverse()), PM.calc, { vol: 0.18, ts: 0.3 });
      for (var f = 0; f < 5; f++) {
        var y0 = 8 + f * 12.5, ola = [];
        for (i = 0; i <= 24; i++) { var xx = -50 + i * 100 / 24; ola.push([xx, y0 + 2.6 * Math.sin(xx / 10 + f)]); }
        d.linea(ola, 0.9, 'rgba(150,120,80,0.6)');
        for (var c = -42; c <= 42; c += 12) {
          var yy = y0 + 2.6 * Math.sin(c / 10 + f) + 2.2;
          d.forma(elipsePts(c, yy + 3.2, 3.8, 3.4, 0, 6.2832, 12), PM.hueco, { ts: 0.25 });
          if (f > 0) { var alga = []; for (var t = 0; t <= 8; t++) alga.push([c - 4.4 + t * 1.1, yy + 0.4 + (t % 2 ? 1.6 : 0)]); d.linea(alga, 0.8, '#3a3f37'); }
        }
      }
      // los guerreros (chimeneas) y las salidas de escalera en la azotea
      [-34, -18, -2, 14, 32].forEach(function (x, k) {
        var b = 70 + 4 * Math.sin(x / 9), alto = 12 + (k % 2) * 4;
        d.forma([[x - 3.2, b], [x + 3.2, b], [x + 2.4, b + alto], [x - 2.4, b + alto]], k % 2 ? ['#9ccbb0', '#5fae7a', '#e9e2cf'] : PM.calc, { vol: 0.25, ts: 0.18 });
        d.forma([[x - 3.6, b + alto], [x + 3.6, b + alto], [x + 2.6, b + alto + 3.4], [x, b + alto + 5], [x - 2.6, b + alto + 3.4]], ['#4a3f35', '#3a3f37'], { ts: 0.15 });
        d.linea([[x - 2.2, b + alto + 1.6], [x + 2.2, b + alto + 1.6]], 0.6, '#efe2c2');
      });
      d.rect(-50, 0, 50, 6, ['#dccb9e', '#cfbd8f'], { ts: 0.3 });
    },
    guell: function (d) {
      // Park Güell: los pabellones de la entrada, la escalinata con el dragón, la sala de columnas y el banco ondulado
      // el banco serpenteante de trencadís, arriba
      var banc = [];
      for (var i = 0; i <= 36; i++) { var x = -62 + i * 124 / 36; banc.push([x, 60 + 2.4 * Math.sin(x / 4.2)]); }
      d.forma([[-62, 52]].concat(banc).concat([[62, 52]]), ['#2f86bf', '#f2b33d', '#f4efe3', '#c9693e', '#6fa64c', '#5cc4c8', '#d84b3a', '#e8d05a'], { ts: 0.18 });
      d.rect(-60, 46, 60, 52, PM.calc, { ts: 0.3 });
      // la sala hipóstila: columnas dóricas
      d.rect(-56, 14, 56, 46, PM.hueco, { ts: 0.5 });
      for (var c = -50; c <= 50; c += 10) { d.rect(c - 2.6, 14, c + 2.6, 44, ['#f2e6cc', '#e8d8b6', '#f6efe1'], { vol: 0.3, ts: 0.2 }); d.rect(c - 3.6, 42, c + 3.6, 46, ['#efe2c2'], { ts: 0.2 }); }
      // la escalinata con el dragón de trencadís en medio
      d.forma([[-30, -16], [30, -16], [20, 14], [-20, 14]], PM.calc, { ts: 0.3 });
      for (var y = -13; y < 14; y += 3) d.linea([[-30 + (y + 16) / 3, y], [30 - (y + 16) / 3, y]], 0.5, 'rgba(150,120,80,0.5)');
      d.forma([[-9, -6], [9, -6], [11, -2], [8, 4], [0, 7], [-8, 4], [-11, -2]], ['#4f9a3c', '#f2b33d', '#2f86bf', '#e8663a', '#5cc4c8', '#6fa64c'], { ts: 0.15 });
      d.elipse(0, -8, 6, 3.2, ['#4f9a3c', '#f2b33d', '#2f86bf', '#e8663a'], { ts: 0.15 });
      d.elipse(-2.4, -7.5, 0.8, 0.8, PM.hueco, { ts: 0.1 }); d.elipse(2.4, -7.5, 0.8, 0.8, PM.hueco, { ts: 0.1 });
      // los dos pabellones de cuento de la entrada
      [[-82, 1], [82, -1]].forEach(function (pb, k) {
        var x = pb[0];
        d.rect(x - 14, -16, x + 14, 12, ['#c9a46a', '#b8925e', '#d6b47c'], { vol: 0.15, ts: 0.25 });
        d.forma(arco(x - 4, x + 4, -16, -6, 'medio'), PM.hueco, { ts: 0.2 });
        d.forma([[x - 16, 12], [x + 16, 12], [x + 10, 22], [x, 27], [x - 10, 22]], ['#8a5a3a', '#f4efe3', '#7a4a2e', '#e9e2cf', '#c43b2b'], { vol: 0.15, ts: 0.18 });   // el tejado de trencadís
        if (k === 0) { d.forma([[x + 6, 12], [x + 12, 12], [x + 11, 40], [x + 7, 40]], ['#f4efe3', '#2f5fae', '#e9e2cf'], { modo: 'rayas', ts: 0.15 }); d.elipse(x + 9, 43, 3.2, 3.2, ['#2f5fae', '#f4efe3'], { ts: 0.15 }); d.linea([[x + 9, 46], [x + 9, 51]], 0.9, '#f2b33d'); d.linea([[x + 7, 49], [x + 11, 49]], 0.9, '#f2b33d'); }
        else { d.elipse(x, 28, 7, 4.5, ['#f4efe3', '#ffffff'], { vol: 0.2, ts: 0.15 }); [[-3, 29], [2, 30.5], [3.5, 27.5], [-1, 26.8]].forEach(function (pm) { d.elipse(x + pm[0], pm[1], 0.9, 0.8, ['#c43b2b'], { ts: 0.1 }); }); }
      });
    },
    santpau: function (d) {
      // el Hospital de Sant Pau: ladrillo rojo, cúpulas de cerámica de colores y la torre del reloj
      d.rect(-60, 0, 60, 52, PM.ladrillo, { vol: 0.1, ts: 0.3 });
      for (var x = -54; x <= 54; x += 9) { if (Math.abs(x) < 12) continue; d.forma(arco(x - 2.6, x + 2.6, 10, 24, 'medio'), PM.hueco, { ts: 0.2 }); d.forma(arco(x - 2.2, x + 2.2, 32, 42, 'medio'), PM.hueco, { ts: 0.2 }); }
      d.linea([[-60, 28], [60, 28]], 1.2, '#efe2c2'); d.linea([[-60, 52], [60, 52]], 1.6, '#efe2c2');
      d.forma(arco(-8, 8, 0, 20, 'medio'), PM.piedraC, { ts: 0.25 }); d.forma(arco(-6, 6, 0, 19, 'medio'), PM.hueco, { ts: 0.25 });
      // las cúpulas de los lados
      [-40, 40].forEach(function (x) {
        d.rect(x - 9, 52, x + 9, 66, PM.ladrillo, { vol: 0.2, ts: 0.25 });
        d.forma(elipsePts(x, 66, 10, 14, 0, Math.PI, 16), ['#e8b64a', '#4f9a6a', '#f2d27a', '#2f8f7a', '#c9693e'], { vol: 0.25, ts: 0.18 });
        d.linea([[x, 80], [x, 88]], 1.1, '#f2b33d');
      });
      // la torre central con el reloj y la aguja de cerámica
      d.rect(-10, 52, 10, 100, PM.ladrillo, { vol: 0.2, ts: 0.25 });
      d.elipse(0, 82, 5.6, 5.6, ['#f6efe1', '#efe2c2'], { ts: 0.15 }); d.linea([[0, 82], [0, 85.5]], 0.7, '#3a2a20'); d.linea([[0, 82], [2.4, 82]], 0.7, '#3a2a20');
      d.forma(arco(-3, 3, 60, 70, 'ojival'), PM.hueco, { ts: 0.2 });
      d.forma([[-11, 100], [11, 100], [0, 128]], ['#e8b64a', '#4f9a6a', '#2f5fae', '#f2d27a'], { modo: 'rayas', vol: 0.25, ts: 0.15 });
      d.linea([[0, 128], [0, 135]], 1.1, '#f2b33d');
    },
    santamaria: function (d) {
      // Santa Maria del Mar: gótico catalán, sobrio, con el gran rosetón y las torres octogonales
      var P2 = ['#c9b08a', '#b89f7a', '#d6bf98', '#a9906c'];
      d.rect(-36, 0, 36, 66, P2, { vol: 0.12, ruido: 0.05, ts: 0.35 });
      [-28, 28].forEach(function (x) { d.rect(x - 7, 0, x + 7, 96, P2, { vol: 0.25, ts: 0.3 }); for (var y = 30; y < 92; y += 16) d.forma(arco(x - 2, x + 2, y, y + 7, 'ojival'), PM.hueco, { ts: 0.2 }); d.rect(x - 8, 94, x + 8, 97, ['#b89f7a'], { ts: 0.2 }); for (var b = -7; b <= 7; b += 2.3) d.linea([[x + b, 97], [x + b, 100]], 0.6, '#a9906c'); });
      d.forma([[-21, 66], [21, 66], [0, 80]], P2, { ts: 0.3 });
      d.elipse(0, 47, 12, 12, P2, { ts: 0.25 }); d.elipse(0, 47, 10, 10, PM.vitral, { modo: 'radial', ts: 0.18 }); d.elipse(0, 47, 2.6, 2.6, PM.oro, { ts: 0.15 });
      for (var k = 0; k < 8; k++) { var a = k / 8 * 6.2832; d.linea([[0, 47], [Math.cos(a) * 10, 47 + Math.sin(a) * 10]], 0.5, 'rgba(70,50,30,0.6)'); }
      d.forma(arco(-11, 11, 0, 20, 'ojival'), P2, { ts: 0.25 }); d.forma(arco(-7, 7, 0, 19, 'ojival'), PM.hueco, { ts: 0.25 });
      d.elipse(0, 30, 2.4, 3, PM.piedraO, { ts: 0.15 });
    },
    palau: function (d) {
      // el Palau de la Música: ladrillo, columnas de mosaico de colores, bustos y el grupo escultórico de la esquina
      d.rect(-32, 0, 32, 56, PM.ladrillo, { vol: 0.12, ts: 0.25 });
      for (var c = -24; c <= 24; c += 12) { d.rect(c - 2.4, 18, c + 2.4, 44, ['#2f8f7a', '#f2b33d', '#c43b2b', '#3b7dc4', '#f4efe3', '#6fa64c'], { ts: 0.12 }); d.elipse(c, 45, 3.6, 2, PM.oro, { ts: 0.12 }); }
      [-18, -6, 6, 18].forEach(function (x) { d.forma(arco(x - 3.6, x + 3.6, 20, 34, 'medio'), ['#7fb7c9', '#c9e0d4', '#f2d27a'], { ts: 0.15 }); });
      [-12, 0, 12].forEach(function (x) { d.forma(arco(x - 4.5, x + 4.5, 0, 10, 'medio'), PM.hueco, { ts: 0.2 }); });
      for (var b = -27; b <= 27; b += 9) d.elipse(b, 50, 1.6, 2.2, ['#f6efe1', '#efe2c2'], { ts: 0.1 });   // los bustos
      d.linea([[-32, 47], [32, 47]], 1, '#f2b33d');
      d.forma([[-34, 56], [-14, 56], [-18, 72], [-26, 76], [-32, 70]], ['#f6efe1', '#e9e2cf', '#d8cfb8'], { vol: 0.25, ts: 0.18 });   // el grupo escultórico
      d.elipse(14, 60, 10, 5, PM.oro, { vol: 0.25, ts: 0.15 });
    },
    boqueria: function (d) {
      // la Boqueria: el arco de hierro con vidrieras de colores, el rótulo y los puestos de fruta
      d.rect(-34, 0, 34, 20, PM.hueco, { ts: 0.4 });
      for (var k = 0; k < 9; k++) d.rect(-31 + k * 7, 2, -26 + k * 7, 8, [['#c43b2b', '#e8663a', '#f2b33d', '#6fa64c', '#d84b3a'][k % 5], '#f2b33d', '#e8663a'], { ts: 0.12 });   // la fruta
      [-30, 30].forEach(function (x) { d.rect(x - 3.4, 0, x + 3.4, 42, PM.hierro, { vol: 0.3, ts: 0.2 }); d.elipse(x, 44, 3.6, 3.6, PM.hierro, { ts: 0.15 }); });
      d.forma(elipsePts(0, 26, 30, 26, 0, Math.PI, 24).concat([[-26, 26], [26, 26]].reverse()), PM.hierro, { ts: 0.25 });
      d.forma(elipsePts(0, 26, 26, 22, 0, Math.PI, 24), ['#c43b2b', '#f2b33d', '#2f5fae', '#4f9a3c', '#e8663a', '#7fb7c9'], { modo: 'radial', ts: 0.12 });
      d.rect(-26, 20, 26, 27, PM.hierro, { ts: 0.2 });
      d.texto('MERCAT DE SANT JOSEP', 0, 23.5, 3.6, '#f4efe3');
      d.elipse(0, 42, 6, 6, ['#f6efe1', '#c43b2b', '#f2b33d'], { modo: 'radial', ts: 0.12 });   // el escudo de arriba
    },
    w: function (d) {
      d.rect(-40, 0, 40, 10, PM.hormigon, { vol: 0.1, ts: 0.5 });
      var vela = [];
      for (var i = 0; i <= 16; i++) { var t = i / 16; vela.push([-26 + 18 * t - 8 * t * t, 10 + 118 * t]); }
      for (i = 16; i >= 0; i--) { var u = i / 16; vela.push([30 - 30 * u * u, 10 + 118 * u]); }
      d.forma(vela, null, { banda: PM.wvid, vol: 0.32, ts: 0.5 });
      for (var y = 14; y < 126; y += 3.6) d.linea([[-30, y], [32, y]], 0.5, 'rgba(255,255,255,0.3)', vela);
      d.forma([[-4, 20], [8, 20], [6, 110], [-2, 118]], ['#e6f0f8', '#cfe2f0'], { ts: 0.4, alfa: 0.55 });   // el reflejo
    }
  };
  var MONUMENTOS = [
    { n: 'Sagrada Família', ll: [41.4036, 2.1744], d: 'sagrada', ancho: 125, alto: 360 },
    { n: 'Torre Glòries', ll: [41.4034, 2.1894], d: 'glories', ancho: 34, alto: 160, esc: 1.25 },
    { n: 'Camp Nou', ll: [41.3809, 2.1228], d: 'campnou', ancho: 140, alto: 150, base: 0 },
    { n: 'Catedral', ll: [41.3840, 2.1762], d: 'catedral', ancho: 60, alto: 195 },
    { n: 'MNAC', ll: [41.3685, 2.1535], d: 'mnac', ancho: 140, alto: 150 },
    { n: 'Tibidabo', ll: [41.4219, 2.1186], d: 'tibidabo', ancho: 120, alto: 165 },
    { n: 'Arc de Triomf', ll: [41.3910, 2.1806], d: 'arc', ancho: 40, alto: 85, esc: 1.4 },
    { n: 'Colom', ll: [41.3758, 2.1778], d: 'colom', ancho: 24, alto: 100, esc: 1.8 },
    { n: 'Hotel W', ll: [41.3685, 2.1897], d: 'w', ancho: 42, alto: 130, esc: 1.25 },
    { n: 'Casa Batlló', ll: [41.3916, 2.1649], d: 'batllo', ancho: 34, alto: 120, esc: 1.35, zmin: 0.3 },
    { n: 'La Pedrera', ll: [41.3953, 2.1620], d: 'pedrera', ancho: 52, alto: 95, esc: 1.25, zmin: 0.3 },
    { n: 'Park Güell', ll: [41.4136, 2.1529], d: 'guell', ancho: 100, alto: 70 },
    { n: 'Hospital de Sant Pau', ll: [41.4116, 2.1744], d: 'santpau', ancho: 62, alto: 135, zmin: 0.25 },
    { n: 'Santa Maria del Mar', ll: [41.3837, 2.1820], d: 'santamaria', ancho: 38, alto: 100, esc: 1.2, zmin: 0.45 },
    { n: 'Palau de la Música', ll: [41.3875, 2.1753], d: 'palau', ancho: 36, alto: 76, esc: 1.3, zmin: 0.6 },
    { n: 'La Boqueria', ll: [41.3820, 2.1717], d: 'boqueria', ancho: 36, alto: 50, esc: 1.4, zmin: 0.6 },
    { n: 'Font de Canaletes', ll: [41.3853, 2.1699], d: 'canaletes', ancho: 30, alto: 110, esc: 1.5, base: 15, zmin: 0.6 }   // solo aparece al acercarse a la plaza de Catalunya
  ];
  MONUMENTOS.forEach(function (m) {
    var w = [(m.ll[1] - 2.17) * 83480, -(m.ll[0] - 41.387) * 111130], g = girar(w[0], w[1]);
    m.X = g[0]; m.Y = g[1] + (m.base === undefined ? 40 : m.base);
    var e = 3.6 * (m.esc || 1); m.caja = [m.X - (m.ancho + 40) * e, m.Y - (m.alto + 20) * e, m.X + (m.ancho + 40) * e, m.Y + 50 * e];
  });

  // pinta un monumento en la tesela (tb = la caja de la tesela en metros girados)
  function pintarMonumento(x, m, s, jw, hl, id, tb) {
    // de lejos se exageran (como en un mapa pintado) para que se lean; de cerca van a su tamaño
    var X = m.X, Y = m.Y, fz = Math.max(1, Math.min(3.6, 0.9 / s)) * (m.esc || 1), ts0 = Math.max(4.4 / (s * fz), 1.5);
    // la sombra en el suelo
    x.save(); x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgba(120,80,40,0.25)'; x.beginPath(); x.ellipse(X + m.ancho * 0.25 * fz, Y + 4 * fz, m.ancho * 1.05 * fz, m.ancho * 0.2 * fz, 0, 0, 6.2832); x.fill(); x.restore();
    pintarDibujo(x, DIBUJOS[m.d], X, Y, fz, s, ts0, jw, hl, id * 977, tb);
  }
  // el lápiz de teselas: pinta un dibujo (una función que recibe d.forma/rect/elipse/linea/texto, en metros con la y hacia
  // arriba) con su origen en (X, Y) del plano y ampliado fz, solo lo que cae en la tesela tb. También lo usa el corte de la
  // Sagrada Família (js/sagrada/seccio.js)
  function pintarDibujo(x, dibujo, X, Y, fz, s, ts0, jw, hl, sem, tb, cache) {
    function P(lx, ly) { return [X + lx * fz, Y - ly * fz]; }
    var L = [(tb[0] - X) / fz, (Y - tb[3]) / fz, (tb[2] - X) / fz, (Y - tb[1]) / fz];   // la tesela, en metros del dibujo
    function camino(pts) { var c = new Path2D(); pts.forEach(function (q, i) { var p = P(q[0], q[1]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath(); return c; }
    // primero se apuntan todas las órdenes del dibujo; luego se pintan en orden. Así cada forma sabe qué formas
    // opacas van encima y no pinta las teselas que quedarían tapadas (el Camp Nou son anillos uno sobre otro)
    var ordenes = [];
    function cajaDe(pts) { var cj = [1e9, 1e9, -1e9, -1e9]; pts.forEach(function (q) { cj[0] = Math.min(cj[0], q[0]); cj[1] = Math.min(cj[1], q[1]); cj[2] = Math.max(cj[2], q[0]); cj[3] = Math.max(cj[3], q[1]); }); return cj; }
    function dentroPts(p, px, py) { var r = false; for (var i = 0, j = p.length - 1; i < p.length; j = i++) { var a = p[i], b = p[j]; if ((a[1] > py) !== (b[1] > py) && px < (b[0] - a[0]) * (py - a[1]) / (b[1] - a[1]) + a[0]) r = !r; } return r; }
    function pintarForma(pts, pal, op, ss, encima) {
        var cj = cajaDe(pts);
        if (cj[2] < L[0] || cj[0] > L[2] || cj[3] < L[1] || cj[1] > L[3]) return;
        var c = camino(pts), ts = Math.max(ts0 * (op.ts || 1), (cache && s * fz >= 64 ? 6 : 3.4) / (s * fz)),   // nunca teselas de menos de 3,4 px (en el corte de la Sagrada Família, de muy cerca, de menos de 6)
             jwl = Math.min(jw, ts * fz * 0.14), cx = (cj[0] + cj[2]) / 2, hw = Math.max(1, (cj[2] - cj[0]) / 2), cy = (cj[1] + cj[3]) / 2;
        // en un dibujo grande (el corte de la Sagrada Família), una forma que cabe en una tesela y media es una sola pieza
        if (cache && cj[2] - cj[0] < ts * 1.6 && cj[3] - cj[1] < ts * 1.6) {
          var pu = op.banda ? op.banda[0][1] : pal; if (!pu) return;
          if (op.alfa) { x.save(); x.globalAlpha = op.alfa; }
          pieza(x, pts.map(function (q) { return P(q[0], q[1]); }), tono(pu[Math.floor(h(ss, 1, 2) * pu.length)], 0.94 + h(ss, 3, 4) * 0.12), jwl, Math.min(hl, ts * fz * 0.12));
          if (op.alfa) x.restore();
          return;
        }
        if (!op.alfa) { x.fillStyle = JUNTA; x.fill(c); }
        x.save(); x.clip(c); if (op.alfa) x.globalAlpha = op.alfa;
        var i0 = Math.floor(Math.max(cj[0], L[0]) / ts) - 1, i1 = Math.ceil(Math.min(cj[2], L[2]) / ts) + 1, j0 = Math.floor(Math.max(cj[1], L[1]) / ts) - 1, j1 = Math.ceil(Math.min(cj[3], L[3]) / ts) + 1;
        var tapan = encima.filter(function (o) { return !(o.cj[2] < cj[0] || o.cj[0] > cj[2] || o.cj[3] < cj[1] || o.cj[1] > cj[3]); });
        function e(a, b) { return P((a + (h(a, b, ss) - 0.5) * 0.4) * ts, (b + (h(b, a, ss + 1) - 0.5) * 0.4) * ts); }
        for (var j = j0; j < j1; j++) for (var i = i0; i < i1; i++) {
          var lx = (i + 0.5) * ts, ly = (j + 0.5) * ts, p = pal, r = h(i, j, ss + 2), col;
          // fuera de su forma (ninguna esquina dentro), o tapada del todo por una forma de encima: no se pinta
          var x0 = i * ts - ts * 0.2, x1 = (i + 1) * ts + ts * 0.2, y0 = j * ts - ts * 0.2, y1 = (j + 1) * ts + ts * 0.2;
          if (!dentroPts(pts, lx, ly) && !dentroPts(pts, x0, y0) && !dentroPts(pts, x1, y0) && !dentroPts(pts, x1, y1) && !dentroPts(pts, x0, y1)) continue;
          var oculta = false;
          for (var o = 0; o < tapan.length && !oculta; o++) { var tp = tapan[o]; if (x0 < tp.cj[0] || x1 > tp.cj[2] || y0 < tp.cj[1] || y1 > tp.cj[3]) continue; oculta = dentroPts(tp.pts, x0, y0) && dentroPts(tp.pts, x1, y0) && dentroPts(tp.pts, x1, y1) && dentroPts(tp.pts, x0, y1); }
          if (oculta) continue;
          if (op.banda) { p = op.banda[0][1]; for (var b = 0; b < op.banda.length; b++) if (ly >= op.banda[b][0]) p = op.banda[b][1]; }
          if (op.modo === 'rayas') col = p[((Math.floor(lx / 8) % 2) + 2) % 2];
          else if (op.modo === 'radial') col = p[((Math.floor((Math.atan2(ly - cy, lx - cx) + 3.1416) / 6.2832 * 36) % p.length) + p.length) % p.length];
          else col = p[Math.floor(r * p.length)];
          var k = 0.94 + h(j, i, ss + 3) * 0.12;
          if (op.vol) k *= 1 + op.vol * (-(lx - cx) / hw) * 0.6;
          if (op.ruido && h(i, j, ss + 4) < op.ruido) k *= 0.55;
          pieza(x, [e(i, j), e(i + 1, j), e(i + 1, j + 1), e(i, j + 1)], tono(col, k), jwl, Math.min(hl, ts * fz * 0.12));
        }
        x.restore();
        if (!op.alfa) { x.strokeStyle = 'rgba(70,45,25,0.38)'; x.lineWidth = Math.max(jwl * 1.3, 0.5 / s); x.stroke(c); }
    }
    var d = {
      forma: function (pts, pal, op) { op = op || {}; sem += 13; ordenes.push({ f: 1, pts: pts, pal: pal, op: op, ss: sem, cj: cajaDe(pts) }); },
      rect: function (x0, y0, x1, y1, pal, op) { d.forma([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], pal, op); },
      elipse: function (cx, cy, rx, ry, pal, op) { d.forma(elipsePts(cx, cy, rx, ry, 0, 6.2832, Math.max(10, Math.min(cache ? 96 : 36, Math.round((rx + ry) * fz * s / 3)))), pal, op); },   // en el corte de la Sagrada Família, círculos más redondos de muy cerca
      linea: function () { ordenes.push({ f: 2, a: arguments }); },
      texto: function () { ordenes.push({ f: 3, a: arguments }); }
    };
    var hacer = {
      linea: function (pts, ancho, color, recorte) {
        var cj = [1e9, 1e9, -1e9, -1e9]; pts.forEach(function (q) { cj[0] = Math.min(cj[0], q[0]); cj[1] = Math.min(cj[1], q[1]); cj[2] = Math.max(cj[2], q[0]); cj[3] = Math.max(cj[3], q[1]); });
        if (cj[2] < L[0] - 5 || cj[0] > L[2] + 5 || cj[3] < L[1] - 5 || cj[1] > L[3] + 5) return;
        var w = ancho * fz; if (w * s < 0.35) return;   // demasiado fino para verse a este zoom
        x.save(); if (recorte) x.clip(camino(recorte));
        x.strokeStyle = color; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round';
        x.beginPath(); pts.forEach(function (q, i) { var p = P(q[0], q[1]); i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); }); x.stroke(); x.restore();
      },
      texto: function (t, lx, ly, alto, color) {
        if (alto * fz * s < 5) return;
        var p = P(lx, ly); x.save(); x.font = '600 ' + (alto * fz) + 'px "IBM Plex Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillStyle = color; x.fillText(t, p[0], p[1]); x.restore();
      }
    };
    // las órdenes de un dibujo grande (el corte de la Sagrada Família) se apuntan una vez por escala y se guardan en «cache»
    if (cache && cache[s * fz]) ordenes = cache[s * fz];
    else { dibujo(d, L, s * fz); if (cache) cache[s * fz] = ordenes; }   // el dibujo sabe a qué escala se pinta (para poner más detalle de cerca)
    // solo las formas que tocan la tesela (con un margen) entran en juego; las líneas y los textos miran su caja al pintarse
    var M2 = 2 / (s * fz), vis = ordenes.filter(function (o) { return o.f !== 1 || !(o.cj[2] < L[0] - M2 || o.cj[0] > L[2] + M2 || o.cj[3] < L[1] - M2 || o.cj[1] > L[3] + M2); });
    vis.forEach(function (o, k) {
      if (o.f === 1) {
        var encima = [];
        for (var q = k + 1; q < vis.length; q++) { var u = vis[q]; if (u.f === 1 && !u.op.alfa) encima.push(u); }
        pintarForma(o.pts, o.pal, o.op, o.ss, encima);
      } else if (o.f === 2) hacer.linea.apply(null, o.a);
      else hacer.texto.apply(null, o.a);
    });
  }

  /* ---------- una tesela del mapa: 256 px de pantalla a un nivel de zoom ---------- */
  var S0 = 0.05, T = 256;
  function escala(L) { return S0 * Math.pow(2, L); }
  function lado(L) { return T / escala(L); }
  var grano = (function () {   // la textura del cemento, una vez
    var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d'); x.fillStyle = JUNTA; x.fillRect(0, 0, 128, 128);
    for (var i = 0; i < 1400; i++) { x.fillStyle = h(i, 1, 2) < 0.5 ? 'rgba(120,100,70,0.16)' : 'rgba(255,255,255,0.4)'; x.fillRect(h(i, 3, 4) * 128, h(i, 5, 6) * 128, 1, 1); }
    return c;
  })();

  function pintarTesela(L, i, j) {
    var s = escala(L), w = lado(L), X0 = i * w, Y0 = j * w, k = s * DPR;
    var c = document.createElement('canvas'); c.width = c.height = Math.round(T * DPR);
    var x = c.getContext('2d');
    x.fillStyle = x.createPattern(grano, 'repeat'); x.fillRect(0, 0, c.width, c.height);
    x.setTransform(k, 0, 0, k, -X0 * k, -Y0 * k);
    var jw = 0.9 / s, hl = 0.8 / s;   // media junta y grosor del canto, en px de pantalla
    var principal = x, cm = document.createElement('canvas'), ct = document.createElement('canvas');
    cm.width = ct.width = cm.height = ct.height = c.width;
    x = cm.getContext('2d'); x.setTransform(k, 0, 0, k, -X0 * k, -Y0 * k);
    function recortar(capa, modo) {   // deja (o quita) solo lo que cae en el mar real
      var y = capa.getContext('2d'), a = C45 * RES * k;
      y.save(); y.globalCompositeOperation = modo; y.imageSmoothingEnabled = true;
      y.setTransform(a, a, -a, a, (C45 * (D.x0 - D.y0) - X0) * k, (C45 * (D.x0 + D.y0) - Y0) * k);
      y.drawImage(MASCARA, 0, 0); y.restore();
    }

    var barcas = [];
    // 1 · el mar: piezas grandes (unas 26 px), cobalto mar adentro y turquesa en la orilla
    var gm = 26 / s, mi0 = Math.floor(X0 / gm) - 1, mi1 = Math.ceil((X0 + w) / gm) + 1, mj0 = Math.floor(Y0 / gm) - 1, mj1 = Math.ceil((Y0 + w) / gm) + 1, ii, jj;
    function esqM(a, b) { return [(a + (h(a, b, 11) - 0.5) * 0.5) * gm, (b + (h(b, a, 12) - 0.5) * 0.5) * gm]; }
    for (jj = mj0; jj < mj1; jj++) for (ii = mi0; ii < mi1; ii++) {
      var q = [esqM(ii, jj), esqM(ii + 1, jj), esqM(ii + 1, jj + 1), esqM(ii, jj + 1)], cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2;
      var hay = claseEn(cx, cy) === N.mar; for (var t = 0; t < 4 && !hay; t++) hay = claseEn(q[t][0], q[t][1]) === N.mar;
      if (!hay) continue;
      // cerca de la costa: se mira la tierra en 8 direcciones a 70 y 260 m
      var dcost = 2;
      for (var r = 0; r < 2 && dcost === 2; r++) { var rr = r ? 170 : 45; for (var a = 0; a < 8; a++) { var an = a * 0.785; if (claseEn(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr) !== N.mar) { dcost = r; break; } } }
      var mez = ruido(cx / 900, cy / 900) * 0.9 + h(ii, jj, 13) * 0.35, pal = dcost === 0 ? (mez > 0.75 ? MAR.cerca : MAR.medio) : dcost === 1 ? (mez > 0.7 ? MAR.medio : MAR.lejos) : (mez > 0.98 ? MAR.medio : MAR.lejos);
      var piezas = h(ii, jj, 14) < 0.3 ? [[q[0], q[1], q[2]], [q[0], q[2], q[3]]] : h(ii, jj, 14) < 0.5 ? [[q[0], q[1], q[3]], [q[1], q[2], q[3]]] : [q];
      piezas.forEach(function (pz, n) { pieza(x, pz, tono(pal[Math.floor(h(ii + n, jj, 15) * pal.length)], 0.94 + h(jj, ii + n, 16) * 0.12), jw * 1.2, hl); });
      if (dcost === 2 && h(ii, jj, 77) < 0.012) barcas.push([cx, cy, h(jj, ii, 78)]);
    }

    recortar(cm, 'destination-in');
    x = ct.getContext('2d'); x.setTransform(k, 0, 0, k, -X0 * k, -Y0 * k);
    // 2 · la tierra: teselas de unas 9 px, casi cuadradas, del color de su suelo
    var g = (s < 0.4 ? 8.5 : s < 1.2 ? 10 : 12) / s, i0 = Math.floor(X0 / g) - 1, i1 = Math.ceil((X0 + w) / g) + 1, j0 = Math.floor(Y0 / g) - 1, j1 = Math.ceil((Y0 + w) / g) + 1;
    function esq(a, b) { return [(a + (h(a, b, 1) - 0.5) * 0.42) * g, (b + (h(b, a, 2) - 0.5) * 0.42) * g]; }
    for (jj = j0; jj < j1; jj++) for (ii = i0; ii < i1; ii++) {
      var q2 = [esq(ii, jj), esq(ii + 1, jj), esq(ii + 1, jj + 1), esq(ii, jj + 1)], mx = (q2[0][0] + q2[2][0]) / 2, my = (q2[0][1] + q2[2][1]) / 2;
      var cl = claseEn(mx, my);
      if (cl === N.mar) { var t2 = 0; for (; t2 < 4; t2++) { cl = claseEn(q2[t2][0], q2[t2][1]); if (cl !== N.mar) break; } if (t2 === 4) continue; }
      var p = PAL[cl] || PAL[N.ciutat], r1 = h(ii, jj, 3), r2 = h(jj, ii, 4);
      var dv = h(ii, jj, 7), ps = dv < 0.1 ? [[q2[0], q2[1], q2[2]], [q2[0], q2[2], q2[3]]] : dv < 0.2 ? [[q2[0], q2[1], q2[3]], [q2[1], q2[2], q2[3]]] : [q2];
      for (var n2 = 0; n2 < ps.length; n2++) pieza(x, ps[n2], tono(elegir(p, n2 ? h(ii, jj, 9) : r1, n2 ? 1 : r2), 0.93 + h(ii + n2, jj, 8) * 0.14), jw, hl);
    }

    recortar(ct, 'destination-out');
    x = principal; x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(cm, 0, 0); x.drawImage(ct, 0, 0); x.restore();
    if (s >= 0.79) pintarPatios(x, X0, Y0, w, s, jw, hl);
    // 3 · las calles: primero el cemento de todas, luego las tiras de piezas (las grandes encima)
    var lista = callesEn(X0 - 40 / s, Y0 - 40 / s, X0 + w + 40 / s, Y0 + w + 40 / s);
    x.lineJoin = 'round'; x.lineCap = 'round'; x.strokeStyle = '#d9cdb4';
    var fino = Math.max(0.45, Math.min(1, s / 0.26));   // de lejos, las calles se afinan (como en Google Maps)
    if (s < 0.17) lista = lista.filter(function (ca) { return ca.e !== ESTILO.vianants && (s > 0.12 || ca.e !== ESTILO.carrer || ca.c[2] - ca.c[0] + ca.c[3] - ca.c[1] > 260); });
    lista.forEach(function (ca) { var an = Math.max(ca.e.min * (ca.e.o >= 3 ? Math.sqrt(fino) : fino) / s, ca.e.w); ca._an = an; x.lineWidth = an + 2 * jw; x.beginPath(); ca.p.forEach(function (q3, m) { m ? x.lineTo(q3[0], q3[1]) : x.moveTo(q3[0], q3[1]); }); x.stroke(); });
    lista.forEach(function (ca) {
      // la calle se parte en filas de piezas de unos 12 px: de lejos, una tira; de cerca, varias filas desfasadas
      var an = ca._an, filas = Math.max(1, Math.round(an * s / 12)), fw = an / filas, cols = ca.e.col, base = ca.id * 7;
      for (var m = 1; m < ca.p.length; m++) {
        var A = ca.p[m - 1], B = ca.p[m], len = Math.hypot(B[0] - A[0], B[1] - A[1]); if (len < 1e-6) continue;
        var tx = (B[0] - A[0]) / len, ty = (B[1] - A[1]) / len, nx = -ty, ny = tx;
        for (var f = 0; f < filas; f++) {
          var o0 = -an / 2 + f * fw + (f ? jw : 0), o1 = -an / 2 + (f + 1) * fw - (f < filas - 1 ? jw : 0);
          var lp = Math.max(fw * (filas > 1 ? 1.2 : 1.35), 6 / s), d = filas > 1 ? -h(base + m, f, 23) * lp : 0;
          for (var kk = 0; d < len; kk++) {
            var paso = lp * (0.8 + h(base + m + f, kk, 24) * 0.4), da = Math.max(0, d), db = Math.min(len, d + paso);
            if (db - da > jw * 2.5) {
              var e0 = da + (da > 0 ? jw : 0), e1 = db - (db < len ? jw : 0);
              x.fillStyle = tono(cols[Math.floor(h(base + m + f * 3, kk, 21) * cols.length)], 0.95 + h(kk, base + m + f, 22) * 0.08);
              x.beginPath();
              x.moveTo(A[0] + tx * e0 + nx * o0, A[1] + ty * e0 + ny * o0); x.lineTo(A[0] + tx * e1 + nx * o0, A[1] + ty * e1 + ny * o0);
              x.lineTo(A[0] + tx * e1 + nx * o1, A[1] + ty * e1 + ny * o1); x.lineTo(A[0] + tx * e0 + nx * o1, A[1] + ty * e0 + ny * o1);
              x.closePath(); x.fill();
              if (filas > 1) { x.strokeStyle = 'rgba(255,255,255,0.4)'; x.lineWidth = hl; x.beginPath(); x.moveTo(A[0] + tx * e0 + nx * o0, A[1] + ty * e0 + ny * o0); x.lineTo(A[0] + tx * e1 + nx * o0, A[1] + ty * e1 + ny * o0); x.stroke(); }
            }
            d += paso;
          }
        }
      }
    });
    if (s >= 0.79) pintarXamfrans(x, X0, Y0, w, s, jw, hl);
    // 4 · las palmeras de las playas (una de cada pocas celdas de 40 m con arena)
    var gp = 40, pi0 = Math.floor((X0 - 30) / gp), pi1 = Math.ceil((X0 + w + 30) / gp), pj0 = Math.floor((Y0 - 10) / gp), pj1 = Math.ceil((Y0 + w + 40) / gp);
    for (var pj = pj0; pj < pj1; pj++) for (var pi = pi0; pi < pi1; pi++) {
      if (h(pi, pj, 41) > 0.55) continue;
      var bx = (pi + h(pi, pj, 42)) * gp, by = (pj + h(pj, pi, 43)) * gp; if (claseEn(bx, by) !== N.platja) continue;
      var fp = Math.max(1, 0.5 / s), alto = (16 + h(pi, pj, 44) * 8) * fp, inc = (h(pi, pj, 45) - 0.5) * 8 * fp, top = [bx + inc, by - alto], r = 7 * fp;
      x.strokeStyle = '#8a5a32'; x.lineWidth = Math.max(1.6, 0.9 / s); x.lineCap = 'round'; x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(bx + inc * 0.2, by - alto * 0.6, top[0], top[1]); x.stroke();
      for (var fo = 0; fo < 6; fo++) {
        var an = -Math.PI / 2 + (fo - 2.5) * 0.62, ex = top[0] + Math.cos(an) * r * 1.4, ey = top[1] + Math.sin(an) * r * 0.9 + r * 0.35;
        x.strokeStyle = ['#2f7a3a', '#4f9a3c', '#3c8a40'][fo % 3]; x.lineWidth = Math.max(2.2, 1.3 / s);
        x.beginPath(); x.moveTo(top[0], top[1]); x.quadraticCurveTo((top[0] + ex) / 2, top[1] - r * 0.5, ex, ey); x.stroke();
      }
    }
    // 5 · las barcas de vela, mar adentro
    barcas.forEach(function (b) {
      var bx = b[0], by = b[1], e2 = Math.max(9, 6 / s);
      x.fillStyle = '#7a4a2a'; x.beginPath(); x.moveTo(bx - e2, by); x.lineTo(bx + e2, by); x.lineTo(bx + e2 * 0.7, by + e2 * 0.35); x.lineTo(bx - e2 * 0.7, by + e2 * 0.35); x.closePath(); x.fill();
      x.fillStyle = '#fbf8f0'; x.beginPath(); x.moveTo(bx - e2 * 0.1, by - e2 * 0.1); x.lineTo(bx - e2 * 0.1, by - e2 * 1.9); x.lineTo(bx + e2 * 0.85, by - e2 * 0.1); x.closePath(); x.fill();
      x.fillStyle = '#f2b33d'; x.beginPath(); x.moveTo(bx - e2 * 0.25, by - e2 * 0.1); x.lineTo(bx - e2 * 0.25, by - e2 * 1.5); x.lineTo(bx - e2 * 0.75, by - e2 * 0.1); x.closePath(); x.fill();
    });
    // 6 · los monumentos (los de más abajo en pantalla, encima)
    MONUMENTOS.filter(function (m) { return !(m.zmin && s < m.zmin) && !(m.caja[2] < X0 || m.caja[0] > X0 + w || m.caja[3] < Y0 || m.caja[1] > Y0 + w); })
      .sort(function (a, b) { return a.Y - b.Y; }).forEach(function (m) { pintarMonumento(x, m, s, jw * 0.7, hl, MONUMENTOS.indexOf(m), [X0, Y0, X0 + w, Y0 + w]); });
    return { c: c, uso: 0 };
  }

  /* ---------- el barrio en un punto (instrumento BARRI) ---------- */
  var BARRIOS = (window.BC_BARRIOS || []).map(function (b) { return { n: b[0], x: b[1], y: b[2], nivel: b[3] }; });
  function barrio(X, Y) {
    var cl = claseEn(X, Y);
    if (cl === N.mar) return 'Mediterrani';
    var w = desgirar(X, Y), mejor = null, md = 1e18, mejorM = null, mdM = 1e18;
    BARRIOS.forEach(function (b) { var d = (b.x - w[0]) * (b.x - w[0]) + (b.y - w[1]) * (b.y - w[1]); if (b.nivel === 0) { if (d < md) { md = d; mejor = b; } } else if (d < mdM) { mdM = d; mejorM = b; } });
    if (mejor && md < 1100 * 1100) return mejor.n;
    if (mejorM && mdM < 4500 * 4500) return mejorM.n;
    return cl === N.bosc ? 'Collserola' : '—';
  }

  /* ---------- la caja de un monumento en el plano girado, al zoom s (para los secretos) ---------- */
  function cajaMonumento(m, s) {
    var fz = Math.max(1, Math.min(3.6, 0.9 / s)) * (m.esc || 1);
    return [m.X - m.ancho * fz, m.Y - m.alto * fz, m.X + m.ancho * fz, m.Y + 6 * fz];
  }
  // un punto del dibujo de un monumento (metros del dibujo, y hacia arriba) → plano girado, al zoom s
  function enMonumento(m, lx, ly, s) { var f = Math.max(1, Math.min(3.6, 0.9 / s)) * (m.esc || 1); return [m.X + lx * f, m.Y - ly * f]; }
  function monumento(n) { for (var i = 0; i < MONUMENTOS.length; i++) if (MONUMENTOS[i].d === n || MONUMENTOS[i].n === n) return MONUMENTOS[i]; return null; }

  function ll(lat, lon) { return girar((lon - 2.17) * 83480, -(lat - 41.387) * 111130); }   // lat/lon → plano girado
  function mundoAGirado(q) { return girar(q[0], q[1]); }
  function callesNombre(n) { return CALLES.filter(function (c) { return c.n === n; }).map(function (c) { return c.p; }); }
  // ¿en el Eixample de Cerdà? (punto del plano girado)
  function enEixample(X, Y) { var w = desgirar(X, Y); return enPoli(EIX, w[0], w[1]); }
  // un punto del plano girado → coordenadas de la cuadrícula de Cerdà (u, v en metros)
  function aCerda(X, Y) { var w = desgirar(X, Y); return [w[0] * CERDA.ux + w[1] * CERDA.uy, w[0] * CERDA.vx + w[1] * CERDA.vy]; }
  function deCerda(u, v) { var m = cerdaMundo(u, v); return girar(m[0], m[1]); }

  BC.mapa = {
    ll: ll, mundoAGirado: mundoAGirado, callesNombre: callesNombre, callesEn: callesEn, enEixample: enEixample, aCerda: aCerda, deCerda: deCerda, CERDA: CERDA, anchoCarrer: ESTILO.carrer.w,
    S0: S0, T: T, escala: escala, lado: lado, pintarTesela: pintarTesela,
    girar: girar, desgirar: desgirar, claseEn: claseEn, clases: N, barrio: barrio,
    monumentos: MONUMENTOS, monumento: monumento, pintarDibujo: pintarDibujo, DIBUJOS: DIBUJOS, PM: PM, arco: arco, huso: huso, elipsePts: elipsePts, torreSagrada: torreSagrada, JUNTA: JUNTA, grano: grano, enMonumento: enMonumento, cajaMonumento: cajaMonumento, pieza: pieza, tono: tono, h: h,
    cargar: cargarClases, ponerDpr: function (d) { DPR = d; },
    LIM: [-7500, -7400, 9000, 4300]   // lo que se puede recorrer (el alejamiento máximo lo llena): del Tibidabo a bastante mar
  };
})();
