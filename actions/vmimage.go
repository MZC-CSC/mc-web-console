package actions

import (
	"log"
	frameworkmodel "mc_web_console/frameworkmodel"
	"mc_web_console/frameworkmodel/tumblebug/mcir"
	"mc_web_console/handler"
	"mc_web_console/models"
	"mc_web_console/models/views"
	"net/http"
	"strings"

	"github.com/gobuffalo/buffalo"
	"github.com/gofrs/uuid"
)

// @Summary		vmimage 설정 폼 렌더링
// @Description	[ConnectionMngForm] vmimage은 mngform.html 설정 폼을 렌더링합니다.
// @Tags			vmImage
// @Produce			html
// @Success			200	{html}	html	"settings/vmimage/mngform.html"
// @Router			/settings/resources/vmimage/mngform/ [get]
func (a actions) VmImageMngForm(c buffalo.Context) error {
	return c.Render(http.StatusOK, r.HTML("settings/vmimage/mngform.html"))
}

// VmimageList default implementation.

// @Summary		vmimgae 리스트 조회
// @Description VmImageList  VmImageList을 조회합니다.
// @Tags			vmImage
// @Produce			json
// @Accept			json
// @Param			namespaceID	query		string	true	"current_namespace_id"
// @Param			optionParam	query		string	true	"option"
// @Param			filterKeyParam	query		string	true	"filterKey"
// @Param			filterValParam	query		string	true	"filterVal"
// @Param			paramConnectionName	query		string	true	"connectionName"
// @Success			200	{json}	{'message': 'success', 'status': '200', 'DefaultNameSpaceID': namespaceID, 'VirtualMachineImageList': virtualMachineImageInfoList}
// @Router			/api/settings/resources/vmimage/
func (a actions) VmImageList(c buffalo.Context) error {
	log.Println("GetVirtualMachineImageList : ")
	namespaceID := c.Session().Get("current_namespace_id").(string)

	optionParam := c.Params().Get("option")
	filterKeyParam := c.Params().Get("filterKey")
	filterValParam := c.Params().Get("filterVal")

	paramConnectionName := c.Params().Get("connectionName")
	//paramConnectionMap := map[string]string{} // 특정 connection 을 가져오기 위해 사용.
	if !strings.EqualFold(paramConnectionName, "") {
		//paramConnectionMap["connectionName"] = paramConnectionName
		filterKeyParam = "connectionName"
		filterValParam = paramConnectionName
	}

	if optionParam == "id" {
		virtualMachineImageInfoList, respStatus := handler.GetVirtualMachineImageInfoListByID(namespaceID, filterKeyParam, filterValParam)
		if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
			return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
				"error":  respStatus.Message,
				"status": respStatus.StatusCode,
			}))
		}

		return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
			"message":                 "success",
			"status":                  respStatus.StatusCode,
			"DefaultNameSpaceID":      namespaceID,
			"VirtualMachineImageList": virtualMachineImageInfoList,
		}))
	} else {
		if !strings.EqualFold(paramConnectionName, "") && strings.EqualFold(filterKeyParam, "") {
			filterKeyParam = "connectionName"
			filterValParam = paramConnectionName
		}

		virtualMachineImageInfoList, respStatus := handler.GetVirtualMachineImageInfoListByOption(namespaceID, optionParam, filterKeyParam, filterValParam)
		if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
			return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
				"error":  respStatus.Message,
				"status": respStatus.StatusCode,
			}))
		}

		return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
			"message":                 "success",
			"status":                  respStatus.StatusCode,
			"DefaultNameSpaceID":      namespaceID,
			"VirtualMachineImageList": virtualMachineImageInfoList,
		}))
	}
}

// @Summary		VmImageGet 단건 조회
// @Description	[VmImageGet] VmImageGet 단건 조회합니다.
// @Tags			vmImage
// @Accept			json
// @Produce			json
// @Param			vmImageId	path		string	true	"vmImageId"
//
//	@Success		200			{json}	{'message': 'success', 'status': '200', 'VirtualMachineImageInfo': VirtualMachineImageInfo}
//
// @Router		/api/settings/resources/vmimage/id/{vmImageId}/ [GET]
func (a actions) VmImageGet(c buffalo.Context) error {
	namespaceID := c.Session().Get("current_namespace_id").(string)

	paramVirtualMachineImage := c.Param("vmImageId")
	virtualMachineImageInfo, respStatus := handler.GetVirtualMachineImageData(namespaceID, paramVirtualMachineImage)

	paramViewConnection := views.ViewCloudConnection{}
	paramViewConnection.ConnectionName = virtualMachineImageInfo.ConnectionName
	viewConnection, err := handler.GetViewConnection(paramViewConnection)
	if err != nil {
		// cb에서 정보는 가져왔으니 오류로 뱉지는 않기.
	} else {
		virtualMachineImageInfo.ProviderID = viewConnection.ProviderID
		virtualMachineImageInfo.RegionName = viewConnection.RegionName
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":                 "success",
		"status":                  respStatus,
		"VirtualMachineImageInfo": virtualMachineImageInfo,
	}))
}

