/* Barcelona Incognita · el mosaiquista (BC.mosaico)
   Las animaciones de los secretos se hacen con el mismo lenguaje que el mapa: teselas de cerámica con su esmalte,
   su canto y su sombra, que se van colocando como si alguien las pusiera a mano. Nada de líneas o puntos planos.
     tesela(ctx, x, y, tam, color, u, semilla, op)   una pieza; u = 0 … 1 es su entrada (crece, rebota y se asienta)
     cadena(ctx, ptsPlano, f, op)                   un trazo hecho de teselas que se colocan una tras otra (f = 0 … 1)
     texto(txt, alto, tam)  → plantilla             un texto troceado en teselas (se calcula una vez)
     pintarTexto(ctx, plantilla, x, y, f, op)        lo monta de izquierda a derecha; op.salida (0 … 1) lo deshace cayendo
     confeti(n, paletas, semilla) / pintarConfeti(ctx, lista, x, y, t, esc)   trozos de cerámica que saltan y caen girando
     halo(ctx, x, y, r, color, alfa)                 una luz cálida y suave (sin destellos) */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa;
  var MO = BC.mosaico = {
    ORO: ['#f2b33d', '#f4d27a', '#e9b64a', '#d9a03a', '#fbe6a8'],
    VIDRIO: ['#cfe8f4', '#9fd0ea', '#f4fbfd', '#7fbfe0', '#b8dcef'],
    AZULGRANA: ['#a50044', '#004d98', '#edbb00', '#8a0039', '#0a5cb3']
  };

  // la forma: un cuadrilátero algo irregular, siempre el mismo para la misma semilla
  function quad(cx, cy, tam, ang, sem, esc) {
    var h = M.h, pts = [];
    for (var k = 0; k < 4; k++) {
      var a = ang + k * Math.PI / 2 + Math.PI / 4 + (h(sem, k, 1) - 0.5) * 0.35, r = tam * 0.7 * (0.86 + h(sem, k, 2) * 0.2) * esc;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return pts;
  }
  // la entrada: crece hasta 1,15 y se asienta en 1
  function rebote(u) { if (u <= 0) return 0; if (u >= 1) return 1; return u < 0.6 ? U.suave(u / 0.6) * 1.15 : 1.15 - 0.15 * U.suave((u - 0.6) / 0.4); }
  MO.rebote = rebote;

  MO.tesela = function (ctx, x, y, tam, col, u, sem, op) {
    op = op || {};
    var e = rebote(u) * (op.esc || 1); if (e <= 0.02) return;
    var ang = (op.ang || 0) + (1 - Math.min(1, u)) * 0.9 * (M.h(sem, 3, 4) - 0.5), q = quad(x, y, tam, ang, sem, e);
    var a = (op.alfa == null ? 1 : op.alfa) * Math.min(1, u * 2.5); if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    if (op.sombra !== false) {   // la sombra que hace la pieza sobre el mapa (luz de arriba a la izquierda)
      var d = Math.max(1, tam * 0.16) * (op.alto == null ? 1 : op.alto);
      ctx.fillStyle = 'rgba(20,17,15,0.42)'; ctx.beginPath(); q.forEach(function (p, i) { i ? ctx.lineTo(p[0] + d, p[1] + d * 1.3) : ctx.moveTo(p[0] + d, p[1] + d * 1.3); }); ctx.closePath(); ctx.fill();
    }
    M.pieza(ctx, q, M.tono(col, 0.94 + M.h(sem, 5, 6) * 0.12), Math.max(0.35, tam * 0.06), Math.max(0.8, tam * 0.1));
    ctx.restore();
  };

  // una cadena de teselas a lo largo de un recorrido del plano girado (se recalcula en pantalla cada fotograma)
  MO.cadena = function (ctx, pts, f, op) {
    op = op || {}; if (f <= 0 || pts.length < 2) return;
    var E = BC.motor, p = pts.map(function (q) { return E.aPantalla(q[0], q[1]); }), tam = op.tam || 8, paso = tam * 1.18, pal = op.paleta || MO.ORO;
    var segs = [], L = 0;
    for (var i = 1; i < p.length; i++) { var d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); segs.push([L, d, i]); L += d; }
    var n = Math.max(1, Math.floor(L / paso)), dur = op.dur || 0.12, sem0 = op.semilla || 7;
    if (op.junta !== false) {   // la junta de cemento debajo, que asienta la cadena sobre el mapa
      var hasta = L * U.clamp(f / (1 - dur), 0, 1);
      ctx.save(); ctx.globalAlpha = (op.alfa == null ? 1 : op.alfa) * 0.85; ctx.strokeStyle = 'rgba(20,17,15,0.55)'; ctx.lineWidth = tam * 1.45; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); var resto = hasta;
      for (i = 0; i < segs.length && resto > 0; i++) { var s = segs[i], a0 = p[s[2] - 1], b0 = p[s[2]]; if (s[1] <= resto) { ctx.lineTo(b0[0], b0[1]); resto -= s[1]; } else { var k0 = resto / s[1]; ctx.lineTo(a0[0] + (b0[0] - a0[0]) * k0, a0[1] + (b0[1] - a0[1]) * k0); resto = 0; } }
      ctx.stroke(); ctx.restore();
    }
    var j = 0;
    for (var k = 0; k <= n; k++) {
      var dist = k * paso; while (j < segs.length - 1 && dist > segs[j][0] + segs[j][1]) j++;
      var sg = segs[j], a = p[sg[2] - 1], b = p[sg[2]], u0 = sg[1] ? (dist - sg[0]) / sg[1] : 0;
      var x = a[0] + (b[0] - a[0]) * u0, y = a[1] + (b[1] - a[1]) * u0, ini = k / n * (1 - dur);
      MO.tesela(ctx, x, y, tam, pal[Math.floor(M.h(k, sem0, 9) * pal.length)], (f - ini) / dur, sem0 * 131 + k, { ang: Math.atan2(b[1] - a[1], b[0] - a[0]), alfa: op.alfa });
    }
  };

  // un texto troceado en teselas: se dibuja en un lienzo aparte y se muestrea en una rejilla
  var cacheTextos = {};
  MO.texto = function (txt, alto, tam, fuente) {
    var clave = txt + '|' + alto + '|' + tam + '|' + (fuente || ''); if (cacheTextos[clave]) return cacheTextos[clave];
    var c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true }), font = fuente || ('600 ' + alto + 'px "IBM Plex Mono", monospace');
    x.font = font; var w = Math.ceil(x.measureText(txt).width) + tam * 2, h = Math.ceil(alto * 1.25) + tam * 2;
    c.width = w; c.height = h; x.font = font; x.textBaseline = 'middle'; x.fillStyle = '#000'; x.fillText(txt, tam, h / 2);
    var px = x.getImageData(0, 0, w, h).data, celdas = [];
    for (var cy = 0; cy + tam <= h; cy += tam) for (var cx = 0; cx + tam <= w; cx += tam) {
      var dentro = 0;
      for (var sy = 0; sy < 3; sy++) for (var sx = 0; sx < 3; sx++) { var ix = Math.floor(cx + (sx + 0.5) * tam / 3), iy = Math.floor(cy + (sy + 0.5) * tam / 3); if (px[(iy * w + ix) * 4 + 3] > 110) dentro++; }
      if (dentro >= 4) celdas.push([cx + tam / 2 - w / 2, cy + tam / 2 - h / 2, celdas.length]);
    }
    // el orden de colocación: de izquierda a derecha, con un poco de desorden (como a mano)
    celdas.forEach(function (c0) { c0.orden = c0[0] + (M.h(c0[2], 7, 1) - 0.5) * tam * 6; });
    celdas.sort(function (a, b) { return a.orden - b.orden; });
    return (cacheTextos[clave] = { celdas: celdas, w: w, h: h, tam: tam });
  };
  MO.pintarTexto = function (ctx, pl, x, y, f, op) {
    op = op || {}; var pal = op.paleta || MO.ORO, n = pl.celdas.length, dur = 0.22, sal = op.salida || 0, esc = op.esc || 1, sem = op.semilla || 3;
    if (f <= 0) return;
    if (op.placa !== false) {   // la placa oscura detrás, que se abre con el texto
      var ap = U.suave(U.clamp(f * 3, 0, 1)) * (1 - U.suave(sal)), pw = (pl.w + pl.tam * 2) * esc, ph = (pl.h + pl.tam) * esc;
      ctx.save(); ctx.globalAlpha = 0.8 * ap; ctx.fillStyle = '#14110f'; ctx.fillRect(x - pw / 2 * ap, y - ph / 2, pw * ap, ph);
      ctx.globalAlpha = ap; ctx.fillStyle = BC.color.acento; ctx.fillRect(x - pw / 2 * ap, y + ph / 2 - 2, pw * ap, 2); ctx.restore();
    }
    pl.celdas.forEach(function (c, i) {
      var ini = i / n * (1 - dur), u = (f - ini) / dur, cae = U.clamp(sal * 1.6 - (1 - i / n) * 0.6, 0, 1);
      if (cae >= 1) return;
      MO.tesela(ctx, x + c[0] * esc, y + c[1] * esc + cae * cae * 60 * esc, pl.tam * 0.92 * esc, pal[Math.floor(M.h(c[2], sem, 2) * pal.length)], u, c[2] * 17 + sem, { alfa: 1 - cae, ang: cae * 2 * (M.h(c[2], 1, 1) - 0.5) });
    });
  };

  // trozos de cerámica que saltan desde un punto y caen girando (con su cara y su canto, como una moneda)
  MO.confeti = function (n, pal, sem) {
    var l = [];
    for (var i = 0; i < n; i++) l.push({ a: -Math.PI / 2 + (M.h(i, sem, 1) - 0.5) * 2.4, v: 260 + M.h(i, sem, 2) * 420, giro: (M.h(i, sem, 3) - 0.5) * 9, vuelta: 3 + M.h(i, sem, 4) * 8, col: pal[i % pal.length], tam: 8 + M.h(i, sem, 5) * 7, d: M.h(i, sem, 6) * 900, sem: sem * 97 + i, aire: 0.6 + M.h(i, sem, 7) * 0.8 });
    return l;
  };
  MO.pintarConfeti = function (ctx, l, x, y, t, esc) {
    esc = esc || 1;
    l.forEach(function (q) {
      var tt = (t - q.d) / 1000; if (tt <= 0 || tt > 4.2) return;
      var frena = (1 - Math.exp(-tt * 1.6)) / 1.6;   // el aire frena el salto
      var px = x + Math.cos(q.a) * q.v * frena * esc + Math.sin(tt * 2.2 + q.sem) * 14 * q.aire * esc, py = y + Math.sin(q.a) * q.v * frena * esc + 120 * tt * tt * q.aire * esc;
      var cara = Math.cos(tt * q.vuelta + q.sem);   // gira sobre sí mismo: se ve más o menos de canto
      ctx.save(); ctx.translate(px, py); ctx.rotate(q.giro * tt + q.sem); ctx.scale(1, Math.max(0.12, Math.abs(cara)));
      MO.tesela(ctx, 0, 0, q.tam * esc, cara > 0 ? q.col : M.tono(q.col, 0.84), 1, q.sem, { alfa: 1 - U.tramo(tt, 3.2, 4.2), sombra: false });
      ctx.restore();
    });
  };

  MO.halo = function (ctx, x, y, r, col, alfa) {
    if (alfa <= 0) return;
    var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, U.rgba(col, 0.55 * alfa)); g.addColorStop(0.4, U.rgba(col, 0.18 * alfa)); g.addColorStop(1, U.rgba(col, 0));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  };

  // la cámara respira durante la escena: se acerca muy poco a poco mientras lees (sin mover el centro)
  MO.respirar = function (E, estado, t, desde, hasta, cuanto) {
    if (t < desde) return;
    if (!estado.base) estado.base = E.cam.s;
    E.cam.s = estado.base * (1 + cuanto * U.suave(U.tramo(t, desde, hasta)));
  };
})();
