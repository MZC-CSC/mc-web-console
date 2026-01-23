package self

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"mc_web_console_api/handler"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gobuffalo/buffalo"
	"github.com/spf13/viper"
	"gopkg.in/yaml.v2"
)

func init() {
	MCIAM_USE, _ := strconv.ParseBool(os.Getenv("MCIAM_USE"))
	if !MCIAM_USE {
		err := createMenuResource()
		if err != nil {
			log.Fatal("create menu fail : ", err.Error())
		}
		log.Println("Self Menu init success")
	}
}

type Menu struct {
	Id           string `json:"id"` // for routing
	ParentMenuId string `json:"parentMenuId"`
	DisplayName  string `json:"displayName"` // for display
	IsAction     string `json:"isAction"`    // maybe need type assertion..?
	Priority     string `json:"priority"`
	MenuNumber   string `json:"menunumber"`
	Menus        Menus  `json:"menus"`
}

type Menus []Menu

var CmigMenuTree Menu

func buildMenuTree(menus Menus, parentID string) Menus {
	var tree Menus

	for _, menu := range menus {
		if menu.ParentMenuId == parentID {
			menu.Menus = buildMenuTree(menus, menu.Id)
			tree = append(tree, menu)
		}
	}

	return tree
}

func createMenuResource() error {
	yamlFile := "../conf/selfiammenu.yaml"

	data, err := os.ReadFile(yamlFile)
	if err != nil {
		return err
	}

	var cmigMenus Menu
	err = yaml.Unmarshal(data, &cmigMenus)
	if err != nil {
		return err
	}

	CmigMenuTree.Menus = buildMenuTree(cmigMenus.Menus, "")
	return nil
}

func GetMenuTree(menuList Menus) (*Menus, error) {
	menuTree := buildMenuTree(menuList, "home")
	return &menuTree, nil
}

func GetAllMCIAMAvailableMenus(c buffalo.Context) (*Menus, error) {
	commonResponse, err := handler.AnyCaller(c, "listUserMenu", &handler.CommonRequest{
		PathParams: map[string]string{
			"framework": "mc-web-console",
		},
	}, true)
	if err != nil {
		log.Println("GetAllMCIAMAvailableMenus error : ", err)
		return &Menus{}, err
	}
	log.Println("GetAllMCIAMAvailableMenus commonResponse : ", commonResponse)
	if commonResponse.Status.StatusCode != 200 {
		return &Menus{}, fmt.Errorf(commonResponse.Status.Message)
	}

	// ResponseData가 배열인지 확인
	menuListResp, ok := commonResponse.ResponseData.([]interface{})
	if !ok {
		log.Printf("GetAllMCIAMAvailableMenus: ResponseData is not []interface{}, got %T: %v", commonResponse.ResponseData, commonResponse.ResponseData)
		// ResponseData가 배열이 아닌 경우, 빈 배열로 처리
		return &Menus{}, nil
	}

	if len(menuListResp) == 0 {
		log.Println("GetAllMCIAMAvailableMenus: Empty menu list")
		return &Menus{}, nil
	}

	menuList := &Menu{}
	for _, menuResp := range menuListResp {
		menuMap, ok := menuResp.(map[string]interface{})
		if !ok {
			log.Printf("GetAllMCIAMAvailableMenus: Menu item is not map[string]interface{}, got %T: %v", menuResp, menuResp)
			continue
		}
		menu := &Menu{
			Id:           getString(menuMap, "id"),
			DisplayName:  getString(menuMap, "displayName"), // API 응답은 camelCase
			ParentMenuId: getString(menuMap, "parentId"),   // API 응답은 camelCase
			Priority:     getString(menuMap, "priority"),
			MenuNumber:   getString(menuMap, "menuNumber"), // API 응답은 camelCase
			IsAction:     getString(menuMap, "isAction"),   // API 응답은 camelCase
		}
		menuList.Menus = append(menuList.Menus, *menu)
	}

	log.Printf("GetAllMCIAMAvailableMenus: Successfully parsed %d menus", len(menuList.Menus))
	return &menuList.Menus, nil
}

// Helper function to safely get string values from map
func getString(m map[string]interface{}, key string) string {
	if val, ok := m[key]; ok {
		switch v := val.(type) {
		case string:
			return v
		case float64:
			return fmt.Sprintf("%d", int(v))
		case bool:
			return fmt.Sprintf("%v", v)
		}
	}
	return ""
}

func CreateMCIAMMenusByLocalMenuYaml(c buffalo.Context) error {

	yamlFile := "./conf/menu.yaml"

	file, err := os.Open(yamlFile)
	if err != nil {
		return err
	}
	defer file.Close()

	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	part, err := writer.CreateFormFile("yaml", "menu.yaml")
	if err != nil {
		return err
	}
	_, err = io.Copy(part, file)
	if err != nil {
		return err
	}
	err = writer.Close()
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", getCreateWebMenuByYamlEndpoint(), &requestBody)
	if err != nil {
		fmt.Printf("Error creating POST request: %s\n", err)
		return err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Add("Authorization", c.Value("Authorization").(string))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error making POST request: %s\n", err)
		return err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response: %s\n", err)
		return err
	}

	fmt.Println("Response:", string(respBody))

	return nil
}

func getCreateWebMenuByYamlEndpoint() string {
	viper.SetConfigName("api")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./conf")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file, %s", err)
	}
	baseUrl := viper.Get("services.mc-iam-manager.baseurl").(string)
	createwebmenubyyamlUri := viper.Get("serviceActions.mc-iam-manager.Createmenuresourcesbymenuyaml.resourcePath").(string)
	urlModified := strings.ReplaceAll(baseUrl+createwebmenubyyamlUri, "{framework}", "web")
	return urlModified
}
