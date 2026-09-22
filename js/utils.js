export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function percent(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function progressBar(value, label = "") {
  const safeValue = clamp(Number(value) || 0);
  return `
    <div class="progress" aria-label="${escapeHtml(label || `${safeValue}%`)}">
      <span style="width:${safeValue}%"></span>
    </div>
  `;
}

export function statusClass(value = "") {
  return String(value).toLowerCase().replace(/\s|\//g, "-").replace(/[^\w-]/g, "");
}

export function badge(value, tone = value) {
  return `<span class="badge badge-${statusClass(tone)}">${escapeHtml(value)}</span>`;
}

export function fieldId(prefix, id, field) {
  return `${prefix}-${id}-${field}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function optionList(options, selected) {
  return options
    .map((option) => {
      const value = typeof option === "string" ? option : option.value;
      const label = typeof option === "string" ? option : option.label;
      return `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");
}

export function formatDateTime(iso) {
  if (!iso) return "Sin actualización";
  try {
    return new Intl.DateTimeFormat("es-EC", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function getFormValue(formData, key, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

export function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function actionButton(action, id, label, extraClass = "") {
  return `<button class="control-btn ${extraClass}" type="button" data-action="${action}" data-id="${escapeHtml(id)}">${label}</button>`;
}
