import { TabulatorFull as Tabulator } from "tabulator-tables";
//import { selectedMciObj } from "./mci";
//document.addEventListener("DOMContentLoaded", initMciCreate) // page가 아닌 partials에서는 제거

// 새로운 MCI API 인터페이스에 맞는 데이터 변환 헬퍼 함수
function transformServerConfigToNodeGroups(serverConfigArr) {
  return serverConfigArr.map(config => ({
    specId: config.commonSpec,
    imageId: config.commonImage,
    name: config.name,
    subGroupSize: config.subGroupSize,
    connectionName: config.connectionName,
    description: config.description,
    rootDiskSize: config.rootDiskSize,
    rootDiskType: config.rootDiskType,
    command: config.command
  }));
}

// ─── Data Disk attach at creation time (Create Infra) ──────────────────────
// cb-tumblebug의 Dynamic 생성 API(PostInfraDynamic/PostInfraNodeGroupDynamic)에는
// dataDisk 파라미터가 없어(WEB-TECH-014 ST2 분석) 생성 요청과 attach를 한 번에
// 보낼 수 없다. 대신 생성 요청 후 노드가 Running이 될 때까지 폴링한 뒤, Node
// Detail 탭이 쓰는 것과 동일한 disk_api.js 함수로 attach를 별도 호출한다.
// 1차 범위: NodeGroup Size가 1일 때만 지원(다중 노드는 Node Detail 탭에서 개별 attach).

function _toggleCreateDiskAttachMode() {
	const mode = $("#ep_disk_attach_mode").val();
	$("#ep_disk_attach_existing").toggleClass("d-none", mode !== "existing");
	$("#ep_disk_attach_new").toggleClass("d-none", mode !== "new");
}
$(document).on("change", "#ep_disk_attach_mode", _toggleCreateDiskAttachMode);

// spec 선택(connectionName 확정) 시 호출 — 같은 CSP/리전 후보만 노출(Node Detail 탭과 동일 필터)
async function _populateCreateDiskCandidates(connectionName) {
	const select = document.getElementById("ep_disk_attach_existing_select");
	if (!select) return;
	select.innerHTML = '<option value="">Select</option>';
	if (!connectionName) return;
	try {
		const diskApi = webconsolejs["common/api/services/disk_api"];
		const resp = await diskApi.getAllDataDisk(window.currentNsId);
		const disks = resp?.dataDisk || (Array.isArray(resp) ? resp : []);
		for (const d of disks) {
			if ((d.associatedObjectList || []).length > 0) continue; // 이미 attach된 디스크 제외
			if (d?.connectionName !== connectionName) continue; // 동일 connection(=CSP+리전)만
			const opt = document.createElement("option");
			opt.value = d.id || d.name;
			opt.textContent = d.name || d.id;
			select.appendChild(opt);
		}
	} catch (err) {
		console.error("Data disk 후보 조회 실패:", err);
	}
}

// NodeGroup Size가 1이 아니면 Disk 옵션 비활성화(1차 범위 제한)
function updateDiskAttachAvailability() {
	const size = parseInt($("#ep_vm_add_cnt").val(), 10) || 1;
	const section = document.getElementById("ep_disk_attach_section");
	const modeSelect = document.getElementById("ep_disk_attach_mode");
	const notice = document.getElementById("ep_disk_attach_multinode_notice");
	if (!section || !modeSelect || !notice) return;
	const disabled = size !== 1;
	modeSelect.disabled = disabled;
	notice.classList.toggle("d-none", !disabled);
	if (disabled && modeSelect.value !== "none") {
		modeSelect.value = "none";
		_toggleCreateDiskAttachMode();
	}
}

// Done 클릭 시 폼에서 diskOption 수집 — express_form에 실려 addServerConfigToList로 전달됨
function collectDiskOptionFromForm() {
	const mode = $("#ep_disk_attach_mode").val() || "none";
	if (mode === "existing") {
		const dataDiskId = $("#ep_disk_attach_existing_select").val();
		return dataDiskId ? { mode, dataDiskId } : { mode: "none" };
	}
	if (mode === "new") {
		const name = $("#ep_disk_attach_new_name").val()?.trim();
		const size = parseInt($("#ep_disk_attach_new_size").val(), 10);
		const diskType = $("#ep_disk_attach_new_type").val()?.trim();
		if (!name || !size) return { mode: "none" }; // 미입력 시 attach 생략(필수 검증은 Done 단계에서 별도 처리하지 않음 — 선택 기능)
		const body = { name, diskSize: size };
		if (diskType) body.diskType = diskType;
		return { mode, body };
	}
	return { mode: "none" };
}

function resetDiskAttachSection() {
	$("#ep_disk_attach_mode").val("none");
	$("#ep_disk_attach_existing_select").html('<option value="">Select</option>');
	$("#ep_disk_attach_new_name").val("");
	$("#ep_disk_attach_new_size").val("");
	$("#ep_disk_attach_new_type").val("");
	_toggleCreateDiskAttachMode();
	updateDiskAttachAvailability();
}

// 노드가 Running이 될 때까지 폴링. 타임아웃/삭제 시 null 반환.
async function pollNodeUntilRunning(nsId, infraId, nodeId, { timeoutMs = 15 * 60 * 1000, intervalMs = 5000 } = {}) {
	const mciApi = webconsolejs["common/api/services/mci_api"];
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const resp = await mciApi.getMci(nsId, infraId);
			const node = (resp?.responseData?.node || []).find((n) => n.id === nodeId);
			if (node && node.status === "Running") return node;
			if (node && node.status === "Failed") return null;
		} catch (err) {
			console.error("노드 상태 폴링 실패:", err);
		}
		await new Promise((r) => setTimeout(r, intervalMs));
	}
	return null;
}

// ─── Pending job 영속화 ──────────────────────────────────────────────────
// Add Node(Extend VM) 플로우는 요청 직후 mciworkloads 목록 페이지로 즉시
// window.location 이동하므로, 진행 중이던 폴링이 그대로 끊긴다. sessionStorage에
// pending job을 기록해두고, 이동한 페이지(mci.js)에서 resumePendingDiskAttachJobs()로
// 이어받는다. Create Infra는 같은 페이지에 머무르므로 즉시 실행 + 완료 시 정리로 충분.
const PENDING_DISK_ATTACH_KEY = "mcmp_pending_disk_attach_jobs";

function _readPendingDiskAttachJobs() {
	try {
		return JSON.parse(sessionStorage.getItem(PENDING_DISK_ATTACH_KEY) || "[]");
	} catch {
		return [];
	}
}

function _writePendingDiskAttachJobs(jobs) {
	sessionStorage.setItem(PENDING_DISK_ATTACH_KEY, JSON.stringify(jobs));
}

function _addPendingDiskAttachJob(job) {
	const jobs = _readPendingDiskAttachJobs();
	jobs.push(job);
	_writePendingDiskAttachJobs(jobs);
}

function _removePendingDiskAttachJob(nsId, infraId, nodeId) {
	const jobs = _readPendingDiskAttachJobs().filter(
		(j) => !(j.nsId === nsId && j.infraId === infraId && j.nodeId === nodeId)
	);
	_writePendingDiskAttachJobs(jobs);
}

// 같은 페이지 로드 내에서 동일 job이 중복 실행되는 것을 막는 인메모리 가드.
// (페이지 새로고침 자체는 이 Set을 포함해 JS 컨텍스트 전체를 초기화하므로 크로스
// 리로드 중복은 못 막는다 — 그 경우는 sessionStorage 제거 시점으로 처리한다. 이
// 가드는 같은 페이지에서 resumePendingDiskAttachJobs()가 중복 호출되는 등의
// 케이스만 방어한다.)
const _activeDiskAttachJobKeys = new Set();
function _diskAttachJobKey(nsId, infraId, nodeId) {
	return `${nsId}|${infraId}|${nodeId}`;
}

// 노드 Running 대기 후 attach 실행 — 결과는 토스트로만 통지(알림센터 미연동, ST3 설계 §3.1)
//
// sessionStorage 제거는 반드시 attach 완료(성공/실패/타임아웃) 후에만 한다 — 폴링은
// 최대 15분 걸릴 수 있고 그동안 페이지가 새로고침되면 JS 컨텍스트(및 위 인메모리
// 가드)가 통째로 사라지므로, resumePendingDiskAttachJobs()가 sessionStorage의
// job으로 재개하는 것이 유일한 복구 経로다. 시작 시점에 미리 지우면(과거 시도)
// "새로고침하면 attach가 통째로 유실"되는 훨씬 나쁜 회귀가 생긴다(Playwright로 실측
// 확인, 0건 발송). 반대로 완료 직후~제거 사이의 극히 좁은 창에서 새로고침이 겹치면
// 드물게 attach가 한 번 더 시도될 수 있는데, 이미 attach된 디스크라 CSP가 정상적으로
// 거부(에러 토스트)하는 선에서 끝나는 무해한 경우라 감수한다.
async function _runDiskAttachJob(job) {
	const { nsId, infraId, nodeId, diskOption } = job;
	const key = _diskAttachJobKey(nsId, infraId, nodeId);
	if (_activeDiskAttachJobKeys.has(key)) return; // 같은 페이지에서 이미 진행 중
	_activeDiskAttachJobKeys.add(key);

	try {
		const node = await pollNodeUntilRunning(nsId, infraId, nodeId);
		if (!node) {
			webconsolejs["common/utils/toast"].showToast(
				webconsolejs["common/utils/toast"].TOAST_TYPES.WARNING,
				`${infraId}/${nodeId}: node did not reach Running in time, disk attach skipped`
			);
			return;
		}

		const diskApi = webconsolejs["common/api/services/disk_api"];
		try {
			if (diskOption.mode === "existing") {
				await diskApi.attachDataDisk(nsId, infraId, nodeId, diskOption.dataDiskId);
			} else {
				await diskApi.postVmDataDisk(nsId, infraId, nodeId, diskOption.body);
			}
			webconsolejs["common/utils/toast"].showToast(
				webconsolejs["common/utils/toast"].TOAST_TYPES.SUCCESS,
				`${infraId}/${nodeId}: disk attach requested`
			);
		} catch (err) {
			console.error("Disk Attach 실패(생성 후 오케스트레이션):", err);
			const msg = err?.response?.data?.responseData?.message || err?.message || String(err);
			webconsolejs["common/utils/toast"].showToast(
				webconsolejs["common/utils/toast"].TOAST_TYPES.ERROR,
				`${infraId}/${nodeId}: disk attach failed — ${msg}`
			);
		}
	} finally {
		_activeDiskAttachJobKeys.delete(key);
		_removePendingDiskAttachJob(nsId, infraId, nodeId);
	}
}

