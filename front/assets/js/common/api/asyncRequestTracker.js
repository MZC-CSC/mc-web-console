/**
 * Track long-running mc-infra-manager requests via console API + GetRequest.
 * Primary: GET /api/async-requests (Postgres). Fallback: sessionStorage + poll.
 */

const STORAGE_KEY = 'mcwc_async_requests';
const POLL_MS = 2500;
const LIST_REFRESH_MS = 2000;
const MAX_MS = 15 * 60 * 1000;
const MAX_JOBS = 20;
const GET_REQUEST_URL = '/api/mc-infra-manager/GetRequest';
const LIST_URL = '/api/async-requests';
const EVENT_NAME = 'mcwc-async-request-changed';

const timers = new Map();
const listeners = new Set();
let useServer = null;
let listTimer = null;
let lastToastStatus = new Map();

function toastApi() {
  return webconsolejs && webconsolejs['common/utils/toast'];
}

function toastIdFor(requestId) {
  return 'async-req-' + requestId;
}

function toMillis(ts) {
  if (ts == null || ts === '') {
    return 0;
  }
  if (typeof ts === 'number') {
    return ts;
  }
  const n = Date.parse(ts);
  return Number.isNaN(n) ? 0 : n;
}

function normalizeJob(job) {
  if (!job) {
    return null;
  }
  return {
    requestId: job.requestId || job.request_id,
    operationId: job.operationId || job.operation_id || '',
    label: job.label || job.operationId || 'Request',
    status: job.status || 'Handling',
    startedAt: toMillis(job.startedAt || job.started_at) || Date.now(),
    finishedAt: job.finishedAt || job.finished_at
      ? toMillis(job.finishedAt || job.finished_at)
      : undefined,
    message: job.message || '',
    href: job.href || '',
  };
}

function loadJobsLocal() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeJob).filter(Boolean) : [];
  } catch (e) {
    return [];
  }
}

