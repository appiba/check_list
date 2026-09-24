import { STAFF, TEAM } from "./data.js?v=20260924-parking-v2";
import { badge, escapeHtml, formatDateTime, optionList } from "./utils.js?v=20260924-parking-v2";

export function renderTeam(state) {
  return `
    <section class="screen" aria-labelledby="team-title">
      <div class="screen-heading">
        <div>
          <p class="eyebrow">Cadena de mando</p>
          <h2 id="team-title">EQUIPO OPERATIVO</h2>
        </div>
        ${badge("OPERATIVO", "online")}
      </div>

      <div class="team-grid">
        ${TEAM.map((member) => renderTeamMember(member, state.team[member.id])).join("")}
      </div>

      <div class="screen-heading sub-heading">
        <div>
          <p class="eyebrow">Staff polivalente</p>
          <h2>STAFF S01 - S10</h2>
        </div>
      </div>

      <div class="staff-grid">
        ${STAFF.map((member) => renderStaffMember(member, state.staff[member.id])).join("")}
      </div>
    </section>
  `;
}

function renderTeamMember(member, record) {
  return `
    <article class="team-card">
      <div class="team-card-head">
        <div>
          <span class="section-kicker">${escapeHtml(record.role)}</span>
          <h3>${escapeHtml(record.name)}</h3>
        </div>
        ${badge(record.status, record.status)}
      </div>
      <ul class="function-list">
        ${member.functions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <div class="task-fields compact-fields">
        <label>
          Nombre
          <input type="text" value="${escapeHtml(record.name)}" data-action="update-team-field" data-id="${escapeHtml(member.id)}" data-field="name">
        </label>
        <label>
          Estado
          <select data-action="update-team-field" data-id="${escapeHtml(member.id)}" data-field="status">
            ${optionList(["CONFIRMADO", "POR DESIGNAR", "EN CAMINO", "EN PUESTO"], record.status)}
          </select>
        </label>
        <label>
          Teléfono
          <input type="tel" value="${escapeHtml(record.phone)}" data-action="update-team-field" data-id="${escapeHtml(member.id)}" data-field="phone">
        </label>
      </div>
      <label class="wide-field">
        Observación
        <textarea rows="2" data-action="update-team-field" data-id="${escapeHtml(member.id)}" data-field="observation" placeholder="Novedad de mando o reemplazo">${escapeHtml(record.observation)}</textarea>
      </label>
      <footer class="card-footer">
        <span>Última actualización: ${formatDateTime(record.updatedAt)}</span>
      </footer>
    </article>
  `;
}

function renderStaffMember(member, record) {
  return `
    <article class="staff-card">
      <div class="vehicle-header">
        <span class="vehicle-number">${escapeHtml(member.code)}</span>
        ${badge(record.puestoConfirmado ? "PUESTO OK" : "PENDIENTE", record.puestoConfirmado ? "completado" : "pendiente")}
      </div>
      <h3>${escapeHtml(member.role)}</h3>
      <p class="muted">${escapeHtml(member.detail)}</p>
      <div class="task-fields compact-fields">
        <label>
          Nombre
          <input type="text" value="${escapeHtml(record.name)}" data-action="update-staff-field" data-id="${escapeHtml(member.id)}" data-field="name">
        </label>
        <label>
          Teléfono
          <input type="tel" value="${escapeHtml(record.phone)}" data-action="update-staff-field" data-id="${escapeHtml(member.id)}" data-field="phone">
        </label>
      </div>
      <div class="quick-grid">
        <label class="quick-toggle ${record.llego ? "checked" : ""}">
          <input type="checkbox" data-action="toggle-staff-field" data-id="${escapeHtml(member.id)}" data-field="llego" ${record.llego ? "checked" : ""}>
          <span>Llegó</span>
        </label>
        <label class="quick-toggle ${record.radioEntregado ? "checked" : ""}">
          <input type="checkbox" data-action="toggle-staff-field" data-id="${escapeHtml(member.id)}" data-field="radioEntregado" ${record.radioEntregado ? "checked" : ""}>
          <span>Radio entregado</span>
        </label>
        <label class="quick-toggle ${record.puestoConfirmado ? "checked" : ""}">
          <input type="checkbox" data-action="toggle-staff-field" data-id="${escapeHtml(member.id)}" data-field="puestoConfirmado" ${record.puestoConfirmado ? "checked" : ""}>
          <span>Puesto confirmado</span>
        </label>
      </div>
      <label class="wide-field">
        Observación
        <textarea rows="2" data-action="update-staff-field" data-id="${escapeHtml(member.id)}" data-field="observation" placeholder="Novedad, reemplazo o ubicación exacta">${escapeHtml(record.observation)}</textarea>
      </label>
      <footer class="card-footer">
        <span>Última actualización: ${formatDateTime(record.updatedAt)}</span>
      </footer>
    </article>
  `;
}
