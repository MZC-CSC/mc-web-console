// NLB 관리 페이지 — infra(MCI) 하위 NLB 목록/상세/생성/삭제/헬스체크
// BAR-1573 / Cloud Resources 하위 고정

import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { showToast, TOAST_TYPES } from '../../../../common/utils/toast.js';
import { getProvider, getRegion, populateProviderFilterOptions, populateRegionFilterOptions } from '../../../../common/utils/cspResource.js';

const nlbApi = () => webconsolejs['common/api/services/nlb_api'];
const mciApi = () => webconsolejs['common/api/services/mci_api'];

const AppState = {
  ns: '',
  tables: { nlbTable: null },
  resources: { selected: null, all: [] },
  ui: { viewMode: false },
};

// ─── 페이지 초기화 ────────────────────────────────────────────────────────

$('#select-current-project').on('change', async function () {
  if (this.value === '') return;
  const project = webconsolejs['common/api/services/workspace_api'].getCurrentProject();
  AppState.ns = project?.NsId || '';
  hideDetail();
  if (AppState.tables.nlbTable) AppState.tables.nlbTable.replaceData([]);
  if (AppState.ns) await loadNlbList();
});

document.addEventListener('DOMContentLoaded', async function () {
  const btnList = document.getElementById('page-header-btn-list');
  if (btnList) {
    btnList.innerHTML = `
      <button type="button" class="btn btn-primary"
        onclick="webconsolejs['pages/settings/environment/cloudresources/nlbs'].openCreateNlbModal()">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24"
          viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
          stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 5l0 14"/><path d="M5 12l14 0"/>
        </svg>
        Create NLB
      </button>`;
  }

  const selectedWorkspaceProject = await webconsolejs['partials/layout/navbar'].workspaceProjectInit();
  webconsolejs['partials/layout/modal'].checkWorkspaceSelection(selectedWorkspaceProject);

  AppState.ns = selectedWorkspaceProject.nsId || '';
  initFilter();
  initTable([]);

  if (selectedWorkspaceProject.projectId !== '') {
    await loadNlbList();
  }
});

// ─── Infra(MCI) 목록 ──────────────────────────────────────────────────────

async function getInfraList() {
  if (!AppState.ns) return [];
  try {
    const data = await mciApi().getMciList(AppState.ns);
    const infras = data?.infra || (Array.isArray(data) ? data : []);
    return infras.map((infra) => infra.id || infra.name).filter(Boolean);
  } catch (err) {
    console.error('Infra 목록 조회 실패:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to load Infra list.');
    return [];
  }
}

// ─── NLB 목록 로드 ────────────────────────────────────────────────────────
// Infra는 NLB 조회 API(nsId+infraId 필요)의 필수 경로 파라미터라 목록 화면
// 자체를 특정 Infra 선택으로 가둘 수 없다. 대신 namespace의 전체 Infra
// 목록을 먼저 조회한 뒤, Infra별로 NLB를 조회해 하나의 테이블에 합친다.

export async function loadNlbList() {
  if (!AppState.ns) return;
  const infraIds = await getInfraList();
  if (infraIds.length === 0) {
    AppState.resources.all = [];
    if (AppState.tables.nlbTable) AppState.tables.nlbTable.replaceData([]);
    return;
  }
  try {
    const results = await Promise.allSettled(
      infraIds.map((infraId) => nlbApi().getAllNLB(AppState.ns, infraId))
    );
    const items = [];
    results.forEach((result, idx) => {
      if (result.status !== 'fulfilled') return;
      const rawItems = result.value?.nlb || (Array.isArray(result.value) ? result.value : []);
      for (const v of rawItems) {
        items.push({ ...v, _infraId: infraIds[idx], _provider: getProvider(v), _region: getRegion(v) });
      }
    });
    AppState.resources.all = items;
    populateProviderFilterOptions(items, 'filter-provider');
    populateRegionFilterOptions(items, 'filter-provider', 'filter-region');
    if (AppState.tables.nlbTable) {
      AppState.tables.nlbTable.replaceData(items);
    } else {
      initTable(items);
    }
  } catch (err) {
    console.error('NLB 목록 조회 실패:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to load NLB list.');
  }
}

function nlbId(data) {
  return data?.id || data?.name;
}

// ─── Tabulator 테이블 ─────────────────────────────────────────────────────