// Deploy/Extend 요청 성공 직후 호출 — 인프라(또는 신규 NodeGroup) 생성 자체는 이미
// 진행 중이므로 여기서는 블로킹 없이 백그라운드로 노드 Running 대기 후 attach한다.
// 페이지 이동으로 끊길 수 있어 sessionStorage에 먼저 기록한 뒤 실행한다.
function scheduleDiskAttachAfterDeploy(nsId, infraId, nodeGroupName, diskOption) {
	if (!diskOption || diskOption.mode === "none") return;
	const nodeId = `${nodeGroupName}-1`; // 1차 범위: NodeGroup Size 1 고정
	const job = { nsId, infraId, nodeId, diskOption };
	_addPendingDiskAttachJob(job);
	_runDiskAttachJob(job);
}

// Deploy 성공 후 diskOption이 설정된 NodeGroup 전부에 대해 오케스트레이션 시작(비동기, 블로킹 없음)
function scheduleDiskAttachForConfigs(nsId, infraId, serverConfigArr) {
	for (const config of serverConfigArr || []) {
		if (config.diskOption && config.diskOption.mode !== "none") {
			scheduleDiskAttachAfterDeploy(nsId, infraId, config.name, config.diskOption);
		}
	}
}

// 페이지 로드 시 이전 페이지(Add Node/Extend VM)에서 남긴 pending job을 이어받아 재개.
// 이미 완료된 job은 _runDiskAttachJob 종료 시 sessionStorage에서 제거되므로 중복 attach 위험은 낮다.
export function resumePendingDiskAttachJobs() {
	const jobs = _readPendingDiskAttachJobs();
	for (const job of jobs) {
		_runDiskAttachJob(job);
	}
}

// create page 가 load 될 때 실행해야 할 것들 정의
export function initMciCreate() {
	// MCI Create 초기화

	// partial init functions

	webconsolejs["partials/operation/manage/serverrecommendation"].initServerRecommendation(webconsolejs["partials/operation/manage/mcicreate"].callbackServerRecommendation);// recommend popup에서 사용하는 table 정의.
	
	webconsolejs["partials/operation/manage/imagerecommendation"].initImageModal(); // 이미지 추천 모달 초기화
	
	// 이미지 선택 콜백 함수 설정
	webconsolejs["partials/operation/manage/imagerecommendation"].setImageSelectionCallback(webconsolejs["partials/operation/manage/mcicreate"].callbackImageRecommendation);

	initTemplateDeploySelect(); // Deployment Algorithm의 Template 선택 처리
}

// callback PopupData
export async function callbackServerRecommendation(vmSpec) {
	// MCI Server Recommendation 콜백 함수

	$("#ep_provider").val(vmSpec.provider)
	$("#ep_connectionName").val(vmSpec.connectionName)
	$("#ep_specId").val(vmSpec.specName)
	$("#ep_commonSpecId").val(vmSpec.commonSpecId)
	
	// policy_ep_* 필드들도 함께 설정 (mciworkloads.html용)
	$("#policy_ep_provider").val(vmSpec.provider)
	$("#policy_ep_connectionName").val(vmSpec.connectionName)
	$("#policy_ep_specId").val(vmSpec.specName)
	$("#policy_ep_commonSpecId").val(vmSpec.commonSpecId)
	
	// spec 정보를 전역 변수에 저장 (이미지 선택 시 사용)
	window.selectedSpecInfo = {
		provider: vmSpec.provider,
		connectionName: vmSpec.connectionName,
		regionName: vmSpec.regionName || vmSpec.connectionName.replace(vmSpec.provider + "-", ""),
		osArchitecture: vmSpec.osArchitecture || "x86_64", // 기본값 설정
		specName: vmSpec.specName,
		commonSpecId: vmSpec.commonSpecId
	};
	
	// 이미지 모달의 필드들을 즉시 세팅 (PMK와 동일한 방식)
	$("#image-provider").val(window.selectedSpecInfo.provider);
	$("#image-region").val(window.selectedSpecInfo.regionName);
	$("#image-os-architecture").val(window.selectedSpecInfo.osArchitecture);

	var diskResp = await webconsolejs["common/api/services/disk_api"].getCommonLookupDiskInfo(vmSpec.provider, vmSpec.connectionName)
	getCommonLookupDiskInfoSuccess(vmSpec.provider, diskResp)

	// Data Disk attach 후보 목록도 connectionName 확정 시점에 함께 갱신
	await _populateCreateDiskCandidates(vmSpec.connectionName);

}

// 이미지 선택 콜백 함수
export function callbackImageRecommendation(selectedImage) {
	// MCI 이미지 선택 콜백 함수

	// 부모 폼의 input 필드에 이미지 정보 설정
	$("#ep_imageId_input").val(selectedImage.name || selectedImage.cspImageName || "");
	$("#ep_imageId").val(selectedImage.id || selectedImage.name || "");
	$("#ep_commonImageId").val(selectedImage.id || selectedImage.name || "");

	// policy_ep_* 필드들도 함께 설정 (mciworkloads.html용)
	$("#policy_ep_imageId_input").val(selectedImage.name || selectedImage.cspImageName || "");
	$("#policy_ep_commonImageId").val(selectedImage.id || selectedImage.name || "");

	// MyImage(customImage) 선택 시 root disk 입력이 서버에서 무시됨을 안내 (입력은 활성 유지)
	var notice = document.getElementById("ep_root_disk_myimage_notice");
	if (notice) {
		notice.style.display = (selectedImage.resourceType === "customImage") ? "" : "none";
	}
}

var DISK_SIZE = [];
function getCommonLookupDiskInfoSuccess(provider, data) {

	var providerId = provider.toUpperCase()
	var root_disk_type = [];
	var res_item = data;
	res_item.forEach(item => {
		var temp_provider = item.providerId
		if (temp_provider == providerId) {
			root_disk_type = item.rootdisktype
			DISK_SIZE = item.disksize
		}
	})
	// var temp_provider = res_item.providerId
	// if(temp_provider == provider){
	// 	root_disk_type = res_item.rootdisktype
	// 	DISK_SIZE = res_item.disksize
	// }

	var html = '<option value="">Select Root Disk Type</option>'
	root_disk_type.forEach(item => {
		html += '<option value="' + item + '">' + item + '</option>'
	})
	//if(caller == "vmexpress"){
	$("#ep_root_disk_type").empty();
	$("#ep_root_disk_type").append(html);
	//}else if(caller == "vmsimple"){
	// $("#ss_root_disk_type").empty();
	// $("#ss_root_disk_type").append(html);
	//}else if(caller == "vmexpert"){
	// $("#tab_others_root_disk_type").empty()
	// $("#tab_others_root_disk_type").append(html)
	//}

	webconsolejs["partials/layout/modal"].modalHide('spec-search')

}

export async function setProviderList(providerList) {
	// TODO: simple form

	// expert form
	// 모든 provider들을 대문자로 변환
	myProviderList = providerList.map(str => str.toUpperCase());
	// 알파벳 순으로 정렬
	myProviderList.sort()

	var html = '<option value="">Select Provider</option>'
	myProviderList.forEach(item => {
		html += '<option value="' + item + '">' + item + '</option>'
	})

	$("#expert_provider").empty();
	$("#expert_provider").append(html);

}

// region 목록 SET
export async function setRegionList(regionList) {
	// TODO: simple form

	// expert form
	if (Array.isArray(regionList) && typeof regionList[0] === 'string') {
		var html = '<option value="">Select Region</option>'
		myRegionList.forEach(item => {
			html += '<option value="' + item + '">' + item + '</option>'
		})

		$("#expert_region").empty();
		$("#expert_region").append(html);
	} else if (Array.isArray(regionList)) {
		// object에서 [providerName] + regionName 형태로 배열 생성
		regionList.forEach(region => {
			var providerName = region.ProviderName
			var regionName = region.RegionName

			var myRegionName = `[${providerName}] ${regionName}`

			myRegionList.push(myRegionName)
		})

		var html = '<option value="">Select Region</option>'
		myRegionList.forEach(item => {
			html += '<option value="' + item + '">' + item + '</option>'
		})

		$("#expert_region").empty();
		$("#expert_region").append(html);
	}
}

export async function setCloudConnection(cloudConnection) {
	// TODO: simple form

	// expert form
	if (Array.isArray(cloudConnection) && typeof cloudConnection[0] === 'string') {
		// 배열이고 첫 번째 요소가 문자열인 경우 / filter에서 사용

		// 알파벳 순으로 정렬
		cloudConnection.sort();

		var html = '<option value="">Select Connection</option>';
		cloudConnection.forEach(item => {
			html += '<option value="' + item + '">' + item + '</option>';
		});

		$("#expert_cloudconnection").empty();
		$("#expert_cloudconnection").append(html);

	} else if (Array.isArray(cloudConnection)) {
		// array 형태일 때

		myCloudConnection = cloudConnection.map(item => item.configName);
		// 알파벳 순으로 정렬
		myCloudConnection.sort()

		var html = '<option value="">Select Connection</option>'
		myCloudConnection.forEach(item => {
			html += '<option value="' + item + '">' + item + '</option>'
		})

		$("#expert_cloudconnection").empty();
		$("#expert_cloudconnection").append(html);

	} else {
		console.error("Unknown cloudConnection format");
		return;
	}
}
// for filterRegion func
// set된 값들
var myProviderList = []
var myRegionList = []
var myCloudConnection = []

// provider region cloudconnection filtering
var providerSelect = document.getElementById('expert_provider');
var regionSelect = document.getElementById('expert_region');
var connectionSelect = document.getElementById('expert_connection');
providerSelect.addEventListener('change', updateConfigurationFilltering);
regionSelect.addEventListener('change', updateConfigurationFilltering);
// connectionSelect.addEventListener('change', updateConfigurationFilltering);

