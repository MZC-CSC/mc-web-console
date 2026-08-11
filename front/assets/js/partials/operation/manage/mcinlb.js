// Infra Workloads 화면의 "NLB" 탭 — nlbs.js(standalone NLB 화면)의 축소판.
// Infra가 이미 window.currentMciId로 고정되어 있어 다중 infra 집계/Infra 선택이 필요 없다.

import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { showToast, TOAST_TYPES } from '../../../common/utils/toast.js';
import { getProvider, getRegion, populateProviderFilterOptions, populateRegionFilterOptions } from '../../../common/utils/cspResource.js';

const nlbApi = () => webconsolejs['common/api/services/nlb_api'];

const AppState = {
  tables: { nlbTable: null },
  resources: { selected: null, all: [] },
  loadedForMciId: null,
};

function nlbId(data) {
  return data?.id || data?.name;
}

// ─── NLB 목록 로드 ────────────────────────────────────────────────────────

export async function loadMciNlbList(force) {
  const infraId = window.currentMciId;
  const ns = window.currentNsId;
  if (!infraId || !ns) return;
  if (!force && AppState.loadedForMciId === infraId) return; // 이미 이 MCI로 로드됨 — 재조회 skip

  try {
    const data = await nlbApi().getAllNLB(ns, infraId);
    const items = (data?.nlb || (Array.isArray(data) ? data : [])).map((v) => ({
      ...v,
      _provider: getProvider(v),
      _region: getRegion(v),
    }));
    AppState.resources.all = items;
    AppState.loadedForMciId = infraId;
    populateProviderFilterOptions(items, 'mcinlb-filter-provider');
    populateRegionFilterOptions(items, 'mcinlb-filter-provider', 'mcinlb-filter-region');
    if (AppState.tables.nlbTable) {
      AppState.tables.nlbTable.replaceData(items);
    } else {
      initTable(items);
    }
  } catch (err) {
    console.error('MCI NLB 목록 조회 실패:', err);
    showToast(TOAST_TYPES.ERROR, 'Failed to load NLB list.');
  }
}

// MCI 전환 시 mci.js가 호출 — 캐시를 무효화해 다음에 이 탭을 열 때 새 MCI 기준으로 재조회되게 한다.
export function resetForMciSwitch() {
  AppState.loadedForMciId = null;
  hideDetail();
  if (AppState.tables.nlbTable) AppState.tables.nlbTable.deselectRow();
}

// ─── Tabulator 테이블 ─────────────────────────────────────────────────────

function initTable(items) {
  AppState.tables.nlbTable = new Tabulator('#mcinlb-list-table', {
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
      const detail = await nlbApi().getNLB(window.currentNsId, window.currentMciId, nlbId(data));
      if (detail) {
        AppState.resources.selected = detail;
        renderDetail(detail);
      }
    } catch (err) {
      console.error('MCI NLB 상세 조회 실패:', err);
    }
  });
}

// ─── Detail Panel ─────────────────────────────────────────────────────────

function renderDetail(data) {
  const listener = data.listener || {};
  const target = data.targetGroup || {};
  const hc = data.healthChecker || {};
  document.getElementById('mcinlb-detail-name').textContent = nlbId(data) || '-';
  document.getElementById('mcinlb-detail-nlb-id').textContent = nlbId(data) || '-';
  document.getElementById('mcinlb-detail-nlb-provider').textContent = getProvider(data);
  document.getElementById('mcinlb-detail-nlb-region').textContent = getRegion(data);
  document.getElementById('mcinlb-detail-nlb-type').textContent = data.type || '-';
  document.getElementById('mcinlb-detail-nlb-scope').textContent = data.scope || '-';
  document.getElementById('mcinlb-detail-nlb-listener').textContent =
    listener.protocol || listener.port ? `${listener.protocol || ''}:${listener.port || ''}` : '-';
  document.getElementById('mcinlb-detail-nlb-endpoint').textContent = listener.dnsName || listener.ip || '-';
  document.getElementById('mcinlb-detail-nlb-nodegroup').textContent = target.subGroupId || '-';
  document.getElementById('mcinlb-detail-nlb-target-port').textContent = target.port || '-';
  document.getElementById('mcinlb-detail-nlb-healthchecker').textContent =
    hc.protocol || hc.port ? `${hc.protocol || ''}:${hc.port || ''} (interval ${hc.interval || '-'}, threshold ${hc.threshold || '-'})` : '-';
  document.getElementById('mcinlb-detail-nlb-csp-id').textContent = data.cspResourceId || '-';
  document.getElementById('mcinlb-detail-nlb-description').textContent = data.description || '-';
  document.getElementById('mcinlb-detail-nlb-health').textContent = '-';
}

