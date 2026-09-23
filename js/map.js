import { CHECKLIST, MAP_GRID, MAP_ZONES } from "./data.js";
import { badge, escapeHtml, formatDateTime, optionList } from "./utils.js";

const ZONE_TYPES = {
  "parqueadero-a": { className: "vehicle", symbol: "P", label: "Parqueadero" },
  "parqueadero-b": { className: "vehicle", symbol: "P", label: "Parqueadero" },
  tarima: { className: "stage", symbol: "T", label: "Tarima" },
  "zona-fest": { className: "fest", symbol: "ZF", label: "Zona Fest" },
  "carril-vip": { className: "vip", symbol: "VIP", label: "VIP" },
  "carpas-publico": { className: "tent", symbol: "C", label: "Carpas" },
  "pre-grid": { className: "grid", symbol: "G", label: "Pre-grid" },
  "ingreso-vehiculos": { className: "access", symbol: "IN", label: "Ingreso" },
  "salida-vehiculos": { className: "access", symbol: "OUT", label: "Salida" },
  "punto-policia": { className: "police", symbol: "POL", label: "Policia" },
  "seguridad-a": { className: "security", symbol: "S", label: "Seguridad" },
  "seguridad-b": { className: "security", symbol: "S", label: "Seguridad" }
};

const CUSTOM_ZONE_TYPES = {
  security: { className: "security", symbol: "S", label: "Seguridad" },
  tent: { className: "tent", symbol: "C", label: "Carpas" },
  stage: { className: "stage", symbol: "T", label: "Tarima" },
  vehicle: { className: "vehicle", symbol: "P", label: "Vehículos" },
  fest: { className: "fest", symbol: "ZF", label: "Zona" },
  police: { className: "police", symbol: "POL", label: "Policía" },
  default: { className: "default", symbol: "E", label: "Elemento" }
};

