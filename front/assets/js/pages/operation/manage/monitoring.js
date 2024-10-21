import ApexCharts from "apexcharts"

// navBar에 있는 object인데 직접 handling( onchange)
$("#select-current-project").on('change', async function () {
  console.log("select-current-project changed ")
  let project = { "Id": this.value, "Name": this.options[this.selectedIndex].text, "NsId": this.options[this.selectedIndex].text }
  webconsolejs["common/api/services/workspace_api"].setCurrentProject(project)// 세션에 저장
  console.log("select-current-project on change ", project)
  var respMciList = await webconsolejs["common/api/services/mci_api"].getMciList(project.NsId);
  getMciListCallbackSuccess(project.NsId, respMciList);
})

////
// 모달 콜백 예제
export function commoncallbac(val) {
  alert(val);
}

var selectedWorkspaceProject = new Object();

//DOMContentLoaded 는 Page에서 1개만.
// init + 파일명 () : ex) initMonitoring() 를 호출하도록 한다.
document.addEventListener("DOMContentLoaded", initMonitoring);

// 해당 화면에서 최초 설정하는 function
//로드 시 prj 값 받아와 getPmkList 호출
async function initMonitoring() {
  console.log("initMonitoring")
  ////////////////////// partials init functions///////////////////////////////////////
  // try {
  //     webconsolejs["partials/operation/manage/pmkcreate"].initPmkCreate();//PmkCreate을 Partial로 가지고 있음. 
  // } catch (e) {
  //     console.log(e);
  // }
  ////////////////////// partials init functions end ///////////////////////////////////////

  ////////////////////// set workspace list, project list at Navbar///////////////////////////////////////
  selectedWorkspaceProject = await webconsolejs["partials/layout/navbar"].workspaceProjectInit();

  // workspace selection check
  webconsolejs["partials/layout/modal"].checkWorkspaceSelection(selectedWorkspaceProject)
  ////////////////////// set workspace list, project list at Navbar end //////////////////////////////////



  if (selectedWorkspaceProject.projectId != "") {
    var selectedProjectId = selectedWorkspaceProject.projectId;
    var selectedNsId = selectedWorkspaceProject.nsId;

    //getPmkList();// project가 선택되어 있으면 pmk목록을 조회한다.
    var respMciList = await webconsolejs["common/api/services/mci_api"].getMciList(selectedNsId);
    getMciListCallbackSuccess(selectedProjectId, respMciList);


    // ////////////////////// 받은 pmkId가 있으면 해당 pmkId를 set하고 조회한다. ////////////////
    // // 외부(dashboard)에서 받아온 pmkID가 있으면 pmk INFO 이동
    // // 현재 브라우저의 URL
    // const url = window.location.href;
    // const urlObj = new URL(url);
    // // URLSearchParams 객체 생성
    // const params = new URLSearchParams(urlObj.search);
    // // pmkID 파라미터 값 추출
    // selectedMonitoringID = params.get('pmkID');

    // console.log('selectedMonitoringID:', selectedMonitoringID);  // 출력: pmkID의 값 (예: com)
    // if (selectedMonitoringID != undefined) {
    //     toggleRowSelection(selectedPmkID)
    //     getSelectedPmkData(selectedPmkID)
    // }
    // ////////////////////  pmkId를 set하고 조회 완료. ////////////////
  }
}

function getMciListCallbackSuccess(nsId, mciList) {
  console.log("nsId", nsId)
  console.log("mciList", mciList)

  setMciList(mciList)
}

function setMciList(mciList) {
  var res_item = mciList.mci;

  // res_item이 배열인지 확인
  if (Array.isArray(res_item)) {
    // HTML option 리스트 초기값
    var html = '<option value="">Choose a Target MCI for Monitoring</option>';

    // res_item 배열을 순회하면서 각 MCI의 name을 option 태그로 변환
    res_item.forEach(item => {
      html += '<option value="' + item.id + '">' + item.name + '</option>';
    });

    // monitoring_mcilist 셀렉트 박스에 옵션 추가
    $("#monitoring_mcilist").empty();
    $("#monitoring_mcilist").append(html);
  } else {
    console.error("res_item is not an array");
  }
}

// mci 선택했을 때 displayMonitoringMci 
$("#monitoring_mcilist").on('change', async function () {
  console.log("monitoring_mcilist")

  var selectedMci = $("#monitoring_mcilist").val()
  console.log("selectedMci", selectedMci)

  selectedWorkspaceProject = await webconsolejs["partials/layout/navbar"].workspaceProjectInit();
  var selectedNsId = selectedWorkspaceProject.nsId;

  displayMonitoringMci(selectedNsId, selectedMci)

})


async function displayMonitoringMci(nsId, mciId) {
  console.log(mciId)

  //get mci

  var respMci = await webconsolejs["common/api/services/mci_api"].getMci(nsId, mciId);
  console.log("respMci", respMci)

  var vmList = respMci.responseData.vm
  if (Array.isArray(vmList) && vmList.length > 0) {
    displayServerStatusList(mciId, respMci.responseData.vm)
  } else {
    alert("There is no VM List !!")
  }


}