// @Summary		VmImageReg 등록
// @Description	[VmImageReg] VmImageReg 등록
// @Tags			vmImage
// @Accept			json
// @Produce			json
// @Param			registeringMethod			query		string	true	"registeringMethod"
// @Success		200			{json}		{'message':'success','status':'respStatus','SshKeyInfo':'resultSshKeyInfo'}
// @Failure		500			{json}		{'error': 'fail','status': 'fail',}
// @Router			/api/settings/resources/vmimage/ [post]
func (a actions) VmImageReg(c buffalo.Context) error {
	namespaceID := c.Session().Get("current_namespace_id").(string)
	namespaceName := c.Session().Get("current_namespace").(string)

	respStatus := frameworkmodel.WebStatus{}

	resultVirtualMachineImageInfo := new(mcir.TbImageInfo)

	virtualMachineImageRegInfo := new(mcir.TbImageInfo)
	virtualMachineImageReqInfo := new(mcir.TbImageReq)

	paramViewConnection := views.ViewCloudConnection{}

	paramVirtualMachineImageRegistType := c.Param("registeringMethod")

	if strings.EqualFold(paramVirtualMachineImageRegistType, "registerWithInfo") {
		if err := c.Bind(virtualMachineImageRegInfo); err != nil {
			log.Println(err)
			return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
				"error":  "fail",
				"status": "fail",
			}))
		}
		paramViewConnection.ProviderID = virtualMachineImageRegInfo.ProviderID
		paramViewConnection.RegionName = virtualMachineImageRegInfo.RegionName
		paramViewConnection.ZoneName = virtualMachineImageRegInfo.ZoneName

	} else {
		if err := c.Bind(virtualMachineImageReqInfo); err != nil {
			log.Println(err)
			return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
				"error":  "fail",
				"status": "fail",
			}))
		}
		paramViewConnection.ProviderID = virtualMachineImageReqInfo.ProviderID
		paramViewConnection.RegionName = virtualMachineImageReqInfo.RegionName
		paramViewConnection.ZoneName = virtualMachineImageReqInfo.ZoneName

	}

	viewConnection, err := handler.GetAvailableConnection(paramViewConnection, c)

	log.Println("*************vmimagereq : ", virtualMachineImageReqInfo, "|*************namespaceID : ", namespaceID, "|**********viewconnection :", viewConnection, "|*************error : ", err)
	if err != nil {
		return c.Render(500, r.JSON(map[string]interface{}{
			"error":  "there is no available connection",
			"status": "500",
		}))
	}

	if strings.EqualFold(paramVirtualMachineImageRegistType, "registerWithInfo") {
		virtualMachineImageRegInfo.ConnectionName = viewConnection.ConnectionName
		resultVirtualMachineImageInfo, respStatus = handler.RegVirtualMachineImageWithInfo(namespaceID, paramVirtualMachineImageRegistType, virtualMachineImageRegInfo)
	} else {
		virtualMachineImageReqInfo.ConnectionName = viewConnection.ConnectionName
		resultVirtualMachineImageInfo, respStatus = handler.RegVirtualMachineImage(namespaceID, paramVirtualMachineImageRegistType, virtualMachineImageReqInfo)
	}

	connectionMapping := &models.CloudConnectionMapping{}
	connectionMapping.Status = "C"
	connectionMapping.ResourceType = "vmimage"
	connectionMapping.ResourceID = resultVirtualMachineImageInfo.ID
	connectionMapping.ResourceName = resultVirtualMachineImageInfo.Name
	connectionMapping.CloudConnectionID = viewConnection.ID
	connectionMapping.CredentialID = viewConnection.CredentialID
	connectionMapping.NamespaceID = namespaceID
	connectionMapping.NamespaceName = namespaceName
	err = handler.SaveConnectionMapping(connectionMapping, c)
	if err != nil {
		// 실패시 생성한 vpc Resource 제거
		_, respStatus := handler.DelVirtualMachineImage(namespaceID, resultVirtualMachineImageInfo.ID)
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
		"message":                 "success",
		"status":                  respStatus,
		"VirtualMachineImageInfo": resultVirtualMachineImageInfo,
	}))
}

// @Summary		  VmImageDel 삭제
// @Description	 [VmImageDel] VmImage을을 삭제합니다.
// @Tags		  vmImage
// @Accept			json
// @Produce			json
// @Param			vmImageId	query	string	true	"models.Region"
// @Success		200			{string}	string    'success'
// @Router		/api/settings/resources/vmimage/id/{vmImageId}/                             [delete]
func (a actions) VmImageDel(c buffalo.Context) error {
	namespaceID := c.Session().Get("current_namespace_id").(string)
	namespaceName := c.Session().Get("current_namespace").(string)

	paramVmImageId := c.Param("vmImageId")
	log.Println("***********paramVirtualMachineImage : ")
	log.Println(paramVmImageId)

	respMessage, respStatus := handler.DelVirtualMachineImage(namespaceID, paramVmImageId)

	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		}))
	}

	connectionMapping := &models.CloudConnectionMapping{}
	connectionMapping.NamespaceID = namespaceID
	connectionMapping.NamespaceName = namespaceName
	connectionMapping.ResourceType = "vmimage"
	connectionMapping.ResourceID = paramVmImageId

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

