// CSP Roles API Service
// mc-iam-manager API를 통한 CSP Roles 관리

// mc-iam-manager CspRole 응답은 csp_type(snake_case) — 화면 코드는 provider 필드를 읽으므로 정규화한다.
function normalizeCspRole(raw) {
    if (!raw) return raw;
    return { ...raw, provider: raw.provider ?? raw.cspType ?? raw.csp_type };
}

function normalizeCspRoleList(list) {
    return Array.isArray(list) ? list.map(normalizeCspRole) : list;
}

// CSP Roles 목록 조회
export async function getCspRoleList(provider = null, limit = 50, offset = 0) {
    const controller = "/api/mc-iam-manager/listCSPRoles";
    const data = {
        Request: {
            provider: provider,
            limit: limit,
            offset: offset
        }
    };
    const response = await webconsolejs["common/api/http"].commonAPIPost(controller, data);
    return normalizeCspRoleList(response.data.responseData);
}

// 특정 CSP Role 조회
export async function getCspRoleById(roleId) {
    const controller = "/api/mc-iam-manager/GetCspRoleById";
    const data = {
        pathParams: {
            roleId: roleId.toString()
        }
    };
    const response = await webconsolejs["common/api/http"].commonAPIPost(controller, data);
    return normalizeCspRole(response.data.responseData);
}

// CSP Role 생성
export async function createCspRole(roleData) {
    const data = {
        Request: {
            cspRoleName: roleData.cspRoleName,
            description: roleData.description,
            cspType: roleData.cspType,
            authMethod: roleData.authMethod,
            idpIdentifier: roleData.idpIdentifier,
            iamIdentifier: roleData.iamIdentifier,
            iamRoleId: roleData.iamRoleId,
            path: roleData.path,
            cspIdpConfigId: roleData.cspIdpConfigId,
            tags: roleData.tags || []
        }
    };
    // 오류는 IAM error 메시지로 throw (toPolicyApiError)
    const body = await callPolicyApi("CreateCspRole", data, 'Failed to create CSP Role');
    return normalizeCspRole(body);
}

// CSP Role 수정
export async function updateCspRole(roleId, roleData) {
    const data = {
        pathParams: {
            roleId: roleId.toString()
        },
        Request: {
            cspRoleName: roleData.cspRoleName,
            description: roleData.description,
            authMethod: roleData.authMethod,
            idpIdentifier: roleData.idpIdentifier,
            iamIdentifier: roleData.iamIdentifier,
            iamRoleId: roleData.iamRoleId,
            path: roleData.path,
            cspIdpConfigId: roleData.cspIdpConfigId,
        }
    };
    const body = await callPolicyApi("UpdateCspRole", data, 'Failed to update CSP Role');
    return normalizeCspRole(body);
}

// CSP Role 삭제 — 2xx 면 성공(true), 4xx·5xx 는 IAM error 로 throw
export async function deleteCspRole(roleId) {
    await callPolicyApi("DeleteCspRole", {
        pathParams: {
            roleId: roleId.toString()
        }
    }, 'Failed to delete CSP Role');
    return true;
}

// ===== CSP Policies API Functions =====
// mc-iam-manager CSP Policy API (IAM-BUG-044·IAM-TECH-052 계약)
// - 요청·응답 필드는 snake_case. attach·detach 응답만 camelCase({result, cspRoleId, cspPolicyId, awsStatus, errorCode, message, warnings})
// - 오류 응답은 {error, errorCode}. commonAPIPost 는 4xx·5xx 에서 axios error 를 throw 하고,
//   BFF 는 IAM 본문을 error.response.data.responseData 에 그대로 담는다 → toPolicyApiError 로 정규화해 호출부에 넘긴다.

// axios error → Error(message=IAM error, status, errorCode)
function toPolicyApiError(error, fallbackMessage) {
    const status = error?.response?.status;
    const body = error?.response?.data?.responseData;
    let message = fallbackMessage;
    let errorCode = "";
    if (body && typeof body === "object") {
        message = body.error || body.message || message;
        errorCode = body.errorCode || "";
    } else if (typeof body === "string" && body) {
        message = body;
    } else if (!status && error?.message) {
        message = error.message;
    }
    const err = new Error(message);
    err.status = status;
    err.errorCode = errorCode;
    return err;
}

// 정책 API 공통 호출 — 공통 오류 toast 를 끄고(silentErrors) IAM 의 error·errorCode 를 호출부가 직접 표시한다
async function callPolicyApi(operationId, data, fallbackMessage) {
    const controller = "/api/mc-iam-manager/" + operationId;
    try {
        const response = await webconsolejs["common/api/http"].commonAPIPost(controller, data, undefined, { silentErrors: true });
        return response?.data?.responseData;
    } catch (error) {
        throw toPolicyApiError(error, fallbackMessage);
    }
}

// 값이 있는 키만 남긴다 (빈 필터·바뀌지 않은 필드는 보내지 않는다)
function compactRequest(obj) {
    const out = {};
    Object.entries(obj || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") out[k] = v;
    });
    return out;
}

// CSP Policies 목록 조회 — filter: {csp_account_id?, policy_type?, name?}
export async function getCspPolicyList(filter = {}) {
    const request = compactRequest({
        csp_account_id: filter.csp_account_id ? Number(filter.csp_account_id) : undefined,
        policy_type: filter.policy_type,
        name: filter.name,
    });
    const body = await callPolicyApi("listCspPolicies", { Request: request }, "Failed to load policies");
    return Array.isArray(body) ? body : [];
}

// 특정 CSP Policy 조회
export async function getCspPolicyById(policyId) {
    return callPolicyApi("GetCspPolicyById", {
        pathParams: { policyId: policyId.toString() }
    }, "Failed to load policy");
}

