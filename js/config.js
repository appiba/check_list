import { EVENT } from "./data.js";
import { STORAGE_KEY } from "./storage.js";
import { escapeHtml, formatDateTime } from "./utils.js";

export function renderConfig(state) {
  return `
    <section class="screen" aria-labelledby="config-title">
      <div class="screen-heading">
        <div>
          <p class="eyebrow">Configuración</p>
          <h2 id="config-title">CONFIGURACIÓN DEL EVENTO</h2>
        </div>
      </div>

      <article class="panel config-panel">
        <span class="section-kicker">Evento</span>
        <h3>${escapeHtml(EVENT.appName)}</h3>
        <p>${escapeHtml(EVENT.series)} · ${escapeHtml(EVENT.dateLabel)}</p>
        <p class="muted">Persistencia actual: LocalStorage · llave: ${escapeHtml(STORAGE_KEY)}</p>
        <p class="muted">Última actualización local: ${formatDateTime(state.meta.updatedAt)}</p>
      </article>

      <article class="panel config-panel sync-panel">
        <div class="panel-header">
          <span class="section-kicker">Google Sheets + Apps Script</span>
          <span class="badge badge-${escapeHtml(state.sync.status)}">${escapeHtml(state.sync.status)}</span>
        </div>
        <h3>Sincronización operativa</h3>
        <p>${escapeHtml(state.sync.message || "Sin conexión activa")}</p>
        ${state.sync.lastError ? `<p class="sync-error">${escapeHtml(state.sync.lastError)}</p>` : ""}
        <div class="filter-grid">
          <label>
            Apps Script Web App URL
            <input type="url" value="${escapeHtml(state.sync.webAppUrl)}" data-action="update-sync-field" data-field="webAppUrl" placeholder="https://script.google.com/macros/s/.../exec">
          </label>
          <label>
            Spreadsheet ID
            <input type="text" value="${escapeHtml(state.sync.spreadsheetId)}" data-action="update-sync-field" data-field="spreadsheetId">
          </label>
        </div>
        <label class="sync-toggle">
          <input type="checkbox" data-action="toggle-sync-enabled" ${state.sync.enabled ? "checked" : ""}>
          <span>Activar sincronización automática</span>
        </label>
        <div class="sync-actions">
          <button class="primary-action" type="button" data-action="sync-test">Probar conexión</button>
          <button class="ghost-action" type="button" data-action="sync-push">Subir estado local</button>
          <button class="ghost-action" type="button" data-action="sync-pull">Bajar estado remoto</button>
        </div>
        <div class="sync-meta">
          <span>Última subida: ${formatDateTime(state.sync.lastPushAt)}</span>
          <span>Última bajada: ${formatDateTime(state.sync.lastPullAt)}</span>
        </div>
      </article>

      <article class="panel danger-zone">
        <span class="section-kicker">Zona de reinicio</span>
        <h3>REINICIAR DATOS DEL EVENTO</h3>
        <p>Elimina checks, estados de vehículos, activaciones, staff, incidencias, transmisión y mapa guardados en este navegador.</p>
        <button class="report-button" type="button" data-action="reset-event-data">REINICIAR DATOS DEL EVENTO</button>
      </article>
    </section>
  `;
}
