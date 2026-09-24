import { STATUS, TIMELINE } from "./data.js?v=20260924-map-v2";
import { badge, escapeHtml, formatDateTime, optionList } from "./utils.js?v=20260924-map-v2";
import { getCurrentTimelineItem } from "./metrics.js?v=20260924-map-v2";

export function renderTimeline(state) {
  const { current } = getCurrentTimelineItem(state);

  return `
    <section class="screen" aria-labelledby="timeline-title">
      <div class="screen-heading">
        <div>
          <p class="eyebrow">Cronograma maestro</p>
          <h2 id="timeline-title">AGENDA OPERATIVA</h2>
        </div>
        <div class="screen-stat">
          <strong>${escapeHtml(current.start)}</strong>
          <span>${escapeHtml(current.title)}</span>
        </div>
      </div>

      <article class="panel timing-note">
        <span class="section-kicker">Cálculo show</span>
        <p>58 vehículos inscritos · máximo 2 minutos 30 segundos por vehículo · 145 minutos · inicio 17:00 · cierre teórico 19:25.</p>
      </article>

      <div class="timeline-list">
        ${TIMELINE.map((item) => renderTimelineItem(item, state.timeline[item.id], item.id === current.id)).join("")}
      </div>
    </section>
  `;
}

function renderTimelineItem(item, record, isCurrent) {
  return `
    <article class="timeline-item ${isCurrent ? "current" : ""} timeline-${record.status}">
      <div class="timeline-time">
        <strong>${escapeHtml(item.start)}</strong>
        <span>${escapeHtml(item.end || "")}</span>
      </div>
      <div class="timeline-body">
        <div class="timeline-title-row">
          <h3>${escapeHtml(item.title)}</h3>
          ${badge(record.status)}
        </div>
        <p>${escapeHtml(item.detail)}</p>
        <div class="task-fields compact-fields">
          <label>
            Estado
            <select data-action="update-timeline-field" data-id="${escapeHtml(item.id)}" data-field="status">
              ${optionList(STATUS.timeline, record.status)}
            </select>
          </label>
        </div>
        <label class="wide-field">
          Observación
          <textarea rows="2" data-action="update-timeline-field" data-id="${escapeHtml(item.id)}" data-field="observation" placeholder="Retraso, ajuste de horario o detalle operativo">${escapeHtml(record.observation)}</textarea>
        </label>
        <footer class="card-footer">
          <span>Última actualización: ${formatDateTime(record.updatedAt)}</span>
        </footer>
      </div>
    </article>
  `;
}
