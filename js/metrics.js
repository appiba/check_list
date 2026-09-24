import { ACTIVATION_CONTROLS, CHECKLIST, CHECKLIST_AREAS, EVENT, TIMELINE, VEHICLES } from "./data.js?v=20260924-map-v2";
import { percent } from "./utils.js?v=20260924-map-v2";

export function getChecklistSummary(state) {
  const completed = CHECKLIST.filter((task) => state.checklist[task.id]?.status === "completado").length;
  const urgent = CHECKLIST.filter((task) => ["urgente", "bloqueado"].includes(state.checklist[task.id]?.status)).length;
  const inProgress = CHECKLIST.filter((task) => state.checklist[task.id]?.status === "en-proceso").length;

  return {
    total: CHECKLIST.length,
    completed,
    pending: CHECKLIST.length - completed,
    urgent,
    inProgress,
    percent: percent(completed, CHECKLIST.length)
  };
}

export function getAreaSummaries(state) {
  return CHECKLIST_AREAS.map((area) => {
    const tasks = CHECKLIST.filter((task) => task.area === area);
    const completed = tasks.filter((task) => state.checklist[task.id]?.status === "completado").length;
    const urgent = tasks.filter((task) => ["urgente", "bloqueado"].includes(state.checklist[task.id]?.status)).length;

    return {
      area,
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
      urgent,
      percent: percent(completed, tasks.length)
    };
  });
}

export function getVehicleSummary(state) {
  const total = VEHICLES.length;
  const counters = VEHICLES.reduce(
    (acc, vehicle) => {
      const record = state.vehicles[vehicle.id] || {};
      if (record.llego) acc.arrived += 1;
      if (record.revision) acc.reviewed += 1;
      if (record.parqueadero && record.parqueadero !== "SIN ASIGNAR") acc.parked += 1;
      if (record.preGrid) acc.preGrid += 1;
      if (record.presentado) acc.presented += 1;
      if (record.listoCaravana) acc.caravan += 1;
      return acc;
    },
    { arrived: 0, reviewed: 0, parked: 0, preGrid: 0, presented: 0, caravan: 0 }
  );

  const completedSteps = counters.arrived + counters.reviewed + counters.parked + counters.preGrid + counters.presented + counters.caravan;
  return {
    total,
    ...counters,
    percent: percent(completedSteps, total * 6)
  };
}

export function getActivationSummary(state) {
  const totalPeople = Object.keys(state.activations).length;
  const totalSteps = totalPeople * ACTIVATION_CONTROLS.length;
  const completedSteps = Object.values(state.activations).reduce(
    (sum, person) => sum + ACTIVATION_CONTROLS.filter((control) => person[control.key]).length,
    0
  );

  return {
    totalPeople,
    totalSteps,
    completedSteps,
    completePeople: Object.values(state.activations).filter((person) =>
      ACTIVATION_CONTROLS.every((control) => person[control.key])
    ).length,
    percent: percent(completedSteps, totalSteps)
  };
}

export function getIncidentSummary(state) {
  const open = state.incidents.filter((incident) => incident.estado !== "RESUELTA");
  const critical = open.filter((incident) => incident.prioridad === "CRÍTICA").length;
  return {
    total: state.incidents.length,
    open: open.length,
    critical
  };
}

export function getBroadcastSummary(state) {
  const records = Object.values(state.broadcast);
  const healthy = records.filter((record) => ["listo", "online"].includes(record.status)).length;
  return {
    total: records.length,
    healthy,
    problems: records.length - healthy,
    percent: percent(healthy, records.length)
  };
}

export function getOverallProgress(state) {
  const checklist = getChecklistSummary(state).percent;
  const vehicles = getVehicleSummary(state).percent;
  const activations = getActivationSummary(state).percent;
  const broadcast = getBroadcastSummary(state).percent;

  return Math.round(checklist * 0.5 + vehicles * 0.25 + activations * 0.15 + broadcast * 0.1);
}

function timeToMinutes(value = "00:00") {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentTimelineItem(state) {
  const manualCurrent = TIMELINE.find((item) => state.timeline[item.id]?.status === "en-curso");
  if (manualCurrent) {
    const next = TIMELINE.find((item) => timeToMinutes(item.start) > timeToMinutes(manualCurrent.start));
    return { current: manualCurrent, next };
  }

  if (localDateString() !== EVENT.date) {
    const nextUnfinished = TIMELINE.find((item) => state.timeline[item.id]?.status !== "finalizado") || TIMELINE[0];
    const next = TIMELINE[TIMELINE.indexOf(nextUnfinished) + 1];
    return { current: nextUnfinished, next };
  }

  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const current = TIMELINE.find((item) => {
    const start = timeToMinutes(item.start);
    const end = timeToMinutes(item.end || item.start);
    return minutes >= start && minutes < end;
  });
  const next = TIMELINE.find((item) => timeToMinutes(item.start) > minutes);
  const fallback = current || next || TIMELINE[TIMELINE.length - 1];
  const fallbackIndex = TIMELINE.findIndex((item) => item.id === fallback.id);

  return {
    current: fallback,
    next: current ? next : TIMELINE[fallbackIndex + 1]
  };
}
