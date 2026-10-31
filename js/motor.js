/* Barcelona Incognita · motor
   El lienzo, la cámara (arrastrar con inercia, rueda o pellizco, teclado, vuelos animados), el taller que pinta las
   teselas del mapa por pasos esperando a WebKit, la entrada convertida en eventos con nombre, las escenas de los
   secretos y el modo ligero. El mundo en sí está en mapa.js (BC.mapa).
   Unidades: la cámara mira un punto (x, y) del plano girado, en metros, con una escala s en píxeles CSS por metro. */
(function () {
  'use strict';
  var BC = window.BC = window.BC || {};

  /* ---------- utilidades ---------- */
  var U = BC.util = {
    clamp: function (v, a, b) { return v < a ? a : v > b ? b : v; },
    dos: function (n) { return (n < 10 ? '0' : '') + n; },
    num: function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
    suave: function (x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); },
    tramo: function (t, a, b) { return U.clamp((t - a) / (b - a), 0, 1); },
    meseta: function (t, a, b, c, d) { return t < a || t > d ? 0 : t < b ? U.suave((t - a) / (b - a)) : t <= c ? 1 : 1 - U.suave((t - c) / (d - c)); },
    rgba: function (hex, a) { return 'rgba(' + parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16) + ',' + a + ')'; }
  };
  BC.color = { fondo: '#14110f', hueso: '#f3ece0', acento: '#f2b33d', junta: '#e6dcc7', azulgrana: ['#a50044', '#004d98', '#edbb00'] };

  var M, cv, ctx;
  var E = BC.motor = {
    W: 0, H: 0, dpr: 1, ligero: false, mundo: 'ciutat', t: 0, escena: null, bloqueado: false, ultimoInput: 0, lectura: 5000, senal: 0,
    cam: { x: 750, y: -1550, s: 0 }, puntero: { x: 0, y: 0, sobre: false, tipo: 'mouse' }, capas: [], SMAX: 6,
    cache: new Map(), cola: [], taller: { ocupado: false, ms: 0 }
  };

  /* ---------- eventos con nombre ---------- */
  var oyentes = {};
  E.en = function (n, fn) { (oyentes[n] = oyentes[n] || []).push(fn); };
  function emitir(n, d) { var l = oyentes[n]; if (l) for (var i = 0; i < l.length; i++) l[i](d); }
  E.emitir = emitir;

  /* ---------- la espera de WebKit: leer un píxel obliga a terminar lo pedido (guía 05) ---------- */
  var unPixel = null;
  E.vaciar = function () {
    if (!unPixel) { var c = document.createElement('canvas'); c.width = c.height = 1; unPixel = c.getContext('2d', { willReadFrequently: true }); }
    try { unPixel.fillRect(0, 0, 1, 1); unPixel.getImageData(0, 0, 1, 1); } catch (e) { /* nada */ }
  };

  /* ---------- la cámara ---------- */
  E.sMin = function () { var L = M.LIM; return Math.max(E.W / (L[2] - L[0]), E.H / (L[3] - L[1])); };
  function limites() {
    var c = E.cam, L = M.LIM;
    c.s = U.clamp(c.s, E.sMin(), E.SMAX);
    var mx = E.W / 2 / c.s, my = E.H / 2 / c.s;
    c.x = U.clamp(c.x, L[0] + mx, L[2] - mx); c.y = U.clamp(c.y, L[1] + my, L[3] - my);
  }
  E.limites = limites;
  E.aMundo = function (px, py) { return [E.cam.x + (px - E.W / 2) / E.cam.s, E.cam.y + (py - E.H / 2) / E.cam.s]; };
  E.aPantalla = function (X, Y) { return [(X - E.cam.x) * E.cam.s + E.W / 2, (Y - E.cam.y) * E.cam.s + E.H / 2]; };
  function zoomEn(px, py, f) {
    var w = E.aMundo(px, py); E.cam.s *= f; limites();
    E.cam.x = w[0] - (px - E.W / 2) / E.cam.s; E.cam.y = w[1] - (py - E.H / 2) / E.cam.s; limites();
  }
  var vel = { x: 0, y: 0 }, objS = null, ancla = null, vuelo = null;
  // un vuelo de cámara: la escala va en logaritmos y, si el salto es largo, se aleja un poco en medio (como un mapa)
  E.camara = function (x, y, s, ms) {
    var c = E.cam; s = U.clamp(s || c.s, E.sMin(), E.SMAX);
    var d = Math.hypot(x - c.x, y - c.y), vista = Math.max(E.W, E.H) / Math.min(c.s, s), joroba = Math.max(0, Math.log(d / vista * 1.4 + 1)) * 0.9;
    vuelo = { x0: c.x, y0: c.y, l0: Math.log(c.s), x1: x, y1: y, l1: Math.log(s), j: joroba, t0: E.t, ms: ms || 1600 };
    vel.x = vel.y = 0; objS = null;
  };
  // encuadrar un punto para una escena: a la derecha si la tarjeta va abajo a la izquierda; arriba en el móvil
  E.encuadrar = function (X, Y, s, ms) {
    var estrecha = E.W < 700;
    E.camara(X - (estrecha ? 0 : 0.17) * E.W / s, Y + (estrecha ? 0.2 : 0.02) * E.H / s, s, ms || 2400);
  };
  E.parar = function () { vuelo = null; vel.x = vel.y = 0; objS = null; };
  function moverCamara(dt) {
    var c = E.cam;
    if (vuelo) {
      var u = U.clamp((E.t - vuelo.t0) / vuelo.ms, 0, 1), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      c.x = vuelo.x0 + (vuelo.x1 - vuelo.x0) * e; c.y = vuelo.y0 + (vuelo.y1 - vuelo.y0) * e;
      c.s = Math.exp(vuelo.l0 + (vuelo.l1 - vuelo.l0) * e - vuelo.j * Math.sin(Math.PI * e));
      limites(); if (u >= 1) vuelo = null; return true;
    }
    var movido = false;
    if (!arr && !pinza && (Math.abs(vel.x) + Math.abs(vel.y)) > 1e-4) { c.x += vel.x * dt; c.y += vel.y * dt; vel.x *= Math.pow(0.92, dt / 16); vel.y *= Math.pow(0.92, dt / 16); limites(); movido = true; }
    if (objS) { var f = Math.pow(objS / c.s, 1 - Math.exp(-dt / 110)); zoomEn(ancla[0], ancla[1], f); if (Math.abs(objS / c.s - 1) < 0.002) objS = null; movido = true; }
    return movido || !!arr || !!pinza;
  }

  /* ---------- las teselas: el nivel, dibujarlas y el taller ---------- */
  function nivel() { return Math.max(0, Math.min(M.NMAX || 8, Math.round(Math.log2(E.cam.s / M.S0) + 0.25))); }
  function dibujarMapa(t) {
    ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0); ctx.fillStyle = M.FONDO || '#e6dcc7'; ctx.fillRect(0, 0, E.W, E.H);
    var L = nivel(), w = M.lado(L), tam = M.T * E.cam.s / M.escala(L), c = E.cam;
    var x0 = c.x - E.W / 2 / c.s, y0 = c.y - E.H / 2 / c.s;
    var i0 = Math.floor(x0 / w), i1 = Math.floor((x0 + E.W / c.s) / w), j0 = Math.floor(y0 / w), j1 = Math.floor((y0 + E.H / c.s) / w);
    E.cola.length = 0;
    for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
      var sx = (i * w - x0) * c.s, sy = (j * w - y0) * c.s, k = L + '/' + i + '/' + j, tl = E.cache.get(k);
      if (tl) { tl.uso = t; ctx.drawImage(tl.c, sx, sy, tam + 0.5, tam + 0.5); continue; }
      E.cola.push([L, i, j, Math.hypot(sx + tam / 2 - E.W / 2, sy + tam / 2 - E.H / 2)]);
      for (var d = 1; d <= L; d++) {   // mientras tanto, la del nivel de arriba ampliada (versión provisional)
        var pt = E.cache.get((L - d) + '/' + (i >> d) + '/' + (j >> d)); if (!pt) continue;
        var n = 1 << d, src = pt.c.width / n, ox = (i - ((i >> d) << d)) * src, oy = (j - ((j >> d) << d)) * src;
        ctx.drawImage(pt.c, ox, oy, src, src, sx, sy, tam + 0.5, tam + 0.5); break;
      }
    }
  }
  function pintarUna(q, t) { var k = q[0] + '/' + q[1] + '/' + q[2]; if (E.cache.has(k)) return; var tl = M.pintarTesela(q[0], q[1], q[2]); tl.uso = t; E.cache.set(k, tl); }
  // presupuesto: mucho con la entrada delante, poco si la cámara se mueve, algo más si está quieta
  function taller(t, moviendo, tarde) {
    E.taller.ocupado = E.cola.length > 0;
    if (!E.cola.length) return;
    E.cola.sort(function (a, b) { return a[3] - b[3]; });
    var tapado = !document.getElementById('intro').hidden, presupuesto = tapado ? 45 : tarde ? 2 : moviendo ? 4 : 14, t0 = performance.now(), n = 0;
    while (E.cola.length && (n === 0 || performance.now() - t0 < presupuesto)) {
      pintarUna(E.cola.shift(), t); E.vaciar(); n++;
      if (moviendo && !tapado) break;   // con la cámara en marcha, una tesela por fotograma como mucho
    }
    E.taller.ms = performance.now() - t0;
    if (E.cache.size > 240) {   // se olvidan las más viejas (nunca las del nivel 0, que son la reserva)
      var lista = []; E.cache.forEach(function (v, k2) { if (k2[0] !== '0') lista.push([v.uso, k2]); });
      lista.sort(function (a, b) { return a[0] - b[0]; }); for (var m = 0; m < lista.length - 180; m++) E.cache.delete(lista[m][1]);
    }
  }
  // de entrada: el nivel 0 entero (la reserva) y lo que se ve al empezar, pintado del tirón
  E.precalentar = function () {
    var L = M.LIM, w = M.lado(0);
    for (var j = Math.floor(L[1] / w); j <= Math.floor(L[3] / w); j++) for (var i = Math.floor(L[0] / w); i <= Math.floor(L[2] / w); i++) pintarUna([0, i, j], 0);
    dibujarMapa(0); while (E.cola.length) pintarUna(E.cola.shift(), 0);
    E.vaciar();
  };

  /* ---------- el fotograma ---------- */
  var ultimo = null, congelado = false, tiempos = [], ultimoDt = 16;
  function fotograma(dt) {
    E.t += dt; ultimoDt = dt;
    var moviendo = moverCamara(dt);
    var es = E.escena;
    if (es) {
      var te = E.t - es.t0;
      if (es.s.cuadro) es.s.cuadro(te);
      if (es.s.tarjeta) {
        var tj = es.s.tarjeta, ver = te >= tj.en && te < tj.hasta;
        if (ver !== es.tarjetaVisible) { es.tarjetaVisible = ver; BC.interfaz.tarjeta(ver ? tj : null); }
      }
      if (te >= es.s.duracion) terminarEscena();
    }
    dibujarMapa(E.t);
    ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0);
    for (var i = 0; i < E.capas.length; i++) E.capas[i](ctx, E.t);
    if (E.escena && E.escena.s.frente) E.escena.s.frente(ctx, E.t - E.escena.t0);
    taller(E.t, moviendo || !!E.escena, dt > 34);
    emitir('cuadro', { t: E.t, dt: dt, inactivo: E.t - E.ultimoInput, moviendo: moviendo });
    medirLigero(dt);
  }
  function bucle(ahora) {
    if (congelado) return;
    var dt = ultimo == null ? 16 : Math.min(60, ahora - ultimo); ultimo = ahora;
    fotograma(dt);
    requestAnimationFrame(bucle);
  }
  // modo ligero: si con el taller parado y sin escena un fotograma pasa de 28 ms de media, se baja a 1×
  function medirLigero(dt) {
    if (E.ligero || E.escena || E.taller.ocupado || E.bloqueado || E.dpr <= 1) { tiempos.length = 0; return; }
    tiempos.push(dt); if (tiempos.length < 90) return;
    var media = tiempos.reduce(function (a, b) { return a + b; }, 0) / tiempos.length; tiempos.length = 0;
    if (media > 28) { E.ligero = true; medir(); }
  }

  /* ---------- las escenas de los secretos ---------- */
  E.reproducir = function (h, alTerminar) {
    if (E.escena) return false;
    var s = h.escena(E);
    if (!s) return false;
    E.escena = { h: h, s: s, t0: E.t, fin: alTerminar, tarjetaVisible: false };
    document.documentElement.classList.add('en-escena');
    E.parar(); arr = null; pinza = null;
    if (s.inicio) s.inicio();
    return true;
  };
  function terminarEscena() {
    var es = E.escena; if (!es) return;
    E.escena = null;
    if (es.s.fin) es.s.fin();
    BC.interfaz.tarjeta(null);
    document.documentElement.classList.remove('en-escena');
    E.ultimoInput = E.t;
    if (es.fin) es.fin();
  }
  E.saltar = terminarEscena;

  /* ---------- la entrada ---------- */
  var punteros = {}, arr = null, pinza = null, toque = null, ultimoClic = 0, camTrazo = null;
  // el rastro del puntero (para los gestos): los últimos 2 s, en pantalla y en el mapa. Al arrastrar, el mapa se mueve
  // con el dedo, así que el punto del mapa se calcula con la cámara del principio del trazo (es el dibujo que hace la mano)
  E.rastro = [];
  function apuntarRastro(ev) {
    var c = camTrazo || E.cam, X = c.x + (ev.clientX - E.W / 2) / c.s, Y = c.y + (ev.clientY - E.H / 2) / c.s, ahora = performance.now();
    E.rastro.push({ x: ev.clientX, y: ev.clientY, X: X, Y: Y, t: ahora, s: c.s });
    while (E.rastro.length && ahora - E.rastro[0].t > 2000) E.rastro.shift();
  }
  var empuje = { x: 0, y: 0 };
  function libre() { return !E.bloqueado && !E.escena; }
  function datos(ev) { var w = E.aMundo(ev.clientX, ev.clientY); return { x: ev.clientX, y: ev.clientY, X: w[0], Y: w[1], tipo: ev.pointerType }; }
  function escuchar() {
    cv.addEventListener('pointerdown', function (ev) {
      E.ultimoInput = E.t; E.puntero.tipo = ev.pointerType;
      if (!libre()) return;
      punteros[ev.pointerId] = [ev.clientX, ev.clientY]; try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* nada */ }
      vel.x = vel.y = 0; objS = null; vuelo = null;
      var ids = Object.keys(punteros);
      if (ids.length === 2) { var a = punteros[ids[0]], b = punteros[ids[1]]; pinza = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: E.cam.s }; arr = null; toque = null; }
      else { arr = { x: ev.clientX, y: ev.clientY, t: performance.now() }; toque = { x: ev.clientX, y: ev.clientY, t: performance.now(), lejos: false }; camTrazo = { x: E.cam.x, y: E.cam.y, s: E.cam.s }; E.rastro.length = 0; empuje.x = empuje.y = 0; }
      emitir('bajar', datos(ev));
    });
    cv.addEventListener('pointermove', function (ev) {
      E.puntero.x = ev.clientX; E.puntero.y = ev.clientY; E.puntero.sobre = true; E.puntero.tipo = ev.pointerType;
      if (libre()) apuntarRastro(ev);
      if (!punteros[ev.pointerId]) { if (libre()) emitir('mover', datos(ev)); return; }
      E.ultimoInput = E.t;
      punteros[ev.pointerId] = [ev.clientX, ev.clientY];
      if (toque && Math.hypot(ev.clientX - toque.x, ev.clientY - toque.y) > 7) toque.lejos = true;
      if (pinza) { var ids = Object.keys(punteros); if (ids.length < 2) return; var a = punteros[ids[0]], b = punteros[ids[1]]; zoomEn((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, pinza.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinza.d / E.cam.s); return; }
      if (!arr) return;
      var dx = ev.clientX - arr.x, dy = ev.clientY - arr.y, ahora = performance.now(), dt = Math.max(1, ahora - arr.t);
      var qx = E.cam.x - dx / E.cam.s, qy = E.cam.y - dy / E.cam.s;
      E.cam.x = qx; E.cam.y = qy; vel.x = -dx / E.cam.s / dt; vel.y = -dy / E.cam.s / dt;
      arr.x = ev.clientX; arr.y = ev.clientY; arr.t = ahora; limites();
      // lo que el borde no ha dejado mover (en px de pantalla): empujar contra el límite del mapa
      empuje.x += (qx - E.cam.x) * E.cam.s; empuje.y += (qy - E.cam.y) * E.cam.s;
    });
    function soltar(ev) {
      if (!punteros[ev.pointerId]) return;
      delete punteros[ev.pointerId];
      if (Object.keys(punteros).length < 2) pinza = null;
      if (!Object.keys(punteros).length) {
        arr = null;
        if (toque && !toque.lejos && performance.now() - toque.t < 450 && ev.type === 'pointerup') {
          vel.x = vel.y = 0;
          var d = datos(ev), ahora = performance.now();
          emitir('clic', d);
          if (ahora - ultimoClic < 320) emitir('dobleclic', d);
          ultimoClic = ahora;
        }
        toque = null;
        if (Math.abs(empuje.x) + Math.abs(empuje.y) > 30) emitir('empujar', { x: empuje.x, y: empuje.y });
        empuje.x = empuje.y = 0; camTrazo = null;
      }
      emitir('subir', datos(ev));
    }
    cv.addEventListener('pointerup', soltar); cv.addEventListener('pointercancel', soltar);
    cv.addEventListener('pointerleave', function () { E.puntero.sobre = false; });
    cv.addEventListener('wheel', function (ev) {
      ev.preventDefault(); E.ultimoInput = E.t;
      if (!libre()) return;
      var d = ev.deltaY * (ev.deltaMode === 1 ? 16 : 1);
      objS = U.clamp((objS || E.cam.s) * Math.exp(-d * (ev.ctrlKey ? 0.01 : 0.0018)), E.sMin(), E.SMAX); ancla = [ev.clientX, ev.clientY]; vuelo = null;
      emitir('rueda', { d: d, x: ev.clientX, y: ev.clientY });
    }, { passive: false });
    cv.addEventListener('dblclick', function (ev) { if (!libre()) return; objS = Math.min(E.SMAX, E.cam.s * 2); ancla = [ev.clientX, ev.clientY]; });
    window.addEventListener('keydown', function (ev) {
      var escribiendo = ev.target && /input|textarea|select/i.test(ev.target.tagName);
      if (escribiendo) return;
      E.ultimoInput = E.t;
      emitir('tecla', { key: ev.key, code: ev.code });
      if (!libre() || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      var paso = 140 / E.cam.s;
      if (ev.key === 'ArrowLeft') { vel.x = -paso / 260; } else if (ev.key === 'ArrowRight') { vel.x = paso / 260; }
      else if (ev.key === 'ArrowUp') { vel.y = -paso / 260; } else if (ev.key === 'ArrowDown') { vel.y = paso / 260; }
      else if (ev.key === '+' || ev.key === '=') { objS = Math.min(E.SMAX, (objS || E.cam.s) * 1.6); ancla = [E.W / 2, E.H / 2]; }
      else if (ev.key === '-' || ev.key === '_') { objS = Math.max(E.sMin(), (objS || E.cam.s) / 1.6); ancla = [E.W / 2, E.H / 2]; }
    });
  }

  /* ---------- herramientas de dibujo para las escenas (BC.fx) ----------
     Todo en puntos del plano girado (metros); se pasa a pantalla con la cámara de ese fotograma. */
  var FX = BC.fx = {
    // una línea que se dibuja: f = fracción del recorrido (0 … 1)
    linea: function (ctx, pts, f, ancho, color, alfa, discontinua) {
      if (f <= 0 || pts.length < 2) return;
      var p = pts.map(function (q) { return E.aPantalla(q[0], q[1]); }), L = 0, i;
      for (i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      var resto = L * Math.min(1, f);
      ctx.save(); ctx.globalAlpha = alfa == null ? 1 : alfa; ctx.strokeStyle = color; ctx.lineWidth = ancho; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (discontinua) ctx.setLineDash(discontinua);
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
      for (i = 1; i < p.length && resto > 0; i++) {
        var d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
        if (d <= resto) { ctx.lineTo(p[i][0], p[i][1]); resto -= d; }
        else { var u = resto / d; ctx.lineTo(p[i - 1][0] + (p[i][0] - p[i - 1][0]) * u, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * u); resto = 0; }
      }
      ctx.stroke(); ctx.restore();
    },
    // una etiqueta de mapa: texto en mono versalitas sobre una cinta oscura
    etiqueta: function (ctx, txt, X, Y, op) {
      op = op || {}; var p = E.aPantalla(X, Y), a = op.alfa == null ? 1 : op.alfa; if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = (op.serif ? 'italic 400 ' + (op.tam || 22) + 'px "Instrument Serif", Georgia, serif' : '500 ' + (op.tam || 11) + 'px "IBM Plex Mono", monospace');
      var t = op.serif ? txt : txt.toUpperCase().split('').join(String.fromCharCode(8202)), w = ctx.measureText(t).width, h = (op.tam || 11) * (op.serif ? 1.15 : 1.9);
      var x = p[0] + (op.dx || 0), y = p[1] + (op.dy || 0), x0 = op.alin === 'left' ? x : x - w / 2;
      ctx.fillStyle = 'rgba(20,17,15,0.84)'; ctx.fillRect(x0 - 9, y - h / 2 - 3, w + 18, h + 6);
      ctx.fillStyle = op.color || BC.color.hueso; ctx.textBaseline = 'middle'; ctx.fillText(t, x0, y + 1);
      ctx.restore();
    },
    // un punto con aro (para marcar sitios)
    punto: function (ctx, X, Y, r, color, alfa) {
      var p = E.aPantalla(X, Y); ctx.save(); ctx.globalAlpha = alfa == null ? 1 : alfa;
      ctx.fillStyle = 'rgba(20,17,15,0.85)'; ctx.beginPath(); ctx.arc(p[0], p[1], r + 3, 0, 6.2832); ctx.fill();
      ctx.fillStyle = color || BC.color.acento; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 6.2832); ctx.fill(); ctx.restore();
    },
    // un velo que oscurece el mapa salvo un círculo (para dirigir la mirada)
    foco: function (ctx, X, Y, r, alfa) {
      if (alfa <= 0) return; var p = E.aPantalla(X, Y);
      var g = ctx.createRadialGradient(p[0], p[1], r * 0.7, p[0], p[1], r * 1.6);
      g.addColorStop(0, 'rgba(20,17,15,0)'); g.addColorStop(1, 'rgba(20,17,15,' + (0.55 * alfa) + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, E.W, E.H);
    }
  };

  /* ---------- tamaño del lienzo ---------- */
  function medir() {
    var d = E.ligero ? 1 : Math.min(window.devicePixelRatio || 1, 2), cambia = d !== E.dpr;
    E.W = window.innerWidth; E.H = window.innerHeight; E.dpr = d; [BC.mapa, BC.sagrada].forEach(function (w) { if (w && w.ponerDpr) w.ponerDpr(d); });
    cv.width = Math.round(E.W * d); cv.height = Math.round(E.H * d); cv.style.width = E.W + 'px'; cv.style.height = E.H + 'px';
    if (cambia) { E.cache.clear(); cajas = {}; }
    limites();
  }

  /* ---------- los mundos: la ciudad (BC.mapa) y, dentro de la Sagrada Família, su corte (BC.sagrada) ----------
     Cada mundo da lo mismo (LIM, S0, NMAX, SMAX, FONDO, escala, lado, pintarTesela) y guarda su cámara y sus teselas,
     así que al volver a la ciudad está todo como se dejó. */
  var cajas = {}, camaras = {};
  // pintar una tesela de otro mundo en su caché, sin cambiar de mundo (para preparar la vuelta a la ciudad desde el templo)
  E.cajaDe = function (nombre) { return nombre === E.mundo ? E.cache : (cajas[nombre] || (cajas[nombre] = new Map())); };
  E.pintarFuera = function (nombre, mapa, L, i, j) {
    var c = E.cajaDe(nombre), k = L + '/' + i + '/' + j; if (c.has(k)) return false;
    var tl = mapa.pintarTesela(L, i, j); tl.uso = E.t; c.set(k, tl); return true;
  };
  E.cambiarMundo = function (nombre, cam) {
    if (nombre === E.mundo) return;
    cajas[E.mundo] = E.cache; camaras[E.mundo] = { x: E.cam.x, y: E.cam.y, s: E.cam.s };
    E.mundo = nombre; M = nombre === 'sagrada' ? BC.sagrada : BC.mapa; E.SMAX = M.SMAX || 6;
    E.cache = cajas[nombre] || new Map(); E.cola.length = 0; E.parar(); arr = null; pinza = null; E.rastro.length = 0;
    var c = cam || camaras[nombre] || M.inicio || {}; E.cam.x = c.x != null ? c.x : 0; E.cam.y = c.y != null ? c.y : 0; E.cam.s = c.s || E.sMin(); limites();
    if (!cajas[nombre]) E.precalentar();
    document.documentElement.classList.toggle('en-sagrada', nombre === 'sagrada');
    emitir('mundo', { mundo: nombre });
  };

  /* ---------- arranque y depuración ---------- */
  E.iniciar = function (lienzo, listo) {
    M = BC.mapa; cv = lienzo; ctx = cv.getContext('2d', { alpha: false });
    E.dpr = 0; medir(); E.cam.s = E.cam.s || E.sMin(); limites();
    escuchar();
    window.addEventListener('resize', function () { E.cache.clear(); cajas = {}; medir(); });
    M.cargar(function () {
      E.precalentar();
      if (listo) listo();
      if (!congelado) requestAnimationFrame(bucle);
    });
  };
  // para las pruebas sin ventana (allí no corre requestAnimationFrame): parar el reloj y avanzarlo a mano
  E.congelar = function () { congelado = true; };
  E.paso = function (ms, trozos) { trozos = trozos || 1; for (var i = 0; i < trozos; i++) { fotograma(ms / trozos); E.vaciar(); } };
  E.pintarTodo = function () { dibujarMapa(E.t); while (E.cola.length) pintarUna(E.cola.shift(), E.t); dibujarMapa(E.t); ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0); for (var i = 0; i < E.capas.length; i++) E.capas[i](ctx, E.t); E.vaciar(); };
  E.lienzo = function () { return cv; };
})();
