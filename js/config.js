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

      <article class="panel config-panel">
        <span class="section-kicker">Sincronización futura</span>
        <p>La estructura separa datos semilla, estado operativo, filtros y renderizado. La conexión posterior con Google Sheets + Google Apps Script puede leer y escribir sobre el mismo modelo de estado.</p>
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
