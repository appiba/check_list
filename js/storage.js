import {
  ACTIVATION_CONTROLS,
  ACTIVATIONS,
  BROADCAST,
  CHECKLIST,
  MAP_ZONES,
  MAP_GRID,
  MAP_PLAN_VERSION,
  PARKING_PLAN_VERSION,
  STAFF,
  TEAM,
  TIMELINE,
  VEHICLES
} from "./data.js?v=20260924-map-v2";

export const STORAGE_KEY = "expo12h-control-center-v1";
export const DEFAULT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxdWHR_Am0abA0Sa55dNNVmwF0LJ8bsO7TGcnIpYfovvwRLXx0UWrFJMycNfAfKJXi8/exec";

const nowIso = () => new Date().toISOString();
const LEGACY_NAME_REPLACEMENTS = [
  ["Martin Proaño", "Franchesco Guzman"],
  ["Martin Proano", "Franchesco Guzman"],
  ["martin-proano", "franchesco-guzman"]
];
const ZONA_FEST_ID = "zona-fest";
const LEGACY_ZONA_FEST_IDS = ["zona-fest-derecha", "zona-fest-izquierda"];
const LEGACY_MAP_GRID_COLUMNS = 12;
const LEGACY_MAP_GRID_ROWS = 12;
const OFFICIAL_MAP_ZONE_IDS = new Set(MAP_ZONES.map((zone) => zone.id));
const OFFICIAL_MAP_ZONE_KEYS = new Set(
  MAP_ZONES.flatMap((zone) => [zone.id, zone.name]).map(normalizeMapZoneKey).filter(Boolean)
);

