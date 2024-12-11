package actions

import (
	"github.com/labstack/echo/v4"
	"github.com/m-cmp/mc-web-console/common"
	"github.com/m-cmp/mc-web-console/handler"
)

func GetWorkspaceUserRoleMappingByToken(c echo.Context) error {
	commonRequest := &common.CommonRequest{
		PathParams: map[string]string{
			"userId": c.Get("UserId").(string),
		},
	}
	commonResponse, _ := common.SubsystemAnyCaller(c, "mc-iam-manager", "Getworkspaceuserrolemappinglistbyuserid", commonRequest, true)
	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func GetWPmappingListByWorkspaceId(c echo.Context) error {
	res, err := handler.GetWPmappingList(c)
	if err != nil {
		commonRes := common.CommonResponseStatusBadRequest(nil)
		return c.JSON(commonRes.Status.StatusCode, commonRes)
	}
	commonRes := common.CommonResponseStatusOK(res)
	return c.JSON(commonRes.Status.StatusCode, commonRes)
}

func GetWorkspaceUserRoleMappingListByUserId(c echo.Context) error {
	res, err := handler.GetWorkspaceUserRoleMappingList(c)
	if err != nil {
		commonRes := common.CommonResponseStatusBadRequest(nil)
		return c.JSON(commonRes.Status.StatusCode, commonRes)
	}
	commonRes := common.CommonResponseStatusOK(res)
	return c.JSON(commonRes.Status.StatusCode, commonRes)
}

func CreateProject(c echo.Context) error {
	commonRequest := &common.CommonRequest{}
	err := c.Bind(commonRequest)
	if err != nil {
		commonRes := common.CommonResponseStatusBadRequest(nil)
		return c.JSON(commonRes.Status.StatusCode, commonRes)
	}
	project, err := handler.PostNs(c, commonRequest)
	if err != nil {
		commonRes := common.CommonResponseStatusBadRequest(nil)
		return c.JSON(commonRes.Status.StatusCode, commonRes)
	}
	commonRes := common.CommonResponseStatusOK(project)
	return c.JSON(commonRes.Status.StatusCode, commonRes)
}

func GetProjectById(c echo.Context) error {
	commonRequest := &common.CommonRequest{}
	err := c.Bind(commonRequest)
	if err != nil {
		commonRes := common.CommonResponseStatusBadRequest(nil)
		return c.JSON(commonRes.Status.StatusCode, commonRes)
	}
	project, err := handler.GetNs(c, commonRequest)
	if err != nil {
		commonRes := common.CommonResponseStatusBadRequest(nil)
		return c.JSON(commonRes.Status.StatusCode, commonRes)
	}
	commonRes := common.CommonResponseStatusOK(project)
	return c.JSON(commonRes.Status.StatusCode, commonRes)
}

func GetProjectList(c echo.Context) error {
	projects, err := handler.GetAllNs(c)
	if err != nil {
		commonRes := common.CommonResponseStatusBadRequest(nil)
		return c.JSON(commonRes.Status.StatusCode, commonRes)
	}
	commonRes := common.CommonResponseStatusOK(projects)
	return c.JSON(commonRes.Status.StatusCode, commonRes)
}

func UpdateProjectById(c echo.Context) error {
	commonRequest := &common.CommonRequest{}
	err := c.Bind(commonRequest)
	if err != nil {
		commonRes := common.CommonResponseStatusBadRequest(nil)
		return c.JSON(commonRes.Status.StatusCode, commonRes)
	}
	project, err := handler.PutNs(c, commonRequest)
	if err != nil {
		commonRes := common.CommonResponseStatusBadRequest(nil)
		return c.JSON(commonRes.Status.StatusCode, commonRes)
	}
	commonRes := common.CommonResponseStatusOK(project)
	return c.JSON(commonRes.Status.StatusCode, commonRes)
}

func DeleteProjectById(c echo.Context) error {
	commonRequest := &common.CommonRequest{}
	err := c.Bind(commonRequest)
	if err != nil {
		commonRes := common.CommonResponseStatusBadRequest(nil)
		return c.JSON(commonRes.Status.StatusCode, commonRes)
	}
	err = handler.DelNs(c, commonRequest)
	if err != nil {
		commonRes := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonRes.Status.StatusCode, commonRes)
	}
	commonRes := common.CommonResponseStatusOK(nil)
	return c.JSON(commonRes.Status.StatusCode, commonRes)
}
