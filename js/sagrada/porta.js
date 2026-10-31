/* Barcelona Incognita · la puerta de la Sagrada Família (Pau, 31/10/2026)
   En la ciudad, escribir GAUDI (o GAUDÍ) abre el templo: la cámara se pone delante de la basílica, su nombre se monta en
   teselas de oro, una grieta de oro baja por el eje, la luz se cuela y la ciudad se parte en dos mitades que se abren como
   puertas; detrás está el corte (js/sagrada/seccio.js), que se asienta alejándose un poco. La pista está en la tarjeta del secreto 03.
   Para volver: el botón «Torna a la ciutat» o ⌫ (con el cuaderno cerrado). */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, E = BC.motor, MO = BC.mosaico, FX = BC.fx;
  var PIEDRA = ['#c9a46a', '#b8925e', '#d6b47c', '#a67f4f', '#ddbb85', '#8f6a42'], ORO = MO.ORO;
  var CLAVE = 'GAUDI';

  // el telón: una rejilla de teselas de pantalla que se cierra desde la línea del centro hacia los lados (f = 0 … 1)
  function telon(ctx, f, abrir) {
    if (f <= 0) return;
    var tam = Math.max(26, Math.min(40, E.W / 36)), nx = Math.ceil(E.W / tam) + 1, ny = Math.ceil(E.H / tam) + 1;
    ctx.save(); ctx.fillStyle = 'rgba(20,17,15,' + (0.9 * U.clamp(f * 1.6 - (abrir ? 0.6 : 0), 0, 1)) + ')'; ctx.fillRect(0, 0, E.W, E.H); ctx.restore();
    for (var j = 0; j < ny; j++) for (var i = 0; i < nx; i++) {
      var x = i * tam + (j % 2) * tam * 0.5, y = j * tam, d = Math.abs(x - E.W / 2) / (E.W / 2), r = M.h(i, j, 3);
      var u = U.clamp((f * 1.5 - d * 0.5 - r * 0.25) / 0.45, 0, 1);
      if (u <= 0) continue;
      var dorada = Math.abs(x - E.W / 2) < tam * 0.9 && r < 0.7;   // la grieta de oro queda en el centro
      MO.tesela(ctx, x, y, tam * 0.98, dorada ? ORO[Math.floor(r * 5)] : PIEDRA[Math.floor(M.h(j, i, 4) * PIEDRA.length)], u, i * 977 + j, { sombra: false });
    }
  }

  /* ---------- el corte: la ciudad se parte en dos por el eje de la basílica (Pau 31/10: «cortada por la mitad») ----------
     Se guarda una foto de la pantalla y se trocea por una línea quebrada de teselas; cada mitad se abre como una puerta
     pesada (se desliza, gira un poco y se ve su canto de cerámica con un filo de oro) y detrás aparece el corte del templo. */
  function lineaCorte(W, H, sem) { var p = []; for (var y = -30, i = 0; y <= H + 30; y += 15, i++) p.push([W / 2 + (M.h(i, sem, 1) - 0.5) * 16, y]); return p; }
  function copia() { var cv = E.lienzo(), c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0); return c; }
  function mitad(ctx, img, linea, lado, u, filo) {   // lado -1 izquierda, 1 derecha; u = 0 cerrada … 1 abierta del todo
    var W = E.W, H = E.H, e = u * u * (3 - 2 * u), dx = lado * e * (W / 2 + 120), giro = lado * e * 0.07, sc = 1 + e * 0.05;
    if (e >= 1) return;
    ctx.save();
    ctx.translate(W / 2 + dx, H); ctx.rotate(giro); ctx.scale(sc, sc); ctx.translate(-W / 2, -H);
    var borde = new Path2D(); borde.moveTo(lado < 0 ? -40 : W + 40, -40); linea.forEach(function (q) { borde.lineTo(q[0], q[1]); }); borde.lineTo(lado < 0 ? -40 : W + 40, H + 40); borde.closePath();
    // la sombra que la mitad deja sobre el templo que se descubre
    ctx.save(); ctx.shadowColor = 'rgba(20,17,15,' + (0.55 * Math.min(1, e * 4)) + ')'; ctx.shadowBlur = 40; ctx.shadowOffsetX = lado * 10; ctx.fillStyle = '#14110f'; ctx.fill(borde); ctx.restore();
    ctx.save(); ctx.clip(borde); ctx.drawImage(img, 0, 0, W, H);
    // el canto: una franja oscura junto al corte (el grueso de la cerámica)
    var g = ctx.createLinearGradient(W / 2 - lado * 50, 0, W / 2, 0); g.addColorStop(0, 'rgba(20,17,15,0)'); g.addColorStop(1, 'rgba(20,17,15,' + (0.45 * Math.min(1, e * 5)) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    // el grueso de la mitad, visto de canto mientras gira: una franja de estratos (la cerámica del mapa, el mortero y la
    // tierra), hecha de teselas, como el corte de un pastel
    var g2 = 34 * Math.min(1, e * 3);
    if (g2 > 1) for (var k2 = 0; k2 < linea.length - 1; k2++) {
      var a = linea[k2], b = linea[k2 + 1];
      for (var c = 0; c < 3; c++) {
        var o0 = -lado * g2 * c / 3, o1 = -lado * g2 * (c + 1) / 3, col = [['#c9693e', '#d8452f', '#e8892f'], ['#e6dcc7', '#d9cdb4'], ['#8f6236', '#7c5a38', '#a0703f']][c];
        var q = [[a[0] + o0, a[1]], [a[0] + o1, a[1]], [b[0] + o1, b[1]], [b[0] + o0, b[1]]];
        ctx.save(); ctx.globalAlpha = Math.min(1, e * 4); M.pieza(ctx, q, M.tono(col[(k2 + c) % col.length], 0.88 + M.h(k2, c, 5) * 0.2), 0.9, 1); ctx.restore();
      }
    }
    // el filo de oro a lo largo del corte, de teselas
    for (var k = 0; k < linea.length; k++) MO.tesela(ctx, linea[k][0] - lado * (5 + g2), linea[k][1], 14, ORO[k % ORO.length], 1, 700 + k + (lado > 0 ? 50 : 0), { sombra: false, alfa: filo });
    ctx.restore();
  }

  function escenaEntrar() {
    var m = M.monumento('sagrada'), L = E.lectura, foto = null, linea = null, cambiado = false, base = null, nombre = MO.texto('GAUDÍ', 110, 9);
    var CH = ORO.concat(['#fbf8f0', '#e8892f', '#c9693e', '#f3eee2']), astillas = [];   // las astillas que saltan del corte: salen hacia los lados y caen
    for (var a = 0; a < 46; a++) astillas.push({ y: M.h(a, 1, 31), vx: (M.h(a, 2, 31) < 0.5 ? -1 : 1) * (60 + M.h(a, 3, 31) * 260), vy: -80 - M.h(a, 4, 31) * 220, giro: (M.h(a, 5, 31) - 0.5) * 8, tam: 7 + M.h(a, 6, 31) * 9, col: CH[a % CH.length], d: M.h(a, 7, 31) * 350 });
    function fz(s) { return Math.max(1, Math.min(3.6, 0.9 / s)) * (m.esc || 1); }
    var T1 = 1900, T2 = 3500, T3 = 3650, T4 = 5700;   // llegar · la grieta · el corte · abierto
    return {
      duracion: 14900 + L,
      tarjeta: { en: 7000, hasta: 14200 + L, etiqueta: BC.idioma.t('portaEtq'), titulo: BC.idioma.t('portaTit'), texto: BC.idioma.t('portaTxt'), pie: BC.idioma.t('portaPie') },
      // la cámara se pone delante de la basílica, centrada (la línea del corte pasa por la mitad de la pantalla)
      inicio: function () { var s = 2.0, f = fz(s); E.camara(m.X, m.Y - 185 * f, s, T1); },   // la basílica llena la pantalla
      cuadro: function (t) {
        if (!cambiado && t >= T3) {   // la foto de la ciudad, ya con la grieta, y dentro del templo
          foto = copia(); linea = lineaCorte(E.W, E.H, 7); cambiado = true;
          E.cambiarMundo('sagrada', { x: 0, y: -85, s: 0 });
          var s0 = E.sMin(), estrecha = E.W < 700;
          E.cam.x = 0; E.cam.y = -26; E.cam.s = s0 * 2.4; E.limites();   // dentro: primero, de cerca, los vitrales y las columnas
          E.camara(estrecha ? 0 : -46, -85, s0, 4200);   // y se aleja hasta verla entera, a la derecha de la tarjeta
        }
        // la ciudad tiembla un poco mientras la grieta se abre paso
        if (!cambiado && t > T1 - 100) {
          if (!base) base = [E.cam.x, E.cam.y];
          var amp = 3 * U.tramo(t, T1, T2) / E.cam.s;
          E.cam.x = base[0] + Math.sin(t / 37) * amp; E.cam.y = base[1] + Math.cos(t / 29) * amp * 0.6;
        }
      },
      frente: function (ctx, t) {
        var W = E.W, H = E.H;
        if (!cambiado) {
          var s = E.cam.s, f = fz(s), top = E.aPantalla(m.X, m.Y - 362 * f), pie = E.aPantalla(m.X, m.Y + 8);
          FX.foco(ctx, m.X, m.Y - 180 * f, 210 * f * s, U.suave(U.tramo(t, 600, T1)));   // la ciudad se apaga alrededor
          // el nombre del arquitecto, en teselas de oro, sobre la basílica
          MO.pintarTexto(ctx, nombre, W / 2, H * 0.16, U.tramo(t, 250, 1500), { esc: Math.min(0.8, W / 1500), salida: U.tramo(t, 1900, 2700) });
          // la grieta: una línea de teselas de oro que baja por el eje de la torre de Jesús hasta el suelo y sigue por toda la pantalla
          var g = U.suave(U.tramo(t, T1 - 200, T2));
          var pts = [E.aMundo(W / 2, -20), E.aMundo(W / 2, top[1]), E.aMundo(W / 2, pie[1]), E.aMundo(W / 2, H + 20)];
          MO.halo(ctx, W / 2, H / 2, Math.max(W, H) * 0.5, '#ffd98a', U.suave(U.tramo(t, T1, T2)) * 0.7);
          var lg0 = ctx.createLinearGradient(W / 2 - 40, 0, W / 2 + 40, 0); lg0.addColorStop(0, 'rgba(255,220,140,0)'); lg0.addColorStop(0.5, 'rgba(255,230,160,' + (0.55 * g) + ')'); lg0.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = lg0; ctx.fillRect(0, 0, W, H);   // la luz que se cuela por la grieta
          MO.cadena(ctx, [pts[1], pts[2]], U.tramo(g, 0, 0.6), { tam: 15, semilla: 61, dur: 0.05 });
          MO.cadena(ctx, [pts[1], pts[0]], U.tramo(g, 0.55, 1), { tam: 15, semilla: 62, dur: 0.05 });
          MO.cadena(ctx, [pts[2], pts[3]], U.tramo(g, 0.55, 1), { tam: 15, semilla: 63, dur: 0.05 });
          // justo antes de partirse, la luz por la grieta se hace muy fuerte
          var luz = U.tramo(t, T2 - 400, T3);
          if (luz > 0) { var lg = ctx.createLinearGradient(W / 2 - 80, 0, W / 2 + 80, 0); lg.addColorStop(0, 'rgba(255,240,200,0)'); lg.addColorStop(0.5, 'rgba(255,246,220,' + (0.9 * luz) + ')'); lg.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H); }
          return;
        }
        // las dos mitades de la ciudad se abren; por el corte saltan astillas de cerámica
        var u = U.tramo(t, T3, T4), filo = 1 - U.tramo(t, T4 - 600, T4);
        var lz = 1 - U.tramo(t, T3, T3 + 900);
        if (lz > 0) { var lg2 = ctx.createLinearGradient(W / 2 - 160, 0, W / 2 + 160, 0); lg2.addColorStop(0, 'rgba(255,240,200,0)'); lg2.addColorStop(0.5, 'rgba(255,246,220,' + (0.85 * lz) + ')'); lg2.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = lg2; ctx.fillRect(0, 0, W, H); }
        if (foto) { mitad(ctx, foto, linea, -1, u, filo); mitad(ctx, foto, linea, 1, u, filo); }
        astillas.forEach(function (a, n) { var tt = (t - T3 - a.d) / 1000; if (tt <= 0 || tt > 2.4) return; MO.tesela(ctx, W / 2 + a.vx * tt, H * a.y + a.vy * tt + 520 * tt * tt, a.tam, a.col, 1, 900 + n, { ang: a.giro * tt, alfa: 1 - U.tramo(tt, 1.6, 2.4) }); });
      },
      fin: function () {
        if (E.mundo !== 'sagrada') E.cambiarMundo('sagrada', { x: 0, y: -85, s: 0 });   // si se salta la escena antes de tiempo
        foto = null;
        var est = BC.interfaz.estado(), primera = !est.sagrada;
        est.sagrada = true; BC.interfaz.guardar();
        if (primera) setTimeout(function () { BC.interfaz.aviso(BC.idioma.t('portaAviso')); }, 400);
      }
    };
  }
  // salir: lo contrario. Las dos mitades del templo se cierran sobre sí mismas, el filo de oro se apaga y queda la ciudad
  function escenaSortir() {
    var foto = null, linea = null, cambiado = false;
    return {
      duracion: 2600,
      cuadro: function (t) {
        if (!cambiado) {
          foto = copia(); linea = lineaCorte(E.W, E.H, 9); cambiado = true;
          var m = M.monumento('sagrada');
          E.cambiarMundo('ciutat', { x: m.X, y: m.Y - 185, s: 2.0 });
        }
      },
      frente: function (ctx, t) {
        if (!foto) return;
        // la foto del templo se encoge hacia el centro y se cierra en una línea de oro
        var u = U.tramo(t, 100, 1500), e = u * u * (3 - 2 * u), W = E.W, H = E.H;
        ctx.save(); ctx.globalAlpha = 1 - U.tramo(t, 1200, 1600);
        [-1, 1].forEach(function (lado) {
          ctx.save(); var cl = new Path2D(); cl.rect(lado < 0 ? 0 : W / 2, 0, W / 2, H); ctx.clip(cl);
          ctx.translate(W / 2, H / 2); ctx.scale(1 - e * 0.98, 1); ctx.translate(-W / 2, -H / 2); ctx.drawImage(foto, 0, 0, W, H); ctx.restore();
        });
        ctx.restore();
        var oro = U.meseta(t, 1100, 1400, 1700, 2500);
        if (oro > 0) for (var k = 0; k < linea.length; k++) MO.tesela(ctx, linea[k][0], linea[k][1], 9, ORO[k % ORO.length], 1, 800 + k, { sombra: false, alfa: oro });
      },
      fin: function () { foto = null; if (E.mundo !== 'ciutat') E.cambiarMundo('ciutat'); }
    };
  }

  var P = BC.porta = {
    entrar: function () {
      if (E.escena || E.mundo !== 'ciutat') return false;
      BC.interfaz.cerrarCuaderno();
      return E.reproducir({ id: 'porta', escena: function () { var sc = BC.entradas.escena(), fin = sc.fin;   // la entrada elegida (js/sagrada/entradas.js)
        sc.fin = function () { if (fin) fin(); var est = BC.interfaz.estado(), primera = !est.sagrada; est.sagrada = true; BC.interfaz.guardar(); if (primera) setTimeout(function () { BC.interfaz.aviso(BC.idioma.t('portaAviso')); }, 400); };
        return sc; } });
    },
    sortir: function () {
      if (E.escena || E.mundo !== 'sagrada') return false;
      BC.interfaz.cerrarCuaderno();
      return E.reproducir({ id: 'sortida', escena: BC.entradas.salir || escenaSortir });   // la salida: el zoom de la entrada, al revés (js/sagrada/entradas-mosaico.js)
    }
  };

  // escribir GAUDI en la ciudad (sin escena delante); el acento de GAUDÍ también vale
  var buf = '';
  E.en('tecla', function (d) {
    if (E.mundo !== 'ciutat' || E.escena || E.bloqueado || !d.key || d.key.length !== 1) return;
    var k = d.key.toUpperCase(); if (k.normalize) k = k.normalize('NFD').replace(/[̀-ͯ]/g, '');
    buf = (buf + k).slice(-CLAVE.length);
    if (buf === CLAVE) { buf = ''; P.entrar(); }
  });
  var b0 = document.getElementById('b-tornar'); if (b0) b0.addEventListener('click', function () { P.sortir(); });
})();