function showDetail() {
  document.getElementById('mcinlb-detail-cards')?.classList.add('show');
}

export function hideDetail() {
  document.getElementById('mcinlb-detail-cards')?.classList.remove('show');
  AppState.resources.selected = null;
}

// ─── Health Check (목록에서 선택 기반, 결과는 modal로 표시) ──────────────────

export async function checkSelectedMciNlbHealth() {
  const table = AppState.tables.nlbTable;
  const selected = table ? table.getSelectedData() : [];
  if (selected.length === 0) {
    webconsolejs['partials/layout/modal'].commonShowDefaultModal(
      'Nothing Selected',
      'Please select at least one item to check health.'
    );
    return;
  }

  const ns = window.currentNsId;
  const infraId = window.currentMciId;
  const results = await Promise.allSettled(
    selected.map((item) => nlbApi().getNLBHealth(ns, infraId, nlbId(item)))
  );

  const lines = selected.map((item, idx) => {
    const id = nlbId(item);
    const result = results[idx];
    if (result.status !== 'fulfilled') {
      const line = `${id}: check failed (${result.reason?.message || 'error'})`;
      _applyHealthToDetailIfShown(item, line);
      return line;
    }
    const line = `${id}: ${formatHealthSummary(result.value)}`;
    _applyHealthToDetailIfShown(item, formatHealthSummary(result.value));
    return line;
  });

  webconsolejs['partials/layout/modal'].commonShowDefaultModal('NLB Health Check', lines.join('\n'));
}

// GetNLBHealth 실제 응답은 { AllNodes, HealthyNodes, UnHealthyNodes } (PascalCase, healthz 래핑 없음).
function formatHealthSummary(hz) {
  const data = hz || {};
  const all = data.AllNodes || [];
  const healthy = data.HealthyNodes || [];
  const unhealthy = data.UnHealthyNodes || [];
  return `healthy ${healthy.length} / unhealthy ${unhealthy.length} / total ${all.length}`;
}

function _applyHealthToDetailIfShown(item, text) {
  const shown = AppState.resources.selected;
  if (shown && nlbId(shown) === nlbId(item)) {
    document.getElementById('mcinlb-detail-nlb-health').textContent = text;
  }
}

// ─── 다중선택 삭제 ───────────────────────────────────────────────────────

export function confirmMciNlbBulkDelete() {
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
    'partials/operation/manage/mcinlb.executeMciNlbBulkDelete'
  );
}

export async function executeMciNlbBulkDelete() {
  const items = AppState.resources.bulkSelected || [];
  if (items.length === 0) return;
  const ns = window.currentNsId;
  const infraId = window.currentMciId;
  const results = await Promise.allSettled(items.map((item) => nlbApi().delNLB(ns, infraId, nlbId(item))));
  const failed = results.filter((r) => r.status === 'rejected').length;
  const succeeded = results.length - failed;
  showToast(
    failed > 0 ? TOAST_TYPES.WARNING : TOAST_TYPES.SUCCESS,
    `${succeeded} NLB(s) deleted${failed > 0 ? `, ${failed} failed` : ''}`
  );
  AppState.resources.bulkSelected = [];
  AppState.tables.nlbTable?.deselectRow();
  hideDetail();
  await loadMciNlbList(true);
}

// ─── Filter ───────────────────────────────────────────────────────────────

