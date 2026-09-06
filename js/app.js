/* ══════════════════════════════════════════════════════════════
   MANTARO — aplicación
   ══════════════════════════════════════════════════════════════ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const ing = id => INGREDIENTES.find(i => i.id === id);
const LENTO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const guardar = {
  leer(k, f){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } },
  poner(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const E = {
  pantalla: 'home',
  genero: 'hombre',
  principal: [],                 // hasta 3
  extra: [],                     // hasta 2
  volumen: { ml:50, mult:1 },
  etiqueta: { nombre:'', creador:'', dedicatoria:'' },
  bolsa: guardar.leer('mantaro.bolsa', [])
};

const MAX_PRINCIPAL = 3;
const MAX_EXTRA = 2;

/* ── destino de los pedidos ──────────────────────────────────────
   WHATSAPP_NUMERO: sólo dígitos con código de país, sin "+" ni espacios. */
const WHATSAPP_NUMERO = '51940426480';
const CORREO_PEDIDOS = 'mantaro.lab@gmail.com';
const WEB3FORMS_KEY = '6e164cac-7f10-4c0c-b1d9-47e3de85e0ac';

const FAM_ADJ = {
  dulce:'dulce', floral:'floral', citrico:'cítrica', especia:'especiada',
  madera:'amaderada', fresco:'fresca', elegante:'elegante'
};

/* ══════════ LA FÓRMULA ══════════ */

function formula(){
  const filas = [];
  E.principal.forEach((id, i) => filas.push({ ing: ing(id), peso: 3 - i * .6, tipo:'principal' }));

  if (!filas.length){
    return { vacia:true, filas:[], capas:{salida:0,corazon:0,fondo:0}, color:'#d8bb8c',
             nombre:'MANTARO', caracter:[] };
  }

  const total = filas.reduce((s, f) => s + f.peso, 0);
  filas.forEach(f => f.pct = Math.round(f.peso / total * 100));
  const desvio = 100 - filas.reduce((s, f) => s + f.pct, 0);
  if (desvio) filas.reduce((a, b) => b.pct > a.pct ? b : a, filas[0]).pct += desvio;
  filas.sort((a, b) => b.pct - a.pct || a.ing.nombre.localeCompare(b.ing.nombre));

  const familias = {}, capas = { salida:0, corazon:0, fondo:0 };
  filas.forEach(f => {
    familias[f.ing.fam] = (familias[f.ing.fam] || 0) + f.pct;
    capas[f.ing.capa] += f.pct;
  });
  const orden = Object.entries(familias).sort((a, b) => b[1] - a[1]);
  const dominante = orden[0][0];
  const segunda   = orden[1] ? orden[1][0] : null;

  const color = Flacon.mezclar(filas.map(f => ({ color:f.ing.color, w:f.pct })));

  return {
    vacia:false, filas, familias, capas, dominante, segunda, color,
    nombre: bautizar(filas),
    caracter: caracterizar(familias, capas, dominante, segunda),
    texto: describir(filas, dominante, segunda)
  };
}

/* nombre al estilo del laboratorio: materia + número */
function huella(txt){
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++){ h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}
function bautizar(filas){
  const lider = filas[0].ing.nombre.toUpperCase();
  const clave = filas.map(f => f.ing.id).sort().join('|');
  const n = 10 + huella(clave) % 90;
  return `${lider} ${n}`;
}

function caracterizar(familias, capas, dominante, segunda){
  const out = [];
  const meter = t => { if (t && !out.includes(t)) out.push(t); };
  (CARACTER[dominante] || []).slice(0, 2).forEach(meter);
  if (segunda) meter((CARACTER[segunda] || [])[0]);
  if (capas.fondo  >= 42) meter('Larga duración');
  if (capas.salida >= 36) meter('Luminosa');
  if (Object.keys(familias).length >= 4) meter('Compleja');
  return out.slice(0, 5);
}

function describir(filas, dominante, segunda){
  const lider  = filas[0];
  const otra   = capa => filas.find(f => f.ing.capa === capa && f !== lider)
                      || filas.find(f => f.ing.capa === capa);
  const salida = otra('salida');
  const fondo  = otra('fondo');
  const nom    = f => f.ing.nombre.toLowerCase();

  let arco;
  if (salida && fondo && salida !== fondo) arco = `Abre en ${nom(salida)} y se asienta sobre ${nom(fondo)}.`;
  else if (salida)                          arco = `Abre en ${nom(salida)} y se queda ahí, sin apuro.`;
  else if (fondo)                           arco = `Se asienta de entrada sobre ${nom(fondo)}.`;
  else                                      arco = 'Vive entera en el corazón, pegada a la piel.';

  const matiz = segunda ? `, con un fondo que ${FRASE[segunda]}` : '';
  return `Una composición ${FAM_ADJ[dominante]} encabezada por ${nom(lider)}${matiz}. ${arco} `
       + `Una esencia personal que ${FRASE[dominante]}.`;
}

