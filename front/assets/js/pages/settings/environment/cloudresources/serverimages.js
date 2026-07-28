// Server Image 관리 — system namespace 고정 (프로젝트 NsId 사용 금지)
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { showToast, TOAST_TYPES } from '../../../../common/utils/toast.js';

const SYSTEM_NS = 'system';
const PAGE_KEY = 'pages/settings/environment/cloudresources/serverimages';
const imageApi = () => webconsolejs['common/api/services/serverimage_api'];

const AppState = {
  tables: { resourceTable: null, popupTable: null },
  resources: { selected: null },
};

// ─── 페이지 초기화 ────────────────────────────────────────────────────────

$('#select-current-project').on('change', async function () {
  if (this.value === '') return;
  hideDetail();
  await refreshImageList();
});

document.addEventListener('DOMContentLoaded', async function () {
  const btnList = document.getElementById('page-header-btn-list');
  if (btnList) {
    btnList.innerHTML = `
      <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#create-image-modal">
        Register Image
      </button>`;
  }

  const selectedWorkspaceProject = await webconsolejs['partials/layout/navbar'].workspaceProjectInit();
  webconsolejs['partials/layout/modal'].checkWorkspaceSelection(selectedWorkspaceProject);

  updateNamespaceLabel();
  initFilter();

  if (selectedWorkspaceProject.projectId !== '') {
    await refreshImageList();
  }
});

function updateNamespaceLabel() {
  const label = document.getElementById('serverimages-context-label');
  if (label) label.textContent = `Namespace: ${SYSTEM_NS}`;
}

// ─── Image 목록 ───────────────────────────────────────────────────────────

export async function refreshImageList() {
  try {
    const data = await imageApi().list(SYSTEM_NS);
    const items = data?.image || [];
    if (AppState.tables.resourceTable) {
      AppState.tables.resourceTable.replaceData(items);
    } else {
      initTable(items);
    }
  } catch (err) {
    if (err?.response?.status !== 404) console.error('Failed to load images', err);
    const items = [];
    if (AppState.tables.resourceTable) {
      AppState.tables.resourceTable.replaceData(items);
    } else {
      initTable(items);
    }
  }
}

function initTable(data) {
  AppState.tables.resourceTable = new Tabulator('#image-table', {
    data,
    layout: 'fitColumns',
    placeholder: 'No images found.',
    pagination: 'local',
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 50],
    paginationCounter: 'rows',
    movableColumns: true,
    initialSort: [{ column: 'name', dir: 'asc' }],
    columns: [
      { title: 'Image Name', field: 'name', widthGrow: 2, sorter: 'string' },
      { title: 'OS Type', field: 'osType', widthGrow: 1, sorter: 'string' },
      { title: 'Architecture', field: 'architecture', hozAlign: 'center', width: 120, sorter: 'string' },
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
  document.getElementById('detail-imageName').textContent = data.name || '-';
  document.getElementById('detail-osType').textContent = data.osType || '-';
  document.getElementById('detail-architecture').textContent = data.architecture || '-';
  document.getElementById('detail-cspImageId').textContent = data.cspImageId || '-';
  document.getElementById('detail-ns').textContent = SYSTEM_NS;
}

function showDetail() {
  document.getElementById('view-mode-cards')?.classList.add('show');
}

export function hideDetail() {
  document.getElementById('view-mode-cards')?.classList.remove('show');
  AppState.resources.selected = null;
}

export async function confirmDeleteImage() {
  const item = AppState.resources.selected;
  if (!item || !confirm(`Delete image "${item.name}"?`)) return;
  try {
    await imageApi().del(SYSTEM_NS, item.name);
    showToast(TOAST_TYPES.SUCCESS, `Image "${item.name}" deleted successfully`);
    hideDetail();
    await refreshImageList();
  } catch (err) {
    console.error('Image delete failed:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to delete image: ' + (err?.response?.data?.message || err.message));
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

document.getElementById('create-image-modal')?.addEventListener('show.bs.modal', function () {
  document.getElementById('modal-imageName').value = '';
  document.getElementById('modal-cspImageName').value = '';
  document.getElementById('modal-connectionName').value = '';
});

export async function openImageSelectPopup() {
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
  document.getElementById('popup-image-table').innerHTML = '';
  new bootstrap.Modal(document.getElementById('image-select-popup')).show();
}

export async function loadImageList(connectionName) {
  if (!connectionName) return;
  try {
    const data = await imageApi().lookupList(connectionName);
    const items = data?.image || [];
    if (AppState.tables.popupTable) {
      AppState.tables.popupTable.replaceData(items);
    } else {
      AppState.tables.popupTable = new Tabulator('#popup-image-table', {
        data: items,
        layout: 'fitColumns',
        placeholder: 'No images found.',
        pagination: 'local',
        paginationSize: 10,
        columns: [
          { title: 'Name', field: 'IId.NameId', sorter: 'string' },
          { title: 'CspImageId', field: 'CspImageId', sorter: 'string' },
          { title: 'OS', field: 'GuestOS', sorter: 'string' },
        ],
      });
      AppState.tables.popupTable.on('rowClick', function (_e, row) {
        const d = row.getData();
        document.getElementById('modal-imageName').value = d.IId?.NameId || '';
        document.getElementById('modal-cspImageName').value = d.CspImageId || '';
        document.getElementById('modal-connectionName').value = connectionName;
        bootstrap.Modal.getInstance(document.getElementById('image-select-popup'))?.hide();
      });
    }
  } catch (err) {
    console.error('Failed to load image list from CSP', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to load images from CSP.');
  }
}

export async function submitRegisterImage() {
  const imageName = document.getElementById('modal-imageName').value.trim();
  const cspImageName = document.getElementById('modal-cspImageName').value.trim();
  const connectionName = document.getElementById('modal-connectionName').value.trim();

  if (!imageName || !cspImageName) {
    showToast(TOAST_TYPES.WARNING, 'Image Name and CSP Image Name are required.');
    return;
  }

  try {
    await imageApi().register(SYSTEM_NS, { name: imageName, cspImageName, connectionName });
    showToast(TOAST_TYPES.SUCCESS, `Image "${imageName}" registered successfully`);
    bootstrap.Modal.getInstance(document.getElementById('create-image-modal'))?.hide();
    await refreshImageList();
  } catch (err) {
    console.error('Image register failed:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to register image: ' + (err?.response?.data?.message || err.message));
  }
}

document.getElementById('popup-connection')?.addEventListener('change', function () {
  loadImageList(this.value);
});

// ─── webconsolejs 등록 ────────────────────────────────────────────────────
if (typeof webconsolejs === 'undefined') { window.webconsolejs = {}; }
webconsolejs[PAGE_KEY] = {
  refreshImageList,
  hideDetail,
  confirmDeleteImage,
  openImageSelectPopup,
  loadImageList,
  submitRegisterImage,
};
