/* Barcelona Incognita · la Sagrada Família «tallada per la meitat» (Pau, 31/10/2026: «muy, muy, muy detallada», y las
   cristaleras sobre todo, «una de las cosas más importantes de la Sagrada Família»)
   El segundo mundo de la web (como la Luna de Terra): un corte transversal de la basílica por el crucero, hecho de
   teselas con el mismo lápiz que los monumentos del mapa (BC.mapa.pintarDibujo). A la izquierda la fachada del
   Nacimiento (este: vitrales fríos), a la derecha la de la Pasión (oeste: vitrales cálidos), en el centro el crucero con la
   torre de Jesucristo encima y, bajo tierra, la cripta (la tumba de Gaudí) y el museo (la maqueta de cadenas).
   Unidades: metros reales, x desde el eje de la basílica, y hacia arriba desde el suelo de la nave. En el plano del motor
   un punto es (x, -y). Medidas: tribunas a 15 m, bóvedas de la nave del crucero a 45 m, crucero a 60 m, evangelistas
   135 m, Jesucristo 172,5 m, campanarios de las fachadas 98–107 m.
   Las teselas miden unos 7 px de pantalla, pero nunca menos de 30 cm: de muy cerca se ve el mosaico, como un mural. Lo
   que es más fino que una tesela (letras, plomos, cuerdas, nervios) va con d.linea y d.texto.
   BC.sagrada da al motor lo mismo que BC.mapa (LIM, S0, NMAX, SMAX, FONDO, escala, lado, pintarTesela) más los sitios
   de los secretos (SITIOS) y zona(X, Y) para el instrumento. */
