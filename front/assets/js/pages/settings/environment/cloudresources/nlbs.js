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

// cluster별 providerNames/regionNames를 "provider/region" 형태로 묶어 라벨을 만든다.
// (멀티클라우드 infra처럼 cluster가 여러 개면 쉼표로 나열)
function formatInfraLabel(id, infra) {
  const parts = (infra.cluster || [])
    .map((c) => {
      const providers = (c.providerNames || []).join('/');
      const regions = (c.regionNames || []).join('/');
      return providers && regions ? `${providers}/${regions}` : providers || regions;
    })
    .filter(Boolean);
  return parts.length > 0 ? `${id} — ${parts.join(', ')}` : id;
}

async function getInfraList() {
  if (!AppState.ns) return [];
  try {
    const data = await mciApi().getMciList(AppState.ns);
    const infras = data?.infra || (Array.isArray(data) ? data : []);
    return infras
      .map((infra) => {
        const id = infra.id || infra.name;
        return id ? { id, label: formatInfraLabel(id, infra) } : null;
      })
      .filter(Boolean);
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
  const infras = await getInfraList();
  if (infras.length === 0) {
    AppState.resources.all = [];
    if (AppState.tables.nlbTable) AppState.tables.nlbTable.replaceData([]);
    return;
  }
  try {
    const results = await Promise.allSettled(
      infras.map((infra) => nlbApi().getAllNLB(AppState.ns, infra.id))
    );
    const items = [];
    results.forEach((result, idx) => {
      if (result.status !== 'fulfilled') return;
      const rawItems = result.value?.nlb || (Array.isArray(result.value) ? result.value : []);
      for (const v of rawItems) {
        items.push({ ...v, _infraId: infras[idx].id, _provider: getProvider(v), _region: getRegion(v) });
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
    selectableRows: true, // false로 두면 Tabulator 내부 cap-check 버그(isNaN(false)===false)로 다중선택 자체가 깨진다
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
    // selectableRows:true는 row 아무데나 클릭해도 체크박스를 토글하는 내장 동작이 있다.
    // 체크박스 자체를 클릭한 게 아니면 그 토글을 즉시 되돌려, row 클릭은 Detail Panel 오픈 전용으로 만든다.
    const clickedCell = row.getCells().find(c => c.getElement().contains(e.target));
    const isCheckboxCol = clickedCell?.getColumn()?.getDefinition()?.formatter === 'rowSelection';
    if (!isCheckboxCol) {
      row.toggleSelect();
    }

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
  renderTruncatableCopyable('detail-nlb-endpoint', listener.dnsName || listener.ip || '-');
  document.getElementById('detail-nlb-nodegroup').textContent = target.subGroupId || '-';
  document.getElementById('detail-nlb-target-port').textContent = target.port || '-';
  document.getElementById('detail-nlb-healthchecker').textContent =
    hc.protocol || hc.port ? `${hc.protocol || ''}:${hc.port || ''} (interval ${hc.interval || '-'}, threshold ${hc.threshold || '-'})` : '-';
  renderTruncatableCopyable('detail-nlb-csp-id', data.cspResourceId || '-');
  document.getElementById('detail-nlb-description').textContent = data.description || '-';
  document.getElementById('detail-nlb-health').textContent = '-';
}

// 길어서 "..."으로 잘리는 값(Listener IP/DNS, CSP Resource ID)을
// 말줄임 + hover 시 title 툴팁 + 끝에 복사 아이콘으로 전체 내용을 확인/복사할 수 있게 한다.
// target은 <div id="...">(endpoint)이거나 <code id="...">(csp-id)로 구조가 달라
// target 자신을 flex 컨테이너로 만들어 [텍스트 span, 복사 아이콘]을 그 안에 넣는다.
function renderTruncatableCopyable(targetId, fullText) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = '';

  if (!fullText || fullText === '-') {
    target.textContent = '-';
    return;
  }

  target.style.display = 'inline-flex';
  target.style.alignItems = 'center';
  target.style.gap = '4px';
  target.style.maxWidth = '100%';

  const span = document.createElement('span');
  span.textContent = fullText;
  span.title = fullText;
  span.style.maxWidth = '240px';
  span.style.overflow = 'hidden';
  span.style.textOverflow = 'ellipsis';
  span.style.whiteSpace = 'nowrap';

  const copyBtn = document.createElement('a');
  copyBtn.href = '#';
  copyBtn.className = 'copy-icon-btn flex-shrink-0';
  copyBtn.title = 'Copy to clipboard';
  copyBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-sm" width="16" height="16" viewBox="0 0 24 24" ' +
    'stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>' +
    '<path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"/>' +
    '<path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"/>' +
    '</svg>';
  copyBtn.addEventListener('click', function (e) {
    e.preventDefault();
    navigator.clipboard
      .writeText(fullText)
      .then(() => showToast(TOAST_TYPES.SUCCESS, 'Copied to clipboard'))
      .catch(() => showToast(TOAST_TYPES.ERROR, 'Failed to copy'));
  });

  target.appendChild(span);
  target.appendChild(copyBtn);
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

// ─── Health Check (목록에서 선택 기반) ─────────────────────────────────────
// 체크 결과는 toast로 표시하면 놓치기 쉬워, 확인 후 닫아야 하는 modal로 표시한다.

export async function checkSelectedNlbHealth() {
  const table = AppState.tables.nlbTable;
  const selected = table ? table.getSelectedData() : [];
  if (selected.length === 0) {
    webconsolejs['partials/layout/modal'].commonShowDefaultModal(
      'Nothing Selected',
      'Please select at least one item to check health.'
    );
    return;
  }

  const results = await Promise.allSettled(
    selected.map((item) => nlbApi().getNLBHealth(AppState.ns, item._infraId, nlbId(item)))
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

// 체크한 NLB가 현재 Detail 패널에 열려있는 것과 같으면 Health Status도 갱신한다.
function _applyHealthToDetailIfShown(item, text) {
  const shown = AppState.resources.selected;
  if (shown && shown._infraId === item._infraId && nlbId(shown) === nlbId(item)) {
    document.getElementById('detail-nlb-health').textContent = text;
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
  const infras = await getInfraList();
  for (const infra of infras) {
    const opt = document.createElement('option');
    opt.value = infra.id;
    opt.textContent = infra.label;
    select.appendChild(opt);
  }
  if (infras.length === 1) select.value = infras[0].id;
  await _loadNodeGroupOptions(select.value);
}

document.getElementById('create-nlb-infra')?.addEventListener('change', function () {
  _loadNodeGroupOptions(this.value);
});

document.getElementById('create-nlb-nodegroup')?.addEventListener('change', _updateNodeGroupStatus);

// nodeGroupId -> [{ id, status }] — NLB 생성 전 대상 노드가 실제로 Running인지 확인하기 위한 캐시.
// AWS 드라이버 등은 Running이 아닌 인스턴스를 NLB 타겟으로 등록하려 하면
// "InvalidTarget: ... not in a running state"로 거부한다. 이를 API 호출 전에 미리 걸러낸다.
let _nodeStatusByGroup = {};

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
  const nodeGroupId = document.getElementById('create-nlb-nodegroup').value;
  const statusEl = document.getElementById('create-nlb-nodegroup-status');
  const btn = document.getElementById('create-nlb-execute-btn');
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
  const select = document.getElementById('create-nlb-nodegroup');
  select.innerHTML = '<option value="">Select</option>';
  _nodeStatusByGroup = {};
  _updateNodeGroupStatus();
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
  _nodeStatusByGroup = await getNodeStatusesByGroup(AppState.ns, infraId);
  _updateNodeGroupStatus();
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

  // 버튼 disabled 우회(폼 submit 등) 대비 이중 체크 — Running이 아닌 노드가 있으면
  // CSP 드라이버가 InvalidTarget으로 거부하므로 API 호출 전에 막는다.
  const notRunning = (_nodeStatusByGroup[subGroupId] || []).filter((n) => n.status !== 'Running');
  if (notRunning.length > 0) {
    showToast(
      TOAST_TYPES.WARNING,
      `Target NodeGroup has node(s) not in Running state (${notRunning.map((n) => `${n.id}=${n.status}`).join(', ')}). Start them before creating an NLB.`
    );
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
    // tumblebug model.NLBTargetGroupReq의 실제 필드명은 nodeGroupId다.
    // subGroupId로 보내면 빈 문자열로 취급되어 500(CheckString - empty string)이 난다.
    targetGroup: { protocol, port: String(targetPort), nodeGroupId: subGroupId },
    // model.NLBHealthCheckerReq는 interval/timeout/threshold만 받는 int 필드이며,
    // 0을 보내면 tumblebug가 자체 기본값을 적용한다("0 = use default").
    healthChecker: {
      interval: 0,
      timeout: 0,
      threshold: 0,
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
  checkSelectedNlbHealth,
  confirmBulkDelete,
  executeBulkDelete,
  openCreateNlbModal,
  executeCreateNlb,
};