function initTable(items) {
  AppState.tables.nlbTable = new Tabulator('#nlb-list-table', {
    data: items,
    layout: 'fitColumns',
    placeholder: 'No NLBs. Create one to get started.',
    pagination: 'local',
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 50],
    paginationCounter: 'rows',
    movableColumns: true,
    selectableRows: true,
    initialSort: [{ column: 'id', dir: 'asc' }],
    columns: [
      { formatter: 'rowSelection', titleFormatter: 'rowSelection', headerSort: false, hozAlign: 'center', width: 40 },
      { title: 'Id', field: 'id', widthGrow: 2, sorter: 'string' },
      { title: 'Infra', field: '_infraId', widthGrow: 1, sorter: 'string' },
      { title: 'Provider', field: '_provider', widthGrow: 1, sorter: 'string' },
      { title: 'Region', field: '_region', widthGrow: 1, sorter: 'string' },
      { title: 'Type', field: 'type', width: 100 },
      { title: 'Scope', field: 'scope', width: 100 },
      {
        title: 'Listener',
        field: 'listener',
        widthGrow: 1,
        formatter: (cell) => {
          const l = cell.getValue();
          return l ? `${l.protocol || ''}:${l.port || ''}` : '-';
        },
      },
      {
        title: 'Target NodeGroup',
        field: 'targetGroup',
        widthGrow: 1,
        formatter: (cell) => cell.getValue()?.subGroupId || '-',
      },
      {
        title: 'DNS Name',
        field: 'listener',
        widthGrow: 2,
        formatter: (cell) => {
          const l = cell.getValue();
          return l?.dnsName || l?.ip || '-';
        },
      },
    ],
  });

  AppState.tables.nlbTable.on('rowClick', async function (e, row) {
    const data = row.getData();
    AppState.resources.selected = data;
    renderDetail(data);
    showDetail();
    try {
      const detail = await nlbApi().getNLB(AppState.ns, data._infraId, nlbId(data));
      if (detail) {
        AppState.resources.selected = { ...detail, _infraId: data._infraId };
        renderDetail(AppState.resources.selected);
      }
    } catch (err) {
      console.error('NLB 상세 조회 실패:', err);
    }
  });
}

// ─── Detail Panel ─────────────────────────────────────────────────────────

