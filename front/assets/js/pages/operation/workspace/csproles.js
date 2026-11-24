import { TabulatorFull as Tabulator } from "tabulator-tables";

// 전역 변수
var cspRolesListTable;
var currentCspRoleId = null; // 현재 선택된 CSP Role ID
var cspRolePoliciesTable;
var checked_array = [];
var currentClickedCspRoleId = "";
var selectedPolicyId = "";
var currentRolePolicies = []; // 선택한 CSP Role 에 연결된 정책 (getRolePolicies 응답)
var availablePolicies = []; // Attach 모달의 정책 목록
var editingPolicy = null; // 편집기에 연 정책 원본 (바뀐 필드만 보내기 위해 보관)
var cspAccountsCache = null;

// 공통 결과 표시 (common/utils/resultModal.js): 단문은 notify(toast), 항목별 결과는 showResultModal
function resultUi() {
  return window.webconsolejs["common/utils/resultModal"];
}
function notify(type, message) {
  resultUi().notify(type, message);
}

// CSP Roles 목록 조회
export async function refreshCspRolesList() {
  try {
    const cspRoles = await window.webconsolejs["common/api/services/csproles_api"].getCspRoleList();

    if (cspRoles && cspRoles.length > 0) {
      cspRolesListTable.setData(cspRoles);
    } else {
      cspRolesListTable.setData([]);
    }
  } catch (error) {
    console.error("Error loading CSP Roles list:", error);
  }
}

// Tabulator 테이블 초기화
function initCspRolesTable() {
  // Tabulator 자체에 height를 지정해야 헤더/페이지네이션 footer는 고정되고
  // 데이터 영역만 내부적으로 스크롤된다(외부 div에 overflow를 거는 방식은
  // 헤더·footer까지 통째로 스크롤되어 버림).
  var tableObjParams = { height: "400px" };
  var columns = [
    {
      formatter: "rowSelection",
      titleFormatter: "rowSelection",
      vertAlign: "middle",
      hozAlign: "center",
      headerHozAlign: "center",
      headerSort: false,
      width: 60,
    },
    {
      title: "Id",
      field: "id",
      sorter: "number",
      vertAlign: "middle",
      hozAlign: "center",
      width: 300,
    },
    {
      title: "Name",
      field: "name",
      vertAlign: "middle",
      hozAlign: "center",
      width: 300,
    },
    {
      title: "ProviderImg",
      field: "provider",
      formatter: providerFormatter,
      vertAlign: "middle",
      hozAlign: "center",
      headerSort: false,
      width: 120,
    },
    {
      title: "Provider",
      field: "provider",
      formatter: providerFormatterString,
      visible: false
    },
    {
      title: "Description",
      field: "description",
      vertAlign: "middle",
      hozAlign: "center",
      maxWidth: 500,
    }
  ];

  cspRolesListTable = setCspRolesTabulator("csp-roles-table", tableObjParams, columns, true);

  // 행 클릭 시
  cspRolesListTable.on("rowClick", function (e, row) {
    var tempCurrentCspRoleId = currentClickedCspRoleId;
    currentClickedCspRoleId = row.getCell("id").getValue();

    if (tempCurrentCspRoleId === currentClickedCspRoleId) {
      // 같은 행 클릭 - 정보 영역 숨김
      webconsolejs["partials/layout/navigatePages"].deactiveElement(document.getElementById("csp_role_info"));
      currentClickedCspRoleId = "";
      // 정책 상세 패널도 숨김
      hidePolicyDetailPanel();
      this.deselectRow();
      return;
    } else {
      // 다른 행 클릭 - 정보 영역 표시
      webconsolejs["partials/layout/navigatePages"].activeElement(document.getElementById("csp_role_info"));
      this.deselectRow();
      this.selectRow(currentClickedCspRoleId);

      // 선택된 CSP Role 데이터 로드
      var selectedRole = row.getData();
      getSelectedCspRoleData(selectedRole);
      return;
    }
  });

  // 선택된 여러개 row에 대해 처리
  cspRolesListTable.on("rowSelectionChanged", function (data, rows) {
    checked_array = data;
  });
}

// Tabulator 설정 함수 (mci.js와 동일한 패턴)
function setCspRolesTabulator(
  tableObjId,
  tableObjParamMap,
  columnsParams,
  isMultiSelect
) {
  var placeholder = "No Data";
  var pagination = "local";
  var paginationSize = 5;
  var paginationSizeSelector = [5, 10, 15, 20];
  var movableColumns = true;
  var columnHeaderVertAlign = "middle";
  var paginationCounter = "rows";
  var layout = "fitColumns";
  var height = undefined;

  if (tableObjParamMap.hasOwnProperty("placeholder")) {
    placeholder = tableObjParamMap.placeholder;
  }

  if (tableObjParamMap.hasOwnProperty("pagination")) {
    pagination = tableObjParamMap.pagination;
  }

  if (tableObjParamMap.hasOwnProperty("paginationSize")) {
    paginationSize = tableObjParamMap.paginationSize;
  }

  if (tableObjParamMap.hasOwnProperty("paginationSizeSelector")) {
    paginationSizeSelector = tableObjParamMap.paginationSizeSelector;
  }

  if (tableObjParamMap.hasOwnProperty("movableColumns")) {
    movableColumns = tableObjParamMap.movableColumns;
  }

  if (tableObjParamMap.hasOwnProperty("columnHeaderVertAlign")) {
    columnHeaderVertAlign = tableObjParamMap.columnHeaderVertAlign;
  }

  if (tableObjParamMap.hasOwnProperty("paginationCounter")) {
    paginationCounter = tableObjParamMap.paginationCounter;
  }

  if (tableObjParamMap.hasOwnProperty("layout")) {
    layout = tableObjParamMap.layout;
  }

  if (tableObjParamMap.hasOwnProperty("height")) {
    height = tableObjParamMap.height;
  }

  var tabulatorTable = new Tabulator("#" + tableObjId, {
    placeholder,
    pagination,
    paginationSize,
    paginationSizeSelector,
    // 신규 생성 role이 페이지네이션 뒷페이지에 가려 "목록에 없다"고 오인되지 않도록 최신순 기본 정렬
    initialSort: [{ column: "id", dir: "desc" }],
    movableColumns,
    columnHeaderVertAlign,
    paginationCounter,
    layout,
    height,
    columns: columnsParams,
    selectableRows: isMultiSelect == false ? 1 : true,
  });

  return tabulatorTable;
}


// provider를 table에서 표시하기 위해 감싸기 (mci.js와 동일한 패턴)
function providerFormatter(data) {
  const provider = data.getData().provider;
  let providerCell = "";

  if (provider) {
    providerCell = `
      <img class="img-fluid" class="rounded" width="30" src="/assets/images/common/img_logo_${provider}.png" alt="${provider}"/>`;
  } else {
    providerCell = `
      <img class="img-fluid" class="rounded" width="30" src="/assets/images/common/img_logo_mcmp.png" alt="unknown"/>`;
  }

  return providerCell;
}

// provider를 string으로 추출 (mci.js와 동일한 패턴)
function providerFormatterString(data) {
  const provider = data.getData().provider;
  return provider || "";
}

// 선택된 CSP Role 데이터 로드
function getSelectedCspRoleData(roleData) {
  // 현재 선택된 CSP Role ID 저장
  currentCspRoleId = roleData.id;

  // 정책 상세 패널 숨김 (새로운 CSP Role 선택 시)
  hidePolicyDetailPanel();

  // 제목 업데이트
  const titleElement = document.getElementById('csp_role_info_text');
  if (titleElement) {
    titleElement.textContent = `(${roleData.name || 'Unknown Role'})`;
  }

  // 상세 정보 업데이트
  updateElementText('csp_role_info_provider', roleData.provider || '-');
  updateElementText('csp_role_info_name', roleData.name || '-');
  updateElementText('csp_role_info_id', roleData.id || '-');
  updateElementText('csp_role_info_description', roleData.description || '-');

  // 플랫폼 역할 정보 (현재는 Mock 데이터로 처리)
  const platformRole = getPlatformRoleForCspRole(roleData);
  updateElementText('csp_role_info_platform_role', platformRole);

  // 정책 정보 로드
  loadCspRolePolicies(roleData.id);
}

