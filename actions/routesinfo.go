package actions

import (
	"log"
	"mc_web_console/models"
	"net/http"
	"reflect"

	"github.com/gobuffalo/buffalo"
)

// handler 전달을 위한 구조체
// router에 등록할 function 은 ( a action )을 붙여야 함.
// type actions struct{ buffalo.Context }
type actions struct{}

//

// @Summary		RoutesManager
// @Description	관리자 설정 및 라우터 설정
// @Tags
// @Accept json
// @Param      routerList 	bady  models.RouteInfoes  true   "RouteInfoes.routerList"
// @Produce json
// @Success
// @Failure
// @Router
func RoutesManager() {
	//func RoutesManager(app *buffalo.App) *buffalo.App {

	// TODO : DB에서 path와 handler를 가져오도록
	// 1. handler 구현한 뒤에 화면을 통해 db에 등록하는 process를 가져가도록
	// 2. 화면이 있으면 xxxform, json의 경우에는 /api/xxx 로 경로명 지정
	// ex ) "/api/<카테고리대분류>/<리소스>/<정의>" / "/<카테고리대분류>/<리소스>/mngform/"

	// ID           uuid.UUID `json:"id" db:"id"`
	// Method       string    `json:"method" db:"method"`
	// Path         string    `json:"path" db:"path"`
	// HandlerName  string    `json:"handler_name" db:"handler_name"`
	// ResourceName string    `json:"resource_name" db:"resource_name"`
	// PathName     string    `json:"path_name" db:"path_name"`
	// Aliases      string    `json:"aliases" db:"aliases"`
	// CreatedAt    time.Time `json:"created_at" db:"created_at"`
	// UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`

	// routerList := []models.RouteInfo{
	// 	{Path: "/home1", HandlerName: "GetHome", Method: "GET"},
	// 	{Path: "/about1", HandlerName: "AboutHandler", Method: "GET"},
	// 	{Path: "/settings/resources/vpc/mngform", HandlerName: "VpcMngForm", Method: "GET"},

	// 	{Path: "/settings/resources/vpc/", HandlerName: "vpcList", Method: "GET"},
	// 	{Path: "/settings/resources/vpc/", HandlerName: "vpcReg", Method: "POST"},
	// 	{Path: "/settings/resources/vpc/id/{vNetId}", HandlerName: "vpcGet", Method: "GET"},
	// 	{Path: "/settings/resources/vpc/id/{vNetId}", HandlerName: "vpcDel", Method: "DELETE"},
	// 	{Path: "/settings/resources/vpc/region", HandlerName: "vpcListByRegion", Method: "DELETE"},
	// }

	routerList := models.RouteInfoes{}

	//err := models.DB.Find(&resultCredential, credential.ID)
	//if err != nil {
	//	return resultCredential, errors.WithStack(err)
	//}

	query := models.DB.Q()
	err := query.All(&routerList)
	if err != nil {
		log.Println("query err ", err)
		return
		//return app
	}

	//for _, router := range routerList {
	//	switch router.Method {
	//	case "GET":
	// app.GET(route.Path, GetHandler).Name(router.HandlerName)
	//	case "POST":
	// app.POST(route.Path, PostHandler).Name(router.HandlerName)
	//	}
	//}

	//routers := c.Value("router").(*buffalo.App).Router()
	log.Println("routers")
	//log.Println(routers)
	actionsType := reflect.TypeOf(app)
	log.Println(actionsType)

	for _, router := range routerList {
		//log.Println(router)
		// handlerFunction은 (a actions) function명 으로 정의 해야 함.
		handlerFunc := getHandlerFuncByName(router.HandlerName)
		if handlerFunc == nil {
			log.Println(router.HandlerName + " Handler not found")
			log.Println(router)
			continue
		}
		//log.Println(router)
		log.Println(router.Path + "   :   " + router.PathName + " : " + router.Method)
		//log.Println(handlerFunc)
		// 라우터 등록

		switch router.Method {
		case "GET":
			app.GET(router.Path, handlerFunc).Name(router.PathName)
		case "POST":
			app.POST(router.Path, handlerFunc).Name(router.PathName)
		case "PUT":
			app.PUT(router.Path, handlerFunc).Name(router.PathName)
		case "PATCH":
			app.PATCH(router.Path, handlerFunc).Name(router.PathName)
		case "HEAD":
			app.HEAD(router.Path, handlerFunc).Name(router.PathName)
		case "OPTIONS":
			app.OPTIONS(router.Path, handlerFunc).Name(router.PathName)
		case "DELETE":
			app.DELETE(router.Path, handlerFunc).Name(router.PathName)
		default:
			log.Println(" any begin~~~~~~~~~~~~~~~~~~~~~~~")
			log.Println(router)
			log.Println(" any end ~~~~~~~~~~~~~~~~~~~~~~~")
			app.ANY(router.Path, handlerFunc)
		}

	}

	app.GET("/api/auth/user/", getHandlerFuncByName("UserInfo")).Name("UserInfo")
	app.POST("/api/auth/user/workspace/", getHandlerFuncByName("SetCurrentWorkspace")).Name("SetCurrentWorkspace")
	//app.GET("/api/auth/user/namespace/", getHandlerFuncByName("SetCurrentNamespace")).Name("SetCurrentNamespace")

	// 임시로 workspace, role route 추가 : db로 변경 후 삭제할 것
	// workspace
	app.GET("/api/workspace/", getHandlerFuncByName("WorkspaceList")).Name("WorkspaceList")
	app.GET("/api/workspace/id/{workspaceId}", getHandlerFuncByName("GetWorkspace")).Name("GetWorkspace")
	app.GET("/api/workspace/user/", getHandlerFuncByName("WorkspaceListByUser")).Name("WorkspaceListByUser") // 세션에 있는 유저정보사용

	// project
	app.GET("/api/project/", getHandlerFuncByName("ProjectList")).Name("ProjectList")
	app.GET("/api/project/id/{roleId}", getHandlerFuncByName("GetProject")).Name("GetProject")
	app.PUT("/api/project/id/{roleId}", getHandlerFuncByName("UpdateProject")).Name("UpdateProject")
	app.POST("/api/project/", getHandlerFuncByName("RegProject")).Name("RegProject")
	app.DELETE("/api/project/id/{roleId}", getHandlerFuncByName("DeleteProject")).Name("DeleteProject")

	// role
	app.GET("/api/role/", getHandlerFuncByName("MCIamRoleList")).Name("MCIamRoleList")
	app.GET("/api/role/id/{roleId}", getHandlerFuncByName("GetMCIamRole")).Name("GetMCIamRole")
	app.PUT("/api/role/id/{roleId}", getHandlerFuncByName("UpdateMCIamRole")).Name("UpdateMCIamRole")
	app.POST("/api/role/", getHandlerFuncByName("RegMCIamRole")).Name("RegMCIamRole")
	app.DELETE("/api/role/id/{roleId}", getHandlerFuncByName("DeleteMCIamRole")).Name("DeleteMCIamRole")

	// workspace, user, project mapping
	app.POST("/api/mapping/ws_user", getHandlerFuncByName("RegUserMCIamRoleMapping")).Name("RegUserMCIamRoleMapping")
	app.POST("/api/mapping/ws_user_role", getHandlerFuncByName("RegWorkspaceUserMCIamRoleMapping")).Name("RegWorkspaceUserMCIamRoleMapping")
	app.POST("/api/mapping/ws_project", getHandlerFuncByName("RegWorkspaceProjectMapping")).Name("RegWorkspaceProjectMapping")
	app.GET("/api/mapping/ws/id/{workspaceId}/project", getHandlerFuncByName("WorkspaceProjectList")).Name("WorkspaceProjectList")
	app.DELETE("/api/mapping/ws/id/{workspaceId}/project/id/{projectId}", getHandlerFuncByName("DeleteWorkspaceProjectMapping")).Name("DeleteWorkspaceProjectMapping")

	app.GET("/getget/", GetGet)

	// return app
}

