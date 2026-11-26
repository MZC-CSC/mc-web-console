/**
 * 공통 결과 표시 유틸
 * - notify(type, message): 단문 성공·실패·안내. common/utils/toast.js 의 showToast 를 쓰고,
 *   toast.js 를 싣지 않는 레이아웃(application.iframe.html)에서는 common/util 의 showToast 로 대신한다.
 * - showResultModal(title, items, summary): 항목별 결과(여러 CSP Role 매핑, 정책 Unbind 등)를 모달 하나로 보여 준다.
 *   모달은 처음 호출할 때 body 에 만든다(템플릿 불필요).
 *   items: [{ ok: true | false | 'warn', label, detail }]
 */

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// type: 'success' | 'warning' | 'error' ('info' 는 warning 으로 표시). 메시지는 텍스트로 다루고 줄바꿈은 <br>
export function notify(type, message) {
  const t = type === "success" || type === "error" ? type : "warning";
  const html = escapeHtml(message).replace(/\n/g, "<br>");
  const toastUtil = window.webconsolejs && window.webconsolejs["common/utils/toast"];
  if (toastUtil && typeof toastUtil.showToast === "function") {
    return toastUtil.showToast(t, html);
  }
  const util = window.webconsolejs && window.webconsolejs["common/util"];
  if (util && typeof util.showToast === "function") {
    return util.showToast(String(message ?? ""), t);
  }
  console.warn("[notify]", t, message);
}

const MODAL_ID = "commonResultModal";

function ensureModal() {
  let el = document.getElementById(MODAL_ID);
  if (el) return el;
  el = document.createElement("div");
  el.className = "modal modal-blur fade";
  el.id = MODAL_ID;
  el.tabIndex = -1;
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="commonResultTitle">Result</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" id="commonResultBody"></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" id="commonResultCloseBtn" data-bs-dismiss="modal">OK</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);
  return el;
}

export function showResultModal(title, items, summary) {
  const list = Array.isArray(items) ? items : [];
  const modalEl = ensureModal();
  const hasError = list.some(i => i.ok === false);
  const hasWarn = list.some(i => i.ok === "warn");
  const titleEl = modalEl.querySelector("#commonResultTitle");
  titleEl.textContent = title || "Result";
  titleEl.className = "modal-title " + (hasError ? "text-danger" : hasWarn ? "text-warning" : "text-success");

  let html = summary ? `<p class="mb-3">${escapeHtml(summary).replace(/\n/g, "<br>")}</p>` : "";
  if (list.length) {
    html += '<ul class="list-group" id="commonResultList">';
    list.forEach(i => {
      const badge = i.ok === true
        ? '<span class="badge bg-green-lt me-2">OK</span>'
        : i.ok === "warn"
          ? '<span class="badge bg-yellow-lt me-2">Warning</span>'
          : '<span class="badge bg-red-lt me-2">Failed</span>';
      html += `<li class="list-group-item common-result-item" data-ok="${escapeHtml(i.ok)}">${badge}<strong>${escapeHtml(i.label)}</strong>`;
      if (i.detail) html += `<div class="small text-muted mt-1 text-break">${escapeHtml(i.detail)}</div>`;
      html += "</li>";
    });
    html += "</ul>";
  }
  modalEl.querySelector("#commonResultBody").innerHTML = html;
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}
