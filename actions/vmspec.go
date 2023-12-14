package actions

import (
	"log"
	frameworkmodel "mc_web_console/frameworkmodel"
	"mc_web_console/frameworkmodel/tumblebug/common"

	tbmcir "mc_web_console/frameworkmodel/tumblebug/mcir"
	tbmcis "mc_web_console/frameworkmodel/tumblebug/mcis"
	"mc_web_console/handler"
	"mc_web_console/models"
	"mc_web_console/models/views"
	"net/http"
	"strings"

	"github.com/gobuffalo/buffalo"
	"github.com/gofrs/uuid"
)

// @Summary 	VmSpecMngForm 폼 이동
// @Description VmSpecMngForm 렌더링
// @Tags		vmspec
// @Produce		html
// @Success		200	{html}	html	"settings/vmspec/mngform.html"
// @Router      /settings/resources/vmspec/mngform/[get]
func (a actions) VmSpecMngForm(c buffalo.Context) error {
	return c.Render(http.StatusOK, r.HTML("settings/vmspec/mngform.html"))
}

// Get "/lookupvmspecs"
//
//	@Summary		VmSpecLookupList 리스트 조회
//	@Description	[VmSpecLookupList]  VmSpecLookup 리스트를 조회합니다.
//	@Tags			vmspec
//	@Accept			json
//	@Produce		json
//	@Param			providerId	query		string	true	"providerId"
//	@Param			regionName	query		string	true	"regionName"
//	@Success		200			{json}	{'message': 'success', 'status': '200', 'ConnectionConfig': cloudConnections}
//	@Router			/api/settings/resources/vmspec/lookupvmspecs/ [get]
func (a actions) VmSpecLookupList(c buffalo.Context) error {
	connectionName := &common.TbConnectionName{}

	paramProviderId := c.Params().Get("providerId")
	paramRegionName := c.Params().Get("regionName")
	log.Println("************provider ID : ", paramProviderId)
	log.Println("************regionName : ", paramRegionName)
	paramViewConnection := views.ViewCloudConnection{}
	paramViewConnection.ProviderID = paramProviderId
	paramViewConnection.RegionName = paramRegionName
	viewConnection, err := handler.GetAvailableConnection(paramViewConnection, c)
	if err != nil {
		return c.Render(500, r.JSON(map[string]interface{}{
			"error":  "there is no available connection",
			"status": "500",
		}))
	}
	connectionName.ConnectionName = viewConnection.ConnectionName
	cspVmSpecInfoList, respStatus := handler.LookupVmSpecInfoList(connectionName)
	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		}))
	}
	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":       "success",
		"status":        respStatus.StatusCode,
		"CspVmSpecList": cspVmSpecInfoList,
	}))
}

// VmspecList default implementation.
//
//	@Summary		VmSpecList 리스트 조회
//	@Description	[VmSpecList]  VmSpecList 리스트를 조회합니다.
//	@Tags			vmspec
//	@Accept			json
//	@Produce		json
//	@Param			option	query		string	true	"option"
//	@Param			filterKey	query		string	true	"filterKey"
//	@Param			filterVal	query		string	true	"filterVal"
//	@Success		200			{json}	{'message': 'success', 'status': '200', 'ConnectionConfig': cloudConnections}
//	@Router			/api/settings/resources/vmspec/ [get]
func (a actions) VmSpecList(c buffalo.Context) error {
	log.Println("GetVmSpecList : ")
	namespaceID := c.Session().Get("current_namespace_id").(string)
	// TODO : defaultNameSpaceID 가 없으면 설정화면으로 보낼 것
	log.Println("namespaceID at vmspecList : ", namespaceID)
	optionParam := c.Params().Get("option")
	filterKeyParam := c.Params().Get("filterKey")
	filterValParam := c.Params().Get("filterVal")

	paramConnectionName := c.Params().Get("connectionName")

	if optionParam == "id" {
		vmSpecInfoList, respStatus := handler.GetVmSpecInfoListByID(namespaceID, filterKeyParam, filterValParam)
		if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
			return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
				"error":  respStatus.Message,
				"status": respStatus.StatusCode,
			}))
		}

		return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
			"message":            "success",
			"status":             respStatus.StatusCode,
			"DefaultNameSpaceID": namespaceID,
			"VmSpecList":         vmSpecInfoList,
		}))
	} else {
		log.Println("option 값이 없어서 여기로 간다.")

		if !strings.EqualFold(paramConnectionName, "") && strings.EqualFold(filterKeyParam, "") {
			filterKeyParam = "connectionName"
			filterValParam = paramConnectionName
		}

		vmSpecInfoList, respStatus := handler.GetVmSpecInfoListByOption(namespaceID, optionParam, filterKeyParam, filterValParam)
		log.Println(vmSpecInfoList)
		if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
			return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
				"error":  respStatus.Message,
				"status": respStatus.StatusCode,
			}))
		}

		return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
			"message":            "success",
			"status":             respStatus.StatusCode,
			"DefaultNameSpaceID": namespaceID,
			"VmSpecList":         vmSpecInfoList,
		}))
	}
}