async function updateConfigurationFilltering() {

	var selectedProvider = providerSelect.value; // 선택된 provider
	var selectedRegion = regionSelect.value; // 선택된 region
	// var selectedConnection = connectionSelect.value; // 선택된 connection

	//초기화 했을 시 
	if (selectedProvider === "") {
		await setRegionList(myRegionList)
		await setCloudConnection(myCloudConnection)

		return
	}

	// providr 선택시 region, connection filtering
	if (selectedProvider !== "" && selectedRegion === "") {

		// region filter
		var filteredRegion = myRegionList.filter(region => {
			return region.startsWith(`[${selectedProvider}]`)
		})

		var html = '<option value="">Select Region</option>'
		filteredRegion.forEach(item => {
			html += '<option value="' + item + '">' + item + '</option>'
		})

		$("#expert_region").empty();
		$("#expert_region").append(html);

		// connection filter

		// 비교를 위해 소문자로 변환
		var lowerSelectedProvider = selectedProvider.toLowerCase();
		var filteredConnection = myCloudConnection.filter(connection => {

			return connection.startsWith(lowerSelectedProvider);
		});

		var nhtml = '<option value="">Select Connection</option>'
		filteredConnection.forEach(item => {
			nhtml += '<option value="' + item + '">' + item + '</option>'
		})

		$("#expert_cloudconnection").empty();
		$("#expert_cloudconnection").append(nhtml);

	}

	// region 선택시 connection filtering
	if (selectedRegion != "") {

		var cspRegex = /^\[(.*?)\]/; // "[CSP]" 형식의 문자열에서 CSP 이름 추출
		var cspMatch = selectedRegion.match(cspRegex);
		var provider = cspMatch ? cspMatch[1].toLowerCase() : null; // CSP 이름 추출 및 소문자 변환

		var filteredConnections = myCloudConnection.filter(connection => {
			return connection.startsWith(`${provider}`);
		});

		var html = '<option value="">Select Connection</option>'
		filteredConnections.forEach(item => {
			html += '<option value="' + item + '">' + item + '</option>'
		})

		$("#expert_cloudconnection").empty();
		$("#expert_cloudconnection").append(html);

	}

}

var createMciListObj = new Object();
var isVm = false // mci 생성(false) / vm 추가(true)
var Express_Server_Config_Arr = new Array();
var express_data_cnt = 0
var currentEditingIndex = -1 // 현재 수정 중인 서버의 인덱스 (-1: 신규 추가 모드)


// 서버 더하기버튼 클릭시 서버정보 입력area 보이기/숨기기
// isExpert의 체크 여부에 따라 바뀜.
// newServers 와 simpleServers가 있음.
export async function displayNewServerForm() {
  // +NodeGroup 버튼 클릭 시 수정 모드 플래그 초기화 (신규 추가 모드)
  currentEditingIndex = -1;
  
  // 화면별 select 참조 — Create MCI는 #mci_deploy_algorithm, Extend VM은 #vm_deploy_algorithm
  var deploymentAlgo = $(isVm ? "#vm_deploy_algorithm" : "#mci_deploy_algorithm").val();

  if (deploymentAlgo == "express") {
    // 폼을 열기 전에 추가 초기화
    $("#ep_name").val("");
    $("#ep_description").val("");
    $("#ep_imageId_input").val("");
    $("#ep_root_disk_type").val("");
    $("#ep_root_disk_size").val("");
    $("#ep_vm_add_cnt").val("1"); // 기본값 1로 설정
    $("#ep_data_disk").val("");
    $("#ep_command").val("");
    
    // 모달들 초기화
    resetModals();

    // 신규 모드 — 직전 편집(template li)의 carry-through 값 잔상 제거 (빈 필드로 초기화)
    renderCarryThroughSection(null);
    setNodeLabels(null);
    $("#ep_node_user_password").val("");

    var div = document.getElementById("server_configuration");
    webconsolejs["partials/layout/navigatePages"].toggleSubElement(div)

  } else if (deploymentAlgo == "simple") {
    // var div = document.getElementById("server_configuration");
    // webconsolejs["partials/layout/navigatePages"].toggleElement(div)

  } else if (deploymentAlgo == "expert") {
    // call getProviderList API
    var providerList = await webconsolejs["common/api/services/mci_api"].getProviderList()
    // provider set
    await setProviderList(providerList)

    // call getRegion API
    var regionList = await webconsolejs["common/api/services/mci_api"].getRegionList()
    // region set
    await setRegionList(regionList)

    // call cloudconnection
    var connectionList = await webconsolejs["common/api/services/mci_api"].getCloudConnection()
    // cloudconnection set
    await setCloudConnection(connectionList)

    // toggle expert form
    var div = document.getElementById("expert_server_configuration");
    webconsolejs["partials/layout/navigatePages"].toggleSubElement(div)

  } else {
    console.error(e)
  }


	// var expressServerConfig = $("#expressServerConfig");
	// var deploymentAlgo = $("#placement_algo").val();
	// var simpleServerConfig = $("#simpleServerConfig");
	// var expertServerConfig = $("#expertServerConfig");
	// var importServerConfig = $("#importServerConfig");
	// var expressServerConfig = $("#expressServerConfig");
	// console.log("is import = " + IsImport + " , deploymentAlgo " + deploymentAlgo)
	// // if ($("#isImport").is(":checked")) {
	// if (IsImport) {
	//     simpleServerConfig.removeClass("active");
	//     expertServerConfig.removeClass("active");
	//     importServerConfig.addClass("active");
	//     expressServerConfig.removeClass("active");
	// } else if (deploymentAlgo == "expert") {
	//     simpleServerConfig.removeClass("active");
	//     expertServerConfig.toggleClass("active");//
	//     importServerConfig.removeClass("active");
	//     expressServerConfig.removeClass("active");
	// } else if (deploymentAlgo == "simple") {
	//     simpleServerConfig.toggleClass("active");//
	//     expertServerConfig.removeClass("active");
	//     importServerConfig.removeClass("active");
	//     expressServerConfig.removeClass("active");

	// } else {
	//     //simpleServerConfig        
	//     console.log("exp")
	//     simpleServerConfig.removeClass("active");
	//     expertServerConfig.removeClass("active");
	//     importServerConfig.removeClass("active");
	//     expressServerConfig.toggleClass("active");//        
	// }
}


// express모드 -> Done버튼 클릭 시

export async function expressDone_btn() {
  // 1. 필수 필드 검증
  var requiredFields = [
    { id: '#ep_name', message: 'NodeGroup name is required' },
    { id: '#ep_vm_add_cnt', message: 'Node count is required' },
    { id: '#ep_commonSpecId', message: 'Spec is required' },
    { id: '#ep_commonImageId', message: 'Image is required' }
  ];
  
  for (var field of requiredFields) {
    if (!$(field.id).val() || $(field.id).val().trim() === '') {
      alert(field.message);
      $(field.id).focus();
      return;
    }
  }
  
  // 2. VM 개수 숫자 검증
  var vmAddCnt = $("#ep_vm_add_cnt").val();
  if (isNaN(vmAddCnt) || parseInt(vmAddCnt) < 1) {
    alert('Node count must be a positive number');
    $("#ep_vm_add_cnt").focus();
    return;
  }
  
  // express 는 common resource를 하므로 별도로 처리(connection, spec만)
  $("#p_provider").val($("#ep_provider").val())
  $("#p_connectionName").val($("#ep_connectionName").val())
  $("#p_name").val($("#ep_name").val())
  $("#p_description").val($("#ep_description").val())
  $("#p_imageId").val($("#ep_imageId").val())
  $("#p_commonImageId").val($("#ep_commonImageId").val())
  $("#ep_imageId_input").val($("#ep_imageId").val()) // 이미지 입력 필드도 업데이트
  $("#p_commonSpecId").val($("#ep_commonSpecId").val())
  $("#p_root_disk_type").val($("#ep_root_disk_type").val())
  $("#p_root_disk_size").val($("#ep_root_disk_size").val())
  $("#p_specId").val($("#ep_specId").val())
  $("#p_command").val($("#ep_command").val())
  // ep_vm_add_cnt가 비어있으면 기본값 1로 설정
  var vmAddCnt = $("#ep_vm_add_cnt").val();
  if (!vmAddCnt || vmAddCnt.trim() === "") {
    vmAddCnt = "1";
  }
  $("#p_subGroupSize").val(vmAddCnt)
  $("#p_vm_cnt").val(vmAddCnt)

  // commonSpec 으로 set 해야하므로 재설정
  var express_form = {}
  express_form["provider"] = $("#ep_provider").val(); // provider 추가
  express_form["connectionName"] = $("#ep_connectionName").val(); // connectionName 추가
  express_form["name"] = $("#p_name").val();
  express_form["description"] = $("#p_description").val();
  express_form["subGroupSize"] = $("#p_subGroupSize").val();
  express_form["rootDiskSize"] = $("#p_root_disk_size").val();
  express_form["rootDiskType"] = $("#p_root_disk_type").val();
  express_form["rootDiskType"] = $("#p_root_disk_type").val();
  express_form["commonSpec"] = $("#p_commonSpecId").val();
  express_form["commonImage"] = $("#p_commonImageId").val();
  express_form["imageId"] = $("#p_imageId").val(); // imageId 추가
  express_form["specId"] = $("#p_specId").val(); // specId 추가
  express_form["command"] = $("#p_command").val();
  // Node Labels 편집기 상태 반영 — 빈 객체면 수정 모드 merge에서 기존 label 제거(사용자가 비운 것) 의도 유지
  express_form["label"] = { ...nodeCustomLabels };
  // Node User Password — 빈 값이면 payload에서 omit, 수정 모드에서 비우면 제거 (trim하지 않음)
  express_form["nodeUserPassword"] = $("#ep_node_user_password").val() || "";
  // Data Disk attach 옵션 — NodeGroup Size 1일 때만 유효(폼에서 이미 disabled 처리됨)
  express_form["diskOption"] = collectDiskOptionFromForm();

  // 3. Done 시점 NodeGroup 단건 사전 검증 — Error면 목록에 담지 않고 폼 유지 (spec/image 재선택 유도)
  var precheckAllowed = await precheckNodeGroup(express_form);
  if (!precheckAllowed) {
    return;
  }

  addServerConfigToList(express_form);

  // 서버 입력 폼 숨기기
  var div = document.getElementById("server_configuration");
  webconsolejs["partials/layout/navigatePages"].toggleSubElement(div);
  
  // 폼 초기화 - 모든 입력 필드 초기화
  $("#express_form").each(function () {
    this.reset();
  });
  
  // 숨겨진 필드들 초기화
  $("#ep_provider").val("");
  $("#ep_connectionName").val("");
  $("#ep_imageId").val("");
  $("#ep_commonImageId").val("");
  $("#ep_commonSpecId").val("");
  $("#ep_specId").val("");
  
  // 직접 입력 필드들 초기화
  $("#ep_name").val("");
  $("#ep_description").val("");
  $("#ep_imageId_input").val("");
  $("#ep_root_disk_type").val("");
  $("#ep_root_disk_size").val("");
  $("#ep_vm_add_cnt").val("1"); // 기본값 1로 설정
  $("#ep_data_disk").val("");
  $("#ep_command").val("");
  setNodeLabels(null);
  $("#ep_node_user_password").val("");
  resetDiskAttachSection();

  // 모달들 초기화
  resetModals();
}

var isDonePrecheckRunning = false;


// review 사유 목록을 modal용 텍스트로 변환 (white-space: pre-line로 줄바꿈 표시)
function reviewReasonLines(msgs) {
  return (msgs || []).filter(Boolean).map(function (m) { return "- " + m; }).join("\n");
}

