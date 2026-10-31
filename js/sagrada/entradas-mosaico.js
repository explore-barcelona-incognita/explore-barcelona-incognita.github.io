/* Barcelona Incognita · cuatro entradas de mosaico (Pau 31/10/2026: «algo que tenga que ver con mosaico»)
   ?entrada=9…12. Empiezan como las otras (GAUDÍ en oro, la cámara vuela a la basílica) y luego:
     9  · zoom dentro de una tesela: el zoom sigue hasta que una sola tesela del mapa llena la pantalla… y esa tesela está
          hecha de teselas que forman el templo cortado
     10 · trencadís: un golpe en la basílica rompe la ciudad como un plato; los trozos saltan, giran como monedas, por detrás
          ya son el templo, y vuelven a su sitio; el mortero cierra las juntas
     11 · se enfoca tesela a tesela: la ciudad se desenfoca en teselas cada vez más grandes hasta quedar en unas pocas, que
          cambian de color, y el templo se enfoca partiendo cada tesela en cuatro
     12 · el mosaiquista: sobre el lecho de mortero, con el dibujo en ocre, unas pinzas colocan las primeras teselas (la cruz)
          y luego, a cámara rápida, miles, hasta acabar el templo */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, E = BC.motor, MO = BC.mosaico, ID = BC.idioma, X = BC.entradas.util;
  ID.anadir({ tesseles: ['Tessel·les', 'Teselas', 'Tesserae'] });
  function dpr() { return Math.min(window.devicePixelRatio || 1, 2); }
  function suave3(u) { u = U.clamp(u, 0, 1); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function datos(img) { return img.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, img.width, img.height); }
  function color(dt, x, y) { var k = dt.width / E.W, i = (Math.min(dt.height - 1, Math.max(0, Math.round(y * k))) * dt.width + Math.min(dt.width - 1, Math.max(0, Math.round(x * k)))) * 4; return 'rgb(' + dt.data[i] + ',' + dt.data[i + 1] + ',' + dt.data[i + 2] + ')'; }
  function quad(x, y, w, h, j, s1) { var e = function (a, b, n) { return (M.h(a, b, s1 + n) - 0.5) * j; }; return [[x + e(1, 2, 0), y + e(3, 4, 1)], [x + w + e(5, 6, 2), y + e(7, 8, 3)], [x + w + e(9, 1, 4), y + h + e(2, 3, 5)], [x + e(4, 5, 6), y + h + e(6, 7, 7)]]; }

  /* ---------- 9 · zoom dentro de una tesela (la elegida por Pau, 31/10) ----------
     1 · la cámara del mapa vuela a la basílica y sigue acercándose, nítida, hasta el máximo, sobre el oro de la torre de Jesús
     2 · desde ahí el zoom sigue sin límite: cada tesela se dibuja a su tamaño (nunca se ve borrosa) y la tesela de oro elegida
         se va al centro de la pantalla mientras crece
     3 · de muy cerca se ve la cerámica de verdad: el esmalte con su brillo, el craquelado fino del vidriado y el canto
     4 · el oro se vuelve transparente: dentro está el templo cortado, hecho de teselas, que queda encajado en la pantalla */
  function colorMedio(dt, x, y, r) {   // la media de 9 puntos alrededor de (x, y), en px de CSS
    var k = dt.width / E.W, s = [0, 0, 0];
    for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) { var i = (Math.min(dt.height - 1, Math.max(0, Math.round((y + b * r) * k))) * dt.width + Math.min(dt.width - 1, Math.max(0, Math.round((x + a * r) * k)))) * 4; s[0] += dt.data[i]; s[1] += dt.data[i + 1]; s[2] += dt.data[i + 2]; }
    return [s[0] / 9, s[1] / 9, s[2] / 9];
  }
  function hex(c) { return '#' + c.map(function (v) { return ('0' + Math.round(U.clamp(v, 0, 255)).toString(16)).slice(-2); }).join(''); }
  // una tesela grande de verdad: la pieza con su esmalte y, cuanto más grande, más detalle de la cerámica
  function teselaGrande(ctx, q, col, lado, sem) {
    M.pieza(ctx, q, col, Math.max(0.8, lado * 0.06), Math.max(0.8, lado * 0.05));
    if (lado < 70) return;
    var cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2, j = lado * 0.06, p = new Path2D();
    q.forEach(function (v, k) { var x = cx + (v[0] - cx) * (1 - j * 2 / lado), y = cy + (v[1] - cy) * (1 - j * 2 / lado); k ? p.lineTo(x, y) : p.moveTo(x, y); }); p.closePath();
    ctx.save(); ctx.clip(p);
    var g = ctx.createRadialGradient(cx - lado * 0.25, cy - lado * 0.3, 0, cx - lado * 0.1, cy - lado * 0.1, lado * 0.8);   // el brillo del esmalte (luz de arriba a la izquierda)
    g.addColorStop(0, 'rgba(255,252,240,0.38)'); g.addColorStop(0.35, 'rgba(255,250,235,0.08)'); g.addColorStop(1, 'rgba(60,35,10,0.18)');
    ctx.fillStyle = g; ctx.fillRect(cx - lado, cy - lado, lado * 2, lado * 2);
    if (lado > 260) {   // el craquelado del vidriado: grietas finísimas que se ramifican
      ctx.strokeStyle = 'rgba(70,45,15,' + Math.min(0.28, (lado - 260) / 900) + ')'; ctx.lineWidth = Math.max(0.6, lado / 900);
      for (var n = 0; n < 14; n++) {
        var x0 = cx + (M.h(n, sem, 1) - 0.5) * lado, y0 = cy + (M.h(n, sem, 2) - 0.5) * lado, a = M.h(n, sem, 3) * 6.2832;
        ctx.beginPath(); ctx.moveTo(x0, y0);
        for (var st = 0; st < 6; st++) { a += (M.h(n, st, sem) - 0.5) * 1.4; x0 += Math.cos(a) * lado * 0.07; y0 += Math.sin(a) * lado * 0.07; ctx.lineTo(x0, y0); }
        ctx.stroke();
      }
    }
    if (lado > 160) {   // pequeñas burbujas y motas del esmalte
      for (n = 0; n < 40; n++) { ctx.fillStyle = M.h(n, sem, 7) < 0.5 ? 'rgba(255,255,240,0.35)' : 'rgba(90,60,20,0.18)'; ctx.beginPath(); ctx.arc(cx + (M.h(n, sem, 5) - 0.5) * lado * 0.9, cy + (M.h(n, sem, 6) - 0.5) * lado * 0.9, Math.max(0.6, lado * 0.0025), 0, 6.2832); ctx.fill(); }
    }
    ctx.restore();
  }
  // la tesela de oro de verdad: la del centro del óvalo dorado de lo alto de la torre de Jesús, calculada igual que la pinta
  // el lápiz de teselas del mapa (mismo orden de formas, misma semilla), para que el zoom acabe exactamente en ella
  function teselaOro(m) {
    var id = M.monumentos.indexOf(m), fz = m.esc || 1, k = 0, hall = null, d = {
      forma: function (pts, pal, op) { k++; if (hall || pal !== M.PM.oro) return; var cx = 0, cy = 0; pts.forEach(function (q) { cx += q[0]; cy += q[1]; }); cx /= pts.length; cy /= pts.length; if (Math.abs(cx) < 1 && Math.abs(cy - 287) < 4) hall = { k: k, op: op || {}, pal: pal, cx: cx, cy: cy }; },
      rect: function (x0, y0, x1, y1, pal, op) { d.forma([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], pal, op); },
      elipse: function (cx, cy, rx, ry, pal, op) { d.forma(M.elipsePts(cx, cy, rx, ry, 0, 6.2832, 24), pal, op); },
      linea: function () {}, texto: function () {}
    };
    M.DIBUJOS[m.d](d, [-1e9, -1e9, 1e9, 1e9]);
    if (!hall) return null;
    var ss = id * 977 + 13 * hall.k, ts = 1.5 * (hall.op.ts || 1), i = Math.floor(0.3 / ts), jj = Math.floor((hall.cy + 0.3) / ts);
    function e(a, b) { var lx = (a + (M.h(a, b, ss) - 0.5) * 0.4) * ts, ly = (b + (M.h(b, a, ss + 1) - 0.5) * 0.4) * ts; return [m.X + lx * fz, m.Y - ly * fz]; }
    var q = [e(i, jj), e(i + 1, jj), e(i + 1, jj + 1), e(i, jj + 1)], c = [0, 0]; q.forEach(function (v) { c[0] += v[0] / 4; c[1] += v[1] / 4; });
    var col = M.tono(hall.pal[Math.floor(M.h(i, jj, ss + 2) * hall.pal.length)], 0.94 + M.h(jj, i, ss + 3) * 0.12);
    return { q: q, c: c, col: col, lado: ts * fz, sem: id * 977 };
  }
  // el detalle de la cerámica encima de una pieza enorme (pantalla): brillo del esmalte, craquelado, motas
  function esmalte(ctx, q, lado, sem) {
    var cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, cy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4, p = new Path2D();
    q.forEach(function (v, k) { var x = cx + (v[0] - cx) * 0.88, y = cy + (v[1] - cy) * 0.88; k ? p.lineTo(x, y) : p.moveTo(x, y); }); p.closePath();
    ctx.save(); ctx.clip(p);
    var g = ctx.createRadialGradient(cx - lado * 0.25, cy - lado * 0.3, 0, cx - lado * 0.1, cy - lado * 0.1, lado * 0.85);
    g.addColorStop(0, 'rgba(255,252,240,0.4)'); g.addColorStop(0.35, 'rgba(255,250,235,0.08)'); g.addColorStop(1, 'rgba(70,40,10,0.2)');
    ctx.fillStyle = g; ctx.fillRect(cx - lado, cy - lado, lado * 2, lado * 2);
    ctx.strokeStyle = 'rgba(90,55,15,' + Math.min(0.3, lado / 2500) + ')'; ctx.lineWidth = Math.max(0.6, lado / 1100);
    for (var n = 0; n < 18; n++) {   // el craquelado del vidriado
      var x0 = cx + (M.h(n, sem, 1) - 0.5) * lado, y0 = cy + (M.h(n, sem, 2) - 0.5) * lado, a = M.h(n, sem, 3) * 6.2832;
      ctx.beginPath(); ctx.moveTo(x0, y0); for (var st = 0; st < 7; st++) { a += (M.h(n, st, sem) - 0.5) * 1.4; x0 += Math.cos(a) * lado * 0.06; y0 += Math.sin(a) * lado * 0.06; ctx.lineTo(x0, y0); } ctx.stroke();
    }
    for (n = 0; n < 60; n++) { ctx.fillStyle = M.h(n, sem, 7) < 0.5 ? 'rgba(255,255,240,0.4)' : 'rgba(100,65,20,0.2)'; ctx.beginPath(); ctx.arc(cx + (M.h(n, sem, 5) - 0.5) * lado * 0.9, cy + (M.h(n, sem, 6) - 0.5) * lado * 0.9, Math.max(0.6, lado * 0.0022), 0, 6.2832); ctx.fill(); }
    ctx.restore();
  }
  // Pau 31/10: «demasiado exagerado; zoom en una baldosa del trencadís y una transición súper fluida hasta la página».
  // Un solo movimiento: la cámara vuela a la tesela de oro y, sin pararse, el zoom sigue (siempre a la misma velocidad en
  // escala, con arranque y llegada suaves) hasta que esa tesela es la pantalla. Dentro de la tesela está el templo desde el
  // principio, a su escala; al acabar, lo que se ve es exactamente la página del templo, sin corte.
  function dentroTesela(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), OR = null, A = null, A0 = null, R = null, B = null, cA = null;
    var T1 = 1700, TT = 7300, S1 = 2.4, SR = 24, SF, JW = 0.105, HL = 0.133, sem, listo = false, CARA = null;
    function sDe(t) { var u = U.tramo(t, T1, TT), e = 0.5 - 0.5 * Math.cos(Math.PI * u); return Math.exp(Math.log(S1) + (Math.log(SF) - Math.log(S1)) * e); }
    function xf(ctx, s) { ctx.translate(E.W / 2, E.H / 2); ctx.scale(s, s); ctx.translate(-OR.c[0], -OR.c[1]); }
    function caminoTesela(ctx, enc) { var c = OR.c; ctx.beginPath(); OR.q.forEach(function (v, k) { var x = c[0] + (v[0] - c[0]) * enc, y = c[1] + (v[1] - c[1]) * enc; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); }
    return {
      duracion: TT + 7400 + L, tarjeta: X.tarjeta(TT + 300, L),
      inicio: function () { OR = teselaOro(m); E.camara(OR.c[0], OR.c[1], S1, T1 - 100); },
      cuadro: function (t) {
        if (!listo && t >= T1) {
          // con la cámara quieta sobre la tesela: se prepara todo de una vez (el templo y una versión más cerca de la torre)
          listo = true; E.parar(); E.cam.x = OR.c[0]; E.cam.y = OR.c[1]; E.cam.s = S1; E.limites();
          SF = Math.max(E.W, E.H) / (0.4 * OR.lado); sem = M.monumentos.indexOf(m) * 977;
          var cq = [0, 0]; OR.q.forEach(function (v) { cq[0] += v[0] / 4; cq[1] += v[1] / 4; });
          CARA = OR.q.map(function (v) { var dx = v[0] - cq[0], dy = v[1] - cq[1], dd = Math.hypot(dx, dy) || 1, f = Math.max(0.2, 1 - JW * 0.9 / dd); return [cq[0] + dx * f, cq[1] + dy * f]; });
          // el zoom acaba justo cuando la tesela tapa la pantalla (ni antes ni después): así la llegada frena con los bordes saliendo
          function dentroCara(x, y) { var r = false; for (var i2 = 0, j2 = 3; i2 < 4; j2 = i2++) { var a2 = CARA[i2], b2 = CARA[j2]; if ((a2[1] > y) !== (b2[1] > y) && x < (b2[0] - a2[0]) * (y - a2[1]) / (b2[1] - a2[1]) + a2[0]) r = !r; } return r; }
          var lo = 10, hi = 1e5; for (var it = 0; it < 40; it++) { var mid = Math.sqrt(lo * hi), hw = E.W / 2 / mid, hh = E.H / 2 / mid, ok = [[-1, -1], [1, -1], [1, 1], [-1, 1]].every(function (c) { return dentroCara(OR.c[0] + c[0] * hw, OR.c[1] + c[1] * hh); }); if (ok) hi = mid; else lo = mid; }
          SF = hi * 1.03;
          A0 = X.copia();
          X.entrarAlTemplo(); B = X.fotoDelTemplo(); E.cambiarMundo('ciutat');
          E.cam.x = OR.c[0]; E.cam.y = OR.c[1]; E.cam.s = S1; E.limites();
          var W = E.W, H = E.H, d = dpr(), mg = 1.25; R = document.createElement('canvas'); R.width = Math.ceil(W * mg * d); R.height = Math.ceil(H * mg * d);
          var x = R.getContext('2d'), k = SR * d; x.setTransform(k, 0, 0, k, R.width / 2 - OR.c[0] * k, R.height / 2 - OR.c[1] * k);
          x.drawImage(A0, OR.c[0] - W / 2 / S1, OR.c[1] - H / 2 / S1, W / S1, H / S1);
          var r = Math.hypot(W, H) * mg / 2 / SR; M.pintarDibujo(x, M.DIBUJOS[m.d], m.X, m.Y, m.esc || 1, SR, 1.5, JW, HL, sem, [OR.c[0] - r, OR.c[1] - r, OR.c[0] + r, OR.c[1] + r]);
        }
        if (listo && t < TT) {
          var s = sDe(t);
          if (s <= E.SMAX) { E.cam.x = OR.c[0]; E.cam.y = OR.c[1]; E.cam.s = s; }   // hasta donde llega el mapa, lo pinta el mapa
          else if (!A) { A = X.copia(); cA = E.cam.s; }   // la última imagen del mapa, para seguir desde ahí
        }
        if (listo && t >= TT && E.mundo !== 'sagrada') X.entrarAlTemplo();   // y ya es la página del templo, idéntica
      },
      frente: function (ctx, t) {
        var W = E.W, H = E.H;
        if (!listo) {   // el nombre, discreto, mientras la cámara llega
          MO.pintarTexto(ctx, nombre, W / 2, H * 0.14, U.tramo(t, 150, 1100), { esc: Math.min(0.7, W / 1600), salida: U.tramo(t, 1300, 1700) });
          return;
        }
        if (t >= TT || !A) return;
        var s = sDe(t);
        ctx.save(); ctx.fillStyle = '#e6dcc7'; ctx.fillRect(0, 0, W, H); xf(ctx, s);
        // la misma basílica a cada escala: la imagen del mapa, la versión más cerca y, de muy cerca, cada pieza pintada al momento
        var aA = 1 - U.tramo(s, 18, 24), aR = U.tramo(s, 7, 11) * (1 - U.tramo(s, 40, 56)), aV = U.tramo(s, 34, 56);   // la imagen del mapa sigue debajo mientras la versión cerca no llena la pantalla
        if (aA > 0) ctx.drawImage(A, OR.c[0] - W / 2 / cA, OR.c[1] - H / 2 / cA, W / cA, H / cA);
        if (aR > 0) { ctx.globalAlpha = Math.min(1, aR * 1.6); var bw = W * 1.25 / SR, bh = H * 1.25 / SR; ctx.drawImage(R, OR.c[0] - bw / 2, OR.c[1] - bh / 2, bw, bh); ctx.globalAlpha = 1; }
        if (aV > 0) { var rr = Math.hypot(W, H) / 2 / s + 1; ctx.globalAlpha = aV; M.pintarDibujo(ctx, M.DIBUJOS[m.d], m.X, m.Y, m.esc || 1, s, 1.5, JW, HL, sem, [OR.c[0] - rr, OR.c[1] - rr, OR.c[0] + rr, OR.c[1] + rr]); ctx.globalAlpha = 1; }
        // la tesela por la que entramos no es de oro: su cara ES la página del templo (Pau 31/10: «nada de amarillo, solo el
        // dibujo de la Sagrada»). El dibujo llena toda la tesela; al acercarse, su encuadre pasa poco a poco de «cubrir la
        // tesela» a «ser la pantalla», para que al final lo que se ve sea exactamente la página
        // el encuadre del dibujo: cubre la parte de la tesela que se ve en pantalla (la tesela entera mientras es pequeña; al final,
        // justo la pantalla), así nunca queda un hueco y al llegar es exactamente la página
        var b0 = [1e9, 1e9, -1e9, -1e9]; CARA.forEach(function (v) { b0[0] = Math.min(b0[0], v[0]); b0[1] = Math.min(b0[1], v[1]); b0[2] = Math.max(b0[2], v[0]); b0[3] = Math.max(b0[3], v[1]); });
        var vx0 = Math.max(b0[0], OR.c[0] - W / 2 / s), vy0 = Math.max(b0[1], OR.c[1] - H / 2 / s), vx1 = Math.min(b0[2], OR.c[0] + W / 2 / s), vy1 = Math.min(b0[3], OR.c[1] + H / 2 / s);
        var bw3 = Math.max(vx1 - vx0, (vy1 - vy0) * W / H), bh3 = bw3 * H / W, bcx = (vx0 + vx1) / 2, bcy = (vy0 + vy1) / 2;
        ctx.save(); ctx.beginPath(); CARA.forEach(function (v, k) { k ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]); }); ctx.closePath(); ctx.clip();
        ctx.drawImage(B, bcx - bw3 / 2, bcy - bh3 / 2, bw3, bh3);
        ctx.restore();
        ctx.restore();
      },
      fin: function () { A = A0 = B = R = null; if (E.mundo !== 'sagrada') X.entrarAlTemplo(); }
    };
  }

  /* ---------- 10 · trencadís: romper y recomponer ---------- */
  function voronoi(W, H, sitios) {   // las celdas: el rectángulo de la pantalla recortado por las mediatrices
    return sitios.map(function (s, i) {
      var pol = [[0, 0], [W, 0], [W, H], [0, H]];
      sitios.forEach(function (o, j) {
        if (i === j || !pol.length) return;
        var mx = (s[0] + o[0]) / 2, my = (s[1] + o[1]) / 2, nx = o[0] - s[0], ny = o[1] - s[1], out = [];
        for (var k = 0; k < pol.length; k++) {
          var a = pol[k], b = pol[(k + 1) % pol.length], da = (a[0] - mx) * nx + (a[1] - my) * ny, db = (b[0] - mx) * nx + (b[1] - my) * ny;
          if (da <= 0) out.push(a);
          if ((da <= 0) !== (db <= 0)) { var f = da / (da - db); out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); }
        }
        pol = out;
      });
      var cx = 0, cy = 0; pol.forEach(function (q) { cx += q[0]; cy += q[1]; }); cx /= pol.length || 1; cy /= pol.length || 1;
      return { pol: pol, c: [cx, cy] };
    });
  }
  function trencadis(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), A = null, B = null, T = null, p = null, T0 = 2000, GOLPE = 2150, VUELA = 3300, CIERRA = 5900, FIN = 6800, dmax;
    function trozoDe(ctx, tr, img, dx, dy, ang, sx, sc, borde) {
      ctx.save(); ctx.translate(tr.c[0] + dx, tr.c[1] + dy); ctx.rotate(ang); ctx.scale(sx * sc, sc); ctx.translate(-tr.c[0], -tr.c[1]);
      var path = new Path2D(); tr.pol.forEach(function (q, k) { k ? path.lineTo(q[0], q[1]) : path.moveTo(q[0], q[1]); }); path.closePath();
      ctx.save(); ctx.clip(path); ctx.drawImage(img, 0, 0, E.W, E.H); ctx.restore();
      if (borde) { ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,250,235,' + borde + ')'; ctx.stroke(path); }   // el canto esmaltado del trozo
      ctx.restore();
    }
    return {
      duracion: FIN + 7600 + L, tarjeta: X.tarjeta(FIN + 300, L),
      inicio: function () { E.camara(m.X, m.Y - 185, 2.4, 1900); },
      cuadro: function (t) {
        if (!A && t >= T0) {
          A = X.copia(); p = [E.W / 2, E.H * 0.55]; X.entrarAlTemplo(); B = X.fotoDelTemplo();
          var sit = [], W = E.W, H = E.H;
          for (var k = 0; k < 34; k++) { var a = M.h(k, 1, 41) * 6.2832, r = Math.pow(M.h(k, 2, 41), 0.8) * Math.min(W, H) * 0.35; sit.push([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r]); }
          for (k = 0; k < 60; k++) sit.push([M.h(k, 3, 41) * W, M.h(k, 4, 41) * H]);
          T = voronoi(W, H, sit); dmax = Math.hypot(W, H) * 0.6;
          T.forEach(function (tr, i) { tr.d = Math.hypot(tr.c[0] - p[0], tr.c[1] - p[1]) / dmax; var a = Math.atan2(tr.c[1] - p[1], tr.c[0] - p[0]); tr.dir = [Math.cos(a), Math.sin(a)]; tr.giro = (M.h(i, 5, 41) - 0.5) * 1.6; tr.lej = 40 + M.h(i, 6, 41) * 120; });
        }
      },
      frente: function (ctx, t) {
        var W = E.W, H = E.H;
        if (!A) { X.comun(m, nombre, ctx, t, T0); return; }
        if (t > FIN) return;
        // el fondo: el lecho de mortero oscuro que se ve entre los trozos
        ctx.fillStyle = '#2a2420'; ctx.fillRect(0, 0, W, H);
        var temblor = (1 - U.tramo(t, GOLPE, GOLPE + 400)) * (t > GOLPE ? 6 : 0);
        ctx.save(); ctx.translate(Math.sin(t / 23) * temblor, Math.cos(t / 31) * temblor);
        T.forEach(function (tr) {
          var grieta = U.tramo(t, GOLPE, GOLPE + 900), roto = grieta > tr.d;
          // 1 · antes de volar: los trozos se separan un poco de la grieta
          var sep = roto ? 4 * U.tramo(t, GOLPE + tr.d * 900, GOLPE + tr.d * 900 + 300) : 0;
          // 2 · el vuelo: salen hacia fuera, giran como una moneda (a mitad de giro ya son el templo) y vuelven a su sitio
          var v = U.tramo(t, VUELA + tr.d * 900, VUELA + tr.d * 900 + 1500), arco = Math.sin(Math.PI * v), flip = Math.cos(Math.PI * v);
          var dx = tr.dir[0] * (sep + tr.lej * arco), dy = tr.dir[1] * (sep + tr.lej * arco) - 40 * arco, img = v < 0.5 ? A : B, sc = 1 + 0.2 * arco;
          if (arco > 0.05) { ctx.save(); ctx.globalAlpha = 0.35 * arco; trozoDe(ctx, tr, img, dx + 14 * arco, dy + 22 * arco, tr.giro * arco, Math.max(0.04, Math.abs(flip)), sc * 0.98, 0); ctx.restore(); }   // su sombra
          trozoDe(ctx, tr, img, dx, dy, tr.giro * arco, Math.max(0.04, Math.abs(flip)), sc, roto ? 0.5 * (1 - U.tramo(t, CIERRA, FIN)) : 0);
          if (roto && v <= 0) { ctx.save(); ctx.translate(dx, dy); ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(30,22,16,0.85)'; ctx.beginPath(); tr.pol.forEach(function (q, k) { k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.stroke(); ctx.restore(); }   // la grieta
        });
        ctx.restore();
        // el golpe: un destello blanco en el centro
        MO.halo(ctx, p[0], p[1], 260, '#fff3cf', U.meseta(t, GOLPE - 60, GOLPE, GOLPE + 80, GOLPE + 500));
        // el mortero cierra las juntas: una capa clara que entra en las rendijas y luego se limpia
        var mort = U.meseta(t, CIERRA - 400, CIERRA, CIERRA + 300, FIN);
        if (mort > 0) { ctx.save(); ctx.lineWidth = 6 * mort; ctx.strokeStyle = 'rgba(230,220,199,' + mort + ')'; T.forEach(function (tr) { ctx.beginPath(); tr.pol.forEach(function (q, k) { k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.stroke(); }); ctx.restore(); }
      },
      fin: function () { A = B = T = null; if (E.mundo !== 'sagrada') X.entrarAlTemplo(); }
    };
  }

  /* ---------- 11 · se enfoca tesela a tesela ---------- */
  function enfoca(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), A = null, B = null, NA = [], NB = [], TAM = [12, 24, 48, 96, 192, 384], T0 = 2000, BAJA = 260, MEZCLA, SUBE = 520, FIN;
    function nivel(img, tam) {   // la media de color de cada tesela de ese tamaño
      var cw = Math.ceil(E.W / tam), ch = Math.ceil(E.H / tam), c = document.createElement('canvas'); c.width = cw; c.height = ch;
      var x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, cw * tam / E.W * img.width, ch * tam / E.H * img.height, 0, 0, cw, ch);
      return { tam: tam, cw: cw, ch: ch, d: x.getImageData(0, 0, cw, ch).data };
    }
    function rgb(n, i, j, mezcla, n2) {
      var k = (j * n.cw + i) * 4, r = n.d[k], g = n.d[k + 1], b = n.d[k + 2];
      if (n2) { r += (n2.d[k] - r) * mezcla; g += (n2.d[k + 1] - g) * mezcla; b += (n2.d[k + 2] - b) * mezcla; }
      return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
    }
    function pinta(ctx, n, i, j, col, e) {
      var s = n.tam, x = i * s, y = j * s, w = s * (e == null ? 1 : e), o = (s - w) / 2;
      if (s < 24) { ctx.fillStyle = col; ctx.fillRect(x + o + 1, y + o + 1, w - 2, w - 2); return; }
      M.pieza(ctx, quad(x + o, y + o, w, w, s * 0.08, i * 13 + j * 7 + s), col, Math.max(1, s * 0.05), Math.max(1, s * 0.04));
    }
    return {
      duracion: 0, tarjeta: null,
      _crear: function () {
        MEZCLA = T0 + BAJA * TAM.length; FIN = MEZCLA + 700 + SUBE * TAM.length + 500;
        this.duracion = FIN + 7400 + L; this.tarjeta = X.tarjeta(FIN + 200, L); return this;
      },
      inicio: function () { E.camara(m.X, m.Y - 185, 2.4, 1900); },
      cuadro: function (t) {
        if (!A && t >= T0) { A = X.copia(); X.entrarAlTemplo(); B = X.fotoDelTemplo(); TAM.forEach(function (s) { NA.push(nivel(A, s)); NB.push(nivel(B, s)); }); }
      },
      frente: function (ctx, t) {
        var W = E.W, H = E.H, k, i, j;
        if (!A) { X.comun(m, nombre, ctx, t, T0); return; }
        if (t >= FIN) return;
        ctx.fillStyle = '#d9cdb4'; ctx.fillRect(0, 0, W, H);
        if (t < MEZCLA + 700) {
          // la ciudad se desenfoca: cada vez teselas más grandes; luego, las pocas que quedan cambian al color del templo
          k = Math.min(TAM.length - 1, Math.floor((t - T0) / BAJA)); var n = NA[k], mz = U.suave(U.tramo(t, MEZCLA, MEZCLA + 700));
          if (t < T0 + 200) ctx.drawImage(A, 0, 0, W, H);
          else for (j = 0; j < n.ch; j++) for (i = 0; i < n.cw; i++) pinta(ctx, n, i, j, rgb(n, i, j, mz, NB[k]), 1);
          return;
        }
        // el templo se enfoca: cada tesela se parte en cuatro, en ola desde el centro
        var tt = t - MEZCLA - 700, lv = Math.min(TAM.length - 1, Math.floor(tt / SUBE)), padre = NB[TAM.length - 1 - lv], hijo = NB[TAM.length - 2 - lv], f = (tt - lv * SUBE) / SUBE;
        for (j = 0; j < padre.ch; j++) for (i = 0; i < padre.cw; i++) pinta(ctx, padre, i, j, rgb(padre, i, j));
        if (hijo) {
          var dm = Math.hypot(W, H) / 2;
          for (j = 0; j < hijo.ch; j++) for (i = 0; i < hijo.cw; i++) {
            var d = Math.hypot((i + 0.5) * hijo.tam - W / 2, (j + 0.5) * hijo.tam - H / 2) / dm, u = U.clamp((f - d * 0.55) / 0.4, 0, 1);
            if (u > 0) pinta(ctx, hijo, i, j, rgb(hijo, i, j), u < 1 ? MO.rebote(u) : 1);
          }
        }
        var nitido = U.tramo(t, FIN - 500, FIN); if (nitido > 0) { ctx.save(); ctx.globalAlpha = nitido; ctx.drawImage(B, 0, 0, W, H); ctx.restore(); }
      },
      fin: function () { A = B = null; NA = []; NB = []; if (E.mundo !== 'sagrada') X.entrarAlTemplo(); }
    };
  }

  /* ---------- 12 · el mosaiquista trabajando ---------- */
  function mosaiquista(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), A = null, B = null, R = null, ACU = null, PERF = null, T0 = 2000, LECHO = 2700, PRIMERAS = 2900, RAPIDO, FIN, pinza = null;
    var LENTAS = 7, CADA = 420, RAP = 3000;
    function lecho(W, H) {   // el mortero fresco: gris cálido con grano y marcas de la llana
      var c = document.createElement('canvas'), d = dpr(); c.width = W * d; c.height = H * d; var x = c.getContext('2d'); x.scale(d, d);
      x.fillStyle = '#cfc4ae'; x.fillRect(0, 0, W, H);
      for (var i = 0; i < 4000; i++) { x.fillStyle = M.h(i, 1, 7) < 0.5 ? 'rgba(90,75,55,0.12)' : 'rgba(255,255,255,0.25)'; x.fillRect(M.h(i, 2, 7) * W, M.h(i, 3, 7) * H, 1.5, 1.5); }
      x.strokeStyle = 'rgba(120,100,75,0.06)'; x.lineWidth = 9; for (i = 0; i < 26; i++) { var y = M.h(i, 4, 7) * H; x.beginPath(); x.moveTo(-20, y); x.quadraticCurveTo(W / 2, y + (M.h(i, 5, 7) - 0.5) * 80, W + 20, y + (M.h(i, 6, 7) - 0.5) * 40); x.stroke(); }
      return c;
    }
    function pinzas(ctx, x, y, alfa, abierta) {   // unas pinzas de acero, vistas desde arriba, con la punta en (x, y)
      if (alfa <= 0) return; ctx.save(); ctx.globalAlpha = alfa; ctx.translate(x, y); ctx.rotate(-0.75);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.moveTo(10, 14); ctx.lineTo(150, 4 + 14); ctx.lineTo(150, 22 + 14); ctx.closePath(); ctx.fill();   // la sombra
      [-1, 1].forEach(function (sg) {
        var gr = ctx.createLinearGradient(0, sg * 6, 0, sg * 1); gr.addColorStop(0, '#8a9096'); gr.addColorStop(1, '#e6e9eb');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, sg * (1 + abierta * 3)); ctx.lineTo(150, sg * (9 + abierta * 4)); ctx.lineTo(150, sg * (3 + abierta * 4)); ctx.lineTo(4, sg * (abierta * 3)); ctx.closePath(); ctx.fill();
      });
      ctx.restore();
    }
    return {
      duracion: 0, tarjeta: null,
      _crear: function () { RAPIDO = PRIMERAS + LENTAS * CADA; FIN = RAPIDO + RAP + 400; this.duracion = FIN + 7400 + L; this.tarjeta = X.tarjeta(FIN + 200, L); return this; },
      inicio: function () { E.camara(m.X, m.Y - 185, 2.4, 1900); },
      cuadro: function (t) {
        if (!A && t >= T0) {
          A = X.copia(); X.entrarAlTemplo(); B = X.fotoDelTemplo(); R = X.rejilla(14); R.cruz = E.aPantalla(0, -158); PERF = BC.entradas.perfilPantalla ? BC.entradas.perfilPantalla() : [];
          ACU = document.createElement('canvas'); ACU.width = E.W * dpr(); ACU.height = E.H * dpr(); ACU.getContext('2d').drawImage(lecho(E.W, E.H), 0, 0);
          // las primeras, a mano y despacio: las de la cruz de la torre de Jesús; luego el resto, de abajo arriba y cada vez más deprisa
          var cruz = E.aPantalla(0, -164), N = R.l.length;
          R.l.forEach(function (c) { c.dc = Math.hypot(c.x + 7 - cruz[0], c.y + 7 - cruz[1]); });
          var orden = R.l.slice().sort(function (a, b) { return a.dc - b.dc; }), lentas = orden.slice(0, LENTAS);
          lentas.forEach(function (c, k) { c.tp = PRIMERAS + k * CADA; c.lenta = true; });
          var resto = R.l.filter(function (c) { return !c.lenta; }).sort(function (a, b) { return (b.y + b.r * 90) - (a.y + a.r * 90); });
          resto.forEach(function (c, k) { c.tp = RAPIDO + RAP * Math.pow(k / resto.length, 0.42); });
          R.ord = lentas.concat(resto); R.n = 0;
        }
      },
      frente: function (ctx, t) {
        var W = E.W, H = E.H, tam = R ? R.tam : 14;
        if (!A) { X.comun(m, nombre, ctx, t, T0); return; }
        if (t >= FIN + 300) return;
        // la ciudad se aparta y queda el lecho de mortero con el dibujo en ocre
        var acx = ACU.getContext('2d'), k = dpr();
        while (R.n < R.ord.length && t > R.ord[R.n].tp + (R.ord[R.n].lenta ? 380 : 160)) { var c = R.ord[R.n]; acx.drawImage(B, c.x * B.width / W, c.y * B.height / H, tam * B.width / W, tam * B.height / H, c.x * k, c.y * k, tam * k, tam * k); R.n++; }
        // la vista: primero muy cerca de la cruz (se ven las pinzas y cada tesela); cuando todo se acelera, se aleja
        var zv = 1 + 2.4 * U.suave(U.tramo(t, LECHO - 200, PRIMERAS)) * (1 - U.suave(U.tramo(t, RAPIDO - 100, RAPIDO + 900))), cz = R.cruz;
        var kz = (zv - 1) / 2.4, off = [cz[0] + (W / 2 - cz[0]) * kz, cz[1] + (H * 0.45 - cz[1]) * kz];   // la cruz se lleva al centro de la pantalla
        function vis(p2) { return [off[0] + (p2[0] - cz[0]) * zv, off[1] + (p2[1] - cz[1]) * zv]; }
        ctx.save(); ctx.translate(off[0], off[1]); ctx.scale(zv, zv); ctx.translate(-cz[0], -cz[1]); ctx.setLineDash([]);
        ctx.drawImage(ACU, 0, 0, W, H);
        var boceto = U.tramo(t, LECHO - 300, LECHO + 600) * (1 - U.tramo(t, RAPIDO + RAP * 0.5, FIN));
        if (boceto > 0) { ctx.save(); ctx.globalAlpha = boceto; ctx.strokeStyle = 'rgba(176,90,48,0.75)'; ctx.lineWidth = 1.6; PERF.forEach(function (pl) { ctx.beginPath(); pl.forEach(function (q, i) { i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); }); ctx.restore(); }
        var ciudad = 1 - U.suave(U.tramo(t, T0, LECHO)); if (ciudad > 0) { ctx.save(); ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0); ctx.globalAlpha = ciudad; ctx.drawImage(A, 0, 0, W, H); ctx.restore(); }
        // las teselas que se están colocando ahora: bajan desde las pinzas y se asientan con un golpecito
        var ultima = null;
        for (var i = R.n; i < R.ord.length; i++) {
          var q = R.ord[i]; if (q.tp > t) break;
          var dur = q.lenta ? 380 : 160, u = (t - q.tp) / dur, e = u < 0.7 ? 1.35 - 0.35 * (u / 0.7) : 1 + 0.05 * Math.sin((u - 0.7) / 0.3 * Math.PI), sh = (1 - u) * 6;
          ctx.save(); ctx.globalAlpha = 0.3 * (1 - u); ctx.fillStyle = '#000'; ctx.fillRect(q.x + sh, q.y + sh * 1.3, tam, tam); ctx.restore();
          X.trozo(ctx, B, q.x, q.y, tam, tam, q.x + tam / 2 - tam * e / 2, q.y + tam / 2 - tam * e / 2, tam * e, tam * e);
          ultima = q;
        }
        ctx.restore();
        // las pinzas: en las primeras, van y vienen con calma; luego corren detrás de la última tesela
        if (ultima) { var obj = vis([ultima.x + tam / 2, ultima.y + tam / 2]); pinza = pinza ? [pinza[0] + (obj[0] - pinza[0]) * 0.35, pinza[1] + (obj[1] - pinza[1]) * 0.35] : obj; }
        if (pinza) pinzas(ctx, pinza[0], pinza[1], 1 - U.tramo(t, RAPIDO + RAP - 300, FIN), ultima && ultima.lenta ? 0 : 0.5);
        // el contador, como en un taller
        var n = R.n + (ultima ? 1 : 0);
        X.versalitas(ctx, ID.t('tesseles') + '  ' + U.num(n), W - 40, H - 40, 12, '#f2b33d', U.tramo(t, PRIMERAS, PRIMERAS + 400) * (1 - U.tramo(t, FIN, FIN + 300)), 'right');
        var fin2 = U.tramo(t, FIN, FIN + 300); if (fin2 > 0) { ctx.save(); ctx.globalAlpha = fin2; ctx.drawImage(B, 0, 0, W, H); ctx.restore(); }
      },
      fin: function () { A = B = ACU = null; if (E.mundo !== 'sagrada') X.entrarAlTemplo(); }
    };
  }

  var mas = BC.entradas.mas || (BC.entradas.mas = []);
  // las variantes con duración calculada se crean con _crear()
  mas.push(dentroTesela, trencadis, function (L) { return enfoca(L)._crear(); }, function (L) { return mosaiquista(L)._crear(); });
})();
