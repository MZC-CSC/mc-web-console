// Data Disk 관리 페이지 — CRUD + Import
// FR-CLOUD-ADMIN-003 / RQ-CLOUD-ADMIN-007

import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { showToast, TOAST_TYPES } from '../../../../common/utils/toast.js';

const diskApi = () => webconsolejs['common/api/services/disk_api'];
const importApi = () => webconsolejs['common/api/services/import_api'];

const AppState = {
  ns: '',
  tables: { diskTable: null },
  resources: { selected: null },
  ui: { viewMode: false },
  connections: [],
};

// ─── 페이지 초기화 ────────────────────────────────────────────────────────

$('#select-current-project').on('change', async function () {
  if (this.value === '') return;
  const project = webconsolejs['common/api/services/workspace_api'].getCurrentProject();
  AppState.ns = project?.NsId || '';
  if (AppState.ns) await loadDiskList();
});

document.addEventListener('DOMContentLoaded', async function () {
  const btnList = document.getElementById('page-header-btn-list');
  if (btnList) {
    btnList.innerHTML = `
      <button type="button" class="btn btn-primary"
        data-bs-toggle="modal" data-bs-target="#create-disk-modal">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24"
          viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
          stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 5l0 14"/><path d="M5 12l14 0"/>
        </svg>
        Create Data Disk
      </button>`;
  }

  const selectedWorkspaceProject = await webconsolejs['partials/layout/navbar'].workspaceProjectInit();
  webconsolejs['partials/layout/modal'].checkWorkspaceSelection(selectedWorkspaceProject);

  AppState.ns = selectedWorkspaceProject.nsId || '';
  initFilter();

  if (selectedWorkspaceProject.projectId !== '') {
    await loadDiskList();
  }
});

// ─── Data Disk 목록 로드 ──────────────────────────────────────────────────

export async function loadDiskList() {
  if (!AppState.ns) return;
  try {
    const data = await diskApi().getAllDataDisk(AppState.ns);
    const items = data?.dataDisk || (Array.isArray(data) ? data : []);
    if (AppState.tables.diskTable) {
      AppState.tables.diskTable.replaceData(items);
    } else {
      initTable(items);
    }
  } catch (err) {
    console.error('Data Disk 목록 조회 실패:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to load Data Disk list.');
  }
}

function diskId(data) {
  return data?.id || data?.name;
}

// API 프록시는 백엔드(CSP SDK) 에러 메시지를 {responseData:{message},status:{...}} 로 감싼다.
// 축소된 axios 기본 메시지("Request failed with status code 500") 대신 실제 원인을 보여준다.
function extractErrorMessage(err) {
  return err?.response?.data?.responseData?.message || err?.message || String(err);
}

// ─── Tabulator 테이블 ─────────────────────────────────────────────────────

function initTable(items) {
  AppState.tables.diskTable = new Tabulator('#disk-list-table', {
    data: items,
    layout: 'fitColumns',
    placeholder: 'No registered Data Disks.',
    pagination: 'local',
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 50],
    paginationCounter: 'rows',
    movableColumns: true,
    initialSort: [{ column: 'name', dir: 'asc' }],
    columns: [
      { title: 'Name', field: 'name', widthGrow: 2, sorter: 'string' },
      { title: 'Connection', field: 'connectionName', widthGrow: 1, sorter: 'string' },
      { title: 'Disk Type', field: 'diskType', widthGrow: 1 },
      {
        title: 'Size (GB)',
        field: 'diskSize',
        hozAlign: 'right',
        width: 100,
        sorter: 'number',
      },
      { title: 'Status', field: 'status', widthGrow: 1 },
      { title: 'CSP Resource ID', field: 'cspResourceId', widthGrow: 2 },
    ],
  });

  AppState.tables.diskTable.on('rowClick', async function (e, row) {
    const data = row.getData();
    AppState.resources.selected = data;
    renderDetail(data);
    showDetail();
    try {
      const detail = await diskApi().getDataDisk(AppState.ns, diskId(data));
      if (detail) {
        AppState.resources.selected = detail;
        renderDetail(detail);
      }
    } catch (err) {
      console.error('Data Disk 상세 조회 실패:', err);
    }
  });
}