// 검증 결과 표시 — workspace 선택 확인(checkWorkspaceSelection)과 동일한
// 공용 모달(partials/layout/_modal.html) 스타일 재사용.
// confirm형(#commonDefaultModal, Cancel/Confirm): resolve(true=Confirm, false=Cancel/닫힘)
function showPrecheckConfirmModal(title, content) {
  return new Promise(function (resolve) {
    var modalEl = document.getElementById("commonDefaultModal");
    if (!modalEl) {
      resolve(confirm(title + "\n\n" + content));
      return;
    }
    document.getElementById("commonDefaultModal-title").innerText = title;
    var contentEl = document.getElementById("commonDefaultModal-content");
    contentEl.style.whiteSpace = "pre-line";
    contentEl.innerText = content;
    var confirmed = false;
    document.getElementById("commonDefaultModal-confirm-btn").onclick = function () { confirmed = true; };
    modalEl.addEventListener("hidden.bs.modal", function () { resolve(confirmed); }, { once: true });
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  });
}


// ─── Infra 배포 Labels ───
// 기본 label 2종은 배포 시 코드에서 자동 주입 — UI에는 read-only 뱃지로만 표시 (수정·삭제 불가)
var DEFAULT_INFRA_LABELS = { "project": "mcmp", "framework": "mc-web-console" };
var infraCustomLabels = {};

// labelSelector 파싱 예약 문자(, = !)·공백을 배제한 안전 문자셋
var LABEL_TOKEN_RE = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

// label 입력 공통 검증 — 통과 시 null, 실패 시 사유(영문) 반환
function validateLabelInput(key, value, existing, reservedKeys) {
  if (!key || !value) {
    return "Label key and value are required";
  }
  if (!LABEL_TOKEN_RE.test(key) || !LABEL_TOKEN_RE.test(value)) {
    return "Only letters, digits, '-', '_', '.', '/' are allowed (must start with a letter or digit)";
  }
  if (key.indexOf("sys.") === 0) {
    return "'sys.' prefix is reserved for system labels";
  }
  if (reservedKeys && Object.prototype.hasOwnProperty.call(reservedKeys, key)) {
    return "'" + key + "' is a default label and cannot be overridden";
  }
  if (Object.prototype.hasOwnProperty.call(existing, key)) {
    return "Label key '" + key + "' already exists";
  }
  return null;
}

// label 목록 렌더 — textContent 할당(HTML 해석 방지)
function renderLabelList(containerId, labelsObj, removeFn) {
  var list = document.getElementById(containerId);
  if (!list) return;
  list.innerHTML = "";
  Object.keys(labelsObj).forEach(function (key) {
    var row = document.createElement("div");
    row.className = "d-flex align-items-center mb-1";
    var badge = document.createElement("span");
    badge.className = "badge badge-outline text-blue fw-normal me-2";
    badge.textContent = key + "=" + labelsObj[key];
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-ghost-danger";
    btn.textContent = "Remove";
    btn.onclick = function () { removeFn(key); };
    row.appendChild(badge);
    row.appendChild(btn);
    list.appendChild(row);
  });
}

export function addInfraLabel() {
  var toast = webconsolejs["common/utils/toast"];
  var key = ($("#mci_label_key").val() || "").trim();
  var value = ($("#mci_label_value").val() || "").trim();

  var err = validateLabelInput(key, value, infraCustomLabels, DEFAULT_INFRA_LABELS);
  if (err) {
    toast.showToast(toast.TOAST_TYPES.ERROR, err);
    return;
  }

  infraCustomLabels[key] = value;
  $("#mci_label_key").val("");
  $("#mci_label_value").val("");
  renderInfraLabelList();
}

export function removeInfraLabel(key) {
  delete infraCustomLabels[key];
  renderInfraLabelList();
}

function renderInfraLabelList() {
  renderLabelList("mci_label_list", infraCustomLabels, removeInfraLabel);
}

// ─── Node(NodeGroup) Labels — express 폼 단위 (Create/Extend 공유) ───
// CreateNodeGroupDynamicReq.label로 전송 — 기본 label 자동 주입은 Infra top-level 전용(여긴 없음)
var nodeCustomLabels = {};

export function addNodeLabel() {
  var toast = webconsolejs["common/utils/toast"];
  var key = ($("#ep_label_key").val() || "").trim();
  var value = ($("#ep_label_value").val() || "").trim();

  var err = validateLabelInput(key, value, nodeCustomLabels, null);
  if (err) {
    toast.showToast(toast.TOAST_TYPES.ERROR, err);
    return;
  }

  nodeCustomLabels[key] = value;
  $("#ep_label_key").val("");
  $("#ep_label_value").val("");
  renderNodeLabelList();
}

export function removeNodeLabel(key) {
  delete nodeCustomLabels[key];
  renderNodeLabelList();
}

function renderNodeLabelList() {
  renderLabelList("ep_label_list", nodeCustomLabels, removeNodeLabel);
}

// 수정 모드 진입 시 기존 label 로드 / 신규·초기화 시 빈 상태
function setNodeLabels(labels) {
  nodeCustomLabels = { ...(labels || {}) };
  renderNodeLabelList();
  $("#ep_label_key").val("");
  $("#ep_label_value").val("");
}

// 배포 페이로드용 label — 사용자 label 위에 기본 label을 마지막으로 merge (기본 키 보존 이중 방어)
function getInfraDeployLabels() {
  return { ...infraCustomLabels, ...DEFAULT_INFRA_LABELS };
}

// Done 시점 NodeGroup 단건 사전 검증. 결과는 공용 모달로 표시.
// Error → alert형 모달 후 차단 / Warning·검증 불능 → confirm형 모달로 추가 여부 사용자 선택.
// Deploy 시점 전체 review는 현행 유지되므로 최종 안전망은 유지된다.
// 반환: true = 목록 추가 진행, false = 차단(폼 유지)
async function precheckNodeGroup(express_form) {
  if (isDonePrecheckRunning) {
    return false;
  }
  isDonePrecheckRunning = true;

  var btn = document.getElementById("express_done_btn");
  var btnOrigHtml;
  if (btn) {
    btnOrigHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>Validating...';
  }

  try {
    var selectedWorkspaceProject = await webconsolejs["partials/layout/navbar"].workspaceProjectInit();
    var nsId = selectedWorkspaceProject.nsId;

    var review = null;
    if (isVm) {
      // Extend VM(Add NodeGroup): infra 존재를 전제로 하는 단건 review API 사용
      var vmResp = await webconsolejs["common/api/services/mci_api"].vmDynamicReview(window.currentMciId, nsId, express_form);
      var vmData = vmResp && vmResp.status === 200 ? vmResp.data.responseData : null;
      // 응답은 review 단건 객체 — 방어적으로 infra 래퍼(nodeReviews[])도 허용
      review = vmData && vmData.nodeReviews ? (vmData.nodeReviews[0] || null) : vmData;
    } else {
      // Create Infra: 전체 review API를 단건 배열로 호출 (Deploy 시점 review와 계약 동일)
      var mciName = $("#mci_name").val();
      if (!mciName || !mciName.trim()) {
        // 빈 name은 HTTP 400 — 검증용 더미 고유명 사용, name 중복 최종 검사는 Deploy review가 수행
        mciName = "precheck-" + Math.random().toString(36).slice(2, 8);
      }
      var mciDesc = $("#mci_desc").val() || "precheck";
      // labels도 Deploy review와 동일하게 전달 (계약 대칭 — review는 label을 검증하지 않음)
      var mciResp = await webconsolejs["common/api/services/mci_api"].mciDynamicReview(mciName, mciDesc, [express_form], nsId, getInfraDeployLabels());
      var mciData = mciResp && mciResp.status === 200 ? mciResp.data.responseData : null;
      review = mciData && mciData.nodeReviews && mciData.nodeReviews.length > 0 ? mciData.nodeReviews[0] : null;
    }

    if (!review) {
      return await showPrecheckConfirmModal("NodeGroup Validation",
        "NodeGroup validation could not be performed.\nIt will be validated again at Deploy.\n\nAdd to the list anyway?");
    }

    var errors = review.errors || [];
    var warnings = review.warnings || [];

    // Review는 배포를 막는 차단 장치가 아니라 사전 권고 — 사유를 안내하고 진행 여부는 사용자가 선택
    if (review.status === "Error" || review.canCreate === false) {
      return await showPrecheckConfirmModal("NodeGroup Validation Failed",
        reviewReasonLines(errors.length ? errors : [review.message])
        + "\n\nThis check is advisory. Deployment may still succeed if the configuration is correct."
        + "\n\nAdd to the list anyway?");
    }

    if (review.status === "Warning" || warnings.length > 0) {
      return await showPrecheckConfirmModal("NodeGroup Validation Warning",
        reviewReasonLines(warnings.length ? warnings : [review.message])
        + "\n\nAdd to the list anyway?");
    }
    return true;
  } catch (e) {
    console.error("NodeGroup precheck failed:", e);
    return await showPrecheckConfirmModal("NodeGroup Validation",
      "NodeGroup validation could not be performed.\nIt will be validated again at Deploy.\n\nAdd to the list anyway?");
  } finally {
    isDonePrecheckRunning = false;
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = btnOrigHtml;
    }
  }
}

// express_form을 Express_Server_Config_Arr에 반영(신규 push 또는 수정 모드 갱신) + <li> 렌더
function addServerConfigToList(express_form) {
  var server_name = express_form.name;
  var server_cnt = parseInt(express_form.subGroupSize);

  // 수정 모드인지 신규 추가 모드인지 판단
  if (currentEditingIndex >= 0 && currentEditingIndex < Express_Server_Config_Arr.length) {
    // 수정 모드: 기존 데이터를 업데이트 (폼에 없는 carry-through 필드는 보존)
    Express_Server_Config_Arr[currentEditingIndex] = { ...Express_Server_Config_Arr[currentEditingIndex], ...express_form };

    // 리스트 아이템 텍스트 업데이트
    var vmEleId = "vm";
    if (!isVm) {
      vmEleId = "mci";
    }
    var displayServerCnt = '(' + server_cnt + ')';
    var listItem = $("#" + vmEleId + "_server_list li").eq(currentEditingIndex + 1); // +1은 plusIcon 때문
    listItem.text(server_name + displayServerCnt);

    // 수정 모드 플래그 초기화
    currentEditingIndex = -1;
  } else {
    // 신규 추가 모드: 배열에 추가하고 리스트에 추가
    var add_server_html = "";

    Express_Server_Config_Arr.push(express_form);

    var displayServerCnt = '(' + server_cnt + ')';
    add_server_html += '<li class="removebullet btn btn-info" onclick="webconsolejs[\'partials/operation/manage/mcicreate\'].view_express(\'' + express_data_cnt + '\')">'
      + server_name + displayServerCnt
      + '</li>';

    var vmEleId = "vm";
    if (!isVm) {
      vmEleId = "mci";
    }
    $("#" + vmEleId + "_plusVmIcon").remove();
    $("#" + vmEleId + "_server_list").append(add_server_html);
    $("#" + vmEleId + "_server_list").prepend(getPlusVm(vmEleId));

    express_data_cnt++;
  }
}

