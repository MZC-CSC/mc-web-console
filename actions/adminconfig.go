package actions

import (
	"log"
	"mc_web_console/handler"
	"mc_web_console/models"
	"net/http"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/pop/v6"
	"github.com/gofrs/uuid"
	"github.com/pkg/errors"
)

// TODO : db를 handling하는 부분은 handler로 옮길 것.

// @Summary		관리자 설정 폼 렌더링 : not implement -- 아직 기획된바 없음.
// @Description	[AdminMngForm] Admin 관리자 설정 폼을 렌더링합니다. : not implement -- 아직 기획된바 없음.
// @Tags			adminconfig
// @Produce		html
// @Success		200	{html}	html	"adminconfig/regiongroup/mngform.html"
// @Router			/adminconfig/config/mngform/ [get]
func (a actions) AdminMngForm(c buffalo.Context) error {
	return c.Render(http.StatusOK, r.HTML("adminconfig/regiongroup/mngform.html"))
}

// @Summary		Menu 설정 폼 렌더링
// @Description	[MenuMngForm] Menu 설정 폼을 렌더링합니다.
// @Tags			adminconfig
// @Produce		html
// @Success		200	{html}	html	"adminconfig/menumng/mngform.html"
// @Router			/adminconfig/menu/mngform/ [get]
func (a actions) MenuMngForm(c buffalo.Context) error {
	log.Println("in MenumngForm")
	return c.Render(http.StatusOK, r.HTML("adminconfig/menumng/mngform.html"))
}

// @Summary		Category 설정 폼 렌더링
// @Description	[CategoryMngForm] Category 설정 폼을 렌더링합니다.
// @Tags			adminconfig
// @Produce		html
// @Success		200	{html}	html	"adminconfig/categorymng/mngform.html"
// @Router			/adminconfig/category/mngform/ [get]
func (a actions) CategoryMngForm(c buffalo.Context) error {
	log.Println("in CategorymngForm")
	return c.Render(http.StatusOK, r.HTML("adminconfig/categorymng/mngform.html"))
}

// @Summary		RegionGroup 리스트 조회
// @Description	[RegionGroupList] provider 와 regionGroupName 을 받아 RegionGroupList를 반환합니다.
// @Tags			adminconfig
// @Produce		json
// @Param			provider		query		string	true	"provider"
// @Param			regionGroupName	query		string	true	"regionGroupName"
// @Success		200				{string}	string	"{"message":"success","status":respStatus.StatusCode,"regionGroupList":regionGroupList,}"
// @Failure		400				{string}	string	"{'error':'respStatus.Message','status':'respStatus.StatusCode'}"
// @Router			/api/adminconfig/regiongroup/ [get]
func (a actions) RegionGroupList(c buffalo.Context) error {

	providerId := c.Params().Get("provider")             //id
	regionGroupName := c.Params().Get("regionGroupName") //name

	paramRegionGroup := models.RegionGroup{}
	paramRegionGroup.ProviderID = providerId
	paramRegionGroup.RegionGroupName = regionGroupName

	regionGroupList, respStatus := handler.RegionGroupList(paramRegionGroup)
	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":         "success",
		"status":          respStatus.StatusCode,
		"regionGroupList": regionGroupList,
	}))
}

