import { renderActivations } from "./activations.js";
import { renderBroadcast } from "./broadcast.js";
import { renderChecklist } from "./checklist.js";
import { renderConfig } from "./config.js";
import { renderDashboard } from "./dashboard.js";
import { EVENT } from "./data.js";
import { renderIncidents } from "./incidents.js";
import { renderMap } from "./map.js";
import { resetState, loadState, normalizeState, saveState, STORAGE_KEY, touch } from "./storage.js";
import { canSync, pullState, pushState, queueRemoteSave, testConnection } from "./sync.js";
import { renderTeam } from "./team.js";
import { renderTimeline } from "./timeline.js";
import { escapeHtml, getFormValue } from "./utils.js";
import { renderVehicles } from "./vehicles.js";

const app = document.querySelector("#app");
let state = loadState();
let searchRenderTimer;

const NAV_ITEMS = [
  { id: "dashboard", label: "INICIO", short: "INICIO" },
  { id: "checklist", label: "TAREAS", short: "TAREAS" },
  { id: "timeline", label: "AGENDA", short: "AGENDA" },
  { id: "team", label: "EQUIPO", short: "EQUIPO" },
  { id: "vehicles", label: "AUTOS", short: "AUTOS" },
  { id: "activations", label: "ACTIVACIONES", short: "ACTIV." },
  { id: "incidents", label: "INCIDENCIAS", short: "NOVED." },
  { id: "broadcast", label: "CIRCUITO", short: "CCTV" },
  { id: "map", label: "MAPA", short: "MAPA" },
  { id: "config", label: "CONFIGURACIÓN", short: "CONFIG" }
];

const MOBILE_ITEMS = ["dashboard", "checklist", "timeline", "team", "vehicles"];

const renderers = {
  dashboard: renderDashboard,
  checklist: renderChecklist,
  timeline: renderTimeline,
  team: renderTeam,
  vehicles: renderVehicles,
  activations: renderActivations,
  incidents: renderIncidents,
  broadcast: renderBroadcast,
  map: renderMap,
  config: renderConfig
};

function render() {
  const activeView = renderers[state.ui.view] ? state.ui.view : "dashboard";
  document.title = EVENT.appName;

  app.innerHTML = `
    <header class="app-header">
      <div class="header-inner">
        <div class="brand-lockup">
          <div class="event-logo" aria-hidden="true">
            <img src="${escapeHtml(EVENT.logoPrimary)}" alt="">
          </div>
          <div class="brand-block">
            <p>${escapeHtml(EVENT.series)}</p>
            <h1>${escapeHtml(EVENT.name)}<span>CONTROL CENTER</span></h1>
            <p>${escapeHtml(EVENT.dateLabel)}</p>
          </div>
        </div>
        <div class="operative-pill" aria-label="Estado operativo">
          <span></span>
          OPERATIVO
        </div>
      </div>
      <nav class="top-nav" aria-label="Navegación principal">
        ${NAV_ITEMS.map((item) => navButton(item, activeView)).join("")}
      </nav>
    </header>
    <main id="main-content">
      ${renderers[activeView](state)}
    </main>
    <nav class="bottom-nav" aria-label="Navegación móvil">
      ${NAV_ITEMS.filter((item) => MOBILE_ITEMS.includes(item.id)).map((item) => navButton(item, activeView, true)).join("")}
    </nav>
  `;
}

function navButton(item, activeView, compact = false) {
  return `
    <button class="${item.id === activeView ? "active" : ""}" type="button" data-view="${item.id}">
      <span>${escapeHtml(compact ? item.short : item.label)}</span>
    </button>
  `;
}

