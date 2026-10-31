/* Barcelona Incognita · interfaz
   El registro de secretos, el progreso (en este navegador), el cuaderno, la tarjeta de cada escena, los avisos,
   los instrumentos (ALTURA, BARRI y BATEC, que late cerca de un secreto de lugar), la entrada y los créditos.
   Para volver o cerrar: la tecla ⌫ (nunca Esc, que en pantalla completa saca de ella). */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, E = BC.motor;
  var CLAVE = 'barcelona-incognita.v1';   // no se cambia nunca: borraría el progreso de quien ya juega
  var PRUEBA = /[?&]prueba\b/.test(location.search);
  var I = BC.interfaz = { prueba: PRUEBA };
  var huevos = [], finales = {};
  // estado.final es el de la ciudad; estado.sagrada dice si ya se entró al templo y estado.finalSagrada, si se acabó
  var estado = { hallados: {}, final: false, introVista: false };
  var $ = function (id) { return document.getElementById(id); };
  var raiz = document.documentElement;
  var ID = BC.idioma;
  var AUTOR = { nombre: 'Pau Morató Sebastià', linkedin: 'https://www.linkedin.com/in/pau-morat%C3%B3-sebasti%C3%A0-5554a01b2' };

  /* ---------- registro ----------
     Cada secreto: { id, n, nombre, tipo, pista, mundo?: 'sagrada', lugar?: () => [X, Y] en el plano de su mundo, zmin?, detectar(api), escena(motor, datos) }
     Los de la ciudad no llevan «mundo»; los de dentro de la Sagrada Família llevan mundo: 'sagrada'. Cada mundo tiene su
     cuaderno, su recuento y su final; el progreso es uno solo. */
  BC.registrar = function (h) { huevos.push(h); huevos.sort(function (a, b) { return a.n - b.n; }); };
  BC.registrarFinal = function (h) { finales[h.mundo || 'ciutat'] = h; };
  function mundoDe(h) { return h.mundo || 'ciutat'; }
  function delMundo(m) { m = m || E.mundo; return huevos.filter(function (h) { return mundoDe(h) === m; }); }
  function finalHecho(m) { return (m || E.mundo) === 'sagrada' ? !!estado.finalSagrada : !!estado.final; }
  I.huevos = function () { return huevos; };
  I.delMundo = delMundo;
  I.estado = function () { return estado; };
  I.guardar = function () { guardar(); };

  function cargar() { try { var s = localStorage.getItem(CLAVE); if (s) { var o = JSON.parse(s); for (var k in o) estado[k] = o[k]; } } catch (e) { /* sin almacenamiento */ } }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ } }
  function cuantos(m) { return delMundo(m).filter(function (h) { return estado.hallados[h.id]; }).length; }

  /* ---------- disparar un secreto ---------- */
  I.disparar = function (h, datos, op) {
    op = op || {};
    if (E.escena || !$('intro').hidden || !$('creditos').hidden) return false;
    cerrarCuaderno();
    var nuevo = !estado.hallados[h.id] && !op.prueba;
    if (nuevo) { estado.hallados[h.id] = Date.now(); guardar(); }
    h.ultimosDatos = datos || h.ultimosDatos || null;
    var envoltorio = { id: h.id, escena: function (motor) {
      var s = h.escena(motor, datos || h.ultimosDatos || null);
      if (s && s.tarjeta && !s.tarjeta.etiqueta) s.tarjeta.etiqueta = ID.t('secreto') + ' ' + U.dos(h.n) + ' / ' + U.dos(delMundo(mundoDe(h)).length) + ' · ' + ID.tipo(h.tipo);
      if (s && s.tarjeta) ['titulo', 'texto', 'pie'].forEach(function (k) { var v = ID.secreto(h, k); if (v != null && ID.actual !== 'ca') s.tarjeta[k] = v; });
      return s;
    } };
    E.reproducir(envoltorio, function () {
      pintarLista(nuevo ? h.id : null);
      if (nuevo) {
        var m = mundoDe(h);
        aviso(ID.t('encontrado') + ' <b>' + U.dos(cuantos(m)) + '/' + U.dos(delMundo(m).length) + '</b> · ' + ID.secreto(h, 'nombre'));
        var b = $('b-cuaderno'); b.classList.remove('pulso'); void b.offsetWidth; b.classList.add('pulso');
        if (cuantos(m) === delMundo(m).length && !finalHecho(m) && finales[m]) setTimeout(function () { I.verFinal(m); }, 1600);
      }
    });
    return true;
  };
  I.verFinal = function (m) {
    m = m || E.mundo; var final = finales[m], lista = delMundo(m);
    if (!final || E.escena || m !== E.mundo) return;
    cerrarCuaderno();
    var primero = Infinity, ultimo = 0;
    lista.forEach(function (h) { var t = estado.hallados[h.id]; if (t) { primero = Math.min(primero, t); ultimo = Math.max(ultimo, t); } });
    E.reproducir({ id: 'final', escena: function (motor) { return final.escena(motor, { desde: primero, hasta: ultimo, huevos: lista }); } }, function () {
      if (cuantos(m) === lista.length) { if (m === 'sagrada') estado.finalSagrada = true; else estado.final = true; guardar(); }
      pintarLista();
      mostrarCreditos();
    });
  };

  /* ---------- créditos ---------- */
  function mostrarCreditos() {
    var c = $('creditos');
    c.hidden = false; c.classList.remove('saliendo'); void c.offsetWidth; c.classList.add('visible');
    E.bloqueado = true;
    setTimeout(function () { var b = $('creditos-enlace'); try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }, 2600);
  }
  function cerrarCreditos() {
    var c = $('creditos'); if (c.hidden) return;
    c.classList.remove('visible'); c.classList.add('saliendo');
    E.bloqueado = false; E.ultimoInput = E.t;
    setTimeout(function () { c.hidden = true; c.classList.remove('saliendo'); }, 650);
  }
  I.mostrarCreditos = mostrarCreditos;

  /* ---------- tarjeta ---------- */
  I.tarjeta = function (t) {
    var el = $('tarjeta');
    if (!t) { el.classList.remove('visible'); return; }
    var v = function (x) { return typeof x === 'function' ? x() : (x || ''); };
    $('t-etq').textContent = v(t.etiqueta);
    $('t-tit').textContent = v(t.titulo);
    $('t-txt').innerHTML = v(t.texto);
    $('t-pie').textContent = v(t.pie);
    void el.offsetWidth; el.classList.add('visible');
  };

  /* ---------- aviso ---------- */
  var tAviso = null;
  function aviso(html, ms) {
    var el = $('aviso'); el.innerHTML = html; el.classList.add('visible');
    clearTimeout(tAviso); tAviso = setTimeout(function () { el.classList.remove('visible'); }, ms || 4200);
  }
  I.aviso = aviso;

  /* ---------- cuaderno ---------- */
  function abrirCuaderno() {
    $('cuaderno').classList.add('abierto'); $('cuaderno').setAttribute('aria-hidden', 'false');
    $('b-cuaderno').setAttribute('aria-expanded', 'true'); raiz.classList.add('cuaderno-abierto');
  }
  function cerrarCuaderno() {
    $('cuaderno').classList.remove('abierto'); $('cuaderno').setAttribute('aria-hidden', 'true');
    $('b-cuaderno').setAttribute('aria-expanded', 'false'); raiz.classList.remove('cuaderno-abierto');
  }
  I.abrirCuaderno = abrirCuaderno; I.cerrarCuaderno = cerrarCuaderno;

  function fecha(ms) {
    var d = new Date(ms);
    return U.dos(d.getDate()) + '.' + U.dos(d.getMonth() + 1) + '.' + d.getFullYear() + ' · ' + U.dos(d.getHours()) + ':' + U.dos(d.getMinutes());
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function pintarLista(recien) {
    var ol = $('lista'), lista = delMundo(); ol.innerHTML = '';
    lista.forEach(function (h) {
      var ok = !!estado.hallados[h.id];
      var li = el('li', 'entrada' + (ok ? ' hallada' : '') + (recien === h.id ? ' nueva' : ''));
      li.appendChild(el('div', 'e-num', U.dos(h.n)));
      var c = el('div', 'e-cuerpo');
      c.appendChild(el('div', 'e-tipo', ID.tipo(h.tipo)));
      var nom = el('div', 'e-nombre');
      if (ok) nom.textContent = ID.secreto(h, 'nombre');
      else { var cen = el('span', 'e-censura'); cen.style.width = (h.nombre.length * 0.48 + 0.6) + 'em'; nom.appendChild(cen); nom.setAttribute('aria-label', ID.t('porDescubrir')); }
      c.appendChild(nom);
      c.appendChild(el('p', 'e-pista', ID.secreto(h, 'pista')));
      if (ok || PRUEBA) {
        var meta = el('div', 'e-meta');
        if (ok) meta.appendChild(el('span', '', ID.t('trobat') + fecha(estado.hallados[h.id])));
        var b = el('button', 'e-ver', ok ? ID.t('reveure') : ID.t('provar'));
        b.type = 'button';
        b.addEventListener('click', function () { I.disparar(h, null, { prueba: !ok }); });
        meta.appendChild(b); c.appendChild(meta);
      }
      li.appendChild(c); ol.appendChild(li);
    });
    var n = cuantos();
    $('contador').textContent = U.dos(n) + '/' + U.dos(lista.length);
    var seg = $('segmentos'); seg.innerHTML = ''; seg.style.gridTemplateColumns = 'repeat(' + Math.max(1, lista.length) + ', 1fr)';
    for (var i = 0; i < lista.length; i++) seg.appendChild(el('i', i < n ? 'si' : ''));
    $('ver-final').hidden = !(finalHecho() || (PRUEBA && finales[E.mundo]));
    $('c-credito-linea').hidden = !finalHecho();
    raiz.classList.toggle('cognita', finalHecho());
  }

  /* ---------- instrumentos ---------- */
  var cuadroHud = 0, ultimos = {}, barrioActual = '';
  function barras(id, valor) {
    var b = Math.ceil(valor * 5 - 0.15); if (ultimos[id] === b) return; ultimos[id] = b;
    var is = $(id).children; for (var i = 0; i < is.length; i++) is[i].classList.toggle('si', i < b);
  }
  function instrumentos() {
    // BATEC: el pulso sube cuando te acercas a un secreto de lugar que aún no has encontrado
    // (con ratón cuenta el puntero; en pantalla táctil, el centro de la vista)
    var objetivo = 0, p = E.puntero, ref = p.sobre && p.tipo === 'mouse' ? [p.x, p.y] : [E.W / 2, E.H / 2];
    delMundo().forEach(function (h) {
      if (!h.lugar || estado.hallados[h.id]) return;
      var q = h.lugar(); if (!q) return;
      var sp = E.aPantalla(q[0], q[1]), cerca = U.clamp(1 - Math.hypot(sp[0] - ref[0], sp[1] - ref[1]) / (h.radio || 260), 0, 1);
      objetivo = Math.max(objetivo, cerca * (E.cam.s >= (h.zmin || 0) ? 1 : 0.4));
    });
    E.senal += (objetivo - E.senal) * 0.12;
    if (++cuadroHud % 5) return;
    // ALTURA: en la ciudad, desde qué altura se mira; dentro de la Sagrada Família, a qué altura del suelo de la nave estás
    $('h-altura').textContent = E.mundo === 'sagrada' ? U.num(-E.cam.y) + ' m' : U.num(E.W / E.cam.s * 0.87) + ' m';
    barras('h-batec', E.senal);
    $('h-batec').classList.toggle('latiendo', E.senal > 0.12);
    $('h-batec').style.animationDuration = (1.3 - E.senal * 0.75).toFixed(2) + 's';
    if (cuadroHud % 15 === 0) {
      var b = E.mundo === 'sagrada' ? BC.sagrada.zona(E.cam.x, E.cam.y) : BC.mapa.barrio(E.cam.x, E.cam.y);
      if (b !== barrioActual) { barrioActual = b; var hb = $('h-barri'); hb.classList.remove('cambia'); void hb.offsetWidth; hb.textContent = b; hb.classList.add('cambia'); }
    }
  }

  /* ---------- teclas pulsadas (para los secretos de teclado) ---------- */
  var SIMBOLOS = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Backspace: '⌫' };
  function tecla(d) {
    if (E.escena && d.key !== 'Backspace') return;
    var s = SIMBOLOS[d.key] || (d.key.length === 1 && /\S/.test(d.key) ? d.key.toUpperCase() : null);
    if (!s || /^[+\-=_]$/.test(d.key)) return;
    var cont = $('teclas'), k = el('kbd', '', s);
    cont.appendChild(k);
    while (cont.children.length > 10) cont.removeChild(cont.firstChild);
    setTimeout(function () { if (k.parentNode) k.parentNode.removeChild(k); }, 2300);
  }

  /* ---------- la medalla de la entrada: la baldosa «flor de Barcelona» de mosaico, la misma del icono (js/baldosa.js) ---------- */
  function medalla() {
    var cvm = $('intro-medalla'); if (!cvm) return;
    BC.baldosa(cvm, 150);
    cvm.classList.add('listo');
  }

  /* ---------- arranque ---------- */
  I.iniciar = function () {
    cargar();
    var tactil = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    // los textos que cambian con el mundo: el título, el subtítulo, el cuaderno y el nombre del instrumento BARRI / ZONA
    function textos() {
      var sg = E.mundo === 'sagrada';
      $('ayuda').textContent = ID.t(tactil ? 'ayudaTactil' : 'ayuda'); $('c-intro').textContent = ID.t(sg ? 'cIntroS' : 'cIntro');
      document.querySelector('.titulo').innerHTML = (sg ? 'Sagrada Família' : 'Barcelona') + ' <em><span class="pre">in</span>cognita</em>';
      var sub = document.querySelector('.marca .sub'); sub.setAttribute('data-i18n', sg ? 'subS' : 'sub'); sub.textContent = ID.t(sg ? 'subS' : 'sub');
      var ct = $('cuaderno-titulo'); ct.setAttribute('data-i18n', sg ? 'cTituloS' : 'cTitulo'); ct.textContent = ID.t(sg ? 'cTituloS' : 'cTitulo');
      var hb = $('h-barri').previousElementSibling; hb.setAttribute('data-i18n', sg ? 'hZona' : 'hBarri'); hb.textContent = ID.t(sg ? 'hZona' : 'hBarri');
    }
    ID.aplicar(); textos();
    E.en('mundo', function () { cerrarCuaderno(); barrioActual = ''; textos(); pintarLista(); });
    // el selector de idioma: cambia todo al momento
    document.querySelector('.idiomas').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) ID.cambiar(b.dataset.lang); });
    ID.en(function () { textos(); pintarLista(); });

    huevos.forEach(function (h) {
      // cada secreto solo oye lo que pasa en su mundo y solo pinta sus capas allí
      var suyo = mundoDe(h);
      h.detectar && h.detectar({
        motor: E,
        en: function (n, fn) { E.en(n, function (d) { if (E.mundo === suyo) fn(d); }); },
        capa: function (fn) { E.capas.push(function (ctx, t) { if (E.mundo === suyo) fn(ctx, t); }); },
        hallado: function () { return !!estado.hallados[h.id]; },
        disparar: function (datos) { return I.disparar(h, datos); }
      });
    });
    E.en('cuadro', instrumentos);
    E.en('tecla', tecla);
    // ⌫ para volver: salta la escena, cierra el cuaderno o los créditos y, dentro de la Sagrada Família, sale a la ciudad
    E.en('tecla', function (d) {
      if (d.key !== 'Backspace') return;
      if (E.escena) E.saltar();
      else if ($('cuaderno').classList.contains('abierto')) cerrarCuaderno();
      else if (!$('creditos').hidden) cerrarCreditos();
      else if (E.mundo === 'sagrada' && BC.porta) BC.porta.sortir();
    });

    $('b-cuaderno').addEventListener('click', function () { $('cuaderno').classList.contains('abierto') ? cerrarCuaderno() : abrirCuaderno(); });
    $('cerrar-cuaderno').addEventListener('click', cerrarCuaderno);
    $('saltar').addEventListener('click', function () { E.saltar(); });
    $('ver-final').addEventListener('click', function () { I.verFinal(); });
    $('borrar').addEventListener('click', function () {
      if (!window.confirm(ID.t('confirmar'))) return;
      estado = { hallados: {}, final: false, introVista: true, sagrada: estado.sagrada }; guardar(); pintarLista();
    });

    $('creditos-nombre').textContent = AUTOR.nombre;
    $('c-credito-nombre').textContent = AUTOR.nombre;
    $('creditos-enlace').href = AUTOR.linkedin; $('c-credito').href = AUTOR.linkedin;
    $('creditos-cerrar').addEventListener('click', cerrarCreditos);

    pintarLista();

    var intro = $('intro');
    if (!estado.introVista && !PRUEBA) {
      intro.hidden = false; E.bloqueado = true;
      medalla();
      $('empezar').addEventListener('click', function () {
        estado.introVista = true; guardar();
        intro.classList.add('saliendo'); E.bloqueado = false; E.ultimoInput = E.t;
        setTimeout(function () { intro.hidden = true; }, 900);
      });
      setTimeout(function () { try { $('empezar').focus({ preventScroll: true }); } catch (e) { /* nada */ } }, 50);
    }
  };
})();