// @Summary		RegionGroup 단건 regionGroup 조회
// @Description	[GetRegionGroup] regionGroupId와  provider, regionGroupName, regionId 중 한개를 받아 regionGroup을 반환합니다.
// @Tags			adminconfig
// @Produce		json
// @Param			regionGroupId	path		string	true	"regionGroupId"
// @Param			provider		query		string	false	"provider"
// @Param			regionGroupName	query		string	false	"regionGroupName"
// @Param			regionId		query		string	false	"regionId"
// @Success		200				{string}	string	"{"message":"success","status":respStatus.StatusCode,"regionGroup":regionGroup,}"
// @Failure		500				{string}	string	"{'error':'err.Error()','status':'500'}"
// @Router			/api/adminconfig/regiongroup/{regionGroupId} [get]
func (a actions) GetRegionGroup(c buffalo.Context) error {

	regionGroupId := c.Param("regionGroupId")
	providerId := c.Params().Get("provider") //id
	//regionGroupId := c.Params().Get("regionGroupId")
	regionGroupName := c.Params().Get("regionGroupName") //name
	regionId := c.Params().Get("regionId")

	paramRegionGroup := models.RegionGroup{}
	if regionGroupId != "" {
		id, err := uuid.FromString(regionGroupId)
		if err != nil {
			log.Println("regionGroupId ", regionGroupId)
			log.Println("uuid ", err)
			return c.Render(500, r.JSON(map[string]interface{}{
				"error":  err.Error(),
				"status": 500,
			}))
		}
		paramRegionGroup.ID = id
	}
	paramRegionGroup.ProviderID = providerId
	paramRegionGroup.RegionGroupName = regionGroupName
	if regionId != "" {
		rid, err := uuid.FromString(regionId)
		if err != nil {
			log.Println("regionId ", regionId)
			log.Println("uuid ", err)
			return c.Render(500, r.JSON(map[string]interface{}{
				"error":  err.Error(),
				"status": 500,
			}))
		}
		paramRegionGroup.RegionID = rid
	}

	regionGroup, respStatus := handler.GetRegionGroup(paramRegionGroup)
	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		log.Println("GetRegionGroup err ", respStatus)
		return c.Render(respStatus.StatusCode, r.JSON(map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		}))
	}
	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":     "success",
		"status":      respStatus.StatusCode,
		"regionGroup": regionGroup,
	}))
}

// @Summary		Region Group 등록
// @Description	[RegRegionGroup] 리전 그룹을 등록합니다.
// @Tags			adminconfig
// @Accept			json
// @Produce		json
// @Param			regionGroup	body		models.RegionGroup	true	"models.RegionGroup"
// @Success		200			{string}	string				"{'message': 'success', 'status': respStatus.StatusCode}"
// @Failure		500			{string}	string				"{'error':'respStatus.Message','status':respStatus.StatusCode}"
// @Router			/api/adminconfig/regiongroup/ [post]
func (a actions) RegRegionGroup(c buffalo.Context) error {

	regionGroup := &models.RegionGroup{}
	if err := c.Bind(regionGroup); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(err))
	}

	resultRegionGroup, respStatus := handler.SaveRegionGroup(regionGroup, c)
	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		}))
	}
	log.Println("reg regionGroup ", resultRegionGroup)

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message": "success",
		"status":  respStatus.StatusCode,
	}))
}

// @Summary		Region Group 삭제
// @Description	[DelRegionGroup] 리전 그룹을 삭제합니다.
// @Tags			adminconfig
// @Accept			json
// @Produce		json
// @Param			regionGroup	body		models.RegionGroup	true	"models.RegionGroup"
// @Success		200			{string}	string				"{'message': 'success', 'status': respStatus.StatusCode}"
// @Failure		500			{string}	string				"{'error':'respStatus.Message','status':respStatus.StatusCode}"
// @Router			/api/adminconfig/regiongroup/ [delete]
func (a actions) DelRegionGroup(c buffalo.Context) error {

	regionGroup := &models.RegionGroup{}
	if err := c.Bind(regionGroup); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(err))
	}

	resultRegionGroup, respStatus := handler.DeleteRegionGroup(regionGroup, c)
	if respStatus.StatusCode != 200 && respStatus.StatusCode != 201 {
		return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
			"error":  respStatus.Message,
			"status": respStatus.StatusCode,
		}))
	}
	log.Println("reg regionGroup ", resultRegionGroup)

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message": "success",
		"status":  respStatus.StatusCode,
	}))
}