function saveAndRender({ scrollTop = false, remote = false } = {}) {
  saveState(state);
  if (remote) {
    queueRemoteSave(state, {
      onSuccess: handleRemoteSaveSuccess,
      onError: handleRemoteError
    });
  }
  render();
  if (scrollTop) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function updateRecord(collection, id, field, value) {
  if (!state[collection]?.[id]) return;
  state[collection][id][field] = value;
  touch(state[collection][id]);
  saveAndRender({ remote: true });
}

function toggleRecord(collection, id, field, checked) {
  updateRecord(collection, id, field, checked);
}

function currentTime() {
  return new Date().toTimeString().slice(0, 5);
}

app.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    state.ui.view = viewButton.dataset.view;
    saveAndRender({ scrollTop: true, remote: false });
    return;
  }

  const target = event.target.closest("[data-action]");
  if (!target) return;

  const { action, filter, value, id } = target.dataset;

  if (action === "set-checklist-filter") {
    state.ui[filter] = value;
    saveAndRender({ remote: false });
  }

  if (action === "open-incident-form") {
    state.ui.view = "incidents";
    state.ui.incidentFormOpen = true;
    saveAndRender({ scrollTop: true, remote: false });
  }

  if (action === "toggle-incident-form") {
    state.ui.incidentFormOpen = !state.ui.incidentFormOpen;
    saveAndRender({ remote: false });
  }

  if (action === "select-map-zone") {
    state.ui.selectedMapZone = id;
    saveAndRender({ remote: false });
  }

  if (action === "reset-event-data") {
    const confirmed = confirm("¿Reiniciar todos los datos guardados de EXPO 12H en este navegador?");
    if (confirmed) {
      state = resetState();
      saveAndRender({ scrollTop: true, remote: true });
    }
  }

  if (action === "sync-test") {
    runSyncTest();
  }

  if (action === "sync-pull") {
    runSyncPull();
  }

  if (action === "sync-push") {
    runSyncPush();
  }
});

app.addEventListener("input", (event) => {
  const target = event.target;
  if (target.dataset.action !== "set-ui-field") return;
  const field = target.dataset.field;
  if (!["vehicleSearch", "activationSearch"].includes(field)) return;

  state.ui[field] = target.value;
  saveState(state);
  clearTimeout(searchRenderTimer);
  searchRenderTimer = setTimeout(render, 250);
});

app.addEventListener("change", (event) => {
  const target = event.target;
  const action = target.dataset.action;
  if (!action) return;

  const { id, field, filter } = target.dataset;
  const value = target.type === "checkbox" ? target.checked : target.value;

  if (action === "set-checklist-filter") {
    state.ui[filter] = value;
    saveAndRender({ remote: false });
  }

  if (action === "set-ui-field") {
    state.ui[field] = value;
    saveAndRender({ remote: false });
  }

  if (action === "update-sync-field") {
    state.sync[field] = value;
    if (field === "webAppUrl") {
      state.sync.status = value ? "configurado" : "local";
      state.sync.message = value ? "URL guardada. Prueba la conexión." : "Sin conexión activa";
      state.sync.lastError = "";
    }
    saveAndRender({ remote: false });
  }

  if (action === "toggle-sync-enabled") {
    state.sync.enabled = value;
    state.sync.status = value ? "configurado" : "local";
    state.sync.message = value ? "Sincronización activada" : "Sincronización pausada";
    state.sync.lastError = "";
    saveAndRender({ remote: false });
  }

  if (action === "toggle-checklist-complete") {
    const record = state.checklist[id];
    record.status = target.checked ? "completado" : "pendiente";
    touch(record);
    saveAndRender({ remote: true });
  }

  if (action === "update-checklist-field") {
    updateRecord("checklist", id, field, value);
  }

  if (action === "toggle-vehicle-field") {
    toggleRecord("vehicles", id, field, value);
  }

  if (action === "update-vehicle-field") {
    updateRecord("vehicles", id, field, value);
  }

  if (action === "toggle-activation-field") {
    toggleRecord("activations", id, field, value);
  }

  if (action === "update-activation-field") {
    updateRecord("activations", id, field, value);
  }

  if (action === "update-timeline-field") {
    updateRecord("timeline", id, field, value);
  }

  if (action === "update-team-field") {
    updateRecord("team", id, field, value);
  }

  if (action === "update-staff-field") {
    updateRecord("staff", id, field, value);
  }

  if (action === "toggle-staff-field") {
    toggleRecord("staff", id, field, value);
  }

  if (action === "update-incident-field") {
    const incident = state.incidents.find((item) => item.id === id);
    if (!incident) return;
    incident[field] = value;
    if (field === "estado" && value === "RESUELTA" && !incident.horaResolucion) {
      incident.horaResolucion = currentTime();
    }
    touch(incident);
    saveAndRender({ remote: true });
  }

  if (action === "update-broadcast-field") {
    updateRecord("broadcast", id, field, value);
  }

  if (action === "update-map-field") {
    updateRecord("map", id, field, value);
  }
});

