/**
 * Track long-running mc-infra-manager requests via GetRequest + Toast.
 * Jobs persist in sessionStorage (incl. finished history for navbar).
 */

const STORAGE_KEY = 'mcwc_async_requests';
const POLL_MS = 2500;
const MAX_MS = 15 * 60 * 1000;
const MAX_JOBS = 20;
const GET_REQUEST_URL = '/api/mc-infra-manager/GetRequest';
const EVENT_NAME = 'mcwc-async-request-changed';

const timers = new Map();
const listeners = new Set();

function toastApi() {
  return webconsolejs && webconsolejs['common/utils/toast'];
}

function toastIdFor(requestId) {
  return 'async-req-' + requestId;
}

function loadJobs() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveJobs(jobs) {
  // Keep Handling first by startedAt, then finished by finishedAt; cap size
  const handling = jobs
    .filter((j) => j.status === 'Handling')
    .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
  const finished = jobs
    .filter((j) => j.status !== 'Handling')
    .sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
  const merged = handling.concat(finished).slice(0, MAX_JOBS);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

function emit(jobs) {
  const list = jobs || loadJobs();
  listeners.forEach((cb) => {
    try {
      cb(list);
    } catch (e) {
      /* subscriber error ignored */
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { jobs: list } })
    );
  }
}

function upsertJob(job) {
  const jobs = loadJobs().filter((j) => j.requestId !== job.requestId);
  jobs.push(job);
  const saved = saveJobs(jobs);
  emit(saved);
}

function stopTimer(requestId) {
  if (timers.has(requestId)) {
    clearInterval(timers.get(requestId));
    timers.delete(requestId);
  }
}

function showProgress(job) {
  const toast = toastApi();
  if (!toast || !toast.showToast) {
    return;
  }
  toast.showToast(
    toast.TOAST_TYPES ? toast.TOAST_TYPES.PROGRESS : 'progress',
    job.label + ' — processing...',
    { id: toastIdFor(job.requestId), autohide: false }
  );
}

function finishToast(job, type, message) {
  const toast = toastApi();
  if (!toast) {
    return;
  }
  if (toast.hideToast) {
    toast.hideToast(toastIdFor(job.requestId));
  }
  if (toast.showToast) {
    const t = toast.TOAST_TYPES
      ? (type === 'success' ? toast.TOAST_TYPES.SUCCESS : toast.TOAST_TYPES.ERROR)
      : type;
    toast.showToast(t, message);
  }
}

function markFinished(requestId, status, message) {
  stopTimer(requestId);
  const jobs = loadJobs();
  const job = jobs.find((j) => j.requestId === requestId);
  if (!job) {
    return;
  }
  job.status = status;
  job.finishedAt = Date.now();
  if (message) {
    job.message = message;
  }
  const saved = saveJobs(jobs);
  emit(saved);
  return job;
}

async function pollOnce(job) {
  try {
    const response = await webconsolejs['common/api/http'].commonAPIPost(
      GET_REQUEST_URL,
      { pathParams: { reqId: job.requestId } },
      undefined,
      { loaderType: 'none' }
    );

    const statusCode = response && response.status;
    const details =
      (response && response.data && response.data.responseData) ||
      (response && response.data) ||
      {};
    const status = details.status || details.Status;

    if (status === 'Success' || status === 'success') {
      const msg = job.label + ' — completed';
      finishToast(job, 'success', msg);
      markFinished(job.requestId, 'Success', msg);
      return;
    }
    if (status === 'Error' || status === 'error') {
      const errMsg = details.errorResponse || details.ErrorResponse || 'failed';
      const msg = job.label + ' — ' + errMsg;
      finishToast(job, 'error', msg);
      markFinished(job.requestId, 'Error', msg);
      return;
    }

    if (statusCode === 404 || (response && response.response && response.response.status === 404)) {
      return;
    }
  } catch (e) {
    // network blip — keep polling until timeout
  }
}

function startPolling(job) {
  if (timers.has(job.requestId)) {
    return;
  }
  const tick = () => {
    const current = loadJobs().find((j) => j.requestId === job.requestId);
    if (!current || current.status !== 'Handling') {
      stopTimer(job.requestId);
      return;
    }
    if (Date.now() - current.startedAt > MAX_MS) {
      const msg = current.label + ' — status check timed out';
      finishToast(current, 'error', msg);
      markFinished(current.requestId, 'Timeout', msg);
      return;
    }
    pollOnce(current);
  };
  timers.set(job.requestId, setInterval(tick, POLL_MS));
  tick();
}

/**
 * Register async tracking for a requestId already (or about to be) sent.
 */
export function track(opts) {
  const requestId = opts.requestId;
  if (!requestId) {
    return;
  }
  const job = {
    requestId,
    operationId: opts.operationId || '',
    label: opts.label || opts.operationId || 'Request',
    startedAt: Date.now(),
    status: 'Handling',
    href: opts.href || ''
  };
  upsertJob(job);
  showProgress(job);
  startPolling(job);
}

export function resume() {
  const jobs = loadJobs();
  jobs.filter((j) => j.status === 'Handling').forEach((job) => {
    showProgress(job);
    startPolling(job);
  });
  emit(jobs);
}

export function listJobs() {
  return loadJobs();
}

export function getHandlingCount() {
  return loadJobs().filter((j) => j.status === 'Handling').length;
}

export function subscribe(cb) {
  if (typeof cb !== 'function') {
    return function noop() {};
  }
  listeners.add(cb);
  cb(loadJobs());
  return function unsubscribe() {
    listeners.delete(cb);
  };
}

export function clearFinished() {
  const saved = saveJobs(loadJobs().filter((j) => j.status === 'Handling'));
  emit(saved);
}

export function dismiss(requestId) {
  stopTimer(requestId);
  const saved = saveJobs(loadJobs().filter((j) => j.requestId !== requestId));
  emit(saved);
}

export const ASYNC_REQUEST_EVENT = EVENT_NAME;

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resume);
  } else {
    setTimeout(resume, 0);
  }
}