// TODO: 현재 에러 return format 이 swagger 와 일치하지 않기 때문에 return 형식 변경 필요
// @Summary		Category 등록
// @Description	[CategoryReg] 카테고리를 등록합니다.
// @Tags			adminconfig
// @Accept			json
// @Produce		json
// @Param			Category	body		models.MenuCategory	true	"models.MenuCategory"
// @Success		200			{string}	string			"{'message': 'success', 'status': 200}"
// @Router			/api/adminconfig/category/ [post]
func (a actions) CategoryReg(c buffalo.Context) error {
	category := &models.MenuCategory{}
	if err := c.Bind(category); err != nil {
		return errors.WithStack(err)
	}

	tx := c.Value("tx").(*pop.Connection)
	err := tx.Save(category)

	if err != nil {
		return errors.WithStack(err)
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message": "success",
		"status":  "200",
	}))
}

// TODO: 현재 에러 return format 이 swagger 와 일치하지 않기 때문에 return 형식 변경 필요
// @Summary		Category 삭제
// @Description	[CategoryDel] 카테고리를 삭제합니다.
// @Tags			adminconfig
// @Accept			json
// @Produce		json
// @Param			Category	body		models.MenuCategory	true	"models.MenuCategory"
// @Success		200			{string}	string			"{'message': 'success', 'status': 200}"
// @Router			/api/adminconfig/category/ [delete]
func (a actions) CategoryDel(c buffalo.Context) error {
	category := &models.MenuCategory{}
	if err := c.Bind(category); err != nil {
		return errors.WithStack(err)
	}

	tx := c.Value("tx").(*pop.Connection)
	err := tx.Destroy(category)

	if err != nil {
		return errors.WithStack(err)
	}
	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message": "success",
		"status":  "200",
	}))
}

// TODO: 현재 에러 return format 이 swagger 와 일치하지 않기 때문에 return 형식 변경 필요
// @Summary		Category 리스트 조회
// @Description	[CategoryList] categoryName을 받아 categoryList를 반환합니다.
// @Tags			adminconfig
// @Produce		json
// @Param			categoryName	query		string	true	"categoryName"
// @Success		200				{string}	string	"{"message":"success","status":respStatus.StatusCode,"regionGroup":categoryList,}"
// @Failure		400				{string}	string	"{'error':'respStatus.Message','error':'respStatus.Message'}"
// @Security		CSRFTokenHeader
// @Router			/api/adminconfig/category/ [get]
func (a actions) CategoryList(c buffalo.Context) error {
	categoryList := []models.MenuCategory{}

	categoryName := c.Params().Get("categoryName")
	query := models.DB.Q()

	if categoryName != "" {
		query = query.Where("category_name = ?", categoryName)
	}
	err := query.All(&categoryList)
	if err != nil {
		log.Println("categoryList err", err)
		return errors.WithStack(err)
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":      "success",
		"status":       "200",
		"categoryList": categoryList,
	}))
}

// TODO: 현재 에러 return format 이 swagger 와 일치하지 않기 때문에 return 형식 변경 필요
// @Summary		Category 단건 조회
// @Description	[CategoryGet] categoryName을 받아 category 단건을 반환합니다.
// @Tags			adminconfig
// @Produce		json
// @Param			categoryName	query		string	true	"categoryName"
// @Success		200				{string}	string	"{'message':'success','status':'200','category':'category',}"
// @Failure		400				{string}	string	"{'error':'errors.WithStack(err)'}"
// @Security		CSRFTokenHeader
// @Router			/api/adminconfig/category/id/{categoryName}/ [get]
func (a actions) CategoryGet(c buffalo.Context) error {
	category := models.MenuCategory{}

	categoryName := c.Params().Get("categoryName")
	query := models.DB.Q()

	query = query.Where("category_name = ?", categoryName)

	err := query.First(&category)
	if err != nil {
		log.Println("category err", err)
		return errors.WithStack(err)
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":  "success",
		"status":   "200",
		"category": category,
	}))
}