// 요소 텍스트 업데이트 헬퍼 함수
function updateElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

// CSP Role에 연결된 플랫폼 역할 조회 (Mock 데이터)
function getPlatformRoleForCspRole(roleData) {
  // 실제로는 API를 통해 조회해야 하지만, 현재는 Mock 데이터로 처리
  const mockPlatformRoles = {
    'role-001': 'Admin',
    'role-002': 'User',
    'role-003': 'Viewer'
  };

  return mockPlatformRoles[roleData.id] || 'Not Assigned';
}

// ===== CSP Policy 표시·오류 헬퍼 =====

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// policy_type → 화면 표시 (inline / AWS managed / Customer managed)
function policyTypeLabel(policyType) {
  const labels = { inline: "Inline", managed: "AWS managed", custom: "Customer managed" };
  return labels[policyType] || policyType || "-";
}

// IAM 이 관리하는 고객 관리형(mciam-*) 인지 — 생성·문서 수정·삭제는 이것만 가능
function isIamOwnedCustom(policy) {
  if (!policy || policy.policy_type !== "custom") return false;
  const arnName = (policy.policy_arn || "").split("/").pop();
  if (arnName) return arnName.startsWith("mciam-");
  return (policy.name || "").startsWith("mciam-");
}

// 문서 편집 가능: inline, 그리고 mciam-* 인 custom
function canEditPolicyDocument(policy) {
  return policy?.policy_type === "inline" || isIamOwnedCustom(policy);
}

// aws_status 배지 (applied 초록, failed·detach_failed 빨강, 빈 값 회색 "not applied")
function awsStatusBadgeHtml(status, lastError) {
  const map = {
    applied: { cls: "bg-green-lt", text: "applied" },
    failed: { cls: "bg-red-lt", text: "failed" },
    detach_failed: { cls: "bg-red-lt", text: "detach_failed" },
  };
  const conf = map[status] || { cls: "bg-secondary-lt", text: "not applied" };
  const title = lastError ? ` title="${escapeHtml(lastError)}" data-bs-toggle="tooltip"` : "";
  return `<span class="badge ${conf.cls} policy-aws-status" data-status="${escapeHtml(status || "")}"${title}>${conf.text}</span>`;
}

// API 오류 → 화면 문구 (IAM error + HTTP 상태·errorCode)
function formatPolicyError(error) {
  const parts = [];
  if (error?.status) parts.push("HTTP " + error.status);
  if (error?.errorCode) parts.push(error.errorCode);
  const suffix = parts.length ? ` (${parts.join(", ")})` : "";
  return (error?.message || "Unknown error") + suffix;
}

// 결과 모달 — items: [{ok: true|false|'warn', label, detail}] (공통 결과 모달)
function showPolicyResult(title, items, summary) {
  resultUi().showResultModal(title, items, summary);
}

// attach·detach 응답 → 결과 항목
function bindingResultItem(label, result, okValue) {
  if (!result) return { ok: false, label, detail: "Empty response" };
  const ok = result.result === okValue;
  const details = [];
  if (result.message) details.push(result.message);
  if (Array.isArray(result.warnings)) result.warnings.forEach(w => { if (w && !details.includes(w)) details.push(w); });
  if (!ok && result.errorCode) details.push("errorCode: " + result.errorCode);
  return { ok: ok ? true : false, label: `${label} — ${result.result || "unknown"}`, detail: details.join(" / ") };
}

// 모달 안 오류 표시 (입력값을 잃지 않도록 모달은 닫지 않는다) — message 가 비면 숨긴다
function setModalError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message || "";
  el.style.display = message ? "block" : "none";
}

function hideModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const modal = bootstrap.Modal.getInstance(el);
  if (modal) modal.hide();
}

async function loadCspAccounts(force = false) {
  if (cspAccountsCache && !force) return cspAccountsCache;
  cspAccountsCache = await window.webconsolejs["common/api/services/csproles_api"].listCspAccounts();
  return cspAccountsCache;
}

async function fillAccountSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">Loading...</option>';
  try {
    const accounts = await loadCspAccounts();
    if (!accounts.length) {
      select.innerHTML = '<option value="">No CSP account</option>';
      return;
    }
    select.innerHTML = accounts.map(a =>
      `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)} (${escapeHtml((a.csp_type || "").toUpperCase())}, ID ${escapeHtml(a.id)})</option>`
    ).join("");
  } catch (error) {
    select.innerHTML = '<option value="">Failed to load accounts</option>';
    notify("error", "Failed to load CSP accounts: " + formatPolicyError(error));
  }
}

// CSP Role의 정책 정보 로드
async function loadCspRolePolicies(roleId) {
  try {
    const policies = await window.webconsolejs["common/api/services/csproles_api"].getPoliciesByRoleId(roleId);
    currentRolePolicies = policies;
    displayCspRolePolicies(policies);
  } catch (error) {
    console.error("Error loading policies:", error);
    currentRolePolicies = [];
    displayCspRolePolicies([]);
    notify("error", "Failed to load policies: " + formatPolicyError(error));
  }
}

// 정책 정보 표시 (Tabulator 테이블 사용)
function displayCspRolePolicies(policies) {
  const policiesContainer = document.getElementById('csp_role_policies_list');
  if (!policiesContainer) return;

  // 기존 테이블이 있으면 제거
  if (cspRolePoliciesTable) {
    cspRolePoliciesTable.destroy();
    cspRolePoliciesTable = null;
  }

  // 빈 데이터 처리
  if (!policies || policies.length === 0) {
    policiesContainer.innerHTML = `
      <div class="text-muted text-center py-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-info-circle" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
          <path d="M12 9h.01"></path>
          <path d="M11 12h1v4h1"></path>
        </svg>
        <div class="mt-2">No policies linked to this CSP Role.</div>
      </div>
    `;
    return;
  }
  policiesContainer.innerHTML = "";

  cspRolePoliciesTable = new Tabulator("#csp_role_policies_list", {
    data: policies,
    index: "id",
    layout: "fitColumns",
    pagination: "local",
    paginationSize: 10,
    paginationSizeSelector: [5, 10, 20, 50],
    movableColumns: true,
    selectableRows: true,
    columns: [
      {
        formatter: "rowSelection",
        titleFormatter: "rowSelection",
        vertAlign: "middle",
        hozAlign: "center",
        headerHozAlign: "center",
        headerSort: false,
        width: 60,
      },
      { title: "Name", field: "name", vertAlign: "middle", hozAlign: "left", minWidth: 200 },
      { title: "ID", field: "id", vertAlign: "middle", hozAlign: "center", width: 80 },
      {
        title: "Policy Type",
        field: "policy_type",
        formatter: (cell) => policyTypeLabel(cell.getValue()),
        vertAlign: "middle",
        hozAlign: "center",
        width: 160,
      },
      {
        title: "AWS Status",
        field: "aws_status",
        formatter: (cell) => awsStatusBadgeHtml(cell.getValue(), cell.getData().last_error),
        tooltip: (e, cell) => cell.getData().last_error || "",
        vertAlign: "middle",
        hozAlign: "center",
        width: 140,
      },
      {
        title: "Action",
        field: "aws_status",
        headerSort: false,
        vertAlign: "middle",
        hozAlign: "center",
        width: 150,
        formatter: (cell) => {
          const status = cell.getValue();
          const id = escapeHtml(cell.getData().id);
          if (status === "detach_failed") {
            return `<button type="button" class="btn btn-sm btn-outline-danger policy-retry-btn" data-action="detach" data-policy-id="${id}">Retry detach</button>`;
          }
          if (status !== "applied") {
            return `<button type="button" class="btn btn-sm btn-outline-primary policy-retry-btn" data-action="attach" data-policy-id="${id}">Retry apply</button>`;
          }
          return "";
        },
        cellClick: (e, cell) => {
          const btn = e.target.closest(".policy-retry-btn");
          if (!btn) return;
          e.stopPropagation();
          retryPolicyBinding(cell.getData(), btn.dataset.action);
        },
      },
      { title: "Description", field: "description", vertAlign: "middle", hozAlign: "left", minWidth: 150 },
    ]
  });

  // 정책 행 클릭 시 상세 패널 (Retry 버튼·체크박스 클릭은 제외)
  cspRolePoliciesTable.on("rowClick", function (e, row) {
    if (e.target.closest(".policy-retry-btn") || e.target.closest(".tabulator-row-handle") || e.target.type === "checkbox") return;
    showPolicyDetailPanel(row.getData());
  });
}

