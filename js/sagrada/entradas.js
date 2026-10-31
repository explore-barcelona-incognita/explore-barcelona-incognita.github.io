/* Barcelona Incognita · cuatro maneras de entrar en la Sagrada Família (Pau 31/10/2026: «haz las cuatro y elijo»)
   Se elige con ?entrada=1…4 en la dirección (la 1 por defecto). Todas empiezan igual: «GAUDÍ» se monta en teselas de oro
   y la cámara vuela hasta la basílica. Luego:
     1 · las teselas se dan la vuelta: desde la basílica hacia fuera, cada pieza de la ciudad gira como una carta y por
         detrás ya es el templo cortado
     2 · entrar por la puerta: la cámara se mete por el portal, todo se queda a oscuras, se encienden los vitrales y se aleja
     3 · la maqueta: la basílica se levanta del mapa, crece y su fachada se abre como la tapa de una casa de muñecas
     4 · caen y se recolocan: las teselas de la ciudad caen y otras vuelan a su sitio hasta montar el templo
   Cada una devuelve la escena para BC.porta (js/sagrada/porta.js). */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, E = BC.motor, MO = BC.mosaico, FX = BC.fx;
  var OSCURO = '#14110f';

  function copia() { var cv = E.lienzo(), c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0); return c; }
  // un trozo de una foto de pantalla (en px de CSS) dibujado en otro sitio
  function trozo(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) { var k = img.width / E.W; ctx.drawImage(img, sx * k, sy * k, sw * k, sh * k, dx, dy, dw, dh); }
  function rejilla() {
    var tam = Math.max(26, Math.round(Math.min(E.W, E.H) / 22)), l = [];
    for (var j = 0; j * tam < E.H; j++) for (var i = 0; i * tam < E.W; i++) l.push({ x: i * tam, y: j * tam, i: i, j: j, r: M.h(i, j, 77) });
    return { tam: tam, l: l, cols: Math.ceil(E.W / tam), filas: Math.ceil(E.H / tam) };
  }
  function suave3(u) { u = U.clamp(u, 0, 1); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function rebote(u) { u = U.clamp(u, 0, 1); var c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); }

  // dentro del templo: el encuadre final (entero, apartado a la derecha para la tarjeta en pantallas anchas)
  function encuadreFinal() { return { x: E.W < 700 ? 0 : -46, y: -85, s: E.sMin() }; }
  function entrarAlTemplo(cam) {
    E.cambiarMundo('sagrada', { x: 0, y: -85, s: 0 });
    var f = cam || encuadreFinal(); E.cam.x = f.x; E.cam.y = f.y; E.cam.s = (f.k || 1) * (f.s || E.sMin()); E.limites();   // k: cuántas veces más cerca que el encuadre entero
  }
  function fotoDelTemplo() { E.pintarTodo(); return copia(); }   // pinta todo lo que se ve y se guarda

  // lo común: el nombre en teselas de oro mientras la cámara vuela delante de la basílica, y la ciudad se apaga alrededor
  function comun(m, nombre, ctx, t, hasta) {
    var W = E.W, H = E.H, s = E.cam.s, f = Math.max(1, Math.min(3.6, 0.9 / s)) * (m.esc || 1);
    MO.pintarTexto(ctx, nombre, W / 2, H * 0.14, U.tramo(t, 250, 1500), { esc: Math.min(0.8, W / 1500), salida: U.tramo(t, hasta - 700, hasta) });
    FX.foco(ctx, m.X, m.Y - 180 * f, 210 * f * s, U.suave(U.tramo(t, 500, 1800)) * 0.9);
  }
  function tarjeta(en, L) { return { en: en, hasta: en + 7200 + L, etiqueta: BC.idioma.t('portaEtq'), titulo: BC.idioma.t('portaTit'), texto: BC.idioma.t('portaTxt'), pie: BC.idioma.t('portaPie') }; }

  /* ---------- 1 · las teselas se dan la vuelta ---------- */
  function girar(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), A = null, B = null, R = null, c0 = null, T0 = 2100, ONDA = 1900, GIRO = 560;
    return {
      duracion: T0 + ONDA + GIRO + 7900 + L, tarjeta: tarjeta(T0 + ONDA + GIRO + 300, L),
      inicio: function () { E.camara(m.X, m.Y - 185, 2.0, 1900); },
      cuadro: function (t) {
        if (!A && t >= T0) {
          A = copia(); c0 = E.aPantalla(m.X, m.Y - 185 * 1);   // el centro de la onda: la basílica en pantalla
          entrarAlTemplo(); B = fotoDelTemplo(); R = rejilla();
          var dmax = 0; R.l.forEach(function (c) { c.d = Math.hypot(c.x + R.tam / 2 - c0[0], c.y + R.tam / 2 - c0[1]); dmax = Math.max(dmax, c.d); }); R.dmax = dmax;
        }
      },
      frente: function (ctx, t) {
        if (!A) { comun(m, nombre, ctx, t, T0); return; }
        var tam = R.tam;
        R.l.forEach(function (c) {
          var u = (t - T0 - c.d / R.dmax * ONDA - c.r * 160) / GIRO;
          if (u >= 1) return;
          if (u <= 0) { trozo(ctx, A, c.x, c.y, tam, tam, c.x, c.y, tam, tam); return; }
          var e = suave3(u), sc = Math.abs(Math.cos(Math.PI * e)), lev = Math.sin(Math.PI * e), img = e < 0.5 ? A : B, k = 1 + 0.28 * lev, w = tam * sc * k, hh = tam * k;
          ctx.fillStyle = '#5a4a3a'; ctx.fillRect(c.x, c.y, tam, tam);   // el hueco (el mortero) que deja la pieza al levantarse
          ctx.save(); ctx.globalAlpha = 0.35 * lev; ctx.fillStyle = '#000'; ctx.fillRect(c.x + tam / 2 - w / 2 + 6 * lev, c.y + tam / 2 - hh / 2 + 8 * lev, w, hh); ctx.restore();   // su sombra
          trozo(ctx, img, c.x, c.y, tam, tam, c.x + tam / 2 - w / 2, c.y + tam / 2 - hh / 2, w, hh);
          ctx.fillStyle = 'rgba(255,248,230,' + (0.25 * lev * (1 - sc)) + ')'; ctx.fillRect(c.x + tam / 2 - w / 2, c.y + tam / 2 - hh / 2, w, hh);   // el brillo del esmalte al ponerse de canto
        });
      },
      fin: function () { A = B = null; if (E.mundo !== 'sagrada') entrarAlTemplo(); }
    };
  }

  /* ---------- 2 · entrar por la puerta ---------- */
  function puerta(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), dentro = false, T1 = 1900, T2 = 3500, T3 = 3700, T4 = 5600;
    var VENT = [-26.25, -18.75, -11.25, 11.25, 18.75, 26.25];
    return {
      duracion: T4 + 5200 + L, tarjeta: tarjeta(T4 + 3600, L),
      inicio: function () { E.camara(m.X, m.Y - 185, 2.0, T1); },
      cuadro: function (t) {
        if (t >= T1 && t < T1 + 60) { E.camara(m.X, m.Y - 22, E.SMAX, T2 - T1); }   // hacia el portal, cada vez más deprisa
        if (!dentro && t >= T3) {
          dentro = true; entrarAlTemplo({ x: 0, y: -16, k: 3.2 });
        }
        if (dentro && t >= T4 && t < T4 + 60) { var f = encuadreFinal(); E.camara(f.x, f.y, f.s, 4200); }
      },
      frente: function (ctx, t) {
        var W = E.W, H = E.H;
        if (!dentro) {
          comun(m, nombre, ctx, t, T1 + 300);
          // un iris que se cierra sobre el portal
          var p = E.aPantalla(m.X, m.Y - 22), r = Math.hypot(W, H) * (1 - U.suave(U.tramo(t, T1 + 300, T2)));
          ctx.save(); ctx.fillStyle = OSCURO; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(p[0], p[1], Math.max(0, r), 0, 6.2832, true); ctx.fill('evenodd'); ctx.restore();
          if (t > T2) { ctx.fillStyle = OSCURO; ctx.fillRect(0, 0, W, H); }
          return;
        }
        // a oscuras; se encienden los vitrales uno a uno (fríos y cálidos) y la luz llena la nave
        var osc = 1 - U.suave(U.tramo(t, T3 + 900, T4 + 300));
        if (osc > 0) { ctx.save(); ctx.globalAlpha = osc; ctx.fillStyle = OSCURO; ctx.fillRect(0, 0, W, H); ctx.restore(); }
        VENT.forEach(function (x, n) {
          var on = U.meseta(t, T3 + 200 + n * 180, T3 + 600 + n * 180, T4, T4 + 1400);
          [-8, -30].forEach(function (y) { var q = E.aPantalla(x, y); MO.halo(ctx, q[0], q[1], 13 * E.cam.s, x < 0 ? '#5fa3da' : '#f08a4b', on); });
        });
      },
      fin: function () { if (E.mundo !== 'sagrada') entrarAlTemplo(); }
    };
  }

  /* ---------- 3 · la maqueta que se abre ----------
     La basílica del mapa (pintada sola, sin la ciudad, con el mismo lápiz) se despega del suelo como una maqueta, crece hasta
     ocupar el sitio del templo en el corte y su fachada se abre hacia un lado como la tapa de una casa de muñecas. */
  function sprite(m, s) {   // la basílica del mapa sola, en un lienzo transparente, al zoom s
    var fz = Math.max(1, Math.min(3.6, 0.9 / s)) * (m.esc || 1), w = (m.ancho + 30) * 2 * fz, hh = (m.alto + 30) * fz, d = Math.min(window.devicePixelRatio || 1, 2), k = s * d;
    var c = document.createElement('canvas'); c.width = Math.ceil(w * k); c.height = Math.ceil(hh * k);
    var x = c.getContext('2d'); x.setTransform(k, 0, 0, k, (w / 2) * k, (hh - 10 * fz) * k);   // origen: el pie de la basílica
    M.pintarDibujo(x, M.DIBUJOS[m.d], 0, 0, fz, s, Math.max(4.4 / (s * fz), 1.5), 0.6 / s, 0.8 / s, 4242, [-w, -hh, w, hh]);
    return { c: c, w: w * s, h: hh * s, pie: (hh - 10 * fz) * s };   // en px de pantalla
  }
  function maqueta(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), A = null, B = null, SP = null, r0 = null, rB = null, T0 = 2000, T1 = 3200, T2 = 4500, T3 = 6000;
    return {
      duracion: T3 + 7800 + L, tarjeta: tarjeta(T3 + 300, L),
      inicio: function () { E.camara(m.X, m.Y - 185, 2.0, 1900); },
      cuadro: function (t) {
        if (!A && t >= T0) {
          A = copia(); SP = sprite(m, E.cam.s);
          var p = E.aPantalla(m.X, m.Y); r0 = [p[0] - SP.w / 2, p[1] - SP.pie, SP.w, SP.h];
          entrarAlTemplo(); B = fotoDelTemplo();
          var q0 = E.aPantalla(-50, -185), q1 = E.aPantalla(50, 4); rB = [q0[0], q0[1], q1[0] - q0[0], q1[1] - q0[1]];   // el sitio del templo en el corte
        }
      },
      frente: function (ctx, t) {
        var W = E.W, H = E.H;
        if (!A) { comun(m, nombre, ctx, t, T0); return; }
        var lev = suave3(U.tramo(t, T0, T1)), crece = suave3(U.tramo(t, T1, T2)), abre = suave3(U.tramo(t, T2, T3)), fuera = U.tramo(t, T3, T3 + 500);
        if (fuera >= 1) return;
        // detrás: la ciudad que se apaga y, mientras la maqueta crece, el templo cortado que aparece
        if (crece < 1) { ctx.drawImage(A, 0, 0, W, H); ctx.fillStyle = 'rgba(20,17,15,' + (0.6 * lev) + ')'; ctx.fillRect(0, 0, W, H); }
        ctx.save(); ctx.globalAlpha = crece; ctx.drawImage(B, 0, 0, W, H); ctx.restore();
        // la maqueta: sube del mapa y luego vuela y crece hasta el sitio del templo
        var r = r0.slice(); r[1] -= 60 * lev; r[0] -= r[2] * 0.05 * lev; r[2] *= 1 + 0.1 * lev; r[3] *= 1 + 0.1 * lev;
        var e = crece; r = r.map(function (v, i) { return v + (rB[i] - v) * e; });
        ctx.save(); ctx.globalAlpha = 0.45 * lev * (1 - crece); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(r0[0] + r0[2] / 2, r0[1] + r0[3] - 6, r0[2] * 0.5, r0[3] * 0.05, 0, 0, 6.2832); ctx.fill(); ctx.restore();   // su sombra
        // la fachada: la tapa, con la bisagra a la izquierda, que gira y deja ver el corte de dentro
        var ang = abre * Math.PI * 0.55, sc = Math.cos(ang);
        ctx.save(); ctx.globalAlpha = 1 - fuera;
        if (sc > 0.03) {
          ctx.save(); ctx.translate(r[0], r[1]); ctx.transform(sc, -Math.sin(ang) * 0.25, 0, 1, 0, 0);
          ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetX = 14 * abre + 6 * lev; ctx.shadowOffsetY = 10 * lev;
          ctx.drawImage(SP.c, 0, 0, r[2], r[3]);
          ctx.restore();
          if (abre > 0) { ctx.save(); ctx.translate(r[0], r[1]); ctx.transform(sc, -Math.sin(ang) * 0.25, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-atop'; ctx.restore(); }
          for (var y = 0; y < r[3]; y += 16) MO.tesela(ctx, r[0] + r[2] * sc, r[1] + y - r[2] * sc * Math.sin(ang) * 0.25 / Math.max(0.05, sc) * sc, 10, MO.ORO[(y / 16 | 0) % 5], 1, 600 + y, { sombra: false, alfa: Math.min(1, abre * 5) });   // el filo de oro de la tapa
        }
        ctx.restore();
      },
      fin: function () { A = B = SP = null; if (E.mundo !== 'sagrada') entrarAlTemplo(); }
    };
  }

  /* ---------- 4 · caen y se recolocan ---------- */
  function recolocar(L) {
    var m = M.monumento('sagrada'), nombre = MO.texto('GAUDÍ', 110, 9), A = null, B = null, R = null, T0 = 2100, CAE = 1500, MONTA = 2600, VUELO = 700;
    return {
      duracion: T0 + MONTA + VUELO + 8600 + L, tarjeta: tarjeta(T0 + MONTA + VUELO + 900, L),
      inicio: function () { E.camara(m.X, m.Y - 185, 2.0, 1900); },
      cuadro: function (t) {
        if (!A && t >= T0) {
          A = copia(); entrarAlTemplo(); B = fotoDelTemplo(); R = rejilla();
          R.l.forEach(function (c) {
            c.caeD = c.r * 700 + (R.filas - c.j) * 18; c.vx = (M.h(c.i, c.j, 5) - 0.5) * 240; c.giro = (M.h(c.i, c.j, 6) - 0.5) * 7;
            c.montaD = 700 + (R.filas - 1 - c.j) / R.filas * MONTA * 0.75 + c.r * MONTA * 0.25;   // se monta de abajo arriba, como una pared
            var a = M.h(c.i, c.j, 7) * 6.2832; c.ox = c.x + Math.cos(a) * E.W * 0.7; c.oy = c.y - E.H * (0.6 + M.h(c.i, c.j, 8));
          });
        }
      },
      frente: function (ctx, t) {
        if (!A) { comun(m, nombre, ctx, t, T0); return; }
        var W = E.W, H = E.H, tam = R.tam, tt = t - T0, todas = true;
        R.l.forEach(function (c) { if (tt < c.montaD + VUELO) todas = false; });
        if (todas) return;
        ctx.fillStyle = OSCURO; ctx.fillRect(0, 0, W, H);
        // las piezas del templo, que vuelan a su sitio y se asientan con un pequeño rebote
        R.l.forEach(function (c) {
          var u = (tt - c.montaD) / VUELO; if (u <= 0) return;
          var e = rebote(u), x = c.ox + (c.x - c.ox) * e, y = c.oy + (c.y - c.oy) * e, g = (1 - U.clamp(u, 0, 1)) * c.giro;
          ctx.save(); ctx.translate(x + tam / 2, y + tam / 2); ctx.rotate(g); trozo(ctx, B, c.x, c.y, tam, tam, -tam / 2, -tam / 2, tam, tam); ctx.restore();
        });
        // las piezas de la ciudad, que caen girando
        R.l.forEach(function (c) {
          var s = (tt - c.caeD) / 1000;
          if (s <= 0) { trozo(ctx, A, c.x, c.y, tam, tam, c.x, c.y, tam, tam); return; }
          if (s > 1.6) return;
          ctx.save(); ctx.globalAlpha = 1 - U.tramo(s, 1.1, 1.6); ctx.translate(c.x + tam / 2 + c.vx * s, c.y + tam / 2 + 900 * s * s); ctx.rotate(c.giro * s);
          trozo(ctx, A, c.x, c.y, tam, tam, -tam / 2, -tam / 2, tam, tam); ctx.restore();
        });
      },
      fin: function () { A = B = null; if (E.mundo !== 'sagrada') entrarAlTemplo(); }
    };
  }

  var cual = +((/[?&]entrada=(\d+)/.exec(location.search) || [])[1] || 9);   // por defecto, la 9: el zoom dentro de una tesela (la que eligió Pau)
  function rejillaDe(tam) { var l = []; for (var j = 0; j * tam < E.H; j++) for (var i = 0; i * tam < E.W; i++) l.push({ x: i * tam, y: j * tam, i: i, j: j, r: M.h(i, j, 77) }); return { tam: tam, l: l, cols: Math.ceil(E.W / tam), filas: Math.ceil(E.H / tam) }; }
  function versalitas(ctx, txt, x, y, tam, color, alfa, alin) {
    if (alfa <= 0) return; ctx.save(); ctx.globalAlpha = alfa; ctx.font = '500 ' + tam + 'px "IBM Plex Mono", monospace'; ctx.textAlign = alin || 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color; ctx.fillText(String(txt).toUpperCase().split('').join(String.fromCharCode(8202)), x, y); ctx.restore();
  }
  BC.entradas = { cual: cual, escena: function () { var L = E.lectura, todas = [girar, puerta, maqueta, recolocar].concat(BC.entradas.mas || []); return todas[Math.min(todas.length, Math.max(1, BC.entradas.cual)) - 1](L); },
    util: { copia: copia, trozo: trozo, rejilla: rejillaDe, entrarAlTemplo: entrarAlTemplo, fotoDelTemplo: fotoDelTemplo, encuadreFinal: encuadreFinal, comun: comun, tarjeta: tarjeta, versalitas: versalitas }, girar: girar, puerta: puerta, maqueta: maqueta, recolocar: recolocar };
})();