// TODO: 현재 에러 return format 이 swagger 와 일치하지 않기 때문에 return 형식 변경 필요
// @Summary		Menu 등록
// @Description	[RegMenu] models.Menu를 받아 메뉴를 단건 등록합니다.
// @Tags			adminconfig
// @Produce		json
// @Param			menu	body		models.Menu	true	"models.Menu"
// @Success		200		{string}	string		"{'message':'success','status':'200'}"
// @Failure		400		{string}	string		"{'error':'errors.WithStack(err)'}"
// @Router			/api/adminconfig/menu/ [post]
func (a actions) RegMenu(c buffalo.Context) error {
	menu := &models.Menu{}
	if err := c.Bind(menu); err != nil {
		return errors.WithStack(err)
	}

	tx := c.Value("tx").(*pop.Connection)
	err := tx.Create(menu)

	if err != nil {
		return errors.WithStack(err)
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message": "success",
		"status":  "200",
	}))
}

// TODO: 현재 에러 return format 이 swagger 와 일치하지 않기 때문에 return 형식 변경 필요
// @Summary		Menu 업데이트
// @Description	[UpdateMenu] models.Menu를 받아 메뉴를 단건 업데이트합니다.
// @Tags			adminconfig
// @Produce		json
// @Param			menu	body		models.Menu	true	"models.Menu"
// @Success		200		{string}	string		"{'message':'success','status':'200'}"
// @Failure		400		{string}	string		"{'error':'errors.WithStack(err)'}"
// @Router			/api/adminconfig/menu/ [put]
func (a actions) UpdateMenu(c buffalo.Context) error {
	menu := &models.Menu{}
	if err := c.Bind(menu); err != nil {
		return errors.WithStack(err)
	}

	tx := c.Value("tx").(*pop.Connection)
	err := tx.Update(menu)

	if err != nil {
		return errors.WithStack(err)
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message": "success",
		"status":  "200",
	}))
}

// TODO: 현재 에러 return format 이 swagger 와 일치하지 않기 때문에 return 형식 변경 필요
// @Summary		Menu 삭제
// @Description	[DelMenu] models.Menu를 받아 메뉴를 단건 삭제합니다.
// @Tags			adminconfig
// @Produce		json
// @Param			menu	body		models.Menu	true	"models.Menu"
// @Success		200		{string}	string		"{'message':'success','status':'200'}"
// @Failure		400		{string}	string		"{'error':'errors.WithStack(err)'}"
// @Router			/api/adminconfig/menu/ [delete]
func (a actions) DelMenu(c buffalo.Context) error {
	menu := &models.Menu{}
	if err := c.Bind(menu); err != nil {
		return errors.WithStack(err)
	}

	tx := c.Value("tx").(*pop.Connection)
	err := tx.Destroy(menu)

	if err != nil {
		return errors.WithStack(err)
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message": "success",
		"status":  "200",
	}))
}

// TODO: 현재 에러 return format 이 swagger 와 일치하지 않기 때문에 return 형식 변경 필요
// @Summary		Menu 리스트 조회
// @Description	[MenuList] menuId, menuName, menuAlias, categoryId 중 순서로 마지막 한개를 받아 메뉴 리스트를 반환합니다.
// @Tags			adminconfig
// @Produce		json
// @Param			menuId		query		string	false	"menuId"
// @Param			menuName	query		string	false	"menuName"
// @Param			menuAlias	query		string	false	"menuAlias"
// @Param			categoryId	query		string	false	"categoryId"
// @Success		200			{string}	string	"{'message':'success','status':'200', 'menuList': 'menuList'}"
// @Failure		400			{string}	string	"{'error':'errors.WithStack(err)'}"
// @Router			/api/adminconfig/menu/ [get]
func (a actions) MenuList(c buffalo.Context) error {
	menuList := []models.Menu{}

	menuId := c.Params().Get("menuId")
	menuName := c.Params().Get("menuName")
	menuAlias := c.Params().Get("menuAlias")
	categoryId := c.Params().Get("categoryId")

	query := models.DB.Q()

	if menuId != "" {
		query = query.Where("id = ?", menuId)
	}
	if menuName != "" {
		query = query.Where("name = ?", menuName)
	}
	if menuAlias != "" {
		query = query.Where("alias = ?", menuAlias)
	}
	if categoryId != "" {
		query = query.Where("category_id = ?", categoryId)
	}

	err := query.All(&menuList)
	if err != nil {
		log.Println("categoryList err", err)
		return errors.WithStack(err)
	}
	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":  "success",
		"status":   "200",
		"menuList": menuList,
	}))
}