export function renderMap(state) {
  const mapZones = getMapZones(state);
  const selectedZone = mapZones.find((zone) => zone.id === state.ui.selectedMapZone) || mapZones[0];
  const selectedRecord = state.map[selectedZone.id];
  const placements = getAllPlacements(state);
  const selectedPlacements = getZonePlacements(state, selectedZone.id);
  const placedSelected = selectedPlacements.filter((placement) => placement.cellId).length;
  const selectedPlacementId = state.ui.selectedMapPlacement || "";
  const selectedPlacement = selectedPlacements.find((placement) => placement.id === selectedPlacementId && placement.cellId);
  const selectedPlacedLabel = selectedPlacement?.cellId;
  const mapMode = state.ui.mapMode === "pan" ? "pan" : "place";
  const pickerCell = mapMode === "place" ? state.ui.mapPickerCell || "" : "";
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
              <p class="map-help">Toca un elemento puesto y luego un cuadro vecino para moverlo. Cambia a mover mapa para panear con el dedo.</p>
            </div>
            <div class="map-toolbar">
              <div class="map-mode-controls" aria-label="Modo del mapa">
                <button class="${mapMode === "place" ? "active" : ""}" type="button" data-action="set-map-mode" data-mode="place">Colocar</button>
                <button class="${mapMode === "pan" ? "active" : ""}" type="button" data-action="set-map-mode" data-mode="pan">Mover mapa</button>
              </div>
              <div class="map-zoom-controls" aria-label="Zoom del mapa">
                <button type="button" data-action="adjust-map-zoom" data-delta="-0.15">-</button>
                <span>${Math.round(mapZoom * 100)}%</span>
                <button type="button" data-action="adjust-map-zoom" data-delta="0.15">+</button>
              </div>
            </div>
          </div>
          <div class="map-viewport" data-map-viewport="true" data-map-mode="${mapMode}" aria-label="Vista desplazable del mapa">
            <div class="event-map-grid" style="--map-cols: ${MAP_GRID.columns}; --map-rows: ${MAP_GRID.rows}; --map-zoom: ${mapZoom};" aria-label="Cuadrícula editable del evento">
              ${buildMapAxes()}
              ${buildMapCells(selectedPlacedLabel)}
              ${placements.map((placement) => buildPlacedItem(state, placement, selectedZone.id, selectedPlacementId)).join("")}
            </div>
          </div>
          <p class="map-instruction">Modo colocar: toca un cuadro vacío para elegir elemento. Si hay uno seleccionado, toca un cuadro vecino marcado para moverlo.</p>
        </div>

        <div class="map-zone-grid map-zone-list" aria-label="Elementos del mapa">
          <div class="map-list-head">
            <span class="section-kicker">Elementos</span>
            <span>${placedCount(state)} colocados</span>
          </div>
          <form class="map-create-form" data-action="create-map-zone">
            <span class="section-kicker">Crear elemento</span>
            <input type="text" name="name" placeholder="Nombre del elemento" maxlength="32" required>
            <select name="type" aria-label="Tipo de elemento">
              <option value="default">Elemento</option>
              <option value="security">Seguridad</option>
              <option value="tent">Carpa</option>
              <option value="stage">Tarima</option>
              <option value="vehicle">Vehículos</option>
              <option value="fest">Zona</option>
              <option value="police">Policía</option>
            </select>
            <input type="text" name="symbol" placeholder="Iniciales" maxlength="4" aria-label="Iniciales del elemento">
            <input class="map-color-input" type="color" name="color" value="#f2c94c" aria-label="Color del elemento">
            <button type="submit">Crear</button>
            <button class="map-delete-selected-btn" type="button" data-action="delete-map-zone" data-id="${escapeHtml(selectedZone.id)}">Eliminar seleccionado</button>
          </form>
          ${mapZones.map((zone) => buildZoneCard(state, zone, selectedZone.id, selectedPlacementId)).join("")}
        </div>
      </article>

      <article class="panel zone-detail">
        <div class="panel-header">
          <span class="section-kicker">Elemento seleccionado</span>
          ${badge(selectedRecord.status, selectedRecord.status)}
        </div>
        <h3>${escapeHtml(selectedZone.name)}</h3>
        <div class="map-detail-actions">
          <span>${escapeHtml(zoneType(selectedZone).label)} · ${placedSelected}/${selectedPlacements.length} colocados${selectedPlacedLabel ? ` · seleccionado ${escapeHtml(cellLabelFromId(selectedPlacedLabel))}` : ""}</span>
          <button class="mini-action" type="button" data-action="remove-map-zone" data-id="${escapeHtml(selectedZone.id)}" data-placement-id="${escapeHtml(selectedPlacementId)}">Quitar seleccionado del mapa</button>
          <button class="mini-action danger" type="button" data-action="delete-map-zone" data-id="${escapeHtml(selectedZone.id)}">Eliminar elemento</button>
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

      ${pickerCell ? buildCellPicker(state, mapZones, pickerCell, selectedZone.id, selectedPlacementId) : ""}
    </section>
  `;
}

function buildMapAxes() {
  const axes = ['<span class="map-axis map-axis-corner" aria-hidden="true"></span>'];
  for (let column = 1; column <= MAP_GRID.columns; column += 1) {
    axes.push(`<span class="map-axis map-axis-column" style="grid-column: ${column + 1}; grid-row: 1;">${column}</span>`);
  }
  for (let row = 1; row <= MAP_GRID.rows; row += 1) {
    axes.push(`<span class="map-axis map-axis-row" style="grid-column: 1; grid-row: ${row + 1};">${rowLetter(row)}</span>`);
  }
  return axes.join("");
}

function buildMapCells(selectedCellId = "") {
  const cells = [];
  for (let row = 1; row <= MAP_GRID.rows; row += 1) {
    for (let column = 1; column <= MAP_GRID.columns; column += 1) {
      const cellId = `r${row}-c${column}`;
      const isMoveTarget = isAdjacentCellId(selectedCellId, cellId);
      cells.push(`
        <button class="map-cell ${isMoveTarget ? "move-target" : ""}" type="button" data-action="place-map-zone" data-cell-id="${escapeHtml(cellId)}" data-map-cell="${escapeHtml(cellId)}" style="grid-column: ${column + 1}; grid-row: ${row + 1};" aria-label="${isMoveTarget ? `Mover seleccionado a ${cellLabel(row, column)}` : cellLabel(row, column)}">
          <span class="map-cell-label">${cellLabel(row, column)}</span>
        </button>
      `);
    }
  }
  return cells.join("");
}

function buildPlacedItem(state, placement, selectedZoneId, selectedPlacementId) {
  const zone = getMapZones(state).find((item) => item.id === placement.zoneId);
  if (!zone || !placement.cellId) return "";
  const record = state.map[zone.id];
  const type = zoneType(zone);
  const position = parseCell(placement.cellId);
  const isActive = placement.id === selectedPlacementId || (!selectedPlacementId && zone.id === selectedZoneId);
  return `
    <button
      class="map-placed-zone type-${type.className} ${isActive ? "active" : ""}"
      type="button"
      aria-label="${escapeHtml(zone.name)} ${escapeHtml(record?.status || "LISTO")}"
      title="${escapeHtml(zone.name)} · ${escapeHtml(record?.status || "LISTO")}"
      data-action="select-map-zone"
      data-id="${escapeHtml(zone.id)}"
      data-placement-id="${escapeHtml(placement.id)}"
      style="${zoneColorStyle(type)} grid-column: ${position.column + 1} / span ${MAP_GRID.itemSpan}; grid-row: ${position.row + 1} / span ${MAP_GRID.itemSpan};"
    >
      <span class="map-symbol">${escapeHtml(type.symbol)}</span>
      <strong>${escapeHtml(compactZoneName(zone.name))}</strong>
      <span>${escapeHtml(record?.status || "LISTO")}</span>
    </button>
  `;
}

function buildZoneCard(state, zone, selectedZoneId, selectedPlacementId) {
  const type = zoneType(zone);
  const placements = getZonePlacements(state, zone.id);
  const placed = placements.filter((placement) => placement.cellId).length;
  const selectedPlacementAttr = zone.id === selectedZoneId && selectedPlacementId ? ` data-placement-id="${escapeHtml(selectedPlacementId)}"` : "";
  return `
    <div class="zone-button map-zone-card type-${type.className} ${zone.id === selectedZoneId ? "active" : ""}" style="${zoneColorStyle(type)}">
      <button class="map-zone-main" type="button" data-action="select-map-zone" data-id="${escapeHtml(zone.id)}">
        <span class="map-symbol">${escapeHtml(type.symbol)}</span>
        <span>
          <strong>${escapeHtml(zone.name)}</strong>
          <em>${placed}/${placements.length} colocados</em>
        </span>
      </button>
      <button class="map-remove-btn" type="button" data-action="remove-map-zone" data-id="${escapeHtml(zone.id)}"${selectedPlacementAttr} aria-label="Quitar ${escapeHtml(zone.name)} del mapa">-</button>
      <button class="map-add-btn" type="button" data-action="adjust-map-quantity" data-id="${escapeHtml(zone.id)}" data-delta="1" aria-label="Agregar ${escapeHtml(zone.name)}">+</button>
    </div>
  `;
}

function buildCellPicker(state, mapZones, cellId, selectedZoneId, selectedPlacementId) {
  const cellLabelText = cellLabelFromId(cellId);
  return `
    <div class="map-picker-layer" role="presentation">
      <button class="map-picker-scrim" type="button" data-action="close-map-cell-picker" aria-label="Cerrar selector"></button>
      <section class="map-cell-picker" role="dialog" aria-modal="true" aria-labelledby="map-picker-title">
        <div class="map-picker-header">
          <div>
            <span class="section-kicker">Colocar en cuadro</span>
            <h3 id="map-picker-title">${escapeHtml(cellLabelText)}</h3>
          </div>
          <button class="mini-action" type="button" data-action="close-map-cell-picker">Cerrar</button>
        </div>
        <div class="map-picker-grid">
          ${mapZones.map((zone) => buildPickerOption(state, zone, cellId, selectedZoneId, selectedPlacementId)).join("")}
        </div>
      </section>
    </div>
  `;
}

function buildPickerOption(state, zone, cellId, selectedZoneId, selectedPlacementId) {
  const type = zoneType(zone);
  const placements = getZonePlacements(state, zone.id);
  const placed = placements.filter((placement) => placement.cellId).length;
  const willMoveSelected = zone.id === selectedZoneId && placements.some((placement) => placement.id === selectedPlacementId && placement.cellId);
  const actionLabel = willMoveSelected ? "Mover seleccionado aquí" : placements.some((placement) => !placement.cellId) ? "Colocar aquí" : "Agregar y colocar";

  return `
    <button
      class="map-picker-option type-${type.className} ${zone.id === selectedZoneId ? "active" : ""}"
      type="button"
      data-action="choose-map-zone-for-cell"
      data-id="${escapeHtml(zone.id)}"
      data-cell-id="${escapeHtml(cellId)}"
      style="${zoneColorStyle(type)}"
    >
      <span class="map-symbol">${escapeHtml(type.symbol)}</span>
      <span>
        <strong>${escapeHtml(zone.name)}</strong>
        <em>${placed}/${placements.length} colocados</em>
      </span>
      <small>${escapeHtml(actionLabel)}</small>
    </button>
  `;
}

function getAllPlacements(state) {
  return getMapZones(state).flatMap((zone) =>
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

function getMapZones(state) {
  const deletedZoneIds = new Set(state.deletedMapZoneIds || []);
  return [...MAP_ZONES, ...(state.customMapZones || [])].filter((zone) => !deletedZoneIds.has(zone.id));
}

function zoneType(zone) {
  if (zone.type) {
    const baseType = CUSTOM_ZONE_TYPES[zone.type] || CUSTOM_ZONE_TYPES.default;
    return {
      ...baseType,
      symbol: normalizeZoneSymbol(zone.symbol, zone.name, baseType.symbol),
      color: normalizeZoneColor(zone.color, baseType.color)
    };
  }
  return ZONE_TYPES[zone.id] || CUSTOM_ZONE_TYPES.default;
}

function zoneColorStyle(type) {
  return type.color ? `--zone-color: ${escapeHtml(type.color)};` : "";
}

function normalizeZoneSymbol(value, fallbackName, fallbackSymbol = "E") {
  const cleaned = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
  return cleaned || initialsFromName(fallbackName) || fallbackSymbol;
}

function initialsFromName(name) {
  const words = String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .match(/[A-Z0-9]+/g);
  if (!words?.length) return "";
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .slice(0, 4);
}

function normalizeZoneColor(value, fallbackColor = "") {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallbackColor;
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
  return `${rowLetter(row)}${column}`;
}

function cellLabelFromId(cellId) {
  const position = parseCell(cellId);
  return cellLabel(position.row, position.column);
}

function isAdjacentCellId(sourceCellId, targetCellId) {
  if (!sourceCellId || !targetCellId) return false;
  const source = parseCell(sourceCellId);
  const target = parseCell(targetCellId);
  return Math.abs(source.row - target.row) + Math.abs(source.column - target.column) === 1;
}

function rowLetter(row) {
  const letterIndex = (row - 1) % 26;
  return String.fromCharCode(65 + letterIndex);
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
