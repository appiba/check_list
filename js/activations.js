import { ACTIVATION_CONTROLS, ACTIVATIONS } from "./data.js";
import { escapeHtml, formatDateTime, normalize, percent, progressBar } from "./utils.js";
import { getActivationSummary } from "./metrics.js";

export function renderActivations(state) {
  const summary = getActivationSummary(state);
  const query = normalize(state.ui.activationSearch);
  const people = ACTIVATIONS.filter((person) => {
    const haystack = normalize(`${person.name} ${person.instagram}`);
    return !query || haystack.includes(query);
  });

  return `
    <section class="screen" aria-labelledby="activations-title">
      <div class="screen-heading">
        <div>
          <p class="eyebrow">Promotores / activaciones Expo</p>
          <h2 id="activations-title">ACTIVACIONES</h2>
        </div>
        <div class="screen-stat">
          <strong>${summary.completePeople}/${summary.totalPeople}</strong>
          <span>personas completas</span>
        </div>
      </div>

      <article class="panel controls-panel">
        ${progressBar(summary.percent, "Avance de activaciones")}
        <label>
          Buscar activación
          <input type="search" value="${escapeHtml(state.ui.activationSearch)}" data-action="set-ui-field" data-field="activationSearch" placeholder="Nombre o Instagram">
        </label>
      </article>

      <div class="activation-grid">
        ${people.map((person) => renderActivationCard(person, state.activations[person.id])).join("")}
      </div>
    </section>
  `;
}

function renderActivationCard(person, record) {
  const done = ACTIVATION_CONTROLS.filter((control) => record[control.key]).length;
  const completion = percent(done, ACTIVATION_CONTROLS.length);

  return `
    <article class="activation-card">
      <div class="activation-head">
        <span class="vehicle-number">${person.number}</span>
        <div>
          <h3>${escapeHtml(person.name)}</h3>
          ${person.instagram ? `<p class="muted">${escapeHtml(person.instagram)}</p>` : `<p class="muted">Instagram pendiente</p>`}
        </div>
        <strong>${done}/${ACTIVATION_CONTROLS.length}</strong>
      </div>
      ${progressBar(completion, `Avance ${person.name}`)}

      <div class="quick-grid activation-controls">
        ${ACTIVATION_CONTROLS.map(
          (control) => `
            <label class="quick-toggle ${record[control.key] ? "checked" : ""}">
              <input type="checkbox" data-action="toggle-activation-field" data-id="${escapeHtml(person.id)}" data-field="${control.key}" ${record[control.key] ? "checked" : ""}>
              <span>${escapeHtml(control.label)}</span>
            </label>
          `
        ).join("")}
      </div>

      <div class="task-fields compact-fields">
        <label>
          Zona asignada
          <input type="text" value="${escapeHtml(record.zona)}" data-action="update-activation-field" data-id="${escapeHtml(person.id)}" data-field="zona" placeholder="Zona / sponsor / punto">
        </label>
      </div>

      <label class="wide-field">
        Observación
        <textarea rows="2" data-action="update-activation-field" data-id="${escapeHtml(person.id)}" data-field="observacion" placeholder="Detalle operativo de activación">${escapeHtml(record.observacion)}</textarea>
      </label>

      <footer class="card-footer">
        <span>Última actualización: ${formatDateTime(record.updatedAt)}</span>
      </footer>
    </article>
  `;
}
