import {
  getActivationSummary,
  getAreaSummaries,
  getChecklistSummary,
  getCurrentTimelineItem,
  getIncidentSummary,
  getOverallProgress,
  getVehicleSummary
} from "./metrics.js";
import { badge, escapeHtml, progressBar } from "./utils.js";

export function renderDashboard(state) {
  const checklist = getChecklistSummary(state);
  const vehicles = getVehicleSummary(state);
  const activations = getActivationSummary(state);
  const incidents = getIncidentSummary(state);
  const overall = getOverallProgress(state);
  const { current, next } = getCurrentTimelineItem(state);
  const areas = getAreaSummaries(state);
  const openIncidents = state.incidents.filter((incident) => incident.estado !== "RESUELTA").slice(0, 4);

  return `
    <section class="screen dashboard-screen" aria-labelledby="dashboard-title">
      <div class="screen-heading">
        <div>
          <p class="eyebrow">Race Control Center</p>
          <h2 id="dashboard-title">Centro de control operativo</h2>
        </div>
        ${badge("OPERATIVO", "online")}
      </div>

      <div class="metrics-grid">
        <article class="metric-card metric-card-main">
          <span class="metric-label">AVANCE GENERAL</span>
          <strong>${overall}%</strong>
          <span>EVENTO LISTO</span>
          ${progressBar(overall, "Avance general del evento")}
        </article>
        <article class="metric-card">
          <span class="metric-label">TAREAS COMPLETADAS</span>
          <strong>${checklist.completed} / ${checklist.total}</strong>
          <span>${checklist.pending} pendientes</span>
        </article>
        <article class="metric-card">
          <span class="metric-label">VEHÍCULOS</span>
          <strong>${vehicles.total}</strong>
          <span>${vehicles.arrived} llegaron · ${vehicles.reviewed} revisados</span>
        </article>
        <article class="metric-card">
          <span class="metric-label">ACTIVACIONES</span>
          <strong>${activations.totalPeople}</strong>
          <span>${activations.completePeople} completas · ${activations.percent}%</span>
        </article>
        <article class="metric-card metric-danger">
          <span class="metric-label">INCIDENCIAS</span>
          <strong>${incidents.open}</strong>
          <span>${incidents.critical} críticas abiertas</span>
        </article>
      </div>

      <div class="dashboard-layout">
        <article class="panel now-panel">
          <div class="panel-header">
            <span class="section-kicker">AHORA</span>
            ${badge(state.timeline[current.id]?.status || "proximo")}
          </div>
          <h3>${escapeHtml(current.title)}</h3>
          <p>${escapeHtml(current.detail)}</p>
          <div class="time-band">
            <span>${escapeHtml(current.start)}</span>
            <span>${escapeHtml(current.end || "")}</span>
          </div>
          ${next ? `<p class="next-line">Siguiente: <strong>${escapeHtml(next.start)} · ${escapeHtml(next.title)}</strong></p>` : ""}
        </article>

        <article class="panel incident-panel">
          <div class="panel-header">
            <span class="section-kicker">INCIDENCIAS ABIERTAS</span>
            <button class="mini-action danger" type="button" data-action="open-incident-form">REPORTAR</button>
          </div>
          ${
            openIncidents.length
              ? `<div class="compact-list">${openIncidents
                  .map(
                    (incident) => `
                    <div class="compact-row">
                      <strong>${escapeHtml(incident.area)}</strong>
                      <span>${escapeHtml(incident.descripcion)}</span>
                      ${badge(incident.prioridad, incident.prioridad)}
                    </div>
                  `
                  )
                  .join("")}</div>`
              : `<p class="empty-state">Sin incidencias abiertas.</p>`
          }
        </article>
      </div>

      <section class="area-grid" aria-label="Avance por área">
        ${areas
          .map(
            (area) => `
            <article class="area-card">
              <div>
                <h3>${escapeHtml(area.area)}</h3>
                <span>${area.completed} completadas · ${area.pending} pendientes</span>
              </div>
              <strong>${area.percent}%</strong>
              ${progressBar(area.percent, `Avance ${area.area}`)}
              ${area.urgent ? `<p class="urgent-note">${area.urgent} tarea(s) urgente/bloqueada</p>` : ""}
            </article>
          `
          )
          .join("")}
      </section>

    </section>
  `;
}
