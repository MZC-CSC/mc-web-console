/**
 * Navbar notification dropdown bound to asyncRequestTracker jobs.
 */

function tracker() {
  return webconsolejs && webconsolejs['common/api/asyncRequestTracker'];
}

function shortId(requestId) {
  if (!requestId || requestId.length < 8) {
    return requestId || '';
  }
  return '…' + requestId.slice(-8);
}

function statusDotClass(status) {
  if (status === 'Handling') {
    return 'status-dot status-dot-animated bg-azure d-block';
  }
  if (status === 'Success') {
    return 'status-dot bg-green d-block';
  }
  if (status === 'Error' || status === 'Timeout') {
    return 'status-dot bg-red d-block';
  }
  return 'status-dot d-block';
}

function statusLabel(status) {
  if (status === 'Handling') {
    return 'Processing';
  }
  if (status === 'Success') {
    return 'Success';
  }
  if (status === 'Timeout') {
    return 'Timeout';
  }
  if (status === 'Error') {
    return 'Error';
  }
  return status || '';
}

function formatTime(ts) {
  if (!ts) {
    return '';
  }
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return d.toLocaleTimeString();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderJobs(jobs) {
  const listEl = document.getElementById('async-request-notif-list');
  const badgeEl = document.getElementById('async-request-notif-badge');
  const emptyEl = document.getElementById('async-request-notif-empty');
  if (!listEl || !badgeEl) {
    return;
  }

  const handling = (jobs || []).filter((j) => j.status === 'Handling').length;
  if (handling > 0) {
    badgeEl.textContent = String(handling);
    badgeEl.classList.remove('d-none');
  } else {
    badgeEl.textContent = '';
    badgeEl.classList.add('d-none');
  }

  if (!jobs || jobs.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) {
      emptyEl.classList.remove('d-none');
    }
    return;
  }
  if (emptyEl) {
    emptyEl.classList.add('d-none');
  }

  listEl.innerHTML = jobs
    .map((job) => {
      const sub =
        (job.operationId ? escapeHtml(job.operationId) + ' · ' : '') +
        shortId(job.requestId) +
        (job.startedAt ? ' · ' + formatTime(job.startedAt) : '');
      const title = escapeHtml(job.label || job.operationId || 'Request');
      const st = statusLabel(job.status);
      const msg =
        job.status !== 'Handling' && job.message
          ? '<div class="d-block text-secondary text-truncate mt-n1">' +
            escapeHtml(job.message) +
            '</div>'
          : '<div class="d-block text-secondary text-truncate mt-n1">' +
            escapeHtml(sub) +
            '</div>';
      return (
        '<div class="list-group-item" data-request-id="' +
        escapeHtml(job.requestId) +
        '">' +
        '<div class="row align-items-center">' +
        '<div class="col-auto"><span class="' +
        statusDotClass(job.status) +
        '" title="' +
        escapeHtml(st) +
        '"></span></div>' +
        '<div class="col text-truncate">' +
        '<span class="text-body d-block">' +
        title +
        ' <span class="text-secondary small">(' +
        escapeHtml(st) +
        ')</span></span>' +
        msg +
        '</div>' +
        '<div class="col-auto">' +
        '<a href="#" class="list-group-item-actions async-request-dismiss" ' +
        'data-request-id="' +
        escapeHtml(job.requestId) +
        '" title="Dismiss">' +
        '<svg xmlns="http://www.w3.org/2000/svg" class="icon text-muted" width="24" height="24" ' +
        'viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" ' +
        'stroke-linecap="round" stroke-linejoin="round">' +
        '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>' +
        '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg></a>' +
        '</div></div></div>'
      );
    })
    .join('');
}

function bindActions() {
  const clearBtn = document.getElementById('async-request-notif-clear');
  if (clearBtn && !clearBtn.dataset.bound) {
    clearBtn.dataset.bound = '1';
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const t = tracker();
      if (t && t.clearFinished) {
        t.clearFinished();
      }
    });
  }

  const listEl = document.getElementById('async-request-notif-list');
  if (listEl && !listEl.dataset.bound) {
    listEl.dataset.bound = '1';
    listEl.addEventListener('click', (e) => {
      const dismiss = e.target.closest('.async-request-dismiss');
      if (!dismiss) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const id = dismiss.getAttribute('data-request-id');
      const t = tracker();
      if (t && t.dismiss && id) {
        t.dismiss(id);
      }
    });
  }
}

export function initAsyncRequestNotify() {
  const t = tracker();
  if (!t || !t.subscribe) {
    return;
  }
  bindActions();
  t.subscribe(renderJobs);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAsyncRequestNotify);
  } else {
    setTimeout(initAsyncRequestNotify, 0);
  }
}