document.getElementById('mcinlb-filter-provider')?.addEventListener('change', function () {
  populateRegionFilterOptions(AppState.resources.all, 'mcinlb-filter-provider', 'mcinlb-filter-region');
  _updateFilter();
});
document.getElementById('mcinlb-filter-region')?.addEventListener('change', _updateFilter);
document.getElementById('mcinlb-filter-field')?.addEventListener('change', _updateFilter);
document.getElementById('mcinlb-filter-type')?.addEventListener('change', _updateFilter);
document.getElementById('mcinlb-filter-value')?.addEventListener('keyup', _updateFilter);

function _updateFilter() {
  if (!AppState.tables.nlbTable) return;
  const providerEl = document.getElementById('mcinlb-filter-provider');
  const regionEl = document.getElementById('mcinlb-filter-region');
  const fieldEl = document.getElementById('mcinlb-filter-field');
  const typeEl = document.getElementById('mcinlb-filter-type');
  const valueEl = document.getElementById('mcinlb-filter-value');
  const filters = [];
  if (providerEl?.value) filters.push({ field: '_provider', type: '=', value: providerEl.value });
  if (regionEl?.value) filters.push({ field: '_region', type: '=', value: regionEl.value });
  if (fieldEl?.value) filters.push({ field: fieldEl.value, type: typeEl.value, value: valueEl.value });
  if (filters.length > 0) {
    AppState.tables.nlbTable.setFilter(filters);
  } else {
    AppState.tables.nlbTable.clearFilter();
  }
}

document.getElementById('mcinlb-filter-clear')?.addEventListener('click', function () {
  const providerEl = document.getElementById('mcinlb-filter-provider');
  const regionEl = document.getElementById('mcinlb-filter-region');
  const fieldEl = document.getElementById('mcinlb-filter-field');
  const typeEl = document.getElementById('mcinlb-filter-type');
  const valueEl = document.getElementById('mcinlb-filter-value');
  if (providerEl) providerEl.value = '';
  if (regionEl) regionEl.value = '';
  if (fieldEl) fieldEl.value = '';
  if (typeEl) typeEl.value = 'like';
  if (valueEl) valueEl.value = '';
  if (AppState.tables.nlbTable) AppState.tables.nlbTable.clearFilter();
});

// ─── Create NLB 모달 (Infra는 이 탭의 window.currentMciId로 고정) ────────────

// nodeGroupId -> [{ id, status }] — nlbs.js와 동일한 Running 상태 체크 캐시.
let _nodeStatusByGroup = {};

export async function openCreateMciNlbModal() {
  const ns = window.currentNsId;
  const infraId = window.currentMciId;
  if (!ns || !infraId) {
    webconsolejs['partials/layout/modal'].commonShowDefaultModal('Validation', 'Please select an MCI first.');
    return;
  }
  document.getElementById('mcinlb-create-nlb-listener-port').value = '80';
  document.getElementById('mcinlb-create-nlb-target-port').value = '80';
  document.getElementById('mcinlb-create-nlb-protocol').value = 'TCP';
  document.getElementById('mcinlb-create-nlb-description').value = '';
  await _loadNodeGroupOptions(infraId);
  new bootstrap.Modal(document.getElementById('mcinlb-create-nlb-modal')).show();
}

document.getElementById('mcinlb-create-nlb-nodegroup')?.addEventListener('change', _updateNodeGroupStatus);

async function getNodeStatusesByGroup(ns, infraId) {
  try {
    const resp = await webconsolejs['common/api/http'].commonAPIPost('/api/mc-infra-manager/GetInfra', {
      pathParams: { nsId: ns, infraId },
    });
    const nodes = resp?.data?.responseData?.node || [];
    const map = {};
    for (const n of nodes) {
      if (!n.nodeGroupId) continue;
      if (!map[n.nodeGroupId]) map[n.nodeGroupId] = [];
      map[n.nodeGroupId].push({ id: n.id, status: n.status });
    }
    return map;
  } catch (err) {
    console.error('Infra 노드 상태 조회 실패:', err);
    return {};
  }
}