app.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.dataset.action !== "create-incident") return;
  event.preventDefault();

  const formData = new FormData(form);
  const now = new Date().toISOString();
  state.incidents.unshift({
    id: `incident-${Date.now()}`,
    hora: getFormValue(formData, "hora", currentTime()),
    area: getFormValue(formData, "area", "Operación"),
    descripcion: getFormValue(formData, "descripcion"),
    responsable: getFormValue(formData, "responsable"),
    prioridad: getFormValue(formData, "prioridad", "MEDIA"),
    estado: getFormValue(formData, "estado", "ABIERTA"),
    evidencia: getFormValue(formData, "evidencia"),
    horaResolucion: "",
    createdAt: now,
    updatedAt: now
  });
  state.ui.incidentFormOpen = false;
  saveAndRender({ remote: true });
});

render();
bootstrapSync();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("Service worker no registrado.", error);
    });
  });
}

function setSyncStatus(patch, shouldRender = state.ui.view === "config") {
  state.sync = {
    ...state.sync,
    ...patch
  };
  saveState(state);
  if (shouldRender) render();
}

function handleRemoteSaveSuccess(result = {}) {
  setSyncStatus({
    status: "online",
    message: "Estado enviado a Google Sheets",
    lastPushAt: result.savedAt || new Date().toISOString(),
    lastError: ""
  });
}

function handleRemoteError(error) {
  setSyncStatus({
    status: "error",
    message: "No se pudo sincronizar",
    lastError: error.message
  });
}

async function runSyncTest() {
  try {
    setSyncStatus({ status: "sincronizando", message: "Probando conexión con Apps Script", lastError: "" }, true);
    const response = await testConnection(state.sync.webAppUrl);
    if (!response.ok) throw new Error(response.error || "Respuesta inválida de Apps Script.");
    setSyncStatus({
      status: "online",
      message: "Conexión activa con Google Sheets",
      spreadsheetId: response.spreadsheetId || state.sync.spreadsheetId,
      lastError: ""
    }, true);
  } catch (error) {
    handleRemoteError(error);
  }
}

async function runSyncPull() {
  try {
    setSyncStatus({ status: "sincronizando", message: "Leyendo estado remoto", lastError: "" }, true);
    const response = await pullState(state.sync.webAppUrl);
    if (!response.state) {
      setSyncStatus({
        status: "online",
        message: "Conexión activa. La hoja todavía no tiene estado guardado.",
        lastPullAt: new Date().toISOString(),
        lastError: ""
      }, true);
      return;
    }
    adoptRemoteState(response.state, "Estado remoto cargado desde Google Sheets");
  } catch (error) {
    handleRemoteError(error);
  }
}

async function runSyncPush() {
  try {
    setSyncStatus({ status: "sincronizando", message: "Enviando estado a Google Sheets", lastError: "" }, true);
    const response = await pushState(state);
    handleRemoteSaveSuccess(response);
  } catch (error) {
    handleRemoteError(error);
  }
}

async function bootstrapSync() {
  if (!canSync(state)) return;
  try {
    const hasLocalState = Boolean(localStorage.getItem(STORAGE_KEY));
    setSyncStatus({ status: "sincronizando", message: "Sincronizando al iniciar", lastError: "" }, false);
    const response = await pullState(state.sync.webAppUrl);
    if (response.state && (!hasLocalState || new Date(response.state.meta?.updatedAt || 0) > new Date(state.meta.updatedAt))) {
      adoptRemoteState(response.state, "Estado remoto más reciente cargado");
    } else {
      queueRemoteSave(state, {
        onSuccess: handleRemoteSaveSuccess,
        onError: handleRemoteError
      });
    }
  } catch (error) {
    handleRemoteError(error);
  }
}

function adoptRemoteState(remoteState, message) {
  const localSync = { ...state.sync };
  const localUi = { ...state.ui };
  state = normalizeState(remoteState);
  state.sync = {
    ...state.sync,
    ...localSync,
    status: "online",
    message,
    lastPullAt: new Date().toISOString(),
    lastError: ""
  };
  state.ui = {
    ...state.ui,
    ...localUi
  };
  saveState(state);
  render();
}