// @Summary		getHandlerFuncByName
// @Description	이름으로 핸들러 함수를 가져온다
// @Tags
// @Accept
// @Produce json
// @Success
// @Failure
// @Router

func getHandlerFuncByName(handlerName string) buffalo.Handler {
	actions := &actions{}
	actionsType := reflect.TypeOf(actions)

	// 핸들러 함수 이름으로 메서드 가져오기
	method, ok := actionsType.MethodByName(handlerName)
	if !ok {
		// 핸들러 함수를 찾을 수 없는 경우에 대한 처리
		// 예: log.Fatal("Handler not found")
		return nil
	}

	// 핸들러 함수를 호출할 수 있는 함수 생성
	handlerFunc := func(c buffalo.Context) error {
		// 빈 c 값을 set.
		c.Set("current_user", "h")
		c.Set("current_user_id", "hhh")
		c.Set("current_user_level", "hhh")
		c.Set("current_workspace", "hhh")
		c.Set("current_workspace_id", "hhh")
		c.Set("current_namespace", "hh")
		c.Set("current_namespace_id", "hhh")
		c.Set("assigned_ws_list", []interface{}{})
		c.Set("assigned_ns_list", []interface{}{})
		// 새로운 인스턴스 생성
		act := reflect.New(actionsType.Elem()).Interface()

		// 핸들러 함수 호출
		//return method.Func.Call([]reflect.Value{
		//	reflect.ValueOf(act),
		//	reflect.ValueOf(c),
		//})[0].Interface().(error)
		// 핸들러 함수 호출
		result := method.Func.Call([]reflect.Value{
			reflect.ValueOf(act),
			reflect.ValueOf(c),
		})

		log.Println("handlerFunc result ", result)
		if errVal := result[0]; !errVal.IsNil() {
			// Convert the error value to the error type
			err := errVal.Interface().(error)
			return err
		}
		return nil
	}

	//return handlerFunc
	return buffalo.Handler(handlerFunc)

	// // Get the method by name from the actions package
	// handlerMethod, found := reflect.TypeOf(actions{}).MethodByName(handlerName)
	// if !found {
	// 	log.Println("getHandlerFuncByName !found ", handlerName)
	// 	return nil
	// }

	// // Create a closure to execute the handler function
	// handlerFunc := func(c buffalo.Context) error {
	// 	// Instantiate the actions struct
	// 	act := actions{c}
	// 	// Call the handler method with the actions struct and context
	// 	return handlerMethod.Func.Call([]reflect.Value{reflect.ValueOf(act), reflect.ValueOf(c)})[0].Interface().(error)
	// }

	// return handlerFunc

	// handlerMethod := reflect.ValueOf(&actions{}).MethodByName(handlerName)
	// if !handlerMethod.IsValid() {
	// 	// Handler not found, handle the error
	// }

	// // Create and return the actual handler function
	// return func(c buffalo.Context) error {
	// 	// Instantiate the actions struct
	// 	act := &actions{}
	// 	// Invoke the handler function
	// 	return handlerMethod.Call([]reflect.Value{reflect.ValueOf(act), reflect.ValueOf(c)})[0].Interface().(error)
	// }

	//////////////
	// actionsType := reflect.TypeOf(actions{})
	// handlerMethod, ok := actionsType.MethodByName(handlerName)
	// if !ok {
	// 	log.Println("actionsType.MethodByName ", ok)
	// 	// Handler not found, handle the error
	// }

	// // Create and return the actual handler function
	// return func(c buffalo.Context) error {
	// 	// Instantiate the actions struct
	// 	act := reflect.New(actionsType).Interface()
	// 	log.Println("getHandlerFuncByName reflect.New ", act)
	// 	//log.Println("reflect.Value{reflect.ValueOf(act), reflect.ValueOf(c)}", reflect.Value{reflect.ValueOf(act), reflect.ValueOf(c)})
	// 	// Invoke the handler function
	// 	return handlerMethod.Func.Call([]reflect.Value{reflect.ValueOf(act), reflect.ValueOf(c)})[0].Interface().(error)
	// }
}

// 삭제 예정
func (a actions) GetHome(c buffalo.Context) error {
	log.Println("action GetHome")
	//return GetHome(c)
	return c.Render(200, r.String("Hello from GetHome"))
}

//func GetHome(c buffalo.Context) error {
//	log.Println("render GetHome")
//	return c.Render(200, r.String("Hello from GetHome"))
//}

// @Summary		AboutHandler
// @Description  사용안하는듯해 보임 호출하는곳이 주석처리되어있음
// @Tags
// @Accept 	 json
// @Produce  json
// @Success   200	{string}	string	"{'message':'success','status':'200' 'VnetInfo': 'aaa'}"
// @Failure
// @Router
func (a actions) AboutHandler(c buffalo.Context) error {
	//return c.Render(200, r.String("Hello from AboutHandler"))
	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"message":  "success",
		"status":   200,
		"VNetInfo": "aaa",
	}))
}
