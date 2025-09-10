import { TabulatorFull as Tabulator } from "tabulator-tables";

export function setTabulator(
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

  var tabulatorTable = new Tabulator("#" + tableObjId, {
    placeholder,
    pagination,
    paginationSize,
    paginationSizeSelector,
    movableColumns,
    columnHeaderVertAlign,
    paginationCounter,
    layout,
    columns: columnsParams,
    selectable: isMultiSelect == false ? 1 : true,
  });

  return tabulatorTable;
}


// 화면이동 
export function changePage(target, urlParamMap) {
  var url = "";
  // target에 따라 url을 달리한다.

  // pathParam을 뒤에 붙인다.
  var keyIndex = 0;
  for (let key of urlParamMap.keys()) {
    var urlParamValue = urlParamMap.get(key)

    if (keyIndex == 0) {
      url += "?" + key + "=" + urlParamValue;
    } else {
      url += "&" + key + "=" + urlParamValue;
    }

  }

  // 해당 화면으로 이동한다.
  location.href = url;
}




///////////////////////

export function isEmpty(str) {
  if (typeof str == "undefined" || str == null || str == "")
    return true;
  else
    return false;
}

// column show & hide
export function displayColumn(table) {
  $(".display-column").on("click", function () {
    if ($(this).children("input:checkbox").is(":checked")) {
      $(this).children(".material-icons").text("visibility");
      table.showColumn($(this).data("column"));
    } else {
      $(this).children(".material-icons").text("visibility_off");
      table.hideColumn($(this).data("column"));
    }
  });
}


// 공통으로 사용하는 data 조회 function : 목록(list), 단건(data) 동일
// optionParamMap.set("is_cb", "N");// db를 조회하는 경우 'N', cloud-barista를 직접호출하면 is_cb='Y'. 기본은 is_cb=Y
// filter 할 조건이 있으면 filterKey="connectionName", filterVal="conn-xxx" 등으로 optionParam에 추가하면 됨.
// optionParamMap.set("option", "id");// 결과를 id만 가져오는 경우는 option="id"를 추가 한다.
// buffalo의 helperName으로 router를 찾도록 변경함.
//export function getCommonData(caller, controllerKeyName, optionParamMap, callbackSuccessFunction, callbackFailFunction){
export function getCommonData(
  caller,
  helperName,
  optionParamMap,
  callbackSuccessFunction,
  callbackFailFunction
) {
  //var url = getURL(controllerKeyName, optionParamMap);
  var url = getURL(helperName, optionParamMap);

  axios
    .get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((result) => {
      console.log("result", result)
      if (
        callbackSuccessFunction == undefined ||
        callbackSuccessFunction == ""
      ) {
        var data = result.data;
      } else {
        callbackSuccessFunction(caller, result);
      }
    })
    .catch((error) => {
      console.warn(error);
      if (callbackFailFunction == undefined || callbackFailFunction == "") {
        mcpjs["util/util"].alert(error);
      } else {
        callbackFailFunction(caller, error);
      }
    });
}
// export function commonAlert(alertMessage) {
//   console.log(alertMessage);
//   // $('#alertText').text(alertMessage);
//   $('#alertText').html(alertMessage);
//   $("#alertArea").modal();
// }
// sw 설치화면으로 이동.
export function installSwtoVm() {
  // 
  window.location = "/webconsole/operations/manage/swcatalogs";
}

// 날자 포맷 변경
// ex) "2024-10-17T01:27:34.25956Z"; -> 2024-10-17 01:27:34
export function dateYYYYMMDDHH24MISS(dateString) {
  const date = new Date(dateString);

  // 각 값 가져오기
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // 형식에 맞춰서 문자열로 반환
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}