// @Summary		VmSpecGet 단건 조회
// @Description	[VmSpecGet] VmSpecGet 단건 조회합니다.
// @Tags			vmspec
// @Accept			json
// @Produce		json
// @Param			vmSpecId	path		string	true	"vmSpecId"
// @Success		200			{json}	{'message': 'success', 'status': 'respStatus.StatusCode', 'DefaultNameSpaceID': 'namespaceID',  'VmSpec': vmSpecInfo}
// @Router			/api/settings/resources/vmspec/id/{vmSpecId}/ [GET]
func (a actions) VmSpecGet(c buffalo.Context) error {
	namespaceID := c.Session().Get("current_namespace_id").(string)

	paramVmSpecId := c.Param("vmSpecId")
	vmSpecInfo, respStatus := handler.GetVmSpecInfoData(namespaceID, paramVmSpecId)

	paramViewConnection := views.ViewCloudConnection{}
	paramViewConnection.ConnectionName = vmSpecInfo.ConnectionName
	viewConnection, err := handler.GetViewConnection(paramViewConnection)
	if err != nil {
		// cb에서 정보는 가져왔으니 오류로 뱉지는 않기.
	} else {
		vmSpecInfo.ProviderID = viewConnection.ProviderID
		vmSpecInfo.ProviderName = viewConnection.ProviderID
		vmSpecInfo.RegionName = viewConnection.RegionName
	}
	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":            "success",
		"status":             respStatus.StatusCode,
		"DefaultNameSpaceID": namespaceID,
		"VmSpec":             vmSpecInfo,
	}))
}

