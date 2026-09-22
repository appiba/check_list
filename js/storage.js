import {
  ACTIVATION_CONTROLS,
  ACTIVATIONS,
  BROADCAST,
  CHECKLIST,
  MAP_ZONES,
  MAP_GRID,
  STAFF,
  TEAM,
  TIMELINE,
  VEHICLES
} from "./data.js";

export const STORAGE_KEY = "expo12h-control-center-v1";
export const DEFAULT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxdWHR_Am0abA0Sa55dNNVmwF0LJ8bsO7TGcnIpYfovvwRLXx0UWrFJMycNfAfKJXi8/exec";

const nowIso = () => new Date().toISOString();
const LEGACY_NAME_REPLACEMENTS = [
  ["Martin Proaño", "Franchesco Guzman"],
  ["Martin Proano", "Franchesco Guzman"],
  ["martin-proano", "franchesco-guzman"]
];

export function createDefaultState() {
  return {
    meta: {
      version: 1,
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
      selectedMapZone: "parqueadero-a"
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
          parqueadero: "SIN ASIGNAR",
          puesto: "",
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
        {
          responsable: zone.responsable,
          status: "LISTO",
          quantity: 1,
          gridPosition: MAP_GRID.positions[zone.id] || "",
          tasks: "",
          incident: "",
          updatedAt: ""
        }
      ])
    )
  };
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
  const merged = mergeDefaults(defaults, migrateLegacyState(savedState));
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

  return JSON.parse(serialized);
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
