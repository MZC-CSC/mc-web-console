import { TabulatorFull as Tabulator } from "tabulator-tables";

// workspace List 조회
//  . workspace list 생성 function에 data전달

// 전체 workspace 의 모든 project count
//  . 
// 모든 workspace에 할당된 user count

// Add workspace popup 호출


////
// 모달 콜백 예제 : confirm 버튼을 눌렀을 때 호출될 callback 함수로 사용할 용도
export function commoncallbac(val) {
  alert(val);
}
////

////////// TABULATOR //////////
var table;
var checked_array = [];
initWorkspaceTable();

// Table 초기값 설정
function initWorkspaceTable() {

  var tableObjParams = {};

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
      visible: false
    },
    {
      title: "Name",
      field: "name",
      vertAlign: "middle"
    },
    {
      title: "WorkspaceId",
      field: "workspace_id",
      visible: false
    },
  ];

  //table = setTabulator("workspacelist-table", tableObjParams, columns);
  table = webconsolejs["common/util"].setTabulator("workspacelist-table", tableObjParams, columns);

  // 행 클릭 시
  table.on("rowClick", function (e, row) {
    var workspaceID = row.getCell("workspace_id").getValue();
    getSelectedWorkspaceData(workspaceID)

  });

  //  선택된 여러개 row에 대해 처리
  table.on("rowSelectionChanged", function (data, rows) {
    checked_array = data
  });
}

// 클릭한 workspace info 가져오기
async function getSelectedWorkspaceData(workspaceID) {
  const data = {
    pathParams: {
      workspaceId: workspaceID
    }
  }

  ///api/ws/workspace/{workspaceId}
  var controller = "/api/" + "getworkspace";
  const response = await webconsolejs["common/api/http"].commonAPIPost(
    controller,
    data
  );

  var workspaceData = response.data.responseData.responseData;

  // SET MCIS Info 
  setWorkspaceInfoData(workspaceData)

  window.location.hash = "info_workspace"

}

// 클릭한 mci info 세팅
function setWorkspaceInfoData(workspaceData) {
  try {
    var workspaceId = workspaceData.workspace_id;
    var id = workspaceData.id;
    var name = workspaceData.name;
    var description = workspaceData.description;

    $("#info_id").val("");
    $("#info_name").val("");
    $("#info_workspace_desc").val("");
    $("#info_workspace_id").val("");

    $("#info_id").val(id);
    $("#info_name").val(name);
    $("#info_workspace_desc").val(description);
    $("#info_workspace_id").val(workspaceId);

  } catch (e) {
    console.error(e);
  }
}


export async function workspaceDetailInfo(workspaceID) {
  // Toggle MCIS Info
  var div = document.getElementById("server_info");
  webconsolejs["partials/layout/navigatePages"].toggleElement(div)

  // 기존 값들 초기화
  //clearServerInfo();

  var data = new Object();

}

// function clearWorkspaceInfo() {
//   console.log("clearWorkspaceInfo")

// }

//Tabulator Filter
//Define variables for input elements
var fieldEl = document.getElementById("filter-field");
var typeEl = document.getElementById("filter-type");
var valueEl = document.getElementById("filter-value");

// provider filtering / equel 고정
function providerFilter(data) {

  // case type like, equal, not eual
  // equal only
  if (typeEl.value == "=") {
    var vmCloudConnectionMap = webconsolejs["common/api/services/mci_api"].calculateConnectionCount(
      data.vm
    );
    var valueElValue = valueEl.value;
    if (valueElValue != "") {
      if (vmCloudConnectionMap.has(valueElValue)) {
        return true;
      } else {
        return false;
      }
    }

  } else {
    return true;
  }

  return true
}

//Trigger setFilter function with correct parameters
function updateFilter() {
  var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
  var typeVal = typeEl.options[typeEl.selectedIndex].value;

  var filter = filterVal == "provider" ? providerFilter : filterVal;

  if (filterVal == "provider") {
    typeEl.value = "=";
    typeEl.disabled = true;
  } else {
    typeEl.disabled = false;
  }

  if (filterVal) {
    table.setFilter(filter, typeVal, valueEl.value);
  }
}

//Update filters on value change
document.getElementById("filter-field").addEventListener("change", updateFilter);
document.getElementById("filter-type").addEventListener("change", updateFilter);
document.getElementById("filter-value").addEventListener("keyup", updateFilter);

//Clear filters on "Clear Filters" button click
document.getElementById("filter-clear").addEventListener("click", function () {
  fieldEl.value = "";
  typeEl.value = "=";
  valueEl.value = "";

  table.clearFilter();

});

// filter end

////////////////////////////////////////////////////// END TABULATOR ///////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", getWorkspaceList);

// workspace 목록조회
async function getWorkspaceList() {

  var selectedWs = $("#select-current-workspace").val()//

  const data = {
    pathParams: {
      //      nsId: nsid,
    },
  };
  //var controller = "targetController=getmcilist"
  var controller = "/api/" + "getworkspacelist";
  const response = await webconsolejs["common/api/http"].commonAPIPost(
    controller,
    data
  );

  var workspaceList = response.data.responseData;//response 자체가 array임.  

  getWorkspaceListCallbackSuccess(workspaceList);
}

// MCIS 목록 조회 후 화면에 Set

function getWorkspaceListCallbackSuccess(workspaceList) {
  table.setData(workspaceList);
}

// 해당 mci에서 상태값들을 count : 1개 mci의 상태는 1개만 있으므로 running, stop, terminate 중 1개만 1, 나머지는 0
// dashboard, mci 에서 사용

/////////////////////////////////////////////////////////////////////////////////////////////////


/////////////// Workspace Handling /////////////////
export async function deleteWorkspace() {

  if (checked_array.length == 0 || checked_array.length > 1) {
    alert("please select only one workspace");
    return;
  }

  for (const workspace of checked_array) {
    let data = {
      pathParams: {
        "workspaceId": workspace.workspace_id,
      }
    };
    let controller = "/api/" + "deleteworkspace";
    let response = await webconsolejs["common/api/http"].commonAPIPost(
      controller,
      data
    );
    if (response.data.status.code == "200" || response.data.status.code == "201") {
      // 저장 후 workspace 목록 조회
      getWorkspaceList()
    }

  }
}

function validWorkspace() {
  var name = $("#create_name").val();
  var desc = $("#create_description").val();

  return true
}

// workspace 저장 및 Create form 닫기
export async function saveWorkspace() {

  if (validWorkspace()) {

    var name = $("#create_name").val();
    var desc = $("#create_description").val();

    const data = {
      request: {
        "name": name,
        "description": desc,
      }
    }

    var controller = "/api/" + "createworkspace";
    const response = await webconsolejs["common/api/http"].commonAPIPost(
      controller,
      data
    );
    // save success 시 
    if (response.data.status.code == "200" || response.data.status.code == "201") {
      var div = document.getElementById("create_workspace");
      webconsolejs["partials/layout/navigatePages"].toggleElement(div)

      // 저장 후 workspace 목록 조회
      getWorkspaceList()
    }

  }
}

// Info Form 닫기
export function closeInfoForm() {

  var div = document.getElementById("info_workspace");
  webconsolejs["partials/layout/navigatePages"].toggleElement(div)
}