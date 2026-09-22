import { CHECKLIST, MAP_GRID, MAP_ZONES } from "./data.js";
import { badge, escapeHtml, formatDateTime, optionList } from "./utils.js";

const ZONE_TYPES = {
  "parqueadero-a": { className: "vehicle", symbol: "P", label: "Parqueadero" },
  "parqueadero-b": { className: "vehicle", symbol: "P", label: "Parqueadero" },
  tarima: { className: "stage", symbol: "T", label: "Tarima" },
  "zona-fest-derecha": { className: "fest", symbol: "ZF", label: "Zona Fest" },
  "zona-fest-izquierda": { className: "fest", symbol: "ZF", label: "Zona Fest" },
  "carril-vip": { className: "vip", symbol: "VIP", label: "VIP" },
  "carpas-publico": { className: "tent", symbol: "C", label: "Carpas" },
  "pre-grid": { className: "grid", symbol: "G", label: "Pre-grid" },
  "ingreso-vehiculos": { className: "access", symbol: "IN", label: "Ingreso" },
  "salida-vehiculos": { className: "access", symbol: "OUT", label: "Salida" },
  "punto-policia": { className: "police", symbol: "POL", label: "Policia" },
  "seguridad-a": { className: "security", symbol: "S", label: "Seguridad" },
  "seguridad-b": { className: "security", symbol: "S", label: "Seguridad" }
};