// 실패 행 재시도 — attach(failed·빈 값) 또는 detach(detach_failed)
async function retryPolicyBinding(policy, action) {
  if (!currentClickedCspRoleId) return;
  const api = window.webconsolejs["common/api/services/csproles_api"];
  const label = `${policy.name} (ID ${policy.id})`;
  try {
    if (action === "detach") {
      const result = await api.unbindPolicyFromRole(currentClickedCspRoleId, policy.id);
      const item = bindingResultItem(label, result, "detached");
      if (item.ok === true) {
        notify("success", `Policy detached: ${policy.name}`);
      } else {
        showPolicyResult("Retry detach failed", [item]);
      }
    } else {
      const result = await api.bindPolicyToRole(currentClickedCspRoleId, policy.id);
      const item = bindingResultItem(label, result, "applied");
      if (item.ok === true) {
        notify("success", `Policy applied: ${policy.name}`);
      } else {
        showPolicyResult("Retry apply failed", [item]);
      }
    }
  } catch (error) {
    showPolicyResult(action === "detach" ? "Retry detach failed" : "Retry apply failed", [{ ok: false, label, detail: formatPolicyError(error) }]);
  }
  await loadCspRolePolicies(currentClickedCspRoleId);
}

// Provider별 색상 반환
function getProviderColor(provider) {
  const colorMap = {
    'aws': 'warning',
    'azure': 'info',
    'gcp': 'primary',
    'alibaba': 'success',
    'tencent': 'secondary'
  };
  return colorMap[provider] || 'secondary';
}

// 정책 연결(Attach) 모달 표시 — 등록된 정책 목록에서 골라 선택한 CSP Role 에 연결
async function showAddPolicyModal() {
  if (!currentClickedCspRoleId) {
    notify("warning", "Please select a CSP Role first.");
    return;
  }
  const searchEl = document.getElementById('addPolicySearch');
  const typeEl = document.getElementById('addPolicyType');
  searchEl.value = "";
  typeEl.value = "";
  searchEl.oninput = renderAvailablePolicies;
  typeEl.onchange = loadAvailablePolicies;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('addPolicyModal')).show();
  await loadAvailablePolicies();
}

// 사용 가능한 정책 목록 로드 (POST /api/csp-policies/list {policy_type?})
async function loadAvailablePolicies() {
  const container = document.getElementById('availablePoliciesList');
  const policyType = document.getElementById('addPolicyType').value;
  container.innerHTML = '<div class="text-center py-3"><div class="spinner-border spinner-border-sm" role="status"></div> Loading policies...</div>';
  try {
    availablePolicies = await window.webconsolejs["common/api/services/csproles_api"].getCspPolicyList({ policy_type: policyType });
    renderAvailablePolicies();
  } catch (error) {
    console.error("Error loading policies:", error);
    availablePolicies = [];
    container.innerHTML = `<div class="text-danger text-center py-3">Error loading policies: ${escapeHtml(formatPolicyError(error))}</div>`;
  }
}