// 모달들 초기화 함수
function resetModals() {
	// Spec Search 모달 초기화
	if (typeof webconsolejs !== 'undefined' && webconsolejs['partials/operation/manage/serverrecommendation']) {
		// Spec 모달의 테이블 초기화
		if (window.recommendTable) {
			window.recommendTable.clearData();
		}
		// Spec 모달의 선택 상태 초기화
		$("#spec-search input[type='checkbox']").prop('checked', false);
		$("#spec-search .form-control").val("");
		// Cloud Provider Filter 드롭다운 초기화
		$("#spec-provider-filter").val("");
		// Region 드롭다운 초기화
		$("#assistRecommendSpecConnectionName").val("");
	}
	
	// Image Search 모달 초기화
	if (typeof webconsolejs !== 'undefined' && webconsolejs['partials/operation/manage/imagerecommendation']) {
		// Image 모달의 테이블 초기화
		if (window.recommendImageTable) {
			window.recommendImageTable.clearData();
		}
		// Image 모달의 선택 상태 초기화
		$("#image-search input[type='checkbox']").prop('checked', false);
		$("#image-search .form-control").val("");
		$("#assist_os_type").val("");
		$("#gpu_image_value").val("false");
		$("#assist_gpu_image").prop('checked', false);
	}
}

export function view_express(cnt) {
  // NodeGroup 리스트 아이템 클릭 시 해당 서버 정보를 폼에 채워서 수정 모드로 전환
  
  currentEditingIndex = parseInt(cnt); // 수정 모드 플래그 설정
  
  if (currentEditingIndex < 0 || currentEditingIndex >= Express_Server_Config_Arr.length) {
    console.error('Invalid server index:', currentEditingIndex);
    return;
  }
  
  var select_form_data = Express_Server_Config_Arr[currentEditingIndex];
  
  // 폼 필드에 기존 데이터 채우기
  $("#ep_name").val(select_form_data.name || "");
  $("#ep_description").val(select_form_data.description || "");
  $("#ep_vm_add_cnt").val(select_form_data.subGroupSize || "1");
  $("#ep_root_disk_type").val(select_form_data.rootDiskType || "");
  $("#ep_root_disk_size").val(select_form_data.rootDiskSize || "");
  $("#ep_command").val(select_form_data.command || "");
  
  // 숨겨진 필드들 (commonSpec, connectionName 등)
  $("#ep_provider").val(select_form_data.provider || "");
  $("#ep_connectionName").val(select_form_data.connectionName || "");
  $("#ep_commonSpecId").val(select_form_data.commonSpec || "");
  $("#ep_specId").val(select_form_data.specId || "");
  $("#ep_commonImageId").val(select_form_data.commonImage || "");
  $("#ep_imageId").val(select_form_data.imageId || "");
  $("#ep_imageId_input").val(select_form_data.commonImage || select_form_data.imageId || "");
  
  // p_* 필드들도 함께 설정 (호환성)
  $("#p_provider").val(select_form_data.provider || "");
  $("#p_connectionName").val(select_form_data.connectionName || "");
  $("#p_name").val(select_form_data.name || "");
  $("#p_description").val(select_form_data.description || "");
  $("#p_imageId").val(select_form_data.imageId || "");
  $("#p_commonImageId").val(select_form_data.commonImage || "");
  $("#p_commonSpecId").val(select_form_data.commonSpec || "");
  $("#p_root_disk_type").val(select_form_data.rootDiskType || "");
  $("#p_root_disk_size").val(select_form_data.rootDiskSize || "");
  $("#p_specId").val(select_form_data.specId || "");
  $("#p_command").val(select_form_data.command || "");
  $("#p_subGroupSize").val(select_form_data.subGroupSize || "1");
  $("#p_vm_cnt").val(select_form_data.subGroupSize || "1");
  
  // 기존 label을 Node Labels 편집기로 로드 (template carry-through label 포함 — 편집 가능)
  setNodeLabels(select_form_data.label);
  // Node User Password 로드 — password 타입 입력으로 마스킹 표시
  $("#ep_node_user_password").val(select_form_data.nodeUserPassword || "");

  // template carry-through 필드 read-only 표시 (값 없으면 빈 칸 — label은 편집기로 이동)
  renderCarryThroughSection(select_form_data);

  // 서버 입력 폼 표시
  var div = document.getElementById("server_configuration");
  if (!div.classList.contains("active")) {
    webconsolejs["partials/layout/navigatePages"].toggleSubElement(div);
  }
}

// template Add NodeGroup carry-through 필드(zone/vNetTemplateId/sgTemplateId)를
// 편집 폼에 read-only로 표시 — template 유래 값이 하나라도 있을 때만 섹션 표시.
// nodeUserPassword·label은 일반 입력(모든 모드)으로 전환되어 여기서 제외.
function renderCarryThroughSection(data) {
  var section = document.getElementById("carry_through_section");
  var fields = document.getElementById("carry_through_fields");
  if (!section || !fields) return;

  var items = [
    ["zone", "Zone", (data && data.zone) || ""],
    ["vNetTemplateId", "vNet Template ID", (data && data.vNetTemplateId) || ""],
    ["sgTemplateId", "SG Template ID", (data && data.sgTemplateId) || ""],
  ];

  // template 유래 값이 없으면(express 직접 생성 등) 섹션 숨김
  var hasValue = items.some(function (item) { return item[2] !== ""; });
  if (!hasValue) {
    fields.innerHTML = "";
    section.classList.add("d-none");
    return;
  }

  fields.innerHTML = "";
  items.forEach(function (item) {
    var col = document.createElement("div");
    col.className = "col-md-6";
    var label = document.createElement("label");
    label.className = "form-label";
    label.textContent = item[1];
    var input = document.createElement("input");
    input.type = "text";
    input.className = "form-control carry-through-readonly";
    input.readOnly = true;
    input.setAttribute("data-carry-field", item[0]);
    input.value = item[2]; // DOM value 할당 — template 값의 HTML 해석(XSS) 방지
    col.appendChild(label);
    col.appendChild(input);
    fields.appendChild(col);
  });
  section.classList.remove("d-none");
}


// Assist spec 클릭 시
// 공통으로 뺄 것

var ROOT_DISK_MAX_VALUE = 0;
var ROOT_DISK_MIN_VALUE = 0;

// Disk Type 선택 시 Disk Size Min/Max 설정 > 보완할 것
export function changeDiskSize(type) {
	var disk_size = DISK_SIZE;

	if (disk_size && Array.isArray(disk_size)) {
		disk_size.forEach(item => {
			// item이 문자열인지 확인 후 split 실행
			if (typeof item === 'string' && item.includes('|')) {
				var temp_size = item.split("|")
				var temp_type = temp_size[0];
				if (temp_type == type) {
					ROOT_DISK_MAX_VALUE = temp_size[1]
					ROOT_DISK_MIN_VALUE = temp_size[2]
				}
			}
		})
	}
	$("#s_rootDiskType").val(type);
	$("#e_rootDiskType").val(type);

}




// plus 버튼을 추가
function getPlusVm(vmElementId) {

	var append = "";
	append = append + '<li class="removebullet btn btn-secondary-lt" id="' + vmElementId + '_plusVmIcon" onClick="webconsolejs[\'partials/operation/manage/mcicreate\'].displayNewServerForm()">';
	append = append + "+ NodeGroup"
	append = append + '</li>';
	return append;
}
// 서버정보 입력 area에서 'DONE'버튼 클릭시 array에 담고 form을 초기화

