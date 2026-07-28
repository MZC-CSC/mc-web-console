// Server Spec 관리 — system namespace 고정 (프로젝트 NsId 사용 금지)
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { showToast, TOAST_TYPES } from '../../../../common/utils/toast.js';

const SYSTEM_NS = 'system';
const PAGE_KEY = 'pages/settings/environment/cloudresources/serverspecs';
const specApi = () => webconsolejs['common/api/services/serverspec_api'];

const AppState = {
  tables: { resourceTable: null, popupTable: null },
  resources: { selected: null },
};

// ─── 페이지 초기화 ────────────────────────────────────────────────────────

$('#select-current-project').on('change', async function () {
  if (this.value === '') return;
  hideDetail();
  await refreshSpecList();
});

document.addEventListener('DOMContentLoaded', async function () {
  const btnList = document.getElementById('page-header-btn-list');
  if (btnList) {
    btnList.innerHTML = `
      <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#create-spec-modal">
        Register Spec
      </button>`;
  }

  const selectedWorkspaceProject = await webconsolejs['partials/layout/navbar'].workspaceProjectInit();
  webconsolejs['partials/layout/modal'].checkWorkspaceSelection(selectedWorkspaceProject);

  updateNamespaceLabel();
  initFilter();

  if (selectedWorkspaceProject.projectId !== '') {
    await refreshSpecList();
  }
});

function updateNamespaceLabel() {
  const label = document.getElementById('serverspecs-context-label');
  if (label) label.textContent = `Namespace: ${SYSTEM_NS}`;
}

// ─── Spec 목록 ────────────────────────────────────────────────────────────

export async function refreshSpecList() {
  try {
    const data = await specApi().list(SYSTEM_NS);
    const items = data?.spec || [];
    if (AppState.tables.resourceTable) {
      AppState.tables.resourceTable.replaceData(items);
    } else {
      initTable(items);
    }
  } catch (err) {
    if (err?.response?.status !== 404) console.error('Failed to load specs', err);
    const items = [];
    if (AppState.tables.resourceTable) {
      AppState.tables.resourceTable.replaceData(items);
    } else {
      initTable(items);
    }
  }
}

function initTable(data) {
  AppState.tables.resourceTable = new Tabulator('#spec-table', {
    data,
    layout: 'fitColumns',
    placeholder: 'No specs found.',
    pagination: 'local',
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 50],
    paginationCounter: 'rows',
    movableColumns: true,
    initialSort: [{ column: 'name', dir: 'asc' }],
    columns: [
      { title: 'Spec Name', field: 'name', widthGrow: 2, sorter: 'string' },
      { title: 'vCPU', field: 'vCPU', hozAlign: 'center', width: 80, sorter: 'number' },
      { title: 'Memory (GiB)', field: 'memoryGiB', hozAlign: 'center', width: 120, sorter: 'number' },
      { title: 'Connection', field: 'connectionName', widthGrow: 1, sorter: 'string' },
    ],
  });

  AppState.tables.resourceTable.on('rowClick', function (_e, row) {
    const d = row.getData();
    AppState.resources.selected = d;
    renderDetail(d);
    showDetail();
  });
}

// ─── Detail Panel ─────────────────────────────────────────────────────────

function renderDetail(data) {
  document.getElementById('detail-name').textContent = data.name || '-';
  document.getElementById('detail-specName').textContent = data.name || '-';
  document.getElementById('detail-vcpu').textContent = data.vCPU ?? '-';
  document.getElementById('detail-memory').textContent = data.memoryGiB ?? '-';
  document.getElementById('detail-gpu').textContent = data.acceleratorCount ?? '-';
  document.getElementById('detail-disk').textContent = data.rootDiskSize ?? '-';
  document.getElementById('detail-cspSpecName').textContent = data.cspSpecName || '-';
  document.getElementById('detail-ns').textContent = SYSTEM_NS;
}

function showDetail() {
  document.getElementById('view-mode-cards')?.classList.add('show');
}

export function hideDetail() {
  document.getElementById('view-mode-cards')?.classList.remove('show');
  AppState.resources.selected = null;
}

export async function confirmDeleteSpec() {
  const item = AppState.resources.selected;
  if (!item || !confirm(`Delete spec "${item.name}"?`)) return;
  try {
    await specApi().del(SYSTEM_NS, item.name);
    showToast(TOAST_TYPES.SUCCESS, `Spec "${item.name}" deleted successfully`);
    hideDetail();
    await refreshSpecList();
  } catch (err) {
    console.error('Spec delete failed:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to delete spec: ' + (err?.response?.data?.message || err.message));
  }
}