export function renderMap(state) {
  const selectedZone = MAP_ZONES.find((zone) => zone.id === state.ui.selectedMapZone) || MAP_ZONES[0];
  const selectedRecord = state.map[selectedZone.id];
  const placements = getAllPlacements(state);
  const selectedPlacements = getZonePlacements(state, selectedZone.id);
  const placedSelected = selectedPlacements.filter((placement) => placement.cellId).length;
  const mapZoom = Number(state.ui.mapZoom || 1);
  const relatedTasks = getRelatedTasks(selectedZone.name);
  const relatedIncidents = state.incidents.filter((incident) => {
    const name = selectedZone.name.toLowerCase();
    return incident.area.toLowerCase().includes(name.split(" ")[0]) || name.includes(incident.area.toLowerCase());
  });

  return `
    <section class="screen" aria-labelledby="map-title">
      <div class="screen-heading">
        <div>
          <p class="eyebrow">Mapa / render del evento</p>
          <h2 id="map-title">MAPA OPERATIVO</h2>
        </div>
        ${badge(`${placedCount(state)} elementos`, "info")}
      </div>

      <article class="map-shell map-builder">
        <div class="map-board-panel">
          <div class="panel-header map-board-header">
            <div>
              <span class="section-kicker">Cuadrícula operativa</span>
              <p class="map-help">Cada elemento ocupa 4 cuadros. Arrastra con el dedo para mover.</p>
            </div>
            <div class="map-zoom-controls" aria-label="Zoom del mapa">
              <button type="button" data-action="adjust-map-zoom" data-delta="-0.15">-</button>
              <span>${Math.round(mapZoom * 100)}%</span>
              <button type="button" data-action="adjust-map-zoom" data-delta="0.15">+</button>
            </div>
          </div>
          <div class="event-map-grid" style="--map-cols: ${MAP_GRID.columns}; --map-rows: ${MAP_GRID.rows}; --map-zoom: ${mapZoom};" aria-label="Cuadrícula editable del evento">
            ${buildMapCells()}
            ${placements.map((placement) => buildPlacedItem(state, placement, selectedZone.id)).join("")}
          </div>
          <p class="map-instruction">Toca un cuadro vacío para colocar el elemento seleccionado. Usa + para crear más elementos y luego colócalos en el mapa.</p>
        </div>

        <div class="map-zone-grid map-zone-list" aria-label="Elementos del mapa">
          <div class="map-list-head">
            <span class="section-kicker">Elementos</span>
            <span>${placedCount(state)} colocados</span>
          </div>
          ${MAP_ZONES.map((zone) => buildZoneCard(state, zone, selectedZone.id)).join("")}
        </div>
      </article>

      <article class="panel zone-detail">
        <div class="panel-header">
          <span class="section-kicker">Elemento seleccionado</span>
          ${badge(selectedRecord.status, selectedRecord.status)}
        </div>
        <h3>${escapeHtml(selectedZone.name)}</h3>
        <div class="map-detail-actions">
          <span>${escapeHtml(zoneType(selectedZone.id).label)} · ${placedSelected}/${selectedPlacements.length} colocados</span>
          <button class="mini-action" type="button" data-action="remove-map-zone" data-id="${escapeHtml(selectedZone.id)}">Quitar último del mapa</button>
        </div>
        <div class="task-fields compact-fields">
          <label>
            Responsable
            <input type="text" value="${escapeHtml(selectedRecord.responsable)}" data-action="update-map-field" data-id="${escapeHtml(selectedZone.id)}" data-field="responsable">
          </label>
          <label>
            Estado
            <select data-action="update-map-field" data-id="${escapeHtml(selectedZone.id)}" data-field="status">
              ${optionList(["LISTO", "EN MONTAJE", "OBSERVAR", "BLOQUEADO"], selectedRecord.status)}
            </select>
          </label>
          <label>
            Cantidad
            <div class="quantity-control">
              <button type="button" data-action="adjust-map-quantity" data-id="${escapeHtml(selectedZone.id)}" data-delta="-1">-</button>
              <input type="number" min="0" step="1" value="${escapeHtml(zoneQuantity(state, selectedZone.id))}" data-action="update-map-field" data-id="${escapeHtml(selectedZone.id)}" data-field="quantity">
              <button type="button" data-action="adjust-map-quantity" data-id="${escapeHtml(selectedZone.id)}" data-delta="1">+</button>
            </div>
          </label>
        </div>
        <label class="wide-field">
          Tareas
          <textarea rows="2" data-action="update-map-field" data-id="${escapeHtml(selectedZone.id)}" data-field="tasks" placeholder="Tareas específicas del elemento">${escapeHtml(selectedRecord.tasks)}</textarea>
        </label>
        <label class="wide-field">
          Incidencias
          <textarea rows="2" data-action="update-map-field" data-id="${escapeHtml(selectedZone.id)}" data-field="incident" placeholder="Novedades o restricciones">${escapeHtml(selectedRecord.incident)}</textarea>
        </label>
        <div class="zone-related">
          <div>
            <span class="section-kicker">Tareas relacionadas</span>
            ${
              relatedTasks.length
                ? `<ul>${relatedTasks.slice(0, 5).map((task) => `<li>${escapeHtml(task.title)}</li>`).join("")}</ul>`
                : `<p class="muted">Sin tareas enlazadas automáticamente.</p>`
            }
          </div>
          <div>
            <span class="section-kicker">Incidencias relacionadas</span>
            ${
              relatedIncidents.length
                ? `<ul>${relatedIncidents.map((incident) => `<li>${escapeHtml(incident.descripcion)}</li>`).join("")}</ul>`
                : `<p class="muted">Sin incidencias relacionadas.</p>`
            }
          </div>
        </div>
        <footer class="card-footer">
          <span>Última actualización: ${formatDateTime(selectedRecord.updatedAt)}</span>
        </footer>
      </article>
    </section>
  `;
}

function buildMapCells() {
  const cells = [];
  for (let row = 1; row <= MAP_GRID.rows; row += 1) {
    for (let column = 1; column <= MAP_GRID.columns; column += 1) {
      const cellId = `r${row}-c${column}`;
      cells.push(`
        <button class="map-cell" type="button" data-action="place-map-zone" data-cell-id="${escapeHtml(cellId)}" data-map-cell="${escapeHtml(cellId)}">
          <span class="map-cell-label">${cellLabel(row, column)}</span>
        </button>
      `);
    }
  }
  return cells.join("");
}

