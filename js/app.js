import { renderActivations } from "./activations.js";
import { renderBroadcast } from "./broadcast.js";
import { renderChecklist } from "./checklist.js";
import { renderConfig } from "./config.js";
import { renderDashboard } from "./dashboard.js";
import { EVENT, MAP_GRID, MAP_ZONES } from "./data.js";
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
let bottomNavScrollLeft = 0;
let centerActiveNavOnRender = true;
let mapPan = null;
let suppressNextClick = false;
let autoPullTimer;
let autoPullInFlight = false;
let lastLocalRemoteEditAt = 0;

const AUTO_PULL_INTERVAL_MS = 7000;
const LOCAL_EDIT_GRACE_MS = 4000;

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

const NAV_ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.6 12 3l9 7.6v9.1a1.3 1.3 0 0 1-1.3 1.3h-4.2v-6.4h-7V21H4.3A1.3 1.3 0 0 1 3 19.7v-9.1Z"/></svg>',
  checklist: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.3 16.4 5.8 13l-2 2 5.5 5.4L20.5 7.1l-2.1-1.8-9.1 11.1Z"/><path d="M4 5h10v2.4H4V5Zm0 5h7v2.4H4V10Z"/></svg>',
  timeline: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2.4v2h5.2V2H17v2h2.2A2.8 2.8 0 0 1 22 6.8v11.4a2.8 2.8 0 0 1-2.8 2.8H4.8A2.8 2.8 0 0 1 2 18.2V6.8A2.8 2.8 0 0 1 4.8 4H7V2Zm12.6 7.2H4.4v8.8c0 .4.3.6.6.6h14c.3 0 .6-.2.6-.6V9.2Z"/></svg>',
  team: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.4 12.2a4.1 4.1 0 1 1 0-8.2 4.1 4.1 0 0 1 0 8.2Zm7.7-.4a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8ZM2.2 21v-2.2c0-3 2.7-5.4 6.2-5.4s6.2 2.4 6.2 5.4V21H2.2Zm13.8 0v-2.3c0-1.8-.7-3.4-1.9-4.6.6-.2 1.3-.3 2-.3 3.2 0 5.7 2.2 5.7 5V21H16Z"/></svg>',
  vehicles: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h12.2c1.2 0 2.2 1 2.2 2.2v2.4H22V11h-2.6v8.8l-4.1-2.1-4.1 2.1-4.1-2.1L3 19.8V4h2Zm1.2 2.4v9.5l.9-.5 4.1 2.1 4.1-2.1 1.7.9V6.4H6.2Zm2.1 2h6.8v2.2H8.3V8.4Zm0 4h5.1v2.2H8.3v-2.2Z"/></svg>',
  activations: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.2 15.8 5v14L3 13.8v-3.6Zm15.1-2.4 2-1.1a9.7 9.7 0 0 1 0 10.6l-2-1.1a7.4 7.4 0 0 0 0-8.4ZM5.4 11.9v.2l8 3.2V8.7l-8 3.2Zm.8 3.2 3.1 1.2-.8 3.7H5.9l.3-4.9Z"/></svg>',
  incidents: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 22 20H2L12 2.8Zm0 4.9-5.9 10h11.8L12 7.7Zm-1.1 2.8h2.2v4.4h-2.2v-4.4Zm0 5.6h2.2v2.1h-2.2v-2.1Z"/></svg>',
  broadcast: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.8 5h11.8A2.4 2.4 0 0 1 18 7.4v1.9l3.6-2v9.4l-3.6-2v1.9a2.4 2.4 0 0 1-2.4 2.4H3.8A2.4 2.4 0 0 1 1.4 16.6V7.4A2.4 2.4 0 0 1 3.8 5Zm.1 2.4v9.2h11.7V7.4H3.9Z"/></svg>',
  map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6a7 7 0 0 1 7 7c0 5.2-7 11.8-7 11.8S5 14.8 5 9.6a7 7 0 0 1 7-7Zm0 2.5a4.5 4.5 0 0 0-4.5 4.5c0 2.7 2.8 6.2 4.5 8 1.7-1.8 4.5-5.3 4.5-8A4.5 4.5 0 0 0 12 5.1Zm0 2.4a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z"/></svg>',
  config: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m19.4 13.2.1-1.2-.1-1.2 2.1-1.6-2-3.5-2.5 1a8.5 8.5 0 0 0-2.1-1.2L14.5 3h-4l-.4 2.5A8.5 8.5 0 0 0 8 6.7l-2.4-1-2.1 3.5 2.1 1.6-.1 1.2.1 1.2-2.1 1.6 2.1 3.5L8 17.3c.6.5 1.3.9 2.1 1.2l.4 2.5h4l.4-2.5c.8-.3 1.5-.7 2.1-1.2l2.5 1 2-3.5-2.1-1.6ZM12.5 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2Z"/></svg>'
};

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
      ${NAV_ITEMS.map((item) => navButton(item, activeView, "mobile")).join("")}
    </nav>
  `;
  syncBottomNavPosition({ center: centerActiveNavOnRender });
  syncMapViewport();
  centerActiveNavOnRender = false;
}

function navButton(item, activeView, variant = "desktop") {
  const isActive = item.id === activeView;
  const icon = variant === "mobile" ? `<span class="nav-icon">${NAV_ICONS[item.id] || ""}</span>` : "";
  return `
    <button class="${isActive ? "active" : ""}" type="button" data-view="${item.id}" ${isActive ? 'aria-current="page"' : ""}>
      ${icon}
      <span class="nav-label">${escapeHtml(item.label)}</span>
    </button>
  `;
}

function syncBottomNavPosition({ center = false } = {}) {
  window.requestAnimationFrame(() => {
    const nav = app.querySelector(".bottom-nav");
    if (!nav) return;
    nav.scrollLeft = bottomNavScrollLeft;

    const activeButton = nav.querySelector("button.active");
    if (!activeButton) return;

    const navRect = nav.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    const isVisible = buttonRect.left >= navRect.left + 14 && buttonRect.right <= navRect.right - 14;

    if (center || !isVisible) {
      const targetLeft = activeButton.offsetLeft - (nav.clientWidth - activeButton.offsetWidth) / 2;
      nav.scrollTo({ left: Math.max(0, targetLeft), behavior: center ? "smooth" : "auto" });
    }
  });
}

function syncMapViewport() {
  window.requestAnimationFrame(() => {
    const viewport = app.querySelector("[data-map-viewport]");
    if (!viewport) return;
    viewport.scrollLeft = state.ui.mapScrollLeft || 0;
    viewport.scrollTop = state.ui.mapScrollTop || 0;
  });
}

function saveAndRender({ scrollTop = false, remote = false } = {}) {
  if (remote) {
    lastLocalRemoteEditAt = Date.now();
  }
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
  if (collection === "map" && field === "quantity") {
    setMapQuantity(id, Math.max(0, Number.parseInt(value, 10) || 0));
    return;
  }
  state[collection][id][field] = value;
  touch(state[collection][id]);
  saveAndRender({ remote: true });
}

function moveMapZone(zoneId, targetCellId, placementId = "") {
  if (!state.map?.[zoneId] || !targetCellId) return;

  ensureMapPlacements(zoneId);
  const normalizedCellId = normalizeMapCell(targetCellId);
  const placement = getMapPlacementForMove(zoneId, placementId);
  if (!placement) return;

  if (isMapCellOccupied(normalizedCellId, zoneId, placement.id)) {
    state.ui.selectedMapZone = zoneId;
    state.ui.selectedMapPlacement = placement.id;
    saveAndRender({ remote: false });
    return;
  }

  placement.cellId = normalizedCellId;
  state.map[zoneId].gridPosition = normalizedCellId;
  state.map[zoneId].quantity = state.map[zoneId].placements.length;
  touch(state.map[zoneId]);
  state.ui.selectedMapZone = zoneId;
  state.ui.selectedMapPlacement = placement.id;
  saveAndRender({ remote: true });
}

function openMapCellPicker(cellId) {
  if (!cellId) return;
  state.ui.mapPickerCell = normalizeMapCell(cellId);
  saveAndRender({ remote: false });
}

function closeMapCellPicker() {
  state.ui.mapPickerCell = "";
  saveAndRender({ remote: false });
}

function placePickedMapZone(zoneId, targetCellId) {
  if (!state.map?.[zoneId] || !targetCellId) return;
  const placement = getMapPlacementForPicker(zoneId);
  if (!placement) return;
  state.ui.mapPickerCell = "";
  moveMapZone(zoneId, targetCellId, placement.id);
}

function removeMapZone(zoneId, placementId = "") {
  if (!state.map?.[zoneId]) return;
  ensureMapPlacements(zoneId);
  const placements = state.map[zoneId].placements;
  const selectedPlacementId = placementId || (state.ui.selectedMapZone === zoneId ? state.ui.selectedMapPlacement : "");
  const placed =
    (selectedPlacementId ? placements.find((placement) => placement.id === selectedPlacementId && placement.cellId) : null) ||
    [...placements].reverse().find((placement) => placement.cellId);

  if (placed) {
    placed.cellId = "";
  }
  state.map[zoneId].gridPosition = placements.find((placement) => placement.cellId)?.cellId || "";
  state.map[zoneId].quantity = placements.length;
  touch(state.map[zoneId]);
  state.ui.selectedMapZone = zoneId;
  state.ui.selectedMapPlacement = placements.find((placement) => placement.cellId)?.id || "";
  saveAndRender({ remote: true });
}

function adjustMapQuantity(zoneId, delta) {
  if (!state.map?.[zoneId]) return;
  ensureMapPlacements(zoneId);
  setMapQuantity(zoneId, Math.max(0, state.map[zoneId].placements.length + delta));
}

function setMapQuantity(zoneId, quantity) {
  if (!state.map?.[zoneId]) return;
  ensureMapPlacements(zoneId);
  const placements = state.map[zoneId].placements;
  let createdPlacementId = "";
  while (placements.length < quantity) {
    const placement = { id: `${zoneId}-${Date.now()}-${placements.length + 1}`, cellId: "" };
    placements.push(placement);
    createdPlacementId = placement.id;
  }
  while (placements.length > quantity) {
    let removableIndex = -1;
    const selectedPlacementId = state.ui.selectedMapZone === zoneId ? state.ui.selectedMapPlacement : "";
    if (selectedPlacementId) {
      removableIndex = placements.findIndex((placement) => placement.id === selectedPlacementId);
      state.ui.selectedMapPlacement = "";
    }
    for (let index = placements.length - 1; index >= 0; index -= 1) {
      if (removableIndex >= 0) break;
      if (!placements[index].cellId) {
        removableIndex = index;
        break;
      }
    }
    placements.splice(removableIndex >= 0 ? removableIndex : placements.length - 1, 1);
  }
  state.map[zoneId].quantity = placements.length;
  state.map[zoneId].gridPosition = placements.find((placement) => placement.cellId)?.cellId || "";
  touch(state.map[zoneId]);
  state.ui.selectedMapZone = zoneId;
  if (createdPlacementId) {
    state.ui.selectedMapPlacement = createdPlacementId;
  } else if (!placements.some((placement) => placement.id === state.ui.selectedMapPlacement)) {
    state.ui.selectedMapPlacement = placements.find((placement) => placement.cellId)?.id || "";
  }
  saveAndRender({ remote: true });
}

function ensureMapPlacements(zoneId) {
  const record = state.map[zoneId];
  if (!record) return;
  if (!Array.isArray(record.placements)) {
    record.placements = record.gridPosition ? [{ id: `${zoneId}-1`, cellId: record.gridPosition }] : [];
  }
  const requestedQuantity = Math.max(record.placements.length, Number.parseInt(record.quantity, 10) || 0);
  while (record.placements.length < requestedQuantity) {
    record.placements.push({ id: `${zoneId}-${Date.now()}-${record.placements.length + 1}`, cellId: "" });
  }
  record.quantity = record.placements.length;
}

function getMapPlacementForMove(zoneId, placementId) {
  ensureMapPlacements(zoneId);
  const placements = state.map[zoneId].placements;
  const existing = placementId ? placements.find((placement) => placement.id === placementId) : null;
  if (existing) return existing;
  const unplaced = placements.find((placement) => !placement.cellId);
  if (unplaced) return unplaced;
  if (placements.length) return placements[placements.length - 1];
  const placement = { id: `${zoneId}-${Date.now()}-1`, cellId: "" };
  placements.push(placement);
  state.map[zoneId].quantity = placements.length;
  return placement;
}

function getMapPlacementForPicker(zoneId) {
  ensureMapPlacements(zoneId);
  const placements = state.map[zoneId].placements;

  if (state.ui.selectedMapZone === zoneId && state.ui.selectedMapPlacement) {
    const selected = placements.find((placement) => placement.id === state.ui.selectedMapPlacement);
    if (selected?.cellId) return selected;
  }

  const unplaced = placements.find((placement) => !placement.cellId);
  if (unplaced) return unplaced;

  const placement = { id: `${zoneId}-${Date.now()}-${placements.length + 1}`, cellId: "" };
  placements.push(placement);
  state.map[zoneId].quantity = placements.length;
  return placement;
}

function normalizeMapCell(cellId) {
  const match = String(cellId).match(/^r(\d+)-c(\d+)$/);
  if (!match) return "r1-c1";
  const row = Math.min(Math.max(Number(match[1]), 1), MAP_GRID.rows - MAP_GRID.itemSpan + 1);
  const column = Math.min(Math.max(Number(match[2]), 1), MAP_GRID.columns - MAP_GRID.itemSpan + 1);
  return `r${row}-c${column}`;
}

function isMapCellOccupied(targetCellId, zoneId, placementId) {
  const targetCells = occupiedMapCells(targetCellId);
  return getVisibleMapZones().some(({ id: otherZoneId }) => {
    const record = state.map[otherZoneId];
    if (!record) return false;
    ensureMapPlacements(otherZoneId);
    return record.placements.some((placement) => {
      if (otherZoneId === zoneId && placement.id === placementId) return false;
      return placement.cellId && occupiedMapCells(placement.cellId).some((cell) => targetCells.includes(cell));
    });
  });
}

function occupiedMapCells(cellId) {
  const match = String(cellId).match(/^r(\d+)-c(\d+)$/);
  if (!match) return [];
  const row = Number(match[1]);
  const column = Number(match[2]);
  const cells = [];
  for (let rowOffset = 0; rowOffset < MAP_GRID.itemSpan; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < MAP_GRID.itemSpan; columnOffset += 1) {
      cells.push(`r${row + rowOffset}-c${column + columnOffset}`);
    }
  }
  return cells;
}

function adjustMapZoom(delta) {
  const current = Number(state.ui.mapZoom || 1);
  state.ui.mapZoom = Math.min(2.2, Math.max(0.7, Math.round((current + delta) * 100) / 100));
  saveAndRender({ remote: false });
}

function createMapZone(form) {
  const formData = new FormData(form);
  const name = getFormValue(formData, "name").trim().toUpperCase();
  if (!name) return;

  const id = uniqueMapZoneId(name);
  const type = getFormValue(formData, "type", "default");
  const now = new Date().toISOString();

  state.customMapZones = Array.isArray(state.customMapZones) ? state.customMapZones : [];
  state.customMapZones.push({
    id,
    name,
    responsable: "Operación",
    type
  });
  state.map[id] = {
    responsable: "Operación",
    status: "LISTO",
    quantity: 1,
    gridPosition: "",
    placements: [
      {
        id: `${id}-1`,
        cellId: ""
      }
    ],
    tasks: "",
    incident: "",
    updatedAt: now
  };
  state.ui.selectedMapZone = id;
  state.ui.selectedMapPlacement = `${id}-1`;
  saveAndRender({ remote: true });
}

function deleteMapZone(zoneId) {
  const zone = getAllMapZones().find((item) => item.id === zoneId);
  if (!zone || !state.map?.[zoneId]) return;

  const remainingZones = getVisibleMapZones().filter((item) => item.id !== zoneId);
  if (!remainingZones.length) {
    alert("Debe quedar al menos un elemento en el mapa.");
    return;
  }

  const confirmed = confirm(`¿Eliminar el elemento ${zone.name}? También se quitarán sus ubicaciones del mapa.`);
  if (!confirmed) return;

  const isDefaultZone = MAP_ZONES.some((item) => item.id === zoneId);
  if (isDefaultZone) {
    state.deletedMapZoneIds = Array.isArray(state.deletedMapZoneIds) ? state.deletedMapZoneIds : [];
    if (!state.deletedMapZoneIds.includes(zoneId)) {
      state.deletedMapZoneIds.push(zoneId);
    }
  } else {
    state.customMapZones = (state.customMapZones || []).filter((item) => item.id !== zoneId);
  }

  delete state.map[zoneId];

  if (state.ui.selectedMapZone === zoneId) {
    state.ui.selectedMapZone = remainingZones[0].id;
  }
  state.ui.selectedMapPlacement = "";
  saveAndRender({ remote: true });
}

function getAllMapZones() {
  return [...MAP_ZONES, ...(state.customMapZones || [])];
}

function getVisibleMapZones() {
  const deletedZoneIds = new Set(state.deletedMapZoneIds || []);
  return getAllMapZones().filter((zone) => !deletedZoneIds.has(zone.id));
}

function uniqueMapZoneId(name) {
  const base = `custom-${slugify(name) || "elemento"}`;
  let candidate = base;
  let index = 2;
  while (state.map?.[candidate]) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toggleRecord(collection, id, field, checked) {
  updateRecord(collection, id, field, checked);
}

function currentTime() {
  return new Date().toTimeString().slice(0, 5);
}

function moveMapViewport(event) {
  if (!mapPan || event.pointerId !== mapPan.pointerId) return false;

  const deltaX = event.clientX - mapPan.startX;
  const deltaY = event.clientY - mapPan.startY;
  const distance = Math.hypot(deltaX, deltaY);
  if (!mapPan.dragging && distance < 6) return true;

  if (!mapPan.dragging) {
    mapPan.dragging = true;
    mapPan.viewport.classList.add("panning");
  }

  event.preventDefault();
  mapPan.viewport.scrollLeft = mapPan.scrollLeft - deltaX;
  mapPan.viewport.scrollTop = mapPan.scrollTop - deltaY;
  state.ui.mapScrollLeft = mapPan.viewport.scrollLeft;
  state.ui.mapScrollTop = mapPan.viewport.scrollTop;
  return true;
}

function finishMapPan(event) {
  if (!mapPan || event.pointerId !== mapPan.pointerId) return;
  const { dragging } = mapPan;
  cleanupMapPan();

  if (dragging) {
    suppressNextClick = true;
    window.setTimeout(() => {
      suppressNextClick = false;
    }, 350);
  }
}

function cancelMapPan(event) {
  if (!mapPan || event.pointerId !== mapPan.pointerId) return;
  cleanupMapPan();
}

function cleanupMapPan() {
  mapPan?.viewport.classList.remove("panning");
  mapPan = null;
}

app.addEventListener("click", (event) => {
  if (suppressNextClick) {
    event.preventDefault();
    event.stopPropagation();
    suppressNextClick = false;
    return;
  }

  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    const bottomNav = viewButton.closest(".bottom-nav");
    if (bottomNav) {
      bottomNavScrollLeft = bottomNav.scrollLeft;
    }
    centerActiveNavOnRender = true;
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
    centerActiveNavOnRender = true;
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
    state.ui.selectedMapPlacement = target.dataset.placementId || "";
    saveAndRender({ remote: false });
  }

  if (action === "place-map-zone") {
    if (state.ui.mapMode !== "pan") {
      openMapCellPicker(target.dataset.cellId);
    }
  }

  if (action === "choose-map-zone-for-cell") {
    placePickedMapZone(id, target.dataset.cellId || state.ui.mapPickerCell);
  }

  if (action === "close-map-cell-picker") {
    closeMapCellPicker();
  }

  if (action === "remove-map-zone") {
    removeMapZone(id, target.dataset.placementId || "");
  }

  if (action === "adjust-map-quantity") {
    adjustMapQuantity(id, Number.parseInt(target.dataset.delta, 10) || 0);
  }

  if (action === "adjust-map-zoom") {
    adjustMapZoom(Number.parseFloat(target.dataset.delta) || 0);
  }

  if (action === "set-map-mode") {
    state.ui.mapMode = target.dataset.mode === "pan" ? "pan" : "place";
    if (state.ui.mapMode === "pan") {
      state.ui.mapPickerCell = "";
    }
    saveAndRender({ remote: false });
  }

  if (action === "delete-map-zone") {
    deleteMapZone(id);
  }

  if (action === "reset-event-data") {
    const confirmed = confirm("¿Reiniciar todos los datos guardados de EXPO 12H en este navegador?");
    if (confirmed) {
      centerActiveNavOnRender = true;
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

app.addEventListener("scroll", (event) => {
  if (event.target instanceof HTMLElement && event.target.classList.contains("bottom-nav")) {
    bottomNavScrollLeft = event.target.scrollLeft;
  }
  if (event.target instanceof HTMLElement && event.target.dataset.mapViewport) {
    state.ui.mapScrollLeft = event.target.scrollLeft;
    state.ui.mapScrollTop = event.target.scrollTop;
  }
}, true);

app.addEventListener("pointerdown", (event) => {
  const viewport = event.target.closest("[data-map-viewport]");
  if (!viewport || event.button !== 0) return;
  if (state.ui.mapMode !== "pan" && event.target.closest("[data-map-cell], .map-placed-zone")) return;

  mapPan = {
    pointerId: event.pointerId,
    viewport,
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: viewport.scrollLeft,
    scrollTop: viewport.scrollTop,
    dragging: false
  };
  viewport.setPointerCapture?.(event.pointerId);
});

app.addEventListener("pointermove", (event) => {
  moveMapViewport(event);
});

app.addEventListener("pointerup", finishMapPan);
app.addEventListener("pointercancel", cancelMapPan);

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
      if (value) {
        startAutoPull();
      }
    }
    saveAndRender({ remote: false });
  }

  if (action === "toggle-sync-enabled") {
    state.sync.enabled = value;
    state.sync.status = value ? "configurado" : "local";
    state.sync.message = value ? "Sincronización activada" : "Sincronización pausada";
    state.sync.lastError = "";
    if (value) {
      startAutoPull();
    }
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
  if (form.dataset.action === "create-map-zone") {
    event.preventDefault();
    createMapZone(form);
    return;
  }

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
  const savedAt = result.savedAt || new Date().toISOString();
  setSyncStatus({
    status: "online",
    message: "Estado enviado a Google Sheets",
    lastPushAt: savedAt,
    lastRemoteSavedAt: savedAt,
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
    adoptRemoteState(response.state, "Estado remoto cargado desde Google Sheets", response.savedAt);
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
    if (response.state && (!hasLocalState || isRemoteSnapshotNewer(response))) {
      adoptRemoteState(response.state, "Estado remoto más reciente cargado", response.savedAt);
    } else {
      queueRemoteSave(state, {
        onSuccess: handleRemoteSaveSuccess,
        onError: handleRemoteError
      });
    }
  } catch (error) {
    handleRemoteError(error);
  } finally {
    startAutoPull();
  }
}

function startAutoPull() {
  if (autoPullTimer) return;
  autoPullTimer = window.setInterval(autoPullState, AUTO_PULL_INTERVAL_MS);
  window.addEventListener("focus", autoPullState);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) autoPullState();
  });
}

async function autoPullState() {
  if (!canSync(state) || autoPullInFlight || document.hidden || isUserEditing()) return;
  if (Date.now() - lastLocalRemoteEditAt < LOCAL_EDIT_GRACE_MS) return;

  autoPullInFlight = true;
  try {
    const response = await pullState(state.sync.webAppUrl);
    if (response.state && isRemoteSnapshotNewer(response)) {
      adoptRemoteState(response.state, "Cambios compartidos cargados automáticamente", response.savedAt);
    }
  } catch (error) {
    setSyncStatus({
      status: "error",
      message: "No se pudo leer el estado compartido",
      lastError: error.message
    }, state.ui.view === "config");
  } finally {
    autoPullInFlight = false;
  }
}

function isRemoteSnapshotNewer(response = {}) {
  const remoteSavedAt = response.savedAt || response.state?.sync?.lastRemoteSavedAt || response.state?.meta?.updatedAt || "";
  const knownRemoteSavedAt = state.sync.lastRemoteSavedAt || "";
  if (remoteSavedAt && knownRemoteSavedAt) {
    return new Date(remoteSavedAt) > new Date(knownRemoteSavedAt);
  }
  return new Date(response.state?.meta?.updatedAt || 0) > new Date(state.meta.updatedAt || 0);
}

function isUserEditing() {
  const active = document.activeElement;
  if (!active) return false;
  return Boolean(active.closest?.("input, textarea, select, [contenteditable='true']"));
}

function adoptRemoteState(remoteState, message, remoteSavedAt = "") {
  const localSync = { ...state.sync };
  const localUi = { ...state.ui };
  state = normalizeState(remoteState);
  state.sync = {
    ...state.sync,
    ...localSync,
    status: "online",
    message,
    lastPullAt: new Date().toISOString(),
    lastRemoteSavedAt: remoteSavedAt || remoteState.sync?.lastRemoteSavedAt || remoteState.meta?.updatedAt || localSync.lastRemoteSavedAt || "",
    lastError: ""
  };
  state.ui = {
    ...state.ui,
    ...localUi
  };
  saveState(state);
  render();
}
