const SPREADSHEET_ID = '1xNuN2tUVGF55T_fiHjZknBhg6pkYxj8Gc-TaJ-jPzps';
const APP_NAME = 'EXPO 12H CONTROL CENTER';
const STATE_SHEET = 'APP_STATE';
const CHUNK_SIZE = 45000;

function setupExpo12hControlCenter() {
  const ss = getSpreadsheet_();
  const stateSheet = ensureStateSheet_(ss);
  const setupSheets = [
    'DASHBOARD',
    'CHECKLIST',
    'TIMELINE',
    'VEHICLES',
    'ACTIVATIONS',
    'TEAM',
    'STAFF',
    'INCIDENTS',
    'BROADCAST',
    'MAP'
  ];
  setupSheets.forEach((name) => getOrCreateSheet_(ss, name));
  safeHideSheet_(ss, stateSheet);
  return { ok: true, message: 'EXPO 12H conectado', spreadsheetId: SPREADSHEET_ID };
}

function doGet(e) {
  const action = getParam_(e, 'action', 'state');
  const callback = getParam_(e, 'callback', '');

  try {
    if (action === 'ping') {
      setupExpo12hControlCenter();
      return respond_({
        ok: true,
        app: APP_NAME,
        spreadsheetId: SPREADSHEET_ID,
        updatedAt: new Date().toISOString()
      }, callback);
    }

    if (action === 'state') {
      const payload = readPayload_();
      return respond_({
        ok: true,
        app: APP_NAME,
        spreadsheetId: SPREADSHEET_ID,
        state: payload ? payload.state : null,
        savedAt: payload ? payload.savedAt : ''
      }, callback);
    }

    return respond_({ ok: false, error: 'Acción no soportada' }, callback);
  } catch (error) {
    return respond_({ ok: false, error: String(error && error.message ? error.message : error) }, callback);
  }
}