function buildPlacedItem(state, placement, selectedZoneId) {
  const zone = MAP_ZONES.find((item) => item.id === placement.zoneId);
  if (!zone || !placement.cellId) return "";
  const record = state.map[zone.id];
  const type = zoneType(zone.id);
  const position = parseCell(placement.cellId);
  return `
    <button
      class="map-placed-zone type-${type.className} ${zone.id === selectedZoneId ? "active" : ""}"
      type="button"
      data-action="select-map-zone"
      data-id="${escapeHtml(zone.id)}"
      data-placement-id="${escapeHtml(placement.id)}"
      data-map-draggable="true"
      style="grid-column: ${position.column} / span ${MAP_GRID.itemSpan}; grid-row: ${position.row} / span ${MAP_GRID.itemSpan};"
    >
      <span class="map-symbol">${escapeHtml(type.symbol)}</span>
      <strong>${escapeHtml(compactZoneName(zone.name))}</strong>
      <span>${escapeHtml(record?.status || "LISTO")}</span>
    </button>
  `;
}

function buildZoneCard(state, zone, selectedZoneId) {
  const type = zoneType(zone.id);
  const placements = getZonePlacements(state, zone.id);
  const placed = placements.filter((placement) => placement.cellId).length;
  return `
    <div class="zone-button map-zone-card type-${type.className} ${zone.id === selectedZoneId ? "active" : ""}">
      <button class="map-zone-main" type="button" data-action="select-map-zone" data-id="${escapeHtml(zone.id)}" data-map-draggable="true">
        <span class="map-symbol">${escapeHtml(type.symbol)}</span>
        <span>
          <strong>${escapeHtml(zone.name)}</strong>
          <em>${placed}/${placements.length} colocados</em>
        </span>
      </button>
      <button class="map-add-btn" type="button" data-action="adjust-map-quantity" data-id="${escapeHtml(zone.id)}" data-delta="1" aria-label="Agregar ${escapeHtml(zone.name)}">+</button>
    </div>
  `;
}

function getAllPlacements(state) {
  return MAP_ZONES.flatMap((zone) =>
    getZonePlacements(state, zone.id).map((placement) => ({
      ...placement,
      zoneId: zone.id
    }))
  );
}

function getZonePlacements(state, zoneId) {
  const record = state.map[zoneId] || {};
  if (Array.isArray(record.placements)) {
    return record.placements;
  }
  if (record.gridPosition) {
    return [{ id: `${zoneId}-1`, cellId: record.gridPosition }];
  }
  return [];
}

function placedCount(state) {
  return getAllPlacements(state).filter((placement) => placement.cellId).length;
}

function zoneQuantity(state, zoneId) {
  return String(getZonePlacements(state, zoneId).length);
}

function zoneType(zoneId) {
  return ZONE_TYPES[zoneId] || { className: "default", symbol: "Z", label: "Zona" };
}

function parseCell(cellId) {
  const match = String(cellId || "").match(/^r(\d+)-c(\d+)$/);
  if (!match) return { row: 1, column: 1 };
  return {
    row: Number(match[1]),
    column: Number(match[2])
  };
}

function cellLabel(row, column) {
  const letterIndex = (row - 1) % 26;
  return `${String.fromCharCode(65 + letterIndex)}${column}`;
}

function compactZoneName(name) {
  return name
    .replace("PARQUEADERO", "P.")
    .replace("VEHÍCULOS", "VEH.")
    .replace("SEGURIDAD", "SEG.")
    .replace("ZONA FEST", "Z. FEST")
    .replace("PÚBLICO", "PÚB.");
}

function getRelatedTasks(zoneName) {
  const lowered = zoneName.toLowerCase();
  if (lowered.includes("seguridad")) return CHECKLIST.filter((task) => task.area === "Seguridad");
  if (lowered.includes("zona fest")) return CHECKLIST.filter((task) => task.area === "Zona Fest");
  if (lowered.includes("tarima")) return CHECKLIST.filter((task) => ["Show", "Producción Técnica"].includes(task.area));
  if (lowered.includes("parqueadero") || lowered.includes("pre-grid") || lowered.includes("vehículos")) {
    return CHECKLIST.filter((task) => task.area === "Vehículos");
  }
  if (lowered.includes("carpas") || lowered.includes("carril")) return CHECKLIST.filter((task) => task.area === "Montaje");
  return [];
}