export function createDefaultState() {
  return {
    meta: {
      version: 1,
      mapGridColumns: MAP_GRID.columns,
      mapGridRows: MAP_GRID.rows,
      mapPlanVersion: MAP_PLAN_VERSION,
      parkingPlanVersion: PARKING_PLAN_VERSION,
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    sync: {
      enabled: true,
      webAppUrl: DEFAULT_WEB_APP_URL,
      spreadsheetId: "1xNuN2tUVGF55T_fiHjZknBhg6pkYxj8Gc-TaJ-jPzps",
      status: "configurado",
      message: "Sincronización lista con Google Sheets",
      lastPullAt: "",
      lastPushAt: "",
      lastRemoteSavedAt: "",
      lastError: ""
    },
    ui: {
      view: "dashboard",
      checklistStatus: "todas",
      checklistArea: "todas",
      checklistOwner: "todos",
      vehicleSearch: "",
      vehicleCategory: "todas",
      activationSearch: "",
      incidentFormOpen: false,
      selectedMapZone: "parqueadero-a",
      selectedMapPlacement: "",
      mapPickerCell: "",
      mapMode: "place",
      mapZoom: 1
    },
    checklist: Object.fromEntries(
      CHECKLIST.map((task) => [
        task.id,
        {
          status: "pendiente",
          responsable: task.responsable,
          time: task.time,
          priority: task.priority,
          observation: "",
          evidence: "",
          updatedAt: ""
        }
      ])
    ),
    timeline: Object.fromEntries(
      TIMELINE.map((item) => [
        item.id,
        {
          status: "proximo",
          observation: "",
          updatedAt: ""
        }
      ])
    ),
    vehicles: Object.fromEntries(
      VEHICLES.map((vehicle) => [
        vehicle.id,
        {
          llego: false,
          horaLlegada: "",
          revision: false,
          estadoRevision: "PENDIENTE",
          parqueadero: vehicle.parkingGroup || "SIN ASIGNAR",
          puesto: vehicle.parkingSpot || "",
          preGrid: false,
          presentado: false,
          horaPresentacion: "",
          listoCaravana: false,
          observacion: "",
          updatedAt: ""
        }
      ])
    ),
    activations: Object.fromEntries(
      ACTIVATIONS.map((person) => [
        person.id,
        {
          ...Object.fromEntries(ACTIVATION_CONTROLS.map((control) => [control.key, false])),
          zona: "",
          observacion: "",
          updatedAt: ""
        }
      ])
    ),
    team: Object.fromEntries(
      TEAM.map((member) => [
        member.id,
        {
          name: member.name,
          role: member.role,
          status: member.status,
          phone: "",
          observation: "",
          updatedAt: ""
        }
      ])
    ),
    staff: Object.fromEntries(
      STAFF.map((member) => [
        member.id,
        {
          name: "",
          phone: "",
          llego: false,
          radioEntregado: false,
          puestoConfirmado: false,
          observation: "",
          updatedAt: ""
        }
      ])
    ),
    incidents: [],
    customMapZones: [],
    deletedMapZoneIds: [],
    broadcast: Object.fromEntries(
      BROADCAST.map((item) => [
        item.id,
        {
          status: "listo",
          responsable: "Producción Técnica",
          observation: "",
          updatedAt: ""
        }
      ])
    ),
    map: Object.fromEntries(
      MAP_ZONES.map((zone) => [
        zone.id,
        createDefaultMapRecord(zone)
      ])
    )
  };
}

function createDefaultMapRecord(zone, sourceRecord = {}) {
  const placements = getDefaultMapPlacements(zone);
  return {
    responsable: sourceRecord?.responsable || zone.responsable,
    status: sourceRecord?.status || "LISTO",
    quantity: placements.length,
    gridPosition: placements.find((placement) => placement.cellId)?.cellId || "",
    placements,
    tasks: sourceRecord?.tasks || "",
    incident: sourceRecord?.incident || "",
    updatedAt: sourceRecord?.updatedAt || ""
  };
}

function getDefaultMapPlacements(zone) {
  const cells = Array.isArray(zone.defaultPlacements)
    ? [...zone.defaultPlacements]
    : [MAP_GRID.positions[zone.id] || ""];
  const requestedQuantity = Math.max(Number.parseInt(zone.defaultQuantity, 10) || 0, cells.length, 1);

  while (cells.length < requestedQuantity) {
    cells.push("");
  }

  return cells.slice(0, requestedQuantity).map((cellId, index) => ({
    id: `${zone.id}-${index + 1}`,
    cellId: cellId || ""
  }));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDefaults(defaultState, savedState) {
  if (Array.isArray(defaultState)) {
    return Array.isArray(savedState) ? savedState : defaultState;
  }

  if (!isPlainObject(defaultState)) {
    return savedState ?? defaultState;
  }

  const merged = { ...defaultState };

  if (!isPlainObject(savedState)) {
    return merged;
  }

  for (const [key, value] of Object.entries(savedState)) {
    merged[key] = key in defaultState ? mergeDefaults(defaultState[key], value) : value;
  }

  return merged;
}

export function normalizeState(savedState) {
  const defaults = createDefaultState();
  const migrated = migrateLegacyState(savedState);
  const merged = mergeDefaults(defaults, migrated);
  migrateMapGridSize(merged, migrated);
  migrateMapPlan(merged, migrated);
  migrateVehicleParkingPlan(merged, migrated);
  if (!merged.sync.webAppUrl) {
    merged.sync.webAppUrl = defaults.sync.webAppUrl;
  }
  merged.sync.enabled = true;
  return merged;
}

function migrateLegacyState(savedState) {
  if (!savedState) return savedState;

  let serialized = JSON.stringify(savedState);
  for (const [from, to] of LEGACY_NAME_REPLACEMENTS) {
    serialized = serialized.split(from).join(to);
  }

  const migrated = JSON.parse(serialized);
  migrateZonaFestMap(migrated);
  return migrated;
}

function migrateZonaFestMap(state) {
  if (!isPlainObject(state) || !isPlainObject(state.map)) return;

  const legacyRecords = LEGACY_ZONA_FEST_IDS.map((id) => state.map[id]).filter(isPlainObject);
  if (!legacyRecords.length) return;

  const existingRecord = isPlainObject(state.map[ZONA_FEST_ID]) ? state.map[ZONA_FEST_ID] : {};
  const seedRecord = Object.keys(existingRecord).length ? existingRecord : legacyRecords[0];
  const placements = [];
  const usedIds = new Set();
  let requestedQuantity = Number.parseInt(existingRecord.quantity, 10) || 0;

  const addPlacement = (placement, fallbackId) => {
    const baseId = placement?.id ? String(placement.id).replace(/^zona-fest-(derecha|izquierda)/, ZONA_FEST_ID) : fallbackId;
    let id = baseId || `${ZONA_FEST_ID}-${placements.length + 1}`;
    let index = 2;
    while (usedIds.has(id)) {
      id = `${baseId || ZONA_FEST_ID}-${index}`;
      index += 1;
    }
    usedIds.add(id);
    placements.push({
      id,
      cellId: placement?.cellId || ""
    });
  };

  if (Array.isArray(existingRecord.placements)) {
    existingRecord.placements.forEach((placement, index) => addPlacement(placement, `${ZONA_FEST_ID}-${index + 1}`));
  } else if (existingRecord.gridPosition) {
    addPlacement({ cellId: existingRecord.gridPosition }, `${ZONA_FEST_ID}-1`);
  }

  legacyRecords.forEach((record, recordIndex) => {
    const recordPlacements = Array.isArray(record.placements)
      ? record.placements
      : record.gridPosition
        ? [{ cellId: record.gridPosition }]
        : [];
    requestedQuantity += Math.max(Number.parseInt(record.quantity, 10) || 0, recordPlacements.length);
    recordPlacements.forEach((placement, placementIndex) => {
      addPlacement(placement, `${ZONA_FEST_ID}-${recordIndex + 1}-${placementIndex + 1}`);
    });
  });

  const finalQuantity = Math.max(requestedQuantity, placements.length, 1);
  while (placements.length < finalQuantity) {
    addPlacement({ cellId: "" }, `${ZONA_FEST_ID}-${placements.length + 1}`);
  }

  state.map[ZONA_FEST_ID] = {
    responsable: seedRecord.responsable || "Martin Gomezjurado",
    status: seedRecord.status || "LISTO",
    quantity: placements.length,
    gridPosition: placements.find((placement) => placement.cellId)?.cellId || "",
    placements,
    tasks: seedRecord.tasks || "",
    incident: seedRecord.incident || "",
    updatedAt: seedRecord.updatedAt || ""
  };

  for (const id of LEGACY_ZONA_FEST_IDS) {
    delete state.map[id];
  }

  if (isPlainObject(state.ui) && LEGACY_ZONA_FEST_IDS.includes(state.ui.selectedMapZone)) {
    state.ui.selectedMapZone = ZONA_FEST_ID;
    state.ui.selectedMapPlacement = "";
  }
}

function migrateVehicleParkingPlan(state, sourceState = state) {
  if (!isPlainObject(state) || !isPlainObject(state.vehicles)) return;

  const meta = isPlainObject(state.meta) ? state.meta : {};
  const sourceMeta = isPlainObject(sourceState?.meta) ? sourceState.meta : {};
  const alreadyCurrent = sourceMeta.parkingPlanVersion === PARKING_PLAN_VERSION;

  if (!alreadyCurrent) {
    VEHICLES.forEach((vehicle) => {
      const record = state.vehicles[vehicle.id];
      if (!isPlainObject(record)) return;
      record.parqueadero = vehicle.parkingGroup || "SIN ASIGNAR";
      record.puesto = vehicle.parkingSpot || "";
    });
  }

  state.meta = {
    ...meta,
    parkingPlanVersion: PARKING_PLAN_VERSION,
    needsRemoteSave: meta.needsRemoteSave || !alreadyCurrent
  };
}

function migrateMapPlan(state, sourceState = state) {
  if (!isPlainObject(state) || !isPlainObject(state.map)) return;

  const meta = isPlainObject(state.meta) ? state.meta : {};
  const sourceMeta = isPlainObject(sourceState?.meta) ? sourceState.meta : {};
  const alreadyCurrent = sourceMeta.mapPlanVersion === MAP_PLAN_VERSION;
  let changed = false;
  const duplicateCustomZoneIds = new Set();

  if (Array.isArray(state.customMapZones)) {
    state.customMapZones = state.customMapZones.filter((zone) => {
      const duplicate = isOfficialMapZoneDuplicate(zone);
      if (duplicate) {
        duplicateCustomZoneIds.add(zone.id);
        changed = true;
      }
      return !duplicate;
    });
  } else {
    state.customMapZones = [];
    changed = true;
  }

  if (Array.isArray(state.deletedMapZoneIds)) {
    const filteredDeleted = state.deletedMapZoneIds.filter((id) => !OFFICIAL_MAP_ZONE_IDS.has(id));
    changed = changed || filteredDeleted.length !== state.deletedMapZoneIds.length;
    state.deletedMapZoneIds = filteredDeleted;
  } else {
    state.deletedMapZoneIds = [];
    changed = true;
  }

  duplicateCustomZoneIds.forEach((id) => {
    delete state.map[id];
  });

  if (!alreadyCurrent) {
    MAP_ZONES.forEach((zone) => {
      state.map[zone.id] = createDefaultMapRecord(zone, state.map[zone.id]);
    });

    for (const id of LEGACY_ZONA_FEST_IDS) {
      delete state.map[id];
    }

    const visibleZoneIds = new Set([...OFFICIAL_MAP_ZONE_IDS, ...state.customMapZones.map((zone) => zone.id)]);
    if (isPlainObject(state.ui) && !visibleZoneIds.has(state.ui.selectedMapZone)) {
      state.ui.selectedMapZone = "parqueadero-a";
      state.ui.selectedMapPlacement = "";
    }
  }

  state.meta = {
    ...meta,
    mapPlanVersion: MAP_PLAN_VERSION,
    needsRemoteSave: meta.needsRemoteSave || changed || !alreadyCurrent
  };
}

function isOfficialMapZoneDuplicate(zone = {}) {
  if (!zone.id || OFFICIAL_MAP_ZONE_IDS.has(zone.id)) return false;
  const keys = [zone.id, zone.name].map(normalizeMapZoneKey).filter(Boolean);
  return keys.some((key) => OFFICIAL_MAP_ZONE_KEYS.has(key) || (key === "TRANSITO" && OFFICIAL_MAP_ZONE_KEYS.has("TRANCITO")));
}

function normalizeMapZoneKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function migrateMapGridSize(state, sourceState = state) {
  if (!isPlainObject(state) || !isPlainObject(state.map)) return;

  const meta = isPlainObject(state.meta) ? state.meta : {};
  const sourceMeta = isPlainObject(sourceState?.meta) ? sourceState.meta : {};
  const fromColumns = Number.parseInt(sourceMeta.mapGridColumns, 10) || LEGACY_MAP_GRID_COLUMNS;
  const fromRows = Number.parseInt(sourceMeta.mapGridRows, 10) || LEGACY_MAP_GRID_ROWS;
  const isCurrentGrid = fromColumns === MAP_GRID.columns && fromRows === MAP_GRID.rows;

  if (!isCurrentGrid) {
    Object.values(state.map).forEach((record) => {
      if (!isPlainObject(record)) return;

      if (record.gridPosition) {
        record.gridPosition = scaleMapCell(record.gridPosition, fromRows, fromColumns);
      }

      if (Array.isArray(record.placements)) {
        record.placements.forEach((placement) => {
          if (placement?.cellId) {
            placement.cellId = scaleMapCell(placement.cellId, fromRows, fromColumns);
          }
        });
      }
    });

    if (isPlainObject(state.ui) && state.ui.mapPickerCell) {
      state.ui.mapPickerCell = scaleMapCell(state.ui.mapPickerCell, fromRows, fromColumns);
    }
  }

  state.meta = {
    ...meta,
    mapGridColumns: MAP_GRID.columns,
    mapGridRows: MAP_GRID.rows
  };
}

function scaleMapCell(cellId, fromRows, fromColumns) {
  const match = String(cellId || "").match(/^r(\d+)-c(\d+)$/);
  if (!match) return "";

  const row = Number(match[1]);
  const column = Number(match[2]);
  const scaledRow = scaleGridIndex(row, fromRows, MAP_GRID.rows);
  const scaledColumn = scaleGridIndex(column, fromColumns, MAP_GRID.columns);
  return `r${scaledRow}-c${scaledColumn}`;
}

function scaleGridIndex(value, fromSize, toSize) {
  if (fromSize <= 1) return Math.min(Math.max(value, 1), toSize);
  const scaled = Math.round(((value - 1) / (fromSize - 1)) * (toSize - 1)) + 1;
  return Math.min(Math.max(scaled, 1), toSize);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    return normalizeState(JSON.parse(raw));
  } catch (error) {
    console.warn("No se pudo cargar el estado local.", error);
    return createDefaultState();
  }
}

export function saveState(state) {
  state.meta.updatedAt = nowIso();
  delete state.meta.needsRemoteSave;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function touch(record) {
  record.updatedAt = nowIso();
  return record;
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return createDefaultState();
}
