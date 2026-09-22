import { CHECKLIST, MAP_ZONES } from "./data.js";
import { badge, escapeHtml, formatDateTime, optionList } from "./utils.js";

export function renderMap(state) {
  const selectedZone = MAP_ZONES.find((zone) => zone.id === state.ui.selectedMapZone) || MAP_ZONES[0];
  const selectedRecord = state.map[selectedZone.id];
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

      <article class="map-shell">
        <div class="render-placeholder">
          <span class="section-kicker">ESPACIO PARA RENDER 3D OFICIAL</span>
          <div class="track-map" aria-hidden="true">
            <span class="map-node node-stage">TARIMA</span>
            <span class="map-node node-a">A</span>
            <span class="map-node node-b">B</span>
            <span class="map-node node-grid">PRE-GRID</span>
            <span class="map-node node-fest">ZONA FEST</span>
          </div>
        </div>

        <div class="map-zone-grid">
          ${MAP_ZONES.map(
            (zone) => `
              <button class="zone-button ${zone.id === selectedZone.id ? "active" : ""}" type="button" data-action="select-map-zone" data-id="${escapeHtml(zone.id)}">
                <strong>${escapeHtml(zone.name)}</strong>
                <span>${escapeHtml(state.map[zone.id]?.status || "LISTO")}</span>
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
