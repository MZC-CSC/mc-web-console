/*
    <a class="btn" data-bs-toggle="modal" data-bs-target="#commonDefaultModal"
        onclick="webconsolejs['partials/layout/modal'].commonModal(this,'customeTitle','Here Modal content','common/api/services/mci_api.commoncallbac','Arg')">
        commonSimpleModal
    </a>
*/
export function commonModal(elm, title, content, func, argument) {
    const form = elm.getAttribute('data-bs-target').replace(/^#/, '');  // 불러올 modal Id
    const funcArr = func.split(".");
    document.getElementById(`${form}-title`).innerText = title
    document.getElementById(`${form}-content`).innerText = content
    document.getElementById(`${form}-confirm-btn`).onclick = function () {
        const executefunction = `webconsolejs["${funcArr[0]}"].${funcArr[1]}('${argument}')`;
        eval(executefunction);
    };
}

// Modal 띄우는 function
export function commonTargetModal(targetModalId) {    
    const modal = new bootstrap.Modal(document.getElementById(targetModalId));
    modal.show();  // 모달 표시
}

/* 
    confirmModal을 script로 띄울 때 사용
    // targetModalId : modal.html에 정의된 모달의 ID
    // title : modal의 title text
    // content : modal에서 표시하는 message text
    // func : confirm시 동작할 function 정의(경로.function)
    // argument : function에 전달할 argument
*/
export function commonConfirmModal(targetModalId, title, content, func, argument) {    
    const modal = new bootstrap.Modal(document.getElementById(targetModalId));

    const funcArr = func.split(".");
    document.getElementById(`${targetModalId}-title`).innerText = title
    document.getElementById(`${targetModalId}-content`).innerText = content
    document.getElementById(`${targetModalId}-confirm-btn`).onclick = function () {
        const executefunction = `webconsolejs["${funcArr[0]}"].${funcArr[1]}('${argument}')`;
        eval(executefunction);
    };

    modal.show();  // 모달 표시
}

// default modal show
export function commonShowDefaultModal(title, content) {
    const modalId = 'commonDefaultModal';  // 모달의 ID 설정
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    document.getElementById(`${modalId}-title`).innerText = title;
    document.getElementById(`${modalId}-content`).innerText = content;
    document.getElementById(`${modalId}-confirm-btn`).onclick = modalHide('commonDefaultModal')
    modal.show();  // 모달 표시
}

// modal hide
// modalId = ex)'spec-search'
export function modalHide(modalId) {
    var myModalEl = document.getElementById(modalId);
    var modal = bootstrap.Modal.getInstance(myModalEl); // Returns a Bootstrap modal instance
    modal.hide();
}

// workspace selection 여부 확인 function
export function checkWorkspaceSelection(selectedWorkspaceProject) {
    if (selectedWorkspaceProject.workspaceId == "") {
        commonShowDefaultModal('Workspace Selection Check', 'Please select workspace first')
    }
}
// Modal OLD
//////////////////////////////////////////////////////////////////////////////////////////

// confirm modal창 보이기 modal창이 열릴 때 해당 창의 text 지정, close될 때 action 지정
function commonConfirmOpen(targetAction, caller) {
    //  [ id , 문구]
    let confirmModalTextMap = new Map(
        [
            ["CreateSnapshot", "Would you like to Create Snapshot?"],
            ["DeleteDataDisk", "Would you like to Delete Disk?"],
            ["DeleteMyImage", "Would you like to Delete MyImage?"],
            ["Logout", "Would you like to logout?"],
            ["Config", "Would you like to set Cloud config ?"],
            ["SDK", "Would you like to set Cloud Driver SDK ?"],
            ["Credential", "Would you like to set Credential ?"],
            ["Region", "Would you like to set Region ?"],
            ["Provider", "Would you like to set Cloud Provider ?"],

            ["MoveToConnection", "Would you like to set Cloud config ?"],
            ["ChangeConnection", "Would you like to change Cloud connection ?"],
            ["DeleteCloudConnection", "Would you like to delete <br /> the Cloud connection? "],

            ["DeleteCredential", "Would you like to delete <br /> the Credential? "],
            ["DeleteDriver", "Would you like to delete <br /> the Driver? "],
            ["DeleteRegion", "Would you like to delete <br /> the Region? "],


            // ["IdPassRequired", "ID/Password required !"],    --. 이거는 confirm이 아니잖아
            ["idpwLost", "Illegal account / password 다시 입력 하시겠습니까?"],
            ["ManageNS", "Would you like to manage <br />Name Space?"],
            ["NewNS", "Would you like to add a new Name Space?"],
            ["AddNewNameSpace", "Would you like to register NameSpace <br />Resource ?"],
            ["NameSpace", "Would you like to move <br />selected NameSpace?"],
            ["ChangeNameSpace", "Would you like to move <br />selected NameSpace?"],
            ["DeleteNameSpace", "Would you like to delete <br />selected NameSpace?"],

            ["AddNewVpc", "Would you like to create a new Network <br />Resource ?"],
            ["DeleteVpc", "Are you sure to delete this Network <br />Resource ?"],

            ["AddNewSecurityGroup", "Would you like to create a new Security <br />Resource ?"],
            ["DeleteSecurityGroup", "Would you like to delete Security <br />Resource ?"],

            ["AddNewSshKey", "Would you like to create a new SSH key <br />Resource ?"],
            ["DeleteSshKey", "Would you like to delete SSH key <br />Resource ?"],

            ["AddNewVirtualMachineImage", "Would you like to register Image <br />Resource ?"],
            ["DeleteVirtualMachineImage", "Would you like to un-register Image <br />Resource ?"],
            ["FetchImages", "Would you like to fetch images <br /> to this NameSpace ?"],

            ["AddNewVmSpec", "Would you like to register Spec <br />Resource ?"],
            ["DeleteVmSpec", "Would you like to un-register Spec <br />Resource ?"],
            ["FetchSpecs", "Would you like to fetch Spec <br /> to this NameSpace ?"],

            ["GotoMonitoringPerformance", "Would you like to view performance <br />for MCIS ?"],
            ["GotoMonitoringFault", "Would you like to view fault <br />for MCIS ?"],
            ["GotoMonitoringCost", "Would you like to view cost <br />for MCIS ?"],
            ["GotoMonitoringUtilize", "Would you like to view utilize <br />for MCIS ?"],

            ["MciLifeCycleReboot", "Would you like to reboot MCIS ?"],// mci_life_cycle('reboot')
            ["MciLifeCycleSuspend", "Would you like to suspend MCIS ?"],//onclick="mci_life_cycle('suspend')
            ["MciLifeCycleResume", "Would you like to resume MCIS ?"],//onclick="mci_life_cycle('resume')"
            ["MciLifeCycleTerminate", "Would you like to terminate MCIS ?"],//onclick="mci_life_cycle('terminate')
            ["MciManagement", "Would you like to manage MCIS ?"],// 해당 function 없음...
            ["MoveToMciManagement", "Would you like to manage MCIS ?"],
            ["MoveToMciManagementFromDashboard", "Would you like to manage MCIS ?"],

            ["AddNewMci", "Would you like to create MCIS ?"],
            ["AddNewMciDynamic", "Would you like to create MCIS ?"],
            ["DeleteMci", "Are you sure to delete this MCIS? "],
            ["ImportScriptOfMci", "Would you like to import MCIS script? "],
            ["ExportScriptOfMci", "Would you like to export MCIS script? "],
            ["ShowMonitoring", "Would you like to go to the Monitoring page?"],

            ["AddNewVmOfMci", "Would you like to add a new VM to this MCIS ?"],
            ["DeployServer", "Would you like to deploy?"],

            ["VmLifeCycle", "Would you like to view Server ?"],
            ["VmLifeCycleReboot", "Would you like to reboot VM ?"], //onclick="vm_life_cycle('reboot')"
            ["VmLifeCycleSuspend", "Would you like to suspend VM ?"], // onclick="vm_life_cycle('suspend')"
            ["VmLifeCycleResume", "Would you like to resume VM ?"], // onclick="vm_life_cycle('resume')"
            ["VmLifeCycleTerminate", "Would you like to terminate VM ?"], // onclick="vm_life_cycle('terminate')"
            ["VmManagement", "Would you like to manage VM ?"], // 해당 function 없음
            ["AddNewVm", "Would you like to add VM ?"], //onclick="vm_add()"
            ["ExportVmScriptOfMci", "Would you like to export VM script ?"], //onclick="vm_add()"


            ["DifferentConnection", "Do you want to set different connectionName?"],
            ["DifferentConnectionAtSecurityGroup", "Do you want to set different connectionName?"],
            ["DifferentConnectionAtAssistPopup", "Do you want to set different connectionName?"],

            ["AddMonitoringAlertPolicy", "Would you like to register Threshold ?"],
            ["DeleteMonitoringAlertPolicy", "Are you sure to delete this Threshold ?"],
            ["AddNewMcks", "Would you like to create MCKS ?"],
            ["DeleteMcks", "Are you sure to delete this MCKS? "],
            ["AddNewNodeOfMcks", "Would you like to add a new Node to this MCKS ?"],
            ["DeleteNodeOfMcks", "Would you like to delete a Node of this MCKS ?"],


            ["AddMonitoringAlertEventHandler", "Would you like to add<br />Monitoring Alert Event-Handler ?"],
            ["deleteMonitoringAlertEventHandler", "Are you sure to delete<br />this Monitoring Alert Event-Handler?"],

            ["RegisterRecommendSpec", "현재 해당 connection에서 사용가능한 spec 이 없습니다. 등록 하시겠습니까?"],

            ["DeleteNlb", "Would you like to delete NLB ?"],

            ["AddNewPmk", "Would you like to create PMKS ?"],
            ["DeletePmks", "Are you sure to delete this PMKS? "],
            ["AddNewNodeGroupOfPmks", "Would you like to add a new NodeGroup to this PMKS ?"],
            ["DeleteNodeGroupOfPmks", "Would you like to delete a NodeGroup of this PMKS ?"],


            ["WorkspaceDelete", "Are you sure  you want to delete the Workspace ?"],

        ]
    );
    try {
        // $('#modalText').text(targetText);// text아니면 html로 해볼까? 태그있는 문구가 있어서
        //$('#modalText').text(confirmModalTextMap.get(targetAction));
        $('#confirmText').html(confirmModalTextMap.get(targetAction));
        $('#confirmOkAction').val(targetAction);
        $('#confirmCaller').val(caller);

        if (targetAction == "Region") {
            // button에 target 지정
            // data-target="#Add_Region_Register"
            // TODO : confirm 으로 물어본 뒤 OK버튼 클릭 시 targetDIV 지정하도록
        }
        $('#confirmArea').modal();
    } catch (e) {
        console.log(e);
        alert(e);
    }
}

// confirm modal창에서 ok버튼 클릭시 수행할 method 지정
function commonConfirmOk() {
    //modalArea
    var targetAction = $('#confirmOkAction').val();
    var caller = $('#confirmCaller').val();
    if (targetAction == "Logout") {
        // Logout처리하고 index화면으로 간다. Logout ==> cookie expire
        // location.href="/logout"
        var targetUrl = "/logout"
        changePage(targetUrl)

    } else if (targetAction == "MoveToConnection") {
        var targetUrl = "/setting/connections/cloudconnectionconfig/mngform"
        changePage(targetUrl)
    } else if (targetAction == "ChangeConnection") { // recommendvm에서 다른 connection 선택 시
        changeCloudConnection()
    } else if (targetAction == "DeleteCloudConnection") {
        deleteCloudConnection();
    } else if (targetAction == "Config") {
        //id="Config"
    } else if (targetAction == "SDK") {
        //id="SDK"
    } else if (targetAction == "DeleteCredential") {
        deleteCredential();
    } else if (targetAction == "DeleteDriver") {
        deleteDriver();
    } else if (targetAction == "DeleteRegion") {
        deleteRegion();

    } else if (targetAction == "Credential") {
        //id="Credential"
    } else if (targetAction == "Region") {
        //id="Region"
    } else if (targetAction == "Provider") {
        //id="Provider"
    } else if (targetAction == "required") {//-- IdPassRequired
    } else if (targetAction == "idpwLost") {//-- 
    } else if (targetAction == "ManageNS") {//-- ManageNS
        var targetUrl = "/setting/namespaces/namespace/mngform"
        changePage(targetUrl)
    } else if (targetAction == "NewNS") {//-- NewNS
        var targetUrl = "/setting/namespaces/namespace/mngform"
        changePage(targetUrl)
    } else if (targetAction == "ChangeNameSpace") {//-- ChangeNameSpace
        var changeNameSpaceID = $("#tempSelectedNameSpaceID").val();
        setDefaultNameSpace(changeNameSpaceID)
    } else if (targetAction == "AddNewNameSpace") {//-- AddNewNameSpace
        displayNameSpaceInfo("REG")
        goFocus('ns_reg');// 해당 영역으로 scroll
    } else if (targetAction == "DeleteNameSpace") {
        deleteNameSpace()
    } else if (targetAction == "AddNewVpc") {
        displayVNetInfo("REG")
        goFocus('vnetCreateBox');
    } else if (targetAction == "DeleteVpc") {
        deleteVPC()
    } else if (targetAction == "AddNewSecurityGroup") {
        displaySecurityGroupInfo("REG")
        goFocus('securityGroupCreateBox');
    } else if (targetAction == "DeleteSecurityGroup") {
        deleteSecurityGroup()
    } else if (targetAction == "AddNewSshKey") {
        displaySshKeyInfo("REG")
        goFocus('sshKeyCreateBox');
    } else if (targetAction == "DeleteSshKey") {
        deleteSshKey()
    } else if (targetAction == "AddNewVirtualMachineImage") {
        displayVirtualMachineImageInfo("REG")
        goFocus('virtualMachineImageCreateBox');
    } else if (targetAction == "DeleteVirtualMachineImage") {
        deleteVirtualMachineImage()
    } else if (targetAction == "FetchImages") {
        getCommonFetchImages();
    } else if (targetAction == "AddNewVmSpec") {
        displayVmSpecInfo("REG")
        goFocus('vmSpecCreateBox');
    } else if (targetAction == "ExportVmScriptOfMci") {
        vmScriptExport();
    } else if (targetAction == "DeleteVmSpec") {
        deleteVmSpec();
    } else if (targetAction == "FetchSpecs") {
        var connectionName = $("#regConnectionName").val();
        putFetchSpecs(connectionName);
    } else if (targetAction == "GotoMonitoringPerformance") {
        // alert("모니터링으로 이동 GotoMonitoringPerformance")
        // location.href ="";//../operation/Monitoring_Mci.html
        var targetUrl = "/operation/monitorings/mcimng/mngform"
        changePage(targetUrl)
    } else if (targetAction == "GotoMonitoringFault") {
        // alert("모니터링으로 이동 GotoMonitoringFault")
        // location.href ="";//../operation/Monitoring_Mci.html
        var targetUrl = "/operation/monitorings/mcimng/mngform"
        changePage(targetUrl)
    } else if (targetAction == "GotoMonitoringCost") {
        // alert("모니터링으로 이동 GotoMonitoringCost")
        // location.href ="";//../operation/Monitoring_Mci.html
        var targetUrl = "/operation/monitorings/mcimng/mngform"
        changePage(targetUrl)
    } else if (targetAction == "GotoMonitoringUtilize") {
        // alert("모니터링으로 이동 GotoMonitoringUtilize")
        // location.href ="";//../operation/Monitoring_Mci.html    
        var targetUrl = "/operation/monitorings/mcimng/mngform"
        changePage(targetUrl)
    } else if (targetAction == "MciLifeCycleReboot") {
        callMciLifeCycle('reboot')
    } else if (targetAction == "MciLifeCycleSuspend") {
        callMciLifeCycle('suspend')
    } else if (targetAction == "MciLifeCycleResume") {
        callMciLifeCycle('resume')
    } else if (targetAction == "MciLifeCycleTerminate") {
        callMciLifeCycle('terminate')
    } else if (targetAction == "MciManagement") {
        alert("Undefined function to perform");
    } else if (targetAction == "MoveToMciManagementFromDashboard") {
        var mciID = $("#mci_id").val();
        var targetUrl = "/operation/manages/mcimng/mngform?mciid=" + mciID;
        changePage(targetUrl)
    } else if (targetAction == "MoveToMciManagement") {
        var targetUrl = "/operation/manages/mcimng/mngform";
        changePage(targetUrl)
    } else if (targetAction == "AddNewMci") {
        // $('#loadingContainer').show();
        // location.href ="/operation/manages/mci/regform/";
        var targetUrl = "/operation/manages/mcimng/regform";
        changePage(targetUrl)
    } else if (targetAction == "DeleteMci") {
        deleteMCIS();
    } else if (targetAction == "DeployServer") {
        deployVm();
    } else if (targetAction == "ImportScriptOfMci") {
        mciScriptImport();
    } else if (targetAction == "ExportScriptOfMci") {
        mciScriptExport();
    } else if (targetAction == "ShowMonitoring") {
        var mciID = $("#mci_id").val();
        var targetUrl = "/operation/monitorings/mcimonitoring/mngform?mciId=" + mciID;
        changePage(targetUrl)
    } else if (targetAction == "VmLifeCycle") {
        alert("Undefined function to perform");
    } else if (targetAction == "VmLifeCycleReboot") {
        vmLifeCycle('reboot')
    } else if (targetAction == "VmLifeCycleSuspend") {
        vmLifeCycle('suspend')
    } else if (targetAction == "VmLifeCycleResume") {
        vmLifeCycle('resume')
    } else if (targetAction == "VmLifeCycleTerminate") {
        vmLifeCycle('terminate')
    } else if (targetAction == "VmManagement") {
        alert("Undefined function to perform");
    } else if (targetAction == "AddNewVm") {
        addNewVirtualMachine()
    } else if (targetAction == "AddNewVmOfMci") {
        addNewVirtualMachine()
    } else if (targetAction == "ExportVmScriptOfMci") {
        vmScriptExport();
    } else if (targetAction == "--") {
        addNewVirtualMachine()
    } else if (targetAction == "monitoringConfigPolicyConfig") {
        regMonitoringConfigPolicy()
    } else if (targetAction == "DifferentConnection") {
        setAndClearByDifferentConnectionName(caller);
    } else if (targetAction == "DifferentConnectionAtSecurityGroup") {
        uncheckDifferentConnectionAtSecurityGroup();
    } else if (targetAction == "DifferentConnectionAtAssistPopup") {
        // connection이 다른데도 set 한다고 하면 이전에 설정한 값들을 초기화 한 후 set한다.
        applyAssistValues(caller);
    } else if (targetAction == "AddMonitoringAlertPolicy") {
        addMonitoringAlertPolicy();
    } else if (targetAction == "DeleteMonitoringAlertPolicy") {
        deleteMonitoringAlertPolicy();
    } else if (targetAction == "AddNewMcks") {
        var targetUrl = "/operation/manages/mcksmng/regform";
        changePage(targetUrl)
    } else if (targetAction == "AddNewNodeOfMcks") {
        addNewNode();
    } else if (targetAction == "DeleteNodeOfMcks") {
        deleteNodeOfMcks();
    } else if (targetAction == "AddMonitoringAlertEventHandler") {
        addMonitoringAlertEventHandler();
    } else if (targetAction == "deleteMonitoringAlertEventHandler") {
        deleteMonitoringAlertEventHandler();
    } else if (targetAction == "DeleteMcks") {
        deleteMCKS();
    } else if (targetAction == "RegisterRecommendSpec") {
        commonPromptOpen("RegisterRecommendSpec")
    } else if (targetAction == "AddNewMciDynamic") {
        dynamicMci()
    } else if (targetAction == "DeleteDataDisk") {
        deleteDataDisk();

    } else if (targetAction == "DeleteMyImage") {
        deleteMyImageDisk();

    } else if (targetAction == "CreateSnapshot") {
        commonPromptOk
        createSnapshot();

    } else if (targetAction == "DeleteNlb") {
        deleteNlb();
    } else if (targetAction == "AddNewPmk") {
        changePage("PmksClusterRegForm");
    } else if (targetAction == "DeletePmks") {
        deleteCluster();
    } else if (targetAction == "AddNewNodeGroupOfPmks") {
        changePage("PmksNodeGroupRegForm");
    } else if (targetAction == "DeleteNodeGroupOfPmks") {
        deleteNodeGroupOfPmks();
    } else {
        alert("Undefined function to perform: " + targetAction);
    }
    commonConfirmClose();
}

// confirm modal창 닫기. setting값 초기화
function commonConfirmClose() {
    $('#confirmText').text('');
    $('#confirmOkAction').val('');
    // $('#modalArea').hide(); 
    $("#confirmArea").modal("hide");
}

function commonPromptEnter(keyEvent) {
    if (keyEvent.keyCode == 13) {
        commonPromptOk();
    }
}

function commonPromptOk() {
    var targetAction = $('#promptOkAction').val();
    var targetObjId = $('#promptTargetObjId').val();
    var targetValue = $('#promptText').val();

    if (targetAction == 'FilterName') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Name", targetValue)
        }
    } else if (targetAction == 'FilterCloudProvider') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Cloud Provider", targetValue)
        }
    } else if (targetAction == 'FilterDriver') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Driver", targetValue)
        }
    } else if (targetAction == 'FilterCredential') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Credential", targetValue)
        }
    } else if (targetAction == 'RsFltVPCName') {// Name이라는 Column을 Filtering
        var filterKey = "name"
        if (targetValue) {
            getCommonSecurityGroupList("", "name", "", filterKey, targetValue)
        }
    } else if (targetAction == 'RsFltCIDRBlock') {// Name이라는 Column을 Filtering
        var filterKey = "cidrBlock"
        if (targetValue) {
            getCommonSecurityGroupList("", "name", "", filterKey, targetValue)
        }
    } else if (targetAction == 'RsFltSecurityGroupName') {// Name이라는 Column을 Filtering
        var filterKey = "cspSecurityGroupName"
        if (targetValue) {
            getCommonSecurityGroupList("securitygroupmng", "name", "", filterKey, targetValue)
        }
    } else if (targetAction == 'RsFltConnectionName') {// Name이라는 Column을 Filtering
        var filterKey = "connectionName"
        if (targetValue) {
            getCommonSecurityGroupList("securitygroupmng", "name", "", filterKey, targetValue)
        }
    } else if (targetAction == 'RsFltSshName') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Name", targetValue)
        }
    } else if (targetAction == 'RsFltSshConnName') {// Name이라는 Column을 Filtering
        var filterKey = "connectionName"
        if (targetValue) {
            getCommonSshKeyList("", "name", "", filterKey, targetValue)
        }
    } else if (targetAction == 'RsFltSshKeyName') {// Name이라는 Column을 Filtering
        var filterKey = "name"
        if (targetValue) {
            getCommonSshKeyList("", "name", "", filterKey, targetValue)
        }
    } else if (targetAction == 'RsFltSrvImgId') {// Name이라는 Column을 Filtering
        var filterKey = "cspImageId"
        if (targetValue) {
            getCommonVirtualMachineImageList("virtualmachineimagemng", "name", "", filterKey, targetValue)
        }
    } else if (targetAction == 'RsFltSrvImgName') {// Name이라는 Column을 Filtering
        var filterKey = "name"
        if (targetValue) {
            getCommonVirtualMachineImageList("virtualmachineimagemng", "name", "", filterKey, targetValue)
        }
    } else if (targetAction == 'RsFltSrvSpecName') {// Name이라는 Column을 Filtering
        var filterKey = "name"
        if (targetValue) {
            getCommonVirtualMachineSpecList("virtualmachinespecmng", "name", "", filterKey, targetValue)
        }
    } else if (targetAction == 'RsFltSrvSpecConnName') {// Name이라는 Column을 Filtering
        var filterKey = "connectionName"
        if (targetValue) {
            getCommonVirtualMachineSpecList("virtualmachinespecmng", "name", "", filterKey, targetValue)
        }
    } else if (targetAction == 'RsFltSrvCspSpecName') {// Name이라는 Column을 Filtering
        var filterKey = "cspSpecName"
        if (targetValue) {
            getCommonVirtualMachineSpecList("virtualmachinespecmng", "name", "", filterKey, targetValue)
        }
    } else if (targetAction == 'NSFltName') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Name", targetValue)
        }
    } else if (targetAction == 'NSFltId') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "ID", targetValue)
        }
    } else if (targetAction == 'NSFltDescription') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "description", targetValue)
        }
    } else if (targetAction == 'AlertPolicyName') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Name", targetValue)
        }
    } else if (targetAction == 'AlertPolicyMeasurement') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Measurement", targetValue)
        }
    } else if (targetAction == 'AlertPolicyTargetType') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Target Type", targetValue)
        }
    } else if (targetAction == 'AlertPolicyEventType') {// Name이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Alert Event Type", targetValue)
        }
    } else if (targetAction == 'FilterMciName') {// Name이라는 Column을 Filtering
        if (targetValue) {
            // keyword표시
            searchKeyword(targetValue, 'mcilistfilter')
        }
    } else if (targetAction == 'FilterMciStatus') {// Status이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Status", targetValue)
        }
    } else if (targetAction == 'FilterMciDesc') {// Description이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Description", targetValue)
        }
    } else if (targetAction == 'OprMngMcksStatus') {// Description이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Status", targetValue)
        }
    } else if (targetAction == 'OprMngMcksName') {// Description이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "Name", targetValue)
        }
    } else if (targetAction == 'OprMngMcksNetworkCni') {// Description이라는 Column을 Filtering
        if (targetValue) {
            filterTable(targetObjId, "NetworkCni", targetValue)
        }
    } else if (targetAction == 'RemoteCommandMci') {
        if (targetValue) {
            remoteCommandMci(targetValue);
            //postRemoteCommandMci(targetValue);
        }
    } else if (targetAction == 'RemoteCommandVmOfMci') {
        if (targetValue) {
            remoteCommandVmMci(targetValue);
        }
    } else if (targetAction == 'RegisterRecommendSpec') {
        createRecommendSpec(targetValue);
    } else if (targetAction == 'AddNewMciDynamic') {
        $("#mci_name").val(targetValue)
        dynamicMci()
    } else if (targetAction == 'CreateSnapshot') {
        createSnapshot(targetValue);
    }


    commonPromptClose();
}

function commonPromptClose() {
    $('#promptQuestion').text('');
    $('#promptText').text('');
    $('#promptOkAction').val('');
    $("#promptArea").modal("hide");
}

// alert창 닫기
function commonAlertClose() {
    $("#alertArea").modal("hide");
}

// alert창 닫기
function commonResultAlertClose() {
    $("#alertResultArea").modal("hide");
}

function guideAreaHide() {
    $("#guideArea").modal("hide");
}