/* ══════════ TEXTO PARTIDO ══════════ */

function partir(el){
  if (el.dataset.listo) return;
  const modo = el.dataset.split;

  if (modo === 'lines'){
    const lineas = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lineas.map((t, i) =>
      `<span class="ln" style="--cd:${(i * .12).toFixed(2)}s"><i>${t.trim()}</i></span>`).join('');
  } else {
    const palabras = el.textContent.trim().split(/\s+/);
    let n = 0;
    el.innerHTML = palabras.map(p => {
      const chars = [...p].map(c => `<span class="ch" style="--cd:${(n++ * .028).toFixed(3)}s">${c}</span>`).join('');
      return `<span class="wd">${chars}</span>`;
    }).join(' ');
  }
  el.dataset.listo = '1';
}

function animarPantalla(sec){
  $$('.split', sec).forEach(el => {
    partir(el);
    el.classList.remove('go');
    void el.offsetWidth;
    el.classList.add('go');
  });
  const g = $('.grid', sec);
  if (g){ g.classList.remove('go'); void g.offsetWidth; g.classList.add('go'); }
}

/* ══════════ NAVEGACIÓN ENTRE PANTALLAS ══════════ */

const PASO = { paso1:1, paso2:2, paso3:3, resultado:3 };

function ir(nombre){
  const actual = $('.screen.is-active');
  const proxima = $(`[data-screen="${nombre}"]`);
  if (!proxima || actual === proxima) return;

  const salir = () => {
    actual.classList.remove('is-active', 'leaving');
    proxima.classList.add('is-active', 'entering');
    E.pantalla = nombre;
    window.scrollTo({ top:0, behavior:'instant' });
    sincronizarPasos();
    if (nombre === 'paso1') pintarGrid1();
    if (nombre === 'paso3') actualizarEtiqueta();
    animarPantalla(proxima);
    setTimeout(() => proxima.classList.remove('entering'), 950);
  };

  if (LENTO){ salir(); return; }
  actual.classList.add('leaving');
  setTimeout(salir, 420);
}

function sincronizarPasos(){
  const paso = PASO[E.pantalla];
  const barra = $('#stepbar');
  barra.hidden = !paso;
  if (!paso) return;
  $$('.steps li').forEach(li => {
    const n = +li.dataset.step;
    li.classList.toggle('on', n === paso);
    li.classList.toggle('done', n < paso);
  });
  $('#stepsFill').style.width = ((paso - 1) / 2 * 100) + '%';
  ['#who1','#who2','#who3','#whoResult'].forEach(s => {
    const el = $(s); if (el) el.textContent = E.genero === 'hombre' ? 'Hombre' : 'Mujer';
  });
}

/* ══════════ TARJETAS ══════════ */

let FOTOS = null;   // ids con foto real disponible en img/

function tarjeta(i, estado){
  return `
  <button class="card ${estado.on ? 'on' : ''} ${estado.par ? 'pair' : ''} ${estado.mudo ? 'muted' : ''}"
          data-ing="${i.id}" style="--c:${i.color}" aria-pressed="${estado.on}">
    <span class="card-art">${plate(i.id, i.tono, i.art)}</span>
    <span class="card-mark">
      <svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 5 5 9-11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span>
    <span class="card-tag">Combina</span>
    <span class="card-body">
      <span class="card-name">${i.nombre}</span>
      <span class="card-sub">${i.sub}</span>
    </span>
  </button>`;
}

function ponerFotos(cont){
  if (!FOTOS || !FOTOS.length) return;
  $$('.card', cont).forEach(c => {
    const id = c.dataset.ing;
    if (!FOTOS.includes(id)) return;
    const im = new Image();
    im.alt = '';
    im.onload = () => { const a = $('.card-art', c); a.innerHTML = ''; a.appendChild(im); };
    im.src = `img/${id}.jpg`;
  });
}

function pintarGrid1(){
  const lista = INGREDIENTES.filter(i => !i.extra && i.para.includes(E.genero));
  const cont = $('#grid1');
  cont.innerHTML = lista.map(i =>
    tarjeta(i, { on: E.principal.includes(i.id), par:false, mudo:false })).join('');
  $$('.card', cont).forEach((c, k) => c.style.setProperty('--cd', Math.min(k * .045, .6) + 's'));
  ponerFotos(cont);
  $('#next1').disabled = E.principal.length === 0;
}