var totalDeployServerCount = 0;
var TotalServerConfigArr = new Array();// 최종 생성할 서버 목록
// deploy 버튼 클릭시 등록한 서버목록을 배포.
// function btn_deploy(){
export function deployMci() {
	createMciDynamic()
	// express 는 express 만, simple + expert + import 는 합쳐서
	// 두개의 mci는 만들어 질 수 없으므로 
	// var deploymentAlgo = $("#placement_algo").val()
	// if (deploymentAlgo == "express") {
	// 	createMciDynamic()
	// }
	// else{
	//     var mci_name = $("#mci_name").val();
	//     if (!mci_name) {
	//         commonAlert("Please Input MCIS Name!!!!!")
	//         return;
	//     }
	//     var mci_desc = $("#mci_desc").val();
	//     var placement_algo = $("#placement_algo").val();
	//     var installMonAgent = $("#installMonAgent").val();

	//     var new_obj = {}

	//     var vm_len = 0;

	//     if (IsImport) {
	//         // ImportedMciScript.name = mci_name;
	//         // ImportedMciScript.description = mci_desc;
	//         // ImportedMciScript.installMonAgent = installMonAgent;
	//         // console.log(ImportedMciScript);
	//         //var theJson = jQuery.parseJSON($(this).val())
	//         //$("#mciImportScriptPretty").val(fmt);	
	//         new_obj = $("#mciImportScriptPretty").val();
	//         new_obj.id = "";// id는 비워준다.
	//     } else {
	//         //         console.log(Simple_Server_Config_Arr)

	//         // mci 생성이므로 mciID가 없음
	//         new_obj['name'] = mci_name
	//         new_obj['description'] = mci_desc
	//         new_obj['installMonAgent'] = installMonAgent

	//         // Express_Server_Config_Arr 은 별도처리


	//         if (Simple_Server_Config_Arr) {
	//             vm_len = Simple_Server_Config_Arr.length;
	//             for (var i in Simple_Server_Config_Arr) {
	//                 TotalServerConfigArr.push(Simple_Server_Config_Arr[i]);
	//             }
	//         }

	//         if (Expert_Server_Config_Arr) {
	//             vm_len = Expert_Server_Config_Arr.length;
	//             for (var i in Expert_Server_Config_Arr) {
	//                 TotalServerConfigArr.push(Expert_Server_Config_Arr[i]);
	//             }
	//         }

	//         if (TotalServerConfigArr) {
	//             vm_len = TotalServerConfigArr.length;
	//             console.log("Server_Config_Arr length: ", vm_len);
	//             new_obj['vm'] = TotalServerConfigArr;
	//             console.log("new obj is : ", new_obj);
	//         } else {
	//             commonAlert("Please Input Nodes");
	//             $(".simple_servers_config").addClass("active");
	//             $("#s_name").focus();
	//         }
	//     }

	//     var url = getWebToolUrl("MciRegProc")
	//     try {
	//         axios.post(url, new_obj, {
	//             // headers: {
	//             //     'Content-type': "application/json",
	//             // },
	//         }).then(result => {
	//             console.log("MCIR Register data : ", result);
	//             console.log("Result Status : ", result.status);
	//             if (result.status == 201 || result.status == 200) {
	//                 commonResultAlert("Register Requested")
	//             } else {
	//                 commonAlert("Register Fail")
	//             }
	//         }).catch((error) => {
	//             // console.warn(error);
	//             console.log(error.response)
	//             var errorMessage = error.response.data.error;
	//             var statusCode = error.response.status;
	//             commonErrorAlert(statusCode, errorMessage)

	//         })
	//     } catch (error) {
	//         commonAlert(error);
	//         console.log(error);
	//     }
	// }    
}
export async function createMciDynamic() {
	// var namespace = webconsolejs["common/api/services/workspace_api"].getCurrentProject()
	// nsid = namespace.Name
	var selectedWorkspaceProject = await webconsolejs["partials/layout/navbar"].workspaceProjectInit();

	var selectedNsId = selectedWorkspaceProject.nsId;
	var projectId = $("#select-current-project").text()
	var projectName = $('#select-current-project').find('option:selected').text();
	var nsId = projectName;

	var mciName = $("#mci_name").val()
	var mciDesc = $("#mci_desc").val()
	var policyOnPartialFailure = $("#mci_policy_on_partial_failure").val()


	
	if (!mciName) {
		alert("Please Input Infra Name!!!!!")
		return;
	}

	if (!mciDesc) {
		mciDesc = "Made in CB-TB"
	}

	// 기본 label 자동 주입 + 사용자 label merge — review/deploy 동일 객체 전송
	const deployLabels = getInfraDeployLabels();

	// MCI 생성 전 검증 API 호출
	try {
		const validationResult = await webconsolejs["common/api/services/mci_api"].mciDynamicReview(
			mciName, mciDesc, Express_Server_Config_Arr, selectedNsId, deployLabels
		);
		
		
		if (validationResult && validationResult.status === 200) {
			const reviewData = validationResult.data.responseData;
			
			// Review는 배포를 막는 차단 장치가 아니라 사전 권고(배포 API는 review를 호출하지 않음) —
			// Error/Warning 모두 사유를 안내하고 진행 여부는 사용자가 선택한다.
			if (reviewData.overallStatus === "Error" || !reviewData.creationViable) {
				// 노드별 오류 상세 수집 — 배포 백엔드 계약은 nodeReviews[]/nodeName/nodeGroupSize
				var errorLines = [reviewData.overallMessage || "Infra review reported errors"];

				if (reviewData.nodeReviews && reviewData.nodeReviews.length > 0) {
					reviewData.nodeReviews.forEach(node => {
						if (node.status === "Error" && node.errors) {
							var head = "Node: " + node.nodeName + " (NodeGroup Size: " + node.nodeGroupSize + ")";
							if (node.providerName) head += " / Provider: " + node.providerName;
							if (node.regionName) head += " / Region: " + node.regionName;
							if (node.imageValidation && node.imageValidation.resourceId) {
								head += " / Image: " + node.imageValidation.resourceId;
							}
							errorLines.push(head);
							node.errors.forEach(err => {
								errorLines.push("- " + err);
							});
						}
					});
				}

				const proceedOnError = await showPrecheckConfirmModal("Infra Deployment Warning",
					errorLines.join("\n")
					+ "\n\nThis check is advisory. Deployment may still succeed if the configuration is correct."
					+ "\n\nDeploy anyway?");
				if (!proceedOnError) {
					return;
				}
			} else if (reviewData.overallStatus === "Warning") {
				// 경고가 있지만 생성 가능 - 사용자 확인 후 진행
				const proceedOnWarning = await showPrecheckConfirmModal("Infra Deployment Warning",
					(reviewData.overallMessage || "Infra review reported warnings")
					+ (reviewData.estimatedCost ? "\n\nEstimated cost: " + reviewData.estimatedCost : "")
					+ "\n\nDeploy anyway?");
				if (!proceedOnWarning) {
					return;
				}
			}

			// Ready / 사용자가 확인한 Error·Warning → 배포 진행
			webconsolejs["common/api/services/mci_api"].mciDynamic(mciName, mciDesc, Express_Server_Config_Arr, selectedNsId, policyOnPartialFailure, deployLabels);
			scheduleDiskAttachForConfigs(selectedNsId, mciName, Express_Server_Config_Arr);
		} else {
			// API 호출 실패
			console.error("Infra review API call failed:", validationResult);
			alert("An error occurred while validating the Infra creation request.");
		}
	} catch (error) {
		console.error("Infra review error:", error);
		alert("An error occurred while validating the Infra: " + error.message);
	}
}

export async function createVmDynamic() {
    var selectedWorkspaceProject = await webconsolejs["partials/layout/navbar"].workspaceProjectInit();
    var selectedNsId = selectedWorkspaceProject.nsId;
    var mciId = window.currentMciId;

    await webconsolejs["common/api/services/mci_api"].vmDynamic(mciId, selectedNsId, Express_Server_Config_Arr)
    // Data Disk attach 오케스트레이션 시작 — window.location 이동으로 끊기지 않도록
    // sessionStorage에 먼저 기록됨(scheduleDiskAttachAfterDeploy 내부), mciworkloads
    // 페이지 로드 시 resumePendingDiskAttachJobs()가 이어받는다.
    scheduleDiskAttachForConfigs(selectedNsId, mciId, Express_Server_Config_Arr);

    alert("Node creation request completed")
    window.location = `/webconsole/operations/manage/workloads/mciworkloads`;
}

export function addNewMci() {
	isVm = false
	Express_Server_Config_Arr = new Array();
	// Labels 입력 상태 초기화 (기본 label은 상수 — UI 뱃지 고정)
	infraCustomLabels = {};
	renderInfraLabelList();
	$("#mci_label_key").val("");
	$("#mci_label_value").val("");
}

// ////////////// VM Handling ///////////
export function addNewVirtualMachine() {
	Express_Server_Config_Arr = new Array();

	// window.currentMciId로 직접 접근
	var selectedMciId = window.currentMciId;
	console.log("selectedMciId", selectedMciId);
	
	// MCI 데이터에서 실제 name과 description 가져오기
	var mci_name = selectedMciId; // 기본값으로 ID 사용
	var mci_desc = "";
	
	if (selectedMciId && window.totalMciListObj) {
		var mciData = window.totalMciListObj.find(mci => mci.id === selectedMciId);
		if (mciData) {
			mci_name = mciData.name || selectedMciId;
			mci_desc = mciData.description || "";
		}
	}

	$("#extend_mci_name").val(mci_name)
	$("#extend_mci_desc").val(mci_desc)
	console.log("mci_name:", mci_name, "mci_desc:", mci_desc)

	isVm = true
}

export async function deployVm() {
	// var deploymentAlgo = $("#placement_algo").val()
	// if (deploymentAlgo == "express") {
	await createVmDynamic()
	// }else{

	//     var mci_name = $("#mci_name").val();
	//     var mci_id = $("#mci_id").val();
	//     if (!mci_id) {
	//         commonAlert("Please Select MCIS !!!!!")
	//         return;
	//     }
	//     totalDeployServerCount = 0;// deploy vm 개수 초기화
	//     var new_obj = {}// vm이 담길 변수

	//     // Express 는 별도처리임.

	//     if (Simple_Server_Config_Arr) {
	//         vm_len = Simple_Server_Config_Arr.length;
	//         for (var i in Simple_Server_Config_Arr) {
	//             TotalServerConfigArr.push(Simple_Server_Config_Arr[i]);
	//         }
	//     }

	//     if (Expert_Server_Config_Arr) {
	//         vm_len = Expert_Server_Config_Arr.length;
	//         for (var i in Expert_Server_Config_Arr) {
	//             TotalServerConfigArr.push(Expert_Server_Config_Arr[i]);
	//         }
	//     }

	//     //Import_Server_Config_Arr : import도 같이 추가
	//     if (Import_Server_Config_Arr) {
	//         vm_len = Import_Server_Config_Arr.length;
	//         for (var i in Import_Server_Config_Arr) {
	//             TotalServerConfigArr.push(Import_Server_Config_Arr[i]);
	//         }
	//     }

	//     if (TotalServerConfigArr) {
	//         vm_len = TotalServerConfigArr.length;
	//         console.log("Server_Config_Arr length: ", vm_len);
	//         new_obj['vm'] = TotalServerConfigArr;
	//         console.log("new obj is : ", new_obj);
	//     } else {
	//         commonAlert("Please Input Nodes");
	//         $(".simple_servers_config").addClass("active");
	//         $("#s_name").focus();
	//     }

	//     //var url = "/operation/manages/mcimng/" + mci_id + "/vm/reg/proc"
	//     var urlParamMap = new Map();
	//     urlParamMap.set(":mciID", mci_id)
	//     var url = setUrlByParam("MciVmListRegProc", urlParamMap)
	//     //var url = getWebToolUrl("MciVmRegProc")
	//     try {
	//         axios.post(url, new_obj, {
	//             // headers: {
	//             //     'Content-type': "application/json",
	//             // },
	//         }).then(result => {
	//             console.log("VM Register data : ", result);
	//             console.log("Result Status : ", result.status);
	//             if (result.status == 201 || result.status == 200) {
	//                 commonResultAlert("Register Requested")
	//             } else {
	//                 commonAlert("Register Fail")
	//             }
	//         }).catch((error) => {
	//             // console.warn(error);
	//             console.log(error.response)
	//             var errorMessage = error.response.data.error;
	//             var statusCode = error.response.status;
	//             commonErrorAlert(statusCode, errorMessage)

	//         })
	//     } catch (error) {
	//         commonAlert(error);
	//         console.log(error);
	//     }
	// }
}

// {
// 	"commonImage": "ubuntu18.04",
// 	"commonSpec": "aws+ap-northeast-2+t2.small",
// 	"connectionName": "string",
// 	"description": "Description",
// 	"label": "DynamicVM",
// 	"name": "g1-1",
// 	"rootDiskSize": "default, 30, 42, ...",
// 	"rootDiskType": "default, TYPE1, ...",
// 	"subGroupSize": "3",
// 	"vmUserPassword": "string"
//   }



///



// vm 생성 결과 표시
// 여러개의 vm이 생성될 수 있으므로 각각 결과를 표시
var resultVmCreateMap = new Map();