// @Summary		VmSpecReg 등록
// @Description	[VmImageReg] VmSpecReg 등록
// @Tags			vmspec
// @Accept			json
// @Produce			json
// @Param			specregisteringMethod			query		string	true	"specregisteringMethod"
// @Success		200			{json}		{'message':'success','status':'respStatus','VMSpec':'resultVmSpecInfo'}
// @Failure		500			{json}		{'error': 'fail','status': 'fail',}
// @Router			/api/settings/resources/vmspec/ [post]
func (a actions) VmSpecReg(c buffalo.Context) error {
	namespaceID := c.Session().Get("current_namespace_id").(string)
	namespaceName := c.Session().Get("current_namespace").(string)

	vmSpecReq := &tbmcir.TbSpecReq{}
	vmSpecRegInfo := new(tbmcir.TbSpecInfo)
	resultVmSpecInfo := new(tbmcir.TbSpecInfo)

	paramVMSpecregisteringMethod := c.Param("specregisteringMethod")

	respStatus := frameworkmodel.WebStatus{}
	paramViewConnection := views.ViewCloudConnection{}

	if strings.EqualFold(paramVMSpecregisteringMethod, "registerWithInfo") {
		if err := c.Bind(vmSpecRegInfo); err != nil {
			log.Println(err)
			return c.Render(http.StatusBadRequest, r.JSON(err))
		}
		paramViewConnection.ProviderID = vmSpecRegInfo.ProviderName
		paramViewConnection.RegionName = vmSpecRegInfo.RegionName

	} else {
		if err := c.Bind(vmSpecReq); err != nil {
			log.Println(err)
			return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
				"error":  "fail",
				"status": "fail",
			}))
		}
		paramViewConnection.ProviderID = vmSpecReq.ProviderID
		paramViewConnection.RegionName = vmSpecReq.RegionName
		paramViewConnection.ZoneName = vmSpecReq.ZoneName
	}

	viewConnection, err := handler.GetAvailableConnection(paramViewConnection, c)

	log.Println("*************vmspeceq : ", vmSpecReq, "|*************namespaceID : ", namespaceID, "|**********viewconnection :", viewConnection, "|*************error : ", err)
	if err != nil {
		return c.Render(500, r.JSON(map[string]interface{}{
			"error":  "there is no available connection",
			"status": "500",
		}))
	}

	if strings.EqualFold(paramVMSpecregisteringMethod, "registerWithInfo") {
		vmSpecRegInfo.ConnectionName = viewConnection.ConnectionName
		resultVmSpecInfo, respStatus = handler.RegVmSpecWithInfo(namespaceID, paramVMSpecregisteringMethod, vmSpecRegInfo)
	} else {
		vmSpecReq.ConnectionName = viewConnection.ConnectionName
		resultVmSpecInfo, respStatus = handler.RegVmSpec(namespaceID, paramVMSpecregisteringMethod, vmSpecReq)
	}

	connectionMapping := &models.CloudConnectionMapping{}
	connectionMapping.Status = "C"
	connectionMapping.ResourceType = "vmspec"
	connectionMapping.ResourceID = resultVmSpecInfo.ID
	connectionMapping.ResourceName = resultVmSpecInfo.Name
	connectionMapping.CloudConnectionID = viewConnection.ID
	connectionMapping.CredentialID = viewConnection.CredentialID
	connectionMapping.NamespaceID = namespaceID
	connectionMapping.NamespaceName = namespaceName
	err = handler.SaveConnectionMapping(connectionMapping, c)
	if err != nil {
		// 실패시 생성한 vpc Resource 제거
		_, respStatus := handler.DelVMSpec(namespaceID, vmSpecReq.Name)
		if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
			return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
				"error":  respStatus.Message,
				"status": respStatus.StatusCode,
			}))
		}
		return c.Render(500, r.JSON(map[string]interface{}{
			"error":  err.Error(),
			"status": "500",
		}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message": "success",
		"status":  respStatus.StatusCode,
		"VMSpec":  resultVmSpecInfo,
	}))
}

// @Summary		VmSpecDel 삭제
// @Description	[VmSpecDel] VmSpec 삭제합니다.
// @Tags			vmspec
// @Accept			json
// @Produce		json
// @Param			vmSpecId	query		string	true	"vmSpecId"
// @Success		200		{string} 		string    	 'success'
// @Failure		500			{json}		{'error': 'respStatus.Message','status': 'respStatus.StatusCode',}
// @Router			/api/settings/resources/vmspec/id/{vmSpecId}/ [delete]
func (a actions) VmSpecDel(c buffalo.Context) error {
	namespaceID := c.Session().Get("current_namespace_id").(string)
	namespaceName := c.Session().Get("current_namespace").(string)

	paramVmSpecId := c.Param("vmSpecId")
	log.Println("***********paramVMSpecID : ")
	log.Println(paramVmSpecId)
	respMessage, respStatus := handler.DelVMSpec(namespaceID, paramVmSpecId)

	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		}))
	}

	connectionMapping := &models.CloudConnectionMapping{}
	connectionMapping.NamespaceID = namespaceID
	connectionMapping.NamespaceName = namespaceName
	connectionMapping.ResourceType = "vmspec"
	connectionMapping.ResourceID = paramVmSpecId

	usedConnectionMapping, err := handler.GetUsedConnection(connectionMapping)

	if err != nil {
		// TODO : mapping table에 없을 때, 에러로 처리할 것인가?
		// return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
		// 	"error":  respStatus.Message,
		// 	"status": respStatus.StatusCode,
		// }))
	} else {
		// 삭제 Row 추가
		usedConnectionMapping.ID = uuid.UUID{}
		usedConnectionMapping.Status = "D"

		err = handler.SaveConnectionMapping(usedConnectionMapping, c)

		if err != nil {
			return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
				"error":  respStatus.Message,
				"status": respStatus.StatusCode,
			}))
		}
	}
	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message": respMessage.Message,
		"status":  respMessage.StatusCode,
	}))
}