function pintarGrid2(){
  const familiasElegidas = E.principal.map(id => ing(id).fam);

  /* puntúa cada candidato: la primera afinidad pesa más que la tercera */
  const punto = i => familiasElegidas.reduce((p, f) => {
    const k = (AFINIDAD[f] || []).indexOf(i.fam);
    return p + (k >= 0 ? 3 - k : 0);
  }, 0);

  const lista = INGREDIENTES
    .filter(i => i.para.includes(E.genero))
    .filter(i => !E.principal.includes(i.id))
    .map(i => ({ i, p: punto(i) }))
    .sort((a, b) => b.p - a.p || a.i.nombre.localeCompare(b.i.nombre));

  /* sólo destacamos las seis mejores: si todo "combina", nada informa */
  const destacadas = new Set(lista.filter(x => x.p > 0).slice(0, 6).map(x => x.i.id));

  const cont = $('#grid2');
  cont.innerHTML = lista.map(({ i }) => tarjeta(i, {
    on: E.extra.includes(i.id),
    par: destacadas.has(i.id),
    mudo: false
  })).join('');
  $$('.card', cont).forEach((c, k) => c.style.setProperty('--cd', Math.min(k * .04, .6) + 's'));
  ponerFotos(cont);

  $('#chosen2').innerHTML = E.principal.map((id, k) => {
    const i = ing(id);
    return `<span class="chip" style="--c:${i.color}; animation-delay:${k * .08}s"><i></i>${i.nombre}</span>`;
  }).join('');
}


function pintarInfoIngredientes(){
  const cont = $('#ingredientInfoGrid');
  if (!cont) return;
  const lista = INGREDIENTES.filter(i => !i.extra);
  cont.innerHTML = lista.map(i => `
    <article class="ingredient-note" style="--c:${i.color}">
      <span class="ingredient-dot"></span>
      <h3>${i.nombre}</h3>
      <p class="ingredient-meta">${CAPA_LABEL[i.capa]} · ${i.sub}</p>
      <p>${i.nota}</p>
    </article>`).join('');
}

function irASeccion(id){
  const mover = () => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 86;
    window.scrollTo({ top, behavior: LENTO ? 'auto' : 'smooth' });
  };
  if (E.pantalla !== 'home'){
    ir('home');
    setTimeout(mover, LENTO ? 80 : 760);
    return;
  }
  mover();
}

function agregarPerfumeListo(nombre){
  const es31 = nombre === 'MANTARO 31';
  E.bolsa.push({
    id: 'ready' + Date.now(),
    nombre,
    ml: 50,
    color: es31 ? '#b9ae82' : '#b996aa',
    notas: es31
      ? 'Perfume listo: fuerza sobria, profunda y elegante.'
      : 'Perfume listo: elegancia delicada, íntima y contemporánea.'
  });
  guardar.poner('mantaro.bolsa', E.bolsa);
  pintarBolsa();
  abrirBolsa();
  avisar(`${nombre} está listo para solicitar.`);
}
/* ══════════ SELECCIÓN ══════════ */

function sacudir(card){
  card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
}

function alternar(lista, id, max, card){
  const k = lista.indexOf(id);
  if (k >= 0){ lista.splice(k, 1); return true; }
  if (lista.length >= max){
    sacudir(card);
    avisar(max === MAX_PRINCIPAL
      ? `Puedes elegir hasta ${max} ingredientes principales`
      : `Puedes añadir hasta ${max} esencias extra`);
    return false;
  }
  lista.push(id);
  return true;
}

$('#grid1').addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  if (alternar(E.principal, card.dataset.ing, MAX_PRINCIPAL, card)){
    const on = E.principal.includes(card.dataset.ing);
    card.classList.toggle('on', on);
    card.setAttribute('aria-pressed', String(on));
    $('#next1').disabled = E.principal.length === 0;
    refrescarFrasco();
  }
});

$('#grid2').addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  if (alternar(E.extra, card.dataset.ing, MAX_EXTRA, card)){
    const on = E.extra.includes(card.dataset.ing);
    card.classList.toggle('on', on);
    card.setAttribute('aria-pressed', String(on));
    refrescarFrasco();
  }
});

function refrescarFrasco(){
  const f = formula();
  Flacon.setColor(f.color);
}

/* ══════════ PASO 3 ══════════ */

function pintarFinal(){
  const f = formula();
  if (f.vacia) return;

  const nombrePersonal = E.etiqueta.nombre || f.nombre;
  $('#finalName').textContent = nombrePersonal;
  $('#finalDesc').textContent = f.texto;
  $('#finalTraits').innerHTML = f.caracter.map((t, k) =>
    `<span class="trait" style="animation-delay:${(k * .07 + .2).toFixed(2)}s">${t}</span>`).join('');
  const extras = E.extra.map(ing);
  $('#extrasBlock').hidden = extras.length === 0;
  $('#extraVials').innerHTML = extras.map(i => `
    <article class="extra-vial">
      <span><strong>${i.nombre}</strong><small>Envase individual · sin mezclar</small></span>
    </article>`).join('');
}

