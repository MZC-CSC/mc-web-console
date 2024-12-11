package handler

import (
	"fmt"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/m-cmp/mc-web-console/common"
)

type GetWorkspaceUserRoleMappingListResponse struct {
	Role                    Role                    `json:"role"`
	WorkspaceProjectMapping WorkspaceProjectMapping `json:"workspaceProject"`
}

type Role struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type WorkspaceProjectMapping struct {
	Workspace Workspace `json:"workspace"`
	Projects  Projects  `json:"projects"`
}

type Workspace struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Project struct {
	ID          string `json:"id"`
	NsID        string `json:"ns_id"`
	Name        string `json:"name"`
	Description string `json:"description" `
}

type Projects []Project

var DefaultWorkspace = Workspace{
	ID:          "ws01",
	Name:        "ws01",
	Description: "this is only workspace for default workspace",
}

// /ns
func PostNs(c echo.Context, commonRequest *common.CommonRequest) (*Project, error) {
	operationId := strings.ToLower("PostNs")
	commonResponse, err := common.AnyCaller(c, operationId, commonRequest, true)
	if err != nil {
		return nil, err
	}
	nsAseert := commonResponse.ResponseData.(map[string]interface{})
	project := Project{
		ID:          nsAseert["id"].(string),
		NsID:        nsAseert["id"].(string),
		Name:        nsAseert["name"].(string),
		Description: nsAseert["description"].(string),
	}
	return &project, nil
}

// /ns
func GetAllNs(c echo.Context) (*Projects, error) {

	operationId := strings.ToLower("GetAllNs")
	commonResponse, err := common.AnyCaller(c, operationId, &common.CommonRequest{}, true)
	if err != nil {
		return nil, err
	}

	var projects Projects
	for _, ns := range commonResponse.ResponseData.(map[string]interface{})["ns"].([]interface{}) {
		nsAseert := ns.(map[string]interface{})
		project := Project{
			ID:          nsAseert["id"].(string),
			NsID:        nsAseert["id"].(string),
			Name:        nsAseert["name"].(string),
			Description: nsAseert["description"].(string),
		}
		projects = append(projects, project)
	}

	return &projects, nil
}

// /ns/{nsId}
func GetNs(c echo.Context, commonRequest *common.CommonRequest) (*Project, error) {

	operationId := strings.ToLower("GetNs")
	commonResponse, err := common.AnyCaller(c, operationId, commonRequest, true)
	if err != nil {
		return nil, err
	}

	nsAseert := commonResponse.ResponseData.(map[string]interface{})
	project := Project{
		ID:          nsAseert["id"].(string),
		NsID:        nsAseert["id"].(string),
		Name:        nsAseert["name"].(string),
		Description: nsAseert["description"].(string),
	}

	return &project, nil
}

// /ns/{nsId}
func DelNs(c echo.Context, commonRequest *common.CommonRequest) error {
	operationId := strings.ToLower("DelNs")
	commonResponse, err := common.AnyCaller(c, operationId, commonRequest, true)
	if err != nil {
		return err
	}
	if commonResponse.Status.StatusCode != 200 {
		return fmt.Errorf("job finsh with code %d", commonResponse.Status.StatusCode)
	}
	return nil
}

// /ns/{nsId}
func PutNs(c echo.Context, commonRequest *common.CommonRequest) (*Project, error) {
	operationId := strings.ToLower("PutNs")
	commonResponse, err := common.AnyCaller(c, operationId, commonRequest, true)
	if err != nil {
		return nil, err
	}
	nsAseert := commonResponse.ResponseData.(map[string]interface{})
	project := Project{
		ID:          nsAseert["id"].(string),
		NsID:        nsAseert["id"].(string),
		Name:        nsAseert["name"].(string),
		Description: nsAseert["description"].(string),
	}
	return &project, nil
}

func GetWorkspaceUserRoleMappingList(c echo.Context) (*GetWorkspaceUserRoleMappingListResponse, error) {
	projects, err := GetAllNs(c)
	if err != nil {
		return nil, err
	}
	result := &GetWorkspaceUserRoleMappingListResponse{
		Role: Role{
			Name:        c.Get("Role").(string),
			Description: "this is default role.",
		},
		WorkspaceProjectMapping: WorkspaceProjectMapping{
			Workspace: DefaultWorkspace,
			Projects:  *projects,
		},
	}
	return result, nil
}

func GetWPmappingList(c echo.Context) (*WorkspaceProjectMapping, error) {
	projects, err := GetAllNs(c)
	if err != nil {
		return nil, err
	}
	result := &WorkspaceProjectMapping{
		Workspace: DefaultWorkspace,
		Projects:  *projects,
	}
	return result, nil
}