// @Summary		LookupCspVirtualMachineImageList 리스트 조회
// @Description	[LookupCspVirtualMachineImageList] LookupCspVirtualMachineImageList 리스트를 조회합니다.
// @Tags			vmImage
// @Accept			json
// @Produce			json
// @Param			providerId	query		string	true	"providerId"
// @Param			regionName	query		string	true	"regionName"
// @Success		200			{json}	{'message': 'success', 'status': '200'}
// @Router			/api/settings/resources/vmimage/lookupimages/ [GET]
func (a actions) LookupCspVirtualMachineImageList(c buffalo.Context) error {

	// paramConnectionName := c.Param("connectionName")

	paramProviderId := c.Params().Get("providerId")
	paramRegionName := c.Params().Get("regionName")
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
	connectionName := viewConnection.ConnectionName
	virtualMachineImageInfoList, respStatus := handler.LookupVirtualMachineImageList(connectionName)

	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":                 "success",
		"status":                  respStatus.StatusCode,
		"VirtualMachineImageList": virtualMachineImageInfoList,
	}))
}

// lookupImage 상세정보
//
//	@Summary		LookupVirtualMachineImageData 단건 조회
//	@Description	[LookupVirtualMachineImageData] connection 단건 조회합니다.
//	@Tags			vmImage
//	@Accept			json
//	@Produce		json
//	@Param			providerId	query		string	true	"providerId"
//	@Param			regionName	query		string	true	"regionName"
//	@Success		200			{object}
//	@Router			/api/settings/resources/vmimage/searchimage/[POST]
func (a actions) LookupVirtualMachineImageData(c buffalo.Context) error {
	log.Println("LookupVirtualMachineImageData : ")

	restLookupImageRequest := new(mcir.RestLookupImageRequest)

	paramProviderId := c.Params().Get("providerId")
	paramRegionName := c.Params().Get("regionName")
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
	restLookupImageRequest.ConnectionName = viewConnection.ConnectionName
	if err := c.Bind(restLookupImageRequest); err != nil {
		log.Println(err)
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"error":  "fail",
			"status": "fail",
		}))
	}
	// paramVirtualMachineImage := c.Param("imageID")
	// virtualMachineImageInfo, respStatus := service.LookupVirtualMachineImageData(paramVirtualMachineImage)
	virtualMachineImageInfo, respStatus := handler.LookupVirtualMachineImageData(restLookupImageRequest)

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":                 "success",
		"status":                  respStatus.StatusCode,
		"VirtualMachineImageList": virtualMachineImageInfo,
	}))
}

// lookupImage 상세정보
// @Summary		SearchVirtualMachineImageList 리스트 조회
// @Description	[SearchVirtualMachineImageList] SearchVirtualMachineImageList 리스트를 조회합니다.
// @Tags			vmImage
// @Accept			json
// @Produce			json
// @Success		200			{json}	{'message': 'success', 'status': '200'}
// @Router			/api/settings/resources/vmimage/searchimage/ [POST]
func (a actions) SearchVirtualMachineImageList(c buffalo.Context) error {
	namespaceID := c.Session().Get("current_namespace_id").(string)

	restSearchImageRequest := new(mcir.RestSearchImageRequest)
	if err := c.Bind(restSearchImageRequest); err != nil {
		log.Println(err)
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"error":  "fail",
			"status": "fail",
		}))
	}
	virtualMachineImageInfoList, respStatus := handler.SearchVirtualMachineImageList(namespaceID, restSearchImageRequest)

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":                 "success",
		"status":                  respStatus.StatusCode,
		"VirtualMachineImageList": virtualMachineImageInfoList,
	}))
}

// TODO : Fetch 의 의미 파악
// @Summary		SearchVirtualMachineImageList 리스트 조회
// @Description	[SearchVirtualMachineImageList] SearchVirtualMachineImageList 리스트를 조회합니다.
// @Tags			vmImage
// @Accept			json
// @Produce			json
// @Success		200			{json}	{'message': 'success', 'status': '  respStatus.StatusCode”VirtualMachineImageList': 'virtualMachineImageInfoList'}
//
//	@Failure		500		{json}		{'error': respStatus.Message,'status':respStatus.StatusCode}
//
// @Router			/api/settings/resources/vmimage/searchimage/ [POST]
func (a actions) FetchVirtualMachineImageList(c buffalo.Context) error {
	log.Println("FetchVirtualMachineImageList : ")

	namespaceID := c.Session().Get("current_namespace_id").(string)

	virtualMachineImageInfoList, respStatus := handler.FetchVirtualMachineImageList(namespaceID)
	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":                 "success",
		"status":                  respStatus.StatusCode,
		"VirtualMachineImageList": virtualMachineImageInfoList,
	}))
}