// ─── Detail Panel ─────────────────────────────────────────────────────────

function renderDetail(data) {
  document.getElementById('detail-name').textContent = data.name || '-';
  document.getElementById('detail-disk-name').textContent = data.name || '-';
  document.getElementById('detail-disk-connection').textContent = data.connectionName || '-';
  document.getElementById('detail-disk-type').textContent = data.diskType || '-';
  document.getElementById('detail-disk-size').textContent =
    data.diskSize != null ? String(data.diskSize) : '-';
  document.getElementById('detail-disk-status').textContent = data.status || '-';
  document.getElementById('detail-disk-csp-id').textContent = data.cspResourceId || '-';
  document.getElementById('detail-disk-description').textContent = data.description || '-';
}

function showDetail() {
  const el = document.getElementById('view-mode-cards');
  if (el) el.classList.add('show');
  AppState.ui.viewMode = true;
}

export function hideDetail() {
  document.getElementById('view-mode-cards')?.classList.remove('show');
  AppState.ui.viewMode = false;
  AppState.resources.selected = null;
}

export function confirmDeleteDisk() {
  const selected = AppState.resources.selected;
  if (!selected) return;
  webconsolejs['partials/layout/modal'].commonConfirmModal(
    'commonDefaultModal',
    'Delete Data Disk',
    `Data Disk "${selected.name}" — confirm delete?`,
    'pages/settings/environment/cloudresources/disks.executeDeleteDisk'
  );
}

export async function executeDeleteDisk() {
  const selected = AppState.resources.selected;
  if (!selected) return;
  const id = diskId(selected);
  try {
    await diskApi().delDataDisk(AppState.ns, id);
    showToast(TOAST_TYPES.SUCCESS, `Data Disk "${selected.name}" deleted successfully`);
    hideDetail();
    await loadDiskList();
  } catch (err) {
    console.error('Data Disk 삭제 실패:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to delete Data Disk: ' + extractErrorMessage(err));
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
    if (field && AppState.tables.diskTable) {
      AppState.tables.diskTable.setFilter(field, type, valueEl.value);
    }
  }

  fieldEl.addEventListener('change', updateFilter);
  typeEl.addEventListener('change', updateFilter);
  valueEl.addEventListener('keyup', updateFilter);

  document.getElementById('filter-clear').addEventListener('click', function () {
    fieldEl.value = '';
    typeEl.value = 'like';
    valueEl.value = '';
    if (AppState.tables.diskTable) AppState.tables.diskTable.clearFilter();
  });
}

// ─── Create Data Disk 모달 ─────────────────────────────────────────────────

document.getElementById('create-disk-modal')?.addEventListener('show.bs.modal', async function () {
  document.getElementById('create-disk-name').value = '';
  document.getElementById('create-disk-size').value = '';
  document.getElementById('create-disk-description').value = '';
  document.getElementById('create-disk-type').innerHTML = '<option value="">Select (optional)</option>';
  await _loadConnectionOptions('create-disk-connection');
});

document.getElementById('create-disk-connection')?.addEventListener('change', async function () {
  await _loadDiskTypeOptions(this.value);
});

export async function executeCreateDisk() {
  const connectionName = document.getElementById('create-disk-connection').value;
  const name = document.getElementById('create-disk-name').value.trim();
  const diskType = document.getElementById('create-disk-type').value.trim();
  const diskSize = parseInt(document.getElementById('create-disk-size').value, 10);
  const description = document.getElementById('create-disk-description').value.trim();

  if (!connectionName || !name || !diskSize) {
    showToast(TOAST_TYPES.WARNING, 'Connection, disk name, and size are required.');
    return;
  }

  const spinner = document.getElementById('create-disk-spinner');
  const btn = document.getElementById('create-disk-execute-btn');
  spinner.classList.remove('d-none');
  btn.disabled = true;

  const body = { connectionName, name, diskSize };
  if (diskType) body.diskType = diskType;
  if (description) body.description = description;

  try {
    await diskApi().postDataDisk(AppState.ns, body);
    showToast(TOAST_TYPES.SUCCESS, `Data Disk "${name}" created successfully`);
    bootstrap.Modal.getInstance(document.getElementById('create-disk-modal'))?.hide();
    await loadDiskList();
  } catch (err) {
    console.error('Data Disk 생성 실패:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to create Data Disk: ' + extractErrorMessage(err));
  } finally {
    spinner.classList.add('d-none');
    btn.disabled = false;
  }
}

