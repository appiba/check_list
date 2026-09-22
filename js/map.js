import { CHECKLIST, MAP_GRID, MAP_ZONES } from "./data.js";
import { badge, escapeHtml, formatDateTime, optionList } from "./utils.js";

export function renderMap(state) {
  const selectedZone = MAP_ZONES.find((zone) => zone.id === state.ui.selectedMapZone) || MAP_ZONES[0];
  const selectedRecord = state.map[selectedZone.id];
  const occupiedCells = getOccupiedCells(state);
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
        ${badge("RENDER 3D PENDIENTE", "info")}
      </div>

      <article class="map-shell map-builder">
        <div class="map-board-panel">
          <div class="panel-header">
            <span class="section-kicker">Cuadrícula operativa</span>
            <span class="map-help">Arrastra con el dedo para mover</span>
          </div>
          <div class="event-map-grid" style="--map-cols: ${MAP_GRID.columns};" aria-label="Cuadrícula editable del evento">
            ${buildMapCells(state, occupiedCells, selectedZone.id)}
          </div>
          <p class="map-instruction">Toca un cuadro vacío para colocar la zona seleccionada. Arrastra una tarjeta para moverla, intercambiarla o sacarla de la lista al mapa.</p>
        </div>

        <div class="map-zone-grid map-zone-list" aria-label="Elementos del mapa">
          <div class="map-list-head">
            <span class="section-kicker">Elementos</span>
            <span>${placedCount(state)} / ${MAP_ZONES.length} ubicados</span>
          </div>
          ${MAP_ZONES.map(
            (zone) => `
              <button class="zone-button map-zone-card ${zone.id === selectedZone.id ? "active" : ""}" type="button" data-action="select-map-zone" data-id="${escapeHtml(zone.id)}" data-map-draggable="true">
                <strong>${escapeHtml(zone.name)}</strong>
                <span>${escapeHtml(zonePositionLabel(state, zone.id))} · x${escapeHtml(zoneQuantity(state, zone.id))}</span>
              </button>
            `
          ).join("")}
        </div>
      </article>

      <article class="panel zone-detail">
        <div class="panel-header">
          <span class="section-kicker">Zona seleccionada</span>
          ${badge(selectedRecord.status, selectedRecord.status)}
        </div>
        <h3>${escapeHtml(selectedZone.name)}</h3>
        <div class="map-detail-actions">
          <span>Ubicación: ${escapeHtml(zonePositionLabel(state, selectedZone.id))} · Cantidad: x${escapeHtml(zoneQuantity(state, selectedZone.id))}</span>
          <button class="mini-action" type="button" data-action="remove-map-zone" data-id="${escapeHtml(selectedZone.id)}">Quitar del mapa</button>
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
          <textarea rows="2" data-action="update-map-field" data-id="${escapeHtml(selectedZone.id)}" data-field="tasks" placeholder="Tareas específicas de la zona">${escapeHtml(selectedRecord.tasks)}</textarea>
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

function buildMapCells(state, occupiedCells, selectedZoneId) {
  const cells = [];
  for (let row = 1; row <= MAP_GRID.rows; row += 1) {
    for (let column = 1; column <= MAP_GRID.columns; column += 1) {
      const cellId = `r${row}-c${column}`;
      const zone = occupiedCells[cellId];
      const record = zone ? state.map[zone.id] : null;
      cells.push(`
        <div class="map-cell ${zone ? "filled" : "empty"} ${zone?.id === selectedZoneId ? "active" : ""}" data-map-cell="${escapeHtml(cellId)}">
          <span class="map-cell-label">${cellLabel(row, column)}</span>
          ${
            zone
              ? `<button class="map-placed-zone" type="button" data-action="select-map-zone" data-id="${escapeHtml(zone.id)}" data-map-draggable="true">
                  <strong>${escapeHtml(compactZoneName(zone.name))}</strong>
                  <span>${escapeHtml(record?.status || "LISTO")} · x${escapeHtml(zoneQuantity(state, zone.id))}</span>
                </button>`
              : `<button class="map-empty-zone" type="button" data-action="place-map-zone" data-cell-id="${escapeHtml(cellId)}">
                  Colocar aquí
                </button>`
          }
        </div>
      `);
    }
  }
  return cells.join("");
}

function getOccupiedCells(state) {
  return Object.fromEntries(
    MAP_ZONES
      .map((zone) => [state.map[zone.id]?.gridPosition, zone])
      .filter(([cellId]) => Boolean(cellId))
  );
}

function placedCount(state) {
  return MAP_ZONES.filter((zone) => state.map[zone.id]?.gridPosition).length;
}

function zonePositionLabel(state, zoneId) {
  const position = state.map[zoneId]?.gridPosition;
  if (!position) return "Sin ubicar";
  const match = position.match(/^r(\d+)-c(\d+)$/);
  if (!match) return position;
  return `Cuadro ${cellLabel(Number(match[1]), Number(match[2]))}`;
}

function zoneQuantity(state, zoneId) {
  const value = Number(state.map[zoneId]?.quantity ?? 1);
  return String(Number.isFinite(value) && value >= 0 ? value : 1);
}

function cellLabel(row, column) {
  return `${String.fromCharCode(64 + row)}${column}`;
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