// @Summary		FetchVmSpecList 리스트 조회
// @Description	[FetchVmSpecList] FetchVmSpec 리스트 조회합니다
// @Tags			vmspec
// @Accept			json
// @Produce			json
// @Success			200		{string} 		string    	 'message':'success,'status':  'http.StatusOK'
// @Router			/api/settings/resources/vmspec/fetchvmspec/ [put]
func (a actions) FetchVmSpecList(c buffalo.Context) error {
	log.Println("FetchVMSpecList : ")

	namespaceID := c.Session().Get("current_namespace_id").(string)

	// vmSpecInfoList, respStatus := service.FetchVmSpecInfoList(defaultNameSpaceID)
	go handler.FetchVmSpecInfoListByAsync(namespaceID, c)
	// if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
	// 	return c.JSON(respStatus.StatusCode, map[string]interface{}{
	// 		"error":  respStatus.Message,
	// 		"status": respStatus.StatusCode,
	// 	})
	// }

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message": "success",
		"status":  http.StatusOK,
	}))
}

// @Summary		 FilterVmSpecList 목록조회
// @Description	[FilterVmSpecList]  FilterVmSpec 리스트를 조회합니다.
// @Tags			vmspec
// @Accept			json
// @Produce			json
// @Success		200		{json}		{'message':'success','status':respStatus,'VmSpecList': vmSpecInfoList,}
// @Failure		500		{json}		{'error': respStatus.Message,'status':respStatus.StatusCode}
// @Router			/api/settings/resources/vmspec/filterspecsbyrange/ [POST]
func (a actions) FilterVmSpecList(c buffalo.Context) error {
	log.Println("FilterVmspecList : ")

	namespaceID := c.Session().Get("current_namespace_id").(string)

	vmSpecRange := &tbmcir.FilterSpecsByRangeRequest{}
	if err := c.Bind(vmSpecRange); err != nil {
		log.Println(err)
		return c.Render(http.StatusBadRequest, r.JSON(err))
	}

	vmSpecInfoList, respStatus := handler.FilterVmSpecInfoListByRange(namespaceID, vmSpecRange)
	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":    "success",
		"status":     respStatus.StatusCode,
		"VmSpecList": vmSpecInfoList,
	}))
}

// 추천 VMSpec 목록 조회
//
//	@Summary		 RecommendVmSpecList 목록 조회
//	@Description	[RecommendVmSpecList] VMSpecn 리스트를 조회합니다.
//	@Tags			connection
//	@Accept			json
//	@Produce		json
//	@Success		200		{json}		{'message':'success','status':respStatus,'VmSpecList': VmSpecList,}
//	@Failure		500		{json}		{'message': fail,'status':fail}
//	@Router			/api/settings/resources/vmspec/recommendvmspec/[post]
func (a actions) RecommendVmSpecList(c buffalo.Context) error {
	mcisDeploymentPlan := &tbmcis.DeploymentPlan{}
	if err := c.Bind(mcisDeploymentPlan); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"message": "fail",
			"status":  "fail",
		}))
	}
	vmSpecList, _ := handler.GetRecommendVmSpecList(mcisDeploymentPlan)

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":    "success",
		"status":     200,
		"VmSpecList": vmSpecList,
	}))
}