async function _loadDiskTypeOptions(connectionName) {
  const select = document.getElementById('create-disk-type');
  select.innerHTML = '<option value="">Select (optional)</option>';
  if (!connectionName) return;

  const conn = AppState.connections.find((c) => c.configName === connectionName);
  const provider = conn?.providerName;
  if (!provider) return;

  try {
    const lookup = await diskApi().getCommonLookupDiskInfo(provider, connectionName);
    const providerId = provider.toUpperCase();
    const match = (lookup || []).find((item) => item.providerId === providerId);
    const diskTypes = match?.disksize || match?.rootdisktype || [];
    for (const type of diskTypes) {
      const typeName = String(type).split('|')[0];
      const opt = document.createElement('option');
      opt.value = typeName;
      opt.textContent = type;
      select.appendChild(opt);
    }
  } catch (err) {
    console.error('Disk type lookup 실패:', err);
  }
}

// ─── Import Data Disk 모달 ────────────────────────────────────────────────

export async function openImportDiskModal() {
  AppState.ns = webconsolejs['common/api/services/workspace_api'].getCurrentProject()?.NsId || '';
  if (!AppState.ns) {
    showToast(TOAST_TYPES.WARNING, 'Please select a project first.');
    return;
  }
  document.getElementById('import-disk-project').value = AppState.ns;
  await _loadConnectionOptions('import-disk-connection');
  new bootstrap.Modal(document.getElementById('import-disk-modal')).show();
}

export async function executeImportDisk() {
  const connectionName = document.getElementById('import-disk-connection').value;
  if (!connectionName) {
    showToast(TOAST_TYPES.WARNING, 'Please select a Connection.');
    return;
  }

  const spinner = document.getElementById('import-disk-spinner');
  const btn = document.getElementById('import-disk-execute-btn');
  spinner.classList.remove('d-none');
  btn.disabled = true;

  try {
    const result = await importApi().registerCspResources(['dataDisk'], connectionName, AppState.ns);
    const count = result?.registerationOverview?.dataDisk || 0;
    const failed = result?.registerationOverview?.failed || 0;
    showToast(
      failed > 0 ? TOAST_TYPES.WARNING : TOAST_TYPES.SUCCESS,
      `DataDisk ${count} registered successfully${failed > 0 ? `, ${failed} failed` : ''}`
    );
    bootstrap.Modal.getInstance(document.getElementById('import-disk-modal'))?.hide();
    await loadDiskList();
  } catch (err) {
    showToast(TOAST_TYPES.ERROR, 'DataDisk import failed: ' + extractErrorMessage(err));
  } finally {
    spinner.classList.add('d-none');
    btn.disabled = false;
  }
}

async function _loadConnectionOptions(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Select</option>';
  try {
    const result = await webconsolejs['common/api/http'].commonAPIPost(
      '/api/mc-infra-manager/GetConnConfigList',
      {}
    );
    AppState.connections = result?.data?.responseData?.connectionconfig || [];
    for (const conn of AppState.connections) {
      const opt = document.createElement('option');
      opt.value = conn.configName;
      opt.textContent = conn.configName;
      select.appendChild(opt);
    }
  } catch (err) {
    console.error('Connection 목록 로드 실패:', err);
  }
}

// ─── webconsolejs 등록 ────────────────────────────────────────────────────
if (typeof webconsolejs === 'undefined') { window.webconsolejs = {}; }
webconsolejs['pages/settings/environment/cloudresources/disks'] = {
  loadDiskList,
  hideDetail,
  confirmDeleteDisk,
  executeDeleteDisk,
  executeCreateDisk,
  openImportDiskModal,
  executeImportDisk,
};
