package handler

import (
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/m-cmp/mc-web-console/common"
)

// Disk 정보 조회
// Provider, connection 에서 사용가능한 DiskType 조회
// 현재 : spider의 cloudos_meta.yaml 값 사용
// func DiskLookup(providerId string, connectionName string) ([]LookupDiskInfo, error) {
func DiskLookup(c echo.Context) error {
	commonRequest := &common.CommonRequest{}
	c.Bind(commonRequest)

	providerId := strings.ToUpper(commonRequest.QueryParams["provider"])
	connectionName := commonRequest.QueryParams["connectionName"]

	//defaultNameSpaceID := loginInfo.DefaultNameSpaceID
	diskInfoMap := map[string]LookupDiskInfo{}

	// 변환 : 구분자만 빼서 공백 빼고 array로
	awsRootdiskType := "standard / gp2 / gp3"
	awsDiskType := "standard / gp2 / gp3 / io1 / io2 / st1 / sc1"
	awsDiskSize := "standard|1|1024|GB / gp2|1|16384|GB / gp3|1|16384|GB / io1|4|16384|GB / io2|4|16384|GB / st1|125|16384|GB / sc1|125|16384|GB"
	awsDiskInfo := LookupDiskInfo{
		ProviderID:   "AWS",
		RootDiskType: strings.Split(strings.ReplaceAll(awsRootdiskType, " ", ""), "/"),
		DataDiskType: strings.Split(strings.ReplaceAll(awsDiskType, " ", ""), "/"),
		DiskSize:     parseDiskSize(awsDiskSize),
	}
	diskInfoMap["AWS"] = awsDiskInfo

	gcpRootdiskType := "pd-standard / pd-balanced / pd-ssd / pd-extreme"
	gcpDiskType := "pd-standard / pd-balanced / pd-ssd / pd-extreme"
	gcpDiskSize := "pd-standard|10|65536|GB / pd-balanced|10|65536|GB / pd-ssd|10|65536|GB / pd-extreme|500|65536|GB"
	gcpDiskInfo := LookupDiskInfo{
		ProviderID:   "GCP",
		RootDiskType: strings.Split(strings.ReplaceAll(gcpRootdiskType, " ", ""), "/"),
		DataDiskType: strings.Split(strings.ReplaceAll(gcpDiskType, " ", ""), "/"),
		DiskSize:     parseDiskSize(gcpDiskSize),
	}
	diskInfoMap["GCP"] = gcpDiskInfo

	aliRootdiskType := "cloud_essd / cloud_efficiency / cloud / cloud_ssd"
	aliDiskType := "cloud / cloud_efficiency / cloud_ssd / cloud_essd"
	aliDiskSize := "cloud|5|2000|GB / cloud_efficiency|20|32768|GB / cloud_ssd|20|32768|GB / cloud_essd_PL0|40|32768|GB / cloud_essd_PL1|20|32768|GB / cloud_essd_PL2|461|32768|GB / cloud_essd_PL3|1261|32768|GB"
	aliDiskInfo := LookupDiskInfo{
		ProviderID:   "ALIBABA",
		RootDiskType: strings.Split(strings.ReplaceAll(aliRootdiskType, " ", ""), "/"),
		DataDiskType: strings.Split(strings.ReplaceAll(aliDiskType, " ", ""), "/"),
		DiskSize:     parseDiskSize(aliDiskSize),
	}
	diskInfoMap["ALIBABA"] = aliDiskInfo

	tencentRootdiskType := "CLOUD_PREMIUM / CLOUD_SSD"
	tencentDiskType := "CLOUD_PREMIUM / CLOUD_SSD / CLOUD_HSSD / CLOUD_BASIC / CLOUD_TSSD"
	tencentDiskSize := "CLOUD_PREMIUM|10|32000|GB / CLOUD_SSD|20|32000|GB / CLOUD_HSSD|20|32000|GB / CLOUD_BASIC|10|32000|GB / CLOUD_TSSD|10|32000|GB"
	tencentDiskInfo := LookupDiskInfo{
		ProviderID:   "TENCENT",
		RootDiskType: strings.Split(strings.ReplaceAll(tencentRootdiskType, " ", ""), "/"),
		DataDiskType: strings.Split(strings.ReplaceAll(tencentDiskType, " ", ""), "/"),
		DiskSize:     parseDiskSize(tencentDiskSize),
	}
	diskInfoMap["TENCENT"] = tencentDiskInfo

	dataDiskInfoList := []LookupDiskInfo{}
	if providerId != "" {
		// TODO : 해당 connection으로 사용가능한 DISK 정보 조회
		if connectionName != "" { // 현재는 connection으로 filter 하지 않음

		}
		//providerDisk := LookupDiskInfo{}
		providerDisk := diskInfoMap[providerId]
		dataDiskInfoList = append(dataDiskInfoList, providerDisk)
	} else if connectionName != "" {
		// 모든 provider의 datadisk 정보 조회...
		// getConnection 에서 Provider 가져옴
	}

	commonResponse := &common.CommonResponse{}
	commonResponse.Status.Message = "success"
	commonResponse.Status.StatusCode = 200
	commonResponse.ResponseData = dataDiskInfoList
	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

// Provider, Region 에서 사용가능한 DiskType 조회
// 현재 : spider의 cloudos_meta.yaml 값 사용
// Region 값에 따라 달라지는게 있으면 추가할 것.c echo.Context, commonRequest *CommonRequest
func AvailableDiskTypeByProviderRegion(c echo.Context) error {
	commonRequest := &common.CommonRequest{}
	c.Bind(commonRequest)

	providerId := strings.ToUpper(commonRequest.QueryParams["provider"])
	regionName := commonRequest.QueryParams["regionName"]

	diskInfoMap := map[string]AvailableDiskType{}

	// 변환 : 구분자만 빼서 공백 빼고 array로
	awsRootdiskType := "standard / gp2 / gp3"
	awsDiskType := "standard / gp2 / gp3 / io1 / io2 / st1 / sc1"
	awsDiskSize := "standard|1|1024|GB / gp2|1|16384|GB / gp3|1|16384|GB / io1|4|16384|GB / io2|4|16384|GB / st1|125|16384|GB / sc1|125|16384|GB"
	awsDiskInfo := AvailableDiskType{
		ProviderID:   "AWS",
		RootDiskType: strings.Split(strings.ReplaceAll(awsRootdiskType, " ", ""), "/"),
		DataDiskType: strings.Split(strings.ReplaceAll(awsDiskType, " ", ""), "/"),
		DiskSize:     parseDiskSize(awsDiskSize),
	}
	diskInfoMap["AWS"] = awsDiskInfo

	gcpRootdiskType := "pd-standard / pd-balanced / pd-ssd / pd-extreme"
	gcpDiskType := "pd-standard / pd-balanced / pd-ssd / pd-extreme"
	gcpDiskSize := "pd-standard|10|65536|GB / pd-balanced|10|65536|GB / pd-ssd|10|65536|GB / pd-extreme|500|65536|GB"
	gcpDiskInfo := AvailableDiskType{
		ProviderID:   "GCP",
		RootDiskType: strings.Split(strings.ReplaceAll(gcpRootdiskType, " ", ""), "/"),
		DataDiskType: strings.Split(strings.ReplaceAll(gcpDiskType, " ", ""), "/"),
		DiskSize:     parseDiskSize(gcpDiskSize),
	}
	diskInfoMap["GCP"] = gcpDiskInfo

	aliRootdiskType := "cloud_essd / cloud_efficiency / cloud / cloud_ssd"
	aliDiskType := "cloud / cloud_efficiency / cloud_ssd / cloud_essd"
	aliDiskSize := "cloud|5|2000|GB / cloud_efficiency|20|32768|GB / cloud_ssd|20|32768|GB / cloud_essd_PL0|40|32768|GB / cloud_essd_PL1|20|32768|GB / cloud_essd_PL2|461|32768|GB / cloud_essd_PL3|1261|32768|GB"
	aliDiskInfo := AvailableDiskType{
		ProviderID:   "ALIBABA",
		RootDiskType: strings.Split(strings.ReplaceAll(aliRootdiskType, " ", ""), "/"),
		DataDiskType: strings.Split(strings.ReplaceAll(aliDiskType, " ", ""), "/"),
		DiskSize:     parseDiskSize(aliDiskSize),
	}
	diskInfoMap["ALIBABA"] = aliDiskInfo

	tencentRootdiskType := "CLOUD_PREMIUM / CLOUD_SSD"
	tencentDiskType := "CLOUD_PREMIUM / CLOUD_SSD / CLOUD_HSSD / CLOUD_BASIC / CLOUD_TSSD"
	tencentDiskSize := "CLOUD_PREMIUM|10|32000|GB / CLOUD_SSD|20|32000|GB / CLOUD_HSSD|20|32000|GB / CLOUD_BASIC|10|32000|GB / CLOUD_TSSD|10|32000|GB"
	tencentDiskInfo := AvailableDiskType{
		ProviderID:   "TENCENT",
		RootDiskType: strings.Split(strings.ReplaceAll(tencentRootdiskType, " ", ""), "/"),
		DataDiskType: strings.Split(strings.ReplaceAll(tencentDiskType, " ", ""), "/"),
		DiskSize:     parseDiskSize(tencentDiskSize),
	}
	diskInfoMap["TENCENT"] = tencentDiskInfo

	dataDiskInfoList := []AvailableDiskType{}
	if providerId != "" {
		if regionName != "" { // TODO : Region에 따라 달라지면 보완할 것

		}
		providerDisk := diskInfoMap[strings.ToUpper(providerId)]
		dataDiskInfoList = append(dataDiskInfoList, providerDisk)
	}

	commonResponse := common.CommonResponseStatusOK(dataDiskInfoList)
	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func parseDiskSize(diskSizeString string) []DiskSizeInfo {
	diskSizeList := strings.Split(strings.ReplaceAll(diskSizeString, " ", ""), "/")
	var diskSizes []DiskSizeInfo
	for _, size := range diskSizeList {
		parts := strings.Split(size, "|")
		if len(parts) == 4 {
			diskSizeInfo := DiskSizeInfo{
				DiskType: parts[0],
				MinSize:  parts[1],
				MaxSize:  parts[2],
				Capacity: parts[3],
			}
			diskSizes = append(diskSizes, diskSizeInfo)
		}
	}
	return diskSizes
}
