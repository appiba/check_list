import {
  ACTIVATION_CONTROLS,
  ACTIVATIONS,
  BROADCAST,
  CHECKLIST,
  EVENT,
  MAP_ZONES,
  STAFF,
  TEAM,
  TIMELINE,
  VEHICLES
} from "./data.js?v=20260924-map-v2";

const JSONP_TIMEOUT_MS = 12000;
const POST_TIMEOUT_MS = 16000;
const SAVE_DEBOUNCE_MS = 200;
let saveTimer;
let pendingSave;

export function canSync(state) {
  return Boolean(state.sync?.enabled && state.sync?.webAppUrl?.trim());
}

export function getSyncUrl(state) {
  return state.sync?.webAppUrl?.trim() || "";
}

export function buildSyncPayload(state) {
  const deletedMapZoneIds = new Set(state.deletedMapZoneIds || []);
  const mapZones = [...MAP_ZONES, ...(state.customMapZones || [])].filter((zone) => !deletedMapZoneIds.has(zone.id));
  const statePayload = JSON.parse(JSON.stringify(state));
  if (statePayload.meta) {
    delete statePayload.meta.needsRemoteSave;
  }

  return {
    app: "expo12h-control-center",
    event: EVENT,
    sentAt: new Date().toISOString(),
    state: statePayload,
    catalog: {
      activationControls: ACTIVATION_CONTROLS,
      activations: ACTIVATIONS,
      broadcast: BROADCAST,
      checklist: CHECKLIST,
      mapZones,
      staff: STAFF,
      team: TEAM,
      timeline: TIMELINE,
      vehicles: VEHICLES
    }
  };
}

export function queueRemoteSave(state, callbacks = {}) {
  if (!canSync(state)) return;
  clearTimeout(saveTimer);
  const snapshot = JSON.parse(JSON.stringify(state));
  pendingSave = { snapshot, callbacks };
  saveTimer = setTimeout(() => {
    flushQueuedRemoteSave().catch(() => {});
  }, SAVE_DEBOUNCE_MS);
}

export function flushQueuedRemoteSave(options = {}) {
  if (!pendingSave) return Promise.resolve({ ok: true, skipped: true });

  clearTimeout(saveTimer);
  saveTimer = null;

  const { snapshot, callbacks } = pendingSave;
  pendingSave = null;

  return pushState(snapshot, options)
    .then((result) => {
      callbacks.onSuccess?.(result);
      return result;
    })
    .catch((error) => {
      callbacks.onError?.(error);
      throw error;
    });
}

export async function testConnection(webAppUrl) {
  return jsonp(webAppUrl, { action: "ping" });
}

export async function pullState(webAppUrl) {
  const response = await jsonp(webAppUrl, { action: "state" });
  if (!response.ok) {
    throw new Error(response.error || "No se pudo leer el estado remoto.");
  }
  return response;
}

export function pushState(state, options = {}) {
  return postToAppsScript(getSyncUrl({ sync: state.sync }), {
    action: "save",
    payload: JSON.stringify(buildSyncPayload(state))
  }, options);
}

function jsonp(webAppUrl, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `__expo12hSync${Date.now()}${Math.random().toString(36).slice(2)}`;
    const url = new URL(webAppUrl);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set("callback", callbackName);

    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Tiempo de espera agotado al conectar con Apps Script."));
    }, JSONP_TIMEOUT_MS);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("No se pudo cargar la respuesta de Apps Script."));
    };

    script.src = url.toString();
    document.head.appendChild(script);
  });
}

function postToAppsScript(webAppUrl, fields, options = {}) {
  if (window.fetch) {
    const body = new URLSearchParams(fields);
    return window.fetch(webAppUrl, {
      method: "POST",
      mode: "no-cors",
      keepalive: Boolean(options.keepalive),
      body
    }).then(() => ({ ok: true, savedAt: new Date().toISOString() })).catch(() => postWithIframe(webAppUrl, fields));
  }

  return postWithIframe(webAppUrl, fields);
}

function postWithIframe(webAppUrl, fields) {
  return new Promise((resolve, reject) => {
    const iframeName = `expo12h-sync-frame-${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.hidden = true;
    iframe.style.display = "none";

    const form = document.createElement("form");
    form.method = "POST";
    form.action = webAppUrl;
    form.target = iframeName;
    form.hidden = true;

    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("El guardado remoto no respondió a tiempo."));
    }, POST_TIMEOUT_MS);

    function cleanup() {
      window.clearTimeout(timeout);
      form.remove();
      iframe.remove();
    }

    iframe.addEventListener("load", () => {
      cleanup();
      resolve({ ok: true, savedAt: new Date().toISOString() });
    });

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
  });
}