// TODO: 현재 에러 return format 이 swagger 와 일치하지 않기 때문에 return 형식 변경 필요
// @Summary		Menu 조회
// @Description	[GetMenu] menuId와 menuName, menuAlias, categoryId 중 순서로 마지막 한개를 받아 메뉴를 반환합니다.
// @Tags			adminconfig
// @Produce		json
// @Param			menuId		path		string	true	"menuId"
// @Param			menuName	query		string	false	"menuName"
// @Param			menuAlias	query		string	false	"menuAlias"
// @Param			categoryId	query		string	false	"categoryId"
// @Success		200			{string}	string	"{'message':'success','status':'200', 'menu': 'menu'}"
// @Failure		400			{string}	string	"{'error':'errors.WithStack(err)'}"
// @Router			/api/adminconfig/menu/id/{menuId}/ [get]
func (a actions) GetMenu(c buffalo.Context) error {
	menu := models.Menu{}

	menuId := c.Param("menuId")
	menuName := c.Params().Get("menuName")
	menuAlias := c.Params().Get("menuAlias")
	categoryId := c.Params().Get("categoryId")
	query := models.DB.Q()
	query = query.Where("id = ?", menuId)

	if menuName != "" {
		query = query.Where("menu_name = ?", menuName)
	}
	if menuAlias != "" {
		query = query.Where("alias = ?", menuAlias)
	}
	if categoryId != "" {
		query = query.Where("category_id = ?", categoryId)
	}

	err := query.First(&menu)
	if err != nil {
		log.Println("menu err", err)
		return errors.WithStack(err)
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message": "success",
		"status":  "200",
		"menu":    menu,
	}))
}

// @Summary		Menu Tree 조회
// @Description	[MenuTree] category, menu구조를 tree형태로 쿼리하여 반환합니다.
// @Tags			adminconfig
// @Produce		json
// @Success		200	{string}	string	"{'message':'success','status':'200', 'menutree': 'menutree'}"
// @Failure		400	{string}	string	"{'error':'errors.WithStack(err)'}"
// @Router			/api/adminconfig/menu/tree/ [get]
func (a actions) MenuTree(c buffalo.Context) error {

	menutree, respStatus := handler.MenuTree()
	if respStatus.StatusCode == 500 {
		return c.Render(http.StatusOK, r.JSON(respStatus))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":  "success",
		"status":   "200",
		"menutree": menutree,
	}))
}

// @Summary		Api test mngform : todo : 삭제
// @Description	[ApiTestForm] ApiTest를 렌더링 합니다.
// @Tags			debug
// @Produce		html
// @Success		200	{html}	html	"adminconfig/apitest/mngform.html"
// @Router			/test/apitest/mngform/ [get]
func (a actions) ApiTestForm(c buffalo.Context) error {
	routerList := models.RouteInfoes{}
	query := models.DB.Q()
	err := query.All(&routerList)
	if err != nil {
		log.Println("query err ", err)
	}
	var routerAppend []string
	for _, router := range routerList {
		routerAppend = append(routerAppend, router.Path, ",")
	}

	c.Set("routerList", routerAppend)

	return c.Render(http.StatusOK, r.HTML("adminconfig/apitest/mngform.html"))
}

// @Summary		Api Search swagger : todo : 삭제
// @Description	[ApiSearch] Api 핸들러를 찾아 Swagger 로 이동합니다.
// @Tags			debug
// @Produce		html
// @Success		200	{html}	html	"redirect"
// @Router			/api/test/apitest/searchapi/ [post]
func (a actions) ApiSearch(c buffalo.Context) error {

	route := &models.RouteInfo{}

	if err := c.Bind(route); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(err))
	}

	resultroute := models.RouteInfo{}
	query := models.DB.Q()
	query = query.Where("path = ?", route.Path)
	err := query.First(&resultroute)

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"status":       err,
		"Method":       resultroute.Method,
		"Path":         resultroute.Path,
		"ResourceName": resultroute.ResourceName,
	}))
}
