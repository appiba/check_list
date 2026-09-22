import { CHECKLIST, CHECKLIST_AREAS, STATUS } from "./data.js";
import { badge, escapeHtml, fieldId, formatDateTime, optionList, progressBar } from "./utils.js";
import { getChecklistSummary } from "./metrics.js";

const FILTERS = [
  ["todas", "TODAS"],
  ["pendiente", "PENDIENTES"],
  ["en-proceso", "EN PROCESO"],
  ["completado", "COMPLETADAS"],
  ["urgente", "URGENTES"]
];

export function renderChecklist(state) {
  const summary = getChecklistSummary(state);
  const owners = [...new Set(CHECKLIST.map((task) => task.responsable).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const filtered = CHECKLIST.filter((task) => {
    const record = state.checklist[task.id];
    const statusMatch =
      state.ui.checklistStatus === "todas" ||
      record.status === state.ui.checklistStatus ||
      (state.ui.checklistStatus === "urgente" && ["urgente", "bloqueado"].includes(record.status));
    const areaMatch = state.ui.checklistArea === "todas" || task.area === state.ui.checklistArea;
    const ownerMatch = state.ui.checklistOwner === "todos" || record.responsable === state.ui.checklistOwner;
    return statusMatch && areaMatch && ownerMatch;
  });

  return `
    <section class="screen" aria-labelledby="checklist-title">
      <div class="screen-heading">
        <div>
          <p class="eyebrow">Checklist operativo real</p>
          <h2 id="checklist-title">CHECKLIST OPERATIVO</h2>
        </div>
        <div class="screen-stat">
          <strong>${summary.completed}/${summary.total}</strong>
          <span>${summary.percent}% completado</span>
        </div>
      </div>

      <article class="panel controls-panel">
        ${progressBar(summary.percent, "Avance del checklist operativo")}
        <div class="status-filters" role="group" aria-label="Filtros por estado">
          ${FILTERS.map(
            ([value, label]) => `
              <button class="${state.ui.checklistStatus === value ? "active" : ""}" type="button" data-action="set-checklist-filter" data-filter="checklistStatus" data-value="${value}">
                ${label}
              </button>
            `
          ).join("")}
        </div>
        <div class="filter-grid">
          <label>
            Área
            <select data-action="set-checklist-filter" data-filter="checklistArea">
              <option value="todas">Todas las áreas</option>
              ${optionList(CHECKLIST_AREAS, state.ui.checklistArea)}
            </select>
          </label>
          <label>
            Responsable
            <select data-action="set-checklist-filter" data-filter="checklistOwner">
              <option value="todos">Todos</option>
              ${optionList(owners, state.ui.checklistOwner)}
            </select>
          </label>
        </div>
      </article>

      <div class="task-list">
        ${
          filtered.length
            ? filtered.map((task) => renderTaskCard(task, state.checklist[task.id])).join("")
            : `<p class="empty-state">No hay tareas con estos filtros.</p>`
        }
      </div>
    </section>
  `;
}

function renderTaskCard(task, record) {
  const checked = record.status === "completado";
  const quickId = fieldId("complete", task.id, "quick");

  return `
    <article class="task-card task-${record.status}">
      <div class="task-topline">
        <span class="area-chip">${escapeHtml(task.area)}</span>
        ${badge(record.status)}
      </div>
      <div class="task-main">
        <label class="big-check" for="${quickId}">
          <input id="${quickId}" type="checkbox" data-action="toggle-checklist-complete" data-id="${escapeHtml(task.id)}" ${checked ? "checked" : ""}>
          <span></span>
        </label>
        <div>
          <h3>${escapeHtml(task.title)}</h3>
          ${task.detail ? `<p class="muted">${escapeHtml(task.detail)}</p>` : ""}
        </div>
      </div>

      <div class="task-fields">
        <label>
          Estado
          <select data-action="update-checklist-field" data-id="${escapeHtml(task.id)}" data-field="status">
            ${optionList(STATUS.checklist, record.status)}
          </select>
        </label>
        <label>
          Responsable
          <input type="text" value="${escapeHtml(record.responsable)}" data-action="update-checklist-field" data-id="${escapeHtml(task.id)}" data-field="responsable">
        </label>
        <label>
          Hora
          <input type="time" value="${escapeHtml(record.time)}" data-action="update-checklist-field" data-id="${escapeHtml(task.id)}" data-field="time">
        </label>
        <label>
          Prioridad
          <select data-action="update-checklist-field" data-id="${escapeHtml(task.id)}" data-field="priority">
            ${optionList(["baja", "media", "alta", "crítica"], record.priority)}
          </select>
        </label>
      </div>

      <label class="wide-field">
        Observación
        <textarea rows="2" data-action="update-checklist-field" data-id="${escapeHtml(task.id)}" data-field="observation" placeholder="Novedad, dependencia o detalle operativo">${escapeHtml(record.observation)}</textarea>
      </label>
      <label class="wide-field">
        Evidencia
        <input type="text" value="${escapeHtml(record.evidence)}" data-action="update-checklist-field" data-id="${escapeHtml(task.id)}" data-field="evidence" placeholder="Link, nota o referencia de evidencia">
      </label>
      <footer class="card-footer">
        <span>Última actualización: ${formatDateTime(record.updatedAt)}</span>
      </footer>
    </article>
  `;
}