// ─── Filter ───────────────────────────────────────────────────────────────

function initFilter() {
  const fieldEl = document.getElementById('filter-field');
  const typeEl = document.getElementById('filter-type');
  const valueEl = document.getElementById('filter-value');
  if (!fieldEl || !typeEl || !valueEl) return;

  function updateFilter() {
    const field = fieldEl.value;
    const type = typeEl.value;
    if (field && AppState.tables.resourceTable) {
      AppState.tables.resourceTable.setFilter(field, type, valueEl.value);
    }
  }

  fieldEl.addEventListener('change', updateFilter);
  typeEl.addEventListener('change', updateFilter);
  valueEl.addEventListener('keyup', updateFilter);

  document.getElementById('filter-clear')?.addEventListener('click', function () {
    fieldEl.value = '';
    typeEl.value = 'like';
    valueEl.value = '';
    AppState.tables.resourceTable?.clearFilter();
  });
}

// ─── Register from CSP ────────────────────────────────────────────────────

document.getElementById('create-spec-modal')?.addEventListener('show.bs.modal', function () {
  document.getElementById('modal-specName').value = '';
  document.getElementById('modal-cspSpecName').value = '';
  document.getElementById('modal-connectionName').value = '';
});

export async function openSpecSelectPopup() {
  try {
    const resp = await webconsolejs['common/api/http'].commonAPIPost('/api/mc-infra-manager/GetConnConfigList', {});
    const conns = resp?.data?.responseData?.connectionconfig || [];
    const popupConn = document.getElementById('popup-connection');
    popupConn.innerHTML = '<option value="">-- Select Connection --</option>';
    conns.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.configName;
      opt.textContent = c.configName;
      popupConn.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load connections', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to load connection list.');
  }

  AppState.tables.popupTable = null;
  document.getElementById('popup-spec-table').innerHTML = '';
  new bootstrap.Modal(document.getElementById('spec-select-popup')).show();
}

export async function loadSpecList(connectionName) {
  if (!connectionName) return;
  try {
    const data = await specApi().lookupList(connectionName);
    const items = data?.vmSpec || [];
    if (AppState.tables.popupTable) {
      AppState.tables.popupTable.replaceData(items);
    } else {
      AppState.tables.popupTable = new Tabulator('#popup-spec-table', {
        data: items,
        layout: 'fitColumns',
        placeholder: 'No specs found.',
        pagination: 'local',
        paginationSize: 10,
        columns: [
          { title: 'Name', field: 'IId.NameId', sorter: 'string' },
          { title: 'vCPU', field: 'NumvCPU', hozAlign: 'center', sorter: 'number' },
          { title: 'Memory (GiB)', field: 'MemGiB', hozAlign: 'center', sorter: 'number' },
        ],
      });
      AppState.tables.popupTable.on('rowClick', function (_e, row) {
        const d = row.getData();
        document.getElementById('modal-specName').value = d.IId?.NameId || '';
        document.getElementById('modal-cspSpecName').value = d.IId?.NameId || '';
        document.getElementById('modal-connectionName').value = connectionName;
        bootstrap.Modal.getInstance(document.getElementById('spec-select-popup'))?.hide();
      });
    }
  } catch (err) {
    console.error('Failed to load spec list from CSP', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to load specs from CSP.');
  }
}

export async function submitRegisterSpec() {
  const specName = document.getElementById('modal-specName').value.trim();
  const cspSpecName = document.getElementById('modal-cspSpecName').value.trim();
  const connectionName = document.getElementById('modal-connectionName').value.trim();

  if (!specName || !cspSpecName) {
    showToast(TOAST_TYPES.WARNING, 'Spec Name and CSP Spec Name are required.');
    return;
  }

  try {
    await specApi().register(SYSTEM_NS, { name: specName, cspSpecName, connectionName });
    showToast(TOAST_TYPES.SUCCESS, `Spec "${specName}" registered successfully`);
    bootstrap.Modal.getInstance(document.getElementById('create-spec-modal'))?.hide();
    await refreshSpecList();
  } catch (err) {
    console.error('Spec register failed:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to register spec: ' + (err?.response?.data?.message || err.message));
  }
}

document.getElementById('popup-connection')?.addEventListener('change', function () {
  loadSpecList(this.value);
});

// ─── webconsolejs 등록 ────────────────────────────────────────────────────
if (typeof webconsolejs === 'undefined') { window.webconsolejs = {}; }
webconsolejs[PAGE_KEY] = {
  refreshSpecList,
  hideDetail,
  confirmDeleteSpec,
  openSpecSelectPopup,
  loadSpecList,
  submitRegisterSpec,
};