function displayServerStatusList(mciId, vmList) {
  console.log("displayServerStatusList")

  var res_item = vmList;

  if (Array.isArray(res_item)) {
    var html = '<option value="">Choose a Target VM for Monitoring</option>';

    res_item.forEach(item => {
      html += '<option value="' + item.id + '">' + item.name + '</option>';
    });

    // monitoring_mcilist 셀렉트 박스에 옵션 추가
    $("#monitoring_vmlist").empty();
    $("#monitoring_vmlist").append(html);
  } else {
    console.error("res_item is not an array");
  }

}

// vm 선택했을 때 displayMonitoringMci 
$("#monitoring_vmlist").on('change', async function () {
  console.log("monitoring_vmlist")

  var selectedVm = $("#monitoring_vmlist").val()
  console.log("selectedVm", selectedVm)

  selectedWorkspaceProject = await webconsolejs["partials/layout/navbar"].workspaceProjectInit();
  var selectedNsId = selectedWorkspaceProject.nsId;

  setMonitoringMesurement()

})

async function setMonitoringMesurement() {
  var respMeasurement = await webconsolejs["common/api/services/monitoring_api"].getPlugIns();
  console.log("respMesurement", respMeasurement)
  var data = respMeasurement.data;

  var measurementSelect = document.getElementById("monitoring_measurement");

  measurementSelect.innerHTML = "";

  var defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.text = "Select Measurement";
  measurementSelect.appendChild(defaultOption);

  data.forEach(function (item) {
    if (item.plugin_type === "INPUT") {
      var option = document.createElement("option");
      // option.value = item.plugin_id;
      option.value = item.name;
      option.text = item.name;

      measurementSelect.appendChild(option);
    }
  });
}

export async function startMonitoring() {

  var selectedMeasurement = $("#monitoring_measurement").val();
  var selectedRange = $("#monitoring_range").val();
  var selectedVMId = $("#monitoring_vmlist").val();

  var response = await webconsolejs["common/api/services/monitoring_api"].getInfluxDBMetrics(selectedMeasurement, selectedRange, selectedVMId);

  var respMonitoringData = response.data.responseData
  console.log("respMonitoringData", respMonitoringData)

  drawMonitoringGraph(respMonitoringData)
}

async function drawMonitoringGraph(MonitoringData) {
  const chartDataList = [];
  const chartLabels = [];

  // cpu0, cpu1, cpu2, cpu3 데이터만 필터링
  MonitoringData.data.forEach(cpuData => {
      if (["cpu0", "cpu1", "cpu2", "cpu3"].includes(cpuData.tags.cpu)) {
          const seriesData = {
              name: cpuData.tags.cpu,
              data: cpuData.values
                  .map(value => ({
                      x: value[0], // timestamp
                      y: value[1] !== null ? parseFloat(value[1]).toFixed(2) : null
                  }))
                  .filter(point => point.y !== null)
          };
          chartDataList.push(seriesData);

          cpuData.values.forEach(value => {
              const timestamp = value[0];
              if (!chartLabels.includes(timestamp)) {
                  chartLabels.push(timestamp);
              }
          });
      }
  });

  const options = {
      chart: {
          type: "area",
          height: 240,
          toolbar: {
              show: true,
          },
          animations: {
              enabled: false,
          }
      },
      title: {
          text: "CPU Usage Idle (cpu0, cpu1, cpu2, cpu3)",
          align: "center",
          style: {
              fontSize: "14px",
              fontWeight: "bold",
              color: "#263238"
          }
      },
      series: chartDataList,
      xaxis: {
          type: "datetime",
          labels: {
              format: "yyyy-MM-dd HH:mm:ss"
          }
      },
      yaxis: {
          labels: {
              formatter: function (val) {
                  return val;
              }
          }
      },
      labels: chartLabels,
      fill: {
          type: "solid",
          opacity: 0.16,
      },
      stroke: {
          curve: "smooth",
          width: 2
      },
      colors: ['#FF5733', '#33FF57', '#3357FF', '#FF33A6'],
      legend: {
          show: true,
          position: "top",
          horizontalAlign: "left",
          offsetY: -10,
          markers: {
              width: 10,
              height: 10,
              radius: 100,
          }
      },
      tooltip: {
          theme: "dark",
          y: {
              formatter: function (val) {
                  return val;  // 툴팁에서도 소수점 둘째 자리까지 표시
              }
          }
      },
      grid: {
          strokeDashArray: 4,
      }
  };

  const chart = new ApexCharts(document.getElementById("monitoring_chart_1"), options);
  chart.render();

  // const predictionSwitch = document.getElementById("monitoring_predictionSwitch").checked;
  const predictionSwitch = true

  if (predictionSwitch) {
    console.log("checked")
      var response = await webconsolejs["common/api/services/monitoring_api"].monitoringPrediction();
      console.log("Prediction Data:", response);

      if (response.data && response.data.responseData && response.data.responseData.data.values.length > 0) {
          const predictionData = response.data.responseData.data.values.map(value => ({
              x: value.timestamp,
              y: parseFloat(value.value).toFixed(2) // 소수점 둘째 자리까지 표현
          }));

          const predictionSeries = {
              name: "CPU Total (Predicted)",
              data: predictionData
          };

          chart.updateSeries([...chartDataList, predictionSeries]);
      } else {
          console.log("No prediction data available");
      }
  }
}