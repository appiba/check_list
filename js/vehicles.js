import { PARKING_SPOTS, VEHICLE_CATEGORIES, VEHICLES } from "./data.js";
import { badge, escapeHtml, formatDateTime, normalize, optionList, percent, progressBar } from "./utils.js";
import { getVehicleSummary } from "./metrics.js";

const VEHICLE_STEPS = [
  ["llego", "LLEGÓ"],
  ["revision", "REVISIÓN"],
  ["preGrid", "PRE-GRID"],
  ["presentado", "SHOW"],
  ["listoCaravana", "CARAVANA"]
];

export function renderVehicles(state) {
  const summary = getVehicleSummary(state);
  const query = normalize(state.ui.vehicleSearch);
  const category = state.ui.vehicleCategory;
  const vehicles = VEHICLES.filter((vehicle) => {
    const record = state.vehicles[vehicle.id] || {};
    const haystack = normalize(
      `${vehicle.numeroAuto} ${vehicle.pilotoPrincipal} ${vehicle.categoria} ${vehicle.marca} ${vehicle.modelo} ${vehicle.ciudad} ${vehicle.parkingSpot} ${record.puesto} ${record.parqueadero}`
    );
    return (!query || haystack.includes(query)) && (category === "todas" || vehicle.categoria === category);
  }).sort(compareVehiclesByParking);

  return `
    <section class="screen" aria-labelledby="vehicles-title">
      <div class="screen-heading">
        <div>
          <p class="eyebrow">58 vehículos inscritos</p>
          <h2 id="vehicles-title">VEHÍCULOS INSCRITOS</h2>
        </div>
        <div class="screen-stat">
          <strong>${summary.arrived}/${summary.total}</strong>
          <span>llegaron · ${summary.percent}% operativo</span>
        </div>
      </div>

      <article class="panel controls-panel">
        ${progressBar(summary.percent, "Avance operativo de vehículos")}
        <div class="filter-grid">
          <label>
            Buscar
            <input type="search" value="${escapeHtml(state.ui.vehicleSearch)}" data-action="set-ui-field" data-field="vehicleSearch" placeholder="Número, piloto, categoría, marca o ciudad">
          </label>
          <label>
            Categoría
            <select data-action="set-ui-field" data-field="vehicleCategory">
              <option value="todas">Todas las categorías</option>
              ${optionList(VEHICLE_CATEGORIES, category)}
            </select>
          </label>
        </div>
      </article>

      <div class="vehicle-grid">
        ${vehicles.map((vehicle) => renderVehicleCard(vehicle, state.vehicles[vehicle.id] || {})).join("")}
      </div>
    </section>
  `;
}

function compareVehiclesByParking(a, b) {
  return parkingSortValue(a) - parkingSortValue(b);
}

function parkingSortValue(vehicle) {
  const spot = vehicle.parkingSpot || "";
  const group = spot[0] === "A" ? 0 : spot[0] === "B" ? 1 : 2;
  const number = Number.parseInt(spot.slice(1), 10) || 999;
  return group * 100 + number;
}

function renderVehicleCard(vehicle, record) {
  const hasParking = Boolean(record.parqueadero && record.parqueadero !== "SIN ASIGNAR");
  const completedSteps = VEHICLE_STEPS.filter(([key]) => record[key]).length + (hasParking ? 1 : 0);
  const cardPercent = percent(completedSteps, VEHICLE_STEPS.length + 1);
  const spots = ["", ...PARKING_SPOTS.A, ...PARKING_SPOTS.B];
  const spotLabel = record.puesto || vehicle.parkingSpot || "SIN PUESTO";

  return `
    <article class="vehicle-card">
      <div class="vehicle-header">
        <span class="vehicle-number">#${escapeHtml(vehicle.numeroAuto)}</span>
        <span class="parking-chip">${escapeHtml(spotLabel)}</span>
        ${badge(vehicle.categoria, "info")}
      </div>
      <h3>${escapeHtml(`${vehicle.marca} ${vehicle.modelo}`)}</h3>
      <p class="driver-name">${escapeHtml(vehicle.pilotoPrincipal)}</p>
      <p class="muted">${escapeHtml(vehicle.categoria)} · ${escapeHtml(vehicle.ciudad)}</p>
      ${progressBar(cardPercent, `Avance vehículo ${vehicle.numeroAuto}`)}

      <div class="quick-grid">
        ${VEHICLE_STEPS.map(
          ([key, label]) => `
            <label class="quick-toggle ${record[key] ? "checked" : ""}">
              <input type="checkbox" data-action="toggle-vehicle-field" data-id="${escapeHtml(vehicle.id)}" data-field="${key}" ${record[key] ? "checked" : ""}>
              <span>${label}</span>
            </label>
          `
        ).join("")}
      </div>

      <div class="task-fields compact-fields">
        <label>
          Hora llegada
          <input type="time" value="${escapeHtml(record.horaLlegada)}" data-action="update-vehicle-field" data-id="${escapeHtml(vehicle.id)}" data-field="horaLlegada">
        </label>
        <label>
          Estado revisión
          <select data-action="update-vehicle-field" data-id="${escapeHtml(vehicle.id)}" data-field="estadoRevision">
            ${optionList(["PENDIENTE", "APROBADO", "OBSERVADO", "RECHAZADO"], record.estadoRevision)}
          </select>
        </label>
        <label>
          Parqueadero
          <select data-action="update-vehicle-field" data-id="${escapeHtml(vehicle.id)}" data-field="parqueadero">
            ${optionList(["SIN ASIGNAR", "A", "B"], record.parqueadero)}
          </select>
        </label>
        <label>
          Puesto
          <select data-action="update-vehicle-field" data-id="${escapeHtml(vehicle.id)}" data-field="puesto">
            ${optionList(spots, record.puesto)}
          </select>
        </label>
        <label>
          Hora presentación
          <input type="time" value="${escapeHtml(record.horaPresentacion)}" data-action="update-vehicle-field" data-id="${escapeHtml(vehicle.id)}" data-field="horaPresentacion">
        </label>
      </div>

      <label class="wide-field">
        Observación
        <textarea rows="2" data-action="update-vehicle-field" data-id="${escapeHtml(vehicle.id)}" data-field="observacion" placeholder="Novedad del auto, parqueadero o piloto">${escapeHtml(record.observacion)}</textarea>
      </label>

      <footer class="card-footer">
        <span>Última actualización: ${formatDateTime(record.updatedAt)}</span>
      </footer>
    </article>
  `;
}