(function () {
  'use strict';
  var BC = window.BC, M = BC.mapa, PM = M.PM, h = M.h, DPR = 1;

  /* ---------- paletas propias (las demás son las del mapa) ---------- */
  var C = {
    corte: ['#8f3a2a', '#9a3a2c', '#a8472a', '#7f3326'],            // lo cortado (muros, bóvedas, cimientos): el «poché» del plano
    porfid: ['#7a1f1c', '#8f2a24', '#6b1a18', '#9a3a2c'],            // las cuatro columnas del crucero son de pórfido rojo
    basalt: ['#4a4744', '#57534e', '#3f3c39', '#5f5a54'], granit: ['#9a958c', '#a8a39a', '#8b867e', '#b3aea4'],
    volta: ['#efe7d4', '#e6dcc4', '#f6f0e2', '#ddd1b6'], fulla: ['#e9e0c9', '#f2ead8', '#ddd2b8', '#f6f0e2'],
    oculs: ['#f2b33d', '#4f9a3c', '#f4d27a', '#6aa84a', '#e9b64a'], llum: ['#fbf1d0', '#fff8e6', '#f6e7b8'],
    jesus: ['#e9e4da', '#d8d2c6', '#f4efe3', '#c9c2b4', '#dfd9cd'], vidre: ['#9fc3df', '#7fb0d6', '#b8d4ea', '#cfe2f0'],
    cel: [[-30, ['#efe6d2', '#f0e8d6', '#ece2cc']], [22, ['#ece6d4', '#efe6d2', '#e6e4d6']], [44, ['#e3e6dc', '#e8e6d8', '#dfe5e0']], [66, ['#dce4e0', '#e3e6dc', '#d6e2e6']], [88, ['#d3e0e4', '#dce4e0', '#cfdde3']], [110, ['#c9dbe3', '#d3e0e4', '#c3d7e4']], [132, ['#bfd5e2', '#c9dbe3', '#b9d1e0']], [154, ['#b5cedf', '#bfd5e2', '#afcadd']]],
    terra: [[-40, ['#6f4f30', '#7c5a38', '#654628']], [-21, ['#7c5a38', '#8f6236', '#6f4f30']], [-17, ['#8f6236', '#a0703f', '#86592f']], [-9, ['#a87a48', '#b88a55', '#9c6e3e']], [-5.6, ['#b9a07a', '#c4ab84', '#ad946e']]],
    naixement: [[-5, ['#6f5236', '#7c5a38', '#5f4630', '#86643e']], [8, ['#8f6a42', '#a07a4c', '#7c5a38', '#b08a58']], [30, ['#a07a4c', '#b08a58', '#8f6a42', '#c9a46a']]],   // la piedra del Nacimiento: más oscura abajo
    passio: ['#cdbf9f', '#d9cdb4', '#c2b391', '#e0d4bb'], subirachs: ['#9f8f72', '#8f7f62', '#a8987a', '#857559'],
    grua: ['#f2b33d', '#e9a92e', '#f4c24e'], fusta: ['#8a5a32', '#7a4a2a', '#9a6a3c'], guix: ['#f7f2e6', '#ece6d8', '#fbf8f0'],
    bronze: ['#4f5a4a', '#5f6a55', '#3f4a3c', '#6f7a5f'], bronzeV: ['#3f7a5a', '#4f8a64', '#5f9a6a', '#356a4c'],
    aigua: ['#3a86c8', '#4aa0d8', '#2f75bd', '#62b6e2'], blanc: ['#fbf8f0', '#ffffff', '#f4efe3'],
    pell: ['#e8c4a0', '#d9b08a', '#c99a74', '#f0d0b0']
  };
  // la escala a la que se pinta la tesela (4, 8, 16… px por metro): de cerca aparece más detalle, como en el mapa
  var Z = 4;
  var ROBA = ['#2f5fae', '#c43b2b', '#4f9a3c', '#f2b33d', '#6a3f9a', '#e8663a', '#3b7dc4', '#1f1a15', '#f4efe3', '#d8452f'];
  // los vidrios, de abajo (intenso) arriba (claro): fríos al este, cálidos al oeste, dorados en el ábside
  var FRED0 = [['#1f3f8f', '#2a4f9a', '#2f5fae', '#1a3578'], ['#2f5fae', '#3b7dc4', '#2a6a8a', '#24508f'], ['#3a8a5a', '#2f7a6a', '#3b7dc4', '#2f8a7a'], ['#4f9a3c', '#5fa3da', '#3a8a5a', '#6aa84a'], ['#7fb0d6', '#9fc3df', '#8fc06a', '#b8d4ea'], ['#cfe2f0', '#e3eef0', '#d8ecd0', '#f4fbfd']];
  var CALID0 = [['#8f2a24', '#a8282a', '#b8322c', '#7a1f1c'], ['#c43b2b', '#d8452f', '#b8322c', '#a8282a'], ['#e8663a', '#d8452f', '#f08a4b', '#c9502e'], ['#f2b33d', '#e9a92e', '#f08a4b', '#f4c24e'], ['#f4d27a', '#f6cf6a', '#f2b33d', '#fbe6a8'], ['#fbf1d0', '#f6e7b8', '#fff8e6', '#ffffff']];
  // más vivos, como en las fotos: también arriba hay color (azul, verde y amarillo; rojo, naranja y oro)
  var FRED = [['#1f3f8f', '#2a4f9a', '#2f5fae', '#1a3578'], ['#2f5fae', '#3b7dc4', '#24508f', '#2a6a8a'], ['#2f8a7a', '#3a8a5a', '#3b7dc4', '#4f9a3c'], ['#4f9a3c', '#6aa84a', '#5fa3da', '#8fc06a'], ['#5fa3da', '#7fb0d6', '#a8d08a', '#c8d84a'], ['#b8d4ea', '#cfe2f0', '#d8ecd0', '#e8e070']];
  var CALID = [['#8f2a24', '#a8282a', '#b8322c', '#7a1f1c'], ['#c43b2b', '#d8452f', '#b8322c', '#e8663a'], ['#e8663a', '#f08a4b', '#d8452f', '#c9502e'], ['#f2b33d', '#e9a92e', '#f08a4b', '#6aa84a'], ['#f4c24e', '#f6cf6a', '#f2b33d', '#e8663a'], ['#fbe6a8', '#f6e7b8', '#f4d27a', '#fff8e6']];
  var DAURAT = [['#e9a92e', '#f2b33d', '#d9a03a'], ['#f2b33d', '#f4c24e', '#e9b64a'], ['#f4d27a', '#f6cf6a', '#f2b33d'], ['#fbf1d0', '#f6e7b8', '#fff8e6']];

  /* ---------- formas ---------- */
  function desplazar(pts, dx, dy) { return pts.map(function (p) { return [p[0] + dx, p[1] + dy]; }); }
  function huso(x, y0, w, alto, punta) { return desplazar(M.huso(x, w, alto, punta), 0, y0); }
  function curva(a, b, c, n) { var p = []; for (var i = 0; i <= n; i++) { var u = i / n, v = 1 - u; p.push([v * v * a[0] + 2 * v * u * b[0] + u * u * c[0], v * v * a[1] + 2 * v * u * b[1] + u * u * c[1]]); } return p; }
  function banda(y0, paso, pals) { return pals.map(function (p, i) { return [y0 + i * paso, p]; }); }
  // una rama: de (x0, y0) con ancho w0 a (x1, y1) con ancho w1, un poco curvada
  function rama(d, x0, y0, x1, y1, w0, w1, pal, op) {
    var mx = (x0 + x1) / 2 + (y1 - y0) * 0.06 * (x1 > x0 ? -1 : 1), my = (y0 + y1) / 2, c = curva([x0, y0], [mx, my], [x1, y1], 6), izq = [], der = [];
    c.forEach(function (p, i) {
      var q = c[Math.min(c.length - 1, i + 1)], r = c[Math.max(0, i - 1)], tx = q[0] - r[0], ty = q[1] - r[1], l = Math.hypot(tx, ty) || 1, w = (w0 + (w1 - w0) * i / (c.length - 1)) / 2;
      izq.push([p[0] - ty / l * w, p[1] + tx / l * w]); der.unshift([p[0] + ty / l * w, p[1] - tx / l * w]);
    });
    d.forma(izq.concat(der), pal, op || { vol: 0.25, ts: 0.55 });
  }
  // la columna arbórea de Gaudí, como en las fotos: un prisma de muchas caras (aristas vivas, no un cilindro), cada cara de un
  // tono según le da la luz; a media altura, el nudo (un elipsoide) con sus medallones ovalados que brillan como lámparas;
  // de él salen ramas también facetadas que se vuelven a partir y acaban en la bóveda en un capitel de puntas, como una estrella
  function prisma(d, pts0, pts1, pal, caras, op) {   // un tramo facetado entre dos secciones (pts0 abajo, pts1 arriba: [x izq, x der, y])
    for (var c = 0; c < caras; c++) {
      var u0 = c / caras, u1 = (c + 1) / caras, t = Math.sin((u0 + u1) / 2 * Math.PI);   // las caras del centro miran de frente
      var q = [[pts0[0] + (pts0[1] - pts0[0]) * u0, pts0[2]], [pts0[0] + (pts0[1] - pts0[0]) * u1, pts0[2]], [pts1[0] + (pts1[1] - pts1[0]) * u1, pts1[2]], [pts1[0] + (pts1[1] - pts1[0]) * u0, pts1[2]]];
      var k = 0.78 + 0.32 * t - (u0 > 0.5 ? 0.12 : 0);   // luz desde la izquierda
      d.forma(q, pal.map(function (col) { return oscurecer(col, k); }), op || { ts: 0.35 });
    }
    if (Z >= 16) for (c = 1; c < caras; c++) { var u = c / caras; d.linea([[pts0[0] + (pts0[1] - pts0[0]) * u, pts0[2]], [pts1[0] + (pts1[1] - pts1[0]) * u, pts1[2]]], 0.03, 'rgba(30,20,10,0.25)'); }   // las aristas
  }
  function oscurecer(hex, k) { return '#' + [1, 3, 5].map(function (i) { return ('0' + Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k)).toString(16)).slice(-2); }).join(''); }
  function ramaF(d, x0, y0, x1, y1, w0, w1, pal) {   // una rama facetada: dos caras, la de la luz y la de la sombra
    var l = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / l, ny = (x1 - x0) / l;
    d.forma([[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1, y1], [x0, y0]], pal, { ts: 0.4 });
    d.forma([[x0, y0], [x1, y1], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]], pal.map(function (c) { return oscurecer(c, 0.8); }), { ts: 0.4 });
    if (Z >= 32) d.linea([[x0, y0], [x1, y1]], 0.03, 'rgba(30,20,10,0.3)');
  }
  function estrella(d, x, y, r, sem) {   // el capital de puntas donde la rama toca la bóveda
    var p = []; for (var k = 0; k < 10; k++) { var a = Math.PI * (0.05 + 0.9 * k / 9), rr = k % 2 ? r * 0.45 : r; p.push([x + Math.cos(a) * rr * 1.2, y - Math.sin(a) * rr * 0.6 + r * 0.35]); }
    p.unshift([x - r * 0.3, y]); p.push([x + r * 0.3, y]);
    d.forma(p, ['#e9e4da', '#f4efe3', '#d8d2c6'], { ts: 0.3, vol: 0.2 });
  }
  function columna(d, x, w, nudo, ramas, pal, medallon) {
    d.rect(x - w / 2 - 0.35, 0, x + w / 2 + 0.35, 1.0, PM.grisO, { ts: 0.45 });   // la basa
    var caras = Z >= 32 ? 8 : Z >= 16 ? 5 : 3;
    prisma(d, [x - w / 2, x + w / 2, 1.0], [x - w * 0.42, x + w * 0.42, nudo], pal, caras);
    if (Z >= 32) for (var k = 0; k < caras * 2; k++) { var f = (k + 0.5) / (caras * 2) - 0.5; d.linea([[x + f * w * 0.98, 1.0], [x + f * w * 0.82, nudo - 0.6]], 0.018, 'rgba(30,15,8,0.22)'); }   // las estrías finas de cada cara
    ramas.forEach(function (r) {   // r = [x1, y1, [puntas de la segunda partición]]
      var x1 = r[0], y1 = r[1];
      ramaF(d, x, nudo, x1, y1, w * 0.78, w * 0.58, pal);
      if (r[2]) { r[2].forEach(function (p) { ramaF(d, x1, y1, p[0], p[1], w * 0.52, w * 0.38, pal); estrella(d, p[0], p[1], w * 0.55, k); }); d.elipse(x1, y1, w * 0.3, w * 0.42, pal, { vol: 0.3, ts: 0.35 }); }
    });
    // el nudo: elipsoide claro con tres medallones que brillan (el de frente entero, los de los lados de canto)
    d.elipse(x, nudo, w * 0.82, w * 1.1, ['#d8d2c6', '#e9e4da', '#c9c2b4'], { vol: 0.4, ts: 0.35 });
    var M2 = medallon || ['#f2b33d', '#f4d27a', '#e9b64a'];
    d.elipse(x, nudo, w * 1.4, w * 1.6, ['#fff3cf'], { ts: 0.6, alfa: 0.18 });   // el halo de luz
    d.elipse(x, nudo, w * 0.36, w * 0.5, M2, { ts: 0.22 });
    [-1, 1].forEach(function (sg) { d.elipse(x + sg * w * 0.66, nudo, w * 0.12, w * 0.42, M2, { ts: 0.15 }); });
    if (Z >= 16) { d.elipse(x, nudo, w * 0.26, w * 0.38, ['#fff8e6', '#fbf1d0'], { ts: 0.12 }); d.linea(M.elipsePts(x, nudo, w * 0.36, w * 0.5, 0, 6.2832, 24), 0.03, 'rgba(140,90,20,0.8)'); }
    if (Z >= 32) for (k = 0; k < 6; k++) { var am = k / 6 * 3.1416; d.linea([[x - Math.cos(am) * w * 0.24, nudo - Math.sin(am) * w * 0.34], [x + Math.cos(am) * w * 0.24, nudo + Math.sin(am) * w * 0.34]], 0.025, 'rgba(140,90,20,0.75)'); }   // el símbolo grabado
  }
  // los ventanales de la nave, como los de verdad (sacados de fotos del interior): un muro de piedra clara con lancetas altas
  // en fila, un ojo redondo encima de cada una, una segunda fila más corta y, en los de arriba, el rosetón (una flor de
  // vidrio). El vidrio es de Joan Vila-Grau: intenso abajo y más claro arriba, roto en trozos en diagonal. Cuanto más
  // cerca, más detalle: los trozos, los vidrios casi blancos, los plomos, los pétalos partidos y las vetas del vidrio
  function lanceta(d, x0, x1, y0, y1, pals, sem) {
    var w = x1 - x0, ya = y1 - w * 0.5, forma = M.arco(x0, x1, y0, ya, 'medio'), n = pals.length;
    d.forma(M.arco(x0 - 0.12, x1 + 0.12, y0 - 0.12, ya, 'medio'), ['#b8a17a', '#c2a674', '#ad946e'], { ts: 0.3 });   // la moldura
    d.forma(forma, null, { banda: banda(y0, (y1 - y0) / n, pals), ts: 0.75 });
    if (Z >= 16) {   // los trozos de vidrio en diagonal, unos más hondos, otros de otro color y, de más cerca, alguno casi blanco
      var k = 0, paso;
      for (var yb = y0 - w; yb < ya; yb += paso, k++) {
        paso = 0.34 + h(k, sem, 6) * 0.26;
        var y2 = yb + paso, inc = w * (0.3 + h(k, sem, 1) * 0.9), pi = Math.min(n - 1, Math.max(0, Math.floor((yb - y0) / (y1 - y0) * n)));
        var q = [[x0, Math.min(ya, Math.max(y0, yb))], [x1, Math.min(ya, Math.max(y0, yb + inc))], [x1, Math.min(ya, Math.max(y0, y2 + inc))], [x0, Math.min(ya, Math.max(y0, y2))]];
        if (q[3][1] - q[0][1] < 0.05 && q[2][1] - q[1][1] < 0.05) continue;
        var r = h(k, sem, 2), blanco = r < 0.08;
        if (blanco && Z < 32 || r > 0.84) continue;   // algunos trozos se quedan del color de fondo
        d.forma(q, blanco ? ['#fbf8f0', '#f4fbfd', '#fff8e6'] : r < 0.4 ? pals[Math.min(n - 1, pi + 1)] : r < 0.66 ? pals[Math.max(0, pi - 1)] : pals[(pi + 2) % n], { ts: 0.55 });
        d.linea([q[0], q[1]], 0.045, 'rgba(36,26,16,0.6)');
      }
    }
    if (Z >= 64) for (var vx = x0 + w / 3; vx < x1 - 0.05; vx += w / 3) d.linea([[vx, y0], [vx + (h(Math.round(vx * 10), sem, 3) - 0.5) * 0.12, ya]], 0.025, 'rgba(36,26,16,0.5)');   // los plomos verticales
    if (Z >= 128) for (var g = 0; g < 18; g++) { var gx = x0 + 0.05 + h(g, sem, 4) * (w - 0.1), gy = y0 + h(sem, g, 5) * (ya - y0); d.linea([[gx, gy], [gx + 0.05, gy + 0.03]], 0.01, 'rgba(255,255,255,0.55)'); }   // las vetas y burbujas del vidrio soplado
    d.linea(forma.concat([forma[0]]), 0.07, 'rgba(36,26,16,0.75)');
  }
  function ull(d, cx, cy, r, pal, sem) {   // un ojo redondo de vidrio, en su aro de piedra
    d.elipse(cx, cy, r + 0.12, r + 0.12, ['#b8a17a', '#c2a674'], { ts: 0.25 });
    d.elipse(cx, cy, r, r, pal, Z >= 32 ? { ts: 0.4, modo: 'radial' } : { ts: 0.5 });
    if (Z >= 32) { for (var k = 0; k < 6; k++) { var a = k / 6 * 6.2832 + sem; d.linea([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], 0.03, 'rgba(36,26,16,0.55)'); } d.elipse(cx, cy, r * 0.3, r * 0.3, ['#fbf8f0', '#fff8e6'], { ts: 0.2 }); }
    d.linea(M.elipsePts(cx, cy, r, r, 0, 6.2832, 24), 0.05, 'rgba(36,26,16,0.7)');
  }
  function roseton(d, cx, cy, r, pals, sem) {   // el rosetón: pétalos de vidrio alrededor de un disco de luz, con la piedra entre ellos
    var n = pals.length, np = Z >= 32 ? 16 : 12, ri = r * 0.34;
    d.elipse(cx, cy, r + 0.28, r + 0.28, PM.piedraC, { ts: 0.4 });
    d.elipse(cx, cy, r + 0.12, r + 0.12, ['#b8a17a', '#c2a674'], { ts: 0.3 });
    for (var k = 0; k < np; k++) {
      var a0 = k / np * 6.2832, a1 = (k + 1) / np * 6.2832, am = (a0 + a1) / 2;
      var pet = [[cx + Math.cos(a0 + 0.04) * ri, cy + Math.sin(a0 + 0.04) * ri], [cx + Math.cos(a0 + 0.06) * r * 0.8, cy + Math.sin(a0 + 0.06) * r * 0.8], [cx + Math.cos(am) * r, cy + Math.sin(am) * r], [cx + Math.cos(a1 - 0.06) * r * 0.8, cy + Math.sin(a1 - 0.06) * r * 0.8], [cx + Math.cos(a1 - 0.04) * ri, cy + Math.sin(a1 - 0.04) * ri]];
      d.forma(pet, pals[(k % 2 ? k + 2 : k) % n], { ts: 0.45 });
      if (Z >= 32) d.linea(M.elipsePts(cx, cy, r * 0.62, r * 0.62, a0 + 0.06, a1 - 0.06, 4), 0.03, 'rgba(36,26,16,0.5)');   // el pétalo partido en dos vidrios
      if (Z >= 64) d.elipse(cx + Math.cos(am) * r * 0.78, cy + Math.sin(am) * r * 0.78, r * 0.06, r * 0.06, ['#fbf8f0', '#fff8e6'], { ts: 0.1 });
      d.linea(pet.concat([pet[0]]), 0.045, 'rgba(36,26,16,0.7)');
    }
    d.elipse(cx, cy, ri, ri, ['#fbf1d0', '#fff8e6', '#f4d27a'], { ts: 0.3 });
    if (Z >= 32) { d.elipse(cx, cy, ri * 0.5, ri * 0.5, ['#ffffff', '#fffdf8'], { ts: 0.15 }); for (k = 0; k < 8; k++) { var ar = k / 8 * 6.2832; d.linea([[cx + Math.cos(ar) * ri * 0.5, cy + Math.sin(ar) * ri * 0.5], [cx + Math.cos(ar) * ri, cy + Math.sin(ar) * ri]], 0.03, 'rgba(36,26,16,0.45)'); } }
  }
  function finestral(d, cx, y0, y1, w, pals, sem, rosa) {
    var H = y1 - y0, n1 = rosa ? (w > 3 ? 3 : 2) : (w > 3 ? 4 : 2), gap = 0.28, h1 = H * (rosa ? 0.4 : 0.56), h2 = H * (rosa ? 0.16 : 0.2);
    d.forma(M.arco(cx - w / 2 - 0.35, cx + w / 2 + 0.35, y0 - 0.35, y1 - w * 0.55, 'ojival'), PM.piedraC, { ts: 0.6, vol: 0.08 });   // el muro del ventanal
    function fila(n, ya, alto, ps, s2) {
      var lw = (w - gap * (n + 1)) / n;
      for (var i = 0; i < n; i++) { var lx = cx - w / 2 + gap + i * (lw + gap); lanceta(d, lx, lx + lw, ya, ya + alto, ps, s2 + i * 7); ull(d, lx + lw / 2, ya + alto + lw * 0.42, lw * 0.3, ps[ps.length - 1], s2 + i); }
      return ya + alto + lw * 0.9;
    }
    var y = fila(n1, y0, h1, pals.slice(0, 3), sem);
    y = fila(Math.max(1, n1 - 1), y + 0.25, h2, pals.slice(1, 4), sem + 40);
    if (rosa) { var rr = Math.min(w * 0.42, (y1 - y) / 2 - 0.1); roseton(d, cx, y + rr + 0.15, rr, pals.slice(1).concat([['#f2b33d', '#f4d27a', '#e9b64a']]), sem + 80); if (w > 3) [-1, 1].forEach(function (sg) { ull(d, cx + sg * (rr + 0.6), y + 0.5, 0.3, pals[2], sem + 90 + sg); }); }
  }
  // un óculo de la bóveda: el hiperboloide, con su corona de vidrio de oro y verde y la luz en el centro
  function oculo(d, cx, cy, r) {
    d.elipse(cx, cy, r * 1.25, r * 0.7, C.volta, { modo: 'radial', ts: 0.4 });
    d.elipse(cx, cy, r, r * 0.55, C.oculs, { modo: 'radial', ts: 0.34 });
    d.elipse(cx, cy, r * 0.48, r * 0.27, C.llum, { ts: 0.3 });
    if (Z >= 16) for (var q = 0; q < 16; q++) { var a = q / 16 * 6.2832; d.linea([[cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.28], [cx + Math.cos(a) * r * 1.2, cy + Math.sin(a) * r * 0.68]], 0.04, 'rgba(120,90,50,0.4)'); }
  }
  // un hiperboloide del techo (lo que se ve al mirar arriba): una estrella blanca de puntas de palmera, la corona de rayos
  // dorados y, en el centro, el agujero (oscuro o con su luz). De cerca, los rayos uno a uno y el borde dentado de las hojas
  function hiper(d, cx, cy, r, sem) {
    var n = 12, pts = [], k;
    for (k = 0; k < n * 2; k++) { var a = k / (n * 2) * 6.2832, rr = k % 2 ? r * 0.64 : r * (0.92 + h(k, sem, 1) * 0.16); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.56]); }
    d.forma(pts, ['#fbf8f0', '#f4efe3', '#ffffff', '#efe6d2'], { ts: 0.4, vol: 0.1 });
    d.elipse(cx, cy, r * 0.6, r * 0.34, ['#d9a03a', '#e9b64a', '#c9a46a', '#f2b33d'], { modo: 'radial', ts: 0.3 });
    var luz = h(sem, 3, 3) < 0.4;
    d.elipse(cx, cy, r * 0.24, r * 0.14, luz ? ['#fff8e6', '#fbf1d0', '#ffffff'] : ['#3a2f25', '#4a3d30', '#2f261e'], { ts: 0.18 });
    if (Z >= 16) for (k = 0; k < 16; k++) { var b = k / 16 * 6.2832; d.linea([[cx + Math.cos(b) * r * 0.26, cy + Math.sin(b) * r * 0.15], [cx + Math.cos(b) * r * 0.62, cy + Math.sin(b) * r * 0.35]], 0.04, 'rgba(150,100,30,0.55)'); }
    if (Z >= 32) d.linea(pts.concat([pts[0]]), 0.035, 'rgba(160,140,110,0.6)');
    if (Z >= 64) for (k = 0; k < n * 2; k += 2) { var p0 = pts[k]; for (var t = 1; t < 4; t++) { var f = t / 4, q = [cx + (p0[0] - cx) * (1 - f * 0.3), cy + (p0[1] - cy) * (1 - f * 0.3)]; d.linea([q, [q[0] + (p0[1] - cy) * 0.05, q[1] - (p0[0] - cx) * 0.05]], 0.02, 'rgba(160,140,110,0.5)'); } }
  }
  // el gran sol dorado del crucero: rayos de oro, un anillo de luces y la linterna de luz en el centro
  function sol(d, cx, cy, r) {
    var n = Z >= 32 ? 36 : 24, k;
    d.elipse(cx, cy, r, r * 0.45, ['#e9b64a', '#d9a03a', '#f2b33d', '#c9902a'], { modo: 'radial', ts: 0.4 });
    for (k = 0; k < n; k++) { var a = k / n * 6.2832; d.linea([[cx + Math.cos(a) * r * 0.25, cy + Math.sin(a) * r * 0.11], [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.45]], k % 2 ? 0.06 : 0.1, 'rgba(255,240,200,0.6)'); }
    for (k = 0; k < 18; k++) { var b = k / 18 * 6.2832; d.elipse(cx + Math.cos(b) * r * 0.66, cy + Math.sin(b) * r * 0.3, 0.2, 0.2, ['#fff8e6', '#ffffff'], { ts: 0.1 }); }   // el anillo de luces
    d.elipse(cx, cy, r * 0.25, r * 0.11, ['#fff8e6', '#ffffff', '#fbf1d0'], { ts: 0.2 });
    if (Z >= 32) for (k = 0; k < 18; k++) { var c2 = k / 18 * 6.2832 + 0.17; d.elipse(cx + Math.cos(c2) * r * 0.85, cy + Math.sin(c2) * r * 0.38, 0.12, 0.12, ['#fff8e6'], { ts: 0.06 }); }
  }
  // una persona: cuerpo y cabeza
  function persona(d, x, y, col, e, pell) {
    e = e || 1; var p = pell || C.pell[Math.floor(h(x, y, 1) * 4)];
    d.forma([[x - 0.24 * e, y], [x + 0.24 * e, y], [x + 0.2 * e, y + 1.15 * e], [x - 0.2 * e, y + 1.15 * e]], [col], { ts: 0.22 });
    d.elipse(x, y + 1.42 * e, 0.19 * e, 0.22 * e, [p], { ts: 0.18 });
    var r = h(x * 7, y * 3, 9);
    if (Z >= 16) {   // de cerca: el pelo, las piernas y, a algunos, una mochila o el móvil para la foto
      d.elipse(x, y + 1.55 * e, 0.2 * e, 0.11 * e, [r < 0.5 ? '#3a2a1a' : r < 0.8 ? '#8a5a32' : '#e6dcc7'], { ts: 0.1 });
      d.linea([[x, y], [x, y + 0.42 * e]], 0.05 * e, 'rgba(20,17,15,0.5)');
      if (r > 0.55) d.rect(x - 0.36 * e, y + 0.55 * e, x - 0.2 * e, y + 1.0 * e, [r > 0.8 ? '#2f5fae' : '#4a3a2c'], { ts: 0.1 });
      if (r < 0.3) d.rect(x + 0.14 * e, y + 1.0 * e, x + 0.3 * e, y + 1.24 * e, ['#14110f'], { ts: 0.08 });
    }
    if (Z >= 128) {   // muy de cerca: los ojos, la boca, las manos y los zapatos
      var fy = y + 1.45 * e; [-1, 1].forEach(function (sg) { d.linea([[x + sg * 0.07 * e, fy], [x + sg * 0.07 * e + 0.001, fy]], 0.035 * e, '#1f1a15'); d.elipse(x + sg * 0.12 * e, y + 0.03 * e, 0.1 * e, 0.04 * e, ['#1f1a15', '#3a2a1a'], { ts: 0.05 }); d.elipse(x + sg * 0.25 * e, y + 0.62 * e, 0.06 * e, 0.07 * e, [p], { ts: 0.04 }); });
      d.linea(curva([x - 0.05 * e, fy - 0.09 * e], [x, fy - 0.12 * e], [x + 0.05 * e, fy - 0.09 * e], 3), 0.018 * e, 'rgba(140,60,50,0.85)');
      if (r > 0.9 && col !== '#fbf6ea') d.texto('BCN', x, y + 0.82 * e, 0.11 * e, 'rgba(255,255,255,0.9)');
    }
  }
  function gent(d, x0, x1, y, n, sem) { for (var k = 0; k < n; k++) { var x = x0 + (x1 - x0) * (k + h(k, sem, 5) * 0.8) / n; persona(d, x, y, ROBA[Math.floor(h(k, sem, 6) * ROBA.length)], 0.9 + h(k, sem, 7) * 0.2); } }
  // una figura esculpida: angulosa (Subirachs) o redondeada (el Nacimiento)
  function escultura(d, x, y, alto, pal, angulosa) {
    var w = alto * 0.3, a = alto;
    if (angulosa) {   // Subirachs: hombros anchos, túnica de pliegues rectos, piernas marcadas y la cabeza como un bloque de dos planos
      w = alto * 0.34;
      d.forma([[x - w * 0.42, y], [x - w * 0.06, y], [x, y + a * 0.1], [x + w * 0.06, y], [x + w * 0.42, y], [x + w * 0.55, y + a * 0.42], [x + w * 0.74, y + a * 0.72], [x - w * 0.7, y + a * 0.7], [x - w * 0.56, y + a * 0.4]], pal, { vol: 0.5, ts: 0.28 });
      d.linea([[x - w * 0.3, y + a * 0.68], [x - w * 0.16, y + a * 0.06]], 0.07, 'rgba(50,40,28,0.5)'); d.linea([[x + w * 0.28, y + a * 0.68], [x + w * 0.18, y + a * 0.06]], 0.07, 'rgba(50,40,28,0.5)');   // los pliegues
      d.forma([[x + w * 0.62, y + a * 0.7], [x + w * 0.82, y + a * 0.66], [x + w * 1.0, y + a * 0.44], [x + w * 0.84, y + a * 0.42]], pal, { vol: 0.4, ts: 0.2 });   // el brazo, en ángulo
      d.forma([[x - w * 0.3, y + a * 0.76], [x + w * 0.34, y + a * 0.76], [x + w * 0.3, y + a], [x - w * 0.26, y + a]], pal, { vol: 0.2, ts: 0.2 });   // la cabeza
      d.forma([[x - w * 0.3, y + a * 0.76], [x - w * 0.02, y + a * 0.76], [x - w * 0.02, y + a], [x - w * 0.26, y + a]], ['#6f604a', '#7a6a52'], { ts: 0.15, alfa: 0.55 });   // el plano en sombra de la cara
    } else {
      d.forma([[x - w * 0.55, y], [x + w * 0.55, y], [x + w * 0.4, y + alto * 0.5], [x + w * 0.25, y + alto * 0.78], [x - w * 0.25, y + alto * 0.78], [x - w * 0.42, y + alto * 0.5]], pal, { vol: 0.35, ts: 0.3, ruido: 0.08 });
      d.elipse(x, y + alto * 0.88, w * 0.3, alto * 0.13, pal, { vol: 0.35, ts: 0.25 });
    }
    if (Z >= 128) { var hy = y + alto * 0.9; d.linea([[x - w * 0.14, hy], [x - w * 0.05, hy]], 0.02, 'rgba(50,40,28,0.7)'); d.linea([[x + w * 0.05, hy], [x + w * 0.14, hy]], 0.02, 'rgba(50,40,28,0.7)'); d.linea([[x, hy - 0.01], [x + 0.02, hy - alto * 0.05]], 0.02, 'rgba(50,40,28,0.6)'); d.linea([[x - w * 0.06, hy - alto * 0.08], [x + w * 0.06, hy - alto * 0.08]], 0.018, 'rgba(50,40,28,0.6)'); }   // muy de cerca, la cara
  }
  // un ángel músico del Nacimiento: figura con alas y su trompeta dorada
  function angel(d, x, y, e, sg) {
    d.elipse(x - sg * 0.5 * e, y + 1.4 * e, 0.9 * e, 1.5 * e, ['#e6dcc7', '#d9cdb4', '#efe6d2'], { ts: 0.25, vol: 0.2 });   // el ala
    escultura(d, x, y, 2.6 * e, ['#c9a46a', '#d6b47c', '#b8925e'], false);
    d.linea([[x + sg * 0.2 * e, y + 2 * e], [x + sg * 1.5 * e, y + 2.5 * e]], 0.14 * e, '#f2b33d'); d.elipse(x + sg * 1.6 * e, y + 2.52 * e, 0.22 * e, 0.3 * e, ['#f2b33d', '#f4d27a'], { ts: 0.15 });
  }
  // un campanario de fachada, como en las fotos: abajo un fuste casi recto lleno de aberturas pequeñas con lamas inclinadas
  // (para que salga el sonido de las campanas), arriba un cono que se afila con las palabras HOSANNA, EXCELSIS y SANCTUS en
  // letras grandes y claras de arriba abajo, y en la punta el pináculo esbelto de mosaico veneciano: anillos de oro, la mitra
  // roja y dorada con su óvalo, y la cruz-corona hecha de bolas blancas alrededor de una bola central
  function campanar(d, x, w, alto, y0, sentado, sem) {
    var yR = y0 + (alto - y0) * 0.3, yC = alto * 0.82, k, y;
    function ancho(yy) { if (yy < yR) return w / 2 * (1 - 0.08 * (yy - y0) / (yR - y0)); var t = (yy - yR) / (yC - yR); return w / 2 * 0.92 * Math.pow(1 - t, 0.85) + 0.35; }
    var cont = []; for (y = y0; y <= yC; y += (yC - y0) / 24) cont.push([x - ancho(y), y]); for (y = yC; y >= y0 - 0.01; y -= (yC - y0) / 24) cont.push([x + ancho(y), y]);
    d.forma(cont, ['#a8875a', '#b8925e', '#9a7a50', '#c2a070'], { vol: 0.28, ts: 0.6 });
    // las aberturas con lamas: filas y columnas de huecos pequeños en el fuste
    var filas = Z >= 16 ? 1.6 : 3.2;
    for (y = y0 + 2; y < yR - 1; y += filas) {
      var hw = ancho(y) * 0.86, nH = Math.max(2, Math.round(hw * 2 / (Z >= 16 ? 1.0 : 2.0)));
      for (k = 0; k < nH; k++) {
        var hx = x - hw + (k + 0.5) * hw * 2 / nH, hwx = hw / nH * 0.62;
        d.forma([[hx - hwx, y], [hx + hwx, y + 0.25], [hx + hwx, y + filas * 0.6 + 0.25], [hx - hwx, y + filas * 0.6]], ['#4a3a2c', '#3d281b', '#5a4a3a'], { ts: 0.2 });
        if (Z >= 32) d.linea([[hx - hwx, y + filas * 0.3], [hx + hwx, y + filas * 0.3 + 0.25]], 0.05, 'rgba(200,170,120,0.6)');
      }
    }
    // la parte de arriba: más aberturas, pequeñas, y las letras de arriba abajo
    var pal = ['HOSANNA', 'EXCELSIS', 'SANCTUS'][Math.floor(h(sem || 0, 1, 1) * 3)];
    var paso = (yC - yR - 5) / pal.length;
    for (k = 0; k < pal.length; k++) { var ly = yC - 3 - k * paso; var lt = Math.min(paso * 0.82, ancho(ly) * 0.95); d.texto(pal[k], x, ly, lt, 'rgba(70,45,25,0.55)'); d.texto(pal[k], x - 0.08, ly + 0.08, lt, 'rgba(250,244,230,0.95)'); }   // letra clara en relieve, con su sombra
    if (Z >= 16) for (y = yR + 1; y < yC - 1; y += 1.4) { var aw = ancho(y) * 0.8; [-1, 1].forEach(function (sg2) { d.forma([[x + sg2 * aw - 0.25, y], [x + sg2 * aw + 0.25, y + 0.2], [x + sg2 * aw + 0.25, y + 0.8], [x + sg2 * aw - 0.25, y + 0.6]], ['#4a3a2c'], { ts: 0.1 }); }); }
    if (sentado) { var ay = y0 + 4; d.rect(x - w * 0.36, ay - 0.4, x + w * 0.36, ay, PM.piedraC, { ts: 0.25 }); escultura(d, x, ay, 3.2, ['#e2cfa4', '#d8c194', '#ecdcb6'], false); }   // el apóstol sentado en su peana
    // el pináculo de mosaico veneciano
    var py = yC, pa = alto - yC, pw = 0.9;
    d.forma([[x - pw, py], [x + pw, py], [x + pw * 0.7, py + pa * 0.3], [x - pw * 0.7, py + pa * 0.3]], ['#a8472a', '#c43b2b', '#d9a03a', '#b8322c'], { ts: 0.2, vol: 0.3 });   // el tallo rojo y oro
    for (k = 0; k < 4; k++) d.rect(x - pw * (0.95 - k * 0.07), py + pa * (0.04 + k * 0.07), x + pw * (0.95 - k * 0.07), py + pa * (0.04 + k * 0.07) + 0.4, PM.oro, { ts: 0.12 });   // los anillos de oro
    d.forma([[x - pw * 0.7, py + pa * 0.3], [x + pw * 0.7, py + pa * 0.3], [x + pw * 1.3, py + pa * 0.45], [x + pw * 0.9, py + pa * 0.62], [x, py + pa * 0.68], [x - pw * 0.9, py + pa * 0.62], [x - pw * 1.3, py + pa * 0.45]], ['#d9a03a', '#f2b33d', '#c43b2b', '#fbf6ea'], { ts: 0.2, vol: 0.3 });   // la mitra
    d.elipse(x, py + pa * 0.47, pw * 0.5, pa * 0.07, ['#f2b33d', '#fbf1d0'], { ts: 0.1 });   // el óvalo dorado de la mitra
    d.rect(x - 0.18, py + pa * 0.66, x + 0.18, py + pa * 0.88 - pw * 1.15, ['#d9a03a'], { ts: 0.08 });
    // la cruz-corona: una bola central con bolas blancas alrededor (como una flor)
    var cy = py + pa * 0.88, cr = pw * 1.15;
    d.elipse(x, cy, cr * 0.45, cr * 0.45, ['#f2b33d', '#e9b64a'], { ts: 0.1 });
    for (k = 0; k < 10; k++) { var a = k / 10 * 6.2832; d.elipse(x + Math.cos(a) * cr, cy + Math.sin(a) * cr, cr * 0.26, cr * 0.26, C.blanc, { ts: 0.08 }); }
    if (Z >= 32) for (k = 0; k < 10; k++) { var a2 = k / 10 * 6.2832; d.linea([[x + Math.cos(a2) * cr * 0.45, cy + Math.sin(a2) * cr * 0.45], [x + Math.cos(a2) * cr * 0.75, cy + Math.sin(a2) * cr * 0.75]], 0.06, 'rgba(242,179,61,0.9)'); }
  }
  // una cesta de frutas de Etsuro Sotoo, en lo alto de los muros de la nave (naranjas, uvas, granadas, cerezas…)
  function fruites(d, x, y, e) {
    d.forma([[x - 1.4 * e, y], [x + 1.4 * e, y], [x + 1.9 * e, y + 1.4 * e], [x - 1.9 * e, y + 1.4 * e]], ['#c9a46a', '#b8925e'], { ts: 0.28 });
    var F = [['#e8663a', '#f08a4b'], ['#6a3f9a', '#7a4faa'], ['#c43b2b', '#d8452f'], ['#f2b33d', '#f4d27a'], ['#4f9a3c', '#6aa84a'], ['#f4efe3', '#fbf6ea']];
    [[-1.1, 2.1, 0.75], [0.1, 2.3, 0.85], [1.2, 2.0, 0.7], [-0.55, 3.25, 0.7], [0.65, 3.35, 0.72], [0.05, 4.35, 0.62], [-1.5, 3.1, 0.45], [1.6, 3.0, 0.45]].forEach(function (f, k) {
      d.elipse(x + f[0] * e, y + f[1] * e, f[2] * e, f[2] * e, F[k % F.length], { ts: 0.2, vol: 0.3 });
      if (Z >= 128) { var fx = x + f[0] * e, fy = y + (f[1] + f[2]) * e; d.linea([[fx, fy - 0.05], [fx + 0.06, fy + 0.18]], 0.04, '#5a3d26'); d.elipse(fx + 0.2, fy + 0.14, 0.16, 0.07, ['#4f9a3c', '#6aa84a'], { ts: 0.04 }); d.elipse(fx - f[2] * e * 0.35, y + (f[1] + f[2] * 0.4) * e, f[2] * e * 0.18, f[2] * e * 0.14, ['#ffffff'], { ts: 0.04, alfa: 0.7 }); }
    });
  }
  // el remate de un evangelista (135 m): ángel (Mateo), león (Marcos), toro (Lucas) o águila (Juan), de vidrio blanco y oro
  function evangelista(d, x, y, tipo, e) {
    var B = ['#fbf6ea', '#f4efe3', '#e9e4da'], O = ['#f2b33d', '#f4d27a', '#e9b64a'];
    d.elipse(x, y, 2.6 * e, 1.1 * e, O, { ts: 0.3 });   // la base de oro
    if (tipo === 'aguila' || tipo === 'angel') { [-1, 1].forEach(function (sg) { d.forma([[x, y + 1], [x + sg * 4.2 * e, y + 3.2 * e], [x + sg * 3.6 * e, y + 5.6 * e], [x + sg * 1.2 * e, y + 3.6 * e]], B, { vol: 0.25, ts: 0.3 }); }); }
    if (tipo === 'aguila') { d.elipse(x, y + 3.4 * e, 1.1 * e, 2.2 * e, O, { ts: 0.3 }); d.forma([[x, y + 5.2 * e], [x + 1.6 * e, y + 5 * e], [x + 0.4 * e, y + 4.6 * e]], O, { ts: 0.2 }); }
    if (tipo === 'angel') { d.elipse(x, y + 3 * e, 1 * e, 2.2 * e, B, { ts: 0.3 }); d.elipse(x, y + 5.6 * e, 0.7 * e, 0.8 * e, O, { ts: 0.25 }); }
    if (tipo === 'leo') { d.elipse(x, y + 3 * e, 2.2 * e, 2.4 * e, O, { modo: 'radial', ts: 0.3 }); d.elipse(x, y + 3 * e, 1.2 * e, 1.3 * e, B, { ts: 0.25 }); }
    if (tipo === 'brau') { d.elipse(x, y + 2.8 * e, 1.6 * e, 2 * e, B, { ts: 0.3 }); [-1, 1].forEach(function (sg) { d.forma([[x + sg * 0.9 * e, y + 4.2 * e], [x + sg * 2.8 * e, y + 5.6 * e], [x + sg * 2.4 * e, y + 6.4 * e], [x + sg * 0.5 * e, y + 4.8 * e]], O, { ts: 0.22 }); }); }
  }
  // una nube de lóbulos con la parte de arriba iluminada (sin línea alrededor ni debajo)
  function nube(d, x, y, e) {
    [[-1.2, 0, 1], [0, 0.5, 1.35], [1.3, 0.1, 1.05], [0.5, -0.2, 1.1], [-0.6, -0.3, 1]].forEach(function (l) { d.elipse(x + l[0] * 4 * e, y + l[1] * 3 * e, l[2] * 4.2 * e, l[2] * 3 * e, ['#f6f2e8', '#f2ede2', '#faf7ef'], { ts: 0.8, alfa: 0.97 }); });
    [[-0.4, 1.4, 0.95], [0.6, 1.6, 0.9]].forEach(function (l) { d.elipse(x + l[0] * 4 * e, y + l[1] * 3 * e, l[2] * 3.2 * e, l[2] * 1.4 * e, ['#ffffff', '#fffdf8'], { ts: 0.6, alfa: 0.97 }); });
  }
  function gavina(d, x, y, e) { d.linea(curva([x - 1.4 * e, y + 0.3 * e], [x - 0.6 * e, y + 0.9 * e], [x, y], 4).concat(curva([x, y], [x + 0.6 * e, y + 0.9 * e], [x + 1.4 * e, y + 0.3 * e], 4)), 0.16 * e, 'rgba(250,248,240,0.95)'); }
  function platan(d, x, alto) {
    d.forma([[x - 0.5, -4], [x + 0.5, -4], [x + 0.32, alto * 0.55], [x - 0.32, alto * 0.55]], ['#8a7a5a', '#a09070', '#7a6a4a', '#b0a080', '#c8b898'], { vol: 0.3, ts: 0.4 });   // la corteza a manchas del plátano
    rama(d, x, alto * 0.45, x - 2.4, alto * 0.7, 0.4, 0.2, ['#8a7a5a', '#a09070']); rama(d, x, alto * 0.5, x + 2.6, alto * 0.74, 0.4, 0.2, ['#8a7a5a', '#a09070']);
    [[0, 0.8, 5.5], [-3.4, 0.68, 3.8], [3.6, 0.7, 4], [0.8, 0.98, 3.6], [-1.6, 0.92, 3.2]].forEach(function (c) { d.elipse(x + c[0], alto * c[1], c[2], c[2] * 0.78, ['#4f8f3c', '#6aa84a', '#3f7a35', '#5f9a45', '#7ab05a'], { vol: 0.3, ts: 0.5 }); });
  }

  /* ---------- los sitios de los secretos ---------- */
  var CUADRADO = [[1, 14, 14, 4], [11, 7, 6, 9], [8, 10, 10, 5], [13, 2, 3, 15]];   // el cuadrado mágico de Subirachs: todo suma 33
  var Q = { x: 34.2, y: 2.8, t: 1.6 };   // dónde está (en el pilar de dentro del portal de la Pasión) y su lado
  var MAQ = { x: 31, y: -6.6 };   // la maqueta de cadenas, colgada del techo del museo
  var TOMBA = { x: -9.5, y: -14.2 };   // la losa de Gaudí, en la capilla del Carmen de la cripta
  var VITRALLS = [-26.25, -18.75, -11.25, 11.25, 18.75, 26.25];   // los ejes de los vitrales (entre las columnas)

  /* ---------- el corte entero (de atrás hacia delante) ---------- */
  function dibujo(d, L, z) {
    Z = z || 4;
    var k, x, y;
    // 0 · el cielo, con nubes y gaviotas, y la tierra cortada por estratos
    d.rect(-230, -4, 230, 200, null, { banda: C.cel, ts: 1.6 });
    d.rect(-230, -46, 230, -4, null, { banda: C.terra, ts: 1.2 });
    [[-150, 160, 2], [-120, 120, 1.4], [130, 150, 1.8], [170, 100, 1.3], [-190, 60, 1.5], [110, 185, 1.2]].forEach(function (n) { nube(d, n[0], n[1], n[2]); });
    // a los lados, las casas del Eixample: siete plantas con balcones, la planta baja con tiendas y el chaflán (Pau 31/10: que se vea entera de lejos)
    [-1, 1].forEach(function (sg) {
      d.rect(sg * 84, -5.2, sg * 230, -4, PM.calc, { ts: 0.45 });
      for (var b = 0; b < 6; b++) {
        var x0 = 88 + b * 23, x1 = x0 + 21.4, alto = 21 + h(b, sg, 4) * 4, pal = [['#e6c9a0', '#dcbf94', '#ecd3ac'], ['#d9b8a0', '#cfae95', '#e2c4ac'], ['#efe2c8', '#e6d6b8', '#f4e9d2'], ['#c9a88a', '#bf9d80', '#d3b394']][Math.floor(h(b, sg, 5) * 4)];
        d.rect(sg * x0, -4, sg * x1, alto, pal, { ts: 0.9 });
        d.rect(sg * (x0 - 0.3), alto, sg * (x1 + 0.3), alto + 1.2, ['#8f6a42', '#a07a4c'], { ts: 0.4 });   // la cornisa
        for (var pl = 0; pl < 7; pl++) for (var vn = 0; vn < 5; vn++) {
          var vx = sg * (x0 + 2.2 + vn * 4.2), vy = 0.6 + pl * 2.9; if (vy + 2.2 > alto) continue;
          if (pl === 0) { d.rect(vx - 1.3, -4, vx + 1.3, -1.2, ['#3a3530', '#4a4540'], { ts: 0.3 }); if (Z >= 8) d.rect(vx - 1.5, -1.0, vx + 1.5, -0.6, [['#c43b2b'], ['#2f5fae'], ['#4f9a3c'], ['#f2b33d']][(vn + b) % 4], { ts: 0.2 }); continue; }   // las tiendas con su toldo
          d.rect(vx - 0.6, vy, vx + 0.6, vy + 2.0, ['#4a3a2c', '#5a4a3a'], { ts: 0.25 });
          if (Z >= 8) { d.rect(vx - 0.85, vy - 0.15, vx + 0.85, vy, ['#6f6456'], { ts: 0.15 }); for (var bb = -2; bb <= 2; bb++) d.linea([[vx + bb * 0.4, vy], [vx + bb * 0.4, vy + 0.7]], 0.04, 'rgba(40,35,30,0.8)'); d.linea([[vx - 0.85, vy + 0.7], [vx + 0.85, vy + 0.7]], 0.05, 'rgba(40,35,30,0.8)'); }   // el balcón de hierro
          if (Z >= 16) { d.rect(vx - 0.9, vy, vx - 0.6, vy + 2.0, ['#4f8a6a', '#3f7a5a'], { ts: 0.1 }); d.rect(vx + 0.6, vy, vx + 0.9, vy + 2.0, ['#4f8a6a', '#3f7a5a'], { ts: 0.1 }); if (h(pl, vn, b) < 0.25) d.elipse(vx, vy + 0.95, 0.35, 0.3, ['#c43b2b', '#e8663a', '#4f9a3c'], { ts: 0.08 }); }   // las persianas verdes y alguna maceta
        }
      }
      [sg * 96, sg * 140, sg * 186].forEach(function (px, n) { persona(d, px, -4, ROBA[n + 2]); });
    });
    for (k = 0; k < 40; k++) d.elipse(-220 + h(k, 1, 2) * 440, -9 - h(k, 2, 2) * 28, 0.5 + h(k, 3, 2) * 0.9, 0.35 + h(k, 4, 2) * 0.5, ['#9a8a70', '#b0a080', '#857560'], { ts: 0.3 });   // piedras en la tierra
    [[-58, 150, 1.6], [26, 168, 1.2], [56, 130, 1.9], [-32, 182, 1.1], [66, 177, 1.3], [-68, 108, 1.2]].forEach(function (n) { nube(d, n[0], n[1], n[2]); });
    [[-22, 140, 1], [-18, 144, 0.8], [44, 118, 1.1], [-50, 92, 0.9]].forEach(function (g) { gavina(d, g[0], g[1], g[2]); });
    if (Z >= 16) {   // de cerca: un avión con su estela muy arriba y más gaviotas
      d.forma([[-46, 176], [-41.6, 176.4], [-41, 176.9], [-46.2, 176.6]], ['#f4efe3', '#e9e4da'], { ts: 0.2 }); d.forma([[-44, 176.3], [-43, 175.2], [-42.6, 175.3], [-43.2, 176.4]], ['#e9e4da'], { ts: 0.15 });
      d.linea([[-46.2, 176.4], [-76, 172.2]], 0.4, 'rgba(255,255,255,0.6)');
      [[30, 150, 0.8], [34, 147, 0.6], [-60, 120, 0.7], [-26, 70, 0.6]].forEach(function (g) { gavina(d, g[0], g[1], g[2]); });
    }

    // 1 · la grúa del fondo (aún trabajan en la fachada de la Gloria), con su cabina, el contrapeso y la carga
    d.forma([[56.4, -4], [58.6, -4], [58.6, 150], [56.4, 150]], C.grua, { ts: 0.45, alfa: 0.93 });
    for (y = -2; y < 148; y += 2.2) { d.linea([[56.4, y], [58.6, y + 2.2]], 0.16, 'rgba(120,70,20,0.6)'); d.linea([[58.6, y], [56.4, y + 2.2]], 0.1, 'rgba(120,70,20,0.35)'); }
    d.forma([[34, 150], [78, 150], [78, 152.2], [34, 152.2]], C.grua, { ts: 0.45, alfa: 0.93 });
    for (x = 34; x < 78; x += 2.2) d.linea([[x, 150], [x + 2.2, 152.2]], 0.16, 'rgba(120,70,20,0.6)');
    d.forma([[56, 152.2], [59, 152.2], [57.5, 160]], C.grua, { ts: 0.4 });
    d.linea([[57.5, 160], [36, 152.2]], 0.14, 'rgba(90,60,30,0.7)'); d.linea([[57.5, 160], [77, 152.2]], 0.14, 'rgba(90,60,30,0.7)');
    d.rect(36, 147.2, 40, 150, PM.grisO, { ts: 0.4 }); d.rect(58.6, 146.4, 61.4, 150, ['#fbf6ea', '#e6dcc7'], { ts: 0.3 }); d.rect(59.1, 147.8, 60.9, 149.4, C.vidre, { ts: 0.25 });   // contrapeso y cabina
    d.linea([[70, 150], [70, 127.6]], 0.08, 'rgba(60,40,20,0.8)'); d.rect(68.6, 125.4, 71.4, 127.6, PM.hierro, { ts: 0.25 }); d.rect(68.2, 122.6, 71.8, 125.4, C.passio, { ts: 0.3 });   // el gancho con un bloque de piedra

    // 2 · la calle: el estanque de la plaza de Gaudí (izquierda), el Bus Turístic y la gente (derecha), un taxi
    d.rect(-80, -5.2, 80, -4, PM.calc, { ts: 0.45 });
    d.rect(-79, -6.2, -50, -4.4, PM.grisO, { ts: 0.35 }); d.rect(-78.4, -5.8, -50.6, -4.5, C.aigua, { ts: 0.32 });   // el estanque, que refleja la fachada
    for (k = 0; k < 7; k++) d.linea([[-77 + k * 4, -5], [-75.6 + k * 4, -5]], 0.08, 'rgba(255,255,255,0.7)');
    [-72, -60, -46.6, 50, 76].forEach(function (px, n) { platan(d, px, 13 + h(n, 2, 3) * 3); });
    d.forma([[-68.8, -4], [-63.2, -4], [-63.2, -2.9], [-64.4, -2.9], [-65.2, -2.0], [-67.4, -2.0], [-68.2, -2.9], [-68.8, -2.9]], ['#1f1a15', '#2a2420'], { ts: 0.25 });   // el taxi negro y amarillo
    d.forma([[-67.4, -2.9], [-65.4, -2.9], [-65.6, -2.15], [-67.1, -2.15]], C.vidre, { ts: 0.2 }); d.rect(-66.3, -4, -63.2, -2.9, ['#f2b33d', '#f4c24e'], { ts: 0.22 });
    [-67.6, -64.4].forEach(function (rx) { d.elipse(rx, -4, 0.42, 0.42, ['#14110f'], { ts: 0.15 }); });
    d.forma([[61, -4], [73, -4], [73, 0.6], [61.4, 0.6], [61, 0]], ['#c43b2b', '#b8322c', '#d8452f'], { ts: 0.3, vol: 0.1 });   // el Bus Turístic, de dos pisos
    for (k = 0; k < 6; k++) d.rect(62 + k * 1.8, -2.4, 63.4 + k * 1.8, -0.9, C.vidre, { ts: 0.18 });
    d.rect(61.4, 0.6, 73, 1.4, ['#f4efe3', '#e6dcc7'], { ts: 0.2 }); gent(d, 62, 72.4, 0.6, 7, 33);
    [63.2, 70.8].forEach(function (rx) { d.elipse(rx, -4, 0.55, 0.55, ['#14110f'], { ts: 0.15 }); });
    gent(d, -61, -49.5, -4, 8, 11); gent(d, 47.4, 60, -4, 6, 12);
    d.forma([[-53, -4], [-49.4, -4], [-56.4, -10.6], [-60, -10.6]], ['#3a3530', '#45403a'], { ts: 0.4 });   // la escalera del metro, que baja hasta el andén
    for (k = 1; k < 9; k++) d.linea([[-53 - k * 0.78, -4 - k * 0.73], [-49.4 - k * 0.78, -4 - k * 0.73]], 0.06, 'rgba(200,190,170,0.5)');
    // la estación del Bicing con dos bicis aparcadas (como las de ahora: cuadro bajo rojo, guardabarros blancos, cesta delante
    // con la placa del logo, sillín negro y rueda gruesa). Cuanto más cerca, más piezas: radios, cadena, luces, el anclaje
    function bicing(bx, sem) {
      var r = 0.33, y = -4 + r, ra = bx - 0.62, rb = bx + 0.62, RO = ['#d8262f', '#c41f28', '#e0353c'];
      [ra, rb].forEach(function (rx) {
        d.elipse(rx, y, r, r, ['#1f1a15', '#2a2420'], { ts: 0.08 }); d.elipse(rx, y, r * 0.78, r * 0.78, ['#cfd3d6', '#e6e9eb'], { ts: 0.06 }); d.elipse(rx, y, r * 0.18, r * 0.18, ['#8a9096'], { ts: 0.04 });
        if (Z >= 64) for (var k = 0; k < 12; k++) { var a = k / 12 * 3.1416; d.linea([[rx - Math.cos(a) * r * 0.76, y - Math.sin(a) * r * 0.76], [rx + Math.cos(a) * r * 0.76, y + Math.sin(a) * r * 0.76]], 0.008, 'rgba(90,95,100,0.8)'); }
        d.linea(M.elipsePts(rx, y, r * 1.12, r * 1.12, 0.35, 2.8, 10), 0.07, '#f4f4f2');   // el guardabarros blanco
      });
      d.linea([[ra, y], [bx - 0.08, y]], 0.06, RO[0]); d.linea(curva([bx - 0.08, y], [bx + 0.16, y + 0.05], [bx + 0.18, y + 0.62], 8), 0.085, RO[0]);   // el cuadro bajo y curvo (sin barra, para subir fácil)
      d.linea([[bx - 0.08, y], [bx - 0.2, y + 0.58]], 0.07, RO[1]);   // el tubo del sillín
      d.linea([[bx + 0.18, y + 0.62], [rb, y]], 0.07, RO[2]);   // la horquilla
      d.forma([[bx - 0.36, y + 0.6], [bx - 0.02, y + 0.6], [bx - 0.06, y + 0.66], [bx - 0.34, y + 0.67]], ['#14110f', '#2a2420'], { ts: 0.04 });   // el sillín
      d.linea([[bx + 0.18, y + 0.62], [bx + 0.16, y + 0.82], [bx + 0.34, y + 0.84]], 0.045, '#2a2420');   // el manillar
      d.forma([[rb - 0.18, y + 0.42], [rb + 0.24, y + 0.42], [rb + 0.28, y + 0.7], [rb - 0.2, y + 0.7]], ['#3a3530', '#45403a'], { ts: 0.05 });   // la cesta delante
      d.rect(rb - 0.14, y + 0.47, rb + 0.22, y + 0.64, ['#ffffff', '#f4f4f2'], { ts: 0.04 });   // la placa del logo
      if (Z >= 64) d.texto('bicing', rb + 0.04, y + 0.555, 0.09, '#d8262f');
      if (Z >= 32) {
        d.forma([[bx - 0.12, y - 0.06], [ra + 0.12, y - 0.06], [ra + 0.12, y + 0.08], [bx - 0.12, y + 0.08]], ['#f4f4f2', '#e6e9eb'], { ts: 0.04 });   // el cubrecadena blanco
        d.elipse(bx - 0.08, y, 0.1, 0.1, ['#8a9096'], { ts: 0.03 }); d.linea([[bx - 0.08, y - 0.1], [bx + 0.06, y - 0.16]], 0.02, '#14110f');   // el plato y el pedal
        d.elipse(rb + 0.3, y + 0.62, 0.05, 0.04, ['#fff3c4'], { ts: 0.02 }); d.elipse(ra - 0.36, y + 0.22, 0.04, 0.04, ['#c43b2b'], { ts: 0.02 });   // las luces
        d.forma([[rb + 0.3, y + 0.05], [rb + 0.46, y + 0.05], [rb + 0.46, y + 0.95], [rb + 0.3, y + 0.95]], ['#9aa0a6', '#b0b6bb'], { ts: 0.04 });   // el anclaje gris de la estación
        d.elipse(rb + 0.38, y + 0.85, 0.04, 0.04, [h(sem, 1, 1) < 0.5 ? '#4f9a3c' : '#c43b2b'], { ts: 0.02 });   // su lucecita
      }
    }
    if (Z >= 8) {
      d.rect(44.4, -4, 49.6, -3.9, ['#9aa0a6', '#8a9096'], { ts: 0.15 });   // la base de la estación
      d.rect(49.9, -4, 50.3, -1.8, ['#9aa0a6', '#b0b6bb'], { ts: 0.1 }); d.rect(49.6, -1.8, 50.6, -0.9, ['#d8262f', '#c41f28'], { ts: 0.06 });   // el tótem rojo
      if (Z >= 32) d.texto('bicing', 50.1, -1.35, 0.15, '#ffffff');
      bicing(45.3, 1); bicing(47.8, 2);
    }
    if (Z >= 16) {   // de cerca: las farolas, los bancos, las palomas, la bici roja del Bicing y el rombo rojo del metro
      [-64, -55, 52.2, 58.8, 66.4].forEach(function (fx) { d.linea([[fx, -4], [fx, 1.6]], 0.14, 'rgba(50,55,55,0.95)'); d.linea([[fx, 1.6], [fx + 0.8, 2.2]], 0.1, 'rgba(50,55,55,0.95)'); d.elipse(fx + 0.9, 2.0, 0.28, 0.2, ['#fbf1d0', '#f4d27a'], { ts: 0.1 }); });
      [[-58, -4], [53.4, -4]].forEach(function (b) { d.rect(b[0], -3.55, b[0] + 2, -3.35, C.fusta, { ts: 0.1 }); d.rect(b[0], -3.35, b[0] + 0.1, -2.8, C.fusta, { ts: 0.08 }); d.linea([[b[0] + 0.2, -4], [b[0] + 0.2, -3.55]], 0.06, '#3f4a3c'); d.linea([[b[0] + 1.8, -4], [b[0] + 1.8, -3.55]], 0.06, '#3f4a3c'); });
      for (k = 0; k < 6; k++) d.elipse(-48.6 + k * 0.6 + h(k, 5, 5) * 0.3, -3.86, 0.17, 0.12, ['#8f9aa0', '#a3abb0'], { ts: 0.06 });
      d.linea([[-53.4, -1.2], [-53.4, -4]], 0.08, 'rgba(60,60,60,0.9)');
      d.forma([[-53.4, -0.2], [-52.8, -0.8], [-53.4, -1.4], [-54, -0.8]], ['#c43b2b', '#d8452f'], { ts: 0.1 }); d.texto('M', -53.4, -0.8, 0.5, '#fbf6ea');
    }
    if (Z >= 32) {   // las aceras de panots: la flor de Barcelona, la misma del icono
      for (x = -79.4; x < 79.4; x += 0.6) { if (x > -53.2 && x < -49.2 || x > -46.6 && x < 46.6) continue; [[-0.1, 0], [0.1, 0], [0, 0.1], [0, -0.1]].forEach(function (q) { d.linea([[x + q[0], -4.6 + q[1]], [x + q[0] + 0.001, -4.6 + q[1]]], 0.08, 'rgba(160,140,110,0.75)'); }); }
    }

    // 3 · bajo tierra: el metro, los cimientos, la cripta (centro) y el museo (derecha)
    d.forma(M.elipsePts(-62, -15.5, 6.2, 4.6, 0, 6.2832, 40), PM.hormigon, { ts: 0.4 });   // el túnel del metro bajo la calle, con un tren
    d.forma(M.elipsePts(-62, -15.5, 5.4, 3.9, 0, 6.2832, 40), ['#3a3530', '#45403a'], { ts: 0.35 });
    d.forma([[-66.6, -18.3], [-57.4, -18.3], [-57.4, -14.6], [-58.2, -13.2], [-65.8, -13.2], [-66.6, -14.6]], ['#e9e4da', '#f4efe3', '#d8d2c6'], { ts: 0.25 });
    d.rect(-66.6, -16.8, -57.4, -16.2, ['#6a3f9a', '#7a4faa'], { ts: 0.15 }); for (k = 0; k < 4; k++) d.rect(-65.8 + k * 2.1, -15.6, -64.4 + k * 2.1, -14, ['#fff3c4', '#f6e7b8'], { ts: 0.15 });
    d.rect(-67.4, -19.2, -56.6, -18.6, PM.hierro, { ts: 0.2 });
    d.rect(-44, -16.8, 44, -4, C.corte, { ts: 0.95 });   // la losa y los muros enterrados (cortados)
    [-37, -11, 11, 37].forEach(function (px) { d.rect(px - 3.4, -18.4, px + 3.4, -16.8, ['#6f6456', '#7d7162'], { ts: 0.45 }); for (k = -1; k <= 1; k++) d.rect(px + k * 2.2 - 0.35, -24, px + k * 2.2 + 0.35, -18.4, PM.hormigon, { ts: 0.3 }); });   // zapatas y pilotes
    if (Z >= 256) { d.texto('PAU MORATÓ SEBASTIÀ', -37, -17.4, 0.12, 'rgba(242,179,61,0.95)'); d.texto('VA COL·LOCAR AQUESTES PECES · MMXXVI', -37, -17.62, 0.06, 'rgba(242,179,61,0.85)'); }   // la marca del mosaiquista, solo con el zoom más profundo
    // — la cripta neogótica (Villar la empezó en 1882 y Gaudí la acabó): bóveda de crucería, columnas, capillas y altar
    // (como en las fotos) piedra dorada iluminada desde abajo, arcos apuntados con sus molduras, haces de columnas con capiteles
    // de hojas, un triforio de arquitos y las plementerías de la bóveda entre los nervios
    d.rect(-17, -15.6, 17, -5.6, null, { banda: banda(-15.6, 2.5, [['#c9a46a', '#d6b47c', '#b8925e'], ['#d6b47c', '#e2c58e', '#c9a46a'], ['#c2a070', '#d0ae78', '#b8925e'], ['#a8875a', '#b8925e', '#9a7a50']]), ts: 0.7 });
    for (k = -2; k <= 1; k++) {
      var a0 = k * 8.5, a1 = a0 + 8.5, ac = a0 + 4.25;
      d.forma(M.arco(a0 + 0.7, a1 - 0.7, -15.6, -13.8, 'ojival'), ['#7c5a38', '#8f6a42', '#6f5236'], { ts: 0.4 });   // el hueco del arco, en penumbra
      d.linea(M.arco(a0 + 0.55, a1 - 0.55, -15.6, -13.8, 'ojival').slice(2), 0.14, 'rgba(240,215,160,0.85)');   // las molduras del arco
      d.linea(M.arco(a0 + 0.85, a1 - 0.85, -15.6, -13.8, 'ojival').slice(2), 0.08, 'rgba(110,80,45,0.6)');
      [a0, a1].forEach(function (na) { var nv = []; for (var q = 0; q <= 10; q++) { var u = q / 10; nv.push([na + (ac - na) * u, -9.0 + 3.1 * Math.sin(u * Math.PI / 2)]); } d.linea(nv, 0.18, 'rgba(240,215,160,0.9)'); d.linea(nv.map(function (p) { return [p[0], p[1] - 0.12]; }), 0.06, 'rgba(110,80,45,0.6)'); });
      d.elipse(ac, -5.95, 0.5, 0.34, k === -1 || k === 0 ? ['#2f5fae', '#f2b33d', '#fbf6ea'] : PM.oro, { ts: 0.16 });   // la clave pintada
      if (k !== -1) { d.linea([[ac, -5.9], [ac, -8.2]], 0.05, 'rgba(60,40,20,0.8)'); d.forma([[ac - 0.32, -8.2], [ac + 0.32, -8.2], [ac + 0.22, -8.8], [ac - 0.22, -8.8]], ['#c9a46a', '#8a6a3a'], { ts: 0.08 }); d.elipse(ac, -8.75, 0.24, 0.12, ['#fff3c4', '#fbf1d0'], { ts: 0.06 }); }   // la lámpara de bronce
    }
    for (k = -2; k <= 2; k++) {   // los haces de columnas con su capitel de hojas
      x = k * 8.5;
      d.rect(x - 0.9, -15.6, x + 0.9, -15.0, PM.piedraC, { ts: 0.25 });
      [-0.45, 0, 0.45].forEach(function (dx) { d.rect(x + dx - 0.2, -15.0, x + dx + 0.2, -9.4, ['#d6b47c', '#c9a46a', '#e2c58e'], { vol: 0.4, ts: 0.25 }); });
      d.forma([[x - 0.75, -9.4], [x + 0.75, -9.4], [x + 1.15, -8.8], [x - 1.15, -8.8]], ['#e2c58e', '#d6b47c'], { ts: 0.2, vol: 0.2 });
      for (var hj = 0; hj < 5; hj++) d.elipse(x - 0.8 + hj * 0.4, -9.05, 0.2, 0.26, ['#c9a46a', '#b8925e', '#a8875a'], { ts: 0.08, vol: 0.4 });   // las hojas del capitel
      d.rect(x - 1.25, -8.85, x + 1.25, -8.65, PM.piedraC, { ts: 0.15 });
      if (Z >= 64) for (var ft = -2; ft <= 2; ft++) d.linea([[x + ft * 0.18, -15.0], [x + ft * 0.18, -9.4]], 0.02, 'rgba(110,80,45,0.4)');
    }
    // los bancos de madera oscura, fila tras fila (de perfil)
    for (k = 0; k < 9; k++) { var bx = -16 + k * 1.6; if (bx > -12.8 && bx < -6.2 || bx > -2.6 && bx < 2.6) continue; d.forma([[bx, -15.2], [bx + 0.12, -15.2], [bx + 0.12, -14.75], [bx + 0.9, -14.75], [bx + 0.9, -14.6], [bx + 0.12, -14.6], [bx + 0.12, -14.0], [bx, -14.0]], ['#5a3d26', '#4a3222', '#654430'], { ts: 0.08 }); }
    d.rect(-17, -15.9, 17, -15.2, ['#d6c7ae', '#c9bba4', '#e2d6c0'], { ts: 0.3 });   // el suelo de mosaico: sarmientos de vid y racimos
    d.linea(curva([-17, -15.55], [0, -15.3], [17, -15.55], 12), 0.07, 'rgba(79,140,60,0.8)');
    for (k = 0; k < 14; k++) d.elipse(-16 + k * 2.4, -15.5, 0.16, 0.16, ['#6a3f9a', '#7a4faa'], { ts: 0.1 });
    // el altar mayor con el relieve de la Sagrada Familia de Josep Llimona, y sus cirios
    d.rect(-2.2, -15.2, 2.2, -13.9, PM.piedraC, { ts: 0.3 }); d.rect(-2.4, -13.95, 2.4, -13.7, ['#fbf6ea'], { ts: 0.15 });
    d.forma(M.arco(-1.9, 1.9, -13.6, -11.6, 'medio'), PM.oro, { ts: 0.2 }); d.forma(M.arco(-1.7, 1.7, -13.6, -11.6, 'medio'), C.guix, { ts: 0.25 });
    [[-0.85, 0.9], [0, 1.1], [0.85, 0.9]].forEach(function (p) { escultura(d, p[0], -13.5, p[1] + 0.5, ['#e6dcc7', '#d8cbb0', '#efe6d2'], false); });
    [-1.8, 1.8].forEach(function (px) { d.rect(px - 0.07, -13.7, px + 0.07, -13.0, ['#fbf6ea'], { ts: 0.1 }); d.elipse(px, -12.85, 0.1, 0.16, ['#f2b33d', '#f4d27a'], { ts: 0.08 }); });
    [[-5.6, -3.4], [2.8, 5.2], [5.8, 8.0]].forEach(function (b, n) { d.rect(b[0], -15.2, b[1], -14.7, C.fusta, { ts: 0.2 }); d.rect(b[0], -14.7, b[0] + 0.2, -14.0, C.fusta, { ts: 0.15 }); persona(d, (b[0] + b[1]) / 2, -14.7, ROBA[n + 3], 0.75); });   // bancos con fieles
    if (Z >= 16) {   // de cerca: el sacerdote con la estola dorada, las hojas de vid del suelo y las pinturas de las capillas
      persona(d, 0.9, -15.2, '#fbf6ea', 0.95); d.linea([[0.9, -14.5], [0.9, -14.0]], 0.16, 'rgba(242,179,61,0.9)');
      for (k = 0; k < 18; k++) d.forma([[-16.4 + k * 1.9, -15.52], [-16.1 + k * 1.9, -15.36], [-15.8 + k * 1.9, -15.52], [-16.1 + k * 1.9, -15.62]], ['#5f8f4a', '#6aa84a'], { ts: 0.08 });
      [-14.6, 14.6].forEach(function (cx) {   // un retablo pintado en cada capilla: la Virgen de manto azul con su aureola de oro
        d.forma(M.arco(cx - 1.1, cx + 1.1, -13.4, -11.6, 'medio'), ['#e9d9a8', '#f2e4b8'], { ts: 0.12 });
        d.elipse(cx, -12.15, 0.42, 0.42, PM.oro, { ts: 0.08 }); d.elipse(cx, -12.2, 0.22, 0.26, C.pell, { ts: 0.06 });
        d.forma([[cx - 0.6, -13.3], [cx + 0.6, -13.3], [cx + 0.3, -12.5], [cx, -12.38], [cx - 0.3, -12.5]], ['#2f5fae', '#24508f'], { ts: 0.08 }); d.linea(M.arco(cx - 1.1, cx + 1.1, -13.4, -11.6, 'medio'), 0.05, 'rgba(242,179,61,0.9)');
      });
    }
    if (Z >= 32) {   // las llamas de los cirios… y el gato de la cripta, dormido en un rincón
      [-1.8, 1.8].forEach(function (px) { d.elipse(px, -12.75, 0.05, 0.1, ['#fff3c4'], { ts: 0.04 }); });
      d.elipse(-16.0, -15.08, 0.34, 0.15, ['#1f1a15', '#2a2420'], { ts: 0.06 }); d.elipse(-15.7, -14.98, 0.12, 0.11, ['#1f1a15'], { ts: 0.05 }); d.linea(curva([-16.3, -15.1], [-16.6, -15.0], [-16.4, -14.85], 4), 0.04, '#1f1a15'); if (Z >= 128) { d.forma([[-15.78, -14.92], [-15.74, -14.82], [-15.7, -14.9]], ['#1f1a15'], { ts: 0.02 }); d.forma([[-15.68, -14.9], [-15.64, -14.8], [-15.6, -14.9]], ['#1f1a15'], { ts: 0.02 }); d.linea(curva([-15.72, -14.99], [-15.69, -15.01], [-15.66, -14.99], 3), 0.008, 'rgba(242,179,61,0.8)'); }
    }
    // la capilla del Carmen: la losa de Gaudí, con su inscripción, una lámpara, flores y la reja por donde se mira
    d.forma(M.arco(-12.6, -6.4, -15.2, -11.4, 'ojival'), ['#5a3d26', '#4a3222', '#654430'], { ts: 0.36 });
    d.forma(M.arco(-12.2, -6.8, -15.2, -11.6, 'ojival'), ['#6f5236', '#5a3d26'], { ts: 0.3, alfa: 0.5 });
    d.rect(TOMBA.x - 2.2, -15.2, TOMBA.x + 2.2, -14.5, ['#d9cdb4', '#e6dcc7', '#cdbf9f'], { ts: 0.26 });
    if (Z < 128) { d.texto('ANTONIUS GAUDÍ CORNET', TOMBA.x, -14.78, 0.22, 'rgba(70,45,25,0.85)'); d.texto('REUSENSIS · MCMXXVI', TOMBA.x, -15.0, 0.13, 'rgba(70,45,25,0.7)'); }
    else ['ANTONIUS GAUDÍ CORNET', 'REUSENSIS', 'ANNOS NATUS LXXIV, VITAE EXEMPLARIS VIR,', 'EXIMIUSQUE ARTIFEX, MIRABILIS OPERIS HUJUS,', 'TEMPLI AUCTOR, PIE OBIIT BARCINONE', 'DIE X JUNII MCMXXVI;', 'HINC CINERES TANTI HOMINIS', 'RESURRECTIONEM MORTUORUM EXPECTANT. R.I.P.'].forEach(function (l, i) { d.texto(l, TOMBA.x, -14.6 - i * 0.07 - (i ? 0.03 : 0), i ? 0.045 : 0.08, 'rgba(70,45,25,0.88)'); });   // de muy cerca, la inscripción entera de la losa
    d.linea([[TOMBA.x, -9.9], [TOMBA.x, -11.8]], 0.05, 'rgba(60,40,20,0.8)'); d.elipse(TOMBA.x, -12.0, 0.3, 0.22, ['#f2b33d', '#c43b2b'], { ts: 0.1 });
    [[TOMBA.x - 0.9, ['#c43b2b', '#d8452f']], [TOMBA.x + 0.9, ['#f4efe3', '#ffffff']]].forEach(function (r) {   // dos ramos de flores sobre la losa
      var rx = r[0]; d.forma([[rx - 0.12, -14.5], [rx + 0.12, -14.5], [rx + 0.06, -14.3], [rx - 0.06, -14.3]], ['#5f8f4a'], { ts: 0.08 });
      [[-0.18, -14.12], [0.0, -14.02], [0.18, -14.12], [-0.08, -13.92], [0.1, -13.9]].forEach(function (f) { d.linea([[rx, -14.3], [rx + f[0], f[1]]], 0.02, '#4f8a3c'); d.elipse(rx + f[0], f[1], 0.08, 0.08, r[1], { ts: 0.05 }); });
    });
    for (k = 0; k < 9; k++) d.linea([[-12.4 + k * 0.72, -15.2], [-12.4 + k * 0.72, -11.6]], 0.05, 'rgba(40,30,20,0.55)');   // la reja
    d.forma(M.arco(6.4, 12.6, -15.2, -11.4, 'ojival'), ['#5a3d26', '#4a3222', '#654430'], { ts: 0.36 });   // la capilla del Santísimo, con el sagrario dorado
    d.rect(8.6, -15.2, 10.4, -13.6, PM.piedraC, { ts: 0.2 }); d.forma(M.arco(8.9, 10.1, -13.6, -12.8, 'medio'), PM.oro, { ts: 0.15 });
    // — el museo: maquetas de yeso, la maqueta de cadenas con su espejo y una vitrina con dibujos
    d.rect(19, -15.6, 42, -6.4, ['#ece4d2', '#e6dcc4', '#f2ecdc'], { ts: 0.8 });
    d.rect(19, -15.8, 42, -15.2, PM.gris, { ts: 0.35, modo: 'rayas' });
    for (k = 0; k < 5; k++) { d.linea([[20.5 + k * 5, -6.4], [20.5 + k * 5, -6.9]], 0.05, 'rgba(60,40,20,0.7)'); d.elipse(20.5 + k * 5, -7.0, 0.26, 0.16, ['#fbf1d0', '#f2b33d'], { ts: 0.1 }); }   // focos
    d.rect(20, -15.2, 25.4, -13.4, PM.grisO, { ts: 0.3 });   // la gran maqueta de yeso de la nave
    d.forma(huso(22.7, -13.4, 1.6, 5), C.guix, { ts: 0.2, vol: 0.2 }); d.forma(huso(21.4, -13.4, 0.9, 3.4), C.guix, { ts: 0.18 }); d.forma(huso(24, -13.4, 0.9, 3.6), C.guix, { ts: 0.18 });
    d.rect(20.4, -13.4, 25, -11.6, C.guix, { ts: 0.22 }); for (k = 0; k < 6; k++) d.forma(M.arco(20.6 + k * 0.72, 21.1 + k * 0.72, -13.2, -12.4, 'ojival'), ['#d8d2c6'], { ts: 0.12 });
    // la maqueta polifunicular (como la del museo): una vitrina de cristal y, colgada del techo, una iglesia boca abajo hecha de
    // cientos de cordeles con saquitos de perdigones; las torres cuelgan como estalactitas. De cerca, cada cordel y cada saquito
    d.rect(26.4, -15.2, 35.6, -6.8, ['#cfe2f0', '#e3eef0'], { ts: 0.5, alfa: 0.18 });   // el vidrio de la vitrina
    [26.4, 35.6].forEach(function (vx) { d.linea([[vx, -15.2], [vx, -6.8]], 0.06, 'rgba(90,90,90,0.8)'); });
    d.rect(26.8, -7.0, 35.2, -6.8, PM.hierro, { ts: 0.18 });   // el bastidor
    var PERFIL = function (u) { return 1.2 + 2.9 * Math.pow(Math.sin(u * Math.PI), 0.7) + (Math.abs(u - 0.3) < 0.05 || Math.abs(u - 0.7) < 0.05 ? 1.6 : 0) + (Math.abs(u - 0.5) < 0.04 ? 2.4 : 0); };   // cuánto cuelga cada cordel
    var NC = Z >= 32 ? 44 : 22;
    for (k = 0; k <= NC; k++) {
      var u = k / NC, cxk = 27.2 + u * 7.6, largo = PERFIL(u), fin = -7.0 - largo;
      d.linea([[cxk, -7.0], [cxk + (h(k, 3, 3) - 0.5) * 0.12, fin]], Z >= 32 ? 0.02 : 0.035, 'rgba(70,60,50,0.75)');
      for (var sa = 0; sa < (Z >= 32 ? 6 : 3); sa++) { var sy = -7.4 - (sa + 0.5) / (Z >= 32 ? 6 : 3) * largo; d.elipse(cxk, sy, 0.09, 0.13, ['#c9b994', '#b0a080', '#a09070'], { ts: 0.05 }); }
      d.elipse(cxk, fin - 0.12, 0.13, 0.18, ['#8a7a5a', '#a09070'], { ts: 0.06 });   // el saquito de la punta
    }
    for (k = 0; k < 5; k++) {   // las catenarias que cruzan (los arcos, boca abajo)
      var xa = 27.2 + k * 0.9, xb = 34.8 - k * 0.9, cat = [], ref = [], hondo = 4.4 - k * 0.6;
      for (var t = 0; t <= 14; t++) { var uu = t / 14, xx = xa + (xb - xa) * uu, cc = (Math.cosh((uu - 0.5) * 2.2) - Math.cosh(1.1)) / (1 - Math.cosh(1.1)); cat.push([xx, -6.9 - cc * hondo]); ref.push([xx, -15.0 + cc * hondo * 0.32]); }
      d.linea(cat, 0.05, 'rgba(70,60,50,0.9)'); d.linea(ref, 0.04, 'rgba(70,90,110,0.55)');
      if (Z >= 128) for (var e2 = 1; e2 < cat.length; e2++) { var A = cat[e2 - 1], B = cat[e2]; for (var u3 = 0; u3 < 1; u3 += 0.2) { var lx = A[0] + (B[0] - A[0]) * u3, ly = A[1] + (B[1] - A[1]) * u3; d.linea([[lx - 0.03, ly + (u3 * 10 % 2 < 1 ? 0.012 : -0.012)], [lx + 0.03, ly]], 0.016, 'rgba(50,40,30,0.85)'); } }   // los eslabones
    }
    d.rect(26.6, -15.2, 35.4, -14.9, ['#b8d4ea', '#cfe2f0', '#9fc3df'], { ts: 0.12 });   // el espejo
    d.rect(36.4, -15.2, 41.2, -14.4, PM.grisO, { ts: 0.26 }); d.rect(36.7, -14.4, 40.9, -11.4, PM.vidrio, { ts: 0.3, alfa: 0.5 });   // la vitrina
    for (k = 0; k < 3; k++) d.rect(37.1 + k * 1.3, -13.6, 37.9 + k * 1.3, -12.4, ['#f4efe3', '#efe6d2'], { ts: 0.12 });
    if (Z >= 16) {   // de cerca: los dibujos de Gaudí enmarcados y más cadenas cruzadas en la maqueta
      [[20.6, -9.4], [23.6, -9.4], [37.6, -9.0], [40.2, -9.0]].forEach(function (p, n) {
        d.rect(p[0] - 1, p[1] - 0.8, p[0] + 1, p[1] + 0.8, ['#8a5a32'], { ts: 0.08 }); d.rect(p[0] - 0.85, p[1] - 0.65, p[0] + 0.85, p[1] + 0.65, ['#f4efe3', '#efe6d2'], { ts: 0.08 });
        d.linea(n % 2 ? desplazar(M.huso(p[0], 0.9, 1.1, 0.06), 0, p[1] - 0.55) : M.arco(p[0] - 0.6, p[0] + 0.6, p[1] - 0.55, p[1] - 0.1, 'ojival'), 0.03, 'rgba(70,45,25,0.8)');
      });
      for (k = 0; k < 4; k++) { var xa2 = 27.95 + k * 0.75, xb2 = 34.05 - k * 0.75, c2 = []; for (var t2 = 0; t2 <= 12; t2++) { var u2 = t2 / 12, cc2 = (Math.cosh((u2 - 0.5) * 2.2) - Math.cosh(1.1)) / (1 - Math.cosh(1.1)); c2.push([xa2 + (xb2 - xa2) * u2, -6.9 - cc2 * (3.8 - k * 0.7)]); } d.linea(c2, 0.035, 'rgba(70,60,50,0.7)'); }
    }
    gent(d, 26, 35, -15.2, 4, 21); persona(d, -14.6, -15.2, '#4f9a3c', 0.95); persona(d, -4.4, -15.2, '#c43b2b', 0.9);

    // 4 · el fondo de la nave: el muro del ábside y los vitrales de Vila-Grau (fríos al este, cálidos al oeste)
    d.rect(-30, 0, 30, 45, PM.piedraC, { ts: 1.0, vol: 0.04 });
    d.rect(-7.5, 45, 7.5, 60, PM.piedraC, { ts: 1.0 });
    VITRALLS.forEach(function (cx, n) {
      var pal = cx < 0 ? FRED : CALID;
      finestral(d, cx, 2.0, 13.8, 5.0, pal.slice(0, 4), 100 + n * 7, false);
      finestral(d, cx, 18.4, 40.4, 5.0, pal, 200 + n * 7, true);
    });
    // — el ábside al fondo del crucero: el gran arco en penumbra, los ventanales de luz dorada, el órgano y la sillería
    d.forma(M.arco(-6.2, 6.2, 0, 34, 'ojival'), ['#cdb383', '#c2a674', '#d8c194'], { ts: 0.85, vol: 0.06 });
    [-3.7, 0, 3.7].forEach(function (cx, n) { finestral(d, cx, 19, 33 + (n === 1 ? 3 : 0), 2.4, DAURAT, 300 + n, true); });
    for (k = 0; k < 15; k++) { var ph = 3.2 + Math.sin(k / 14 * Math.PI) * 2.6; d.rect(-4.9 + k * 0.7 - 0.22, 13.4, -4.9 + k * 0.7 + 0.22, 13.4 + ph, ['#c9c2b4', '#e9e4da', '#a8a39a'], { ts: 0.12, vol: 0.4 }); d.elipse(-4.9 + k * 0.7, 13.4 + ph, 0.22, 0.12, ['#14110f'], { ts: 0.08 }); if (Z >= 128) d.forma([[-5.08 + k * 0.7, 14.2], [-4.72 + k * 0.7, 14.2], [-4.78 + k * 0.7, 14.42], [-5.02 + k * 0.7, 14.42]], ['#14110f'], { ts: 0.03 }); }   // los tubos del órgano (y de muy cerca, sus bocas)
    d.rect(-5.4, 12.8, 5.4, 13.4, C.fusta, { ts: 0.2 });
    for (k = 0; k < 14; k++) d.linea([[-6.2 + k * 0.95, 0], [-6.2 + k * 0.95, 3.4]], 0.07, 'rgba(70,45,25,0.3)');   // la sillería del coro del ábside
    // el baldaquino (como en las fotos): el octógono visto un poco desde abajo, naranja con sus costillas de madera; la cinta
    // clara con letras rojas; la guirnalda de vid y trigo; las lámparas colgadas alrededor y el Cristo crucificado debajo
    var BAL = [];
    for (k = 0; k < 8; k++) { var ab = k / 8 * 6.2832 + 0.39; BAL.push([Math.cos(ab) * 4.8, 9.0 + Math.sin(ab) * 1.0]); }
    d.forma(BAL, ['#e8892f', '#f08a4b', '#e9a92e', '#d9772a'], { modo: 'radial', ts: 0.3 });
    if (Z >= 16) BAL.forEach(function (p) { d.linea([[0, 9.0], p], 0.05, 'rgba(120,60,20,0.55)'); });   // las costillas de madera
    d.elipse(0, 9.0, 0.35, 0.12, ['#3a2f25'], { ts: 0.1 });
    d.rect(-4.9, 9.6, 4.9, 10.5, ['#f4efe3', '#fbf6ea', '#ece4d2'], { ts: 0.2 });   // la cinta de arriba
    if (Z >= 16) { [-4.3, 0, 4.3].forEach(function (rx) { d.elipse(rx, 10.05, 0.3, 0.3, ['#c43b2b', '#d8452f'], { ts: 0.08 }); if (Z >= 64) d.texto('SS', rx, 10.05, 0.22, '#fbf6ea'); }); d.texto('GLORIA', -2.15, 10.05, 0.4, '#c43b2b'); d.texto('A DÉU', 2.15, 10.05, 0.4, '#c43b2b'); }
    for (x = -4.7; x < 4.8; x += 0.45) d.elipse(x, 9.45, 0.24, 0.18, ['#4f8a3c', '#5f9a45', '#3f7a35'], { ts: 0.1 });   // la guirnalda de hojas de vid
    for (k = 0; k < 10; k++) d.elipse(-4.4 + k * 0.98, 9.1, 0.16, 0.24, k % 2 ? ['#6a3f9a', '#5a2f8a'] : ['#e9b64a', '#f2b33d'], { ts: 0.08 });   // racimos y espigas
    if (Z >= 64) for (k = 0; k < 10; k++) { var gx = -4.4 + k * 0.98; for (var g = 0; g < 6; g++) d.elipse(gx + (g % 2 ? 0.07 : -0.07), 9.2 - Math.floor(g / 2) * 0.1, 0.05, 0.05, k % 2 ? ['#7a4faa'] : ['#f4d27a'], { ts: 0.02 }); }
    for (k = 0; k < 26; k++) {   // las lámparas: colgadas a distintas alturas alrededor del octógono
      var lx = -4.7 + k * 0.376, ly = 8.5 - (k % 3) * 0.55 - h(k, 2, 7) * 0.3; d.linea([[lx, 9.2], [lx, ly + 0.15]], 0.02, 'rgba(70,45,25,0.6)');
      d.elipse(lx, ly, 0.13, 0.17, ['#f08a4b', '#e8663a', '#f4c24e'], { ts: 0.06 });
      if (Z >= 64) d.elipse(lx, ly + 0.02, 0.05, 0.07, ['#fff3c4'], { ts: 0.03 });
    }
    d.linea([[0, 8.5], [0, 7.6]], 0.04, 'rgba(70,45,25,0.6)'); d.linea([[0, 7.8], [0, 4.0]], 0.16, '#d6b47c'); d.linea([[-0.9, 7.0], [0.9, 7.0]], 0.14, '#d6b47c');   // la cruz
    d.forma([[-0.85, 6.95], [0.85, 6.95], [0.22, 6.6], [0.2, 5.3], [0.12, 4.6], [-0.12, 4.6], [-0.2, 5.3], [-0.22, 6.6]], ['#e8d4b4', '#dcc39f'], { ts: 0.08, vol: 0.3 }); d.elipse(0.05, 7.12, 0.14, 0.17, ['#e8d4b4'], { ts: 0.05 });   // el Cristo
    d.rect(-3.2, 0, 3.2, 1.5, ['#c9a46a', '#b8925e', '#d6b47c'], { ts: 0.25 }); d.rect(-3.4, 1.5, 3.4, 1.75, ['#fbf6ea', '#f4efe3'], { ts: 0.12 });   // el altar
    // — los haces de luz de colores que bajan de los vitrales hasta el suelo (vidrio translúcido, por encima del muro)
    VITRALLS.forEach(function (cx, n) {
      var pal = cx < 0 ? ['#5fa3da', '#6aa84a', '#3b7dc4', '#8fc06a'] : ['#f08a4b', '#f2b33d', '#e8663a', '#f4c24e'], dx = cx < 0 ? 3.4 : -3.4;
      d.forma([[cx - 2.2, 9], [cx + 2.2, 9], [cx + 2.6 + dx, 0], [cx - 1.8 + dx, 0]], pal, { ts: 0.5, alfa: 0.16 });
    });
    // — las tribunas del coro, a 15 m, con los cantores de blanco
    [-1, 1].forEach(function (sg) {
      d.rect(sg * 15, 14.4, sg * 30, 15.6, ['#efe6d2', '#f4efe3', '#e2d6bc'], { ts: 0.35 });
      for (x = 15.3; x < 29.9; x += 0.75) d.forma([[sg * x, 14.4], [sg * (x + 0.75), 14.4], [sg * (x + 0.45), 13.5 - h(Math.round(x * 4), 3, 3) * 0.5]], ['#f4efe3', '#e9e0c9', '#fbf8f0'], { ts: 0.2 });   // el borde de hojas dentadas
      for (x = 15.4; x < 30; x += 0.9) d.linea([[sg * x, 15.6], [sg * x, 16.8]], 0.1, 'rgba(70,45,25,0.55)');
      d.linea([[sg * 15, 16.8], [sg * 30, 16.8]], 0.16, 'rgba(70,45,25,0.6)');
      for (k = 0; k < 9; k++) persona(d, sg * (16.4 + k * 1.5), 15.6, '#fbf6ea', 0.85);
    });
    // — el suelo de la nave, las sillas y la gente; y los charcos de luz de colores en el suelo
    d.rect(-30, -0.5, 30, 0, ['#d6c7ae', '#c9bba4', '#e2d6c0', '#efe6d2'], { ts: 0.5, modo: 'rayas' });
    [-1, 1].forEach(function (sg) { for (k = 0; k < 12; k++) { x = sg * (9.4 + k * 1.05); d.forma([[x - 0.25, 0], [x + 0.25, 0], [x + 0.25, 0.45], [x + sg * 0.25, 0.45], [x + sg * 0.25, 0.95], [x + sg * 0.1, 0.95], [x + sg * 0.1, 0.55], [x - 0.25, 0.55]], C.fusta, { ts: 0.12 }); } });
    gent(d, -28.4, -10, 0, 9, 41); gent(d, 10, 28.6, 0, 9, 42); persona(d, -4.6, 0, '#c43b2b'); persona(d, 4.4, 0, '#2f5fae'); persona(d, 6.0, 0, '#f2b33d', 0.7);
    VITRALLS.forEach(function (cx) { d.elipse(cx + (cx < 0 ? 3.6 : -3.6), 0.2, 2.6, 0.32, cx < 0 ? ['#3b7dc4', '#4f9a3c', '#5fa3da'] : ['#e8663a', '#f2b33d', '#d8452f'], { ts: 0.25, alfa: 0.42 }); });

    // 5 · las bóvedas (cortadas) y, debajo, el techo como es: un campo de hiperboloides como estrellas blancas, cada una con su
    // agujero, rayos dorados y puntas como hojas de palmera; sobre el crucero, el gran sol dorado lleno de luces
    [-1, 1].forEach(function (sg) {
      d.forma([[sg * 7.5, 45], [sg * 30, 45], [sg * 30, 49.5], [sg * 7.5, 49.5]], C.volta, { ts: 0.8 });
      d.forma([[sg * 7.5, 49.5], [sg * 30, 49.5], [sg * 30, 51], [sg * 7.5, 51]], C.corte, { ts: 0.8 });
      d.forma([[sg * 7.6, 39.8], [sg * 30, 39.8], [sg * 30, 45], [sg * 7.6, 45]], ['#d99a6a', '#e0a878', '#cf8f60', '#e6b080'], { ts: 0.6 });
      if (Z >= 16) for (k = 0; k < 6; k++) { var tcx = sg * (9.6 + k * 3.75); for (var ry = 0; ry < 14; ry++) { var ra = ry / 14 * 6.2832; d.linea([[tcx + Math.cos(ra) * 1.1, 43.3 + Math.sin(ra) * 0.6], [tcx + Math.cos(ra) * 2.6, 43.3 + Math.sin(ra) * 1.5]], 0.05, ry % 2 ? 'rgba(79,154,60,0.7)' : 'rgba(242,179,61,0.6)'); } }   // los rayos de vidrio verde y oro
      for (k = 0; k < 6; k++) hiper(d, sg * (9.6 + k * 3.75), 43.3, 1.95, 30 + k + (sg > 0 ? 10 : 0));
      for (k = 0; k < 5; k++) hiper(d, sg * (11.5 + k * 3.75), 40.8, 1.35, 50 + k + (sg > 0 ? 10 : 0));
      [11.25, 18.75, 26.25].forEach(function (cx) { oculo(d, sg * cx, 46.9, 2.6); });
      for (k = 0; k < 5; k++) { var px = sg * (11.5 + k * 3.75); d.forma([[px - 0.55, 44.6], [px + 0.55, 44.6], [px, 43.9]], ['#efe6d2', '#f4efe3'], { ts: 0.15 }); if (Z >= 16) d.elipse(px, 44.25, 0.1, 0.1, ['#fff8e6'], { ts: 0.05 }); }   // las pirámides con su luz
    });
    d.forma([[-7.5, 58], [7.5, 58], [7.5, 63], [-7.5, 63]], C.volta, { ts: 0.8 });
    d.forma([[-7.5, 63], [7.5, 63], [7.5, 64.6], [-7.5, 64.6]], C.corte, { ts: 0.8 });
    d.forma([[-7.5, 45], [-7.5, 58], [-6.6, 58], [-6.6, 45]], C.volta, { ts: 0.8 }); d.forma([[6.6, 45], [6.6, 58], [7.5, 58], [7.5, 45]], C.volta, { ts: 0.8 });
    d.forma([[-6.6, 50.6], [6.6, 50.6], [6.6, 58], [-6.6, 58]], ['#d99a6a', '#e0a878', '#cf8f60', '#e6b080'], { ts: 0.6 });
    sol(d, 0, 54.6, 6.3);

    // 6 · las columnas arbóreas: pórfido en el crucero (con los símbolos de los evangelistas), basalto y granito en la nave
    columna(d, -7.5, 2.1, 30, [[-6.2, 44, [[-7.2, 58], [-4.4, 58]]], [-11.4, 41, [[-12.8, 45], [-10, 45]]], [-3.6, 46, [[-2.6, 58], [-4.0, 58]]]], C.porfid, ['#f2b33d', '#fbf6ea', '#e9b64a']);
    columna(d, 7.5, 2.1, 30, [[6.2, 44, [[7.2, 58], [4.4, 58]]], [11.4, 41, [[12.8, 45], [10, 45]]], [3.6, 46, [[2.6, 58], [4.0, 58]]]], C.porfid, ['#f2b33d', '#fbf6ea', '#e9b64a']);
    [[-15, C.basalt, 1.9, 24], [15, C.basalt, 1.9, 24], [-22.5, C.granit, 1.7, 22], [22.5, C.granit, 1.7, 22]].forEach(function (c) {
      var cx = c[0]; columna(d, cx, c[2], c[3], [[cx, 36, [[cx - 1.2, 45], [cx + 1.2, 45]]], [cx - 3, 37, [[cx - 4, 45]]], [cx + 3, 37, [[cx + 4, 45]]]], c[1]);
    });

    // 7 · los muros cortados de las fachadas (por dentro), los tejados con sus lucernarios y las cestas de frutas
    [-1, 1].forEach(function (sg) {
      d.forma([[sg * 30, -4], [sg * 32.2, -4], [sg * 32.2, 51], [sg * 30, 51]], C.corte, { ts: 0.75 });
      d.forma([[sg * 7.5, 64.6], [sg * 7.5, 51], [sg * 32.2, 51], [sg * 32.2, 54], [sg * 16, 62]], ['#c9a46a', '#d6b47c', '#b8925e'], { vol: 0.15, ts: 0.85 });
      for (y = 52.2; y < 62; y += 1.4) d.linea([[sg * 31.6, 52 + (y - 52) * 0.15], [sg * (32.2 - (y - 51) * 1.6), y]], 0.06, 'rgba(120,80,40,0.3)');
      [12, 20, 27].forEach(function (cx) { var b = 51 + (32.2 - cx) * 0.35; d.forma([[sg * (cx - 1.6), b], [sg * (cx + 1.6), b], [sg * cx, b + 5.6]], ['#f2b33d', '#4f9a3c', '#f4efe3', '#c43b2b'], { ts: 0.32 }); d.elipse(sg * cx, b + 6, 0.5, 0.5, C.blanc, { ts: 0.2 }); });
      fruites(d, sg * 31.1, 54, 0.95); fruites(d, sg * 23.6, 57.4, 0.8);
    });

    // 8 · las torres del crucero: los cuatro evangelistas (135 m; dos delante, dos detrás) y la de Jesucristo (172,5 m)
    [[-9.2, 'angel'], [9.2, 'leo']].forEach(function (e) {   // las de detrás, un poco más claras
      d.forma(huso(e[0], 52, 8, 132 * 0.86 - 52, 0.08), ['#ece4d2', '#e2d6bc', '#f2ecdc'], { vol: 0.18, ts: 0.9 });
      evangelista(d, e[0], 115.6, e[1], 0.85);
    });
    [[-12.5, 'brau'], [12.5, 'aguila']].forEach(function (e) {
      x = e[0];
      d.forma(huso(x, 52, 9, 135 * 0.86 - 52, 0.08), PM.piedraC, { vol: 0.22, ruido: 0.03, ts: 0.85 });
      // terminada, sin nada de obra (Pau 31/10: solo la grúa): nervios verticales de piedra de arriba abajo y, entre ellos,
      // ventanitas apuntadas de luz blanca al tresbolillo; nada de anillos ni bandas horizontales
      for (var fv = -5; fv <= 5; fv += 2) d.linea([[x + fv * 4.3 * 0.19, 54], [x + fv * 0.55 * 0.19, 112]], 0.16, 'rgba(110,80,45,0.35)');   // los nervios
      for (y = 58, k = 0; y < 108; y += 5.2, k++) {
        var hw = (4.4 - (y - 52) * 0.06);
        for (fv = -2; fv <= 2; fv++) { if ((fv + k) % 2) continue; var wx = x + fv * hw * 0.38; d.forma(M.arco(wx - 0.3, wx + 0.3, y, y + 2.8, 'ojival'), ['#fbf6ea', '#e3eef0', '#cfe2f0'], { ts: 0.2 }); if (Z >= 32) d.linea([[wx, y], [wx, y + 3.1]], 0.04, 'rgba(70,45,25,0.6)'); }
      }
      d.elipse(x, 114, 3.2, 1.2, ['#fbf6ea', '#e9e4da'], { ts: 0.3 });
      evangelista(d, x, 116, e[1], 1);
    });
    d.forma(huso(0, 63, 15.5, 156 - 63, 0.1), C.jesus, { vol: 0.25, ts: 0.9 });
    for (y = 70; y < 142; y += 7) {   // las ventanas de vidrio en filas y los nervios verticales de cerámica blanca (como en las fotos)
      var bw2 = 6.4 - (y - 70) * 0.04;
      for (k = -3; k <= 3; k++) { if ((k + Math.round(y / 7)) % 2) continue; var vx2 = k * bw2 / 3.5; d.forma(M.arco(vx2 - 0.42, vx2 + 0.42, y, y + 4.2, 'ojival'), C.vidre, { ts: 0.22 }); if (Z >= 32) { d.linea([[vx2, y], [vx2, y + 4.8]], 0.035, 'rgba(255,255,255,0.8)'); d.linea([[vx2 - 0.42, y + 2.1], [vx2 + 0.42, y + 2.1]], 0.035, 'rgba(255,255,255,0.8)'); } }
    }
    if (Z >= 16) for (y = 66; y < 140; y += 3.2) { var tw2 = 7.2 * (1 - (y - 63) / 120); for (x = -tw2; x < tw2 - 1.6; x += 1.6) d.linea([[x, y], [x + 0.8, y + 1.6], [x + 1.6, y]], 0.04, 'rgba(150,140,125,0.4)'); }   // de cerca, las piezas de cerámica en triángulos
    d.forma(huso(0, 142, 6.2, 14, 0.25), ['#fbf6ea', '#cfe2f0', '#f2b33d', '#ffffff'], { ts: 0.3 });   // la linterna de vidrio y oro bajo la cruz
    // la cruz: cuatro brazos de vidrio y cerámica blanca (vista de frente: el brazo de delante es el cuadrado del centro)
    d.forma([[-1.3, 155.5], [1.3, 155.5], [1.3, 172.5], [-1.3, 172.5]], ['#fbf6ea', '#ffffff', '#cfe2f0', '#e3eef0'], { ts: 0.28, vol: 0.2 });
    d.forma([[-6.75, 163.2], [6.75, 163.2], [6.75, 166.2], [-6.75, 166.2]], ['#fbf6ea', '#ffffff', '#cfe2f0', '#e3eef0'], { ts: 0.28, vol: 0.2 });
    d.rect(-1.9, 162.8, 1.9, 166.6, ['#e3eef0', '#cfe2f0', '#ffffff'], { ts: 0.22 }); d.elipse(0, 164.7, 1.1, 1.1, ['#f2b33d', '#fbf1d0'], { ts: 0.2 });
    // la cruz de verdad es de cerámica blanca esmaltada con vidrio, de brazos facetados como un diamante: de cerca, sus facetas y las juntas
    if (Z >= 16) {
      [[-1.3, 155.5, 1.3, 162.8], [-1.3, 166.6, 1.3, 172.5], [-6.75, 163.2, -1.9, 166.2], [1.9, 163.2, 6.75, 166.2]].forEach(function (b) {
        var cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
        d.forma([[b[0], b[1]], [cx, cy], [b[0], b[3]]], ['#e3eef0', '#cfe2f0'], { ts: 0.2, alfa: 0.7 }); d.forma([[b[2], b[1]], [cx, cy], [b[2], b[3]]], ['#ffffff', '#fbf8f0'], { ts: 0.2, alfa: 0.8 });
        d.linea([[b[0], b[1]], [b[2], b[3]]], 0.04, 'rgba(150,170,185,0.6)'); d.linea([[b[0], b[3]], [b[2], b[1]]], 0.04, 'rgba(150,170,185,0.6)');
      });
    }
    if (Z >= 64) for (y = 155.8; y < 172.4; y += 0.6) d.linea([[-1.3, y], [1.3, y]], 0.02, 'rgba(150,170,185,0.45)');

    // 9 · la fachada del Nacimiento (izquierda): dos campanarios de perfil, la piedra que gotea, el portal de la Caridad
    campanar(d, -35.5, 9.5, 107, 40, true, 1); campanar(d, -40, 9, 98, 36, false, 2);
    var nac = [[-32.2, -4], [-44, -4], [-44.6, 3], [-43, 6], [-45.4, 12], [-43.4, 18], [-45.6, 24], [-43, 31], [-44.8, 37], [-42, 44], [-43.4, 50], [-39.5, 56], [-36, 60], [-32.2, 58]];
    d.forma(nac, null, { banda: C.naixement, vol: 0.14, ruido: 0.04, ts: 0.8 });
    // las repisas con sus grupos: pastores con el buey y la mula, los Reyes Magos, profetas; y grutas en sombra
    [[2.5, -43.2, 3], [15.5, -42.6, 2], [21.8, -43.6, 3], [33.6, -42.8, 2]].forEach(function (rp, n) {
      d.forma([[rp[1] - 1.6, rp[0] - 0.5], [-34.6, rp[0] - 0.5], [-34.6, rp[0]], [rp[1] - 2.2, rp[0]]], ['#c9a46a', '#d6b47c', '#b8925e'], { ts: 0.3, vol: 0.2 });
      d.elipse((rp[1] - 34.6) / 2 + 0.4, rp[0] + 2.6, 2.4, 2.2, ['#4a3222', '#5a3d26', '#3d281b'], { ts: 0.3 });   // la gruta detrás del grupo
      for (var g = 0; g < rp[2]; g++) escultura(d, rp[1] + 1.2 + g * 1.7, rp[0], 2.4 + h(g, n, 3) * 0.7, ['#c9a46a', '#d6b47c', '#e2cfa4', '#b8925e'], false);
      if (n === 0) { d.elipse(-37.4, rp[0] + 0.9, 1.3, 0.75, ['#8f6a42', '#a07a4c'], { ts: 0.2, vol: 0.3 }); d.elipse(-36.2, rp[0] + 1.3, 0.45, 0.4, ['#8f6a42'], { ts: 0.15 }); d.elipse(-35.4, rp[0] + 0.9, 1.1, 0.7, ['#6f6456', '#7d7162'], { ts: 0.2 }); }   // el buey y la mula
      if (n === 2) [0, 1, 2].forEach(function (g) { d.elipse(rp[1] + 1.2 + g * 1.7, rp[0] + 3.3, 0.4, 0.2, PM.oro, { ts: 0.12 }); });   // las coronas de los Reyes
    });
    for (k = 0; k < 12; k++) { var gy = 3 + k * 4.4, gx = -43.4 + h(k, 1, 9) * 3.6; d.forma([[gx - 1.3, gy], [gx + 1.3, gy + 0.4], [gx + 0.8, gy + 3.2], [gx, gy + 4.2], [gx - 0.9, gy + 2.8]], ['#b08a58', '#c9a46a', '#a07a4c', '#d6b47c'], { vol: 0.32, ts: 0.3 }); }   // la piedra que «se derrite»
    for (k = 0; k < 16; k++) { var iy = [33, 43.5][k % 2], ix = -44.4 + k * 0.62; d.forma([[ix - 0.24, iy], [ix + 0.24, iy], [ix, iy - 1.1 - h(k, 4, 4) * 1.4]], ['#f4efe3', '#e3eef0', '#fbf8f0'], { ts: 0.15 }); }   // los carámbanos (la nieve de Belén)
    [[-34.4, 20], [-35.8, 27], [-34, 35], [-36.4, 46]].forEach(function (p) { d.elipse(p[0], p[1], 1.6, 1.1, ['#5f8f4a', '#4f7f3c', '#6f9f55'], { ts: 0.25, vol: 0.2 }); d.elipse(p[0] + 0.8, p[1] + 0.6, 0.4, 0.4, ['#c43b2b', '#f2b33d'], { ts: 0.12 }); });   // plantas y flores talladas
    angel(d, -45.4, 14.4, 1, -1); angel(d, -45.8, 26.2, 1, -1); angel(d, -44.4, 38.6, 0.9, -1);   // los ángeles músicos (Etsuro Sotoo)
    escultura(d, -42.4, 10.6, 2.6, ['#c9a46a', '#d6b47c'], false); escultura(d, -40.8, 10.6, 2.9, ['#d6b47c', '#c9a46a'], false); d.elipse(-41.6, 11.2, 0.6, 0.3, ['#f4efe3'], { ts: 0.15 });   // María, José y el Niño
    d.forma([[-44.8, 8.6], [-32.2, 8.6], [-36.2, 15], [-38.6, 22], [-40.4, 15]], ['#a07a4c', '#b08a58', '#8f6a42'], { ts: 0.35, vol: 0.25, ruido: 0.1 });   // el gablete apuntado sobre el portal
    for (k = 0; k < 11; k++) { var gx2 = -44 + k * 1.1, gy3 = 8.6 + Math.max(0, 6 - Math.abs(gx2 + 38.6) * 1.1); d.forma([[gx2 - 0.3, gy3], [gx2 + 0.3, gy3], [gx2, gy3 - 0.9 - h(k, 9, 9) * 1.2]], ['#c9a46a', '#d6b47c'], { ts: 0.15 }); }   // los carámbanos de piedra
    d.forma(M.arco(-43.4, -33.6, -4, 8.6, 'ojival'), ['#3d281b', '#4a3222'], { ts: 0.4 });   // el portal de la Caridad, atravesado
    // dentro del portal: arriba el vitral de cielo azul con estrellas; abajo, sobre su repisa, la Sagrada Familia en el pesebre
    d.forma(M.arco(-41.6, -35.4, 6.4, 10.2, 'ojival'), ['#1f3f8f', '#2a6a8a', '#2f5fae', '#2f8a7a'], { ts: 0.35 });
    if (Z >= 16) for (k = 0; k < 14; k++) d.elipse(-41 + h(k, 6, 6) * 5, 7 + h(k, 7, 6) * 6.4, 0.12, 0.12, ['#fbf1d0', '#ffffff'], { ts: 0.05 });
    d.rect(-42.4, 2.6, -34.6, 3.2, ['#c9a46a', '#d6b47c'], { ts: 0.25 });
    escultura(d, -40.2, 3.2, 3.0, ['#e2cfa4', '#d8c194', '#ecdcb6'], false); escultura(d, -36.6, 3.2, 3.4, ['#e2cfa4', '#d8c194', '#ecdcb6'], false);   // María y José
    d.rect(-39.2, 3.2, -37.6, 3.9, ['#a07a4c', '#8f6a42'], { ts: 0.12 }); d.elipse(-38.4, 4.1, 0.55, 0.3, ['#fbf6ea', '#f4efe3'], { ts: 0.1 }); d.elipse(-38.0, 4.15, 0.16, 0.16, C.pell, { ts: 0.05 });   // el pesebre con el Niño
    if (Z >= 32) { d.elipse(-38.3, 5.4, 0.9, 0.25, ['#f2b33d', '#f4d27a'], { ts: 0.08, alfa: 0.6 }); }
    d.forma([[-42.8, 3.2], [-41.6, 3.2], [-42.2, 2.0]], ['#c9a46a'], { ts: 0.15 }); d.forma([[-35.4, 3.2], [-34.2, 3.2], [-34.8, 2.0]], ['#c9a46a'], { ts: 0.15 });
    [-43.9, -35.0].forEach(function (cx) {   // las columnas en espiral, como troncos de palmera, con la tortuga debajo
      d.rect(cx - 0.45, -2.6, cx + 0.45, 8.6, ['#b08a58', '#c9a46a', '#a07a4c'], { ts: 0.25, vol: 0.35 });
      for (var yy = -2.4; yy < 8.6; yy += 0.5) d.linea([[cx - 0.45, yy], [cx + 0.45, yy + 0.35]], 0.06, 'rgba(70,45,25,0.6)');
      d.elipse(cx, 8.9, 0.9, 0.5, ['#5f8f4a', '#6f9f55', '#4f7f3c'], { ts: 0.15 });   // el capitel de hojas de palmera
    });
    for (k = 0; k < 40; k++) {   // el follaje tallado: hojas, flores y nidos por toda la fachada
      var fx = -44.6 + h(k, 1, 31) * 11.6, fy = 9 + h(k, 2, 31) * 46; if (fx > -40.5 && fx < -36.5 && fy > 44 || fx > -43.6 && fx < -33.4 && fy < 22) continue;
      d.elipse(fx, fy, 0.5 + h(k, 3, 31) * 0.5, 0.35 + h(k, 4, 31) * 0.3, ['#b08a58', '#c9a46a', '#a07a4c', '#d6b47c'], { ts: 0.2, vol: 0.4 });
      if (Z >= 32) d.linea([[fx - 0.3, fy], [fx + 0.3, fy + 0.15]], 0.03, 'rgba(70,45,25,0.5)');
    }
    d.forma([[-34.2, -4], [-32.6, -4], [-32.6, 9.6], [-34.2, 9.6]], C.bronzeV, { ts: 0.2 });   // la puerta de bronce de Sotoo: hojas de hiedra e insectos
    for (k = 0; k < 9; k++) { d.elipse(-33.4 + (k % 2 ? 0.35 : -0.35), -3.2 + k * 1.4, 0.34, 0.26, ['#6aa84a', '#4f9a3c', '#7ab05a'], { ts: 0.1 }); if (k % 3 === 1) d.elipse(-33.2, -2.6 + k * 1.4, 0.12, 0.1, ['#c43b2b', '#f2b33d', '#2f5fae'][k % 3], { ts: 0.08 }); }
    d.forma([[-41.4, 46], [-36.6, 46], [-37.4, 54], [-38.2, 62], [-38.8, 68], [-39.2, 72.4], [-39.6, 68], [-40.2, 62], [-41, 54]], PM['ciprés'], { vol: 0.25, ts: 0.3, modo: 'rayas' });   // el ciprés de cerámica verde (el árbol de la vida)
    [[-40, 52], [-38.4, 55], [-39.4, 59.4], [-38.8, 62.6], [-37.6, 50], [-40.6, 57.2], [-38.6, 66], [-39.6, 69.4], [-37.2, 58.2], [-40.4, 48.6]].forEach(function (p) { d.elipse(p[0], p[1], 0.62, 0.42, C.blanc, { ts: 0.16 }); d.forma([[p[0] - 0.62, p[1]], [p[0] - 1.2, p[1] + 0.5], [p[0] - 0.3, p[1] + 0.3]], C.blanc, { ts: 0.12 }); if (Z >= 128) { d.linea([[p[0] + 0.38, p[1] + 0.08], [p[0] + 0.381, p[1] + 0.08]], 0.05, '#1f1a15'); d.forma([[p[0] + 0.58, p[1] + 0.06], [p[0] + 0.76, p[1]], [p[0] + 0.58, p[1] - 0.04]], ['#e8663a'], { ts: 0.02 }); } });   // las palomas blancas
    d.linea([[-39.2, 72.4], [-39.2, 75.4]], 0.3, '#f4d27a'); d.linea([[-40.2, 74.2], [-38.2, 74.2]], 0.26, '#f4d27a'); d.elipse(-39.2, 75.8, 0.4, 0.3, C.blanc, { ts: 0.12 });   // la cruz con la paloma sobre el ciprés
    d.elipse(-39, 41.6, 2.4, 1.7, PM.oro, { ts: 0.3, modo: 'radial' }); d.elipse(-39, 41.6, 0.9, 0.7, ['#fbf1d0', '#ffffff'], { ts: 0.15 });   // la estrella de Belén
    d.elipse(-43.6, -2.8, 1.9, 1.1, ['#6f8f5a', '#5f7f4a', '#7f9f6a'], { ts: 0.22, vol: 0.3 }); d.elipse(-45.6, -2.7, 0.5, 0.36, ['#7f9f6a'], { ts: 0.12 });   // la tortuga de tierra bajo la columna (lado montaña)
    d.linea([[-43.6, -1.7], [-43.6, 4.2]], 0.7, 'rgba(160,122,76,0.95)');
    d.forma([[-45.9, 1.2], [-44.6, 1.6], [-44.2, 2.2], [-45.4, 2.0]], ['#5f9a45', '#4f8a3c'], { ts: 0.1 }); d.linea(curva([-45.9, 1.2], [-46.6, 0.8], [-46.2, 0.4], 4), 0.08, '#4f8a3c');   // el camaleón de la esquina
    if (Z >= 16) {   // de cerca: las ocas al pie, caracoles en la piedra, los rayos de la estrella y un ángel más arriba
      [[-38.8, -4], [-37.6, -4], [-36.6, -4]].forEach(function (g) { d.elipse(g[0], g[1] + 0.35, 0.45, 0.3, C.blanc, { ts: 0.1 }); d.linea([[g[0] + 0.35, g[1] + 0.5], [g[0] + 0.55, g[1] + 1.0]], 0.1, '#fbf8f0'); d.elipse(g[0] + 0.58, g[1] + 1.05, 0.12, 0.1, C.blanc, { ts: 0.06 }); d.linea([[g[0] + 0.66, g[1] + 1.05], [g[0] + 0.86, g[1] + 1.0]], 0.05, '#e8663a'); });
      [[-42.6, 8.4], [-36.2, 31.2], [-41.6, 47.4]].forEach(function (c) { d.elipse(c[0], c[1], 0.32, 0.28, ['#b0a080', '#c9b994'], { ts: 0.08 }); d.linea(M.elipsePts(c[0], c[1], 0.18, 0.16, 0, 9, 12).map(function (q, i) { var f3 = 1 - i / 12; return [c[0] + (q[0] - c[0]) * f3, c[1] + (q[1] - c[1]) * f3]; }), 0.03, 'rgba(70,45,25,0.8)'); });
      for (k = 0; k < 12; k++) { var ae = k / 12 * 6.2832; d.linea([[-39 + Math.cos(ae) * 1.2, 41.6 + Math.sin(ae) * 0.9], [-39 + Math.cos(ae) * 3.2, 41.6 + Math.sin(ae) * 2.4]], 0.06, 'rgba(242,179,61,0.8)'); }
      angel(d, -44.8, 51.2, 0.8, -1);
    }
    if (Z >= 32) {   // en la puerta de Sotoo, los insectos: mariquitas, un escarabajo y una libélula
      [[-33.6, -1.4, '#c43b2b'], [-33.0, 1.8, '#2f5fae'], [-33.5, 4.6, '#f2b33d'], [-33.1, 7.4, '#c43b2b']].forEach(function (b) { d.elipse(b[0], b[1], 0.1, 0.13, [b[2]], { ts: 0.04 }); d.linea([[b[0], b[1] - 0.13], [b[0], b[1] + 0.13]], 0.015, 'rgba(20,17,15,0.8)'); });
      d.linea([[-33.6, 3.2], [-33.0, 3.25]], 0.03, 'rgba(60,110,150,0.9)'); d.elipse(-33.3, 3.34, 0.22, 0.05, ['#cfe2f0'], { ts: 0.04 }); d.elipse(-33.3, 3.12, 0.22, 0.05, ['#cfe2f0'], { ts: 0.04 });
      if (Z >= 128) [[-33.6, -1.4], [-33.0, 1.8], [-33.5, 4.6], [-33.1, 7.4]].forEach(function (b) {   // muy de cerca: seis patas, dos antenas y los puntos de las mariquitas
        [-1, 1].forEach(function (sg) { for (var pt = -1; pt <= 1; pt++) d.linea([[b[0] + sg * 0.06, b[1] + pt * 0.06], [b[0] + sg * 0.15, b[1] + pt * 0.08 - 0.03]], 0.008, 'rgba(20,17,15,0.85)'); d.linea([[b[0] + sg * 0.03, b[1] + 0.13], [b[0] + sg * 0.08, b[1] + 0.21]], 0.006, 'rgba(20,17,15,0.85)'); });
        [[-0.04, 0.04], [0.04, 0.04], [-0.04, -0.04], [0.04, -0.04]].forEach(function (q) { d.linea([[b[0] + q[0], b[1] + q[1]], [b[0] + q[0] + 0.001, b[1] + q[1]]], 0.025, 'rgba(20,17,15,0.8)'); });
      });
    }

    // 10 · la fachada de la Pasión (derecha): desnuda y angulosa, con las columnas inclinadas como huesos
    campanar(d, 35.5, 9.5, 107, 40, true, 3); campanar(d, 40, 9, 98, 36, false, 4);
    d.forma([[32.2, -4], [44, -4], [44, 22], [46, 24], [46, 27], [42, 30], [43.4, 40], [40.6, 48], [42.4, 54], [36, 58], [32.2, 57]], C.passio, { vol: 0.15, ts: 0.8 });
    d.forma([[33, -4], [44, -4], [44, 21], [33, 21]], ['#5a4a3a', '#4a3a2c', '#52422f'], { ts: 0.75 });   // el pórtico, atravesado
    d.rect(33.6, -4, 36.4, 8.4, C.passio, { ts: 0.3, vol: 0.2 });   // el pilar de dentro del portal, donde está el cuadrado
    d.forma([[32.2, -4], [33.6, -4], [33.6, 10.6], [32.2, 10.6]], C.bronze, { ts: 0.18 });   // la puerta de bronce con el texto del Evangelio
    if (Z < 32) for (y = -3.4; y < 10.2; y += 0.42) d.linea([[32.4, y], [33.4, y]], 0.07, 'rgba(200,190,170,0.5)');
    escultura(d, 37.4, -4, 3.4, C.subirachs, true); escultura(d, 38.6, -4, 3.2, C.subirachs, true);   // el beso de Judas, con la serpiente
    d.linea(curva([36.6, -3.2], [37.2, -2.2], [36.8, -1.2], 5), 0.16, 'rgba(70,90,60,0.9)');
    d.rect(40.4, -4, 41, 0.8, C.passio, { ts: 0.15 }); escultura(d, 40.7, -4, 3, C.subirachs, true);   // la flagelación: Cristo atado a la columna
    d.forma([[33.2, 29.4], [44.6, 29.4], [44.6, 30.2], [33.2, 30.2]], ['#a8987a', '#9f8f72'], { ts: 0.25 }); d.forma([[33.6, 39.6], [43.2, 39.6], [43.2, 40.4], [33.6, 40.4]], ['#a8987a', '#9f8f72'], { ts: 0.25 });   // las repisas en ese
    [[34.4, 30.2, 3.8, 1], [36.8, 30.2, 4.2, 0], [39.4, 30.2, 3.9, 1], [42, 30.2, 3.8, 1], [35, 40.4, 3.8, 0], [37.8, 40.4, 4, 1], [40.6, 40.4, 3.6, 1]].forEach(function (s) {   // los soldados romanos: cascos como las chimeneas de La Pedrera
      escultura(d, s[0], s[1], s[2], C.subirachs, true);
      if (s[3]) {   // el casco: un cilindro con su corona, como las chimeneas de La Pedrera
        var hx = s[0] + 0.02, hy = s[1] + s[2], hw2 = s[2] * 0.12;
        d.forma([[hx - hw2, hy - 0.1], [hx + hw2, hy - 0.1], [hx + hw2 * 0.85, hy + s[2] * 0.2], [hx - hw2 * 0.85, hy + s[2] * 0.2]], ['#8f7f62', '#857559'], { ts: 0.12, vol: 0.4 });
        d.forma([[hx - hw2 * 1.35, hy + s[2] * 0.2], [hx + hw2 * 1.35, hy + s[2] * 0.2], [hx + hw2, hy + s[2] * 0.3], [hx - hw2, hy + s[2] * 0.3]], ['#a8987a', '#9f8f72'], { ts: 0.1 });
        d.linea([[hx, hy + s[2] * 0.3], [hx, hy + s[2] * 0.4]], 0.08, 'rgba(90,80,60,0.9)'); d.linea([[hx - hw2 * 0.6, hy + s[2] * 0.36], [hx + hw2 * 0.6, hy + s[2] * 0.36]], 0.08, 'rgba(90,80,60,0.9)');
      }
    });
    d.rect(41.6, 36, 43, 37.6, C.blanc, { ts: 0.12 }); d.elipse(42.3, 36.8, 0.36, 0.5, ['#c9b994'], { ts: 0.1 });   // el velo de la Verónica, con el rostro
    d.forma([[33, 21], [46, 21], [46, 24], [33, 24]], ['#bfb091', '#cdbf9f'], { ts: 0.4 });   // el dintel
    for (k = 0; k < 9; k++) { x = 33.6 + k * 1.4; d.forma([[x - 0.4, 24], [x + 0.4, 24], [x + 0.3, 27.2], [x + 0.55, 27.8], [x, 28.4], [x - 0.55, 27.8], [x - 0.3, 27.2]], ['#e6dcc7', '#efe6d2', '#d9cdb4'], { ts: 0.15, vol: 0.3 }); }   // el frontón de huesos
    [[34.8, 45.6], [38.4, 46.6], [42, 47.4]].forEach(function (c) {   // los huesos: columnas inclinadas con sus nudos (por delante)
      rama(d, c[0] - 1, -4, c[1], 22, 1.5, 1.2, ['#e6dcc7', '#d9cdb4', '#efe6d2'], { vol: 0.32, ts: 0.38 });
      d.elipse(c[0] - 1 + (c[1] - c[0] + 1) * 0.5, 9, 1.1, 0.8, ['#efe6d2', '#e6dcc7'], { ts: 0.28 });
    });
    d.linea([[39, 48], [39, 56]], 0.5, '#8a7a5a'); d.linea([[37.2, 54.2], [40.8, 54.2]], 0.42, '#8a7a5a');   // la crucifixión en lo alto
    d.forma([[38.6, 49.4], [39.4, 49.4], [39.7, 52.6], [40.6, 54.0], [39.1, 53.4], [37.4, 54.0], [38.4, 52.6]], C.subirachs, { ts: 0.15, vol: 0.4 });
    d.rect(36.2, 61, 41.8, 62.2, C.passio, { ts: 0.3 }); escultura(d, 39, 62.2, 3.2, PM.oro, false); d.elipse(39, 66, 1.4, 1.4, ['#f4d27a', '#fbf1d0'], { ts: 0.2, alfa: 0.6 });   // el Cristo resucitado, dorado, en el puente entre las torres
    // el cuadrado mágico, en el pilar de dentro del portal, junto al beso de Judas
    d.rect(Q.x - 0.25, Q.y - 0.25, Q.x + Q.t + 0.25, Q.y + Q.t + 0.25, ['#bfb091', '#b0a07e'], { ts: 0.2 });
    for (var f = 0; f < 4; f++) for (var c = 0; c < 4; c++) {
      var cx0 = Q.x + c * Q.t / 4, cy0 = Q.y + (3 - f) * Q.t / 4;
      d.rect(cx0 + 0.02, cy0 + 0.02, cx0 + Q.t / 4 - 0.02, cy0 + Q.t / 4 - 0.02, ['#e6dcc7', '#ddd1b6', '#ece4d2'], { ts: 0.14 });
      d.texto(String(CUADRADO[f][c]), cx0 + Q.t / 8, cy0 + Q.t / 8, Q.t * 0.12, 'rgba(70,45,25,0.95)');
    }
    persona(d, 35.0, -4, '#4f9a3c'); persona(d, 42.4, -4, '#2f5fae'); persona(d, 39.6, -4, '#f2b33d', 0.7);
    if (Z >= 16) {   // de cerca: el gallo de la negación de Pedro, los dados de los soldados y Gaudí tomando notas (Subirachs lo puso junto a la Verónica)
      d.rect(42.2, 21, 42.6, 24.2, C.passio, { ts: 0.08 }); d.forma([[42.0, 24.2], [42.9, 24.2], [43.1, 24.9], [42.7, 25.3], [42.2, 25.0]], ['#9f8f72', '#857559'], { ts: 0.06 }); d.forma([[42.7, 25.3], [42.9, 25.7], [43.1, 25.3]], ['#c43b2b'], { ts: 0.04 });
      [[38.0, 30.25], [38.5, 30.25], [38.25, 30.7]].forEach(function (p) { d.rect(p[0] - 0.2, p[1], p[0] + 0.2, p[1] + 0.4, C.blanc, { ts: 0.05 }); });
      escultura(d, 43.9, 30.2, 3.6, C.subirachs, true); d.rect(44.3, 32.3, 44.9, 32.9, C.blanc, { ts: 0.05 }); d.elipse(43.95, 32.9, 0.3, 0.36, ['#7a6a52'], { ts: 0.06 });
    }
    if (Z >= 32) {   // la puerta del Evangelio: el texto de la Passió en catalán, en relieve, con JESÚS y PILAT destacados en oro
      var LIN = ['ELS SOLDATS', 'TRENAREN UNA', 'CORONA', "D'ESPINES", 'I LI LA', 'POSAREN AL', 'CAP', 'JESÚS', 'PILAT', 'AUTORITZÀ', 'JOSEP', "D'ARIMATEA", 'TOT AIXÒ', 'VA SUCCEIR', 'PER COMPLIR', "L'ESCRIPTURA", 'NO LI HAN', 'DE TRENCAR', 'CAP OS', 'EL COSTAT', 'EN SORTÍ', 'SANG I AIGUA', 'TOT ESTÀ', 'ACOMPLERT', 'JESÚS', 'INCLINÀ EL', 'CAP', 'I LLIURÀ', "L'ESPERIT", 'MARIA'];
      LIN.forEach(function (l, i) { var dest = l === 'JESÚS' || l === 'PILAT'; d.texto(l, 32.9, 10.2 - i * 0.45, dest ? 0.2 : 0.11, dest ? 'rgba(242,179,61,0.98)' : 'rgba(236,228,210,0.95)'); });
    }   // el texto del Evangelio en la puerta

    // 11 · las escaleras de las fachadas
    for (k = 0; k < 3; k++) { d.rect(-46 + k * 0.6, -4.6 + k * 0.2, -32.2, -4.4 + k * 0.2, PM.piedraC, { ts: 0.25 }); d.rect(32.2, -4.6 + k * 0.2, 46.5 - k * 0.6, -4.4 + k * 0.2, PM.piedraC, { ts: 0.25 }); }
  }

  /* ---------- el mundo para el motor ---------- */
  var S0 = 4, T = 256, NMAX = 7, ORDENES = {};
  function escala(L) { return S0 * Math.pow(2, L); }
  function lado(L) { return T / escala(L); }
  function pintarTesela(L, i, j) {
    var s = escala(L), w = lado(L), X0 = i * w, Y0 = j * w, k = s * DPR;
    var c = document.createElement('canvas'); c.width = c.height = Math.round(T * DPR);
    var x = c.getContext('2d');
    x.fillStyle = x.createPattern(M.grano, 'repeat'); x.fillRect(0, 0, c.width, c.height);
    x.setTransform(k, 0, 0, k, -X0 * k, -Y0 * k);
    // teselas de unos 7 px de pantalla en cada nivel: al acercarse aparece más detalle (como en el mapa), hasta 512 px por metro
    M.pintarDibujo(x, dibujo, 0, 0, 1, s, 7 / s, 0.9 / s, 0.8 / s, 4242, [X0, Y0, X0 + w, Y0 + w], ORDENES);
    return { c: c, uso: 0 };
  }

  // la zona del corte en un punto (para el instrumento, en vez del barrio)
  function zona(X, Y) {
    var x = X, y = -Y, ax = Math.abs(x);
    if (y < -4) return x > 18 && x < 43 && y > -16 ? 'Museu' : ax < 17.5 && y > -16 ? 'Cripta' : x < -50 && y > -21 ? 'Metro' : 'Fonaments';
    if (ax < 8 && y > 64) return 'Torre de Jesucrist';
    if (ax > 6 && ax < 19 && y > 52 && y < 140) return 'Torres dels Evangelistes';
    if (x < -32 && y < 120) return y > 60 ? 'Campanars del Naixement' : 'Façana del Naixement';
    if (x > 32 && y < 120) return y > 60 ? 'Campanars de la Passió' : 'Façana de la Passió';
    if (ax < 7.5 && y < 64) return y < 34 ? 'Absis' : 'Creuer';
    if (ax < 32.2 && y < 52) return y > 14 && y < 18 && ax > 15 ? 'Tribunes del cor' : ax > 8 && y < 40 ? 'Vitralls' : 'Nau del creuer';
    return y > 100 ? 'Cel de Barcelona' : 'Teulades';
  }

  BC.sagrada = {
    LIM: [-230, -200, 230, 30], S0: S0, T: T, NMAX: NMAX, SMAX: 512, FONDO: '#e6dcc7',
    inicio: { x: 0, y: -85 },   // de entrada, la basílica entera en la pantalla
    escala: escala, lado: lado, pintarTesela: pintarTesela, zona: zona,
    ponerDpr: function (d) { DPR = d; },
    // los sitios de los secretos, en el plano del motor (x, -y)
    SITIOS: {
      cuadrado: [Q.x + Q.t / 2, -(Q.y + Q.t / 2)], ladoCuadrado: Q.t, cuadradoNums: CUADRADO, Q: Q,
      maqueta: [MAQ.x, -(MAQ.y - 2.6)], tomba: [TOMBA.x, -(TOMBA.y + 0.6)],
      vitralls: VITRALLS, cim: [0, -172.5], creu: [0, -164.8]
    }
  };
})();
