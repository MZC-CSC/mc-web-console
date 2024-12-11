package actions

import (
	"github.com/labstack/echo/v4"
	"github.com/m-cmp/mc-web-console/common"
	"github.com/m-cmp/mc-web-console/handler"
)

func GetPlatformRoles(c echo.Context) error {
	platformRoles, err := handler.GetPlatformRoleList()
	if err != nil {
		commonResponse := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonResponse := common.CommonResponseStatusOK(platformRoles)

	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func GetIamPlatformRoles(c echo.Context) error {
	platformRoles, err := handler.GetPlatformRoleList()
	if err != nil {
		commonResponse := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonResponse := common.CommonResponseStatusOK(platformRoles)

	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func GetWorkspaceRoles(c echo.Context) error {
	workspaceRoles, err := handler.GetWorkspaceRoleList()
	if err != nil {
		commonResponse := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonResponse := common.CommonResponseStatusOK(workspaceRoles)

	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func GetIamWorkspaceRoles(c echo.Context) error {
	workspaceRoles, err := handler.GetWorkspaceRoleList()
	if err != nil {
		commonResponse := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonResponse := common.CommonResponseStatusOK(workspaceRoles)

	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}