function renderDetail(data) {
  const listener = data.listener || {};
  const target = data.targetGroup || {};
  const hc = data.healthChecker || {};
  document.getElementById('detail-name').textContent = nlbId(data) || '-';
  document.getElementById('detail-nlb-id').textContent = nlbId(data) || '-';
  document.getElementById('detail-nlb-infra').textContent = data._infraId || '-';
  document.getElementById('detail-nlb-provider').textContent = getProvider(data);
  document.getElementById('detail-nlb-region').textContent = getRegion(data);
  document.getElementById('detail-nlb-type').textContent = data.type || '-';
  document.getElementById('detail-nlb-scope').textContent = data.scope || '-';
  document.getElementById('detail-nlb-listener').textContent =
    listener.protocol || listener.port ? `${listener.protocol || ''}:${listener.port || ''}` : '-';
  document.getElementById('detail-nlb-endpoint').textContent =
    listener.dnsName || listener.ip || '-';
  document.getElementById('detail-nlb-nodegroup').textContent = target.subGroupId || '-';
  document.getElementById('detail-nlb-target-port').textContent = target.port || '-';
  document.getElementById('detail-nlb-healthchecker').textContent =
    hc.protocol || hc.port ? `${hc.protocol || ''}:${hc.port || ''} (interval ${hc.interval || '-'}, threshold ${hc.threshold || '-'})` : '-';
  document.getElementById('detail-nlb-csp-id').textContent = data.cspResourceId || '-';
  document.getElementById('detail-nlb-description').textContent = data.description || '-';
  document.getElementById('detail-nlb-health').textContent = '-';
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

// ─── Health Check ─────────────────────────────────────────────────────────

export async function checkNlbHealth() {
  const selected = AppState.resources.selected;
  if (!selected) return;
  const el = document.getElementById('detail-nlb-health');
  el.textContent = 'checking...';
  try {
    const data = await nlbApi().getNLBHealth(AppState.ns, selected._infraId, nlbId(selected));
    const hz = data?.healthz || data || {};
    const all = hz.allVMs || [];
    const healthy = hz.healthyVMs || [];
    const unhealthy = hz.unHealthyVMs || hz.unhealthyVMs || [];
    el.textContent = `healthy ${healthy.length} / unhealthy ${unhealthy.length} / total ${all.length}`;
    showToast(TOAST_TYPES.SUCCESS, 'NLB health check completed');
  } catch (err) {
    console.error('NLB 헬스체크 실패:', err);
    el.textContent = 'check failed';
    showToast(TOAST_TYPES.ERROR, 'Failed to check NLB health: ' + (err.message || ''));
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────

export function confirmDeleteNlb() {
  const selected = AppState.resources.selected;
  if (!selected) return;
  const id = nlbId(selected);
  webconsolejs['partials/layout/modal'].commonConfirmModal(
    'commonDefaultModal',
    'Delete NLB',
    `NLB "${id}" — confirm delete?`,
    'pages/settings/environment/cloudresources/nlbs.executeDeleteNlb'
  );
}

export async function executeDeleteNlb() {
  const selected = AppState.resources.selected;
  if (!selected) return;
  const id = nlbId(selected);
  try {
    await nlbApi().delNLB(AppState.ns, selected._infraId, id);
    showToast(TOAST_TYPES.SUCCESS, `NLB "${id}" deleted successfully`);
    hideDetail();
    await loadNlbList();
  } catch (err) {
    console.error('NLB 삭제 실패:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to delete NLB: ' + (err.message || ''));
  }
}

// ─── 다중선택 삭제 ───────────────────────────────────────────────────────

export function confirmBulkDelete() {
  const table = AppState.tables.nlbTable;
  const selected = table ? table.getSelectedData() : [];
  if (selected.length === 0) {
    webconsolejs['partials/layout/modal'].commonShowDefaultModal(
      'Nothing Selected',
      'Please select at least one item to delete.'
    );
    return;
  }
  AppState.resources.bulkSelected = selected;
  webconsolejs['partials/layout/modal'].commonConfirmModal(
    'commonDefaultModal',
    'Delete Selected',
    `Delete ${selected.length} selected NLB(s)?`,
    'pages/settings/environment/cloudresources/nlbs.executeBulkDelete'
  );
}

export async function executeBulkDelete() {
  const items = AppState.resources.bulkSelected || [];
  if (items.length === 0) return;
  const results = await Promise.allSettled(
    items.map((item) => nlbApi().delNLB(AppState.ns, item._infraId, nlbId(item)))
  );
  const failed = results.filter((r) => r.status === 'rejected').length;
  const succeeded = results.length - failed;
  showToast(
    failed > 0 ? TOAST_TYPES.WARNING : TOAST_TYPES.SUCCESS,
    `${succeeded} NLB(s) deleted${failed > 0 ? `, ${failed} failed` : ''}`
  );
  AppState.resources.bulkSelected = [];
  AppState.tables.nlbTable?.deselectRow();
  hideDetail();
  await loadNlbList();
}

// ─── Filter ───────────────────────────────────────────────────────────────

function initFilter() {
  const providerEl = document.getElementById('filter-provider');
  const regionEl = document.getElementById('filter-region');
  const fieldEl = document.getElementById('filter-field');
  const typeEl = document.getElementById('filter-type');
  const valueEl = document.getElementById('filter-value');
  if (!fieldEl || !typeEl || !valueEl) return;

  function updateFilter() {
    if (!AppState.tables.nlbTable) return;
    const filters = [];
    if (providerEl?.value) filters.push({ field: '_provider', type: '=', value: providerEl.value });
    if (regionEl?.value) filters.push({ field: '_region', type: '=', value: regionEl.value });
    if (fieldEl.value) filters.push({ field: fieldEl.value, type: typeEl.value, value: valueEl.value });
    if (filters.length > 0) {
      AppState.tables.nlbTable.setFilter(filters);
    } else {
      AppState.tables.nlbTable.clearFilter();
    }
  }

  providerEl?.addEventListener('change', function () {
    populateRegionFilterOptions(AppState.resources.all, 'filter-provider', 'filter-region');
    updateFilter();
  });
  regionEl?.addEventListener('change', updateFilter);
  fieldEl.addEventListener('change', updateFilter);
  typeEl.addEventListener('change', updateFilter);
  valueEl.addEventListener('keyup', updateFilter);

  document.getElementById('filter-clear').addEventListener('click', function () {
    if (providerEl) providerEl.value = '';
    if (regionEl) regionEl.value = '';
    fieldEl.value = '';
    typeEl.value = 'like';
    valueEl.value = '';
    if (AppState.tables.nlbTable) AppState.tables.nlbTable.clearFilter();
  });
}

// ─── Create NLB 모달 ──────────────────────────────────────────────────────

export async function openCreateNlbModal() {
  if (!AppState.ns) {
    showToast(TOAST_TYPES.WARNING, 'Please select a project first.');
    return;
  }
  document.getElementById('create-nlb-listener-port').value = '80';
  document.getElementById('create-nlb-target-port').value = '80';
  document.getElementById('create-nlb-protocol').value = 'TCP';
  document.getElementById('create-nlb-description').value = '';
  await _loadCreateInfraOptions();
  new bootstrap.Modal(document.getElementById('create-nlb-modal')).show();
}

async function _loadCreateInfraOptions() {
  const select = document.getElementById('create-nlb-infra');
  select.innerHTML = '<option value="">Select</option>';
  const infraIds = await getInfraList();
  for (const id of infraIds) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = id;
    select.appendChild(opt);
  }
  if (infraIds.length === 1) select.value = infraIds[0];
  await _loadNodeGroupOptions(select.value);
}

document.getElementById('create-nlb-infra')?.addEventListener('change', function () {
  _loadNodeGroupOptions(this.value);
});

async function _loadNodeGroupOptions(infraId) {
  const select = document.getElementById('create-nlb-nodegroup');
  select.innerHTML = '<option value="">Select</option>';
  if (!infraId) return;
  try {
    const data = await nlbApi().getInfraNodeGroupIds(AppState.ns, infraId);
    const ids = data?.output || data?.subGroup || (Array.isArray(data) ? data : []);
    for (const id of ids) {
      const opt = document.createElement('option');
      opt.value = typeof id === 'string' ? id : id?.id;
      opt.textContent = opt.value;
      select.appendChild(opt);
    }
  } catch (err) {
    console.error('NodeGroup 목록 조회 실패:', err);
  }
}

export async function executeCreateNlb() {
  const infraId = document.getElementById('create-nlb-infra').value;
  const subGroupId = document.getElementById('create-nlb-nodegroup').value;
  const listenerPort = document.getElementById('create-nlb-listener-port').value.trim();
  const targetPort = document.getElementById('create-nlb-target-port').value.trim();
  const protocol = document.getElementById('create-nlb-protocol').value;
  const description = document.getElementById('create-nlb-description').value.trim();

  if (!infraId || !subGroupId || !listenerPort || !targetPort) {
    showToast(TOAST_TYPES.WARNING, 'Infra, Target NodeGroup, listener port, and target port are required.');
    return;
  }

  const spinner = document.getElementById('create-nlb-spinner');
  const btn = document.getElementById('create-nlb-execute-btn');
  spinner.classList.remove('d-none');
  btn.disabled = true;

  const body = {
    type: 'PUBLIC',
    scope: 'REGION',
    listener: { protocol, port: String(listenerPort) },
    targetGroup: { protocol, port: String(targetPort), subGroupId },
    healthChecker: {
      protocol,
      port: String(targetPort),
      interval: 'default',
      timeout: 'default',
      threshold: 'default',
    },
  };
  if (description) body.description = description;

  try {
    await nlbApi().postNLB(AppState.ns, infraId, body);
    showToast(TOAST_TYPES.SUCCESS, `NLB for "${subGroupId}" created successfully`);
    bootstrap.Modal.getInstance(document.getElementById('create-nlb-modal'))?.hide();
    await loadNlbList();
  } catch (err) {
    console.error('NLB 생성 실패:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to create NLB: ' + (err.message || ''));
  } finally {
    spinner.classList.add('d-none');
    btn.disabled = false;
  }
}

// ─── webconsolejs 등록 ────────────────────────────────────────────────────
if (typeof webconsolejs === 'undefined') { window.webconsolejs = {}; }
webconsolejs['pages/settings/environment/cloudresources/nlbs'] = {
  loadNlbList,
  hideDetail,
  checkNlbHealth,
  confirmDeleteNlb,
  executeDeleteNlb,
  confirmBulkDelete,
  executeBulkDelete,
  openCreateNlbModal,
  executeCreateNlb,
};