/* etiqueta en vivo */
function actualizarEtiqueta(){
  const elementos = E.principal.map(id => ing(id).nombre).join(' · ') || 'Tus ingredientes';
  const elElements = $('#labelElements');
  if (elElements) elElements.textContent = elementos;

  const hoy = new Date();
  const fechaStr = String(hoy.getDate()).padStart(2,'0') + '/' + String(hoy.getMonth()+1).padStart(2,'0') + '/' + hoy.getFullYear();
  const elFecha = $('#labelDate');
  if (elFecha) elFecha.textContent = fechaStr;

  const valName = $('#fragName') ? $('#fragName').value.trim() : '';
  const elName = $('#labelName');
  if (elName) elName.textContent = (valName || E.etiqueta.nombre || 'NOMBRE DE TU FRAGANCIA').toUpperCase();

  const valCreator = $('#fragCreator') ? $('#fragCreator').value.trim() : '';
  const elCreator = $('#labelCreator');
  if (elCreator) elCreator.textContent = valCreator || E.etiqueta.creador || 'Tu nombre (opcional)';

  const valDed = $('#fragDedication') ? $('#fragDedication').value.trim() : '';
  const elDed = $('#labelDedication');
  if (elDed) elDed.textContent = valDed || E.etiqueta.dedicatoria || 'datos de tu preferencia';
}

const camposEtiqueta = [
  ['fragName','fragCount','labelName','NOMBRE DE TU FRAGANCIA', true],
  ['fragCreator','creatorCount','labelCreator','Tu nombre (opcional)', false],
  ['fragDedication','dedicationCount','labelDedication','datos de tu preferencia', false]
];
camposEtiqueta.forEach(([campo, contador, destino, respaldo, mayus]) => {
  const el = $(`#${campo}`);
  if (!el) return;
  el.addEventListener('input', e => {
    $(`#${contador}`).textContent = e.target.value.length;
    const txt = e.target.value.trim();
    $(`#${destino}`).textContent = txt ? (mayus ? txt.toUpperCase() : txt) : respaldo;
    e.target.classList.remove('field-error');
  });
});

$('#personalForm').addEventListener('submit', e => {
  e.preventDefault();
  const nombre = $('#fragName').value.trim();
  if (!nombre){
    $('#fragName').classList.add('field-error');
    $('#fragName').focus();
    avisar('Escribe un nombre para tu fragancia');
    return;
  }
  E.etiqueta = {
    nombre,
    creador: $('#fragCreator').value.trim(),
    dedicatoria: $('#fragDedication').value.trim()
  };
  pintarFinal();
  ir('resultado');
});

/* ══════════ BOLSA ══════════ */

function limpiarNotas(notas){
  return String(notas || '')
    .replace(/\s+\d+%/g, '')
    .replace(/^Mezcla:/, 'Mezcla principal:');
}

function pintarBolsa(){
  const cuerpo = $('#drawerBody');
  cuerpo.innerHTML = E.bolsa.length
    ? E.bolsa.map(i => `
      <div class="bag-item">
        <span class="bag-thumb"><img src="img/caja.PNG" alt="Caja MANTARO"></span>
        <span>
          <span class="bi-name">${i.nombre}</span>
          <span class="bi-meta">${i.ml} ml</span>
          <span class="bi-notes">${limpiarNotas(i.notas)}</span>
        </span>
        <span class="bi-right"><button class="bi-rm" data-rm="${i.id}">Quitar</button></span>
      </div>`).join('')
    : `<p class="bag-empty">Todavía no hay nada aquí.</p>`;

  const c = $('#cartCount');
  c.textContent = E.bolsa.length;
  c.dataset.empty = String(!E.bolsa.length);
  $('#checkout').disabled = !E.bolsa.length;
}

$('#drawerBody').addEventListener('click', e => {
  const b = e.target.closest('[data-rm]');
  if (!b) return;
  E.bolsa = E.bolsa.filter(i => i.id !== b.dataset.rm);
  guardar.poner('mantaro.bolsa', E.bolsa);
  pintarBolsa();
});

