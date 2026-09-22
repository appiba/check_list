import {
  ACTIVATION_CONTROLS,
  ACTIVATIONS,
  BROADCAST,
  CHECKLIST,
  MAP_ZONES,
  STAFF,
  TEAM,
  TIMELINE,
  VEHICLES
} from "./data.js";

export const STORAGE_KEY = "expo12h-control-center-v1";

const nowIso = () => new Date().toISOString();

export function createDefaultState() {
  return {
    meta: {
      version: 1,
      createdAt: nowIso(),
      updatedAt: nowIso()
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

export function loadState() {
  const defaults = createDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return mergeDefaults(defaults, JSON.parse(raw));
  } catch (error) {
    console.warn("No se pudo cargar el estado local.", error);
    return defaults;
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