function vmCreateCallback(resultVmKey, resultStatus) {
	resultVmCreateMap.set(resultVmKey, resultStatus)
	var resultText = "";
	var createdServer = 0;
	for (let key of resultVmCreateMap.keys()) {
		resultText += key + " = " + resultVmCreateMap.get(resultVmKey) + ","
		//totalDeployServerCount--
		createdServer++;
	}

	// $("#serverRegistResult").text(resultText);

	if (resultStatus != "Success") {
		// add된 항목 제거 해야 함.

		// array는 초기화
		Simple_Server_Config_Arr.length = 0;
		simple_data_cnt = 0
		// TODO : expert 추가하면 주석 제거할 것
		Expert_Server_Config_Arr.length = 0;
		expert_data_cnt = 0
		Import_Server_Config_Arr.length = 0;
		import_data_cnt = 0
	}

	if (createdServer === totalDeployServerCount) { //모두 성공
		//getVmList();
		//commonResultAlert($("#serverRegistResult").text());

	} else if (createdServer < totalDeployServerCount) { //일부 성공
		// commonResultAlert($("#serverRegistResult").text());

	} else if (createdServer = 0) { //모두 실패
		//commonResultAlert($("#serverRegistResult").text());
	}
	commonResultAlert("Node creation request completed");
}

// NodeGroup Size
(function () {
	// ep_vm_add_cnt 처리 (PMK 스타일 input-number-container)
	const input = document.getElementById('ep_vm_add_cnt');
	if (input) {
		const container = input.parentElement; // .input-number-container
		const btnDec = container.querySelector('.input-number-decrement');
		const btnInc = container.querySelector('.input-number-increment');

		const minValue = 1;

		btnDec.addEventListener('click', function (e) {
			e.preventDefault();
			let val = parseInt(input.value, 10) || minValue;
			if (val > minValue) input.value = val - 1;
			updateDiskAttachAvailability();
		});

		btnInc.addEventListener('click', function (e) {
			e.preventDefault();
			let val = parseInt(input.value, 10) || minValue;
			input.value = val + 1; // maxValue 제한 제거
			updateDiskAttachAvailability();
		});

		input.addEventListener('input', updateDiskAttachAvailability);
	}

	// policy_ep_vm_add_cnt 처리 (mciworkloads.html용)
	const policyInput = document.getElementById('policy_ep_vm_add_cnt');
	if (policyInput) {
		const policyContainer = policyInput.parentElement; // .d-flex.align-items-center
		const [policyBtnDec, policyBtnInc] = policyContainer.querySelectorAll('button');

		const minValue = 1;
		const maxValue = Number(policyInput.getAttribute('max')) || Infinity;

		policyBtnDec.addEventListener('click', function (e) {
			e.preventDefault();
			let val = parseInt(policyInput.value, 10) || minValue;
			if (val > minValue) policyInput.value = val - 1;
		});

		policyBtnInc.addEventListener('click', function (e) {
			e.preventDefault();
			let val = parseInt(policyInput.value, 10) || minValue;
			if (val < maxValue) policyInput.value = val + 1;
		});
	}
})();

// Clear 버튼 함수 추가
export function clearExpressForm() {
	// 1. 모든 입력 필드 초기화
	$("#express_form")[0].reset();
	
	// 2. 숨겨진 필드들 초기화
	$("#ep_provider").val("");
	$("#ep_connectionName").val("");
	$("#ep_imageId").val("");
	$("#ep_commonImageId").val("");
	$("#ep_commonSpecId").val("");
	$("#ep_specId").val("");
	
	// 3. 직접 입력 필드들 초기화
	$("#ep_name").val("");
	$("#ep_description").val("");
	$("#ep_imageId_input").val("");
	$("#ep_root_disk_type").val("");
	$("#ep_root_disk_size").val("");
	$("#ep_vm_add_cnt").val("1"); // 기본값 1로 설정
	$("#ep_data_disk").val("");
	$("#ep_command").val("");
	setNodeLabels(null);
	$("#ep_node_user_password").val("");

	// 4. 수정 모드 플래그 초기화
	window.currentEditIndex = undefined;
	
	// 5. 폼은 그대로 유지 (토글하지 않음)
}


// ─── Infra Template으로 MCI 배포 ─────────────────────────────────────────

let templateSelectTable = null;
// Create MCI(#mci_deploy_algorithm)와 Extend VM(#vm_deploy_algorithm) 두 select가 template 모달을 공유한다
let deployAlgorithmPrev = { mci_deploy_algorithm: "express", vm_deploy_algorithm: "express" };
let templateModalSourceSelectId = "mci_deploy_algorithm"; // 모달을 연 select — 닫힐 때 이 select만 되돌린다
let templateDeploySucceeded = false;
let templateDeployInFlight = false;

const MODAL_DEPLOY_ALGORITHM_VALUES = ["template", "import_json"]; // 별도 모달을 여는 select 값 — 모달 트리거일 뿐 실제 배포 알고리즘이 아님

function revertDeployAlgorithmSelect() {
	const sel = document.getElementById(templateModalSourceSelectId);
	if (sel && MODAL_DEPLOY_ALGORITHM_VALUES.includes(sel.value)) sel.value = deployAlgorithmPrev[templateModalSourceSelectId] || "express";
}

// 템플릿 미리보기 초기화 (선택 없음 → 안내문구 표시)
function resetTemplateSelectDetail() {
	const hint = document.getElementById("template-select-detail-hint");
	const content = document.getElementById("template-select-detail-content");
	if (hint) hint.classList.remove("d-none");
	if (content) content.classList.add("d-none");
}

// 선택한 템플릿 내용을 읽기 전용으로 렌더링
function renderTemplateSelectDetail(template) {
	const hint = document.getElementById("template-select-detail-hint");
	const content = document.getElementById("template-select-detail-content");
	if (!content) return;
	if (hint) hint.classList.add("d-none");
	content.classList.remove("d-none");

	const req = template.infraDynamicReq || {};
	document.getElementById("template-select-detail-desc").textContent = template.description || "-";

	const tbody = document.getElementById("template-select-nodegroup-rows");
	tbody.innerHTML = "";
	const groups = req.nodeGroups || [];
	if (groups.length === 0) {
		const tr = document.createElement("tr");
		const td = document.createElement("td");
		td.colSpan = 7;
		td.className = "text-muted";
		td.textContent = "-";
		tr.appendChild(td);
		tbody.appendChild(tr);
	} else {
		groups.forEach(g => {
			const tr = document.createElement("tr");
			const rootDisk = [g.rootDiskType, g.rootDiskSize].filter(v => v !== undefined && v !== "" && v !== 0).join(" / ");
			[g.name, g.specId, g.imageId, g.nodeGroupSize, g.connectionName, rootDisk, g.zone].forEach(val => {
				const td = document.createElement("td");
				td.textContent = (val === undefined || val === null || val === "") ? "-" : String(val);
				tr.appendChild(td);
			});
			tbody.appendChild(tr);
		});
	}

	const block = document.getElementById("template-select-postcommand-block");
	const commands = req.postCommand?.command || [];
	if (commands.length > 0) {
		block.classList.remove("d-none");
		document.getElementById("template-select-postcommand").textContent = commands.join("\n");
	} else {
		block.classList.add("d-none");
	}
}

function initTemplateDeploySelect() {
	["mci_deploy_algorithm", "vm_deploy_algorithm"].forEach(function (selId) {
		const sel = document.getElementById(selId);
		if (!sel) return;
		deployAlgorithmPrev[selId] = sel.value;
		sel.addEventListener("change", async function () {
			if (!MODAL_DEPLOY_ALGORITHM_VALUES.includes(this.value)) {
				deployAlgorithmPrev[selId] = this.value;
				return;
			}
			// Create MCI 경로만 MCI Name 선입력 필수 — Extend VM은 기존 MCI 대상이라 불필요
			if (selId === "mci_deploy_algorithm") {
				const mciName = ($("#mci_name").val() || "").trim();
				if (!mciName) {
					webconsolejs["common/utils/toast"].showToast(webconsolejs["common/utils/toast"].TOAST_TYPES.ERROR, "Please input Infra Name first");
					this.value = "express";
					deployAlgorithmPrev[selId] = "express";
					return;
				}
			}
			templateModalSourceSelectId = selId;
			if (this.value === "import_json") {
				openImportJsonModal();
			} else {
				await openTemplateSelectModal();
			}
		});
	});
}

export async function openTemplateSelectModal() {
	var selectedWorkspaceProject = await webconsolejs["partials/layout/navbar"].workspaceProjectInit();
	var nsId = selectedWorkspaceProject.nsId;
	if (!nsId) {
		webconsolejs["common/utils/toast"].showToast(webconsolejs["common/utils/toast"].TOAST_TYPES.ERROR, "Please select a project first");
		revertDeployAlgorithmSelect();
		return;
	}

	let templates = [];
	try {
		const data = await webconsolejs["common/api/services/infratemplate_api"].list(nsId);
		templates = data?.templates || [];
	} catch (e) {
		if (e?.response?.status !== 404) console.error("Failed to load infra templates", e);
	}

	if (templateSelectTable) {
		templateSelectTable.replaceData(templates);
		templateSelectTable.deselectRow();
	} else {
		templateSelectTable = new Tabulator("#template-select-table", {
			data: templates,
			layout: "fitColumns",
			placeholder: "No infra templates found.",
			selectableRows: 1,
			columns: [
				{ title: "Name", field: "name", sorter: "string" },
				{ title: "Description", field: "description", sorter: "string" },
				{
					title: "NodeGroups", field: "infraDynamicReq", headerSort: false,
					formatter: function (cell) {
						const groups = cell.getValue()?.nodeGroups || [];
						const total = groups.reduce((sum, g) => sum + (Number(g.nodeGroupSize) || 0), 0);
						return `${groups.length} group(s) / ${total} node(s)`;
					}
				},
				{ title: "Created", field: "createdAt", sorter: "string", width: 180 }
			]
		});

		// 선택 변경 시 템플릿 미리보기 갱신
		templateSelectTable.on("rowSelectionChanged", function (data) {
			if (data.length > 0) renderTemplateSelectDetail(data[0]);
			else resetTemplateSelectDetail();
		});
	}

	const modalEl = document.getElementById("infra-template-select-modal");
	modalEl.addEventListener("shown.bs.modal", function () {
		if (templateSelectTable) templateSelectTable.redraw(true);
	}, { once: true });
	// 배포 없이 닫히면 Deployment Algorithm을 이전 값으로 되돌린다
	// (displayNewServerForm이 select 값으로 분기하므로 'template'으로 남겨두지 않음)
	templateDeploySucceeded = false;
	modalEl.addEventListener("hidden.bs.modal", function () {
		if (!templateDeploySucceeded) revertDeployAlgorithmSelect();
	}, { once: true });
	// Extend VM 경로에서는 새 MCI를 배포하는 [Deploy from Template] 버튼을 숨긴다 (Add NodeGroup만)
	const deployFromTplBtn = document.getElementById("btn-deploy-from-template");
	if (deployFromTplBtn) deployFromTplBtn.classList.toggle("d-none", templateModalSourceSelectId === "vm_deploy_algorithm");
	resetTemplateSelectDetail();
	new bootstrap.Modal(modalEl).show();
}