$('#addCart').addEventListener('click', () => {
  const f = formula();
  if (f.vacia) return;
  const telefono = $('#requestPhone').value.trim();
  if (!telefono) {
    $('#requestPhone').classList.add('field-error');
    $('#requestPhone').focus();
    avisar('Ingresa un número de contacto para solicitar tu pedido.');
    return;
  }
  $('#requestPhone').classList.remove('field-error');
  $('#cfTelefono').value = telefono;
  E.bolsa.push({
    id: 'm' + Date.now(),
    nombre: E.etiqueta.nombre || f.nombre,
    ml: E.volumen.ml,
    color: f.color,
    notas: `Mezcla principal: ${f.filas.map(r => r.ing.nombre).join(' · ')}`
      + (E.extra.length ? ` · Extras independientes: ${E.extra.map(id => ing(id).nombre).join(' y ')}` : ''),
    creador: E.etiqueta.creador,
    dedicatoria: E.etiqueta.dedicatoria,
    extras: E.extra.map(id => ing(id).nombre)
  });
  guardar.poner('mantaro.bolsa', E.bolsa);
  pintarBolsa();
  const c = $('#cartCount');
  c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
  abrirBolsa();
  avisar(`“${f.nombre}” está listo para solicitar.`);
});

/* ── resumen de texto plano, compartido por WhatsApp y correo ─── */
function resumenPedido(nombre, telefono){
  const lineas = [
    'Nuevo pedido — MANTARO',
    '',
    `Nombre: ${nombre}`,
    telefono ? `Teléfono: ${telefono}` : null,
    '',
    ...E.bolsa.map(i => `• ${i.nombre} — ${i.ml} ml\n   ${limpiarNotas(i.notas)}`)
  ].filter(l => l !== null);
  return lineas.join('\n');
}

$('#cfNombre').addEventListener('input', e => e.target.classList.remove('cf-error'));

/* envía el pedido a Web3Forms, que lo reenvía a CORREO_PEDIDOS sin que
   el cliente vea ni toque nada — sólo un fetch en segundo plano */
async function enviarPorCorreo(nombre, telefono, resumen){
  const body = new FormData();
  body.append('access_key', WEB3FORMS_KEY);
  body.append('subject', `Nuevo pedido MANTARO — ${nombre}`);
  body.append('from_name', 'MANTARO — atelier');
  body.append('name', nombre);
  body.append('telefono', telefono || 'No indicado');
  body.append('message', resumen);

  const r = await fetch('https://api.web3forms.com/submit', { method:'POST', body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error(j.message || 'Web3Forms rechazó el envío');
}

$('#checkout').addEventListener('click', async () => {
  const nombreEl = $('#cfNombre');
  const nombre = nombreEl.value.trim();
  const telefono = $('#cfTelefono').value.trim();

  nombreEl.classList.toggle('cf-error', !nombre);
  if (!nombre){
    avisar('Cuéntanos tu nombre para enviar el pedido');
    nombreEl.focus();
    return;
  }
  if (!E.bolsa.length) return;

  const resumen = resumenPedido(nombre, telefono);
  const btn = $('#checkout');
  const etiqueta = $('span', btn);
  const textoOriginal = etiqueta.textContent;

  btn.disabled = true;
  etiqueta.textContent = 'Enviando…';

  try {
    await enviarPorCorreo(nombre, telefono, resumen);

    /* whatsapp: abre el chat con el mensaje redactado — WhatsApp exige
       que sea el propio visitante quien lo envíe, ningún sitio puede
       mandarlo por él sin la API oficial de Meta */
    if (WHATSAPP_NUMERO){
      window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(resumen)}`, '_blank', 'noopener');
    }

    avisar(`Gracias, ${nombre.split(' ')[0]} — tu pedido ya llegó a MANTARO`);
    E.bolsa = [];
    guardar.poner('mantaro.bolsa', E.bolsa);
    pintarBolsa();
    nombreEl.value = '';
    $('#cfTelefono').value = '';
    setTimeout(cerrarBolsa, 1400);
  } catch (e) {
    /* si falla la red, no se pierde el pedido: se abre el correo del visitante como respaldo */
    const asunto = encodeURIComponent(`Pedido MANTARO — ${nombre}`);
    window.location.href = `mailto:${CORREO_PEDIDOS}?subject=${asunto}&body=${encodeURIComponent(resumen)}`;
    avisar('No pudimos enviarlo en automático — se abrió tu correo como respaldo');
  } finally {
    btn.disabled = false;
    etiqueta.textContent = textoOriginal;
  }
});

$('#restart').addEventListener('click', () => {
  E.principal = []; E.extra = [];
  E.volumen = { ml:50, mult:1 };
  E.etiqueta = { nombre:'', creador:'', dedicatoria:'' };
  camposEtiqueta.forEach(([campo, contador]) => {
    const el = $(`#${campo}`); if (el) el.value = '';
    const cnt = $(`#${contador}`); if (cnt) cnt.textContent = '0';
  });
  actualizarEtiqueta();
  refrescarFrasco();
  ir('genero');
});

/* ── cajón ── */
const scrim = $('#scrim'), drawer = $('#drawer');
function abrirBolsa(){
  drawer.hidden = false; scrim.hidden = false;
  requestAnimationFrame(() => { drawer.classList.add('show'); scrim.classList.add('show'); });
  document.body.classList.add('locked');
}
function cerrarBolsa(){
  drawer.classList.remove('show'); scrim.classList.remove('show');
  setTimeout(() => { drawer.hidden = true; scrim.hidden = true; }, 520);
  document.body.classList.remove('locked');
}
$('#cartBtn').addEventListener('click', abrirBolsa);
$('#drawerClose').addEventListener('click', cerrarBolsa);
scrim.addEventListener('click', cerrarBolsa);
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarBolsa(); });
$('#searchBtn').addEventListener('click', () => avisar('Buscador en preparación'));