// 정책 문서 조회 — DB 문서(policy_doc) 또는 AWS 문서({document: "<URL 인코딩 JSON>"})를 객체로 돌려준다
export async function getPolicyDocument(policyId) {
    const body = await callPolicyApi("getPolicyDocument", {
        pathParams: { policyId: policyId.toString() }
    }, "Failed to load policy document");
    if (body && typeof body.document === "string") {
        let text = body.document;
        try { text = decodeURIComponent(text); } catch (e) { /* 이미 디코딩된 문자열 */ }
        return JSON.parse(text);
    }
    if (body && body.document && typeof body.document === "object") return body.document;
    if (body && body.policy_doc && typeof body.policy_doc === "object") return body.policy_doc;
    return body;
}

// CSP Policy 생성 — {name, csp_account_id, policy_type, policy_arn?, policy_doc?, description?} → 201 CspPolicy
export async function createCspPolicy(policyData) {
    const request = compactRequest({
        name: policyData.name,
        csp_account_id: policyData.csp_account_id ? Number(policyData.csp_account_id) : undefined,
        policy_type: policyData.policy_type,
        policy_arn: policyData.policy_arn,
        policy_doc: policyData.policy_doc,
        description: policyData.description,
    });
    return callPolicyApi("CreateCspPolicy", { Request: request }, "Failed to create policy");
}

// CSP Policy 수정 — 바뀐 필드만 보낸다(연결 중 이름·ARN 을 다시 보내면 409 가 날 수 있다)
// 응답: CspPolicy 필드 + bindingResults[] + warnings[] (Role 반영 실패도 200 → warnings 로 판정)
export async function updateCspPolicy(policyId, changes) {
    const request = {};
    ["name", "policy_arn", "policy_doc", "description"].forEach((k) => {
        if (changes && Object.prototype.hasOwnProperty.call(changes, k)) request[k] = changes[k];
    });
    return callPolicyApi("UpdateCspPolicy", {
        pathParams: { policyId: policyId.toString() },
        Request: request
    }, "Failed to update policy");
}

// CSP Policy 삭제 — 204
export async function deleteCspPolicy(policyId) {
    await callPolicyApi("DeleteCspPolicy", {
        pathParams: { policyId: policyId.toString() }
    }, "Failed to delete policy");
    return true;
}

// ===== Role-Policy Binding API Functions =====

// 특정 Role에 연결된 Policies 조회 — CspPolicy 필드 + aws_status·last_error·applied_at
export async function getPoliciesByRoleId(roleId) {
    const body = await callPolicyApi("GetPoliciesByRoleId", {
        pathParams: { roleId: roleId.toString() }
    }, "Failed to load role policies");
    return Array.isArray(body) ? body : [];
}

// Role에 Policy 연결 (attach) — 200 {result: applied|failed, ...}. AWS 반영 실패도 200 이므로 result 로 판정
export async function bindPolicyToRole(roleId, policyId) {
    return callPolicyApi("AttachPolicyToRole", {
        Request: {
            csp_role_id: Number(roleId),
            csp_policy_id: Number(policyId)
        }
    }, "Failed to attach policy");
}

// Role에서 Policy 해제 (detach) — 200 {result: detached|detach_failed, ...}
export async function unbindPolicyFromRole(roleId, policyId) {
    return callPolicyApi("DetachPolicyFromRole", {
        Request: {
            csp_role_id: Number(roleId),
            csp_policy_id: Number(policyId)
        }
    }, "Failed to detach policy");
}

// CSP 계정 목록 (정책 생성·가져오기의 csp_account_id 선택용)
export async function listCspAccounts() {
    const body = await callPolicyApi("listCspAccounts", { Request: {} }, "Failed to load CSP accounts");
    return Array.isArray(body) ? body : [];
}

// ===== Provider Management =====

// 사용 가능한 CSP Providers 목록 조회
export async function getCspProviders() {
    const controller = "/api/mc-iam-manager/getTempCredentialProviders";
    const response = await webconsolejs["common/api/http"].commonAPIPost(controller);
    return response.data.responseData;
}

// ===== 동기화 API Functions =====

// CSP Role 동기화 (keycloak sync) — 2xx 면 성공, 4xx·5xx 는 IAM error 로 throw
export async function syncCspRoles() {
    return callPolicyApi("Syncrolelistwithkeycloak", undefined, 'Failed to sync CSP Roles');
}

// CSP Policy 가져오기(sync) — {csp_account_id, policy_scope: Local|AWS|All} → CspPolicy[]
// Local 은 mciam-* 고객 관리형만 들어온다
export async function syncPolicies(accountId, scope = "Local") {
    const body = await callPolicyApi("SyncCspPolicies", {
        Request: {
            csp_account_id: Number(accountId),
            policy_scope: scope
        }
    }, "Failed to import policies");
    return Array.isArray(body) ? body : [];
}

// 대상 CSP Role 존재 확인 (IAM 은 DB·CSP 에 쓰지 않는다)
// cspRoles: [{ cspRoleName, cspType, authMethod, cspIdpConfigId? }]
// 결과: [{ cspRoleName(정규화), cspType, status: exists_in_db|exists_in_csp|not_found|protected|invalid|error, cspRoleId, arn, message }]
export async function checkCspRoles(cspRoles) {
    const controller = "/api/mc-iam-manager/checkCspRoles";
    const data = {
        Request: {
            cspRoles: cspRoles
        }
    };
    const response = await webconsolejs["common/api/http"].commonAPIPost(controller, data);
    const body = response.data.responseData;
    return body && Array.isArray(body.results) ? body.results : [];
}
