/* Barcelona Incognita · cuatro entradas más, todas sobre Gaudí (Pau 31/10/2026: «que tengan que ver con Gaudí, muy expertas»)
   ?entrada=5…8. Todas empiezan igual que las otras (GAUDÍ en teselas de oro y la cámara que vuela a la basílica) y luego:
     5 · la maqueta de cadenas: caen cadenas con saquitos de perdigones y forman la iglesia boca abajo; la pantalla gira
         180° y las curvas colgadas son los arcos y las torres del templo, que aparece detrás
     6 · del dibujo al mosaico: la ciudad se vuelve papel de arquitecto, la plumilla dibuja el corte (con cotas y cajetín) y
         el dibujo se llena de teselas de abajo arriba
     7 · el bosque de columnas: desde el suelo crecen las columnas-árbol, se encienden sus nudos, se ramifican y florecen las
         estrellas de la bóveda; el bosque se convierte en la nave
     8 · la escalera de caracol: caes por la escalera de un campanario, en espiral y cada vez más deprisa, hasta la luz
   Usa las piezas de js/sagrada/entradas.js (BC.entradas.util). */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, E = BC.motor, MO = BC.mosaico, ID = BC.idioma, X = BC.entradas.util;
  var OSCURO = '#14110f';

  ID.anadir({
    e5: ['Gaudí penjava cadenes amb sacs de perdigons. Girades, les corbes són arcs que s’aguanten sols.', 'Gaudí colgaba cadenas con saquitos de perdigones. Del revés, las curvas son arcos que se sostienen solos.', 'Gaudí hung chains weighted with bags of shot. Turned upside down, the curves are arches that stand on their own.'],
    e5b: ['Maqueta polifunicular', 'Maqueta polifunicular', 'Polyfunicular model'],
    e6: ['«La línia recta pertany als homes; la corba pertany a Déu.»', '«La línea recta pertenece a los hombres; la curva pertenece a Dios.»', '«The straight line belongs to men; the curve belongs to God.»'],
    e7: ['«Aquell arbre de prop del meu taller: aquest és el meu mestre.»', '«Aquel árbol cerca de mi taller: ese es mi maestro.»', '«That tree near my workshop: that is my teacher.»'],
    e8: ['Escala de cargol · campanars del Naixement', 'Escalera de caracol · campanarios del Nacimiento', 'Spiral staircase · Nativity bell towers'],
    cajetin: ['TEMPLE DE LA SAGRADA FAMÍLIA · SECCIÓ PEL CREUER · E 1:500 · A. GAUDÍ', 'TEMPLO DE LA SAGRADA FAMÍLIA · SECCIÓN POR EL CRUCERO · E 1:500 · A. GAUDÍ', 'SAGRADA FAMÍLIA TEMPLE · SECTION THROUGH THE CROSSING · 1:500 · A. GAUDÍ']
  });

  /* ---------- el perfil del templo en curvas de Gaudí (metros del corte, y hacia arriba) ----------
     arcos: catenarias invertidas; torres: paraboloides apuntados. Sirve para las cadenas (5) y para el dibujo (6). */
  var PERFIL = [];
  [[-30, -22.5], [-22.5, -15], [-15, -7.5], [7.5, 15], [15, 22.5], [22.5, 30]].forEach(function (a) { PERFIL.push({ x0: a[0], x1: a[1], b: 0, h: 40, t: 'arc' }); });
  PERFIL.push({ x0: -30, x1: -7.5, b: 0, h: 45, t: 'arc' }, { x0: 7.5, x1: 30, b: 0, h: 45, t: 'arc' }, { x0: -7.5, x1: 7.5, b: 0, h: 60, t: 'arc' });
  PERFIL.push({ x0: -44, x1: -32.2, b: 0, h: 58, t: 'arc' }, { x0: 32.2, x1: 44, b: 0, h: 57, t: 'arc' });
  [[-7.75, 7.75, 60, 112.5], [-17, -8, 45, 90], [8, 17, 45, 90], [-40.25, -30.75, 40, 67], [30.75, 40.25, 40, 67], [-44.5, -35.5, 36, 62], [35.5, 44.5, 36, 62]].forEach(function (t) { PERFIL.push({ x0: t[0], x1: t[1], b: t[2], h: t[3], t: 'torre' }); });
  function g(e, u) {
    if (e.t === 'torre') return 1 - Math.pow(Math.abs(2 * u - 1), 0.72);
    var a = 2.6, c = Math.cosh(a / 2); return (c - Math.cosh(a * (u - 0.5))) / (c - 1);
  }
  function curvaPlano(e, k, n) { var p = []; n = n || 28; for (var i = 0; i <= n; i++) { var u = i / n; p.push([e.x0 + (e.x1 - e.x0) * u, e.b + e.h * k * g(e, u)]); } return p; }
  function aPant(p) { return p.map(function (q) { return E.aPantalla(q[0], -q[1]); }); }

  // una cadena de eslabones a lo largo de una polilínea de pantalla (f = cuánto se ha dibujado, 0 … 1)
  function cadena(ctx, pts, f, brillo) {
    var L = 0, seg = [], i; for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    var paso = 5, hasta = L * U.clamp(f, 0, 1), s = 0, j = 0, n = 0;
    ctx.save(); ctx.lineWidth = 1.5; ctx.shadowColor = 'rgba(242,179,61,0.55)'; ctx.shadowBlur = 4;
    for (var d2 = 0; d2 < hasta; d2 += paso, n++) {
      while (j < seg.length - 1 && d2 > s + seg[j]) { s += seg[j]; j++; }
      var a = pts[j], b = pts[j + 1], u = seg[j] ? (d2 - s) / seg[j] : 0, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      if (n % 2) { ctx.strokeStyle = brillo ? '#fff3c4' : '#8a6a3a'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.stroke(); }
      else { ctx.strokeStyle = brillo ? '#ffe7a0' : '#d9b46a'; ctx.beginPath(); ctx.ellipse(0, 0, 3.3, 1.8, 0, 0, 6.2832); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
  }
  function saquito(ctx, x, y, r) {   // un saquito de lona con perdigones, colgado de su cordel
    ctx.save(); ctx.strokeStyle = 'rgba(200,180,140,0.7)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + r * 1.4); ctx.stroke();
    var gr = ctx.createRadialGradient(x - r * 0.3, y + r * 2, r * 0.2, x, y + r * 2.2, r * 1.3); gr.addColorStop(0, '#d8c39a'); gr.addColorStop(1, '#8a7350');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x - r * 0.35, y + r * 1.4); ctx.quadraticCurveTo(x - r * 1.2, y + r * 2.6, x, y + r * 3.1); ctx.quadraticCurveTo(x + r * 1.2, y + r * 2.6, x + r * 0.35, y + r * 1.4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,20,0.6)'; ctx.stroke(); ctx.restore();
  }
  // un rótulo de frase: serif cursiva clara sobre una banda oscura (o tinta sobre papel)
  function rotulo(ctx, txt, y, alfa, tinta) {
    if (alfa <= 0) return;
    var W = E.W, tam = Math.max(17, Math.min(26, W / 46));
    ctx.save(); ctx.globalAlpha = alfa; ctx.font = 'italic 400 ' + tam + 'px "Instrument Serif", Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var lineas = [], pal = txt.split(' '), l = '', max = Math.min(W - 60, 760);
    pal.forEach(function (p) { var t = l ? l + ' ' + p : p; if (ctx.measureText(t).width > max && l) { lineas.push(l); l = p; } else l = t; }); lineas.push(l);
    if (!tinta) { var hh = lineas.length * tam * 1.25 + 26, gr = ctx.createLinearGradient(0, y - hh, 0, y + hh); gr.addColorStop(0, 'rgba(20,17,15,0)'); gr.addColorStop(0.5, 'rgba(20,17,15,0.75)'); gr.addColorStop(1, 'rgba(20,17,15,0)'); ctx.fillStyle = gr; ctx.fillRect(0, y - hh, W, hh * 2); }
    ctx.fillStyle = tinta ? 'rgba(60,40,22,0.9)' : '#f3ece0';
    lineas.forEach(function (t, i) { ctx.fillText(t, W / 2, y + (i - (lineas.length - 1) / 2) * tam * 1.25); });
    ctx.restore();
  }
  function versalitas(ctx, txt, x, y, tam, color, alfa, alin) {
    if (alfa <= 0) return; ctx.save(); ctx.globalAlpha = alfa; ctx.font = '500 ' + tam + 'px "IBM Plex Mono", monospace'; ctx.textAlign = alin || 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color; ctx.fillText(txt.toUpperCase().split('').join(String.fromCharCode(8202)), x, y); ctx.restore();
  }
  function oscurecer(ctx, A, f) { var W = E.W, H = E.H; ctx.fillStyle = OSCURO; ctx.fillRect(0, 0, W, H); if (f < 1) { ctx.save(); ctx.globalAlpha = 1 - f; ctx.drawImage(A, 0, 0, W, H); ctx.restore(); } }

  /* ---------- 5 · la maqueta de cadenas ---------- */
  function cadenas(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), A = null, B = null, EL = null, T0 = 2000, CAEN = 2300, GIRO = 5300, DERECHO = 6900, FIN = 8500, cx, cy;
    return {
      duracion: FIN + 7600 + L, tarjeta: X.tarjeta(FIN + 900, L),
      inicio: function () { E.camara(m.X, m.Y - 185, 2.4, 1900); },
      cuadro: function (t) {
        if (!A && t >= T0) {
          A = X.copia(); X.entrarAlTemplo({ x: 0, y: -80, k: 1.05 }); B = X.fotoDelTemplo(); cx = E.W / 2; cy = E.H / 2;
          EL = PERFIL.map(function (e, i) { return { e: e, d: CAEN + 140 * Math.abs((e.x0 + e.x1) / 2) / 8 + (e.t === 'torre' ? 500 : 0) + M.h(i, 3, 3) * 120 }; });
        }
        if (A && t >= FIN && t < FIN + 60) { var f = X.encuadreFinal(); E.camara(f.x, f.y, f.s, 1800); }
      },
      frente: function (ctx, t) {
        var W = E.W, H = E.H;
        if (!A) { X.comun(m, nombre, ctx, t, T0); return; }
        var rev = U.suave(U.tramo(t, DERECHO, FIN));
        if (rev >= 1 && t > FIN + 700) return;
        oscurecer(ctx, A, U.tramo(t, T0, T0 + 700));
        // el templo aparece detrás de las curvas ya derechas, subiendo desde el suelo
        if (rev > 0) { var suelo = E.aPantalla(0, 4)[1], top = suelo - (suelo + 40) * rev; ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, H); ctx.clip(); ctx.globalAlpha = Math.min(1, rev * 1.6); ctx.drawImage(B, 0, 0, W, H); ctx.restore(); }
        var giro = U.tramo(t, GIRO, DERECHO), e2 = giro < 0.5 ? 4 * giro * giro * giro : 1 - Math.pow(-2 * giro + 2, 3) / 2, esc = 1 - 0.12 * Math.sin(Math.PI * giro), alfaC = 1 - U.tramo(t, FIN - 300, FIN + 600);
        ctx.save(); ctx.globalAlpha = alfaC;
        ctx.translate(cx, cy); ctx.rotate(Math.PI * (1 - e2)); ctx.scale(esc, esc); ctx.translate(-cx, -cy);
        // la viga de madera de donde cuelga todo (al girar, queda abajo: es el suelo)
        var yv = E.aPantalla(0, 0)[1], x0v = E.aPantalla(-52, 0)[0], x1v = E.aPantalla(52, 0)[0];
        var gv = ctx.createLinearGradient(0, yv, 0, yv + 12); gv.addColorStop(0, '#9a6a3c'); gv.addColorStop(1, '#5a3d26');
        ctx.fillStyle = gv; ctx.fillRect(x0v, yv, x1v - x0v, 12); ctx.fillStyle = 'rgba(255,230,180,0.25)'; ctx.fillRect(x0v, yv, x1v - x0v, 2);
        // las cadenas: caen con un pequeño rebote y se quedan colgando (dibujadas derechas y giradas con la pantalla)
        EL.forEach(function (o) {
          var u = U.tramo(t, o.d, o.d + 900); if (u <= 0) return;
          var k = u < 1 ? (1 - Math.cos(u * Math.PI * 2.5) * Math.exp(-u * 4)) : 1, pts = aPant(curvaPlano(o.e, k));
          if (o.e.b > 0) {   // las torres cuelgan de un cordel desde lo de arriba
            var a = E.aPantalla((o.e.x0 + o.e.x1) / 2, 0), b = E.aPantalla((o.e.x0 + o.e.x1) / 2, -o.e.b);
            ctx.save(); ctx.strokeStyle = 'rgba(220,200,160,0.55)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
          }
          cadena(ctx, pts, Math.min(1, u * 2.2), rev > 0);
          // los saquitos: en las torres, en la punta; en los arcos, en tres puntos (en pantalla «abajo» = al revés)
          var lst = o.e.t === 'torre' ? [0.5] : [0.25, 0.5, 0.75];
          lst.forEach(function (q) { var p = pts[Math.round(q * (pts.length - 1))]; ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.PI); saquito(ctx, 0, 0, o.e.t === 'torre' ? 3.4 : 2.6); ctx.restore(); });
        });
        if (rev > 0) EL.forEach(function (o) { var pts = aPant(curvaPlano(o.e, 1)), p = pts[Math.round(pts.length / 2)]; MO.halo(ctx, p[0], p[1], 40, '#ffd98a', rev * (1 - rev) * 2); });
        ctx.restore();
        // el rótulo de museo y la frase
        X.versalitas(ctx, ID.t('e5b') + ' · Colònia Güell · 1898', W / 2, H - 38, 11, '#f2b33d', U.meseta(t, T0 + 600, T0 + 1200, DERECHO, DERECHO + 600));
        rotulo(ctx, ID.t('e5'), H - 86, U.meseta(t, CAEN + 800, CAEN + 1500, DERECHO + 300, FIN));
      },
      fin: function () { A = B = null; if (E.mundo !== 'sagrada') X.entrarAlTemplo(); }
    };
  }

  /* ---------- 6 · del dibujo al mosaico ---------- */
  function dibujo(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), A = null, B = null, PAPEL = null, R = null, T0 = 2000, TINTA = 2800, TESELAS = 6000, FIN = 8600;
    function papel() {
      var c = document.createElement('canvas'), W = E.W, H = E.H, d = Math.min(window.devicePixelRatio || 1, 2); c.width = W * d; c.height = H * d;
      var x = c.getContext('2d'); x.scale(d, d); x.fillStyle = '#efe6d2'; x.fillRect(0, 0, W, H);
      for (var i = 0; i < 2200; i++) { x.fillStyle = M.h(i, 1, 2) < 0.5 ? 'rgba(120,100,70,0.08)' : 'rgba(255,255,255,0.35)'; x.fillRect(M.h(i, 3, 4) * W, M.h(i, 5, 6) * H, 1.4, 1.4); }
      x.strokeStyle = 'rgba(70,110,150,0.12)'; x.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 24) { x.beginPath(); x.moveTo(gx + 0.5, 0); x.lineTo(gx + 0.5, H); x.stroke(); }
      for (var gy = 0; gy < H; gy += 24) { x.beginPath(); x.moveTo(0, gy + 0.5); x.lineTo(W, gy + 0.5); x.stroke(); }
      x.strokeStyle = 'rgba(60,40,22,0.55)'; x.lineWidth = 1.2; x.strokeRect(18, 18, W - 36, H - 36); x.strokeRect(22, 22, W - 44, H - 44);
      var vg = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(110,80,40,0.25)'); x.fillStyle = vg; x.fillRect(0, 0, W, H);
      return c;
    }
    function trazo(ctx, pts, f, ancho) {
      if (f <= 0) return null; var L2 = 0, i; for (i = 1; i < pts.length; i++) L2 += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      ctx.save(); ctx.strokeStyle = 'rgba(60,40,22,0.88)'; ctx.lineWidth = ancho || 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([L2 * f, L2 + 10]);
      ctx.beginPath(); pts.forEach(function (p, k) { k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore();
      // la punta de la plumilla
      var r = L2 * Math.min(1, f), s = 0; for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (s + d >= r) { var u = d ? (r - s) / d : 0; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u]; } s += d; }
      return pts[pts.length - 1];
    }
    var LINEAS = null;
    return {
      duracion: FIN + 7600 + L, tarjeta: X.tarjeta(FIN + 700, L),
      inicio: function () { E.camara(m.X, m.Y - 185, 2.4, 1900); },
      cuadro: function (t) {
        if (!A && t >= T0) {
          A = X.copia(); X.entrarAlTemplo({ x: 0, y: -80, k: 1.05 }); B = X.fotoDelTemplo(); PAPEL = papel(); R = X.rejilla(18);
          var tam = R.tam; R.l.forEach(function (c) { c.d = TESELAS + (R.filas - 1 - c.j) / R.filas * 2000 + c.r * 500; });
          // el orden del dibujo: el suelo, los muros cortados, los arcos, las torres; cada trazo con su momento
          LINEAS = [];
          LINEAS.push({ p: aPant([[-60, 0], [60, 0]]), d: TINTA, dur: 500, w: 2 });
          LINEAS.push({ p: aPant([[-60, -4], [60, -4]]), d: TINTA + 100, dur: 400, w: 0.8 });
          [[-32.2, -30], [30, 32.2]].forEach(function (w, i) { LINEAS.push({ p: aPant([[w[0], 0], [w[0], 51], [w[1], 51], [w[1], 0]]), d: TINTA + 300 + i * 80, dur: 500, w: 1.6 }); });
          PERFIL.forEach(function (e, i) { LINEAS.push({ p: aPant(curvaPlano(e, 1, 40)), d: TINTA + 600 + (e.t === 'torre' ? 1100 : 0) + i * 70, dur: 700, w: e.t === 'torre' ? 1.7 : 1.4 }); });
          LINEAS.push({ p: aPant([[0, 172.5], [0, 162], [-5, 167], [5, 167]]), d: TINTA + 2400, dur: 400, w: 1.6 });   // la cruz
          [-22.5, -15, -7.5, 7.5, 15, 22.5].forEach(function (x, i) { LINEAS.push({ p: aPant([[x, 0], [x, 24], [x - 3, 40], [x, 24], [x + 3, 40]]), d: TINTA + 1500 + i * 60, dur: 500, w: 1.1 }); });   // las columnas
          LINEAS.push({ p: aPant([[54, 0], [54, 172.5]]), d: TINTA + 2100, dur: 600, w: 0.9, cota: true });   // la cota de altura
        }
        if (A && t >= FIN && t < FIN + 60) { var f = X.encuadreFinal(); E.camara(f.x, f.y, f.s, 1800); }
      },
      frente: function (ctx, t) {
        var W = E.W, H = E.H;
        if (!A) { X.comun(m, nombre, ctx, t, T0); return; }
        var sale = U.tramo(t, FIN - 200, FIN + 500); if (sale >= 1) return;
        ctx.save(); ctx.globalAlpha = 1 - sale;
        // la ciudad se vuelve papel: una mancha que crece desde la basílica
        var p0 = U.suave(U.tramo(t, T0, T0 + 800)), c = E.aPantalla(0, -80);
        ctx.drawImage(A, 0, 0, W, H);
        ctx.save(); ctx.beginPath(); ctx.arc(c[0], c[1], Math.hypot(W, H) * p0, 0, 6.2832); ctx.clip(); ctx.drawImage(PAPEL, 0, 0, W, H); ctx.restore();
        // las teselas: el templo se monta encima del dibujo, de abajo arriba
        var tam = R.tam;
        R.l.forEach(function (q) { var u = (t - q.d) / 450; if (u <= 0) return; var e = u >= 1 ? 1 : MO.rebote(u), w = tam * e; X.trozo(ctx, B, q.x, q.y, tam, tam, q.x + tam / 2 - w / 2, q.y + tam / 2 - w / 2, w, w); });
        // la tinta, por encima; se va apagando cuando las teselas la cubren
        var tinta = 1 - U.tramo(t, TESELAS + 1200, FIN - 300);
        ctx.save(); ctx.globalAlpha = (1 - sale) * tinta;
        var punta = null;
        LINEAS.forEach(function (l) { var f = U.tramo(t, l.d, l.d + l.dur); var p = trazo(ctx, l.p, f, l.w); if (f > 0 && f < 1) punta = p; if (l.cota && f > 0) { [l.p[0], l.p[l.p.length - 1]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(q[0] - 6, q[1]); ctx.lineTo(q[0] + 6, q[1]); ctx.strokeStyle = 'rgba(60,40,22,0.8)'; ctx.stroke(); }); X.versalitas(ctx, '172,5 m', l.p[0][0] + 14, (l.p[0][1] + l.p[1][1]) / 2, 11, 'rgba(60,40,22,0.9)', f, 'left'); } });
        if (punta) { ctx.fillStyle = '#f2b33d'; ctx.beginPath(); ctx.arc(punta[0], punta[1], 3, 0, 6.2832); ctx.fill(); MO.halo(ctx, punta[0], punta[1], 26, '#ffd98a', 0.8); }
        // el lápiz azul de las líneas de construcción: niveles con su cota a la izquierda y el eje de simetría
        var lap = U.tramo(t, T0 + 700, TINTA + 400) * (1 - U.tramo(t, TESELAS + 600, TESELAS + 1600));
        if (lap > 0) {
          ctx.save(); ctx.globalAlpha = (1 - sale) * lap; ctx.strokeStyle = 'rgba(60,100,150,0.45)'; ctx.lineWidth = 0.8; ctx.setLineDash([6, 5]);
          [0, 15, 45, 60, 135, 172.5].forEach(function (y, i) { var a = E.aPantalla(-70, -y), b = E.aPantalla(70, -y), f = U.tramo(t, T0 + 700 + i * 120, T0 + 1400 + i * 120); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + (b[0] - a[0]) * f, b[1]); ctx.stroke(); X.versalitas(ctx, '+' + String(y).replace('.', ','), a[0] - 8, a[1], 10, 'rgba(60,100,150,0.8)', f, 'right'); });
          ctx.setLineDash([14, 4, 2, 4]); var e0 = E.aPantalla(0, 8), e1 = E.aPantalla(0, -182); ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e0[1] + (e1[1] - e0[1]) * U.tramo(t, T0 + 900, TINTA)); ctx.stroke();
          ctx.restore();
        }
        // el cajetín del plano y la frase
        var cj = U.tramo(t, TINTA + 2300, TINTA + 2900);
        X.versalitas(ctx, ID.t('cajetin'), W - 40, H - 40, 10, 'rgba(60,40,22,0.85)', cj, 'right');
        if (cj > 0) { ctx.strokeStyle = 'rgba(60,40,22,' + (0.6 * cj) + ')'; ctx.strokeRect(W - 40 - Math.min(W - 80, 560), H - 56, Math.min(W - 80, 560), 30); }
        ctx.restore();
        rotulo(ctx, ID.t('e6'), H * 0.1, U.meseta(t, T0 + 900, T0 + 1500, TESELAS + 1500, FIN - 200) * tinta, true);
        ctx.restore();
      },
      fin: function () { A = B = PAPEL = null; if (E.mundo !== 'sagrada') X.entrarAlTemplo(); }
    };
  }

  /* ---------- 7 · el bosque de columnas ---------- */
  function bosque(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), A = null, B = null, COL = null, T0 = 2000, CRECE = 2500, FLOR = 4900, FIN = 7600;
    var PIEDRA = { '-1': ['#9a958c', '#a8a39a', '#8b867e'], '0': ['#4a4744', '#57534e', '#3f3c39'], '1': ['#7a1f1c', '#8f2a24', '#6b1a18'] };
    function tronco(ctx, a, b, w0, w1, pal, f) {   // una rama facetada que crece de a hacia b (f = 0 … 1)
      if (f <= 0) return; var bx = a[0] + (b[0] - a[0]) * f, by = a[1] + (b[1] - a[1]) * f, l = Math.hypot(bx - a[0], by - a[1]) || 1, nx = -(by - a[1]) / l, ny = (bx - a[0]) / l, w = w0 + (w1 - w0) * f;
      ctx.fillStyle = pal[0]; ctx.beginPath(); ctx.moveTo(a[0] + nx * w0 / 2, a[1] + ny * w0 / 2); ctx.lineTo(bx + nx * w / 2, by + ny * w / 2); ctx.lineTo(bx, by); ctx.lineTo(a[0], a[1]); ctx.closePath(); ctx.fill();
      ctx.fillStyle = pal[2]; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(bx, by); ctx.lineTo(bx - nx * w / 2, by - ny * w / 2); ctx.lineTo(a[0] - nx * w0 / 2, a[1] - ny * w0 / 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,220,0.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(bx, by); ctx.stroke();
      // las juntas de las teselas de piedra, en cruz
      ctx.strokeStyle = 'rgba(20,17,15,0.25)'; for (var s = 8; s < l; s += 8) { var px = a[0] + (bx - a[0]) * s / l, py = a[1] + (by - a[1]) * s / l, ww = (w0 + (w - w0) * s / l) / 2; ctx.beginPath(); ctx.moveTo(px - nx * ww, py - ny * ww); ctx.lineTo(px + nx * ww, py + ny * ww); ctx.stroke(); }
    }
    function estrella(ctx, x, y, r, f) {   // un hiperboloide de la bóveda que florece
      if (f <= 0) return; var e = MO.rebote(f), rr = r * e;
      ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#f6f0e2'; ctx.beginPath();
      for (var k = 0; k < 24; k++) { var a = k / 24 * 6.2832, q = k % 2 ? rr * 0.6 : rr; ctx[k ? 'lineTo' : 'moveTo'](Math.cos(a) * q, Math.sin(a) * q * 0.6); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e9b64a'; ctx.beginPath(); ctx.ellipse(0, 0, rr * 0.55, rr * 0.33, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = '#fff8e6'; ctx.beginPath(); ctx.ellipse(0, 0, rr * 0.22, rr * 0.13, 0, 0, 6.2832); ctx.fill(); ctx.restore();
    }
    return {
      duracion: FIN + 7800 + L, tarjeta: X.tarjeta(FIN + 1800, L),
      inicio: function () { E.camara(m.X, m.Y - 185, 2.4, 1900); },
      cuadro: function (t) {
        if (!A && t >= T0) {
          A = X.copia(); X.entrarAlTemplo({ x: 0, y: -31, s: Math.min(E.H / 68, E.W / 64) }); B = X.fotoDelTemplo();   // la nave llena la pantalla
          COL = [];
          [[-22.5, -1, 22], [-15, 0, 24], [-7.5, 1, 30], [7.5, 1, 30], [15, 0, 24], [22.5, -1, 22]].forEach(function (c, i) {
            var x = c[0], nudo = c[2], top = Math.abs(x) < 8 ? 58 : 45, sg = x < 0 ? -1 : 1, w = (Math.abs(x) < 8 ? 2.1 : 1.7) * E.cam.s;
            var ramas = [[x - 3.4, top - 6], [x, top - 4], [x + 3.4, top - 6]].map(function (r, k) { return { a: E.aPantalla(x, -nudo), b: E.aPantalla(r[0], -r[1]), hijos: [E.aPantalla(r[0] - 1.6, -top), E.aPantalla(r[0] + 1.6, -top)] }; });
            COL.push({ base: E.aPantalla(x, 0), nudo: E.aPantalla(x, -nudo), w: w, pal: PIEDRA[c[1]], ramas: ramas, d: CRECE + i % 3 * 180 + (i < 3 ? 0 : 90) });
          });
        }
        if (A && t >= FIN && t < FIN + 60) { var f = X.encuadreFinal(); E.camara(f.x, f.y, f.s, 2600); }
      },
      frente: function (ctx, t) {
        var W = E.W, H = E.H;
        if (!A) { X.comun(m, nombre, ctx, t, T0); return; }
        var sale = U.tramo(t, FIN - 500, FIN + 600); if (sale >= 1) return;
        oscurecer(ctx, A, U.tramo(t, T0, T0 + 700));
        // la nave real aparece por debajo del bosque, despacio
        var nave = U.suave(U.tramo(t, FLOR + 600, FIN));
        if (nave > 0) { ctx.save(); ctx.globalAlpha = nave; ctx.drawImage(B, 0, 0, W, H); ctx.restore(); }
        ctx.save(); ctx.globalAlpha = 1 - sale;
        // los rayos de luz entre las ramas
        var luz = U.meseta(t, FLOR, FLOR + 900, FIN - 600, FIN + 300);
        if (luz > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (var k = 0; k < 7; k++) { var x0 = W * (0.1 + k * 0.13), gr = ctx.createLinearGradient(x0, 0, x0 + 120, H); gr.addColorStop(0, 'rgba(255,220,150,' + (0.16 * luz) + ')'); gr.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + 40, 0); ctx.lineTo(x0 + 220, H); ctx.lineTo(x0 + 120, H); ctx.closePath(); ctx.fill(); } ctx.restore(); }
        COL.forEach(function (c) {
          var f1 = U.suave(U.tramo(t, c.d, c.d + 900));
          tronco(ctx, c.base, c.nudo, c.w, c.w * 0.84, c.pal, f1);
          var f2 = U.tramo(t, c.d + 1000, c.d + 1700), f3 = U.tramo(t, c.d + 1600, c.d + 2200);
          c.ramas.forEach(function (r, k) {
            tronco(ctx, r.a, r.b, c.w * 0.62, c.w * 0.42, c.pal, U.suave(f2));
            r.hijos.forEach(function (hj, n) { tronco(ctx, r.b, hj, c.w * 0.4, c.w * 0.26, c.pal, U.suave(f3)); estrella(ctx, hj[0], hj[1], c.w * 1.9, U.tramo(t, FLOR + k * 120 + n * 60, FLOR + 500 + k * 120 + n * 60)); });
          });
          // el nudo: se enciende como una lámpara
          var on = U.tramo(t, c.d + 850, c.d + 1300);
          if (f1 >= 1) { ctx.fillStyle = '#d8d2c6'; ctx.beginPath(); ctx.ellipse(c.nudo[0], c.nudo[1], c.w * 0.85, c.w * 1.1, 0, 0, 6.2832); ctx.fill(); ctx.fillStyle = 'rgba(242,179,61,' + on + ')'; ctx.beginPath(); ctx.ellipse(c.nudo[0], c.nudo[1], c.w * 0.4, c.w * 0.55, 0, 0, 6.2832); ctx.fill(); MO.halo(ctx, c.nudo[0], c.nudo[1], c.w * 5, '#ffd98a', on * 0.9); }
        });
        ctx.restore();
        rotulo(ctx, ID.t('e7'), H - 70, U.meseta(t, CRECE + 300, CRECE + 1000, FIN - 600, FIN));
      },
      fin: function () { A = B = null; if (E.mundo !== 'sagrada') X.entrarAlTemplo(); }
    };
  }

  /* ---------- 8 · la escalera de caracol ---------- */
  function escalera(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), A = null, B = null, T0 = 1900, CAE = 2500, LUZ = 6300, FIN = 7300;
    var PASO = 0.36, CRECE = Math.pow(1.85, PASO / 6.2832);   // cada peldaño: 0,36 rad; cada vuelta el radio se multiplica por 1,85
    var TONOS = ['#d6b47c', '#c9a46a', '#e2c58e', '#b8925e', '#ddbb85'];
    function caracol(ctx, z, giro, cx, cy) {
      var W = E.W, H = E.H, R = Math.hypot(W, H) * 0.75, ln = Math.log(CRECE);
      ctx.fillStyle = '#0d0a08'; ctx.fillRect(0, 0, W, H);   // el vacío del ojo de la escalera (entre vuelta y vuelta se ve el fondo)
      // los peldaños, de los lejanos (pequeños, oscuros) a los cercanos
      var kmin = Math.floor(Math.log(3 / z) / ln), kmax = Math.ceil(Math.log(R / z) / ln);
      for (var k = kmin; k <= kmax; k++) {
        var r1 = z * Math.pow(CRECE, k), r0 = r1 * 0.6, r2 = r1 * CRECE, a0 = k * PASO + giro, a1 = a0 + PASO * 1.02;
        var prof = Math.pow(U.clamp(Math.log(r1 / 4) / Math.log(R / 4), 0, 1), 1.4), base = TONOS[((k % 5) + 5) % 5];
        // cada peldaño, hecho de teselas: 3 filas hacia fuera y 2 columnas a lo ancho
        for (var fi = 0; fi < 3; fi++) for (var co = 0; co < 2; co++) {
          var ra = r0 + (r1 - r0) * fi / 3, rb = r0 + (r1 - r0) * (fi + 1) / 3, aa = a0 + (a1 - a0) * co / 2, abq = a0 + (a1 - a0) * (co + 1) / 2, sa = Math.pow(CRECE, co / 2), sb = Math.pow(CRECE, (co + 1) / 2);
          var qq = [[cx + Math.cos(aa) * ra * sa, cy + Math.sin(aa) * ra * sa], [cx + Math.cos(aa) * rb * sa, cy + Math.sin(aa) * rb * sa], [cx + Math.cos(abq) * rb * sb, cy + Math.sin(abq) * rb * sb], [cx + Math.cos(abq) * ra * sb, cy + Math.sin(abq) * ra * sb]];
          M.pieza(ctx, qq, M.tono(base, (0.22 + 0.85 * prof) * (0.93 + M.h(k, fi * 2 + co, 9) * 0.14)), Math.max(0.5, r1 * 0.008), Math.max(0.6, r1 * 0.006));
        }
        var q = [[cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0], [cx + Math.cos(a0) * r1, cy + Math.sin(a0) * r1]];
        // la contrahuella: el canto oscuro de cada peldaño
        ctx.strokeStyle = 'rgba(20,14,10,' + (0.25 + 0.4 * prof) + ')'; ctx.lineWidth = Math.max(1, r1 * 0.02); ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[1][0], q[1][1]); ctx.stroke();
        // en el muro, de vez en cuando, una ventanita con luz (las lamas del campanario)
        if (((k % 7) + 7) % 7 === 0) { var am = (a0 + a1) / 2, rv = r2 * 1.08; ctx.save(); ctx.translate(cx + Math.cos(am) * rv, cy + Math.sin(am) * rv); ctx.rotate(am); ctx.fillStyle = 'rgba(255,230,170,' + (0.3 + 0.5 * prof) + ')'; ctx.fillRect(-r1 * 0.03, -r1 * 0.09, r1 * 0.06, r1 * 0.18); ctx.restore(); }
        // la barandilla: el borde del ojo de la escalera
        ctx.strokeStyle = 'rgba(242,179,61,' + (0.2 + 0.5 * prof) + ')'; ctx.lineWidth = Math.max(0.6, r1 * 0.012); ctx.beginPath(); ctx.arc(cx, cy, r0, a0, a1); ctx.stroke();
      }
      // el ojo de la escalera: oscuro, con la luz del fondo
      var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.12); gr.addColorStop(0, 'rgba(255,240,200,0.9)'); gr.addColorStop(0.25, 'rgba(255,210,140,0.35)'); gr.addColorStop(1, 'rgba(20,17,15,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    }
    return {
      duracion: FIN + 7400 + L, tarjeta: X.tarjeta(FIN + 600, L),
      inicio: function () { E.camara(m.X, m.Y - 185, 2.4, 1900); },
      cuadro: function (t) {
        if (!A && t >= T0) { A = X.copia(); X.entrarAlTemplo(); B = X.fotoDelTemplo(); }
      },
      frente: function (ctx, t) {
        var W = E.W, H = E.H;
        if (!A) { X.comun(m, nombre, ctx, t, T0); return; }
        var sale = U.tramo(t, FIN, FIN + 900); if (sale >= 1) return;
        var cx = W / 2, cy = H / 2;
        // la bajada: la velocidad crece (cada vez más deprisa) y frena al llegar a la luz
        var tt = (t - T0) / 1000, v = 0.55 * tt * tt + 0.4 * tt, z = 30 * Math.exp(v), giro = v * 0.9;
        ctx.save(); caracol(ctx, z % 1e9, giro, cx, cy); ctx.restore();
        // la entrada: un círculo que se abre desde la torre en la ciudad
        var ab = U.suave(U.tramo(t, T0, CAE));
        if (ab < 1) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(cx, cy, Math.hypot(W, H) * 0.55 * ab, 0, 6.2832, true); ctx.clip('evenodd'); ctx.drawImage(A, 0, 0, W, H); ctx.restore(); }
        // la luz del fondo lo llena todo y deja ver el templo
        var luz = U.tramo(t, LUZ - 900, FIN);
        if (luz > 0) { var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * (0.1 + luz)); gr.addColorStop(0, 'rgba(255,248,230,' + luz + ')'); gr.addColorStop(0.6, 'rgba(255,236,190,' + luz + ')'); gr.addColorStop(1, 'rgba(255,236,190,' + (luz * luz) + ')'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
        if (t > FIN - 50) { ctx.save(); ctx.globalAlpha = 1 - sale; ctx.fillStyle = '#fff8e6'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
        X.versalitas(ctx, ID.t('e8'), W / 2, H - 40, 11, '#f2b33d', U.meseta(t, CAE, CAE + 500, LUZ - 600, LUZ));
      },
      fin: function () { A = B = null; if (E.mundo !== 'sagrada') X.entrarAlTemplo(); }
    };
  }

  BC.entradas.mas = [cadenas, dibujo, bosque, escalera];
  BC.entradas.perfilPantalla = function () { return PERFIL.map(function (e) { return aPant(curvaPlano(e, 1, 30)); }); };
})();