/* ══════════ AVISOS ══════════ */
function avisar(txt){
  const t = $('#toast');
  t.textContent = txt;
  t.classList.add('show');
  clearTimeout(avisar._t);
  avisar._t = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ══════════ BOTONES DE NAVEGACIÓN ══════════ */

document.addEventListener('click', e => {
  const scrollTarget = e.target.closest('[data-scroll]');
  if (scrollTarget){
    e.preventDefault();
    irASeccion(scrollTarget.dataset.scroll);
    return;
  }

  const ready = e.target.closest('[data-ready]');
  if (ready){
    e.preventDefault();
    agregarPerfumeListo(ready.dataset.ready);
    return;
  }

  const b = e.target.closest('[data-go]');
  if (!b) return;
  e.preventDefault();
  ir(b.dataset.go);
});

$$('.gender').forEach(b => b.addEventListener('click', () => {
  E.genero = b.dataset.gender;
  pintarGrid1();
  ir('paso1');
}));

$('#next1').addEventListener('click', () => {
  if (!E.principal.length) return;
  E.extra = E.extra.filter(id => !E.principal.includes(id));
  pintarGrid2();
  ir('paso2');
});

$('#next2').addEventListener('click', () => {
  ir('paso3');
});

/* ══════════ CRONOLOGÍA DE ENTRADA ══════════ */

const observador = new IntersectionObserver(entradas => {
  entradas.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    observador.unobserve(en.target);
  });
}, { threshold:.15, rootMargin:'0px 0px -6% 0px' });

window.addEventListener('scroll', () => {
  $('#nav').classList.toggle('stuck', window.scrollY > 24);
}, { passive:true });

/* ══════════ ARRANQUE ══════════ */

(async function arrancar(){
  /* ¿hay fotos reales en img/? */
  try {
    const r = await fetch('img/manifest.json', { cache:'no-cache' });
    if (r.ok){
      const j = await r.json();
      FOTOS = Array.isArray(j) ? j : [];
    }
  } catch { FOTOS = []; }

  /* el héroe usa ahora la foto real del frasco; el SVG dinámico
     sólo se necesita en el paso 3, donde refleja la mezcla del usuario */

  /* foto real cuando exista; si no, la lámina ilustrada */
  const laminaDe = (id, sufijo) => {
    const i = ing(id);
    if (FOTOS && FOTOS.includes(id)) return `<img src="img/${id}.jpg" alt="${i.nombre}" loading="lazy">`;
    return plate(sufijo + '-' + id, i.tono, i.art);
  };

  const pilares = { madera:'cedro', jazmin:'rosa', ambar:'ambar' };
  $$('.pillar-art').forEach(el => { el.innerHTML = laminaDe(pilares[el.dataset.art], 'p'); });

  $('#inspiraReel').innerHTML = ['sandalo','rosa','ambar']
    .map(id => `<span class="slab">${laminaDe(id, 'r')}</span>`)
    .join('');

  /* fotos reales de la pantalla ¿para quién? */
  const FOTO_GENERO = { hombre:'genero-hombre.jpg', mujer:'genero-mujer.jpg' };
  $$('.gender-art').forEach(el => {
    const src = FOTO_GENERO[el.dataset.art];
    el.innerHTML = src
      ? `<img src="img/${src}" alt="${el.dataset.art === 'hombre' ? 'Hombre' : 'Mujer'}">`
      : retrato(el.dataset.art);
  });

  pintarBolsa();
  pintarInfoIngredientes();
  pintarGrid1();
  refrescarFrasco();
  actualizarEtiqueta();
  sincronizarPasos();

  $$('.reveal').forEach(el => observador.observe(el));
  observador.observe($('.inspira'));
  const info = $('.ingredient-info'); if (info) observador.observe(info);
  $$('.ready-perfumes').forEach(el => observador.observe(el));

  /* levantar la cortina */
  setTimeout(() => {
    document.body.classList.add('ready');
    document.body.classList.remove('is-loading');
    animarPantalla($('.screen.is-active'));
  }, LENTO ? 60 : 1750);
})();

