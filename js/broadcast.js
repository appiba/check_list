import { BROADCAST, STATUS } from "./data.js?v=20260924-parking-v2";
import { badge, escapeHtml, formatDateTime, optionList, progressBar } from "./utils.js?v=20260924-parking-v2";
import { getBroadcastSummary } from "./metrics.js?v=20260924-parking-v2";

export function renderBroadcast(state) {
  const summary = getBroadcastSummary(state);

  return `
    <section class="screen" aria-labelledby="broadcast-title">
      <div class="screen-heading">
        <div>
          <p class="eyebrow">Producción audiovisual / transmisión</p>
          <h2 id="broadcast-title">CIRCUITO CERRADO</h2>
        </div>
        <div class="screen-stat">
          <strong>${summary.healthy}/${summary.total}</strong>
          <span>sin problema</span>
        </div>
      </div>

      <article class="panel controls-panel">
        ${progressBar(summary.percent, "Estado de transmisión y circuito cerrado")}
        <p class="muted">Circuito cerrado pertenece a producción audiovisual y transmisión, no a seguridad.</p>
      </article>

      <div class="broadcast-grid">
        ${BROADCAST.map((item) => renderBroadcastCard(item, state.broadcast[item.id])).join("")}
      </div>
    </section>
  `;
}

function renderBroadcastCard(item, record) {
  return `
    <article class="broadcast-card broadcast-${record.status}">
      <div class="vehicle-header">
        <h3>${escapeHtml(item.name)}</h3>
        ${badge(record.status)}
      </div>
      <div class="task-fields compact-fields">
        <label>
          Estado
          <select data-action="update-broadcast-field" data-id="${escapeHtml(item.id)}" data-field="status">
            ${optionList(STATUS.broadcast, record.status)}
          </select>
        </label>
        <label>
          Responsable
          <input type="text" value="${escapeHtml(record.responsable)}" data-action="update-broadcast-field" data-id="${escapeHtml(item.id)}" data-field="responsable">
        </label>
      </div>
      <label class="wide-field">
        Observación
        <textarea rows="2" data-action="update-broadcast-field" data-id="${escapeHtml(item.id)}" data-field="observation" placeholder="Señal, audio, cámara o streaming">${escapeHtml(record.observation)}</textarea>
      </label>
      <footer class="card-footer">
        <span>Última actualización: ${formatDateTime(record.updatedAt)}</span>
      </footer>
    </article>
  `;
}