function saveJobsLocal(jobs) {
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
  const list = jobs || loadJobsLocal();
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

function upsertJobLocal(job) {
  const jobs = loadJobsLocal().filter((j) => j.requestId !== job.requestId);
  jobs.push(job);
  const saved = saveJobsLocal(jobs);
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
    job.label + ' — in progress...',
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

function markFinishedLocal(requestId, status, message) {
  stopTimer(requestId);
  const jobs = loadJobsLocal();
  const job = jobs.find((j) => j.requestId === requestId);
  if (!job) {
    return;
  }
  job.status = status;
  job.finishedAt = Date.now();
  if (message) {
    job.message = message;
  }
  const saved = saveJobsLocal(jobs);
  emit(saved);
  return job;
}

function maybeToastTransition(prevJobs, nextJobs) {
  const prevMap = new Map((prevJobs || []).map((j) => [j.requestId, j]));
  (nextJobs || []).forEach((job) => {
    const prev = prevMap.get(job.requestId);
    const prevStatus = prev ? prev.status : lastToastStatus.get(job.requestId);
    if (prevStatus === job.status) {
      return;
    }
    lastToastStatus.set(job.requestId, job.status);
    if (job.status === 'Handling') {
      showProgress(job);
      return;
    }
    if (job.status === 'Success') {
      finishToast(job, 'success', job.label + ' — completed');
      stopTimer(job.requestId);
      return;
    }
    if (job.status === 'Error' || job.status === 'Timeout') {
      finishToast(
        job,
        'error',
        job.message || job.label + ' — ' + (job.status === 'Timeout' ? 'timed out' : 'failed')
      );
      stopTimer(job.requestId);
    }
  });
}

async function fetchServerJobs() {
  const http = webconsolejs && webconsolejs['common/api/http'];
  if (!http || !http.commonAPIGet) {
    return null;
  }
  const response = await http.commonAPIGet(LIST_URL);
  if (!response || response.status !== 200) {
    return null;
  }
  const data =
    (response.data && response.data.responseData) ||
    (response.data && response.data.data) ||
    response.data;
  if (!Array.isArray(data)) {
    return null;
  }
  return data.map(normalizeJob).filter(Boolean);
}

async function refreshFromServer() {
  try {
    const jobs = await fetchServerJobs();
    if (jobs == null) {
      if (useServer === true) {
        // transient failure — keep server mode
        return;
      }
      useServer = false;
      return;
    }
    const prev = useServer === true ? (window.__mcwcAsyncJobsCache || []) : loadJobsLocal();
    useServer = true;
    window.__mcwcAsyncJobsCache = jobs;
    maybeToastTransition(prev, jobs);
    emit(jobs);
    // still poll GetRequest for Handling toast progress when server list lags
    jobs.filter((j) => j.status === 'Handling').forEach((job) => {
      if (!timers.has(job.requestId)) {
        startPolling(job);
      }
    });
  } catch (e) {
    if (useServer !== true) {
      useServer = false;
    }
  }
}

function ensureListRefresh() {
  if (listTimer) {
    return;
  }
  listTimer = setInterval(function () {
    if (useServer !== false) {
      refreshFromServer();
    }
  }, LIST_REFRESH_MS);
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
      if (useServer) {
        lastToastStatus.set(job.requestId, 'Success');
        stopTimer(job.requestId);
        refreshFromServer();
      } else {
        markFinishedLocal(job.requestId, 'Success', msg);
      }
      return;
    }
    if (status === 'Error' || status === 'error') {
      const errMsg = details.errorResponse || details.ErrorResponse || 'failed';
      const msg = job.label + ' — ' + errMsg;
      finishToast(job, 'error', msg);
      if (useServer) {
        lastToastStatus.set(job.requestId, 'Error');
        stopTimer(job.requestId);
        refreshFromServer();
      } else {
        markFinishedLocal(job.requestId, 'Error', msg);
      }
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
    const current = (useServer ? (window.__mcwcAsyncJobsCache || []) : loadJobsLocal())
      .find((j) => j.requestId === job.requestId);
    if (!current || current.status !== 'Handling') {
      stopTimer(job.requestId);
      return;
    }
    if (Date.now() - current.startedAt > MAX_MS) {
      const msg = current.label + ' — status check timed out';
      finishToast(current, 'error', msg);
      if (!useServer) {
        markFinishedLocal(current.requestId, 'Timeout', msg);
      }
      stopTimer(job.requestId);
      return;
    }
    pollOnce(current);
  };
  timers.set(job.requestId, setInterval(tick, DEFAULT_POLL_MS()));
  tick();
}

function DEFAULT_POLL_MS() {
  return POLL_MS;
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
    href: opts.href || '',
  };
  lastToastStatus.set(requestId, 'Handling');
  showProgress(job);
  if (useServer !== true) {
    upsertJobLocal(job);
  } else {
    const cache = window.__mcwcAsyncJobsCache || [];
    const next = cache.filter((j) => j.requestId !== requestId).concat([job]);
    window.__mcwcAsyncJobsCache = next;
    emit(next);
  }
  startPolling(job);
  ensureListRefresh();
  refreshFromServer();
}

export function resume() {
  ensureListRefresh();
  refreshFromServer().then(function () {
    if (useServer) {
      return;
    }
    const jobs = loadJobsLocal();
    jobs.filter((j) => j.status === 'Handling').forEach((job) => {
      showProgress(job);
      startPolling(job);
    });
    emit(jobs);
  });
}

export function listJobs() {
  if (useServer && window.__mcwcAsyncJobsCache) {
    return window.__mcwcAsyncJobsCache;
  }
  return loadJobsLocal();
}

export function getHandlingCount() {
  return listJobs().filter((j) => j.status === 'Handling').length;
}

export function subscribe(cb) {
  if (typeof cb !== 'function') {
    return function noop() {};
  }
  listeners.add(cb);
  cb(listJobs());
  return function unsubscribe() {
    listeners.delete(cb);
  };
}

export async function clearFinished() {
  if (useServer) {
    try {
      await axiosDelete(LIST_URL + '?finished=1');
      await refreshFromServer();
      return;
    } catch (e) {
      /* fall through */
    }
  }
  const saved = saveJobsLocal(loadJobsLocal().filter((j) => j.status === 'Handling'));
  emit(saved);
}

export async function dismiss(requestId) {
  stopTimer(requestId);
  if (useServer) {
    try {
      await axiosDelete(LIST_URL + '/' + encodeURIComponent(requestId));
      await refreshFromServer();
      return;
    } catch (e) {
      /* fall through */
    }
  }
  const saved = saveJobsLocal(loadJobsLocal().filter((j) => j.requestId !== requestId));
  emit(saved);
}

async function axiosDelete(url) {
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('DELETE ' + url + ' failed: ' + response.status);
  }
  return response;
}

export const ASYNC_REQUEST_EVENT = EVENT_NAME;

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resume);
  } else {
    setTimeout(resume, 0);
  }
}
