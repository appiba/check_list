import { CHECKLIST_AREAS, STATUS } from "./data.js?v=20260924-map-v2";
import { badge, escapeHtml, formatDateTime, optionList } from "./utils.js?v=20260924-map-v2";
import { getIncidentSummary } from "./metrics.js?v=20260924-map-v2";

export function renderIncidents(state) {
  const summary = getIncidentSummary(state);

  return `
    <section class="screen" aria-labelledby="incidents-title">
      <div class="screen-heading">
        <div>
          <p class="eyebrow">Novedades críticas</p>
          <h2 id="incidents-title">INCIDENCIAS</h2>
        </div>
        <div class="screen-stat">
          <strong>${summary.open}</strong>
          <span>abiertas</span>
        </div>
      </div>

      <button class="report-button" type="button" data-action="toggle-incident-form">+ REPORTAR NOVEDAD</button>

      ${state.ui.incidentFormOpen ? renderIncidentForm() : ""}

      <div class="incident-list">
        ${
          state.incidents.length
            ? state.incidents.map((incident) => renderIncidentCard(incident)).join("")
            : `<p class="empty-state">Sin incidencias registradas.</p>`
        }
      </div>
    </section>
  `;
}

function renderIncidentForm() {
  return `
    <form class="panel incident-form" data-action="create-incident">
      <div class="filter-grid">
        <label>
          Hora
          <input name="hora" type="time" required>
        </label>
        <label>
          Área
          <select name="area" required>
            ${optionList(CHECKLIST_AREAS, "Operación")}
          </select>
        </label>
        <label>
          Responsable
          <input name="responsable" type="text" placeholder="Responsable de atención" required>
        </label>
        <label>
          Prioridad
          <select name="prioridad" required>
            ${optionList(STATUS.incidentPriority, "MEDIA")}
          </select>
        </label>
        <label>
          Estado
          <select name="estado" required>
            ${optionList(STATUS.incidentState, "ABIERTA")}
          </select>
        </label>
        <label>
          Foto / evidencia
          <input name="evidencia" type="text" placeholder="Link, nombre de archivo o nota">
        </label>
      </div>
      <label class="wide-field">
        Descripción
        <textarea name="descripcion" rows="3" placeholder="Describe la novedad operativa" required></textarea>
      </label>
      <div class="form-actions">
        <button class="primary-action" type="submit">Guardar incidencia</button>
        <button class="ghost-action" type="button" data-action="toggle-incident-form">Cancelar</button>
      </div>
    </form>
  `;
}

function renderIncidentCard(incident) {
  return `
    <article class="incident-card priority-${incident.prioridad.toLowerCase()}">
      <div class="incident-card-head">
        <div>
          <span class="section-kicker">${escapeHtml(incident.hora)} · ${escapeHtml(incident.area)}</span>
          <h3>${escapeHtml(incident.descripcion)}</h3>
        </div>
        ${badge(incident.prioridad, incident.prioridad)}
      </div>
      <p class="muted">Responsable: ${escapeHtml(incident.responsable || "Sin asignar")}</p>
      ${incident.evidencia ? `<p class="muted">Evidencia: ${escapeHtml(incident.evidencia)}</p>` : ""}
      <div class="task-fields compact-fields">
        <label>
          Estado
          <select data-action="update-incident-field" data-id="${escapeHtml(incident.id)}" data-field="estado">
            ${optionList(STATUS.incidentState, incident.estado)}
          </select>
        </label>
        <label>
          Prioridad
          <select data-action="update-incident-field" data-id="${escapeHtml(incident.id)}" data-field="prioridad">
            ${optionList(STATUS.incidentPriority, incident.prioridad)}
          </select>
        </label>
        <label>
          Hora resolución
          <input type="time" value="${escapeHtml(incident.horaResolucion || "")}" data-action="update-incident-field" data-id="${escapeHtml(incident.id)}" data-field="horaResolucion">
        </label>
      </div>
      <footer class="card-footer">
        <span>Estado: ${escapeHtml(incident.estado)}</span>
        <span>Actualizado: ${formatDateTime(incident.updatedAt)}</span>
      </footer>
    </article>
  `;
}
