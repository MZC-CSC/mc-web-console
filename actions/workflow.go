package actions

import (
	"encoding/gob"

	//"time"

	"github.com/gobuffalo/buffalo"

	middleware "mc_web_console/actions/middleware"
)

//func init() {
//	gob.Register(map[string]string{})
//}

func init() {
	gob.Register(middleware.UserSession{})
}

// Workflow Edito form
func WorkflowEditorForm(c buffalo.Context) error {
	return c.Render(200, r.HTML("operations/workflow/workflow_editor.html"))
}