function _updateNodeGroupStatus() {
  const nodeGroupId = document.getElementById('mcinlb-create-nlb-nodegroup').value;
  const statusEl = document.getElementById('mcinlb-create-nlb-nodegroup-status');
  const btn = document.getElementById('mcinlb-create-nlb-execute-btn');
  const nodes = nodeGroupId ? _nodeStatusByGroup[nodeGroupId] || [] : [];

  if (nodes.length === 0) {
    statusEl.textContent = '';
    statusEl.className = 'form-text';
    if (btn) btn.disabled = false;
    return;
  }

  const notRunning = nodes.filter((n) => n.status !== 'Running');
  if (notRunning.length === 0) {
    statusEl.textContent = `Node status: Running (${nodes.length}/${nodes.length})`;
    statusEl.className = 'form-text text-success';
    if (btn) btn.disabled = false;
  } else {
    statusEl.textContent =
      `Node status: ${notRunning.map((n) => `${n.id}=${n.status}`).join(', ')} — ` +
      'all nodes must be Running to create an NLB.';
    statusEl.className = 'form-text text-danger';
    if (btn) btn.disabled = true;
  }
}

async function _loadNodeGroupOptions(infraId) {
  const select = document.getElementById('mcinlb-create-nlb-nodegroup');
  select.innerHTML = '<option value="">Select</option>';
  _nodeStatusByGroup = {};
  _updateNodeGroupStatus();
  if (!infraId) return;
  try {
    const data = await nlbApi().getInfraNodeGroupIds(window.currentNsId, infraId);
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
  _nodeStatusByGroup = await getNodeStatusesByGroup(window.currentNsId, infraId);
  _updateNodeGroupStatus();
}

export async function executeCreateMciNlb() {
  const ns = window.currentNsId;
  const infraId = window.currentMciId;
  const subGroupId = document.getElementById('mcinlb-create-nlb-nodegroup').value;
  const listenerPort = document.getElementById('mcinlb-create-nlb-listener-port').value.trim();
  const targetPort = document.getElementById('mcinlb-create-nlb-target-port').value.trim();
  const protocol = document.getElementById('mcinlb-create-nlb-protocol').value;
  const description = document.getElementById('mcinlb-create-nlb-description').value.trim();

  if (!infraId || !subGroupId || !listenerPort || !targetPort) {
    showToast(TOAST_TYPES.WARNING, 'Target NodeGroup, listener port, and target port are required.');
    return;
  }

  const notRunning = (_nodeStatusByGroup[subGroupId] || []).filter((n) => n.status !== 'Running');
  if (notRunning.length > 0) {
    showToast(
      TOAST_TYPES.WARNING,
      `Target NodeGroup has node(s) not in Running state (${notRunning.map((n) => `${n.id}=${n.status}`).join(', ')}). Start them before creating an NLB.`
    );
    return;
  }

  const spinner = document.getElementById('mcinlb-create-nlb-spinner');
  const btn = document.getElementById('mcinlb-create-nlb-execute-btn');
  spinner.classList.remove('d-none');
  btn.disabled = true;

  const body = {
    type: 'PUBLIC',
    scope: 'REGION',
    listener: { protocol, port: String(listenerPort) },
    targetGroup: { protocol, port: String(targetPort), nodeGroupId: subGroupId },
    healthChecker: { interval: 0, timeout: 0, threshold: 0 },
  };
  if (description) body.description = description;

  try {
    await nlbApi().postNLB(ns, infraId, body);
    showToast(TOAST_TYPES.SUCCESS, `NLB for "${subGroupId}" created successfully`);
    bootstrap.Modal.getInstance(document.getElementById('mcinlb-create-nlb-modal'))?.hide();
    await loadMciNlbList(true);
  } catch (err) {
    console.error('MCI NLB 생성 실패:', err);
    const msg = err?.response?.data?.responseData?.message || err?.message || '';
    showToast(TOAST_TYPES.ERROR, 'Failed to create NLB: ' + msg);
  } finally {
    spinner.classList.add('d-none');
    btn.disabled = false;
  }
}

// ─── webconsolejs 등록 ────────────────────────────────────────────────────
if (typeof webconsolejs === 'undefined') { window.webconsolejs = {}; }
webconsolejs['partials/operation/manage/mcinlb'] = {
  loadMciNlbList,
  resetForMciSwitch,
  hideDetail,
  checkSelectedMciNlbHealth,
  confirmMciNlbBulkDelete,
  executeMciNlbBulkDelete,
  openCreateMciNlbModal,
  executeCreateMciNlb,
};