/* ── retratos de la pantalla de género ─────────────────────────
   De espaldas, luz dura entrando en diagonal —como en un estudio
   con una sola ventana— para leer como fotografía, no ilustración.
   ─────────────────────────────────────────────────────────────── */
function retrato(tipo){
  const hombre = tipo === 'hombre';
  const id = 'r' + tipo;

  /* paleta: el hombre en sombra fría de traje oscuro, ella en luz cálida sobre piel */
  const muro   = hombre ? ['#5b5044','#332b22','#151109'] : ['#cdb79e','#a4876c','#5c4736'];
  const pielA  = hombre ? '#8a6b4e' : '#e6c6a8';
  const pielB  = hombre ? '#3c2e21' : '#a9805f';
  const pielC  = hombre ? '#20170f' : '#6e4d38';
  const pelo1  = hombre ? '#1c1510' : '#3a281c';
  const pelo2  = hombre ? '#0d0906' : '#22150e';
  const telaA  = hombre ? '#221b16' : '#f2e9db';
  const telaB  = hombre ? '#050403' : '#c7b195';

  return `<svg viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="muro-${id}" x1=".05" y1="0" x2=".95" y2="1">
        <stop offset="0" stop-color="${muro[0]}"/>
        <stop offset=".55" stop-color="${muro[1]}"/>
        <stop offset="1" stop-color="${muro[2]}"/>
      </linearGradient>
      <linearGradient id="piel-${id}" x1=".05" y1=".1" x2="1" y2=".9">
        <stop offset="0"   stop-color="${pielA}"/>
        <stop offset=".55" stop-color="${pielB}"/>
        <stop offset="1"   stop-color="${pielC}"/>
      </linearGradient>
      <linearGradient id="pieldura-${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"  stop-color="#fff" stop-opacity="0"/>
        <stop offset=".7" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1"  stop-color="${hombre ? '#e8c99a' : '#fff2dc'}" stop-opacity="${hombre ? '.35' : '.55'}"/>
      </linearGradient>
      <linearGradient id="pelo-${id}" x1=".2" y1="0" x2=".8" y2="1">
        <stop offset="0" stop-color="${pelo1}"/>
        <stop offset="1" stop-color="${pelo2}"/>
      </linearGradient>
      <linearGradient id="tela-${id}" x1=".1" y1="0" x2=".85" y2="1">
        <stop offset="0" stop-color="${telaA}"/>
        <stop offset="1" stop-color="${telaB}"/>
      </linearGradient>
      <radialGradient id="vin-${id}" cx=".38" cy=".3" r=".85">
        <stop offset="0"  stop-color="#000" stop-opacity="0"/>
        <stop offset=".7" stop-color="#000" stop-opacity="0"/>
        <stop offset="1"  stop-color="#000" stop-opacity=".5"/>
      </radialGradient>
      <filter id="grano-${id}" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .05 0"/>
      </filter>
      <clipPath id="marco-${id}"><rect width="600" height="800"/></clipPath>
    </defs>

    <g clip-path="url(#marco-${id})">
      <!-- muro de fondo -->
      <rect width="600" height="800" fill="url(#muro-${id})"/>

      <!-- haz de luz diagonal, como una ventana alta fuera de cuadro -->
      <path d="M600 -40 L600 460 L330 800 L60 800 Z" fill="#fff3de" opacity="${hombre ? '.05' : '.1'}"/>
      <path d="M600 -40 L600 260 L470 800 L300 800 Z" fill="#fff3de" opacity="${hombre ? '.06' : '.12'}"/>

      <!-- sombra de contacto tras la figura -->
      <ellipse cx="300" cy="790" rx="230" ry="46" fill="#000" opacity=".35"/>

      <!-- torso / prenda -->
      <path d="M70 800 C78 668 116 588 178 546 C182 610 210 654 300 660 C390 654 418 610 422 546
               C484 588 522 668 530 800 Z" fill="url(#tela-${id})"/>
      ${hombre ? `
      <!-- solapas y pliegues del saco -->
      <path d="M178 546 C186 612 226 652 300 660 L300 800 L206 800 C206 700 190 610 178 546 Z" fill="#000" opacity=".22"/>
      <path d="M300 660 C374 652 414 612 422 546 C426 616 440 700 452 800 L300 800 Z" fill="#fff" opacity=".045"/>
      <path d="M240 590 C256 630 276 652 300 656" stroke="#000" stroke-opacity=".3" stroke-width="3" fill="none"/>
      <path d="M360 590 C344 630 324 652 300 656" stroke="#fff" stroke-opacity=".1" stroke-width="3" fill="none"/>
      ` : `
      <!-- chal de lino cruzando un hombro, piel del otro al descubierto -->
      <path d="M300 660 C242 656 202 626 182 566 C232 600 268 616 300 618 Z" fill="url(#piel-${id})"/>
      <path d="M422 546 C468 592 508 664 522 760 L440 800 C424 706 404 626 366 578 Z" fill="url(#tela-${id})" opacity=".96"/>
      <path d="M422 546 C468 592 508 664 522 760 L440 800 C424 706 404 626 366 578 Z" fill="#fff" opacity=".08"/>
      <path d="M300 618 C330 616 356 604 378 584" stroke="#fff" stroke-opacity=".14" stroke-width="3" fill="none"/>
      `}

      <!-- cuello -->
      <path d="M262 512 L338 512 L346 566 C322 584 278 584 254 566 Z" fill="url(#piel-${id})"/>
      <path d="M262 512 L338 512 L336 528 L264 528 Z" fill="#000" opacity=".18"/>

      <!-- cabeza, de tres cuartos y de espaldas -->
      <path d="M300 168 C362 168 402 214 406 276 C410 336 398 404 372 452
               C352 488 328 508 300 512 C272 508 248 488 228 452
               C202 404 190 336 194 276 C198 214 238 168 300 168 Z"
            fill="url(#piel-${id})"/>
      <!-- borde iluminado del lado derecho (la luz de la ventana) -->
      <path d="M300 168 C362 168 402 214 406 276 C410 336 398 404 372 452 C352 488 328 508 300 512 Z"
            fill="url(#pieldura-${id})"/>

      <!-- oreja -->
      <path d="M204 328 C196 316 196 300 206 290 C216 282 228 288 230 302 C232 318 224 334 210 340 Z"
            fill="url(#piel-${id})"/>
      <path d="M210 302 C214 298 220 300 220 308 C220 316 214 320 210 316 Z" fill="${pielC}" opacity=".6"/>

      ${hombre ? `
      <!-- cabello corto: un casquete convexo, trazado en un solo sentido -->
      <path d="M300 168
               C358 168 400 206 404 266
               C406 298 402 328 390 352
               C348 370 252 370 210 352
               C198 328 194 298 196 266
               C200 206 242 168 300 168 Z" fill="url(#pelo-${id})"/>
      <!-- volumen: sombra suave hacia la nuca, sin recortar la forma -->
      <path d="M210 352 C252 370 348 370 390 352 C384 362 372 368 358 368
               L242 368 C228 368 216 362 210 352 Z" fill="${pelo2}" opacity=".55"/>
      <!-- brillo de la coronilla y raya al centro -->
      <path d="M300 178 L300 220" stroke="${pelo2}" stroke-width="2.2" fill="none" opacity=".3"/>
      <path d="M222 224 C214 250 212 278 216 304" stroke="${pelo1}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".35"/>
      <path d="M378 224 C386 250 388 278 384 304" stroke="${pelo1}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".35"/>
      ` : `
      <!-- casquete corto: sólo cubre hasta la altura de la oreja -->
      <path d="M300 166
               C362 166 406 202 412 254
               C414 276 411 296 402 312
               C366 294 334 286 300 286
               C266 286 234 294 198 312
               C189 296 186 276 188 254
               C194 202 238 166 300 166 Z" fill="url(#pelo-${id})"/>
      <path d="M198 312 C234 294 266 286 300 286 C334 286 366 294 402 312
               C398 320 392 326 384 330 C348 312 320 306 300 306
               C280 306 252 312 216 330 C208 326 202 320 198 312 Z" fill="${pelo1}" opacity=".5"/>
      <!-- dos mechones cayendo sobre los hombros, sueltos -->
      <path d="M200 300 C178 344 178 402 200 456 C212 486 230 507 252 517
               C228 492 214 456 212 414 C210 372 212 332 218 304 Z" fill="url(#pelo-${id})"/>
      <path d="M400 300 C422 344 422 402 400 456 C388 486 370 507 348 517
               C372 492 386 456 388 414 C390 372 388 332 382 304 Z" fill="url(#pelo-${id})" opacity=".92"/>
      <!-- moño bajo, apoyado en la nuca, fuera del óvalo del rostro -->
      <ellipse cx="300" cy="472" rx="54" ry="38" fill="url(#pelo-${id})"/>
      <path d="M264 466 C276 452 292 446 308 448" stroke="${pelo1}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".4"/>
      <path d="M254 486 C266 500 284 506 302 504" stroke="${pelo2}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".4"/>
      `}

      <!-- viñeta y grano de película -->
      <rect width="600" height="800" fill="url(#vin-${id})"/>
      <rect width="600" height="800" filter="url(#grano-${id})" opacity=".5"/>
    </g>
  </svg>`;
}