// 정책 목록 렌더링 (검색어 필터, 이미 연결된 정책 표시)
function renderAvailablePolicies() {
  const container = document.getElementById('availablePoliciesList');
  const term = (document.getElementById('addPolicySearch').value || "").toLowerCase();
  const attachedIds = new Set((currentRolePolicies || []).map(p => String(p.id)));
  const list = (availablePolicies || []).filter(p =>
    !term || (p.name || "").toLowerCase().includes(term) || (p.policy_arn || "").toLowerCase().includes(term)
  );
  if (list.length === 0) {
    container.innerHTML = '<div class="text-muted text-center py-3">No policies found. Create a policy or import policies from the CSP.</div>';
    return;
  }
  let html = '<div class="list-group">';
  list.forEach(policy => {
    const attached = attachedIds.has(String(policy.id));
    html += `
      <label class="list-group-item d-flex justify-content-between align-items-center policy-item" data-policy-id="${escapeHtml(policy.id)}" data-policy-name="${escapeHtml(policy.name)}">
        <div class="me-3">
          <div class="fw-bold">${escapeHtml(policy.name)}
            <span class="badge bg-azure-lt ms-1">${escapeHtml(policyTypeLabel(policy.policy_type))}</span>
            ${attached ? '<span class="badge bg-green-lt ms-1">attached to this role</span>' : ''}
          </div>
          <small class="text-muted d-block">ID: ${escapeHtml(policy.id)}${policy.policy_arn ? ' · ' + escapeHtml(policy.policy_arn) : ''}</small>
          <small class="text-muted d-block">${escapeHtml(policy.description || 'No description')}</small>
        </div>
        <input class="form-check-input" type="radio" name="selectedPolicy" value="${escapeHtml(policy.id)}">
      </label>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// 선택된 정책 연결 — result 가 applied 인지로 판정 (AWS 반영 실패도 HTTP 200)
async function addSelectedPolicy() {
  const selected = document.querySelector('input[name="selectedPolicy"]:checked');
  if (!selected) {
    notify("warning", "Please select a policy to attach.");
    return;
  }
  if (!currentClickedCspRoleId) {
    notify("warning", "Please select a CSP Role first.");
    return;
  }
  const policy = (availablePolicies || []).find(p => String(p.id) === String(selected.value)) || { id: selected.value, name: selected.value };
  await attachPolicyAndReport(policy);
}

// attach 호출 + 결과 표시 + 목록 새로고침
async function attachPolicyAndReport(policy) {
  const label = `${policy.name} (ID ${policy.id})`;
  try {
    const result = await window.webconsolejs["common/api/services/csproles_api"].bindPolicyToRole(currentClickedCspRoleId, policy.id);
    hideModal('addPolicyModal');
    const item = bindingResultItem(label, result, "applied");
    if (item.ok === true) {
      notify("success", `Policy attached and applied: ${policy.name}`);
    } else {
      showPolicyResult("Policy saved, but not applied to AWS", [item],
        "The binding was saved but applying it to the CSP failed. Fix the cause and use Retry apply.");
    }
  } catch (error) {
    hideModal('addPolicyModal');
    let summary = "";
    if (error.status === 400 && policy.policy_type === "inline") {
      summary = "An inline policy can be attached to only one CSP Role. Use a customer managed policy to share it across roles.";
    }
    showPolicyResult("Failed to attach policy", [{ ok: false, label, detail: formatPolicyError(error) }], summary);
  }
  await loadCspRolePolicies(currentClickedCspRoleId);
}

// Attach 모달에서 선택한 정책 편집 (Role 에 연결되지 않은 정책도 이름·ARN·설명·문서를 고칠 수 있게)
function editSelectedAvailablePolicy() {
  const selected = document.querySelector('input[name="selectedPolicy"]:checked');
  if (!selected) {
    notify("warning", "Please select a policy to edit.");
    return;
  }
  hideModal('addPolicyModal');
  showPolicyEditor(selected.value);
}

// Attach 모달에서 선택한 정책 삭제 (연결이 남아 있으면 IAM 이 409 를 돌려준다)
async function deleteSelectedAvailablePolicy() {
  const selected = document.querySelector('input[name="selectedPolicy"]:checked');
  if (!selected) {
    notify("warning", "Please select a policy to delete.");
    return;
  }
  const policy = (availablePolicies || []).find(p => String(p.id) === String(selected.value)) || { id: selected.value, name: selected.value };
  if (!confirm(`Delete policy "${policy.name}"? A customer managed mciam-* policy is also deleted from AWS.`)) return;
  await deletePolicyAndReport(policy);
  await loadAvailablePolicies();
}

async function deletePolicyAndReport(policy) {
  const label = `${policy.name} (ID ${policy.id})`;
  try {
    await window.webconsolejs["common/api/services/csproles_api"].deleteCspPolicy(policy.id);
    notify("success", `Policy deleted: ${policy.name}`);
    return true;
  } catch (error) {
    showPolicyResult("Failed to delete policy", [{ ok: false, label, detail: formatPolicyError(error) }]);
    return false;
  }
}

// 정책 목록 새로고침
function refreshPoliciesList() {
  if (currentClickedCspRoleId) {
    loadCspRolePolicies(currentClickedCspRoleId);
  }
}

// 모든 정책 선택 (Tabulator 사용)
function selectAllPolicies() {
  if (!cspRolePoliciesTable) {
    console.warn("Policies table not initialized");
    return;
  }

  cspRolePoliciesTable.selectRow();
}

// 모든 정책 선택 해제 (Tabulator 사용)
function unselectAllPolicies() {
  if (!cspRolePoliciesTable) {
    console.warn("Policies table not initialized");
    return;
  }

  cspRolePoliciesTable.deselectRow();
}

// 정책 언바인딩 — 선택한 행의 정책 ID 마다 detach 를 순서대로 호출하고 항목별 결과를 한 번에 보여 준다
async function unbindPolicies() {
  if (!cspRolePoliciesTable) {
    notify("warning", "No policies linked to this CSP Role.");
    return;
  }

  const selectedRows = cspRolePoliciesTable.getSelectedRows();
  if (selectedRows.length === 0) {
    notify("warning", "Please select a policy to unbind.");
    return;
  }

  const targets = selectedRows.map(row => row.getData());
  if (!confirm(`Are you sure you want to remove the selected ${targets.length} policies from the CSP Role?`)) return;

  const roleId = currentClickedCspRoleId;
  const items = [];
  for (const policy of targets) {
    const label = `${policy.name} (ID ${policy.id})`;
    try {
      const result = await window.webconsolejs["common/api/services/csproles_api"].unbindPolicyFromRole(roleId, policy.id);
      items.push(bindingResultItem(label, result, "detached"));
    } catch (error) {
      items.push({ ok: false, label, detail: formatPolicyError(error) });
    }
  }
  const okCount = items.filter(i => i.ok === true).length;
  showPolicyResult("Unbind Policies", items, `${okCount} of ${items.length} policies detached.`);
  await loadCspRolePolicies(roleId);
}

// 정책 가져오기 (Import) - 현재 선택된 정책의 Context JSON에 추가
function importPolicy() {

  if (!selectedPolicyId) {
    notify('warning', 'Please select a policy first.');
    return;
  }

  // 파일 입력 요소 생성
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';

  fileInput.onchange = async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileContent = await readFileContent(file);
      const importedPolicy = JSON.parse(fileContent);

      // 가져온 정책 데이터 검증
      // AWS IAM 정책 형식 (Version, Statement) 또는 전체 정책 객체 형식 지원
      if (!importedPolicy.Statement && !importedPolicy.document?.Statement) {
        throw new Error('The policy file does not contain Statement. It should be in AWS IAM policy format.');
      }

      // 현재 선택된 정책의 Context JSON 가져오기
      const contextTextarea = document.getElementById('policy-detail-context');
      if (!contextTextarea) {
        throw new Error('Policy Context not found.');
      }

      let currentContext = {};
      try {
        currentContext = JSON.parse(contextTextarea.value || '{}');
      } catch (parseError) {
        throw new Error('The current policy Context JSON format is not valid.');
      }

      // Context JSON에 가져온 정책의 Statement 추가
      if (!currentContext.Statement) {
        currentContext.Statement = [];
      }

      // 가져온 정책의 Statement를 현재 Context에 추가
      let statementsToAdd = [];

      if (importedPolicy.document && importedPolicy.document.Statement) {
        // 전체 정책 객체 형식 (name, document 포함)
        statementsToAdd = importedPolicy.document.Statement;
      } else if (importedPolicy.Statement) {
        // AWS IAM 정책 형식 (Version, Statement)
        statementsToAdd = importedPolicy.Statement;
      }

      // 각 Statement에 고유한 Sid 추가 (중복 방지)
      statementsToAdd.forEach((statement, index) => {
        if (!statement.Sid) {
          statement.Sid = `ImportedPolicy_${Date.now()}_${index + 1}`;
        }
        currentContext.Statement.push(statement);
      });

      // Context JSON 업데이트
      contextTextarea.value = JSON.stringify(currentContext, null, 2);
      updatePolicyContextPreview();

      notify('success', 'The policy was successfully imported. Use Edit Policy to save it.');

    } catch (error) {
      console.error("Error importing policy:", error);
      notify('error', 'Error importing policy: ' + error.message);
    }
  };

  // 파일 선택 다이얼로그 표시
  document.body.appendChild(fileInput);
  fileInput.click();
  document.body.removeChild(fileInput);
}

// 파일 내용 읽기 헬퍼 함수
function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

// 정책 상세 보기
function viewPolicy(bindingId) {
  showPolicyEditor(bindingId);
}

// 정책 에디터 모달 표시
async function showPolicyEditor(policyId) {
  try {
    const api = window.webconsolejs["common/api/services/csproles_api"];
    const policy = await api.getCspPolicyById(policyId);
    editingPolicy = policy;
    setModalError('policyEditorError', '');

    // 문서: DB 문서(policy_doc) 우선, 없으면 AWS 문서 조회 (managed·IAM 밖 custom)
    // 문서를 못 읽으면 빈 {} 로 덮지 않고 편집기 안에 오류를 보여 준다 (문서 영역은 비우고 읽기 전용)
    let doc = policy.policy_doc;
    let docLoadError = null;
    if (!doc || Object.keys(doc).length === 0) {
      try {
        doc = await api.getPolicyDocument(policyId);
      } catch (docError) {
        console.warn("Policy document not available:", docError);
        docLoadError = docError;
        doc = null;
      }
    }
    editingPolicy._loadedDocText = docLoadError ? '' : JSON.stringify(doc || {}, null, 2);

    document.getElementById('policyEditorName').value = policy.name || '';
    document.getElementById('policyEditorId').value = policy.id || '';
    document.getElementById('policyEditorType').value = policyTypeLabel(policy.policy_type);
    document.getElementById('policyEditorDescription').value = policy.description || '';
    document.getElementById('policyEditorArn').value = policy.policy_arn || '';
    document.getElementById('policyEditorAccount').value = policy.csp_account_id ?? '';
    document.getElementById('policyEditorDocument').value = editingPolicy._loadedDocText;

    // managed·IAM 밖 custom 은 문서를 읽기 전용으로 연다. inline 은 ARN 이 없다
    const editable = canEditPolicyDocument(policy);
    const documentTextarea = document.getElementById('policyEditorDocument');
    documentTextarea.readOnly = !editable || !!docLoadError;
    if (docLoadError) {
      setModalError('policyEditorError', "Failed to load policy document: " + formatPolicyError(docLoadError));
    }
    document.getElementById('policyEditorArn').readOnly = policy.policy_type === "inline" || isIamOwnedCustom(policy);
    const notice = document.getElementById('policyEditorReadonlyNotice');
    if (notice) {
      if (editable) {
        notice.style.display = 'none';
        notice.textContent = '';
      } else {
        notice.style.display = 'block';
        notice.textContent = policy.policy_type === "managed"
          ? "AWS managed policy: the document is read-only. You can change the name, ARN and description."
          : "Customer managed policy outside IAM (not mciam-*): the document is read-only.";
      }
    }

    const container = document.getElementById('policyDocumentContainer');
    const preview = document.getElementById('policyDocumentPreview');
    if (container && preview) {
      container.style.display = 'block';
      preview.style.display = 'none';
    }
    updatePolicyDocumentPreview();

    const modalElement = document.getElementById('policyEditorModal');
    bootstrap.Modal.getOrCreateInstance(modalElement).show();
    modalElement.addEventListener('hidden.bs.modal', function () {
      const detailPanel = document.getElementById('policy-detail-panel');
      if (detailPanel && detailPanel.style.display === 'none' && selectedPolicyId) {
        detailPanel.style.display = 'block';
      }
    }, { once: true });

    addPolicyDocumentListeners();
  } catch (error) {
    console.error("Error loading policy details:", error);
    showPolicyResult("Failed to load policy", [{ ok: false, label: `Policy ID ${policyId}`, detail: formatPolicyError(error) }]);
  }
}

// 정책 문서 토글 (Expand/Collapse)
function togglePolicyDocument() {
  const documentTextarea = document.getElementById('policyEditorDocument');
  const toggleText = document.getElementById('policyDocumentToggleText');

  if (documentTextarea && toggleText) {
    const currentRows = parseInt(documentTextarea.getAttribute('rows')) || 25;

    if (currentRows === 25) {
      // Expand: 25줄 → 40줄로 확장
      documentTextarea.setAttribute('rows', 40);
      documentTextarea.style.height = 'auto';
      documentTextarea.style.minHeight = '800px';
      toggleText.textContent = 'Collapse';
    } else {
      // Collapse: 40줄 → 25줄로 축소
      documentTextarea.setAttribute('rows', 25);
      documentTextarea.style.height = 'auto';
      documentTextarea.style.minHeight = '500px';
      toggleText.textContent = 'Expand';
    }
  }
}

// 정책 문서 미리보기 업데이트
function updatePolicyDocumentPreview() {
  const documentText = document.getElementById('policyEditorDocument').value;
  const preview = document.getElementById('policyDocumentPreview');

  try {
    const parsed = JSON.parse(documentText);
    preview.innerHTML = `<pre class="mb-0">${JSON.stringify(parsed, null, 2)}</pre>`;
  } catch (error) {
    preview.innerHTML = '<div class="text-danger">Invalid JSON format</div>';
  }
}

// 정책 문서 에디터 이벤트 리스너 추가
function addPolicyDocumentListeners() {
  const documentTextarea = document.getElementById('policyEditorDocument');
  if (documentTextarea) {
    documentTextarea.addEventListener('input', updatePolicyDocumentPreview);
  }
}

// 정책 문서 클리어
function clearPolicyDocument() {
  document.getElementById('policyEditorDocument').value = '';
  updatePolicyDocumentPreview();
}

// CSP Role 선택 상태 복원
async function restoreCspRoleSelection() {
  if (currentCspRoleId && cspRolesListTable) {
    try {
      const row = cspRolesListTable.getRow(currentCspRoleId);
      if (row) {
        // CSP Role 정보 섹션 활성화
        const cspRoleInfoElement = document.getElementById('csp_role_info');
        if (cspRoleInfoElement) {
          // 다른 섹션들을 먼저 비활성화
          document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
          });
          // csp_role_info 섹션 활성화
          cspRoleInfoElement.classList.add('active');
          // 강제로 표시되도록 스타일 설정
          cspRoleInfoElement.style.display = 'block';
          cspRoleInfoElement.style.visibility = 'visible';
          cspRoleInfoElement.style.opacity = '1';
        }

        // 선택된 CSP Role 데이터 다시 로드
        const roleData = row.getData();
        getSelectedCspRoleData(roleData);
      }
    } catch (error) {
      console.error("Error restoring CSP Role selection:", error);
    }
  }
}


// 정책 저장 — 바뀐 필드만 보낸다. HTTP 200 이어도 warnings 가 있으면 Role 반영 실패
async function savePolicyDocument() {
  if (!editingPolicy) return;
  const policy = editingPolicy;
  const name = document.getElementById('policyEditorName').value.trim();
  const description = document.getElementById('policyEditorDescription').value;
  const arn = document.getElementById('policyEditorArn').value.trim();
  const documentText = document.getElementById('policyEditorDocument').value;

  const changes = {};
  if (name !== (policy.name || '')) changes.name = name;
  if (description !== (policy.description || '')) changes.description = description;
  if (policy.policy_type !== "inline" && arn !== (policy.policy_arn || '')) changes.policy_arn = arn;
  setModalError('policyEditorError', '');
  if (canEditPolicyDocument(policy) && policy._loadedDocText && documentText.trim() !== policy._loadedDocText.trim()) {
    try {
      changes.policy_doc = JSON.parse(documentText);
    } catch (e) {
      setModalError('policyEditorError', "Invalid JSON format in Policy Document. Please check your syntax.");
      return;
    }
  }
  if (Object.keys(changes).length === 0) {
    notify("info", "No changes to save.");
    return;
  }

  const label = `${name || policy.name} (ID ${policy.id})`;
  try {
    const result = await window.webconsolejs["common/api/services/csproles_api"].updateCspPolicy(policy.id, changes);
    hideModal('policyEditorModal');
    const warnings = Array.isArray(result?.warnings) ? result.warnings : [];
    const bindingResults = Array.isArray(result?.bindingResults) ? result.bindingResults : [];
    if (warnings.length > 0) {
      const items = [{ ok: "warn", label: `${label} — saved`, detail: "Saved, but applying to CSP Roles failed. Retry is required." }];
      warnings.forEach(w => items.push({ ok: false, label: "Warning", detail: w }));
      bindingResults.forEach(r => items.push({
        ok: r.result === "applied" ? true : false,
        label: `CSP Role ${r.cspRoleId ?? r.csp_role_id ?? ''} — ${r.result || r.awsStatus || ''}`,
        detail: r.message || '',
      }));
      showPolicyResult("Policy saved with warnings", items);
    } else {
      notify("success", `Policy updated: ${name || policy.name}`);
    }
    editingPolicy = null;
    if (currentClickedCspRoleId) {
      await loadCspRolePolicies(currentClickedCspRoleId);
      const updated = (currentRolePolicies || []).find(p => String(p.id) === String(policy.id));
      if (updated) showPolicyDetailPanel(updated);
    }
  } catch (error) {
    // 오류 시 편집기는 열어 두고 편집기 안에 표시한다
    setModalError('policyEditorError', "Failed to update policy: " + formatPolicyError(error));
  }
}

// 정책 가져오기(sync) 모달 — 계정·범위를 고른 뒤 호출
async function showSyncPoliciesModal() {
  await fillAccountSelect('syncPoliciesAccount');
  document.getElementById('syncPoliciesScope').value = 'Local';
  bootstrap.Modal.getOrCreateInstance(document.getElementById('syncPoliciesModal')).show();
}

// 정책 가져오기 (POST /api/csp-policies/sync {csp_account_id, policy_scope})
async function syncPolicies() {
  const accountId = document.getElementById('syncPoliciesAccount').value;
  const scope = document.getElementById('syncPoliciesScope').value || 'Local';
  if (!accountId) {
    notify("warning", "Please select a CSP account.");
    return;
  }
  try {
    const imported = await window.webconsolejs["common/api/services/csproles_api"].syncPolicies(accountId, scope);
    hideModal('syncPoliciesModal');
    const items = imported.slice(0, 50).map(p => ({ ok: true, label: `${p.name} (ID ${p.id})`, detail: `${policyTypeLabel(p.policy_type)}${p.policy_arn ? ' · ' + p.policy_arn : ''}` }));
    if (imported.length > 50) items.push({ ok: true, label: `... and ${imported.length - 50} more`, detail: '' });
    showPolicyResult("Import Policies", items, `${imported.length} policies imported (scope: ${scope}).`);
  } catch (error) {
    showPolicyResult("Failed to import policies", [{ ok: false, label: `Scope ${scope}`, detail: formatPolicyError(error) }]);
  }
}

// ===== 정책 상세 패널 관리 =====

// 정책 상세 패널 표시
async function showPolicyDetailPanel(policyData) {
  // 이전 패널이 열려있다면 먼저 숨김
  hidePolicyDetailPanel();

  selectedPolicyId = policyData.id;

  document.getElementById('policy-detail-header').textContent = `${policyData.name} / (${policyData.id})`;
  document.getElementById('policy-detail-name').textContent = policyData.name || '-';
  document.getElementById('policy-detail-id').textContent = policyData.id || '-';
  document.getElementById('policy-detail-type').textContent = policyTypeLabel(policyData.policy_type);
  document.getElementById('policy-detail-description').textContent = policyData.description || '-';
  const arnEl = document.getElementById('policy-detail-arn');
  if (arnEl) arnEl.textContent = policyData.policy_arn || '-';
  const statusEl = document.getElementById('policy-detail-aws-status');
  if (statusEl) statusEl.innerHTML = awsStatusBadgeHtml(policyData.aws_status, policyData.last_error)
    + (policyData.applied_at ? ` <small class="text-muted ms-2">applied at ${escapeHtml(policyData.applied_at)}</small>` : '');
  const errEl = document.getElementById('policy-detail-last-error');
  if (errEl) errEl.textContent = policyData.last_error || '';

  // Context JSON — DB 문서가 없으면(managed·IAM 밖 custom) AWS 문서를 조회
  const contextTextarea = document.getElementById('policy-detail-context');
  contextTextarea.value = JSON.stringify(policyData.policy_doc || {}, null, 2);
  updatePolicyContextPreview();
  if (!policyData.policy_doc || Object.keys(policyData.policy_doc).length === 0) {
    window.webconsolejs["common/api/services/csproles_api"].getPolicyDocument(policyData.id).then(doc => {
      if (String(selectedPolicyId) !== String(policyData.id)) return;
      contextTextarea.value = JSON.stringify(doc || {}, null, 2);
      updatePolicyContextPreview();
    }).catch(err => {
      if (String(selectedPolicyId) !== String(policyData.id)) return;
      contextTextarea.value = '';
      document.getElementById('policy-context-preview').innerHTML =
        `<div class="text-danger policy-doc-error">Document not available: ${escapeHtml(formatPolicyError(err))}</div>`;
    });
  }

  // 패널 표시 (애니메이션 효과)
  const panel = document.getElementById('policy-detail-panel');
  setTimeout(() => {
    panel.style.display = 'block';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(20px)';
    setTimeout(() => {
      panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    }, 10);
  }, 220);

  if (contextTextarea && !contextTextarea.dataset.previewBound) {
    contextTextarea.addEventListener('input', updatePolicyContextPreview);
    contextTextarea.dataset.previewBound = "1";
  }
}

// 정책 상세 패널 숨김
function hidePolicyDetailPanel() {
  const panel = document.getElementById('policy-detail-panel');
  if (panel && panel.style.display !== 'none') {
    // 애니메이션 효과로 숨김
    panel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(-10px)';

    // 애니메이션 완료 후 완전히 숨김
    setTimeout(() => {
      panel.style.display = 'none';
      panel.style.transition = '';
      panel.style.opacity = '';
      panel.style.transform = '';
    }, 200);

    selectedPolicyId = '';
  }
}


// 정책 Context JSON 토글 (모달로 열기)
function togglePolicyContextJson() {
  const jsonContent = document.getElementById('policy-detail-context').value;

  // JSON 에디터 모달에 내용 설정
  document.getElementById('jsonEditorContent').value = jsonContent;

  // 모달 열기
  const modal = new bootstrap.Modal(document.getElementById('jsonEditorModal'));
  modal.show();
}

// 정책 Context JSON 클리어
function clearPolicyContextJson() {
  if (confirm('Are you sure you want to clear the policy Context JSON?')) {
    document.getElementById('policy-detail-context').value = '';
    updatePolicyContextPreview();
  }
}


// 정책 Context 미리보기 업데이트
function updatePolicyContextPreview() {
  const context = document.getElementById('policy-detail-context').value;
  const preview = document.getElementById('policy-context-preview');

  try {
    const parsed = JSON.parse(context);
    preview.innerHTML = `<pre class="mb-0">${JSON.stringify(parsed, null, 2)}</pre>`;
  } catch (error) {
    preview.innerHTML = '<div class="text-danger">Invalid JSON format</div>';
  }
}

// 선택된 정책 편집
function editSelectedPolicy() {
  if (!selectedPolicyId) {
    notify('warning', 'Please select a policy first.');
    return;
  }

  // 상세페이지 상태 저장
  const detailPanel = document.getElementById('policy-detail-panel');
  const isDetailPanelVisible = detailPanel && detailPanel.style.display !== 'none';

  // 정책 에디터 모달로 이동
  showPolicyEditor(selectedPolicyId);

  // 모달이 표시된 후 상세페이지 상태 복원
  setTimeout(() => {
    if (isDetailPanelVisible && detailPanel) {
      detailPanel.style.display = 'block';
    }
  }, 100);
}


// 정책 문서 보기
function viewPolicyDocument(policyId) {
  // TODO: 정책 문서 보기 모달 구현
  notify('warning', `Viewing policy document for policy ${policyId} is not supported yet.`);
}

// 정책 정렬 (Tabulator 내장 정렬 사용)
function sortPolicies(field, direction) {

  if (!cspRolePoliciesTable) {
    console.warn("Policies table not initialized");
    return;
  }

  // Tabulator의 내장 정렬 기능 사용
  cspRolePoliciesTable.setSort(field, direction === 'asc' ? 'asc' : 'desc');

}

// 정책 내보내기
function exportPolicies() {
  // TODO: 정책 내보내기 기능 구현
  notify('warning', 'Exporting policies is not supported yet.');
}

// 정책 필터 초기화
function clearPoliciesFilter() {
  document.getElementById('policies-filter-field').value = 'name';
  document.getElementById('policies-filter-type').value = 'like';
  document.getElementById('policies-filter-value').value = '';
  // TODO: 필터 적용 로직 구현
  refreshPoliciesList();
}

// 필터 클리어 버튼 이벤트 연결
document.addEventListener('DOMContentLoaded', function () {
  const clearButton = document.getElementById('policies-filter-clear');
  if (clearButton) {
    clearButton.addEventListener('click', clearPoliciesFilter);
  }
});

// 전역 함수로 노출
window.showAddPolicyModal = showAddPolicyModal;
window.refreshPoliciesList = refreshPoliciesList;
window.selectAllPolicies = selectAllPolicies;
window.unselectAllPolicies = unselectAllPolicies;
window.unbindPolicies = unbindPolicies;
window.importPolicy = importPolicy;
window.viewPolicy = viewPolicy;
window.viewPolicyDocument = viewPolicyDocument;
window.sortPolicies = sortPolicies;
window.exportPolicies = exportPolicies;
window.clearPoliciesFilter = clearPoliciesFilter;


// CSP Role 삭제 (모달에서 호출) — 판정은 HTTP 상태 기준(2xx 면 성공, 4xx·5xx 는 IAM error 메시지 표시)
export async function deleteCspRole() {
  if (!currentClickedCspRoleId) {
    notify('warning', 'Please select a CSP Role to delete.');
    return;
  }
  const roleId = currentClickedCspRoleId;
  const roleName = document.getElementById('csp_role_info_name')?.textContent || String(roleId);
  try {
    await window.webconsolejs["common/api/services/csproles_api"].deleteCspRole(roleId);
  } catch (error) {
    console.error("Error deleting CSP Role:", error);
    showPolicyResult("Failed to delete CSP Role", [{ ok: false, label: roleName, detail: formatPolicyError(error) }]);
    return;
  }
  if (cspRolesListTable) {
    cspRolesListTable.deleteRow(roleId);
  }
  webconsolejs["partials/layout/navigatePages"].deactiveElement(document.getElementById("csp_role_info"));
  hidePolicyDetailPanel();
  currentClickedCspRoleId = "";
  currentCspRoleId = null;
  notify('success', `CSP Role deleted: ${roleName}`);
}

// 정책 삭제 (모달에서 호출) — 409(연결된 Role 이 있음, IAM 밖 연결이 있음) 메시지를 그대로 보여 준다
export async function deletePolicy() {
  if (!selectedPolicyId) {
    notify("warning", "Please select a policy to delete.");
    return;
  }
  const policy = (currentRolePolicies || []).find(p => String(p.id) === String(selectedPolicyId)) || { id: selectedPolicyId, name: String(selectedPolicyId) };
  const ok = await deletePolicyAndReport(policy);
  if (ok) {
    hidePolicyDetailPanel();
    selectedPolicyId = "";
    if (currentClickedCspRoleId) await loadCspRolePolicies(currentClickedCspRoleId);
  }
}

// 필터 기능 초기화
function initFilter() {
  // 필터 적용 버튼
  document.getElementById('filter-value').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      applyFilter();
    }
  });

  // 필터 초기화 버튼
  document.getElementById('filter-clear').addEventListener('click', function () {
    clearFilter();
  });
}

// 필터 적용
function applyFilter() {
  const field = document.getElementById('filter-field').value;
  const type = document.getElementById('filter-type').value;
  const value = document.getElementById('filter-value').value;

  if (!value) {
    clearFilter();
    return;
  }

  if (cspRolesListTable) {
    cspRolesListTable.setFilter(field, type, value);
  }
}

// 필터 초기화
function clearFilter() {
  document.getElementById('filter-value').value = '';
  if (cspRolesListTable) {
    cspRolesListTable.clearFilter();
  }
}

// 페이지 로드 시 초기화 (Roles 페이지와 동일한 패턴)
document.addEventListener("DOMContentLoaded", async function () {
  // 페이지 헤더에 Add CSP Role 버튼 추가
  if (typeof webconsolejs !== 'undefined' && webconsolejs['partials/layout/navigatePages']) {
    webconsolejs['partials/layout/navigatePages'].addPageHeaderButton(
      null,
      "Add CSP Role",
      "showAddCspRoleModal(event)"
    );
  }
  await initCspRoles();
});

// 해당 화면에서 최초 설정하는 function
async function initCspRoles() {
  initCspRolesTable(); // init tabulator
  initFilter(); // 필터 초기화
  refreshCspRolesList(); // 데이터 로드
}

// CSP Role 추가 모달 표시
async function showAddCspRoleModal() {
  // 폼 초기화
  document.getElementById('addCspRoleForm').reset();

  // CSP Type 드롭다운 로드
  await loadCspTypeOptions();

  const modal = new bootstrap.Modal(document.getElementById('addCspRoleModal'));
  modal.show();
}

// CSP Type 드롭다운 로드
async function loadCspTypeOptions() {
  try {
    const providers = await window.webconsolejs["common/api/services/csproles_api"].getCspProviders();
    const select = document.getElementById('addCspType');
    select.innerHTML = '<option value="">Select CSP Type</option>';

    if (providers && providers.length > 0) {
      providers.forEach(provider => {
        const option = document.createElement('option');
        option.value = typeof provider === 'object' ? provider.provider : provider;
        option.textContent = option.value.toUpperCase();
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error loading CSP type list:", error);
  }
}

// 사용 가능한 CSP Role 목록 로드
async function loadAvailableCspRoles() {
  const provider = document.getElementById('addCspRoleProvider').value;
  const container = document.getElementById('availableCspRolesList');

  if (!provider) {
    container.innerHTML = '<div class="text-muted text-center py-3">Select a CSP Provider to view available roles</div>';
    return;
  }

  try {
    container.innerHTML = '<div class="text-center py-3"><div class="spinner-border spinner-border-sm" role="status"></div> Loading roles...</div>';

    const roles = await window.webconsolejs["common/api/services/csproles_api"].getCspRoleList(provider);

    if (!roles || roles.length === 0) {
      container.innerHTML = '<div class="text-muted text-center py-3">No roles available for this provider</div>';
      return;
    }

    // 역할 목록 표시
    let html = '<div class="list-group">';
    roles.forEach(role => {
      html += `
        <div class="list-group-item d-flex justify-content-between align-items-center csp-role-item" data-role-id="${role.id}">
          <div>
            <h6 class="mb-1">${role.name}</h6>
            <small class="text-muted">ID: ${role.id}</small>
            <br>
            <small class="text-muted">${role.description || 'No description'}</small>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="selectedCspRole" value="${role.id}">
          </div>
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  } catch (error) {
    console.error("Error loading CSP Role list:", error);
    container.innerHTML = '<div class="text-danger text-center py-3">Error loading roles</div>';
  }
}

// CSP Role 검색 필터
function filterAvailableCspRoles() {
  const searchTerm = document.getElementById('addCspRoleSearch').value.toLowerCase();
  const roleItems = document.querySelectorAll('.csp-role-item');

  roleItems.forEach(item => {
    const roleName = item.querySelector('h6').textContent.toLowerCase();
    const roleId = item.querySelector('small').textContent.toLowerCase();

    if (roleName.includes(searchTerm) || roleId.includes(searchTerm)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}


// 정책 생성 모달 표시
async function showCreatePolicyModal() {
  document.getElementById('createPolicyForm').reset();
  setModalError('createPolicyError', '');
  document.getElementById('createPolicyType').value = 'inline';
  document.getElementById('createPolicyCustomModeNew').checked = true;
  const attachAfter = document.getElementById('createPolicyAttachAfter');
  attachAfter.checked = !!currentClickedCspRoleId;
  attachAfter.disabled = !currentClickedCspRoleId;
  onCreatePolicyTypeChange();
  bootstrap.Modal.getOrCreateInstance(document.getElementById('createPolicyModal')).show();
  await fillAccountSelect('createPolicyAccount');
}

// 정책 타입별 입력 전환 — inline: 이름+문서 / managed: ARN / custom: 새로 만들기(문서) 또는 기존 정책 등록(ARN)
function onCreatePolicyTypeChange() {
  const type = document.getElementById('createPolicyType').value;
  const customMode = document.querySelector('input[name="createPolicyCustomMode"]:checked')?.value || 'new';
  const useArn = type === 'managed' || (type === 'custom' && customMode === 'arn');
  document.getElementById('createPolicyCustomModeGroup').style.display = type === 'custom' ? 'block' : 'none';
  document.getElementById('createPolicyArnGroup').style.display = useArn ? 'block' : 'none';
  document.getElementById('createPolicyDocumentGroup').style.display = useArn ? 'none' : 'block';

  const nameLabel = document.getElementById('createPolicyNameLabel');
  const nameHint = document.getElementById('createPolicyNameHint');
  const arnInput = document.getElementById('createPolicyArn');
  const arnHint = document.getElementById('createPolicyArnHint');
  nameLabel.classList.toggle('required', !useArn);
  if (type === 'custom' && customMode === 'new') {
    nameHint.textContent = 'IAM creates this policy in AWS. The prefix "mciam-" is added to the name (e.g. mciam-<name>). It can be shared by several CSP Roles.';
  } else if (type === 'inline') {
    nameHint.textContent = 'An inline policy is a copy dedicated to one CSP Role.';
  } else {
    nameHint.textContent = 'Optional. If empty, the last part of the ARN is used.';
  }
  if (type === 'managed') {
    arnInput.placeholder = 'arn:aws:iam::aws:policy/ReadOnlyAccess';
    arnHint.textContent = 'AWS managed policy ARN (arn:aws:iam::aws:policy/...). The document cannot be edited.';
  } else {
    arnInput.placeholder = 'arn:aws:iam::<account-id>:policy/<policy-name>';
    arnHint.textContent = 'Existing customer managed policy ARN. Only mciam-* policies can be edited or deleted from IAM.';
  }
  const attachLabel = document.getElementById('createPolicyAttachLabel');
  if (attachLabel) {
    const roleName = document.getElementById('csp_role_info_name')?.textContent || '';
    attachLabel.textContent = currentClickedCspRoleId
      ? `Attach to the selected CSP Role (${roleName}) after creation`
      : 'Attach to the selected CSP Role after creation (select a CSP Role first)';
  }
}

// 새 정책 생성 — {name, csp_account_id, policy_type, policy_arn?, policy_doc?, description}
async function createNewPolicy() {
  const accountId = document.getElementById('createPolicyAccount').value;
  const type = document.getElementById('createPolicyType').value;
  const customMode = document.querySelector('input[name="createPolicyCustomMode"]:checked')?.value || 'new';
  const useArn = type === 'managed' || (type === 'custom' && customMode === 'arn');
  let name = document.getElementById('createPolicyName').value.trim();
  const arn = document.getElementById('createPolicyArn').value.trim();
  const description = document.getElementById('createPolicyDescription').value.trim();
  const documentText = document.getElementById('createPolicyDocument').value.trim();
  const attachAfter = document.getElementById('createPolicyAttachAfter').checked && !!currentClickedCspRoleId;

  if (!accountId) {
    notify("warning", "Please select a CSP account.");
    return;
  }
  setModalError('createPolicyError', '');
  const policyData = { csp_account_id: accountId, policy_type: type, description };
  if (useArn) {
    if (!arn) {
      notify("warning", "Policy ARN is required.");
      return;
    }
    if (type === 'managed' && !arn.startsWith('arn:aws:iam::aws:policy/')) {
      notify("warning", "AWS managed policy ARN must start with arn:aws:iam::aws:policy/");
      return;
    }
    policyData.policy_arn = arn;
    policyData.name = name || arn.split('/').pop();
  } else {
    if (!name || !documentText) {
      notify("warning", "Policy Name and Policy Document are required.");
      return;
    }
    try {
      policyData.policy_doc = JSON.parse(documentText);
    } catch (e) {
      notify("warning", "Invalid JSON format in Policy Document.");
      return;
    }
    policyData.name = name;
  }

  let created;
  try {
    created = await window.webconsolejs["common/api/services/csproles_api"].createCspPolicy(policyData);
  } catch (error) {
    setModalError('createPolicyError', "Failed to create policy: " + formatPolicyError(error));
    return;
  }
  hideModal('createPolicyModal');
  notify("success", `Policy created: ${created?.name || policyData.name}`);
  if (attachAfter && created?.id) {
    await attachPolicyAndReport(created);
  }
}

// CSP Role 편집 모달 열기
async function editCSPRole() {
  // 현재 선택된 CSP Role이 있는지 확인
  if (!currentCspRoleId) {
    notify('warning', 'Please select a CSP Role to edit.');
    return;
  }

  try {
    // 현재 CSP Role 정보 가져오기
    const cspRole = await window.webconsolejs["common/api/services/csproles_api"].getCspRoleById(currentCspRoleId);

    if (!cspRole) {
      notify('error', 'CSP Role not found.');
      return;
    }

    // 편집 모달의 폼에 현재 데이터 채우기
    document.getElementById('editCspRoleName').value = cspRole.name || '';
    document.getElementById('editCspRoleDescription').value = cspRole.description || '';
    document.getElementById('editCspIdpIdentifier').value = cspRole.idp_identifier || cspRole.idpIdentifier || '';
    document.getElementById('editCspIamIdentifier').value = cspRole.iam_identifier || cspRole.iamIdentifier || '';
    document.getElementById('editCspIamRoleId').value = cspRole.iam_role_id || cspRole.iamRoleId || '';
    document.getElementById('editCspPath').value = cspRole.path || '';

    // 편집 모달 열기
    const editModal = new bootstrap.Modal(document.getElementById('editCspRoleModal'));
    editModal.show();

  } catch (error) {
    console.error("Error loading CSP Role information:", error);
    notify('error', 'Error loading CSP Role information: ' + error.message);
  }
}

// 편집된 CSP Role 저장
async function saveEditedCspRole() {
  const description = document.getElementById('editCspRoleDescription').value.trim();
  const idpIdentifier = document.getElementById('editCspIdpIdentifier').value.trim();
  const iamIdentifier = document.getElementById('editCspIamIdentifier').value.trim();
  const iamRoleId = document.getElementById('editCspIamRoleId').value.trim();
  const path = document.getElementById('editCspPath').value.trim();

  // 필수 필드 검증
  if (!description) {
    notify('warning', 'Please fill in all required fields.');
    return;
  }

  try {
    // API 요구사항(CreateCspRoleRequest 스키마)에 맞는 데이터 구조 (name 제외 — 편집 불가)
    const roleData = {
      description: description,
      idpIdentifier: idpIdentifier,
      iamIdentifier: iamIdentifier,
      iamRoleId: iamRoleId,
      path: path,
    };

    const result = await window.webconsolejs["common/api/services/csproles_api"].updateCspRole(currentCspRoleId, roleData);

    if (result) {
      notify('success', 'CSP Role updated successfully.');

      // 모달 닫기
      const modal = bootstrap.Modal.getInstance(document.getElementById('editCspRoleModal'));
      modal.hide();

      // 폼 초기화
      document.getElementById('editCspRoleForm').reset();

      // CSP Role 목록 새로고침
      await refreshCspRolesList();

      // 현재 선택된 CSP Role의 상세 정보도 새로고침
      if (currentCspRoleId) {
        const updatedRole = await window.webconsolejs["common/api/services/csproles_api"].getCspRoleById(currentCspRoleId);
        if (updatedRole) {
          getSelectedCspRoleData(updatedRole);
        }
      }
    } else {
      throw new Error('Failed to update CSP Role');
    }
  } catch (error) {
    console.error("Error updating CSP Role:", error);
    notify('error', 'Error updating CSP Role: ' + error.message);
  }
}

// CSP Role 추가
async function addSelectedCspRole() {
  const cspType = document.getElementById('addCspType').value.trim();
  const cspRoleName = document.getElementById('addCspRoleName').value.trim();
  const authMethod = document.getElementById('addCspAuthMethod').value.trim();
  const description = document.getElementById('addCspRoleDescription').value.trim();
  const idpIdentifier = document.getElementById('addCspIdpIdentifier').value.trim();
  const iamIdentifier = document.getElementById('addCspIamIdentifier').value.trim();
  const iamRoleId = document.getElementById('addCspIamRoleId').value.trim();
  const path = document.getElementById('addCspPath').value.trim();

  // 필수 필드 검증
  if (!cspType || !cspRoleName) {
    notify('warning', 'CSP Type and CSP Role Name are required.');
    return;
  }

  try {
    const roleData = {
      cspRoleName: cspRoleName,
      description: description,
      cspType: cspType,
      authMethod: authMethod,
      idpIdentifier: idpIdentifier,
      iamIdentifier: iamIdentifier,
      iamRoleId: iamRoleId,
      path: path
    };

    const result = await window.webconsolejs["common/api/services/csproles_api"].createCspRole(roleData);

    if (result) {
      notify('success', 'CSP Role added successfully.');

      // 모달 닫기
      const modal = bootstrap.Modal.getInstance(document.getElementById('addCspRoleModal'));
      modal.hide();

      // CSP Role 목록 새로고침
      await refreshCspRolesList();
    } else {
      throw new Error('Failed to add CSP Role');
    }
  } catch (error) {
    console.error("Error adding CSP Role:", error);
    notify('error', 'Error adding CSP Role: ' + error.message);
  }
}


// CSP Role 동기화 — 판정은 HTTP 상태 기준
async function syncCspRoles() {
  if (!confirm('Are you sure you want to sync the CSP Roles?')) return;
  try {
    await window.webconsolejs["common/api/services/csproles_api"].syncCspRoles();
  } catch (error) {
    console.error("Error syncing CSP Roles:", error);
    notify('error', 'Error syncing CSP Roles: ' + formatPolicyError(error));
    return;
  }
  notify('success', 'The CSP Roles were successfully synced.');
  await refreshCspRolesList();
}

// 전역 함수로 노출 (HTML에서 호출용)
window.refreshCspRolesList = refreshCspRolesList;
window.deleteCspRole = deleteCspRole;
window.deletePolicy = deletePolicy;
window.applyFilter = applyFilter;
window.clearFilter = clearFilter;
window.showAddCspRoleModal = showAddCspRoleModal;
window.addSelectedCspRole = addSelectedCspRole;
window.syncCspRoles = syncCspRoles;
window.showAddPolicyModal = showAddPolicyModal;
window.addSelectedPolicy = addSelectedPolicy;
window.syncPolicies = syncPolicies;
window.togglePolicyDocument = togglePolicyDocument;
window.clearPolicyDocument = clearPolicyDocument;
window.savePolicyDocument = savePolicyDocument;
window.addPolicyDocumentListeners = addPolicyDocumentListeners;
window.showPolicyDetailPanel = showPolicyDetailPanel;
window.togglePolicyContextJson = togglePolicyContextJson;
window.clearPolicyContextJson = clearPolicyContextJson;
window.updatePolicyContextPreview = updatePolicyContextPreview;
window.editSelectedPolicy = editSelectedPolicy;
window.createNewPolicy = createNewPolicy;
window.showCreatePolicyModal = showCreatePolicyModal;
window.onCreatePolicyTypeChange = onCreatePolicyTypeChange;
window.showSyncPoliciesModal = showSyncPoliciesModal;
window.deleteSelectedAvailablePolicy = deleteSelectedAvailablePolicy;
window.editSelectedAvailablePolicy = editSelectedAvailablePolicy;
window.editCSPRole = editCSPRole;
window.saveEditedCspRole = saveEditedCspRole;