function doPost(e) {
  try {
    const action = getParam_(e, 'action', 'save');
    if (action !== 'save') {
      return respond_({ ok: false, error: 'Acción POST no soportada' });
    }

    const raw = getParam_(e, 'payload', e.postData && e.postData.contents ? e.postData.contents : '');
    if (!raw) {
      return respond_({ ok: false, error: 'Payload vacío' });
    }

    const payload = JSON.parse(raw);
    payload.savedAt = new Date().toISOString();
    payload.source = 'github-pages';

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      savePayload_(payload);
      mirrorPayload_(payload);
    } finally {
      lock.releaseLock();
    }

    return respond_({
      ok: true,
      savedAt: payload.savedAt,
      spreadsheetId: SPREADSHEET_ID
    });
  } catch (error) {
    return respond_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getParam_(e, key, fallback) {
  return e && e.parameter && e.parameter[key] !== undefined ? e.parameter[key] : fallback;
}

function respond_(payload, callback) {
  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(payload)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureStateSheet_(ss) {
  const sheet = getOrCreateSheet_(ss, STATE_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['key', 'value', 'updatedAt']);
  }
  return sheet;
}

function safeHideSheet_(ss, sheet) {
  if (ss.getSheets().length > 1 && !sheet.isSheetHidden()) {
    sheet.hideSheet();
  }
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function savePayload_(payload) {
  const ss = getSpreadsheet_();
  const sheet = ensureStateSheet_(ss);
  const json = JSON.stringify(payload);
  const chunks = [];
  for (let index = 0; index < json.length; index += CHUNK_SIZE) {
    chunks.push(json.slice(index, index + CHUNK_SIZE));
  }

  const rows = [
    ['key', 'value', 'updatedAt'],
    ['chunkCount', String(chunks.length), payload.savedAt],
    ['savedAt', payload.savedAt, payload.savedAt],
    ...chunks.map((chunk, index) => [`chunk_${String(index).padStart(4, '0')}`, chunk, payload.savedAt])
  ];

  sheet.clear();
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  safeHideSheet_(ss, sheet);
}

function readPayload_() {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName(STATE_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;

  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  const chunks = rows
    .filter((row) => String(row[0]).indexOf('chunk_') === 0)
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .map((row) => row[1]);

  if (!chunks.length) return null;
  return JSON.parse(chunks.join(''));
}

function mirrorPayload_(payload) {
  const ss = getSpreadsheet_();
  const state = payload.state || {};
  const catalog = payload.catalog || {};

  writeSheet_(ss, 'DASHBOARD', ['Métrica', 'Valor'], buildDashboardRows_(state, catalog, payload));
  writeSheet_(ss, 'CHECKLIST', [
    'Área', 'Tarea', 'Estado', 'Responsable', 'Hora', 'Prioridad', 'Observación', 'Evidencia', 'Actualizado'
  ], (catalog.checklist || []).map((task) => {
    const record = (state.checklist || {})[task.id] || {};
    return [
      task.area,
      task.title,
      record.status || '',
      record.responsable || task.responsable || '',
      record.time || task.time || '',
      record.priority || task.priority || '',
      record.observation || '',
      record.evidence || '',
      record.updatedAt || ''
    ];
  }));

  writeSheet_(ss, 'TIMELINE', [
    'Inicio', 'Fin', 'Actividad', 'Detalle', 'Estado', 'Observación', 'Actualizado'
  ], (catalog.timeline || []).map((item) => {
    const record = (state.timeline || {})[item.id] || {};
    return [item.start, item.end, item.title, item.detail, record.status || '', record.observation || '', record.updatedAt || ''];
  }));

  writeSheet_(ss, 'VEHICLES', [
    'Número', 'Categoría', 'Marca', 'Modelo', 'Piloto', 'Ciudad', 'Llegó', 'Hora llegada', 'Revisión',
    'Estado revisión', 'Parqueadero', 'Puesto', 'Pre-grid', 'Show', 'Hora presentación', 'Caravana', 'Observación', 'Actualizado'
  ], (catalog.vehicles || []).map((vehicle) => {
    const record = (state.vehicles || {})[vehicle.id] || {};
    return [
      vehicle.numeroAuto,
      vehicle.categoria,
      vehicle.marca,
      vehicle.modelo,
      vehicle.pilotoPrincipal,
      vehicle.ciudad,
      bool_(record.llego),
      record.horaLlegada || '',
      bool_(record.revision),
      record.estadoRevision || '',
      record.parqueadero || '',
      record.puesto || '',
      bool_(record.preGrid),
      bool_(record.presentado),
      record.horaPresentacion || '',
      bool_(record.listoCaravana),
      record.observacion || '',
      record.updatedAt || ''
    ];
  }));

  const activationControls = catalog.activationControls || [];
  writeSheet_(ss, 'ACTIVATIONS', [
    'N°', 'Nombre', 'Instagram', 'Completado', 'Porcentaje', ...activationControls.map((control) => control.label), 'Zona', 'Observación', 'Actualizado'
  ], (catalog.activations || []).map((person) => {
    const record = (state.activations || {})[person.id] || {};
    const done = activationControls.filter((control) => record[control.key]).length;
    const total = activationControls.length || 1;
    return [
      person.number,
      person.name,
      person.instagram,
      `${done}/${total}`,
      Math.round((done / total) * 100) + '%',
      ...activationControls.map((control) => bool_(record[control.key])),
      record.zona || '',
      record.observacion || '',
      record.updatedAt || ''
    ];
  }));

  writeSheet_(ss, 'TEAM', [
    'Cargo', 'Nombre', 'Estado', 'Teléfono', 'Funciones', 'Observación', 'Actualizado'
  ], (catalog.team || []).map((member) => {
    const record = (state.team || {})[member.id] || {};
    return [
      record.role || member.role,
      record.name || member.name,
      record.status || member.status,
      record.phone || '',
      (member.functions || []).join(' | '),
      record.observation || '',
      record.updatedAt || ''
    ];
  }));

  writeSheet_(ss, 'STAFF', [
    'Código', 'Puesto', 'Detalle', 'Nombre', 'Teléfono', 'Llegó', 'Radio entregado', 'Puesto confirmado', 'Observación', 'Actualizado'
  ], (catalog.staff || []).map((member) => {
    const record = (state.staff || {})[member.id] || {};
    return [
      member.code,
      member.role,
      member.detail,
      record.name || '',
      record.phone || '',
      bool_(record.llego),
      bool_(record.radioEntregado),
      bool_(record.puestoConfirmado),
      record.observation || '',
      record.updatedAt || ''
    ];
  }));

  writeSheet_(ss, 'INCIDENTS', [
    'Hora', 'Área', 'Descripción', 'Responsable', 'Prioridad', 'Estado', 'Evidencia', 'Hora resolución', 'Creado', 'Actualizado'
  ], (state.incidents || []).map((incident) => [
    incident.hora || '',
    incident.area || '',
    incident.descripcion || '',
    incident.responsable || '',
    incident.prioridad || '',
    incident.estado || '',
    incident.evidencia || '',
    incident.horaResolucion || '',
    incident.createdAt || '',
    incident.updatedAt || ''
  ]));

  writeSheet_(ss, 'BROADCAST', [
    'Control', 'Estado', 'Responsable', 'Observación', 'Actualizado'
  ], (catalog.broadcast || []).map((item) => {
    const record = (state.broadcast || {})[item.id] || {};
    return [item.name, record.status || '', record.responsable || '', record.observation || '', record.updatedAt || ''];
  }));

  writeSheet_(ss, 'MAP', [
    'Zona', 'Responsable', 'Estado', 'Tareas', 'Incidencias', 'Actualizado'
  ], (catalog.mapZones || []).map((zone) => {
    const record = (state.map || {})[zone.id] || {};
    return [zone.name, record.responsable || zone.responsable, record.status || '', record.tasks || '', record.incident || '', record.updatedAt || ''];
  }));
}

function buildDashboardRows_(state, catalog, payload) {
  const checklist = Object.values(state.checklist || {});
  const vehicles = Object.values(state.vehicles || {});
  const activations = Object.values(state.activations || {});
  const incidents = state.incidents || [];
  const broadcast = Object.values(state.broadcast || {});

  return [
    ['App', APP_NAME],
    ['Evento', payload.event ? payload.event.dateLabel : '24 SEP · PARQUE CÉNTRICA · IBARRA'],
    ['Última sincronización', payload.savedAt || ''],
    ['Tareas completadas', `${count_(checklist, 'status', 'completado')} / ${(catalog.checklist || []).length}`],
    ['Vehículos inscritos', (catalog.vehicles || []).length],
    ['Vehículos llegaron', countTrue_(vehicles, 'llego')],
    ['Vehículos revisados', countTrue_(vehicles, 'revision')],
    ['Activaciones', `${completeActivations_(activations, catalog.activationControls || [])} / ${(catalog.activations || []).length}`],
    ['Incidencias abiertas', incidents.filter((incident) => incident.estado !== 'RESUELTA').length],
    ['Transmisión lista/online', broadcast.filter((item) => item.status === 'listo' || item.status === 'online').length]
  ];
}

function writeSheet_(ss, name, headers, rows) {
  const sheet = getOrCreateSheet_(ss, name);
  const output = [headers].concat(rows && rows.length ? rows : [headers.map(() => '')]);
  sheet.clear();
  sheet.getRange(1, 1, output.length, headers.length).setValues(output);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#111827')
    .setFontColor('#f2c94c')
    .setFontWeight('bold');
  sheet.autoResizeColumns(1, headers.length);
}

function bool_(value) {
  return value ? 'SI' : 'NO';
}

function count_(items, key, value) {
  return items.filter((item) => item && item[key] === value).length;
}

function countTrue_(items, key) {
  return items.filter((item) => item && item[key]).length;
}

function completeActivations_(items, controls) {
  return items.filter((item) => controls.every((control) => item && item[control.key])).length;
}