export async function deployFromSelectedTemplate() {
	if (templateDeployInFlight) return; // 요청 진행 중 중복 호출 방지

	const selected = templateSelectTable ? templateSelectTable.getSelectedData() : [];
	if (selected.length === 0) {
		webconsolejs["common/utils/toast"].showToast(webconsolejs["common/utils/toast"].TOAST_TYPES.ERROR, "Please select a template");
		return;
	}
	const template = selected[0];

	var selectedWorkspaceProject = await webconsolejs["partials/layout/navbar"].workspaceProjectInit();
	var nsId = selectedWorkspaceProject.nsId;

	var mciName = ($("#mci_name").val() || "").trim();
	var mciDesc = $("#mci_desc").val();

	if (!mciName) {
		webconsolejs["common/utils/toast"].showToast(webconsolejs["common/utils/toast"].TOAST_TYPES.ERROR, "Infra Name is required");
		return;
	}

	const applyReq = { name: mciName };
	if (mciDesc) applyReq.description = mciDesc;

	const deployBtn = document.getElementById("btn-deploy-from-template");
	templateDeployInFlight = true;
	if (deployBtn) deployBtn.disabled = true;

	try {
		// requestId toast로 상태 표시 — 생성 요청만 보내고 결과를 기다리지 않는다
		webconsolejs["common/api/services/infratemplate_api"]
			.deployFromTemplate(nsId, template.id, applyReq, undefined, { loaderType: "none" })
			.catch(() => {});
		templateDeploySucceeded = true;
		bootstrap.Modal.getInstance(document.getElementById("infra-template-select-modal"))?.hide();
		// Toast가 보이도록 잠시 후 이동 (진행/완료는 asyncRequestTracker)
		setTimeout(() => { window.location.href = "/webconsole/operations/manage/workloads/mciworkloads"; }, 1500);
	} catch (e) {
		templateDeployInFlight = false;
		if (deployBtn) deployBtn.disabled = false;
		webconsolejs["common/utils/toast"].showToast(webconsolejs["common/utils/toast"].TOAST_TYPES.ERROR, "Failed to deploy from template: " + (e?.message || e));
	}
}

// nodeGroups[] 원소(InfraDynamicReq 스키마, template/JSON import 공용) → express_form 매핑.
// req는 상위 InfraDynamicReq(postCommand.command를 idx===0에만 carry-through하기 위해 필요), idx는 groups.forEach의 인덱스.
function mapNodeGroupToExpressForm(g, req, idx) {
	var express_form = {};
	express_form["provider"] = (g.specId || "").split("+")[0];
	express_form["connectionName"] = g.connectionName || "";
	express_form["name"] = g.name || "";
	express_form["description"] = g.description || "";
	express_form["subGroupSize"] = String(g.nodeGroupSize != null ? g.nodeGroupSize : 1);
	express_form["rootDiskSize"] = g.rootDiskSize;
	express_form["rootDiskType"] = g.rootDiskType || "";
	express_form["commonSpec"] = g.specId || "";
	express_form["commonImage"] = g.imageId || "";
	express_form["imageId"] = g.imageId || "";
	express_form["specId"] = g.specId || "";
	// infra 단위 postCommand는 첫 NodeGroup에만 반영(기존 command 처리 관례와 동일)
	express_form["command"] = idx === 0 ? (req?.postCommand?.command || []).join("\n") : "";

	// 정식 매핑 승격 5필드(CreateNodeGroupDynamicReq) — 값이 있을 때만 carry-through
	if (g.zone) express_form["zone"] = g.zone;
	if (g.nodeUserPassword) express_form["nodeUserPassword"] = g.nodeUserPassword;
	if (g.label && Object.keys(g.label).length > 0) express_form["label"] = g.label;
	if (g.vNetTemplateId) express_form["vNetTemplateId"] = g.vNetTemplateId;
	if (g.sgTemplateId) express_form["sgTemplateId"] = g.sgTemplateId;

	return express_form;
}

// nodeGroups[] 전체를 폼에 append(항상 신규 추가 모드) — template/JSON import 공용
function appendNodeGroupsToForm(req) {
	const groups = req?.nodeGroups || [];
	// 항상 append 모드로 동작 — 모달 오픈 시점에 편집 중이던 상태가 남아있지 않도록 방어
	currentEditingIndex = -1;
	groups.forEach(function (g, idx) {
		addServerConfigToList(mapNodeGroupToExpressForm(g, req, idx));
	});
	return groups.length;
}

// 선택한 template의 nodeGroups를 기존 NodeGroup 목록에 추가(append) — 수정 후 배포용 프리필
// infra 단위 값(description/policyOnPartialFailure/installMonAgent/sgTemplateId/vNetTemplateId/postCommand.userName·timeoutMinutes)은
// 이 모듈 상태에 보관만 하고, 실제 배포 payload 병합은 WEB-TECH-019(FR-05-02)에서 처리한다.
let templatePrefillInfraState = null;

export function addTemplateToForm() {
	const selected = templateSelectTable ? templateSelectTable.getSelectedData() : [];
	if (selected.length === 0) {
		webconsolejs["common/utils/toast"].showToast(webconsolejs["common/utils/toast"].TOAST_TYPES.ERROR, "Please select a template");
		return;
	}
	const template = selected[0];
	const req = template.infraDynamicReq || {};

	appendNodeGroupsToForm(req);

	templatePrefillInfraState = {
		description: req.description || "",
		policyOnPartialFailure: req.policyOnPartialFailure || "",
		installMonAgent: req.installMonAgent || "",
		vNetTemplateId: req.vNetTemplateId || "",
		sgTemplateId: req.sgTemplateId || "",
		postCommandUserName: req.postCommand?.userName || "",
		postCommandTimeoutMinutes: req.postCommand?.timeoutMinutes
	};
	// Create MCI 경로에서만 — Extend VM은 기존 MCI의 description을 유지한다
	if (!isVm && !$("#mci_desc").val() && templatePrefillInfraState.description) {
		$("#mci_desc").val(templatePrefillInfraState.description);
	}

	bootstrap.Modal.getInstance(document.getElementById("infra-template-select-modal"))?.hide();
}

// ─── JSON 파일로 NodeGroup Import ───────────────────────────────────────
// "진짜 Node Import" — export한 JSON(InfraDynamicReq 형상, mci.js exportInfraAsJson()이 만드는 것과 동일 포맷)을
// 읽어 Add Node 폼을 채운다. addTemplateToForm()과 동일하게 항상 "폼에 NodeGroup 추가" 경로로만 동작하고
// (JSON을 직접 받는 배포 전용 백엔드 엔드포인트가 없음), 실제 배포는 기존 Deploy 버튼으로 제출한다.

let importedNodeGroupsReq = null;

function resetImportJsonPreview() {
	const hint = document.getElementById("import-json-preview-hint");
	const content = document.getElementById("import-json-preview-content");
	if (hint) hint.classList.remove("d-none");
	if (content) content.classList.add("d-none");
	const btn = document.getElementById("btn-add-imported-nodegroups");
	if (btn) btn.disabled = true;
}

function renderImportJsonPreview(req) {
	const hint = document.getElementById("import-json-preview-hint");
	const content = document.getElementById("import-json-preview-content");
	if (!content) return;
	if (hint) hint.classList.add("d-none");
	content.classList.remove("d-none");

	const tbody = document.getElementById("import-json-nodegroup-rows");
	tbody.innerHTML = "";
	(req.nodeGroups || []).forEach(g => {
		const tr = document.createElement("tr");
		const rootDisk = [g.rootDiskType, g.rootDiskSize].filter(v => v !== undefined && v !== "" && v !== 0).join(" / ");
		[g.name, g.specId, g.imageId, g.nodeGroupSize, g.connectionName, rootDisk, g.zone].forEach(val => {
			const td = document.createElement("td");
			td.textContent = (val === undefined || val === null || val === "") ? "-" : String(val);
			tr.appendChild(td);
		});
		tbody.appendChild(tr);
	});
}

export function openImportJsonModal() {
	const fileInput = document.getElementById("import-nodegroups-json-file");
	if (fileInput) fileInput.value = "";
	importedNodeGroupsReq = null;
	resetImportJsonPreview();

	const modalEl = document.getElementById("import-nodegroups-json-modal");
	templateDeploySucceeded = false;
	modalEl.addEventListener("hidden.bs.modal", function () {
		if (!templateDeploySucceeded) revertDeployAlgorithmSelect();
	}, { once: true });
	bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

export async function handleImportJsonFileChange(input) {
	const file = input.files && input.files[0];
	if (!file) {
		importedNodeGroupsReq = null;
		resetImportJsonPreview();
		return;
	}
	try {
		const text = await file.text();
		const parsed = JSON.parse(text);
		// { infraDynamicReq: { nodeGroups: [...] } } 래핑 형태와 { nodeGroups: [...] } 형태 둘 다 허용
		const req = parsed.infraDynamicReq || parsed;
		const groups = req.nodeGroups;
		if (!Array.isArray(groups) || groups.length === 0) {
			throw new Error("JSON must contain a non-empty 'nodeGroups' array (optionally wrapped in 'infraDynamicReq').");
		}
		const REQUIRED_FIELDS = ["name", "specId", "imageId", "nodeGroupSize", "connectionName"];
		groups.forEach(function (g, i) {
			const missing = REQUIRED_FIELDS.filter(k => g[k] === undefined || g[k] === null || g[k] === "");
			if (missing.length > 0) {
				throw new Error("nodeGroups[" + i + "] is missing required field(s): " + missing.join(", "));
			}
		});

		importedNodeGroupsReq = req;
		renderImportJsonPreview(req);
		const btn = document.getElementById("btn-add-imported-nodegroups");
		if (btn) btn.disabled = false;
	} catch (e) {
		importedNodeGroupsReq = null;
		resetImportJsonPreview();
		webconsolejs["common/utils/toast"].showToast(webconsolejs["common/utils/toast"].TOAST_TYPES.ERROR, "Invalid JSON file: " + (e?.message || e));
	}
}

export function applyImportedNodeGroups() {
	if (!importedNodeGroupsReq) return;
	const count = appendNodeGroupsToForm(importedNodeGroupsReq);
	webconsolejs["common/utils/toast"].showToast(webconsolejs["common/utils/toast"].TOAST_TYPES.SUCCESS, count + " NodeGroup(s) added from JSON.");
	bootstrap.Modal.getInstance(document.getElementById("import-nodegroups-json-modal"))?.hide();
}
