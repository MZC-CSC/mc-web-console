package actions

import (
	"github.com/labstack/echo/v4"
	"github.com/m-cmp/mc-web-console/common"
	"github.com/m-cmp/mc-web-console/handler"
)

func GetmenuTree(c echo.Context) error {
	commonResponse := common.CommonResponseStatusOK(handler.CmigMenuTree.Menus)
	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func GetMCIAMmenuTree(c echo.Context) error {
	menulist, err := handler.GetAllMCIAMAvailableMenus(c)
	if err != nil {
		commonResponse := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}
	menuTree, err := handler.GetMenuTree(*menulist)
	if err != nil {
		commonResponse := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonResponse := common.CommonResponseStatusOK(menuTree)

	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func CreateMCIAMMenuResources(c echo.Context) error {
	err := handler.CreateMCIAMMenusByLocalMenuYaml(c)
	if err != nil {
		commonResponse := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonResponse := common.CommonResponseStatusOK("success")
	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}
