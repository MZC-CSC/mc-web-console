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

// force=false는 "탭을 열 때"의 호출이다. 예전엔 같은 Infra면 재조회를 건너뛰었지만, 다른 화면
// (Cloud Resources > NLBs의 Edit 등)에서 노드 할당이 바뀐 뒤 이 탭이 옛 목록을 계속 보여주는
// 문제가 있어 탭을 열 때마다 재조회한다. 목록 1회 호출이라 비용은 미미하다.
export async function loadMciNlbList(force) {
  const infraId = window.currentMciId;
  const ns = window.currentNsId;
  if (!infraId || !ns) return;

  try {
    const data = await nlbApi().getAllNLB(ns, infraId);
    // 배포 백엔드(cb-tumblebug NLBInfo)는 Type/Scope에 json 태그가 없어 대문자 키로 내려온다 — 정규화 필드로 흡수
    const items = (data?.nlb || (Array.isArray(data) ? data : [])).map((v) => ({
      ...v,
      _provider: getProvider(v),
      _region: getRegion(v),
      _type: v.type ?? v.Type ?? '-',
      _scope: v.scope ?? v.Scope ?? '-',
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
    placeholder: 'No NLBs. Create one in Cloud Resources > NLBs.',
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
      { title: 'Type', field: '_type', width: 100 },
      { title: 'Scope', field: '_scope', width: 100 },
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
        formatter: (cell) => {
          const tg = cell.getValue();
          return tg?.nodeGroupId || tg?.subGroupId || '-';
        },
      },
      {
        title: 'Assigned Nodes',
        field: 'targetGroup',
        width: 130,
        hozAlign: 'center',
        formatter: (cell) => String(_assignedNodes({ targetGroup: cell.getValue() }).length),
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
  document.getElementById('mcinlb-detail-nlb-type').textContent = data.type ?? data.Type ?? '-';
  document.getElementById('mcinlb-detail-nlb-scope').textContent = data.scope ?? data.Scope ?? '-';
  document.getElementById('mcinlb-detail-nlb-listener').textContent =
    listener.protocol || listener.port ? `${listener.protocol || ''}:${listener.port || ''}` : '-';
  document.getElementById('mcinlb-detail-nlb-endpoint').textContent = listener.dnsName || listener.ip || '-';
  document.getElementById('mcinlb-detail-nlb-nodegroup').textContent = target.nodeGroupId || target.subGroupId || '-';
  document.getElementById('mcinlb-detail-nlb-nodes').textContent = _assignedNodes(data).join(', ') || '-';
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

// ─── Assign / UnAssign (기존 NLB에 노드 추가·해제 — 생성은 Cloud Resources > NLBs) ───

// nodeGroupId -> [{ id, status }] — nlbs.js와 동일한 Running 상태 체크 캐시.
let _nodeStatusByGroup = {};

// 배포 백엔드 버전에 따라 targetGroup 노드 목록 필드가 nodes/vms로 다를 수 있어 폴백으로 읽는다.
function _assignedNodes(item) {
  const tg = item?.targetGroup || {};
  return tg.nodes || tg.vms || [];
}

function _findNlbById(id) {
  return AppState.resources.all.find((item) => nlbId(item) === id);
}

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

// ─── Assign 모달 ─────────────────────────────────────────────────────────

export async function openAssignNlbModal() {
  const ns = window.currentNsId;
  const infraId = window.currentMciId;
  if (!ns || !infraId) {
    webconsolejs['partials/layout/modal'].commonShowDefaultModal('Validation', 'Please select an Infra first.');
    return;
  }
  if (AppState.resources.all.length === 0) {
    webconsolejs['partials/layout/modal'].commonShowDefaultModal(
      'No NLB',
      'No NLB exists in this Infra. Create one in Cloud Resources > NLBs first.'
    );
    return;
  }

  const select = document.getElementById('mcinlb-assign-nlb-select');
  select.innerHTML = '';
  for (const item of AppState.resources.all) {
    const opt = document.createElement('option');
    opt.value = nlbId(item);
    opt.textContent = nlbId(item);
    select.appendChild(opt);
  }
  const selected = AppState.tables.nlbTable ? AppState.tables.nlbTable.getSelectedData() : [];
  if (selected.length === 1) select.value = nlbId(selected[0]);

  const listEl = document.getElementById('mcinlb-assign-node-list');
  listEl.innerHTML = '<div class="text-secondary">Loading nodes...</div>';
  new bootstrap.Modal(document.getElementById('mcinlb-assign-modal')).show();

  _nodeStatusByGroup = await getNodeStatusesByGroup(ns, infraId);
  _renderAssignNodeCandidates();
}

document.getElementById('mcinlb-assign-nlb-select')?.addEventListener('change', _renderAssignNodeCandidates);

// Infra 전체 노드 중 선택된 NLB에 아직 할당되지 않은 노드만 후보로 렌더링.
// 백엔드 Add는 중복 검증 없이 append하므로 기할당 노드 제외는 프론트가 책임진다.
function _renderAssignNodeCandidates() {
  const listEl = document.getElementById('mcinlb-assign-node-list');
  const statusEl = document.getElementById('mcinlb-assign-node-status');
  if (!listEl) return;
  const selectedNlb = _findNlbById(document.getElementById('mcinlb-assign-nlb-select').value);
  const assigned = new Set(_assignedNodes(selectedNlb));

  const rows = [];
  for (const [groupId, nodes] of Object.entries(_nodeStatusByGroup)) {
    for (const n of nodes) {
      if (assigned.has(n.id)) continue;
      rows.push({ ...n, groupId });
    }
  }

  if (rows.length === 0) {
    listEl.innerHTML = '<div class="text-secondary">No assignable nodes. All nodes of this Infra are already assigned to the selected NLB.</div>';
    if (statusEl) statusEl.textContent = '';
    return;
  }

  listEl.innerHTML = rows
    .map((n) => {
      const running = n.status === 'Running';
      const badge = running ? 'bg-success' : 'bg-warning';
      return `
        <label class="form-check mb-1">
          <input class="form-check-input mcinlb-assign-node-check" type="checkbox" value="${n.id}" ${running ? '' : 'disabled'}>
          <span class="form-check-label">${n.id} <span class="text-secondary">(${n.groupId})</span>
            <span class="badge ${badge} ms-1">${n.status || 'Unknown'}</span></span>
        </label>`;
    })
    .join('');
  const notRunning = rows.filter((n) => n.status !== 'Running').length;
  if (statusEl) {
    statusEl.textContent = notRunning > 0 ? `${notRunning} node(s) not in Running state cannot be assigned.` : '';
  }
}

export async function executeAssignNlbNodes() {
  const ns = window.currentNsId;
  const infraId = window.currentMciId;
  const targetNlbId = document.getElementById('mcinlb-assign-nlb-select').value;
  const nodes = Array.from(document.querySelectorAll('.mcinlb-assign-node-check:checked')).map((el) => el.value);
  if (!targetNlbId || nodes.length === 0) {
    showToast(TOAST_TYPES.WARNING, 'Select an NLB and at least one node to assign.');
    return;
  }

  const spinner = document.getElementById('mcinlb-assign-spinner');
  const btn = document.getElementById('mcinlb-assign-execute-btn');
  spinner.classList.remove('d-none');
  btn.disabled = true;
  try {
    await nlbApi().addNLBNodes(ns, infraId, targetNlbId, nodes);
    showToast(TOAST_TYPES.SUCCESS, `${nodes.length} node(s) assigned to "${targetNlbId}"`);
    bootstrap.Modal.getInstance(document.getElementById('mcinlb-assign-modal'))?.hide();
    await _reloadAndRefreshDetail(targetNlbId);
  } catch (err) {
    console.error('NLB 노드 Assign 실패:', err);
    const msg = err?.response?.data?.responseData?.message || err?.message || '';
    showToast(TOAST_TYPES.ERROR, 'Failed to assign nodes: ' + msg);
  } finally {
    spinner.classList.add('d-none');
    btn.disabled = false;
  }
}

// ─── UnAssign 모달 ───────────────────────────────────────────────────────

export async function openUnassignNlbModal() {
  const table = AppState.tables.nlbTable;
  const selected = table ? table.getSelectedData() : [];
  if (selected.length !== 1) {
    webconsolejs['partials/layout/modal'].commonShowDefaultModal(
      'Select One NLB',
      'Please select exactly one NLB to unassign nodes from.'
    );
    return;
  }
  const item = selected[0];
  const id = nlbId(item);
  document.getElementById('mcinlb-unassign-nlb-name').textContent = id;

  const listEl = document.getElementById('mcinlb-unassign-node-list');
  listEl.innerHTML = '<div class="text-secondary">Loading assigned nodes...</div>';
  new bootstrap.Modal(document.getElementById('mcinlb-unassign-modal')).show();

  // 목록 캐시가 오래됐을 수 있어 상세를 새로 조회해 할당 노드를 확정한다.
  let nodes = _assignedNodes(item);
  try {
    const detail = await nlbApi().getNLB(window.currentNsId, window.currentMciId, id);
    if (detail) nodes = _assignedNodes(detail);
  } catch (err) {
    console.error('NLB 상세 조회 실패:', err);
  }

  if (nodes.length === 0) {
    listEl.innerHTML = '<div class="text-secondary">No nodes are assigned to this NLB.</div>';
    return;
  }
  listEl.innerHTML = nodes
    .map(
      (n) => `
        <label class="form-check mb-1">
          <input class="form-check-input mcinlb-unassign-node-check" type="checkbox" value="${n}">
          <span class="form-check-label">${n}</span>
        </label>`
    )
    .join('');
}

export async function executeUnassignNlbNodes() {
  const ns = window.currentNsId;
  const infraId = window.currentMciId;
  const targetNlbId = document.getElementById('mcinlb-unassign-nlb-name').textContent;
  const nodes = Array.from(document.querySelectorAll('.mcinlb-unassign-node-check:checked')).map((el) => el.value);
  if (!targetNlbId || nodes.length === 0) {
    showToast(TOAST_TYPES.WARNING, 'Select at least one node to unassign.');
    return;
  }

  const spinner = document.getElementById('mcinlb-unassign-spinner');
  const btn = document.getElementById('mcinlb-unassign-execute-btn');
  spinner.classList.remove('d-none');
  btn.disabled = true;
  try {
    await nlbApi().removeNLBNodes(ns, infraId, targetNlbId, nodes);
    showToast(TOAST_TYPES.SUCCESS, `${nodes.length} node(s) unassigned from "${targetNlbId}"`);
    bootstrap.Modal.getInstance(document.getElementById('mcinlb-unassign-modal'))?.hide();
    await _reloadAndRefreshDetail(targetNlbId);
  } catch (err) {
    console.error('NLB 노드 UnAssign 실패:', err);
    const msg = err?.response?.data?.responseData?.message || err?.message || '';
    showToast(TOAST_TYPES.ERROR, 'Failed to unassign nodes: ' + msg);
  } finally {
    spinner.classList.add('d-none');
    btn.disabled = false;
  }
}

// Assign/UnAssign 후 목록 재조회 + 열려 있는 Detail이 대상 NLB면 갱신
async function _reloadAndRefreshDetail(targetNlbId) {
  await loadMciNlbList(true);
  const shown = AppState.resources.selected;
  if (shown && nlbId(shown) === targetNlbId) {
    const fresh = _findNlbById(targetNlbId);
    if (fresh) {
      AppState.resources.selected = fresh;
      renderDetail(fresh);
    }
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
  openAssignNlbModal,
  executeAssignNlbNodes,
  openUnassignNlbModal,
  executeUnassignNlbNodes,
};
